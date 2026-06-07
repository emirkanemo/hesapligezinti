import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { Facility, getFacilityCategory } from "../types";

// Dynamic map controller to fly to selected coordinates smoothly and fit route bounds
interface MapControllerProps {
  center: [number, number];
  zoom: number;
  routePolyline?: [number, number][] | null;
}

function MapController({ center, zoom, routePolyline }: MapControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (routePolyline && routePolyline.length > 0) {
      const bounds = L.latLngBounds(routePolyline);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
        duration: 1.5,
      });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, routePolyline, map]);
  return null;
}

// Custom icons styled styled minimally with HTML/CSS via L.divIcon
const createCustomIcon = (type: string, isSelected: boolean, isDarkMode: boolean, index: number = 0) => {
  let colorClass = "bg-indigo-600 text-white hover:bg-indigo-500 border-white";
  let iconHtml = "🍽️"; 
  let accentColor = "indigo";

  const category = getFacilityCategory(type);
  
  if (category === "Öğrenci Restoranı") {
    colorClass = isSelected 
      ? "bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-white hover:brightness-110"
      : "bg-emerald-600 text-white hover:bg-emerald-500 border-white";
    iconHtml = "🥣"; 
    accentColor = "emerald";
  } else if (category === "Sosyal Kafe") {
    colorClass = isSelected
      ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white hover:brightness-110"
      : "bg-amber-500 text-white hover:bg-amber-400 border-white";
    iconHtml = "☕"; 
    accentColor = "amber";
  } else {
    colorClass = isSelected
      ? "bg-gradient-to-br from-indigo-400 via-indigo-600 to-violet-800 text-white hover:brightness-110"
      : "bg-indigo-600 text-white hover:bg-indigo-500 border-white";
    iconHtml = "🍽️"; 
    accentColor = "indigo";
  }

  const wrapperSizeClass = isSelected ? "w-10.5 h-10.5 shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "w-7.5 h-7.5 shadow-sm";
  const emojiSizeClass = isSelected ? "text-sm flex items-center justify-center scale-110 duration-200" : "text-[10px]";
  const arrowSizeClass = isSelected ? "w-3 h-3 -mt-1.5" : "w-1.5 h-1.5 -mt-0.5";
  const selectedRingClass = isSelected
    ? "ring-3 ring-indigo-400/90 ring-offset-1 scale-115 z-[9999]"
    : "hover:scale-105";

  const ringBorderColor = isDarkMode ? "border-slate-800" : "border-white/95";
  const arrowBorderColor = isDarkMode ? "border-slate-800" : "border-white/90";

  // Emulate framer-motion stagger delay with dynamic inline transition delay
  const staggerDelay = Math.min(index * 0.035, 1.2);

  // Select glow/radar colors based on accent color
  const waveColorClass = accentColor === "emerald" 
    ? "bg-emerald-500" 
    : accentColor === "amber" 
    ? "bg-amber-500" 
    : "bg-indigo-500";

  return L.divIcon({
    html: `
      <div class="animate-marker-intro relative flex flex-col items-center justify-center transition-all duration-300" style="animation-delay: ${staggerDelay}s; z-index: ${isSelected ? '99999' : '100'};">
        
        <!-- Interactive Multi-Radar Waves if selected -->
        ${isSelected ? `
          <div class="absolute h-14 w-14 rounded-full ${waveColorClass}/30 animate-selected-radar-1 pointer-events-none -translate-y-1"></div>
          <div class="absolute h-14 w-14 rounded-full ${waveColorClass}/20 animate-selected-radar-2 pointer-events-none -translate-y-1"></div>
          
          <!-- Eye-catching floating dynamic arrow pointer above -->
          <div class="absolute -top-[23px] z-[100000] animate-selected-bob flex flex-col items-center select-none pointer-events-none">
            <span class="text-xs filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]">✨</span>
          </div>
        ` : ""}
        
        <!-- Main Circular Body -->
        <div class="flex items-center justify-center rounded-full select-none border-2 ${ringBorderColor} ${wrapperSizeClass} ${colorClass} ${selectedRingClass} transition-all duration-300">
          <span class="${emojiSizeClass} leading-none font-sans font-normal">${iconHtml}</span>
        </div>
        
        <!-- Downward Pin Pointer Tip -->
        <div class="rotate-45 border-r border-b ${arrowBorderColor} ${arrowSizeClass} ${colorClass.split(" ")[0]} transition-all duration-300 shadow-sm"></div>
      </div>
    `,
    className: "custom-leaflet-pin-wrapper", // Prevents default square container backgrounds of leaflet
    iconSize: [42, 52],
    iconAnchor: [21, 46], // Point precisely to the tip of downward arrow
  });
};

interface MapComponentProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
  userLocation: [number, number] | null;
  routePolyline?: [number, number][] | null;
  isDarkMode?: boolean;
  language?: "tr" | "en";
}

export default function MapComponent({
  facilities,
  selectedFacility,
  onSelectFacility,
  userLocation,
  routePolyline,
  isDarkMode = false,
  language = "tr",
}: MapComponentProps) {
  // A stringified key representing the list and order of facilities shown.
  // This ensures icons and marker elements are NOT recreated when the parent state updates
  // (such as when adding/removing a facility to favorites), completely preventing re-animation blink.
  const facilitiesKey = useMemo(() => facilities.map((f) => f.id).join(","), [facilities]);

  const memoizedIcons = useMemo(() => {
    const iconsMap: Record<string, L.DivIcon> = {};
    facilities.forEach((fac, index) => {
      const isSelected = selectedFacility?.id === fac.id;
      iconsMap[fac.id] = createCustomIcon(fac.type, isSelected, isDarkMode, index);
    });
    return iconsMap;
  }, [facilitiesKey, selectedFacility?.id, isDarkMode]);

  // Center is selected facility coordinate, or default Istanbul Center scale
  const defaultCenter: [number, number] = [41.0082, 28.9784];
  const center: [number, number] = selectedFacility
    ? [selectedFacility.lat, selectedFacility.lng]
    : defaultCenter;

  const zoom = selectedFacility ? 14 : 11;

  // Render client locator point
  const userIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-40 animate-ping"></div>
        <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg z-10"></div>
      </div>
    `,
    className: "user-loc-pin",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Choose the Map Tile URL according to light/dark mode
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative font-sans" id="leaflet-map-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        className={`w-full h-full shadow-md border ${
          isDarkMode ? "border-slate-800 bg-[#111827]" : "border-slate-100 bg-[#f8fafc]"
        }`}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={isDarkMode ? "dark-carto-tiles" : "light-carto-tiles"}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        {/* Dynamic map focus */}
        <MapController center={center} zoom={zoom} routePolyline={routePolyline} />

        {/* Render Route Polylines if available */}
        {routePolyline && routePolyline.length > 0 && (
          <>
            {/* Soft, thick outer route line for shadow/halo contrast */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: isDarkMode ? "#020617" : "#1e1b4b", // Deep contrasting shadow base
                weight: 8,
                opacity: isDarkMode ? 0.45 : 0.25,
                lineJoin: "round",
                lineCap: "round",
              }}
            />
            {/* Sharp inner bright main route path line */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: isDarkMode ? "#818cf8" : "#4f46e5", // Brighter lavender-indigo on dark background, default indigo-600 on light
                weight: 4,
                opacity: 0.95,
                lineJoin: "round",
                lineCap: "round",
              }}
            />
          </>
        )}

        {/* Render User Location Pin if requested and allowed */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="p-1 font-sans text-left">
                {language === "tr" ? (
                  <>
                    <p className="font-bold text-slate-800 text-sm">Buradasınız</p>
                    <p className="text-xs text-slate-500 mt-1">Sizin konumunuz</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-800 text-sm">You are here</p>
                    <p className="text-xs text-slate-500 mt-1">Your location</p>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render all facility pins */}
        {facilities.map((fac) => {
          return (
            <Marker
              key={fac.id}
              position={[fac.lat, fac.lng]}
              icon={memoizedIcons[fac.id]}
              eventHandlers={{
                click: () => {
                  onSelectFacility(fac);
                },
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -42]}
                opacity={0.98}
                className="leaflet-tooltip-custom"
              >
                <div className="font-sans text-xs">
                  <div className={`font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{fac.name}</div>
                  <div className={`text-[10px] text-right mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{fac.district}</div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
