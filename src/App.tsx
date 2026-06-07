import { useState, useEffect } from "react";
import { Page, Facility } from "./types";
import LandingPage from "./components/LandingPage";
import MapPageLayout from "./components/MapPageLayout";
import { motion, AnimatePresence } from "motion/react";
import { Utensils, Globe } from "lucide-react";
import { translations, Language } from "./translations";

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4-Q2xzTPS_zlsMKJ4sMdP17Nb56u1eDEUJluu2gc1DnYxenXOclGqTKGSOEaRXBAXVHJfyQ6WJHBz/pub?output=csv";

// Client-side Coordinate Normalization Functions mirroring server.ts exactly
function normalizeLatitude(val: number): number {
  if (isNaN(val) || val === 0) return 41.0082; // İstanbul Default
  let lat = Math.abs(val);
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

async function fetchAndParseCSVClientSide(): Promise<Facility[]> {
  console.log("Vercel / Static fallback: Fetching Google Sheets CSV directly on client-side...");
  const res = await fetch(SPREADSHEET_URL);
  if (!res.ok) {
    throw new Error(`Google Sheets fetch failed with status: ${res.status}`);
  }
  const csvText = await res.text();
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length <= 1) {
    throw new Error("CSV contains no data or header only");
  }

  const facilities: Facility[] = [];

  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    if (columns.length < 5) continue;

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

  console.log(`Successfully parsed ${facilities.length} entries directly in browser fallback.`);
  return facilities;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Internationalization language state
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("language");
      return (saved === "en" || saved === "tr") ? saved as Language : "tr";
    } catch {
      return "tr";
    }
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem("language", lang);
    } catch (err) {
      console.error("Local storage language save failure:", err);
    }
  };

  const t = translations[language];

  // Fetch facilities list from backend Express API on mount
  const fetchFacilitiesData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoint = forceRefresh ? "/api/facilities/refresh" : "/api/facilities";
      const method = forceRefresh ? "POST" : "GET";
      
      console.log(`Sending API request to: ${endpoint}`);
      const res = await fetch(endpoint, { method });
      if (!res.ok) throw new Error(`API returned error status: ${res.status}`);
      
      // Look out for text/html response (Vercel automatic SPA routing returns index.html on missing API)
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        throw new Error("API route returned HTML instead of JSON. Assuming Vercel static deployment.");
      }

      const data = await res.json();
      
      // If it has "facilities" because it's a refresh action response
      const list = Array.isArray(data) ? data : (data.facilities || []);
      if (!list || list.length === 0) {
        throw new Error("No facilities returned from API");
      }
      setFacilities(list);
    } catch (err: any) {
      console.warn("Express backend API call failed or is unavailable in Vercel. Activating client-side Google Sheets fallback. Error:", err.message || err);
      try {
        const clientSideFacilities = await fetchAndParseCSVClientSide();
        setFacilities(clientSideFacilities);
      } catch (fallbackErr: any) {
        console.error("Direct Google Sheets CSV client-side fetch also failed:", fallbackErr);
        setError("Sosyal tesis listesi yüklenirken bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilitiesData();
  }, []);

  // Filter 3 popular features to display in Landing Page
  const featured = facilities
    .filter((f) =>
      ["Çamlıca Sosyal Tesisi", "Florya Sosyal Tesisleri", "Çapa Kent Lokantası", "Üsküdar Kent Lokantası"].includes(f.name)
    )
    .slice(0, 3);

  // Fallback featured if the initial CSV fetch is slow or offline
  const featuredList = featured.length > 0 ? featured : facilities.slice(0, 3);

  const handleSelectFeatured = (facility: Facility) => {
    setSelectedFacility(facility);
    setCurrentPage("map");
  };

  const handleRefresh = async () => {
    await fetchFacilitiesData(true);
  };

  if (isLoading && facilities.length === 0) {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center text-white font-sans relative">
         {/* Language switcher overlay in loading screen */}
         <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={() => handleSetLanguage(language === "tr" ? "en" : "tr")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15 transition-all active:scale-95 border border-white/10"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === "tr" ? "English" : "Türkçe"}</span>
            </button>
         </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center mb-6"
        >
          <Utensils className="w-6 h-6 text-emerald-400" />
        </motion.div>
        
        <h2 className="text-xl font-bold font-display tracking-wide mb-2 animate-pulse px-6 text-center">
          {t.loadingTitle}
        </h2>
        <p className="text-slate-400 text-xs text-center max-w-sm px-6 leading-relaxed">
          {t.loadingSubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen select-none">
      <AnimatePresence mode="wait">
        {currentPage === "landing" ? (
          <motion.div
            key="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LandingPage
              onExploreClick={() => setCurrentPage("map")}
              featuredFacilities={featuredList}
              onSelectFeatured={handleSelectFeatured}
              language={language}
              onLanguageChange={handleSetLanguage}
            />
          </motion.div>
        ) : (
          <motion.div
            key="map-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MapPageLayout
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={setSelectedFacility}
              onBackToLanding={() => {
                setSelectedFacility(null);
                setCurrentPage("landing");
              }}
              onRefreshData={handleRefresh}
              isLoading={isLoading}
              language={language}
              onLanguageChange={handleSetLanguage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
