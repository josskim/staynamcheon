import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const htmlContent = `
<div class="space-y-8 text-gray-800 leading-relaxed max-w-2xl mx-auto my-12 font-sans tracking-wide">
  
  <p class="text-xl md:text-2xl font-light text-center leading-loose text-gray-700 italic border-b border-gray-200 pb-8 tracking-wider">
    "따뜻한 햇살 아래 빛나는 파란 물결, 아이들의 해맑은 웃음소리로 가득 찬 스테이남천의 여름"
  </p>

  <div class="pt-6">
    <h3 class="text-2xl font-semibold mb-4 text-[#DB5461]">미리 만나는 여름휴가, 프라이빗 수영장에서의 마법 같은 하루 💦</h3>
    <p class="mb-6">
      가까워진 여름의 열기를 시원하게 식혀줄 스테이남천의 자랑, 대형 야외 프라이빗 풀장입니다! 날씨가 부쩍 맑아진 요즘, 튜브 하나 띄워놓고 푸른 물살을 가르며 노는 아이들의 모습을 보면 이보다 완벽한 휴식이 없다는 생각이 듭니다.
    </p>
    <p class="mb-6">
      다른 사람들의 시선이나 북적임 없이, 오로지 우리 가족만 사용할 수 있는 넓고 청량한 공간. 물총놀이도 하고 플라밍고 튜브에도 올라타며 시간 가는 줄 모르는 힐링의 시간이죠. 수영장을 감싸는 넓은 데크 덕분에 어른들은 시원한 커피 한 잔과 함께 편안하게 아이들을 바라볼 수 있습니다.
    </p>
  </div>

  <blockquote class="bg-gray-50 border-l-4 border-[#DB5461] p-6 text-lg font-medium text-gray-700 italic rounded-r-xl shadow-sm my-10 transition-all hover:bg-white hover:shadow-md">
    <p>도심에서 쌓인 스트레스와 피로가, 아이들의 웃음소리 한 번에 씻은 듯이 날아갑니다. 스테이남천에서의 시간은 그렇게 잔잔한 행복으로 채워집니다.</p>
  </blockquote>

  <div>
    <h3 class="text-xl font-semibold mb-4">지치지 않는 체력, 밤에는 바베큐 파티까지!</h3>
    <p class="mb-4">
      한바탕 신나게 물놀이를 즐긴 후 밀려오는 기분 좋은 허기짐. 촌캉스의 백미는 단연 저녁의 바베큐 파티 아닐까요? 남천의 시원한 산바람을 맞으며 맛있는 고기를 구워 먹는 즐거움은 상상만으로도 입가에 미소가 지어집니다.
    </p>
    <p>
      우리 가족만의 조용하고 완벽한 시크릿 휴식처, 스테이남천에서 가장 행복한 추억을 만들어 가시길 바랍니다. 언제나 깨끗하고 따뜻한 모습으로 맞이하겠습니다. 😊
    </p>
  </div>

  <div class="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
    <div class="flex items-center gap-3">
      <span class="inline-block w-8 h-[1px] bg-gray-300"></span>
      <span class="font-medium">Story by 시골늙은개발자 & AI Editor</span>
    </div>
  </div>
</div>
`;

async function main() {
  try {
    const stories = await prisma.stayStory.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (stories.length > 0) {
      const targetStory = stories[0]; // 가장 최근에 올려둔 초안
      
      await prisma.stayStory.update({
        where: { id: targetStory.id },
        data: {
          title: "우리 가족만의 프라이빗 풀 시크릿, 스테이남천 수영장에서의 하루 🏊‍♂️",
          content: htmlContent,
          isVisible: true // 퍼블리시
        }
      });
      console.log("Story updated successfully: " + targetStory.id);
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
