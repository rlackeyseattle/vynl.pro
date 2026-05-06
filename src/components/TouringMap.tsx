"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Music, Building2, ExternalLink, Mic2, Speaker, Guitar } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const venueIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-pink-500 rounded-full border-2 border-white shadow-lg shadow-pink-500/50 flex items-center justify-center animate-pulse">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const bandIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-indigo-500 rounded-full border-2 border-white shadow-lg shadow-indigo-500/50 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const studioIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-emerald-500 rounded-full border-2 border-white shadow-lg shadow-emerald-500/50 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="22"></line><line x1="8" y1="22" x2="16" y2="22"></line></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const rehearsalIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-orange-500 rounded-full border-2 border-white shadow-lg shadow-orange-500/50 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const shopIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-purple-500 rounded-full border-2 border-white shadow-lg shadow-purple-500/50 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path><path d="m3 7 6 6-6 6"></path></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function TouringMap({ venues = [], bands = [], resources = [], routeNodes = [], onSelectVenue, isProduction }: { venues?: any[], bands?: any[], resources?: any[], routeNodes?: any[], onSelectVenue?: (v: any) => void, isProduction?: boolean }) {
  const center: [number, number] = [39.8283, -98.5795];

  const polylinePositions = routeNodes.map(node => [node.latitude, node.longitude]);

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={4} 
        style={{ height: "100%", width: "100%", background: "#09090b" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapResizer />

        {polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions as [number, number][]} 
            color="#ec4899" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.6}
          />
        )}

        {venues.map((venue) => (
          <Marker 
            key={venue.id} 
            position={[venue.latitude, venue.longitude]} 
            icon={venueIcon}
            eventHandlers={{
              click: () => onSelectVenue?.(venue),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-3 bg-zinc-950 text-white rounded-xl min-w-[200px]">
                <h3 className="font-black text-lg text-pink-500 uppercase">{venue.name}</h3>
                <p className="text-[10px] text-zinc-400 mb-2">{venue.address}</p>
                
                {/* Hide email and specific data on production popups */}
                {!isProduction && (
                   <div className="mb-3 py-2 border-t border-zinc-900">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase">{venue.bookingEmail || 'No Email'}</p>
                   </div>
                )}

                <Link 
                  href={`/profiles/${venue.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-xs font-bold transition-all text-white no-underline"
                >
                  VIEW SPOTLIGHT <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {bands.map((band) => (
          <Marker 
            key={band.id} 
            position={[band.latitude, band.longitude]} 
            icon={bandIcon}
          >
            <Popup className="custom-popup">
              <div className="p-3 bg-zinc-950 text-white rounded-xl min-w-[200px]">
                <h3 className="font-black text-lg text-indigo-400 uppercase">{band.name}</h3>
                <p className="text-[10px] text-zinc-400 mb-2">{band.genre}</p>
                <Link 
                  href={`/profiles/${band.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all text-white no-underline"
                >
                  VIEW EPK <Music className="w-3 h-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {resources.map((resource) => (
          <Marker 
            key={resource.id} 
            position={[resource.latitude, resource.longitude]} 
            icon={
              resource.type === 'STUDIO' ? studioIcon : 
              resource.type === 'REHEARSAL' ? rehearsalIcon : 
              shopIcon
            }
          >
            <Popup className="custom-popup">
              <div className="p-3 bg-zinc-950 text-white rounded-xl min-w-[200px]">
                <h3 className={`font-black text-lg uppercase ${
                  resource.type === 'STUDIO' ? 'text-emerald-400' : 
                  resource.type === 'REHEARSAL' ? 'text-orange-400' : 
                  'text-purple-400'
                }`}>{resource.name}</h3>
                <p className="text-[10px] text-zinc-400 mb-2">{resource.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
