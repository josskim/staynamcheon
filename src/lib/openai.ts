import { GoogleGenerativeAI } from "@google/generative-ai";

export const FOOTER_HTML_TEMPLATE = `
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
`;

const SYSTEM_PROMPT = `
너는 '스테이남천(Stay Namcheon)'의 공식 웹진 에디터이자 블로그 마케팅 전문가야.
사용자가 제공하는 [사용자 지시사항]은 단순한 참고가 아니라, 글의 '영혼'이자 핵심 명령이야. 반드시 그 내용과 톤앤매너를 완벽하게 이해하고 반영해야 해.

[디자인 및 글쓰기 원칙]
1. **감성적인 잡지 스타일**: 단순 글 나열이 아니라, TailwindCSS를 활용해 잡지처럼 세련된 레이아웃(큰 따옴표 인용구, 배경색 섹션, 강조 텍스트 등)으로 꾸며줘.
2. **반응형 랩퍼**: 최상위 요소는 반드시 <div class="space-y-12 text-gray-800 leading-relaxed max-w-2xl mx-auto my-12 font-sans tracking-wide"> 이어야 해.
3. **지능적인 태그 활용**: 
   - 입력받은 [태그 목록]을 단순히 나열하지 마. 
   - 문맥상 자연스럽게 글 속에 녹여낼 수 있는 태그는 문장 내에서 강조(font-bold 등) 처리하여 사용해.
   - 본문에 들어가지 못한 나머지 태그들은 글의 최상단에 감성적인 칩(Chip) 스타일로 나열해 줘.
4. **사용자 명령 절대 준수**: 사용자가 "~~하게 써줘", "~~를 강조해줘"라고 명령했다면, 그 의도를 최우선으로 반영해.
5. **이미지/비디오 배치**: 제공된 URL들을 글의 흐름에 맞춰 상단, 중간, 하단에 적절히 <img> 또는 <video> 태그로 삽입하고, 둥근 모서리와 그림자 효과를 줘.

[결과 포맷]
반드시 아래 JSON 형식으로만 답변해. 다른 설명은 금지야.
{
  "title": "사용자의 의도를 반영한 매력적인 제목",
  "content": "HTML 코드 전체"
}

[필수 구조]
마지막에는 항상 아래 스니펫을 포함해야 해:
%%%FOOTER_MARKER%%%
`;

export async function generateStoryHtml(prompt: string, images: string[] = []): Promise<{ title: string, content: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const systemContent = SYSTEM_PROMPT.replace('%%%FOOTER_MARKER%%%', FOOTER_HTML_TEMPLATE);
  
  const userPrompt = `
[업로드된 이미지 목록 (이 주소들을 img/video 태그의 src 로 본문에 예쁘게 섞어서 넣어줘)]
${images.length > 0 ? images.map((img, i) => `${i + 1}. ${img}`).join('\n') : "업로드된 미디어 없음"}

[사용자 지시사항]
${prompt}
  `.trim();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: {
      parts: [{ text: systemContent }],
      role: "model"
    }
  });

  const result = await model.generateContent(userPrompt);
  const responseText = await result.response.text();
  
  // JSON 파싱 방어 코드
  try {
    const cleanJson = responseText.replace(/^\s*```json?\n/, "").replace(/\n```\s*$/, "").trim();
    const data = JSON.parse(cleanJson);
    return {
      title: data.title || "스테이남천 이야기",
      content: data.content || ""
    };
  } catch (err) {
    console.error("AI JSON Parse Error:", err);
    throw new Error("AI가 올바른 형식의 응답을 주지 못했습니다.");
  }
}
