const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const paths = ["/", "/pension", "/cafe", "/campnic", "/other", "/reservation", "/gallery"];
const referrers = [null, null, null, "https://www.google.com/search?q=경산펜션", "https://naver.com", "https://kakao.com", "https://www.instagram.com/"];
const devices = ["mobile", "mobile", "desktop", "desktop", "mobile", "tablet"];
const browsers = ["Chrome", "Safari", "Chrome", "Samsung", "Edge", "Firefox"];
const osList = ["Android", "iOS", "Windows", "Android", "Windows", "Mac"];
const userAgents = [
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Samsung Galaxy) SamsungBrowser/21.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/604.1",
];

function parseReferrerDomain(referrer) {
  if (!referrer) return "직접접속";
  try {
    const url = new URL(referrer);
    const h = url.hostname;
    if (h.includes("google")) return "Google";
    if (h.includes("naver")) return "Naver";
    if (h.includes("kakao")) return "Kakao";
    if (h.includes("instagram")) return "instagram.com";
    return h;
  } catch { return "직접접속"; }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // Delete existing seed data
  const existing = await prisma.pageView.count();
  console.log(`현재 PageView 수: ${existing}`);

  const records = [];
  const now = new Date();

  // Generate ~300 records over the last 90 days
  for (let day = 89; day >= 0; day--) {
    // More visits on recent days
    const visitsToday = day < 7 ? randomInt(8, 25) : day < 30 ? randomInt(3, 15) : randomInt(0, 8);

    for (let v = 0; v < visitsToday; v++) {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - day);
      date.setUTCHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59), 0);

      const refIdx = Math.random() < 0.5 ? 0 : randomInt(0, referrers.length - 1);
      const referrer = referrers[refIdx];
      const devIdx = randomInt(0, devices.length - 1);
      const pathIdx = day < 14 ? randomInt(0, paths.length - 1) : randomInt(0, 3); // recent: all pages, older: main pages

      records.push({
        path: paths[pathIdx],
        referrer,
        referrerDomain: parseReferrerDomain(referrer),
        userAgent: userAgents[devIdx],
        browser: browsers[devIdx],
        os: osList[devIdx],
        device: devices[devIdx],
        ipHash: null,
        sessionId: `seed-${day}-${v}`,
        createdAt: date,
      });
    }
  }

  await prisma.pageView.createMany({ data: records });
  console.log(`✅ ${records.length}개 샘플 데이터 삽입 완료`);

  const total = await prisma.pageView.count();
  console.log(`총 PageView 수: ${total}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
