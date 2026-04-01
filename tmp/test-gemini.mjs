import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD0HvMakBnaVa02knGgM61VWrht5mF27jY";

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent("테스트용 안녕이라고 대답해줘.");
    const response = await result.response;
    const text = response.text();
    console.log("Success! Gemini response:", text);
  } catch (error) {
    console.error("Failed to connect to Gemini API:", error);
  }
}

run();
