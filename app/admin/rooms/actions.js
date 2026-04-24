"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function readInteger(formData, key) {
  const rawValue = String(formData.get(key) || "").trim();
  if (!/^-?\d+$/.test(rawValue)) {
    return null;
  }

  const value = Number(rawValue);
  return Number.isSafeInteger(value) ? value : null;
}

async function saveUploadedImage(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("圖片只接受 jpg、png、webp 或 gif。");
  }

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(
    path.join(uploadDir, fileName),
    Buffer.from(await file.arrayBuffer())
  );

  return `/uploads/${fileName}`;
}

async function parseRoomForm(formData, isCreate) {
  const name = String(formData.get("name") || "").trim();
  const capacity = readInteger(formData, "capacity");
  const pricePerHour = readInteger(formData, "pricePerHour");
  const picture = formData.get("picture");

  if (!name) {
    throw new Error("Room name 不可以是空白。");
  }

  if (!capacity || capacity < 2 || capacity > 100) {
    throw new Error("Capacity 必須是 2 至 100。");
  }

  if (pricePerHour === null || pricePerHour < 0) {
    throw new Error("Price 必須是非負整數。");
  }

  if (isCreate && (!picture || picture.size === 0)) {
    throw new Error("建立房間時必須上傳圖片。");
  }

  const imagePath = await saveUploadedImage(picture);
  const serviceOptions = await prisma.serviceOption.findMany({
    orderBy: { name: "asc" },
  });

  const options = serviceOptions.map((option) => {
    const enabled = formData.get(`option-${option.id}-enabled`) === "on";
    const price = readInteger(formData, `option-${option.id}-price`);

    if (price === null || price < 0) {
      throw new Error(`${option.name} price 必須是非負整數。`);
    }

    return { option, enabled, price };
  });

  return { name, capacity, pricePerHour, imagePath, options };
}

export async function createRoomAction(previousState, formData) {
  await requireRole("ADMIN");

  try {
    const data = await parseRoomForm(formData, true);

    await prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        pricePerHour: data.pricePerHour,
        imagePath: data.imagePath,
        options: {
          create: data.options.map((item) => ({
            serviceOptionId: item.option.id,
            enabled: item.enabled,
            price: item.price,
          })),
        },
      },
    });
  } catch (error) {
    return { error: error.message };
  }

  redirect("/admin/rooms");
}

export async function updateRoomAction(roomId, previousState, formData) {
  await requireRole("ADMIN");

  try {
    const data = await parseRoomForm(formData, false);

    await prisma.room.update({
      where: { id: roomId },
      data: {
        name: data.name,
        capacity: data.capacity,
        pricePerHour: data.pricePerHour,
        ...(data.imagePath ? { imagePath: data.imagePath } : {}),
      },
    });

    for (const item of data.options) {
      await prisma.roomOption.upsert({
        where: {
          roomId_serviceOptionId: {
            roomId,
            serviceOptionId: item.option.id,
          },
        },
        update: { enabled: item.enabled, price: item.price },
        create: {
          roomId,
          serviceOptionId: item.option.id,
          enabled: item.enabled,
          price: item.price,
        },
      });
    }
  } catch (error) {
    return { error: error.message };
  }

  redirect("/admin/rooms");
}