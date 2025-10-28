import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import fs from "fs";
import tmp from "tmp";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ✅ Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 🧩 Helper 1: Download file temporarily
 */
const downloadFile = async (fileUrl) => {
  const tmpFile = tmp.fileSync();
  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(tmpFile.name, response.data);
  return tmpFile;
};

/**
 * 🧩 Helper 2: Extract text from PDF or Word
 */
const extractText = async (filePath, fileType) => {
  const normalizedType = fileType.toLowerCase();

  // ✅ Handle PDF
  if (normalizedType.includes("pdf")) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData?.text || "";
  }

  // ✅ Handle Word (.docx or .doc)
  if (normalizedType.includes("docx") || normalizedType.includes("doc")) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Only PDF and Word files are supported for summarization.");
};

/**
 * 🧠 Controller: Summarize File
 */
export const summarizeFile = async (req, res) => {
  let tmpFile;
  try {
    const { fileUrl, fileType } = req.body;

    if (!fileUrl || !fileType) {
      return res
        .status(400)
        .json({ error: "fileUrl and fileType are required in the request body" });
    }

    // 1️⃣ Download file
    tmpFile = await downloadFile(fileUrl);

    // 2️⃣ Extract text content
    const text = await extractText(tmpFile.name, fileType);

    if (!text || text.trim().length === 0) {
      tmpFile.removeCallback();
      return res.status(400).json({
        error:
          "Could not extract readable text. The file might be empty, image-based, or corrupted.",
      });
    }

    // 3️⃣ Generate summary using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Summarize the following ${
      fileType.includes("pdf") ? "PDF" : "Word"
    } document in clear, concise English (max 400 words):\n\n${text}`;

    try {
      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();

      // ✅ Clean up & respond
      tmpFile.removeCallback();
      return res.status(200).json({ summary });
    } catch (apiError) {
      console.error("❌ Error from Gemini API:", apiError);

      // Handle quota/rate-limit errors gracefully
      const errorMessage = apiError.message?.toLowerCase() || "";

      if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        return res.status(429).json({
          error:
            "Free usage limit reached or too many requests. Please try again later.",
        });
      }

      return res.status(500).json({
        error:
          "Gemini API error occurred while summarizing the document. Please retry later.",
      });
    }
  } catch (error) {
    console.error("❌ Error summarizing file:", error);

    // Cleanup temp file safely
    if (tmpFile && typeof tmpFile.removeCallback === "function") {
      try {
        tmpFile.removeCallback();
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    res.status(500).json({
      error:
        error.message ||
        "An unexpected error occurred while summarizing the document.",
    });
  }
};
