import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Clock, ArrowLeft, RefreshCw, Compass, SlidersHorizontal, Map, ChevronRight, Navigation, Heart, Share2, Copy, Check, ExternalLink, Info, Phone, X, Sun, Moon, Globe } from "lucide-react";
import { Facility, FilterState, getFacilityCategory } from "../types";
import MapComponent from "./MapComponent";
import InteractiveLogo from "./InteractiveLogo";
import { translations, Language } from "../translations";

interface MapPageLayoutProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility | null) => void;
  onBackToLanding: () => void;
  onRefreshData: () => Promise<void>;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function MapPageLayout({
  facilities,
  selectedFacility,
  onSelectFacility,
  onBackToLanding,
  onRefreshData,
  isLoading,
  language,
  onLanguageChange,
}: MapPageLayoutProps) {
  const t = translations[language];
  // Local Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "Tümü",
    city: "Tümü",
    onlyFavorites: false,
    onlyOpenNow: false,
  });

  // Dark/Light Theme state (Sabah / Gece Modu)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      return saved === "dark";
    } catch {
      return false;
    }
  });

  // Sync theme preference on change
  useEffect(() => {
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err) {
      console.error("Tema kayıt hatası:", err);
    }
  }, [isDarkMode]);

  // Load favorites from local storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (err) {
      console.error("Local storage error:", err);
    }
  }, [favorites]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent clicking card / selecting facility
    }
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Dynamically find popular cities in our dataset to show as quick click suggestion tags
  const popularCities = useMemo(() => {
    const counts: { [key: string]: number } = {};
    facilities.forEach(f => {
      if (f.city && f.city !== "Tümü") {
        counts[f.city] = (counts[f.city] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  }, [facilities]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Routing and directions state
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);
  const [routeStats, setRouteStats] = useState<{ distance: number; duration: number } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Extra UI States for Detailed Bottom Sheet
  const [addressCopied, setAddressCopied] = useState(false);
  const [facilityShared, setFacilityShared] = useState(false);

  // Reset states when selected facility is changed or deselected
  useEffect(() => {
    setRoutePolyline(null);
    setRouteStats(null);
    setRouteError(null);
    setAddressCopied(false);
    setFacilityShared(false);
  }, [selectedFacility]);

  // Helper to translate facility types on the fly
  const getTranslatedTypeTab = (typeStr: string) => {
    if (typeStr === "Tümü") return t.allCategoriesTab;
    if (typeStr === "Sosyal Tesis") return t.catSocialFacility;
    if (typeStr === "Öğrenci Restoranı" || typeStr.toLowerCase().includes("kent lokantası") || typeStr.toLowerCase().includes("öğrenci")) return t.catStudentRestaurant;
    if (typeStr === "Sosyal Kafe" || typeStr.toLowerCase().includes("kafe") || typeStr.toLowerCase().includes("nevmekan")) return t.catSocialCafe;
    return typeStr;
  };

  // Copy to clipboard helper
  const handleCopyAddress = (address: string) => {
    try {
      navigator.clipboard.writeText(address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      console.error("Adres kopyalanamadı:", err);
    }
  };

  // Share facility helper
  const handleShareFacility = (facility: Facility) => {
    const districtHeader = language === "tr" ? "İlçe" : "District";
    const addressHeader = language === "tr" ? "Adres" : "Address";
    const locationHeader = language === "tr" ? "Konum" : "Location";
    const text = `${facility.name} - ${getTranslatedTypeTab(facility.type)}\n${districtHeader}: ${facility.district}\n${addressHeader}: ${facility.address}\n${locationHeader}: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.name} ${facility.district} ${facility.city || "Istanbul"}`)}`;
    try {
      if (navigator.share) {
        navigator.share({
          title: facility.name,
          text: text,
          url: window.location.href,
        }).catch((e) => console.log('Share canceled', e));
      } else {
        navigator.clipboard.writeText(text);
        setFacilityShared(true);
        setTimeout(() => setFacilityShared(false), 2000);
      }
    } catch (err) {
      console.error("Paylaşılamadı:", err);
    }
  };

  // Check if a facility is open right now
  const getOpenStatus = (opening: string, closing: string) => {
    try {
      if (!opening || !closing) return { isOpen: true, text: t.statusActiveDefault };
      
      const now = new Date();
      // Turkish time zone buffer or simple local time check is perfect
      const currentMin = now.getHours() * 60 + now.getMinutes();

      const parseTimeToMinutes = (timeStr: string) => {
        const parts = timeStr.trim().split(":").map(Number);
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
        return parts[0] * 60 + parts[1];
      };

      const startMin = parseTimeToMinutes(opening);
      const endMin = parseTimeToMinutes(closing);

      if (endMin > startMin) {
        if (currentMin >= startMin && currentMin < endMin) {
          return { isOpen: true, text: `${t.statusOpenLabel}${closing}` };
        } else {
          return { isOpen: false, text: `${t.statusClosedLabel}${opening}` };
        }
      } else {
        // Overlay midnight transition support (e.g. 22:00 to 02:00)
        if (currentMin >= startMin || currentMin < endMin) {
          return { isOpen: true, text: `${t.statusOpenLabel}${closing}` };
        } else {
          return { isOpen: false, text: `${t.statusClosedLabel}${opening}` };
        }
      }
    } catch {
      return { isOpen: true, text: t.statusActiveDefault };
    }
  };

  // Capture user GPS location for routing
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setRouteError(t.noGPS);
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setRouteError(t.cannotGetLocation);
        setIsGettingLocation(false);
      }
    );
  };

  // Format routing distance helper
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Format routing time duration helper
  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      const hoursStr = language === "tr" ? "sa" : "hr";
      const minsStr = language === "tr" ? "dk" : "min";
      return `${hrs} ${hoursStr} ${remainingMins} ${minsStr}`;
    }
    const minsStr = language === "tr" ? "dk" : "min";
    return `${mins} ${minsStr}`;
  };

  // Perform OSM Routing query and parse coordinates
  const calculateRoute = async (userLoc: [number, number], facility: Facility) => {
    setIsCalculatingRoute(true);
    setRouteError(null);
    try {
      const [userLat, userLng] = userLoc;
      const { lat: facLat, lng: facLng } = facility;
      
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${facLng},${facLat}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error(language === "tr" ? "Rota servisine ulaşılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin." : "Inaccessible routing server. Please verify your internet connection and retry.");
      }
      
      const data = await response.json();
      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error(t.routeNoPathError);
      }
      
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]) as [number, number][];
      
      setRoutePolyline(coords);
      setRouteStats({
        distance: route.distance,
        duration: route.duration,
      });
    } catch (err: any) {
      console.error("OSRM Routing Error:", err);
      setRouteError(err.message || (language === "tr" ? "Yol tarifi hesaplanırken beklenmedik bir hata oluştu." : "An unexpected error occurred while calculating the route."));
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Fetch location (if not available) and draw the route path
  const handleDrawRoute = (facility: Facility) => {
    if (userLocation) {
      calculateRoute(userLocation, facility);
    } else {
      if (!navigator.geolocation) {
        setRouteError(t.noGPS);
        return;
      }
      setIsGettingLocation(true);
      setRouteError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsGettingLocation(false);
          calculateRoute([latitude, longitude], facility);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setRouteError(language === "tr" ? "Konum izinleri engellenmiş veya alınamadı. Rota çizebilmek için konum izni vermeniz gerekir." : "Location permission blocked or failed. Geolocation is required to trace paths.");
          setIsGettingLocation(false);
        }
      );
    }
  };

  // Extract unique cities (iller) for dropdown filter list dynamically from facilities on the map, sorted in Turkish alphabet order
  const uniqueCities = useMemo(() => {
    const cities = facilities.map((f) => f.city).filter(Boolean);
    const unique = Array.from(new Set(cities));
    return ["Tümü", ...unique.sort((a, b) => a.localeCompare(b, "tr"))];
  }, [facilities]);

  // Extract unique facility types for quick buttons
  const facilityTypes = ["Tümü", "Sosyal Tesis", "Öğrenci Restoranı", "Sosyal Kafe"];

  // Normalize search values
  const normalizedSearch = filters.search.toLowerCase().trim();

  // Filter facilities based on Search query, Category, City, and Favorites
  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      // 0. Favorites filter
      if (filters.onlyFavorites && !favorites.includes(fac.id)) {
        return false;
      }

      // 0b. Open Now filter
      if (filters.onlyOpenNow) {
        const status = getOpenStatus(fac.openingHours, fac.closingHours);
        if (!status.isOpen) {
          return false;
        }
      }

      // 1. Search text filter (matches Name, Address, City, or District)
      const matchesSearch =
        normalizedSearch === "" ||
        fac.name.toLowerCase().includes(normalizedSearch) ||
        fac.district.toLowerCase().includes(normalizedSearch) ||
        fac.city.toLowerCase().includes(normalizedSearch) ||
        fac.address.toLowerCase().includes(normalizedSearch);

      // 2. Category filter
      let matchesType = true;
      if (filters.type !== "Tümü") {
        matchesType = getFacilityCategory(fac.type) === filters.type;
      }

      // 3. City filter
      const matchesCity = filters.city === "Tümü" || fac.city === filters.city;

      return matchesSearch && matchesType && matchesCity;
    });
  }, [facilities, filters, favorites, normalizedSearch]);

  return (
    <div className={`flex flex-col h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`} id="map-page-container">
      {/* Navbar Map Header */}
      <header className={`h-14 md:h-16 px-3 md:px-6 shrink-0 flex items-center justify-between shadow-xs z-20 border-b transition-colors duration-305 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onBackToLanding}
            className={`p-1.5 md:p-2 border active:scale-95 transition-all rounded-xl flex items-center justify-center cursor-pointer mr-0.5 md:mr-1 ${
              isDarkMode 
                ? "border-slate-705 bg-slate-800 hover:bg-slate-700 text-slate-200" 
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            }`}
            title={t.backButton}
          >
            <ArrowLeft className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </button>
          
          <div 
            className="flex items-center gap-2 active:scale-98 transition duration-150" 
            onClick={onBackToLanding} 
            title={language === "tr" ? "Ana Sayfaya Dön" : "Go to Home Page"}
          >
            <InteractiveLogo language={language} isDarkMode={isDarkMode} />
            <span className={`hidden md:inline-block ml-0.5 text-xs px-2 py-0.5 rounded-md font-semibold border shrink-0 ${
              isDarkMode 
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-900/60" 
                : "bg-indigo-50 text-indigo-700 border-indigo-150"
            }`}>{t.guideLabel}</span>
          </div>
          
          <div className="hidden lg:block ml-2 border-l pl-3 border-slate-200 dark:border-slate-800 text-left">
            <p className={`text-[10px] leading-tight font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {filteredFacilities.length} {language === "tr" ? "Mekan bulundu" : "Venues found"}
            </p>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              {language === "tr" ? "Canlı Harita" : "Live Map"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Universal Language Switcher Toggle */}
          <button
            onClick={() => onLanguageChange(language === "tr" ? "en" : "tr")}
            className={`flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs font-bold border transition duration-305 cursor-pointer active:scale-95 ${
              isDarkMode
                ? "bg-slate-850 hover:bg-slate-800 text-slate-350 border-slate-705"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-805 border-indigo-150"
            }`}
            title={language === "tr" ? "English" : "Türkçe"}
          >
            <Globe className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-650" />
            <span className="text-[11px] md:text-xs">{language === "tr" ? "EN" : "TR"}</span>
          </button>

          {/* Theme switcher toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs font-bold border transition-all duration-305 cursor-pointer select-none active:scale-95 ${
              isDarkMode
                ? "bg-slate-800 text-amber-400 border-slate-705 hover:bg-slate-750 hover:text-amber-305 shadow-sm"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
            }`}
            title={isDarkMode ? (language === "tr" ? "Sabah Moduna Geç" : "Switch to Day Mode") : (language === "tr" ? "Gece Moduna Geç" : "Switch to Night Mode")}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.morningMode}</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-600 fill-amber-500/10" />
                <span className="hidden sm:inline">{t.nightMode}</span>
              </>
            )}
          </button>

          {/* Geolocation Button */}
          <button
            onClick={handleGetUserLocation}
            className={`flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs font-bold border transition ${
              userLocation
                ? isDarkMode
                  ? "bg-indigo-950/60 text-indigo-350 border-indigo-800/80"
                  : "bg-blue-50 text-blue-705 border-blue-200"
                : isDarkMode
                  ? "bg-slate-800 hover:bg-slate-705 text-slate-200 border-slate-705"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
            disabled={isGettingLocation}
          >
            <Navigation className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isGettingLocation ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {isGettingLocation ? t.drawRouteGettingGPS : (userLocation ? t.myLocationActive : t.findMyLocation)}
            </span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefreshData}
            disabled={isLoading}
            className={`flex items-center justify-center p-1.5 md:p-2 rounded-xl border transition ${
              isDarkMode
                ? "border-slate-705 bg-slate-800 text-slate-250 hover:bg-slate-700 hover:text-indigo-400"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-650"
            }`}
            title={language === "tr" ? "Yenile (Google Sheets'ten Çek)" : "Sync (Fetch from Google Sheets)"}
          >
            <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        {/* Sidebar Panel - Left pane */}
        <div className={`w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r flex flex-col h-[40vh] lg:h-full shrink-0 shadow-sm z-10 overflow-hidden transition-colors duration-300 ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {/* Quick Filters and Search - Interactive Refinements */}
          <div className={`p-3 md:p-4 border-b shrink-0 space-y-2.5 md:space-y-4 transition-colors duration-300 ${
            isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
          }`}>
            
            {/* Search Input with Focus Indicators */}
            <div className="relative group">
              <Search className={`w-3.5 h-3.5 md:w-4 md:h-4 absolute left-3 md:left-3.5 top-3 md:top-3.5 transition-colors duration-300 ${
                isSearchFocused 
                  ? "text-indigo-505 shadow-sm" 
                  : isDarkMode ? "text-slate-500" : "text-slate-400"
              }`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={filters.search}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className={`w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-2.5 rounded-xl border text-xs md:text-sm transition-all duration-300 focus:outline-none ${
                  isDarkMode
                    ? `bg-slate-800/60 border-slate-700/60 focus:bg-slate-800 focus:border-indigo-400 text-slate-100 placeholder:text-slate-505 ${
                        isSearchFocused ? "ring-4 ring-indigo-500/20" : ""
                      }`
                    : `bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-slate-250/80 text-slate-850 ${
                        isSearchFocused ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm" : "shadow-xs"
                      }`
                }`}
              />
              <AnimatePresence>
                {filters.search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    className={`absolute right-3 top-2 lg:top-2.5 p-1.5 rounded-full transition cursor-pointer ${
                      isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Popular Shortcut Search Tags - dynamically adjusted */}
            {popularCities.length > 0 && (
              <div className={`flex flex-col gap-1.5 border rounded-xl p-2 md:p-3 animate-fade-in transition-colors duration-300 ${
                isDarkMode ? "bg-slate-800/40 border-slate-805" : "bg-slate-50/55 border-slate-150/40"
              }`}>
                <span className={`text-[9px] md:text-[9.5px] font-extrabold tracking-wider uppercase ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{t.popularDistrictsLabel}</span>
                <div className="flex gap-1 md:gap-1.5 flex-wrap">
                  {popularCities.map((cty) => {
                    const isSelected = filters.city === cty;
                    return (
                      <button
                        key={cty}
                        onClick={() => setFilters((prev) => ({ ...prev, city: isSelected ? "Tümü" : cty }))}
                        className={`text-[10px] md:text-[10.5px] font-bold px-2 md:px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : isDarkMode
                              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-slate-605 text-slate-300 hover:text-slate-100"
                              : "bg-white hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-150 text-slate-600 hover:text-indigo-700"
                        }`}
                      >
                        📍 {cty}
                      </button>
                    );
                  })}
                  {filters.city !== "Tümü" && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, city: "Tümü" }))}
                      className={`text-[10px] md:text-[10.5px] font-extrabold px-2 py-1 border rounded-lg transition-all cursor-pointer ${
                        isDarkMode
                          ? "bg-rose-955/40 text-rose-300 border-rose-900/60 hover:bg-rose-900/30"
                          : "bg-rose-50 text-rose-600 border-rose-150 hover:bg-rose-105"
                      }`}
                    >
                      {t.clearFilters}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Filters Row with Interactive states */}
            <div className="flex flex-col gap-1.5 md:gap-2.5 pt-0.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{t.filterDistricts}</span>
                
                {filters.search || filters.type !== "Tümü" || filters.city !== "Tümü" || filters.onlyFavorites || filters.onlyOpenNow ? (
                  <button
                    onClick={() => setFilters({ search: "", type: "Tümü", city: "Tümü", onlyFavorites: false, onlyOpenNow: false })}
                    className={`text-xs font-extrabold cursor-pointer transition active:scale-95 px-2 py-0.5 rounded-md ${
                      isDarkMode
                        ? "text-rose-400 hover:text-rose-350 hover:bg-rose-950/20"
                        : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    {t.quickFilters}
                  </button>
                ) : null}
              </div>

              <div className="flex gap-1 md:gap-1.5 flex-wrap items-center">
                <button
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className={`flex items-center gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl text-[11px] md:text-xs font-bold border transition duration-200 cursor-pointer ${
                    showFiltersMobile || filters.city !== "Tümü"
                      ? isDarkMode
                        ? "bg-indigo-950/50 text-indigo-300 border-indigo-850 shadow-sm"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs"
                      : isDarkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60"
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>{filters.city !== "Tümü" ? `${language === "tr" ? "İl" : "City"}: ${filters.city}` : (language === "tr" ? "İller" : "Cities")}</span>
                </button>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, onlyOpenNow: !prev.onlyOpenNow }))}
                  className={`flex items-center gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl text-[11px] md:text-xs font-bold border transition duration-200 cursor-pointer select-none ${
                    filters.onlyOpenNow
                      ? isDarkMode
                        ? "bg-emerald-950/40 text-emerald-350 border-emerald-850 shadow-sm"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                      : isDarkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60"
                  }`}
                >
                  <Clock className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-all duration-300 ${filters.onlyOpenNow ? "text-emerald-500 scale-105 animate-pulse" : "text-slate-400"}`} />
                  <span>{t.filterOpenNow}</span>
                </button>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))}
                  className={`flex items-center gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl text-[11px] md:text-xs font-bold border transition duration-200 cursor-pointer select-none ${
                    filters.onlyFavorites
                      ? isDarkMode
                        ? "bg-rose-950/40 text-rose-350 border-rose-850 shadow-sm"
                        : "bg-rose-50 text-rose-600 border-rose-200 shadow-xs"
                      : isDarkMode
                        ? "bg-slate-800 hover:bg-slate-705 text-slate-300 border-slate-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60"
                  }`}
                >
                  <Heart className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-all duration-300 ${filters.onlyFavorites ? "fill-rose-500 text-rose-500 scale-105" : "text-slate-400"}`} />
                  <span>{t.filterFavorites} ({favorites.length})</span>
                </button>
              </div>
            </div>

            {/* City Selection Dropdown */}
            {(showFiltersMobile || filters.city !== "Tümü") && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-1.5 pb-0.5" 
                id="city-dropdown-container"
              >
                <label className={`block text-[10px] font-extrabold mb-1 uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{t.selectDistrict}</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                  className={`w-full text-xs border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition transition-colors ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-slate-205"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {uniqueCities.map((cty) => (
                    <option key={cty} value={cty}>
                      {cty === "Tümü" ? t.allDistricts : cty}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Quick Badges Category row */}
            <div className="flex gap-1 md:gap-1.5 overflow-x-auto pt-1 no-scrollbar shrink-0">
              {facilityTypes.map((tCategory) => {
                const isActive = filters.type === tCategory;
                return (
                  <button
                    key={tCategory}
                    onClick={() => setFilters((prev) => ({ ...prev, type: tCategory }))}
                    className={`whitespace-nowrap px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-xl text-[11px] md:text-xs font-bold transition duration-200 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500"
                        : isDarkMode
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-350"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getTranslatedTypeTab(tCategory)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Facilities Dynamic Smooth Listing List */}
          <div className={`flex-grow overflow-y-auto no-scrollbar h-full transition-colors duration-300 ${
            isDarkMode ? "bg-[#0f172a]/30 divide-y divide-slate-800/70" : "bg-slate-50/30 divide-y divide-slate-100"
          }`} id="facilities-list-scrollable">
            <AnimatePresence mode="popLayout">
              {filteredFacilities.length === 0 ? (
                <motion.div
                  key="no-results-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="p-8 text-center"
                  id="no-fac-found"
                >
                  <div className="text-4xl text-slate-350 mb-2.5">🍽️</div>
                  <p className={`text-sm font-bold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{t.noFacilitiesFound}</p>
                  <p className={`text-xs mt-1 pb-4 leading-relaxed ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{t.noFacilitiesSub}</p>
                </motion.div>
              ) : (
                filteredFacilities.map((fac) => {
                  const isSelected = selectedFacility?.id === fac.id;
                  const category = getFacilityCategory(fac.type);
                  
                  let cardBadgeStyle = isDarkMode
                    ? "bg-blue-955/40 text-blue-300 border-blue-900/50"
                    : "bg-blue-50 text-blue-700 border-blue-100";
                    
                  if (category === "Öğrenci Restoranı") {
                    cardBadgeStyle = isDarkMode
                      ? "bg-emerald-955/40 text-emerald-300 border-emerald-900/50"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100";
                  } else if (category === "Sosyal Kafe") {
                    cardBadgeStyle = isDarkMode
                      ? "bg-amber-955/40 text-amber-300 border-amber-900/50"
                      : "bg-amber-50 text-amber-700 border-amber-100";
                  }

                  const activeStatus = getOpenStatus(fac.openingHours, fac.closingHours);

                  let isSelectedStyle = "";
                  if (isSelected) {
                    if (category === "Öğrenci Restoranı") {
                      isSelectedStyle = isDarkMode
                        ? "bg-emerald-950/15 border-emerald-500 shadow-sm ring-1 ring-emerald-900/30 scale-[1.01]"
                        : "bg-emerald-50/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500/5 scale-[1.01]";
                    } else if (category === "Sosyal Kafe") {
                      isSelectedStyle = isDarkMode
                        ? "bg-amber-955/10 border-amber-500 shadow-sm ring-1 ring-amber-900/30 scale-[1.01]"
                        : "bg-amber-50/30 border-amber-500 shadow-xs ring-1 ring-amber-500/5 scale-[1.01]";
                    } else {
                      isSelectedStyle = isDarkMode
                        ? "bg-indigo-950/20 border-indigo-500 shadow-sm ring-1 ring-indigo-900/40 scale-[1.01]"
                        : "bg-indigo-50/50 border-indigo-600 shadow-xs ring-1 ring-indigo-500/5 scale-[1.01]";
                    }
                  } else {
                    isSelectedStyle = isDarkMode
                      ? "border-transparent hover:bg-slate-800/40 active:bg-slate-800/70"
                      : "border-transparent hover:bg-white active:bg-slate-100/40";
                  }

                  return (
                    <motion.div
                      key={fac.id}
                      layout="position"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.008 }}
                      transition={{ 
                        opacity: { duration: 0.2 },
                        y: { duration: 0.2 },
                        scale: { duration: 0.15 },
                        layout: { type: "spring", stiffness: 320, damping: 28 }
                      }}
                      onClick={() => onSelectFacility(fac)}
                      className={`p-3 md:p-4 text-left cursor-pointer transition-all duration-200 relative flex flex-row gap-2.5 md:gap-3.5 items-center justify-between border-l-4 border-y border-y-transparent ${isSelectedStyle}`}
                    >
                      <div className="flex-grow min-w-0 font-sans">
                        <div className="flex gap-1 md:gap-1.5 items-center mb-1 md:mb-1.5 flex-wrap justify-between pr-2">
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cardBadgeStyle}`}>
                              {getTranslatedTypeTab(fac.type)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isDarkMode
                                  ? "bg-slate-800 text-slate-350 border-slate-700/60"
                                  : "bg-slate-100 text-slate-600 border-slate-200/50"
                              }`}
                            >
                              {fac.district}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full ${activeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                          </div>

                          <button
                            onClick={(e) => toggleFavorite(fac.id, e)}
                            className={`p-1.5 rounded-full transition-colors duration-250 flex items-center justify-center cursor-pointer shadow-2xs border ${
                              isDarkMode
                                ? "bg-slate-805 hover:bg-slate-700 border-slate-700/80 text-slate-400 hover:text-rose-400"
                                : "bg-white hover:bg-rose-50 border-slate-100 text-slate-400 hover:text-rose-500"
                            }`}
                            title={favorites.includes(fac.id) ? (language === "tr" ? "Favorilerden Çıkar" : "Remove from Favorites") : (language === "tr" ? "Favorilere Ekle" : "Add to Favorites")}
                          >
                            <Heart 
                              className={`w-3.5 h-3.5 transition-all duration-300 ${
                                favorites.includes(fac.id) 
                                  ? "fill-rose-500 text-rose-500 scale-110" 
                                  : "text-slate-400 hover:text-rose-500"
                              }`} 
                            />
                          </button>
                        </div>
                        <h3 className={`font-bold text-sm leading-snug line-clamp-1 pr-1 ${
                          isDarkMode ? "text-slate-100" : "text-slate-900"
                        }`}>
                          {fac.name}
                        </h3>
                        <p className={`text-xs line-clamp-2 mt-1 mb-1.5 md:mb-2.5 leading-relaxed pr-2 ${
                          isDarkMode ? "text-slate-400" : "text-slate-505"
                        }`}>
                          {fac.address}
                        </p>

                        <div className={`flex items-center justify-between text-[11px] border-t pt-2 shrink-0 ${
                          isDarkMode ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-100"
                        }`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {language === "tr" ? "Saatler" : "Hours"}: <span className={`font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>{fac.openingHours || "09:00"} - {fac.closingHours || "22:00"}</span>
                          </span>
                          <span className={`font-bold group flex items-center gap-1 transition-colors uppercase text-[10px] tracking-wider ${
                            isSelected
                              ? category === "Öğrenci Restoranı"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : category === "Sosyal Kafe"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-indigo-650 dark:text-indigo-400"
                              : isDarkMode 
                              ? "text-indigo-405 hover:text-indigo-300" 
                              : "text-indigo-650 hover:text-indigo-805"
                          }`}>
                            {isSelected ? (
                              <span className="flex items-center gap-1.5 animate-pulse select-none">
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                  category === "Öğrenci Restoranı" 
                                    ? "bg-emerald-500" 
                                    : category === "Sosyal Kafe" 
                                    ? "bg-amber-500" 
                                    : "bg-indigo-500"
                                }`}></span>
                                {language === "tr" ? "Seçildi" : "Selected"}
                              </span>
                            ) : (
                              <>
                                {language === "tr" ? "İncele" : "Review"} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {fac.imageUrl && (
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 self-center shadow-xs border ${
                          isDarkMode ? "bg-slate-805 border-slate-800" : "bg-slate-101 border-slate-200/40"
                        }`}>
                          <img 
                            src={fac.imageUrl} 
                            alt={fac.name} 
                            className="w-full h-full object-cover select-none"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Stats Legend bottom widget */}
          <div className="p-3 md:p-4 bg-slate-900 text-white text-xs shrink-0 flex flex-col justify-center border-t border-slate-800">
            <div className="flex justify-between mb-1 md:mb-1.5 font-medium flex-wrap gap-1">
              <span className="text-slate-400">{t.filteredCount}</span>
              <span className="font-bold text-indigo-400">{filteredFacilities.length} / {facilities.length}</span>
            </div>
            <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, (filteredFacilities.length / Math.max(1, facilities.length)) * 105))}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 text-right font-mono">{t.ibblive}</span>
          </div>
        </div>

        {/* Map Viewport Area */}
        <div className="flex-grow h-[60vh] lg:h-full relative z-0 flex flex-col" id="map-viewport-section">
          {filteredFacilities.length > 0 && selectedFacility && (() => {
            const overlayCategory = getFacilityCategory(selectedFacility.type);
            
            let overlayBadgeStyle = isDarkMode
              ? "bg-blue-955/50 border-blue-900/50 text-blue-300"
              : "bg-blue-50 text-blue-700 border-blue-155";
              
            if (overlayCategory === "Öğrenci Restoranı") {
              overlayBadgeStyle = isDarkMode
                ? "bg-emerald-955/50 border-emerald-900/50 text-emerald-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-155";
            } else if (overlayCategory === "Sosyal Kafe") {
              overlayBadgeStyle = isDarkMode
                ? "bg-amber-955/50 border-amber-900/50 text-amber-300"
                : "bg-amber-50 text-amber-700 border-amber-155";
            }

            const status = getOpenStatus(selectedFacility.openingHours, selectedFacility.closingHours);

            return (
              /* Selected Facility responsive Bottom Sheet Drawer */
              <div 
                className={`absolute bottom-0 left-0 right-0 z-[1000] backdrop-blur-md rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border flex flex-col md:bottom-6 md:right-6 md:left-auto md:w-[440px] md:max-h-[85vh] max-h-[75vh] transition-all duration-305 ease-out overflow-hidden animate-slide-up ${
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-800 text-slate-150"
                    : "bg-white/95 border-slate-200/80 md:border-slate-100 text-slate-800"
                }`}
                id="facility-bottom-sheet"
              >
                {/* Drag Handle Indicator on mobile */}
                <div className={`w-12 h-1.5 rounded-full mx-auto my-3 shrink-0 block md:hidden cursor-pointer ${
                  isDarkMode ? "bg-slate-800 hover:bg-slate-750" : "bg-slate-200 hover:bg-slate-300"
                }`} />

                <div className="flex-grow overflow-y-auto" id="bottom-sheet-content">
                  {selectedFacility.imageUrl ? (
                    <div className="w-full h-44 sm:h-52 bg-slate-100 relative shrink-0">
                      <img
                        src={selectedFacility.imageUrl}
                        alt={selectedFacility.name}
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Floating Category/District badge labels on image cover */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${overlayBadgeStyle}`}>
                          {getTranslatedTypeTab(selectedFacility.type)}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-full border border-white/20 shadow-sm">
                          {selectedFacility.district}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative shrink-0 flex items-center justify-center">
                      <div className="text-white font-display text-4xl select-none">🏞️</div>
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${overlayBadgeStyle}`}>
                          {getTranslatedTypeTab(selectedFacility.type)}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-full border border-white/20 shadow-sm">
                          {selectedFacility.district}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-4 font-sans">
                    {/* Header: Title and primary close / bookmark buttons */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h2 className={`font-bold text-base sm:text-lg leading-snug tracking-tight text-left ${
                          isDarkMode ? "text-slate-100" : "text-slate-900"
                        }`}>
                          {selectedFacility.name}
                        </h2>
                        
                        {/* Live active / passive status check */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${status.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                          <span className={`text-xs font-semibold ${
                            status.isOpen 
                              ? isDarkMode ? "text-emerald-400 font-extrabold" : "text-emerald-700 font-bold"
                              : isDarkMode ? "text-rose-400 font-extrabold" : "text-rose-700 font-bold"
                          }`}>
                            {status.text}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <button
                          onClick={(e) => toggleFavorite(selectedFacility.id, e)}
                          className={`p-2 border rounded-lg transition-colors cursor-pointer shadow-xs ${
                            isDarkMode
                              ? "bg-slate-800 hover:bg-slate-705 border-slate-700 text-slate-350 hover:text-rose-400"
                              : "bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border-slate-200/60 text-slate-400 hover:border-rose-250"
                          }`}
                          title={favorites.includes(selectedFacility.id) ? (language === "tr" ? "Favorilerden Çıkar" : "Remove from Favorites") : (language === "tr" ? "Favorilere Ekle" : "Add to Favorites")}
                        >
                          <Heart
                            className={`w-4 h-4 transition-all duration-300 ${
                              favorites.includes(selectedFacility.id)
                                ? "fill-rose-500 text-rose-500 scale-105"
                                : "text-slate-400 active:scale-125"
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => onSelectFacility(null)}
                          className={`p-1.5 border rounded-lg transition-colors cursor-pointer shadow-xs ${
                            isDarkMode
                              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-100"
                              : "bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border-slate-200/60 text-slate-400"
                          }`}
                          title={language === "tr" ? "Kapat" : "Close"}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Detailed info card section */}
                    <div className="space-y-3.5">
                      {/* Copyable Address Info */}
                      <div className={`border rounded-xl p-3 flex items-start gap-2.5 relative group transition-colors ${
                        isDarkMode
                          ? "bg-slate-800/40 hover:bg-slate-850 border-slate-800/80"
                          : "bg-slate-50 hover:bg-slate-100/60 border border-slate-100/80"
                      }`}>
                        <MapPin className="w-4 h-4 text-indigo-505 shrink-0 mt-0.5" />
                        <div className="flex-grow pr-10 text-left">
                          <span className={`text-[10px] uppercase font-extrabold tracking-wider block mb-0.5 ${
                            isDarkMode ? "text-slate-500" : "text-slate-400"
                          }`}>{t.addressTitle}</span>
                          <p className={`text-xs leading-relaxed font-semibold pr-1 ${
                            isDarkMode ? "text-slate-200" : "text-slate-700"
                          }`}>{selectedFacility.address}</p>
                        </div>
                        <button
                          onClick={() => handleCopyAddress(selectedFacility.address)}
                          className={`absolute top-2.5 right-2.5 p-1.5 border rounded-lg transition-all cursor-pointer shadow-xs ${
                            isDarkMode
                              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-450 hover:text-indigo-400"
                              : "bg-white hover:bg-indigo-50 border-slate-200/60 text-slate-450 hover:text-indigo-600"
                          }`}
                          title={language === "tr" ? "Adresi Kopyala" : "Copy Address"}
                        >
                          {addressCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Info grid details */}
                      <div className="grid grid-cols-2 gap-2.5 text-left">
                        <div className={`rounded-xl p-3 flex items-center gap-2.5 border ${
                          isDarkMode ? "bg-slate-800/40 border-slate-800/80" : "bg-slate-50 border-slate-100"
                        }`}>
                          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                              isDarkMode ? "text-slate-500" : "text-slate-400"
                            }`}>{t.hoursTitle}</span>
                            <p className={`text-xs font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{selectedFacility.openingHours || "09:00"} - {selectedFacility.closingHours || "22:00"}</p>
                          </div>
                        </div>

                        <div className={`rounded-xl p-3 flex items-center gap-2.5 border ${
                          isDarkMode ? "bg-slate-800/40 border-slate-800/80" : "bg-slate-50 border-slate-100"
                        }`}>
                          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                              isDarkMode ? "text-slate-500" : "text-slate-400"
                            }`}>{t.typeTitle}</span>
                            <p className={`text-xs font-bold truncate max-w-[120px] ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{getTranslatedTypeTab(selectedFacility.type)}</p>
                          </div>
                        </div>

                        <div className={`rounded-xl p-3 flex items-center gap-2.5 border ${
                          isDarkMode ? "bg-slate-800/40 border-slate-800/80" : "bg-slate-50 border-slate-101"
                        }`}>
                          <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                              isDarkMode ? "text-slate-500" : "text-slate-400"
                            }`}>{t.cityDistrictTitle}</span>
                            <p className={`text-xs font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{selectedFacility.district} / {selectedFacility.city || "Istanbul"}</p>
                          </div>
                        </div>

                        <div className={`rounded-xl p-3 flex items-center gap-2.5 border ${
                          isDarkMode ? "bg-slate-800/40 border-slate-800/80" : "bg-slate-50 border-slate-101"
                        }`}>
                          <div className="w-full">
                            <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                              isDarkMode ? "text-slate-500" : "text-slate-400"
                            }`}>{t.coordinateTitle}</span>
                            <p className={`text-[10.5px] font-mono font-bold mt-0.5 ${isDarkMode ? "text-slate-350" : "text-slate-700"}`}>{selectedFacility.lat.toFixed(5)}, {selectedFacility.lng.toFixed(5)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic copyable/shareable link */}
                      <button
                        onClick={() => handleShareFacility(selectedFacility)}
                        className={`flex items-center justify-center gap-2 text-xs py-2.5 px-4 border rounded-xl font-bold transition duration-200 cursor-pointer w-full select-none ${
                          isDarkMode
                            ? "border-indigo-900/60 bg-indigo-950/25 hover:bg-indigo-950/45 text-indigo-300"
                            : "border-indigo-150 bg-indigo-50/20 hover:bg-indigo-50/60 text-indigo-700 hover:text-indigo-800"
                        }`}
                      >
                        {facilityShared ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
                            <span className="text-emerald-400">{t.shareCopiedText}</span>
                          </>
                        ) : (
                          <>
                            <Share2 className={`w-4 h-4 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                            <span>{t.shareText}</span>
                          </>
                        )}
                      </button>

                      <div className={`border-t pt-3.5 flex flex-col gap-3 text-left ${
                        isDarkMode ? "border-slate-800" : "border-slate-100/80"
                      }`}>
                        <span className={`text-[10px] uppercase font-extrabold tracking-wider block ${
                          isDarkMode ? "text-slate-500" : "text-slate-450"
                        }`}>{t.navigationHeading}</span>

                        {/* Routing status / stats display */}
                        {isCalculatingRoute && (
                          <div className={`text-xs rounded-xl p-3 flex items-center justify-center gap-2 font-bold animate-pulse border ${
                            isDarkMode
                              ? "bg-indigo-950/30 text-indigo-300 border-indigo-900/60"
                              : "text-indigo-700 bg-indigo-50 border-indigo-150"
                          }`}>
                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                            {t.routeLoading}
                          </div>
                        )}

                        {routeError && (
                          <div className={`text-xs rounded-xl p-2.5 font-medium border ${
                            isDarkMode
                              ? "bg-red-950/30 text-red-300 border-red-900/40"
                              : "text-red-700 bg-red-50 border-red-150"
                          }`}>
                            ⚠️ {language === "tr" ? "Geri bildirim:" : "Feedback:"} {routeError}
                          </div>
                        )}

                        {routePolyline && routeStats && (
                          <div className={`text-xs rounded-xl p-3 flex flex-col gap-1 shadow-xs border ${
                            isDarkMode
                              ? "bg-emerald-955/35 border-emerald-900/40 text-emerald-300"
                              : "bg-emerald-50 border-emerald-150 text-emerald-800"
                          }`}>
                            <div className="flex justify-between items-center font-bold">
                              <span>🗺️ {t.routeSuccessTitle}</span>
                              <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">{t.routeActiveTag}</span>
                            </div>
                            <div className={`flex gap-4 mt-1 font-semibold p-2 rounded-lg border ${
                              isDarkMode
                                ? "bg-slate-850/50 border-emerald-950/40 text-slate-350"
                                : "bg-white/50 border-emerald-100/50 text-slate-700"
                            }`}>
                              <span className="flex items-center gap-1 text-xs">
                                🚗 {t.routeDistance}: <span className={`${isDarkMode ? "text-white" : "text-slate-900"} font-bold`}>{formatDistance(routeStats.distance)}</span>
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                ⏱️ {t.routeDuration}: <span className={`${isDarkMode ? "text-white" : "text-slate-900"} font-bold`}>{formatDuration(routeStats.duration)}</span>
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          {routePolyline ? (
                            <button
                              onClick={() => {
                                  setRoutePolyline(null);
                                  setRouteStats(null);
                              }}
                              className={`w-full text-center text-xs py-2.5 rounded-xl font-bold transition duration-200 cursor-pointer ${
                                isDarkMode
                                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
                                  : "bg-slate-150 hover:bg-slate-200 hover:text-slate-950 text-slate-700"
                              }`}
                            >
                              {t.clearRouteBtn}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDrawRoute(selectedFacility)}
                              disabled={isCalculatingRoute || isGettingLocation}
                              className="w-full text-center text-xs py-2.5 bg-indigo-600 hover:bg-indigo-705 disabled:opacity-50 text-white rounded-xl font-bold transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10 animate-pulse-subtle"
                            >
                              <Navigation className="w-3.5 h-3.5 fill-current rotate-45" />
                              {isGettingLocation ? t.drawRouteGettingGPS : t.drawRouteBtn}
                            </button>
                          )}

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              selectedFacility.name + " " + selectedFacility.district + " " + (selectedFacility.city || "Istanbul")
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`w-full py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 border text-[11px] font-bold ${
                              isDarkMode
                                ? "bg-slate-800 hover:bg-slate-700 border-slate-705 text-slate-200 hover:text-white"
                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900 shadow-2xs"
                            }`}
                            title={t.openGoogleMapsTitle}
                          >
                            <span className="text-sm select-none">🗺️</span>
                            <span>{language === "tr" ? "Google Haritalar'da Aç" : "Open in Google Maps"}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Status color indicator legend on map */}
          <div className={`absolute bottom-5 left-5 z-[500] backdrop-blur-md px-3 py-2 rounded-xl shadow-md border hidden sm:flex flex-col gap-1.5 pointer-events-none transition-colors duration-300 ${
            isDarkMode
              ? "bg-slate-900/95 border-slate-800 text-slate-200"
              : "bg-white/95 border-slate-200/60 text-slate-705"
          }`}>
            <span className={`text-[9px] uppercase font-bold tracking-wider ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}>{t.mapIndicatorTitle}</span>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span> <span>🍽️ {t.indicatorSocialFacility}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block"></span> <span>🥣 {t.indicatorStudentRestaurant}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span> <span>☕ {t.indicatorSocialCafe}</span>
            </div>
          </div>

          <MapComponent
            facilities={filteredFacilities}
            selectedFacility={selectedFacility}
            onSelectFacility={onSelectFacility}
            userLocation={userLocation}
            routePolyline={routePolyline}
            isDarkMode={isDarkMode}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
