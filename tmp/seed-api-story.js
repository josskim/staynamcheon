const fixedTags = [
  "#스테이남천", "#경산펜션", "#대구근교펜션", "#경산워크샵", "#제2야수교", 
  "#제2야전수송교육", "#캠프닉", "#경산캠프닉", "#경산대형펜션", "#가족모임", 
  "#계모임", "#단체모임펜션", "#경산풀빌라", "#경산바베큐", "#수영장펜션", "#시골늙은개발자"
];

const dynamicTags = [
  "#물놀이", "#수영장", "#프라이빗풀", "#아이와가볼만한곳", 
  "#여름휴가미리보기", "#주말나들이", "#육아소통", "#가족여행"
];

const allTags = [...fixedTags, ...dynamicTags];

const contentHtml = `
<div class="space-y-8 text-gray-800 leading-relaxed max-w-2xl mx-auto my-12 font-sans tracking-wide">
  
  <p class="text-xl md:text-2xl font-light text-center leading-loose text-gray-700 italic border-b border-gray-200 pb-8">
    "따뜻한 햇살과 시원한 물보라, 우리 가족만의 프라이빗한 물놀이가 시작되는 곳."
  </p>

  <div class="pt-6">
    <h3 class="text-2xl font-semibold mb-4 text-[#DB5461]">미리 만나는 여름, 아이들의 웃음소리 가득한 하루 💦</h3>
    <p class="mb-6">
      날씨가 부쩍 더워진 요즘, 수영장에서 보내는 시간이 가장 즐겁죠. 넓직한 야외 풀에 덩그러니 띄워둔 튜브 하나, 그리고 쉴 새 없이 물장구 치는 아이들의 신난 목소리가 남천의 고즈넉한 풍경 사이로 울려 퍼집니다.
    </p>
    <p class="mb-6">
      수영장을 에워싼 넓은 데크 위에서 시원한 음료를 마시며 수영하는 모습을 바라보는 것만으로도 여유와 힐링이 가득 채워지는 것 같아요. 스테이남천의 장점은 바로 누구의 방해도 받지 않고 온 가족이 편안하게 뛰어놀 수 있는 넓고 청정한 공간이라는 점입니다.
    </p>
  </div>

  <blockquote class="bg-gray-50 border-l-4 border-[#DB5461] p-6 text-lg font-medium text-gray-700 italic rounded-r-xl shadow-sm my-10 transition-all hover:bg-white hover:shadow-md">
    <p>도심을 떠나 아이들의 해맑은 미소가 더욱 빛나는 이곳, 바로 경산 최고의 촌캉스 풀빌라 스테이남천입니다.</p>
  </blockquote>

  <div>
    <h3 class="text-xl font-semibold mb-4">함께해서 더욱 특별한 가족모임의 성지</h3>
    <p class="mb-4">
      밤이 되면 캠프닉 구역의 조명 아래 옹기종기 모여 앉아 바베큐 파티를 즐길 수 있습니다. 물놀이로 지친 배를 채워줄 야외 바베큐는 아이들도, 어른들도 잊지 못할 추억을 선사한답니다.
    </p>
    <p>
      넓고 깨끗한 시설에서, 일상의 바쁨을 내려놓고 온전한 쉼을 누리고 가시길 바랍니다. 언제나 따뜻하게 맞이하겠습니다. 😊
    </p>
  </div>

  <div class="mt-12 pt-6 border-t border-gray-100 flex items-center gap-3 text-sm text-gray-400">
    <span class="inline-block w-8 h-[1px] bg-gray-300"></span>
    Story by 시골늙은개발자
  </div>
</div>
`;

async function main() {
  try {
    const res = await fetch("http://localhost:3003/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "우리 가족만의 프라이빗 풀 시크릿, 스테이남천 수영장에서의 하루 🏊‍♂️",
        content: contentHtml,
        images: ["/images/lovable/hero.jpg", "/images/lovable/pension.jpg"], // Placeholder images 
        tags: allTags,
        isVisible: true
      })
    });
    
    if(res.ok) {
       console.log("Success! Posted to API.");
    } else {
       console.error("Failed to post:", await res.text());
    }
  } catch(e) {
    console.error("Fetch error", e);
  }
}

main();
