// backend/routes/upload.js
import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const TEMP_DIR = path.join(process.cwd(), "backend/uploads_temp");
const UPLOAD_DIR = path.join(process.cwd(), "backend/public_uploads");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// init
router.post("/init", (req, res) => {
  const { filename, totalChunks } = req.body;
  const uploadId = uuidv4();
  const meta = { filename, totalChunks: Number(totalChunks), received: 0 };
  fs.writeFileSync(path.join(TEMP_DIR, `${uploadId}.json`), JSON.stringify(meta));
  res.json({ uploadId });
});

// chunk upload (binary)
router.post("/chunk/:uploadId/:index", (req, res) => {
  const { uploadId, index } = req.params;
  const chunkPath = path.join(TEMP_DIR, `${uploadId}.${index}`);
  const ws = fs.createWriteStream(chunkPath);
  req.pipe(ws);
  ws.on("finish", () => {
    const metaPath = path.join(TEMP_DIR, `${uploadId}.json`);
    const meta = JSON.parse(fs.readFileSync(metaPath));
    meta.received = (meta.received || 0) + 1;
    fs.writeFileSync(metaPath, JSON.stringify(meta));
    res.json({ ok: true });
  });
  ws.on("error", (e) => res.status(500).json({ ok:false, error:e.message }));
});

// complete
router.post("/complete", (req, res) => {
  const { uploadId, finalName } = req.body;
  const metaPath = path.join(TEMP_DIR, `${uploadId}.json`);
  if(!fs.existsSync(metaPath)) return res.status(400).json({ ok:false, error:"no such upload" });
  const meta = JSON.parse(fs.readFileSync(metaPath));
  const outName = finalName || `${Date.now()}_${meta.filename}`;
  const outPath = path.join(UPLOAD_DIR, outName);
  const ws = fs.createWriteStream(outPath);
  for(let i=0;i<meta.totalChunks;i++){
    const chunkPath = path.join(TEMP_DIR, `${uploadId}.${i}`);
    if(!fs.existsSync(chunkPath)) return res.status(400).json({ ok:false, error:`missing chunk ${i}` });
    const data = fs.readFileSync(chunkPath);
    ws.write(data);
    fs.unlinkSync(chunkPath);
  }
  ws.end();
  fs.unlinkSync(metaPath);
  res.json({ ok:true, url:`/uploads/${outName}` });
});

export default router;
