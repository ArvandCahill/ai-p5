import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from "markdown-it";

const API_KEY = import.meta.env.VITE_API_KEY;

const form = document.querySelector("#student-form");
const output = document.querySelector(".output");

form.onsubmit = async (event) => {
  event.preventDefault();
  output.textContent = "Generating...";

  const name = form.elements["name"].value;
  const interests = form.elements["interests"].value;
  const math = form.elements["math"].value;
  const science = form.elements["science"].value;
  const language = form.elements["language"].value;
  const personality = form.elements["personality"].value;

  const prompt = `Rekomendasikan jurusan siswa berdasarkan parameter berikut:
    - Nama Lengkap: ${name}
    - Minat Utama: ${interests}
    - Nilai: Matematika = ${math}, IPA = ${science}, Bahasa = ${language}
    - Kepribadian: ${personality}`;

  try {
    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ];


    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });


    const buffer = [];
    const md = new MarkdownIt();
    for await (const response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(""));
    }
  } catch (error) {
    console.error(error);
    output.innerHTML = `<hr>Terjadi kesalahan: ${error.message}`;
  }
};
