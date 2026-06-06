import { motion } from "motion/react";
import { Coffee, Map, Utensils, Award, Clock, Compass, Heart } from "lucide-react";
import { Facility } from "../types";

interface LandingPageProps {
  onExploreClick: () => void;
  featuredFacilities: Facility[];
  onSelectFeatured: (facility: Facility) => void;
}

export default function LandingPage({
  onExploreClick,
  featuredFacilities,
  onSelectFeatured,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800" id="landing-container">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white min-h-[90vh] flex flex-col justify-center items-center px-4 py-16 text-center">
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
            İstanbul Büyükşehir & İlçe Rehberi
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight leading-[1.1] mb-6 sm:px-4">
            Hesaplı Gezinti: <span className="text-emerald-400">İstanbul Sosyal Tesis & Lokantaları</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            İstanbul genelindeki bütçe dostu, lezzetli, temiz, sağlıklı belediye sosyal tesislerini ve
            öğrencilerin favorisi Kent Lokantalarını interaktif harita ile keşfedin!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onExploreClick}
              className="group relative flex items-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-98 transition duration-200 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Map className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Haritada Keşfetmeye Başla
            </button>
            <a
              href="#facilities-section"
              className="flex items-center justify-center gap-1.5 px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-medium text-lg rounded-xl border border-white/10 hover:border-white/20 transition duration-200 w-full sm:w-auto"
            >
              Kategorileri İncele
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
            { value: "100+", label: "Aktif Mekan & Restoran", icon: Utensils, color: "text-emerald-400 bg-emerald-500/10" },
            { value: "39", label: "Tüm İstanbul İlçeleri", icon: Compass, color: "text-indigo-400 bg-indigo-500/10" },
            { value: "Saniyeler", label: "Hızlı Harita & GPS can", icon: Clock, color: "text-amber-400 bg-amber-500/10" },
            { value: "%100", label: "Doğrulanmış Koordinat", icon: Heart, color: "text-rose-400 bg-rose-500/10" },
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
            İstanbul'un Sosyal Tesis Ağını Tanıyın
          </h2>
          <p className="text-lg text-slate-600">
            Farklı konseptlerde hizmet sunan ve yüksek memnuniyet oranlarına sahip mekan kategorileri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Category Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">İBB Sosyal Tesisleri</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              İstanbul'un en güzel manzaralı korularında, sahillerinde ve tepelerinde konumlanan, yüksek kalite ve servis standartlarıyla bilinen aile restoranları. Çamlıca, Florya, Beykoz Koru gibi onlarca popüler destinasyon sizi bekliyor.
            </p>
            <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-lg w-max mb-4">
              ☕ Kalite & Manzara
            </div>
          </div>

          {/* Category Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Kent Lokantaları & Öğrenci Restoranları</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              Özellikle öğrenciler, emekliler ve çalışan vatandaşlar için son derece ekonomik, sağlıklı ve yüksek besleyici değerli 4 kap sıcak yemek menüsü sunan modern restoranlar. İstanbul'un merkez noktalarında yaygın ağ.
            </p>
            <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg w-max mb-4">
              🥣 Öğrenci Dostu & Sağlıklı
            </div>
          </div>

          {/* Category Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Sosyal Kafeler & Nevmekanlar</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              Zengin kütüphaneleri, çalışma salonları, tarihi atmosferleri ve taze kahve menüleriyle özellikle gençlerin vazgeçilmez sosyalleşme, ders çalışma ve kültür mekanları. Üsküdar Nevmekanlar gibi prestijli örnekler.
            </p>
            <div className="text-xs font-semibold text-amber-600 bg-amber-50 py-1.5 px-3 rounded-lg w-max mb-4">
              📚 Kütüphane & Çalışma Alanı
            </div>
          </div>
        </div>
      </div>

      {/* Featured Places Showcase */}
      {featuredFacilities.length > 0 && (
        <div className="bg-slate-100/50 py-20 border-t border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mb-2">
                  Popüler Sosyal Tesisler
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  İstanbul halkının en çok tercih ettiği, tescilli seçkin tesisler arasından tadımlık seçkiler.
                </p>
              </div>
              <button
                onClick={onExploreClick}
                className="mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition"
              >
                Tümünü Haritada Harika Gör
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFacilities.map((fac) => {
                let badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                if (fac.type.includes("Kent Lokantası") || fac.type.includes("Öğrenci")) {
                  badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                } else if (fac.type.includes("Kafe") || fac.type.includes("Nevmekan")) {
                  badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                }

                return (
                  <div
                    key={fac.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full hover:border-slate-300 transition group overflow-hidden"
                  >
                    {fac.imageUrl && (
                      <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                        <img
                          src={fac.imageUrl}
                          alt={fac.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex gap-2 items-center mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {fac.type}
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
                        <span>⏰ Çalışma Saatleri:</span>
                        <span className="font-semibold text-slate-700">
                          {fac.openingHours} - {fac.closingHours}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectFeatured(fac)}
                        className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition duration-200"
                      >
                        Konumu Göster ve İncele &rarr;
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
            Hesaplı Gezinti - İstanbul Sosyal Tesisler ve Öğrenci Restoranları Rehberi
          </p>
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} - Leaflet & OpenStreetMap ile İBB Entegrasyon Çalışması
          </p>
        </div>
      </footer>
    </div>
  );
}
