export interface LanguageStrings {
  appName: string;
  guideBadge: string;
  guideLabel: string;
  loadingTitle: string;
  loadingSubtitle: string;
  backButton: string;
  searchPlaceholder: string;
  
  // Landing Page
  heroTitle1: string;
  heroTitleAccent: string;
  heroDescription: string;
  ctaExplore: string;
  ctaCategories: string;
  
  // Stats
  statActiveFacilities: string;
  statDistricts: string;
  statFastMap: string;
  statVerifiedCoords: string;
  statActiveValue: string;
  statDistrictsValue: string;
  statFastMapValue: string;
  statVerifiedCoordsValue: string;
  
  // Categories Intro
  categoriesTitle: string;
  categoriesSubtitle: string;
  
  cat1Title: string;
  cat1Desc: string;
  cat1Badge: string;
  
  cat2Title: string;
  cat2Desc: string;
  cat2Badge: string;
  
  cat3Title: string;
  cat3Desc: string;
  cat3Badge: string;
  
  // Featured Section
  featuredTitle: string;
  featuredSubtitle: string;
  featuredMapBtn: string;
  openingHoursLabel: string;
  showOnMap: string;
  footerTitle: string;
  footerCopy: string;

  // Map Page
  morningMode: string;
  nightMode: string;
  myLocationActive: string;
  findMyLocation: string;
  noGPS: string;
  cannotGetLocation: string;
  popularDistrictsLabel: string;
  clearFilters: string;
  quickFilters: string;
  filterDistricts: string;
  filterOpenNow: string;
  filterFavorites: string;
  selectDistrict: string;
  allDistricts: string;
  noFacilitiesFound: string;
  noFacilitiesSub: string;
  filteredCount: string;
  ibblive: string;
  
  // Bottom Sheet
  statusActiveDefault: string;
  statusOpenLabel: string;
  statusClosedLabel: string;
  addressTitle: string;
  hoursTitle: string;
  typeTitle: string;
  cityDistrictTitle: string;
  coordinateTitle: string;
  shareText: string;
  shareCopiedText: string;
  copiedSuccess: string;
  navigationHeading: string;
  routeLoading: string;
  routeNoPathError: string;
  routeSuccessTitle: string;
  routeActiveTag: string;
  routeDistance: string;
  routeDuration: string;
  clearRouteBtn: string;
  drawRouteBtn: string;
  drawRouteGettingGPS: string;
  openGoogleMapsTitle: string;
  mapIndicatorTitle: string;
  indicatorSocialFacility: string;
  indicatorStudentRestaurant: string;
  indicatorSocialCafe: string;
  hereLabel: string;
  yourLocationLabel: string;
  
  // Categories Table
  catSocialFacility: string;
  catStudentRestaurant: string;
  catSocialCafe: string;
  allCategoriesTab: string;
}

export type Language = "tr" | "en";

export const translations: Record<Language, LanguageStrings> = {
  tr: {
    appName: "HesaplıGezinti",
    guideBadge: "İstanbul Büyükşehir & İlçe Rehberi",
    guideLabel: "Rehberi",
    loadingTitle: "İstanbul Sosyal Tesis ve Restoranları Verisi Hazırlanıyor",
    loadingSubtitle: "Google Sheets güncel verileri çekiliyor ve koordinatlar önbellekten optimize ediliyor...",
    backButton: "Geri Dön",
    searchPlaceholder: "Tesis adı, ilçe veya adres ara...",
    
    // Landing Page
    heroTitle1: "Hesaplı Gezinti: ",
    heroTitleAccent: "İstanbul Sosyal Tesis & Lokantaları",
    heroDescription: "İstanbul genelindeki bütçe dostu, lezzetli, temiz, sağlıklı belediye sosyal tesislerini ve öğrencilerin favorisi Kent Lokantalarını interaktif harita ile keşfedin!",
    ctaExplore: "Haritada Keşfetmeye Başla",
    ctaCategories: "Kategorileri İncele",
    
    // Stats
    statActiveFacilities: "Aktif Mekan & Restoran",
    statDistricts: "Tüm İstanbul İlçeleri",
    statFastMap: "Hızlı Harita & GPS can",
    statVerifiedCoords: "Doğrulanmış Koordinat",
    statActiveValue: "105+",
    statDistrictsValue: "39",
    statFastMapValue: "Saniyeler",
    statVerifiedCoordsValue: "%100",
    
    // Categories Intro
    categoriesTitle: "İstanbul'un Sosyal Tesis Ağını Tanıyın",
    categoriesSubtitle: "Farklı konseptlerde hizmet sunan ve yüksek memnuniyet oranlarına sahip mekan kategorileri.",
    
    cat1Title: "İBB Sosyal Tesisleri",
    cat1Desc: "İstanbul'un en güzel manzaralı korularında, sahillerinde ve tepelerinde konumlanan, yüksek kalite ve servis standartlarıyla bilinen aile restoranları. Çamlıca, Florya, Beykoz Koru gibi onlarca popüler destinasyon sizi bekliyor.",
    cat1Badge: "☕ Kalite & Manzara",
    
    cat2Title: "Kent Lokantaları & Öğrenci Restoranları",
    cat2Desc: "Özellikle öğrenciler, emekliler ve çalışan vatandaşlar için son derece ekonomik, sağlıklı ve yüksek besleyici değerli 4 kap sıcak yemek menüsü sunan modern restoranlar. İstanbul'un merkez noktalarında yaygın ağ.",
    cat2Badge: "🥣 Öğrenci Dostu & Sağlıklı",
    
    cat3Title: "Sosyal Kafeler & Nevmekanlar",
    cat3Desc: "Zengin kütüphaneleri, çalışma salonları, tarihi atmosferleri ve taze kahve menüleriyle özellikle gençlerin vazgeçilmez sosyalleşme, ders çalışma ve kültür mekanları. Üsküdar Nevmekanlar gibi prestijli örnekler.",
    cat3Badge: "📚 Kütüphane & Çalışma Alanı",
    
    // Featured Section
    featuredTitle: "Popüler Sosyal Tesisler",
    featuredSubtitle: "İstanbul halkının en çok tercih ettiği, tescilli seçkin tesisler arasından tadımlık seçkiler.",
    featuredMapBtn: "Tümünü Haritada Harika Gör",
    openingHoursLabel: "⏰ Çalışma Saatleri:",
    showOnMap: "Konumu Göster ve İncele →",
    footerTitle: "Hesaplı Gezinti - İstanbul Sosyal Tesisler ve Öğrenci Restoranları Rehberi",
    footerCopy: "Leaflet & OpenStreetMap ile İBB Entegrasyon Çalışması",

    // Map Page
    morningMode: "Sabah Modu",
    nightMode: "Gece Modu",
    myLocationActive: "Konumum Aktif",
    findMyLocation: "Konumumu Bul",
    noGPS: "Cihazınızda GPS desteği bulunmuyor.",
    cannotGetLocation: "Konum bilgisi alınamadı. Lütfen tarayıcı izinlerinizi kontrol edin ve konumu etkinleştirin.",
    popularDistrictsLabel: "En Popüler İlçeler",
    clearFilters: "Kaldır",
    quickFilters: "Filtreleri Temizle",
    filterDistricts: "Hızlı Filtrele",
    filterOpenNow: "Şu An Açık",
    filterFavorites: "Favorilerim",
    selectDistrict: "İlçe Seçin",
    allDistricts: "Tüm İlçeler",
    noFacilitiesFound: "Kriterlerinize uygun tesis bulunamadı.",
    noFacilitiesSub: "Lütfen arama terimlerinizi veya filtrelerinizi sıfırlayın.",
    filteredCount: "Filtrelenen Mekan Eşleşmesi:",
    ibblive: "İBB Veri Portalı Canlı • V.2.0.4",
    
    // Bottom Sheet
    statusActiveDefault: "Hizmet Saatleri Aktif",
    statusOpenLabel: "Şu An Açık • Kapanış: ",
    statusClosedLabel: "Şu An Kapalı • Açılış: ",
    addressTitle: "Mekan Adresi",
    hoursTitle: "Hizmet Saatleri",
    typeTitle: "Tesis Türü",
    cityDistrictTitle: "Şehir / İlçe",
    coordinateTitle: "Koordinat",
    shareText: "Mekan Bilgilerini Arkadaşınla Paylaş",
    shareCopiedText: "Mekan Detayları Panoya Kopyalandı!",
    copiedSuccess: "Adres kopyalandı!",
    navigationHeading: "Navigasyon ve Rota Çizimi",
    routeLoading: "Gezinti Rotası Paketi Paketleniyor...",
    routeNoPathError: "Mevcut konumunuzdan bu mekana karayolu rotası bulunamadı.",
    routeSuccessTitle: "Haritada Yol Tarifi Çizildi",
    routeActiveTag: "Aktif",
    routeDistance: "Mesafe",
    routeDuration: "Süre",
    clearRouteBtn: "Rotayı Temizle",
    drawRouteBtn: "Haritada Rota Çiz",
    drawRouteGettingGPS: "Konum Alınıyor...",
    openGoogleMapsTitle: "Google Haritalar'da Dışarıya Aç",
    mapIndicatorTitle: "Harita Göstergesi",
    indicatorSocialFacility: "Sosyal Tesisler",
    indicatorStudentRestaurant: "Öğrenci Restoranları",
    indicatorSocialCafe: "Sosyal Kafeler",
    hereLabel: "Buradasınız",
    yourLocationLabel: "Sizin konumunuz",
    
    // Categories Table
    catSocialFacility: "Sosyal Tesis",
    catStudentRestaurant: "Öğrenci Restoranı",
    catSocialCafe: "Sosyal Kafe",
    allCategoriesTab: "Tümü",
  },
  en: {
    appName: "BudgetBreeze",
    guideBadge: "Istanbul Municipal & District Guide",
    guideLabel: "Guide",
    loadingTitle: "Preparing Istanbul Social Facilities & Restaurant Data",
    loadingSubtitle: "Fetching real-time Google Sheets data and optimizing coordinates from cache...",
    backButton: "Back",
    searchPlaceholder: "Search facility name, district or address...",
    
    // Landing Page
    heroTitle1: "Budget Breeze: ",
    heroTitleAccent: "Istanbul Municipal Facilities & Dining",
    heroDescription: "Explore budget-friendly, delicious, clean, and healthy municipal dining facilities and student-favorite Kent Restaurants across Istanbul on an interactive map!",
    ctaExplore: "Start Exploring on Map",
    ctaCategories: "View Categories",
    
    // Stats
    statActiveFacilities: "Active Venues & Restaurants",
    statDistricts: "All Istanbul Districts",
    statFastMap: "Fast Map & Real GPS",
    statVerifiedCoords: "Verified Coordinates",
    statActiveValue: "105+",
    statDistrictsValue: "39",
    statFastMapValue: "Seconds",
    statVerifiedCoordsValue: "100%",
    
    // Categories Intro
    categoriesTitle: "Discover Istanbul's Public Dining Network",
    categoriesSubtitle: "Different categories of venues serving with high customer satisfaction rates and low price tags.",
    
    cat1Title: "Metropolitan Social Cafeterias",
    cat1Desc: "Family restaurants located in the most beautiful viewpoints, forests, shores, and hills of Istanbul, known for high standards of quality and service. Tens of destinations like Camlica, Florya, Beykoz wait for you.",
    cat1Badge: "☕ Quality & Scenery",
    
    cat2Title: "Kent Kitchens & Student Restaurants",
    cat2Desc: "Modern dining halls offering nutritious 4-course set hot meals at highly affordable rates, particularly popular for students, retirees, and workers. Widely accessible network in downtown centers.",
    cat2Badge: "🥣 Student Friendly & Nutritious",
    
    cat3Title: "Social Cafes & Nevmekans",
    cat3Desc: "Libraries, co-working areas, and study rooms combined with fresh coffee service. Perfect socializing, studying, and culture environments for youth. Famous examples include Nevmekan Uskudar.",
    cat3Badge: "📚 Co-working & Library Space",
    
    // Featured Section
    featuredTitle: "Popular Public Facilities",
    featuredSubtitle: "Carefully selected venues heavily preferred by Istanbul residents.",
    featuredMapBtn: "See All beautifully on Map",
    openingHoursLabel: "⏰ Opening Hours:",
    showOnMap: "Show Location & Details →",
    footerTitle: "Budget Breeze - Istanbul Municipal Dining & Student Kitchens Directory",
    footerCopy: "Leaflet & OpenStreetMap Integrated with IMM Datasets Project",

    // Map Page
    morningMode: "Day Mode",
    nightMode: "Night Mode",
    myLocationActive: "GPS Active",
    findMyLocation: "Find My Location",
    noGPS: "Your device does not support GPS Geolocation.",
    cannotGetLocation: "Unable to find your location. Please check browser permissions and enable GPS services.",
    popularDistrictsLabel: "Popular Districts",
    clearFilters: "Clear",
    quickFilters: "Reset Filters",
    filterDistricts: "Quick Filters",
    filterOpenNow: "Open Now",
    filterFavorites: "My Favorites",
    selectDistrict: "Select District",
    allDistricts: "All Districts",
    noFacilitiesFound: "No facilities found matching your criteria.",
    noFacilitiesSub: "Please clear or update your search terms and filters.",
    filteredCount: "Matching Venues Found:",
    ibblive: "IMM Portal Live • V.2.0.4",
    
    // Bottom Sheet
    statusActiveDefault: "Active Hours In Effect",
    statusOpenLabel: "Open Now • Closes: ",
    statusClosedLabel: "Closed Now • Opens: ",
    addressTitle: "Venue Address",
    hoursTitle: "Working Hours",
    typeTitle: "Facility Type",
    cityDistrictTitle: "City / District",
    coordinateTitle: "Coordinate",
    shareText: "Share Venue Details with Friends",
    shareCopiedText: "Venue details copied to clipboard!",
    copiedSuccess: "Address copied!",
    navigationHeading: "Navigation & Wayfinding",
    routeLoading: "Compiling navigation path packages...",
    routeNoPathError: "Unable to compute drive route from your current location to this venue.",
    routeSuccessTitle: "Route Custom Guided on Map",
    routeActiveTag: "Active",
    routeDistance: "Distance",
    routeDuration: "Duration",
    clearRouteBtn: "Clear Route",
    drawRouteBtn: "Draw Route on Map",
    drawRouteGettingGPS: "Locating GPS...",
    openGoogleMapsTitle: "Open in Google Maps",
    mapIndicatorTitle: "Leaflet Map Legend",
    indicatorSocialFacility: "Social Facilities",
    indicatorStudentRestaurant: "Student Restaurants",
    indicatorSocialCafe: "Social Cafes",
    hereLabel: "You are here",
    yourLocationLabel: "Your current coordinates",
    
    // Categories Table
    catSocialFacility: "Social Facility",
    catStudentRestaurant: "Student Restaurant",
    catSocialCafe: "Social Cafe",
    allCategoriesTab: "All",
  }
};
