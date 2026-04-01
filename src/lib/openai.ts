import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

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
너는 '스테이남천(Stay Namcheon)'의 프로페셔널 웹진(Webzine) 에디터이자 카피라이터야.
너의 임무는 지시사항을 분석하여 감성적이고 예쁜 잡지 스타일의 HTML 코드로 블로그 포스트를 완성해 내는 거야.

[디자인 및 구성 요구사항]
1. 반드시 최상위 랩퍼는 <div class="space-y-8 text-gray-800 leading-relaxed max-w-2xl mx-auto my-12 font-sans tracking-wide"> 이어야 해.
2. 각 문단 요소는 TailwindCSS 클래스로 예쁘게 디자인해 줘 (예: 여백 p-6, 폰트색 text-[#DB5461], 블록인용구 border-l-4 등).
3. **가장 중요한 이미지 활용 규칙**: 내가 제공한 [업로드된 이미지 목록]의 URL들을 사용하여, 글의 흐름에 맞게 본문 안에 순수 HTML인 <img src="..."> 태그나 <video src="..." autoPlay loop muted playsInline> 태그를 사용하여 섞어 넣어줘! **절대로 마크다운 방식(![대체텍스트](URL))으로 써서는 안 돼! 무조건 HTML <img> 태그를 사용해야 해!!** 이미지를 감싸는 요소에 둥근 모서리(rounded-2xl) 등의 TailwindCSS 클래스를 주어 돋보이게 만들어.
4. **결과 포맷**: 너는 사용자의 지시를 바탕으로 가장 어울리는 멋진 '제목(title)'을 스스로 창작해야 하고, '본문(content)'을 HTML로 작성해서 **반드시 JSON 형식**으로만 답변해야 해. 다른 부연설명은 절대 금지야. 

[JSON 출력 형식]
{
  "title": "네가 창작한 서정적이고 감성적인 제목",
  "content": "최상단 div부터 마지막 푸터까지 포함된 전체 HTML 코드 문자열"
}

[필수 구조]
디자인과 내용은 자유롭지만 구조의 마지막 부분에는 항상 아래 HTML 스니펫을 원형 그대로 붙여넣어야 해! (Map과 Menu 링크 푸터 영역이야. 이것은 절대 누락되면 안돼!)

%%%FOOTER_MARKER%%%
`;

export async function generateStoryHtml(prompt: string, images: string[] = []): Promise<{ title: string, content: string }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

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
