import Link from "next/link";
import { prisma } from "@/lib/db";
import { addDays, dateFromInput, toDateInputValue } from "@/lib/date";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;
const HOURS = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR },
  (_, index) => index + OPEN_HOUR
);

export default async function AdminHomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const activeDay = resolvedSearchParams?.day || toDateInputValue();
  const activeDate = dateFromInput(activeDay);

  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
    include: {
      bookings: {
        where: { bookingDate: activeDate },
        orderBy: { startHour: "asc" },
        include: { user: true },
      },
    },
  });

  const bookings = rooms.flatMap((room) => room.bookings);
  const totalCredits = bookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Room Schedule</h1>
          <p className="mt-1 text-slate-600">Active day: {activeDay}</p>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            href={`/admin?day=${addDays(activeDay, -1)}`}
          >
            Previous day
          </Link>
          <Link
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            href={`/admin?day=${addDays(activeDay, 1)}`}
          >
            Next day
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Total bookings</p>
          <p className="text-3xl font-bold text-slate-950">
            {bookings.length}
          </p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Credits spent</p>
          <p className="text-3xl font-bold text-slate-950">{totalCredits}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded border bg-white">
        <div
          className="grid min-w-[900px]"
          style={{
            gridTemplateColumns: `90px repeat(${rooms.length}, minmax(180px, 1fr))`,
          }}
        >
          <div className="border-b bg-slate-100 p-3 text-sm font-semibold">
            Hour
          </div>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="border-b border-l bg-slate-100 p-3 text-sm font-semibold"
            >
              {room.name}
            </div>
          ))}

          <div
            className="grid"
            style={{
              gridTemplateRows: `repeat(${HOURS.length}, minmax(64px, 1fr))`,
            }}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b p-3 text-sm text-slate-500"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {rooms.map((room) => (
            <div
              key={room.id}
              className="grid border-l"
              style={{
                gridTemplateRows: `repeat(${HOURS.length}, minmax(64px, 1fr))`,
              }}
            >
              {HOURS.map((hour) => (
                <div
                  key={`${room.id}-${hour}`}
                  className="col-start-1 border-b"
                  style={{ gridRow: hour - OPEN_HOUR + 1 }}
                />
              ))}

              {room.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="z-10 m-2 rounded bg-emerald-100 p-2 text-sm text-emerald-950"
                  style={{
                    gridColumn: 1,
                    gridRow: `${booking.startHour - OPEN_HOUR + 1} / ${booking.endHour - OPEN_HOUR + 1
                      }`,
                  }}
                >
                  <p className="font-semibold">
                    {booking.user.firstName} {booking.user.lastName}
                  </p>
                  <p>
                    {booking.startHour}:00-{booking.endHour}:00
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section >
  );
}