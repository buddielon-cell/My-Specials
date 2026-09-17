import express from "express";
import path from "path";
import multer from "multer";
import { Octokit } from "@octokit/rest";
import JSZip from "jszip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/ai/models", async (req, res) => {
    try {
      const apiKey = req.body.customApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "OPENROUTER_API_KEY is not configured in settings and no custom key provided." });
      }
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      const data = await response.json();
      res.json({ models: data.data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/test", async (req, res) => {
    try {
      const { provider, model, customApiKey } = req.body;
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(401).json({ error: "GEMINI_API_KEY is not configured in settings." });
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({ model: model || "gemini-3.7-flash", contents: "test" });
        res.json({ success: true, message: `Connected to Gemini (${model || "gemini-3.7-flash"}) successfully!` });
      } else if (provider === 'openrouter') {
        const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
        if (!apiKey) return res.status(401).json({ error: "OPENROUTER_API_KEY is not configured in settings and no custom key provided." });
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model || "anthropic/claude-3-haiku",
            messages: [{ role: "user", content: "test" }],
            max_tokens: 10
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
        res.json({ success: true, message: `Connected to OpenRouter (${model || "default"}) successfully!` });
      } else {
        res.status(400).json({ error: "Unknown provider" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Connection test failed" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, vfs, chatHistory, provider, model, customApiKey } = req.body;
      
      let contextStr = "Here is the current virtual file system:\n\n";
      let totalContextLength = 0;
      const MAX_CONTEXT_LENGTH = 150000;

      if (vfs) {
        for (const [filePath, fileData] of Object.entries(vfs)) {
          if ((fileData as any).type === 'file' && (fileData as any).content !== undefined) {
             if (filePath.includes('node_modules/') || filePath.includes('.git/')) continue;
             let content = (fileData as any).content as string;
             if (content.length > 40000) content = content.substring(0, 40000) + "\n\n...[CONTENT TRUNCATED DUE TO SIZE]...";
             const fileStr = `--- ${filePath} ---\n${content}\n\n`;
             if (totalContextLength + fileStr.length > MAX_CONTEXT_LENGTH) {
                 contextStr += `\n...[SOME FILES OMITTED FROM CONTEXT DUE TO SIZE LIMITS]...\n`;
                 break;
             }
             contextStr += fileStr;
             totalContextLength += fileStr.length;
          }
        }
      }

      const systemInstruction = `You are an expert AI Builder and Software Engineer.
You have access to the user's workspace.
Your goal is to help the user build, modify, and evolve applications.

If you need to create or modify files to fulfill the user's request, you MUST output a JSON block in the following format. 
You can include regular text explaining your thought process before or after the JSON block.

\`\`\`json
{
  "actions": [
    {
      "type": "write",
      "path": "index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "type": "delete",
      "path": "old_file.js"
    }
  ]
}
\`\`\`

IMPORTANT FOR PREVIEWS: 
The user's preview environment is basic. For web apps, try to keep everything in a single \`index.html\` file (using inline \`<script>\` and \`<style>\`) if possible, or use absolute CDN links (like unpkg) for libraries (React, Tailwind, etc.). This ensures the preview works flawlessly.`;

      const fullPrompt = `${contextStr}\nUser Prompt: ${prompt}`;

      if (provider === 'openrouter') {
        const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
        if (!apiKey) return res.status(401).json({ error: "OPENROUTER_API_KEY is not configured in settings and no custom key provided." });
        
        const messages = [];
        messages.push({ role: "system", content: systemInstruction });
        
        if (chatHistory && Array.isArray(chatHistory)) {
           for (const msg of chatHistory) {
               messages.push({
                   role: msg.role === 'ai' ? 'assistant' : 'user',
                   content: msg.content
               });
           }
        }
        messages.push({ role: "user", content: fullPrompt });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://ai.studio",
                "X-Title": "AGI Builder Core"
            },
            body: JSON.stringify({
                model: model || "anthropic/claude-3.5-sonnet",
                messages: messages
            })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
        
        res.json({ text: data.choices[0].message.content });
      } else {
        const apiKey = customApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(401).json({ error: "GEMINI_API_KEY is not configured in settings and no custom key provided." });
        const ai = new GoogleGenAI({ apiKey });
        
        const contents = [];
        if (chatHistory && Array.isArray(chatHistory)) {
           for (const msg of chatHistory) {
               contents.push({
                   role: msg.role === 'ai' ? 'model' : 'user',
                   parts: [{ text: msg.content }]
               });
           }
        }
        contents.push({
           role: 'user',
           parts: [{ text: fullPrompt }]
        });
  
        const response = await ai.models.generateContent({
          model: model || "gemini-3.7-flash",
          contents: contents,
          config: { systemInstruction }
        });
        res.json({ text: response.text });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate AI response" });
    }
  });

  app.post("/api/github/push", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { repository, branch } = req.body; // e.g. "buddielon-cell/SUITE", "main"

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        return res.status(401).json({ error: "GITHUB_TOKEN is not configured in settings." });
      }

      if (!repository) {
        return res.status(400).json({ error: "Repository is required (e.g. owner/repo)" });
      }

      const [owner, repo] = repository.split("/");
      if (!owner || !repo) {
        return res.status(400).json({ error: "Invalid repository format. Must be owner/repo" });
      }

      const octokit = new Octokit({ auth: token });
      const targetBranch = branch || "main";

      // 1. Get the current commit SHA of the branch
      let baseTreeSha: string;
      let parentCommitSha: string | null = null;
      let isNewRepo = false;

      try {
        const refData = await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${targetBranch}`,
        });
        parentCommitSha = refData.data.object.sha;

        const commitData = await octokit.git.getCommit({
          owner,
          repo,
          commit_sha: parentCommitSha,
        });
        baseTreeSha = commitData.data.tree.sha;
      } catch (err: any) {
        if (err.status === 409 || err.status === 404) {
          // Repository might be empty or branch doesn't exist
          isNewRepo = true;
          baseTreeSha = ""; // will not be used
        } else {
          throw new Error(`Failed to fetch branch ${targetBranch}: ${err.message}`);
        }
      }

      // 2. Unzip and create blobs
      const zip = new JSZip();
      await zip.loadAsync(file.buffer);

      const tree: any[] = [];
      const promises: Promise<void>[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          promises.push((async () => {
            const buffer = await zipEntry.async("nodebuffer");
            // GitHub blob content is base64 for binary
            const content = buffer.toString("base64");
            const blobRes = await octokit.git.createBlob({
              owner,
              repo,
              content,
              encoding: "base64",
            });

            // If the zip contains a top-level directory (e.g. "my-app/src/index.js"), 
            // we might want to strip it to avoid "my-app/" root folder.
            // But we'll just push the exact paths in the zip to be safe.
            let filePath = relativePath;
            // Let's strip the first path segment if it's the only top-level folder
            // Actually, we can just push it as is.
            
            tree.push({
              path: filePath,
              mode: "100644",
              type: "blob",
              sha: blobRes.data.sha,
            });
          })());
        }
      });

      await Promise.all(promises);

      if (tree.length === 0) {
        return res.status(400).json({ error: "The provided ZIP file is empty" });
      }

      // 3. Create Tree
      const treeRes = await octokit.git.createTree({
        owner,
        repo,
        tree,
        base_tree: isNewRepo ? undefined : baseTreeSha,
      });

      // 4. Create Commit
      const commitRes = await octokit.git.createCommit({
        owner,
        repo,
        message: "Upload unzipped files from Build Viewer",
        tree: treeRes.data.sha,
        parents: isNewRepo ? [] : [parentCommitSha!],
      });

      // 5. Update Ref
      if (isNewRepo) {
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${targetBranch}`,
          sha: commitRes.data.sha,
        });
      } else {
        await octokit.git.updateRef({
          owner,
          repo,
          ref: `heads/${targetBranch}`,
          sha: commitRes.data.sha,
          force: false,
        });
      }

      res.json({ success: true, commitUrl: `https://github.com/${repository}/commit/${commitRes.data.sha}` });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to push to GitHub" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
