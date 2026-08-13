// @ts-nocheck
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "data", "songs-to-import.json");
const outputPath = path.join(root, "data", "youtube-candidates.json");
const envPath = path.join(root, ".env.local");
async function readJson(filePath) { return JSON.parse((await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "")); }

function loadLocalEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

async function getApiKey() {
  const processValue = process.env.YOUTUBE_API_KEY?.trim();
  if (processValue) return processValue;
  try {
    return loadLocalEnv(await fs.readFile(envPath, "utf8")).YOUTUBE_API_KEY?.trim() || "";
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

function queryFor(song) { return [song.title, song.artist, song.film].filter(Boolean).join(" "); }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function searchYouTube(apiKey, song) {
  const params = new URLSearchParams({ part: "snippet", q: queryFor(song), type: "video", maxResults: "5", key: apiKey });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || `HTTP ${response.status}`);
  return (body.items || []).map((item) => ({
    videoId: item.id?.videoId || "",
    title: item.snippet?.title || "",
    channelTitle: item.snippet?.channelTitle || "",
    publishedAt: item.snippet?.publishedAt || "",
    description: item.snippet?.description || "",
    url: `https://www.youtube.com/watch?v=${item.id?.videoId || ""}`,
    needsReview: true,
  })).filter((candidate) => candidate.videoId);
}

async function main() {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is missing. Add it to .env.local or the process environment, then retry.");
  const songs = await readJson(inputPath);
  const results = [];
  for (let index = 0; index < songs.length; index += 1) {
    const song = songs[index];
    console.log(`[${index + 1}/${songs.length}] Searching ${queryFor(song)}...`);
    try { results.push({ ...song, candidates: await searchYouTube(apiKey, song) }); }
    catch (error) { console.error(`  Failed: ${error.message}`); results.push({ ...song, candidates: [], error: error.message }); }
    if (index < songs.length - 1) await sleep(250);
  }
  await fs.writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  console.log(`Saved ${results.length} song results to ${path.relative(root, outputPath)}.`);
}

main().catch((error) => { console.error(`Playlist search stopped: ${error.message}`); process.exitCode = 1; });

