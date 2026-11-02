const sharp = require("sharp");
const path = require("node:path");
const fs = require("node:fs");

async function convertToTransparentPng(srcPath, destKey) {
  const destPath = path.join("f:\\Theju Lanka Tours\\public\\dioramas", `${destKey}.png`);
  console.log(`Converting ${srcPath} -> ${destPath}...`);
  
  const image = sharp(srcPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  
  const rgbaBuffer = Buffer.alloc(width * height * 4);
  const isBg = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const queue = [];
  
  function getPixel(x, y) {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }
  
  function isNearWhite(x, y, threshold = 240) {
    const [r, g, b] = getPixel(x, y);
    return r >= threshold && g >= threshold && b >= threshold;
  }
  
  // Seed with border pixels
  for (let x = 0; x < width; x++) {
    if (isNearWhite(x, 0)) queue.push(x, 0);
    if (isNearWhite(x, height - 1)) queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    if (isNearWhite(0, y)) queue.push(0, y);
    if (isNearWhite(width - 1, y)) queue.push(width - 1, y);
  }
  
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    isBg[idx] = 1;
    
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx] && isNearWhite(nx, ny, 238)) {
          queue.push(nx, ny);
        }
      }
    }
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const srcIdx = pIdx * channels;
      const destIdx = pIdx * 4;
      
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      
      rgbaBuffer[destIdx] = r;
      rgbaBuffer[destIdx + 1] = g;
      rgbaBuffer[destIdx + 2] = b;
      
      if (isBg[pIdx]) {
        rgbaBuffer[destIdx + 3] = 0;
      } else {
        let nearBg = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (isBg[ny * width + nx]) nearBg = true;
            }
          }
        }
        
        if (nearBg && isNearWhite(x, y, 230)) {
          const brightness = (r + g + b) / 3;
          const alpha = Math.max(0, Math.min(255, Math.round((255 - brightness) * 4)));
          rgbaBuffer[destIdx + 3] = alpha;
        } else {
          rgbaBuffer[destIdx + 3] = 255;
        }
      }
    }
  }
  
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(destPath);
    
  console.log("Successfully created:", destPath);
}

// Read CLI args: node make-transparent.cjs <srcPath> <destKey>
const args = process.argv.slice(2);
if (args.length >= 2) {
  convertToTransparentPng(args[0], args[1]).catch(console.error);
} else {
  module.exports = { convertToTransparentPng };
}
