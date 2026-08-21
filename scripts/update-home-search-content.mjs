import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const updates = [
  ["hero", "title", "경산 대형 단체 펜션\n스테이남천"],
  ["hero", "subtitle", "공식 숙박 최대 24명 · 30명 내외 단체 별도 상담\n모임·워크숍 · 독채 · 제2야수교 면회 · 캠프닉"],
  ["pension", "label", "GROUP & WORKSHOP"],
  ["pension", "title", "대형 단체"],
  ["pension", "description", "모임과 워크숍을 위한 경산 대형 단체 펜션입니다. 공식 숙박 최대 24명이며, 유아 포함 또는 추가 침구가 필요하지 않은 30명 내외 단체는 별도 상담해 드립니다."],
  ["other", "label", "PRIVATE STAY"],
  ["other", "title", "독채 펜션"],
  ["other", "description", "101호 독채와 201호·202호, 201+202호 전체 대관까지 인원과 여행 방식에 맞는 객실을 선택할 수 있습니다."],
  ["cafe", "label", "MILITARY VISIT"],
  ["cafe", "title", "제2야수교 면회"],
  ["cafe", "description", "제2야수교 면회객이 가족과 편안하게 머물 수 있도록 오전 10시부터 오후 6시까지 당일 이용을 운영합니다."],
  ["campnic", "label", "CAMPING & PICNIC"],
  ["campnic", "title", "캠프닉"],
  ["campnic", "description", "숙박 없이 즐기는 캠핑과 피크닉입니다. 1부는 오전 11시부터 오후 3시, 2부는 오후 5시부터 9시까지 운영합니다."],
];

try {
  const before = await prisma.stayPageContent.findMany({
    where: {
      page: "home",
      OR: updates.map(([section, key]) => ({ section, key })),
    },
    select: { section: true, key: true, value: true },
  });

  console.log(JSON.stringify({ dryRun, before, after: updates.map(([section, key, value]) => ({ section, key, value })) }, null, 2));

  if (!dryRun) {
    await prisma.$transaction(
      updates.map(([section, key, value]) =>
        prisma.stayPageContent.upsert({
          where: { page_section_key: { page: "home", section, key } },
          update: { value },
          create: { page: "home", section, key, value, type: "text" },
        }),
      ),
    );
    console.log(`Updated ${updates.length} home content values.`);
  }
} finally {
  await prisma.$disconnect();
}

