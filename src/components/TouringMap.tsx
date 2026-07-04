"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Music, Building2, ExternalLink, Mic2, Speaker, Guitar, Mail } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";

const venueIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-zinc-950/90 rounded-full border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.6)] flex items-center justify-center animate-pulse backdrop-blur-sm">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const bandIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-zinc-950/90 rounded-full border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center justify-center backdrop-blur-sm">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const studioIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-zinc-950/90 rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center justify-center backdrop-blur-sm">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="22"></line><line x1="8" y1="22" x2="16" y2="22"></line></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const rehearsalIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-zinc-950/90 rounded-full border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)] flex items-center justify-center backdrop-blur-sm">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const shopIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="p-2 bg-zinc-950/90 rounded-full border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] flex items-center justify-center backdrop-blur-sm">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path><path d="m3 7 6 6-6 6"></path></svg>
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

function MapEventHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

export default function TouringMap({ venues = [], bands = [], resources = [], routeNodes = [], onSelectVenue, isProduction }: { venues?: any[], bands?: any[], resources?: any[], routeNodes?: any[], onSelectVenue?: (v: any) => void, isProduction?: boolean }) {
  const center: [number, number] = [39.8283, -98.5795];
  const [zoomLevel, setZoomLevel] = useState(4);

  const polylinePositions = routeNodes.map(node => [node.latitude, node.longitude]);

  const createClusterCustomIcon = function (cluster: any) {
    return L.divIcon({
      html: `<div class="w-12 h-12 bg-pink-600/90 rounded-full border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.8)] flex items-center justify-center backdrop-blur-sm text-white font-black text-sm">
        ${cluster.getChildCount()}
      </div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(48, 48, true),
    });
  };

  const createRegionalCounterIcon = (code: string, count: number, borderClass: string, textClass: string, glowClass: string) => {
    return L.divIcon({
      className: "custom-regional-cluster-icon",
      html: `<div class="w-20 h-20 bg-zinc-950/95 rounded-full border-4 ${borderClass} ${glowClass} flex flex-col items-center justify-center animate-pulse backdrop-blur-md cursor-pointer hover:scale-110 transition-all duration-300">
        <span class="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">${code}</span>
        <span class="text-2xl font-black text-white leading-none tracking-tighter">${count}</span>
        <span class="text-[8px] font-bold ${textClass} uppercase tracking-wider leading-none mt-1">Venues</span>
      </div>`,
      iconSize: [80, 80],
      iconAnchor: [40, 40],
    });
  };

  // Internal map wrapper to easily consume the leaflet useMap hooks
  function MapContent() {
    const map = useMap();

    const nwVenues = venues.filter(v => v.latitude >= 42 && v.longitude < -110);
    const swVenues = venues.filter(v => v.latitude < 42 && v.longitude < -104);
    const neVenues = venues.filter(v => v.latitude >= 38 && v.longitude >= -82);
    const seVenues = venues.filter(v => v.latitude < 38 && v.longitude >= -104);
    const mwVenues = venues.filter(v => 
      !(v.latitude >= 42 && v.longitude < -110) &&
      !(v.latitude < 42 && v.longitude < -104) &&
      !(v.latitude >= 38 && v.longitude >= -82) &&
      !(v.latitude < 38 && v.longitude >= -104)
    );

    const regions = [
      { name: "Northwest", code: "NW", center: [45.5, -120.5] as [number, number], border: "border-pink-500", text: "text-pink-400", glow: "shadow-[0_0_25px_rgba(236,72,153,0.7)]", count: nwVenues.length },
      { name: "Southwest", code: "SW", center: [36.5, -117.0] as [number, number], border: "border-indigo-500", text: "text-indigo-400", glow: "shadow-[0_0_25px_rgba(99,102,241,0.7)]", count: swVenues.length },
      { name: "Midwest", code: "MW", center: [42.0, -93.0] as [number, number], border: "border-emerald-500", text: "text-emerald-400", glow: "shadow-[0_0_25px_rgba(16,185,129,0.7)]", count: mwVenues.length },
      { name: "Southeast", code: "SE", center: [32.5, -97.0] as [number, number], border: "border-orange-500", text: "text-orange-400", glow: "shadow-[0_0_25px_rgba(249,115,22,0.7)]", count: seVenues.length },
      { name: "Northeast", code: "NE", center: [41.5, -76.0] as [number, number], border: "border-purple-500", text: "text-purple-400", glow: "shadow-[0_0_25px_rgba(168,85,247,0.7)]", count: neVenues.length },
    ];

    if (zoomLevel < 5) {
      return (
        <>
          {regions.map((region) => (
            region.count > 0 && (
              <Marker 
                key={region.code}
                position={region.center} 
                icon={createRegionalCounterIcon(region.code, region.count, region.border, region.text, region.glow)}
                eventHandlers={{
                  click: () => {
                    map.setView(region.center, 6, { animate: true, duration: 1.5 });
                  }
                }}
              />
            )
          ))}
        </>
      );
    }

    return (
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={80}
      >
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
                
                {venue.bookingEmail ? (
                  <a 
                    href={`mailto:${venue.bookingEmail}?subject=Booking Inquiry - ${venue.name}&body=Hi ${venue.contactName || 'Booking Manager'},%0D%0A%0D%0AWe are interested in booking a show at ${venue.name}.`}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 mb-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-all text-white no-underline"
                  >
                    <Mail className="w-3.5 h-3.5" /> EMAIL VENUE
                  </a>
                ) : (
                  <div className="mb-2 py-1 text-center text-[9px] font-bold text-zinc-500 uppercase border-t border-zinc-900">
                    No Email Listed
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
      </MarkerClusterGroup>
    );
  }

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoomLevel} 
        style={{ height: "100%", width: "100%", background: "#09090b" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapResizer />
        <MapEventHandler onZoomChange={setZoomLevel} />

        {polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions as [number, number][]} 
            color="#ec4899" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.6}
          />
        )}

        <MapContent />
      </MapContainer>
    </div>
  );
}
