import Image from "next/image";
import Link from "next/link";
import { access } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";

async function publicFileExists(publicPath) {
  if (!publicPath || !publicPath.startsWith("/")) {
    return false;
  }

  const publicRoot = path.join(process.cwd(), "public");
  const filePath = path.normalize(path.join(publicRoot, publicPath));

  if (!filePath.startsWith(publicRoot)) {
    return false;
  }

  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export default async function AdminRoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
  });

  const roomsWithImages = await Promise.all(
    rooms.map(async (room) => ({
      ...room,
      hasImage: await publicFileExists(room.imagePath),
    }))
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Rooms</h1>
        </div>
        <Link
          href="/admin/rooms/new"
          className="rounded bg-slate-950 px-4 py-2 text-white"
        >
          Create room
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roomsWithImages.map((room) => (
          <Link
            key={room.id}
            href={`/admin/rooms/${room.id}`}
            className="rounded border bg-white p-4 hover:border-slate-400"
          >
            <div className="relative h-40 overflow-hidden rounded bg-slate-100">
              {room.hasImage ? (
                <Image
                  src={room.imagePath}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No image
                </div>
              )}
            </div>
            <h2 className="mt-4 font-bold text-slate-950">{room.name}</h2>
            <p className="text-sm text-slate-600">
              Capacity: {room.capacity}
            </p>
            <p className="text-sm text-slate-600">
              {room.pricePerHour} credits/hr
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}