import { Response } from "express";
import { GoogleGenAI } from "@google/genai";

import { AuthRequest } from "../midleware/authmidlleware.js";
import { cloudinary } from "../config/cloudinary.js";

import { Generation } from "../models/generation.js";
import { Post } from "../models/post.js";


const generatePollinationsImage = async (
  prompt: string
): Promise<string> => {
  try {
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}`;

    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: "ai-generations",
    });

    return uploadResult.secure_url;
  } catch (error: any) {
    console.error("Image Generation Error:", error.message);
    return "";
  }
};


// Generate post
// POST /api/posts/generate
export const generatePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({
        message: "Gemini API Key is missing.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Generate a professional social media post.

Prompt:
${prompt}

Tone:
${tone}

Return ONLY valid JSON.

{
  "content":"",
  "imagePrompt":""
}
`,
    });

    let content = "";
    let imagePrompt = prompt;

    try {
      const raw = response.text || "";

      const json = raw.match(/\{[\s\S]*\}/);

      if (json) {
        const parsed = JSON.parse(json[0]);

        content = parsed.content || "";
        imagePrompt = parsed.imagePrompt || prompt;
      } else {
        content = raw;
      }
    } catch {
      content = response.text || "";
    }

    let mediaUrl = "";
    if (generateImage) {
  console.log("Generating AI image...");
  console.log("Image Prompt:", imagePrompt);

  mediaUrl = await generatePollinationsImage(imagePrompt);

  console.log("Generated Image URL:", mediaUrl);
}

    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      mediaUrl,
      mediaType: mediaUrl ? "image" : undefined,
      tone,
    });

    res.status(201).json(generation);
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};
// Get AI generations
// GET /api/posts/generations
export const getGenerations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const generations = await Generation.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(generations);
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};

// Get scheduled posts
// GET /api/posts
export const getPosts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};
// Schedule Post
// POST /api/posts
export const schedulePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("--request");
    console.log("req.file",req.file);
    console.log("req.body",req.body);
    console.log("====")
    const { content, platforms, scheduledFor, status } = req.body;

    let parsedPlatforms = platforms;

    if (typeof platforms === "string") {
      try {
        parsedPlatforms = JSON.parse(platforms);
      } catch {
        parsedPlatforms = platforms.split(",");
      }
    }

    let mediaUrl: string | undefined = req.body.mediaUrl;
    let mediaType: "image" | "video" | undefined = req.body.mediaType;

    if (req.file) {

      console.log("file revieved",req.file.originalname);
      console.log("size",req.file.size);
      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "social-scheduler",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
  console.error("========== CLOUDINARY ERROR ==========");
  console.dir(error, { depth: null });
  console.error("======================================");
  return reject(error);
}
            resolve(result);
          }
        );

        stream.end(req.file!.buffer);
      });

      mediaUrl = result.secure_url;
      console.log("cloudinary url",mediaUrl);
       console.log("cloudinary result",result);
      mediaType =
        result.resource_type === "video" ? "video" : "image";
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      platforms: parsedPlatforms,
      mediaUrl,
      mediaType,
      scheduledFor,
      status: status || "scheduled",
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: error?.message || "Server Error",
    });
  }
};