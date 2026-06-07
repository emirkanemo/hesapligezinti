import { motion } from "motion/react";
import { Coffee, Map, Utensils, Award, Clock, Compass, Heart, Globe } from "lucide-react";
import { Facility } from "../types";
import { translations, Language } from "../translations";
import InteractiveLogo from "./InteractiveLogo";

interface LandingPageProps {
  onExploreClick: () => void;
  featuredFacilities: Facility[];
  onSelectFeatured: (facility: Facility) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LandingPage({
  onExploreClick,
  featuredFacilities,
  onSelectFeatured,
  language,
  onLanguageChange,
}: LandingPageProps) {
  const t = translations[language];

  // Map database facility type to translated terms dynamically
  const getTranslatedType = (typeStr: string) => {
    const tStr = (typeStr || "").toLowerCase().trim();
    if (tStr.includes("öğrenci") || tStr.includes("kent lokantası") || tStr.includes("lokanta") || tStr.includes("restoran") || tStr.includes("yemek")) {
      return t.catStudentRestaurant;
    }
    if (tStr.includes("kafe") || tStr.includes("nevmekan") || tStr.includes("kafeterya") || tStr.includes("kütüphane") || tStr.includes("kahve")) {
      return t.catSocialCafe;
    }
    return t.catSocialFacility;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative" id="landing-container">
      {/* Premium Top Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 h-20 px-6 sm:px-12 flex items-center justify-between z-30 bg-transparent">
        {/* Left Side: Dynamic Interactive Logo */}
        <InteractiveLogo language={language} isDarkMode={true} size="md" />

        {/* Right Side: Language Switcher and CTA shortcut */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLanguageChange(language === "tr" ? "en" : "tr")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15 transition-all border border-white/10 backdrop-blur-md active:scale-95 cursor-pointer shadow-md select-none"
            title={language === "tr" ? "Translate to English" : "Türkçe diline çevir"}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-300" />
            <span>{language === "tr" ? "English" : "Türkçe"}</span>
          </button>
          
          <button
            onClick={onExploreClick}
            className="hidden sm:flex items-center gap-1.5 px-4.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/10 active:scale-95 transition duration-150 cursor-pointer select-none"
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t.ctaExplore}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white min-h-[95vh] flex flex-col justify-center items-center px-4 py-16 text-center">
        {/* Abstract shapes for visual style */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto z-10"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-6 backdrop-blur-sm">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            {t.guideBadge}
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight leading-[1.1] mb-6 sm:px-4">
            {t.heroTitle1}<span className="text-emerald-400">{t.heroTitleAccent}</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t.heroDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onExploreClick}
              className="group relative flex items-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-98 transition duration-200 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Map className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {t.ctaExplore}
            </button>
            <a
              href="#facilities-section"
              className="flex items-center justify-center gap-1.5 px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-medium text-lg rounded-xl border border-white/10 hover:border-white/20 transition duration-200 w-full sm:w-auto"
            >
              {t.ctaCategories}
            </a>
          </div>
        </motion.div>

        {/* Floating Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full mx-auto mt-16 sm:mt-24 px-4 z-10"
        >
          {[
            { value: t.statActiveValue, label: t.statActiveFacilities, icon: Utensils, color: "text-emerald-400 bg-emerald-500/10" },
            { value: t.statDistrictsValue, label: t.statDistricts, icon: Compass, color: "text-indigo-400 bg-indigo-500/10" },
            { value: t.statFastMapValue, label: t.statFastMap, icon: Clock, color: "text-amber-400 bg-amber-500/10" },
            { value: t.statVerifiedCoordsValue, label: t.statVerifiedCoords, icon: Heart, color: "text-rose-400 bg-rose-500/10" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/60 border border-white/5 backdrop-blur-md rounded-2xl p-5 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                <stat.icon className="w-5.5 h-5.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Categories Intro Section */}
      <div id="facilities-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 mb-4">
            {t.categoriesTitle}
          </h2>
          <p className="text-lg text-slate-600">
            {t.categoriesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Category Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{t.cat1Title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              {t.cat1Desc}
            </p>
            <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-lg w-max mb-4">
              {t.cat1Badge}
            </div>
          </div>

          {/* Category Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{t.cat2Title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              {t.cat2Desc}
            </p>
            <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg w-max mb-4">
              {t.cat2Badge}
            </div>
          </div>

          {/* Category Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{t.cat3Title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              {t.cat3Desc}
            </p>
            <div className="text-xs font-semibold text-amber-600 bg-amber-50 py-1.5 px-3 rounded-lg w-max mb-4">
              {t.cat3Badge}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Places Showcase */}
      {featuredFacilities.length > 0 && (
        <div className="bg-slate-100/50 py-20 border-t border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 text-left">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mb-2">
                  {t.featuredTitle}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  {t.featuredSubtitle}
                </p>
              </div>
              <button
                onClick={onExploreClick}
                className="mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
              >
                {t.featuredMapBtn}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFacilities.map((fac) => {
                let badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                const catTypeResolved = getTranslatedType(fac.type);
                
                if (fac.type.includes("Kent Lokantası") || fac.type.includes("Öğrenci")) {
                  badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                } else if (fac.type.includes("Kafe") || fac.type.includes("Nevmekan")) {
                  badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                }

                return (
                  <div
                    key={fac.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full hover:border-slate-300 transition group overflow-hidden text-left"
                  >
                    {fac.imageUrl && (
                      <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                        <img
                          src={fac.imageUrl}
                          alt={fac.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex gap-2 items-center mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {catTypeResolved}
                        </span>
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                          {fac.district}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2 font-display text-base">
                        {fac.name}
                      </h3>

                      <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-grow shrink-0 line-clamp-2">
                        📍 {fac.address}
                      </p>

                      <div className="text-slate-500 text-[11px] mb-4 border-t border-slate-50 pt-3 flex justify-between items-center">
                        <span>{t.openingHoursLabel}</span>
                        <span className="font-semibold text-slate-700">
                          {fac.openingHours} - {fac.closingHours}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectFeatured(fac)}
                        className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition duration-200 cursor-pointer"
                      >
                        {t.showOnMap}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modern, minimalist footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-medium font-display text-white text-base">
            {t.footerTitle}
          </p>
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} - {t.footerCopy}
          </p>
        </div>
      </footer>
    </div>
  );
}
