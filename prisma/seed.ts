/**
 * Seed da base de dados Consultorio.
 *
 * Cria:
 * - 5 utilizadores (1 admin + 3 medicos + 1 rececao). Login demo: demo@consultorio.pt / demo1234
 * - 8 servicos com precos realistas em EUR
 * - 80 pacientes com nomes PT, NIF, telefone, morada
 * - 40 marcacoes distribuidas nos proximos 14 dias
 * - 15 faturas historicas dos ultimos 60 dias
 *
 * Correr com: npx prisma db seed
 * Re-correr e seguro -- limpa tudo antes de criar.
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import {
  PrismaClient,
  AppointmentStatus,
  InvoiceStatus,
  UserRole,
} from "../src/generated/prisma/client";
import { fakerPT_PT as faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import {
  addDays,
  setHours,
  setMinutes,
  startOfDay,
  subDays,
} from "date-fns";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 A limpar dados antigos...");
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 A criar staff...");
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@consultorio.pt",
      name: "Dr. Demo",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const otherStaff = await Promise.all([
    prisma.user.create({
      data: {
        email: "dr.silva@consultorio.pt",
        name: "Dra. Ana Silva",
        passwordHash,
        role: UserRole.DOCTOR,
      },
    }),
    prisma.user.create({
      data: {
        email: "dr.santos@consultorio.pt",
        name: "Dr. Joao Santos",
        passwordHash,
        role: UserRole.DOCTOR,
      },
    }),
    prisma.user.create({
      data: {
        email: "rececao@consultorio.pt",
        name: "Maria Costa",
        passwordHash,
        role: UserRole.STAFF,
      },
    }),
    prisma.user.create({
      data: {
        email: "dr.pereira@consultorio.pt",
        name: "Dr. Pedro Pereira",
        passwordHash,
        role: UserRole.DOCTOR,
      },
    }),
  ]);

  const allStaff = [demoUser, ...otherStaff];
  const doctors = allStaff.filter(
    (u) => u.role === UserRole.DOCTOR || u.role === UserRole.ADMIN,
  );

  console.log("🩺 A criar servicos...");
  const servicesData = [
    { name: "Consulta de clinica geral", priceCents: 4500, durationMinutes: 30, description: "Consulta de medicina geral." },
    { name: "Consulta de seguimento", priceCents: 3000, durationMinutes: 20, description: "Avaliacao de seguimento." },
    { name: "Analises clinicas", priceCents: 2500, durationMinutes: 15, description: "Recolha para analises ao sangue." },
    { name: "Ecografia", priceCents: 6500, durationMinutes: 30, description: "Exame ecografico." },
    { name: "Vacinacao", priceCents: 2000, durationMinutes: 10, description: "Administracao de vacina." },
    { name: "Eletrocardiograma", priceCents: 4000, durationMinutes: 20, description: "ECG em repouso." },
    { name: "Consulta urgente", priceCents: 6000, durationMinutes: 30, description: "Atendimento sem marcacao previa." },
    { name: "Teleconsulta", priceCents: 3500, durationMinutes: 25, description: "Consulta por videoconferencia." },
  ];
  const services = await Promise.all(
    servicesData.map((s) => prisma.service.create({ data: s })),
  );

  console.log("🧑‍🤝‍🧑 A criar 80 pacientes...");
  const patients = [];
  for (let i = 0; i < 80; i++) {
    const patient = await prisma.patient.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: `+351 9${faker.number.int({ min: 1, max: 6 })}${faker.string.numeric(7)}`,
        birthDate: faker.date.between({ from: "1940-01-01", to: "2010-12-31" }),
        nif: faker.string.numeric(9),
        address: `${faker.location.streetAddress()}, ${faker.location.zipCode("####-###")} ${faker.location.city()}`,
        notes: i % 4 === 0 ? faker.lorem.sentence() : null,
      },
    });
    patients.push(patient);
  }

  console.log("📅 A criar 40 marcacoes...");
  const slots = [9, 10, 11, 14, 15, 16, 17] as const;
  for (let i = 0; i < 40; i++) {
    const dayOffset = Math.floor(Math.random() * 14);
    const slotHour = randomItem(slots);
    const slotMin = Math.random() > 0.5 ? 0 : 30;

    const startsAt = setMinutes(
      setHours(addDays(startOfDay(new Date()), dayOffset), slotHour),
      slotMin,
    );

    const service = randomItem(services);
    const patient = randomItem(patients);
    const doctor = randomItem(doctors);

    const statusRoll = Math.random();
    const status =
      dayOffset === 0 && statusRoll < 0.4
        ? AppointmentStatus.COMPLETED
        : statusRoll < 0.05
          ? AppointmentStatus.CANCELLED
          : AppointmentStatus.SCHEDULED;

    await prisma.appointment.create({
      data: {
        startsAt,
        durationMinutes: service.durationMinutes,
        status,
        patientId: patient.id,
        staffId: doctor.id,
        serviceId: service.id,
        notes: Math.random() < 0.3 ? faker.lorem.sentence() : null,
      },
    });
  }

  console.log("🧾 A criar 15 faturas historicas...");
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const issuedAt = subDays(new Date(), daysAgo);
    const patient = randomItem(patients);
    const lineCount = 1 + Math.floor(Math.random() * 3);
    const chosenServices = Array.from({ length: lineCount }, () =>
      randomItem(services),
    );
    const subtotalCents = chosenServices.reduce((sum, s) => sum + s.priceCents, 0);
    const taxCents = Math.round(subtotalCents * 0.23); // IVA 23%
    const totalCents = subtotalCents + taxCents;
    const number = `FT 2026/${String(i + 1).padStart(4, "0")}`;
    const status = Math.random() < 0.7 ? InvoiceStatus.PAID : InvoiceStatus.ISSUED;

    await prisma.invoice.create({
      data: {
        number,
        issuedAt,
        dueDate: addDays(issuedAt, 30),
        status,
        subtotalCents,
        taxCents,
        totalCents,
        patientId: patient.id,
        lines: {
          create: chosenServices.map((s) => ({
            description: s.name,
            quantity: 1,
            unitPriceCents: s.priceCents,
            lineTotalCents: s.priceCents,
            serviceId: s.id,
          })),
        },
      },
    });
  }

  console.log("✅ Seed completo.");
  console.log("");
  console.log("   Login demo:");
  console.log("   📧 demo@consultorio.pt");
  console.log("   🔑 demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
