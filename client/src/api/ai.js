import axios from "axios";

export const summarizeFile = async (fileUrl, fileType) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/ai/summarize`,
      { fileUrl, fileType },
      { withCredentials: true }
    );
    return data.summary;
  } catch (err) {
    console.error("Summarization failed:", err);
    throw err;
  }
};
