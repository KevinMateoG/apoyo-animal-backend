import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AnimalSex, AnimalStatus, UserRole } from "@prisma/client";
import { auth } from "../src/infrastructure/auth/better-auth.ts";
import { prisma } from "../src/infrastructure/repository/client.ts";
import { R2StorageService } from "../src/infrastructure/services/storage.service.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_PUBLIC_DIR = path.resolve(
  __dirname,
  "../../apoyo-animal-frontend/public",
);

const SPECIES_SEED = [
  {
    scientificName: "Mellivora capensis",
    commonName: "Tejón Melero",
    description:
      "Mustélido renombrado por su notable resistencia inmunológica, cuero elástico de alta densidad e instinto exploratorio.",
    morphology: "9–14 kg, manto dorsal gris plata y garras de 4 cm.",
    habitat: "Sabana seca, matorrales semiáridos y áreas de roca.",
    diet: "Omnívoro oportunista: miel, raíces, larvas y reptiles.",
    localFileName: "tejon-melero.jpg",
    contentType: "image/jpeg",
    catalogLinkLabel: "ver ejemplares de tejon",
  },
  {
    scientificName: "Ailurus fulgens",
    commonName: "Panda Rojo",
    description:
      "Mamífero arborícola exclusivo de los bosques nubosos del Himalaya, vital para la dispersión de semillas de altura.",
    morphology: "4–6 kg, pelaje castaño rojizo y falso pulgar prensil.",
    habitat: "Bosques templados con sotobosque de bambú (2.200 m).",
    diet: "95% brotes y follaje de bambú, bayas y líquenes frescos.",
    localFileName: "panda-rojo.jpg",
    contentType: "image/jpeg",
    catalogLinkLabel: "ver ejemplares del panda rojo",
  },
  {
    scientificName: "Zalophus californianus",
    commonName: "León Marino",
    description:
      "Depredador costero fundamental para regular las comunidades de peces marinos y evaluar la salud del litoral.",
    morphology: "100–300 kg, aletas propulsoras y denso pelaje impermeable.",
    habitat: "Playas protegidas, bahías rocosas e islas del Pacífico.",
    diet: "Arenque, calamar y jurel de captura sustentable.",
    localFileName: "sea-lion.png",
    contentType: "image/png",
    catalogLinkLabel: "ver ejemplares del león marino",
  },
] as const;

const ANIMALS_SEED = [
  {
    name: "Rosi",
    scientificName: "Mellivora capensis",
    ageYears: 2,
    sex: AnimalSex.FEMALE,
    description: "Dieta enriquecida con miel pura y raíces silvestres.",
  },
  {
    name: "Boc",
    scientificName: "Ailurus fulgens",
    ageYears: 3,
    sex: AnimalSex.MALE,
    description: "prioriza brotes de bambú tierno seleccionados",
  },
  {
    name: "Nami",
    scientificName: "Zalophus californianus",
    ageYears: 4,
    sex: AnimalSex.FEMALE,
    description:
      "Disfruta nadar a alta velocidad y alimentarse con pescado fresco.",
  },
  {
    name: "Kabu",
    scientificName: "Mellivora capensis",
    ageYears: 5,
    sex: AnimalSex.MALE,
    description:
      "Muy activo y curioso, explora constantemente los refugios del recinto.",
  },
  {
    name: "Mei",
    scientificName: "Ailurus fulgens",
    ageYears: 1,
    sex: AnimalSex.FEMALE,
    description:
      "Suele descansar en las ramas altas tras consumir sus hojas de bambú.",
  },
  {
    name: "Tritón",
    scientificName: "Zalophus californianus",
    ageYears: 6,
    sex: AnimalSex.MALE,
    description:
      "Responde bien al entrenamiento de enriquecimiento con pelotas acuáticas.",
  },
  {
    name: "Bruno",
    scientificName: "Mellivora capensis",
    ageYears: 3,
    sex: AnimalSex.MALE,
    description:
      "Posee un carácter audaz y le encanta cavar en su zona de tierra.",
  },
  {
    name: "Jin",
    scientificName: "Ailurus fulgens",
    ageYears: 2,
    sex: AnimalSex.MALE,
    description:
      "Prefiere las horas frescas de la mañana para comer sus frutos secos.",
  },
  {
    name: "Cora",
    scientificName: "Zalophus californianus",
    ageYears: 3,
    sex: AnimalSex.FEMALE,
    description: "Le gusta tomar el sol sobre las rocas después de nadar.",
  },
  {
    name: "Zuri",
    scientificName: "Mellivora capensis",
    ageYears: 4,
    sex: AnimalSex.FEMALE,
    description:
      "Inspecciona metódicamente cada rincón en busca de raíces e insectos.",
  },
  {
    name: "Ling",
    scientificName: "Ailurus fulgens",
    ageYears: 5,
    sex: AnimalSex.FEMALE,
    description:
      "Tranquila y trepadora ágil; adora los brotes más suaves del día.",
  },
] as const;

const TEST_USERS = [
  {
    name: "Administrador Reserva",
    email: "admin@apoyoanimal.org",
    password: "Admin1234!",
    role: UserRole.admin,
  },
  {
    name: "Usuario Padrino",
    email: "usuario@apoyoanimal.org",
    password: "Usuario1234!",
    role: UserRole.user,
  },
] as const;

function birthDateFromAge(ageYears: number): Date {
  const currentYear = new Date().getUTCFullYear();
  return new Date(Date.UTC(currentYear - ageYears, 0, 1));
}

async function resolveSpeciesImageUrl(
  storage: R2StorageService,
  localFileName: string,
  contentType: string,
): Promise<string> {
  if (!storage.isConfigured()) {
    return `/${localFileName}`;
  }

  try {
    const filePath = path.join(FRONTEND_PUBLIC_DIR, localFileName);
    const buffer = await readFile(filePath);
    const uploaded = await storage.uploadFile({
      key: `species/${localFileName}`,
      body: buffer,
      contentType,
    });
    console.log(`Imagen subida a Cloudflare R2: ${uploaded.url}`);
    return uploaded.url;
  } catch (error) {
    console.warn(
      `No se pudo subir ${localFileName} a R2, usando ruta local:`,
      error,
    );
    return `/${localFileName}`;
  }
}

async function seedUsers() {
  for (const testUser of TEST_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    if (!existing) {
      await auth.api.signUpEmail({
        body: {
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        },
      });
    }

    await prisma.user.update({
      where: { email: testUser.email },
      data: {
        name: testUser.name,
        role: testUser.role,
        emailVerified: true,
      },
    });
  }
}

async function seedCatalog() {
  const storage = new R2StorageService();
  const speciesByScientificName = new Map<
    string,
    { id: string; imageUrl: string }
  >();

  for (const item of SPECIES_SEED) {
    const imageUrl = await resolveSpeciesImageUrl(
      storage,
      item.localFileName,
      item.contentType,
    );

    const saved = await prisma.species.upsert({
      where: { scientificName: item.scientificName },
      update: {
        commonName: item.commonName,
        description: item.description,
        morphology: item.morphology,
        habitat: item.habitat,
        diet: item.diet,
        imageUrl,
        catalogLinkLabel: item.catalogLinkLabel,
        isVisible: true,
      },
      create: {
        scientificName: item.scientificName,
        commonName: item.commonName,
        description: item.description,
        morphology: item.morphology,
        habitat: item.habitat,
        diet: item.diet,
        imageUrl,
        catalogLinkLabel: item.catalogLinkLabel,
        isVisible: true,
      },
    });

    speciesByScientificName.set(item.scientificName, {
      id: saved.id,
      imageUrl: saved.imageUrl,
    });
  }

  for (const animal of ANIMALS_SEED) {
    const species = speciesByScientificName.get(animal.scientificName);
    if (!species) {
      throw new Error(`Especie no encontrada: ${animal.scientificName}`);
    }

    const birthDate = birthDateFromAge(animal.ageYears);

    await prisma.animal.upsert({
      where: {
        speciesId_name: {
          speciesId: species.id,
          name: animal.name,
        },
      },
      update: {
        sex: animal.sex,
        birthDate,
        description: animal.description,
        imageUrl: species.imageUrl,
        status: AnimalStatus.ACTIVE,
        isAvailableForSponsorship: true,
      },
      create: {
        name: animal.name,
        speciesId: species.id,
        sex: animal.sex,
        birthDate,
        description: animal.description,
        imageUrl: species.imageUrl,
        status: AnimalStatus.ACTIVE,
        isAvailableForSponsorship: true,
      },
    });
  }
}

async function main() {
  await seedUsers();
  await seedCatalog();
  console.log("Seed ejecutado correctamente.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error ejecutando el seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
