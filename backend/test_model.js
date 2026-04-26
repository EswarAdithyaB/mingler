const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const HF_API_KEY = "YOUR_HF_API_KEY"; // 🔴 replace this

const MODEL_URL =
  "https://api-inference.huggingface.co/models/Qwen/Qwen-Image-Edit-2511";

async function generateImage() {
  try {
    const formData = new FormData();

    // 👉 input image (selfie)
    formData.append("image", fs.createReadStream("./input.jpg"));

    // 👉 prompt (passport style)
    formData.append(
      "prompt",
      "convert this into a professional passport photo, centered face, white background, studio lighting, realistic"
    );

    const response = await axios.post(MODEL_URL, formData, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        ...formData.getHeaders(),
      },
      responseType: "arraybuffer", // important for image
    });

    // 👉 save output image
    fs.writeFileSync("output.png", response.data);

    console.log("✅ Image generated: output.png");
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response?.data || error.message
    );
  }
}

generateImage();