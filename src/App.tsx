import { useState, useEffect } from "react";
import { Page, Facility } from "./types";
import LandingPage from "./components/LandingPage";
import MapPageLayout from "./components/MapPageLayout";
import { motion, AnimatePresence } from "motion/react";
import { Utensils } from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      
      const data = await res.json();
      
      // If it has "facilities" because it's a refresh action response
      const list = Array.isArray(data) ? data : (data.facilities || []);
      setFacilities(list);
    } catch (err: any) {
      console.error("Failed to load facilities:", err);
      setError("Sosyal tesis listesi yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.");
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
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center text-white font-sans">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center mb-6"
        >
          <Utensils className="w-6 h-6 text-emerald-400" />
        </motion.div>
        
        <h2 className="text-xl font-bold font-display tracking-wide mb-2 animate-pulse">
          İstanbul Sosyal Tesis ve Restoranları Verisi Hazırlanıyor
        </h2>
        <p className="text-slate-400 text-xs text-center max-w-sm">
          Google Sheets güncel verileri çekiliyor ve koordinatlar önbellekten optimize ediliyor...
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
