"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { ShieldCheck, Star, Phone } from "lucide-react";
import { DestinoInfo, cadasturData, CadasturBusiness } from "@/data/mockData";

// Fix Leaflet marker icons by using SVG DivIcons (avoids bundler asset path bugs)
const createCustomIcon = (tipo: string, active: boolean) => {
  let color = "#F59E0B"; // Amber
  if (tipo === "Hotel" || tipo === "Pousada") color = "#3B82F6"; // Blue
  if (tipo === "Restaurante") color = "#10B981"; // Emerald
  if (tipo === "Guia") color = "#EC4899"; // Pink
  if (tipo === "Agência") color = "#8B5CF6"; // Purple

  const activeScale = active ? "scale(1.25)" : "";
  const border = active ? "border-2 border-white" : "";

  return L.divIcon({
    html: `
      <div style="
        transform: ${activeScale};
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
        color: white;
        font-weight: bold;
        font-size: 10px;
        ${border}
      ">
        ${tipo[0]}
      </div>
    `,
    className: "custom-leaflet-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component to dynamically pan/zoom map when target changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface DestinationMapProps {
  destino: DestinoInfo;
}

export default function DestinationMap({ destino }: DestinationMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
        Carregando mapa interativo...
      </div>
    );
  }

  // Filter businesses in the current destination
  const businesses = cadasturData.filter(
    (b) => b.destino === destino.nome && b.regularizado
  );

  // Default coordinate if destination has no businesses
  const mapCenter: [number, number] = [destino.latitude, destino.longitude];

  // Prepare line coordinates for the certified route linking these partners
  const routePoints: [number, number][] = businesses.map((b) => [
    b.latitude,
    b.longitude,
  ]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <ChangeView center={mapCenter} zoom={13} />

        {/* Render Certified Partners */}
        {businesses.map((biz) => (
          <Marker
            key={biz.id}
            position={[biz.latitude, biz.longitude]}
            icon={createCustomIcon(biz.tipo, false)}
          >
            <Popup className="custom-popup">
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl border border-white/10 max-w-[200px] space-y-2">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {biz.tipo}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                    ★ {biz.nota}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {biz.nome}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cadastur Ativo</span>
                </div>
                <div className="pt-1.5 flex gap-1.5">
                  <Link
                    href={`/vitrine/${biz.id}`}
                    className="flex-1 text-center py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded hover:bg-amber-400 transition-colors"
                  >
                    Ver Vitrine
                  </Link>
                  <a
                    href={`tel:${biz.telefone}`}
                    className="p-1 bg-white/5 rounded text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    <Phone className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Draw a connecting line between points representing the Tourism Route */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color="#F59E0B"
            weight={3}
            dashArray="8, 8"
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* Floating map legend overlay */}
      <div className="absolute bottom-3 left-3 z-[10] bg-slate-950/80 backdrop-blur-md border border-white/5 px-2.5 py-1.5 rounded-lg text-[9px] text-slate-400 space-y-1">
        <p className="font-bold text-slate-300 mb-1">Legenda da Rota:</p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Hospedagem
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Restaurante
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" /> Guia Local
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Agência
        </div>
      </div>
    </div>
  );
}
