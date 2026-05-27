"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import "./fullcalendar.css";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
};

const statusColors: Record<CalendarEvent["status"], string> = {
  SCHEDULED: "#3b82f6", // blue-500
  COMPLETED: "#10b981", // emerald-500
  CANCELLED: "#9ca3af", // gray-400
  NO_SHOW: "#f59e0b", // amber-500
};

export function AppointmentsCalendar({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: statusColors[e.status],
    borderColor: statusColors[e.status],
    textColor: "#ffffff",
    extendedProps: { status: e.status },
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      locale={ptLocale}
      events={fcEvents}
      height="auto"
      slotMinTime="08:00:00"
      slotMaxTime="20:00:00"
      weekends={false}
      firstDay={1}
      nowIndicator
      allDaySlot={false}
      slotDuration="00:30:00"
      slotLabelInterval="01:00"
      buttonText={{
        today: "Hoje",
        month: "Mes",
        week: "Semana",
        day: "Dia",
      }}
      eventClick={(info) => {
        info.jsEvent.preventDefault();
        router.push(`/marcacoes/${info.event.id}`);
      }}
      dateClick={(info) => {
        const iso = info.dateStr.slice(0, 16);
        router.push(`/marcacoes/nova?startsAt=${iso}`);
      }}
    />
  );
}
