import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Google Sheets CSV Export URL provided by user
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4-Q2xzTPS_zlsMKJ4sMdP17Nb56u1eDEUJluu2gc1DnYxenXOclGqTKGSOEaRXBAXVHJfyQ6WJHBz/pub?output=csv";

const CACHE_FILE = path.join(process.cwd(), "istanbul-facilities-cache.json");

// Define TypeScript interfaces for our parsed data
interface Facility {
  id: string;
  name: string;
  type: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  closingHours: string;
  imageUrl?: string;
}

// Coordinate Normalization Functions
function normalizeLatitude(val: number): number {
  if (isNaN(val) || val === 0) return 41.0082; // İstanbul Default
  let lat = Math.abs(val);
  // Turkey's latitude is between 36.0 and 42.0. Allow a general margin [35.0, 43.5]
  if (lat > 43.5) {
    while (lat > 43.5) {
      lat /= 10;
    }
  }
  if (lat < 35.0) {
    while (lat < 35.0 && lat > 0) {
      lat *= 10;
    }
  }
  return lat;
}

function normalizeLongitude(val: number): number {
  if (isNaN(val) || val === 0) return 28.9784; // İstanbul Default
  let lng = Math.abs(val);
  // Turkey's longitude is between 26.0 and 45.0. Allow a general margin [25.0, 45.5]
  if (lng > 45.5) {
    while (lng > 45.5) {
      lng /= 10;
    }
  }
  if (lng < 25.0) {
    while (lng < 25.0 && lng > 0) {
      lng *= 10;
    }
  }
  return lng;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

async function fetchAndParseFacilities(): Promise<Facility[]> {
  try {
    console.log("Fetching CSV data... Url:", SPREADSHEET_URL);
    const res = await fetch(SPREADSHEET_URL);
    if (!res.ok) {
      throw new Error(`Google Sheets fetch failed with status: ${res.status}`);
    }
    const csvText = await res.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length <= 1) {
      throw new Error("CSV contains no data or header only");
    }

    const headers = parseCSVLine(lines[0]);
    console.log("CSV headers parsed:", headers);

    const facilities: Facility[] = [];

    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      if (columns.length < 5) continue;

      // Extract details
      const name = columns[0] || "";
      const type = columns[1] || "Sosyal Tesis";
      const city = columns[2] || "İstanbul";
      const district = columns[3] || "";
      const address = columns[4] || "";
      const rawLat = parseFloat(columns[5]);
      const rawLng = parseFloat(columns[6]);
      const openingHours = columns[7] || "09:00";
      const closingHours = columns[8] || "22:00";
      const imageUrl = columns[9] || "";

      const lat = normalizeLatitude(rawLat);
      const lng = normalizeLongitude(rawLng);

      const id = `facility-${i}`;

      facilities.push({
        id,
        name,
        type,
        city,
        district,
        address,
        lat,
        lng,
        openingHours,
        closingHours,
        imageUrl
      });
    }

    // Save to Cache file as robust persistence
    fs.writeFileSync(CACHE_FILE, JSON.stringify(facilities, null, 2), "utf-8");
    console.log(`Parsed ${facilities.length} entries successfully and cached to file.`);
    return facilities;
  } catch (error) {
    console.error("Error fetching/parsing online Google Sheets data:", error);
    // If we have a cached version, load it!
    if (fs.existsSync(CACHE_FILE)) {
      console.log("Loading backed-up cached facilities from file due to fetch failure...");
      try {
        const cachedData = fs.readFileSync(CACHE_FILE, "utf-8");
        return JSON.parse(cachedData);
      } catch (err) {
        console.error("Failed to read local cache file:", err);
      }
    }
    return [];
  }
}

// API Routes
app.get("/api/facilities", async (req, res) => {
  try {
    // If local cache doesn't exist or is requested to renew, we fetch again.
    // Otherwise, let's load from cache file directly for blazing-fast speed.
    let facilities: Facility[] = [];
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const fileContent = fs.readFileSync(CACHE_FILE, "utf-8");
        facilities = JSON.parse(fileContent);
        // Async update cache in background
        fetchAndParseFacilities().catch(err => console.error("Background cache refresh failed:", err));
      } catch (e) {
        console.error("Error reading cache file, performing live fetch:", e);
        facilities = await fetchAndParseFacilities();
      }
    } else {
      facilities = await fetchAndParseFacilities();
    }
    res.json(facilities);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get facilities list", message: err.message });
  }
});

app.post("/api/facilities/refresh", async (req, res) => {
  try {
    const facilities = await fetchAndParseFacilities();
    res.json({ success: true, count: facilities.length, facilities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  // Pre-seed cache on startup
  fetchAndParseFacilities().catch(err => {
    console.error("Startup cache seeding failed:", err);
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
