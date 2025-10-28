const express = require("express");
const userAuth = require("../middleware/userAuth");
const { summarizeFile } = require("../controller/aiController");

const aiRouter = express.Router();

// POST route for summarizing a file (PDF or Word)
aiRouter.post("/summarize", userAuth, summarizeFile);

module.exports = aiRouter;
