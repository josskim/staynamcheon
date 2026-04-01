import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const htmlContent = `
<div class="space-y-8 text-gray-800 leading-relaxed max-w-2xl mx-auto my-12 font-sans tracking-wide">
  
  <p class="text-xl md:text-2xl font-light text-center leading-loose text-gray-700 italic border-b border-gray-200 pb-8 tracking-wider">
    "계절의 변화를 온몸으로 느끼며, 바쁜 일상 속 작은 쉼표를 찍어가는 공간"
  </p>

  <div class="pt-6">
    <h3 class="text-2xl font-semibold mb-4 text-[#DB5461]">자연이 주는 완벽한 위로, 스테이남천의 평온한 하루 🌿</h3>
    <p class="mb-6">
      가까운 곳에서 누리는 완벽한 탈출구. 맑은 공기와 조용한 풀벌레 소리가 배경음악이 되는 스테이남천입니다. 언제든 가벼운 마음으로 떠나와도, 머무는 순간만큼은 최고의 평온함을 선물 받을 수 있도록 세심하게 가꾸어 가고 있습니다.
    </p>
    <p class="mb-6">
      드넓은 정원과 청량한 수영장, 감성 가득한 캠프닉 데크까지. 우리 아이들이 마음껏 뛰어놀고 어른들은 커피 한 잔의 여유를 즐길 수 있는 이 공간은, 서로 오롯이 집중할 수 있는 진정한 의미의 '가족 휴식처'를 지향합니다.
    </p>
  </div>

  <blockquote class="bg-gray-50 border-l-4 border-[#DB5461] p-6 text-lg font-medium text-gray-700 italic rounded-r-xl shadow-sm my-10 transition-all hover:bg-white hover:shadow-md">
    <p>가장 가까운 사람들과의 웃음꽃 피는 시간. 그 소중한 순간들을 위한 가장 아름다운 무대가 되어드리겠습니다.</p>
  </blockquote>

  <div>
    <h3 class="text-xl font-semibold mb-4">스테이남천에서 만나는 특별한 추억</h3>
    <p class="mb-4">
      눈부신 햇살 아래서 즐기는 수영부터, 붉게 물드는 노을을 바라보며 굽는 바베큐까지. 이곳에서의 하루는 여러분의 잊지 못할 스토리로 남게 됩니다. 
    </p>
  </div>

  <!-- 요청하신 시그니처 하단 컴포넌트 -->
  <div class="mt-20 pt-16 border-t border-gray-200">
    <div class="text-center mb-12">
      <h4 class="text-3xl font-bold tracking-tight text-gray-900 mb-8 font-serif">Stay Namcheon</h4>
      
      <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm md:text-base font-bold tracking-[0.2em] uppercase text-gray-500">
        <a href="/pension" class="hover:text-[#DB5461] hover:scale-105 transition-all">Pension</a>
        <span class="text-gray-300 text-xs">◆</span>
        <a href="/campnic" class="hover:text-[#DB5461] hover:scale-105 transition-all">Campnic</a>
        <span class="text-gray-300 text-xs">◆</span>
        <a href="/cafe" class="hover:text-[#DB5461] hover:scale-105 transition-all">Cafe</a>
        <span class="text-gray-300 text-xs">◆</span>
        <a href="/other" class="hover:text-[#DB5461] hover:scale-105 transition-all">Other</a>
        <span class="text-gray-300 text-xs">◆</span>
        <a href="/gallery" class="hover:text-[#DB5461] hover:scale-105 transition-all">Gallery</a>
        <span class="text-gray-300 text-xs">◆</span>
        <a href="/#reservation" class="hover:text-[#DB5461] hover:scale-105 transition-all">Reservation</a>
      </div>

      <div class="mt-12">
        <a href="https://스테이남천.com" target="_blank" class="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white rounded-full text-sm font-bold tracking-widest hover:bg-[#DB5461] transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
          스테이남천.com 방문하기
        </a>
      </div>
    </div>

    <!-- Map Section -->
    <div class="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 mt-12 group">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3238.648354652233!2d128.733384!3d35.738521!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3566133ef2825585%3A0x6d9006e885ed36e4!2z7Iqk7YWM7J2064Ko7LKc!5e0!3m2!1sko!2skr!4v1710500000000!5m2!1sko!2skr"
        width="100%"
        height="100%"
        style="border: 0"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="grayscale group-hover:grayscale-0 transition-all duration-700"
      ></iframe>
      <div class="absolute top-6 left-6 flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-3 rounded-full border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <span class="text-xs md:text-sm text-gray-800 font-bold tracking-wider">📍 경상북도 경산시 남천면 남천로 31</span>
      </div>
    </div>
  </div>
</div>
`;

async function main() {
  try {
    const stories = await prisma.stayStory.findMany({
      orderBy: { createdAt: 'desc' } // 가장 최신 글
    });

    if (stories.length > 0) {
      const targetStory = stories[0];
      
      await prisma.stayStory.update({
        where: { id: targetStory.id },
        data: {
          title: "일상을 떠나 휴식이 되는 곳, 스테이남천 이야기",
          content: htmlContent,
          isVisible: true
        }
      });
      console.log("Story updated with footer and map successfully: " + targetStory.id);
    } else {
      console.log("No stories found to update.");
    }
  } catch (error) {
    console.error("Error updating story:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
