import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, ComplaintStatus, Severity } from '../types';

interface LeafletMapProps {
  // Center coordinates (default: Bengaluru central civic grid)
  center?: [number, number];
  zoom?: number;
  height?: string;
  // Picker mode props
  isPicker?: boolean;
  selectedLocation?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  // Explorer mode props
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  showHeatspots?: boolean;
}

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  Submitted: '#3b82f6', // blue
  'Under Review': '#6366f1', // indigo
  Verified: '#8b5cf6', // purple
  Assigned: '#f59e0b', // amber
  'In Progress': '#f97316', // orange
  Resolved: '#10b981', // emerald green
  Closed: '#64748b', // slate
  Rejected: '#ef4444', // red
  'On Hold': '#94a3b8', // slate-light
  Escalated: '#dc2626', // deep red
  Reopened: '#ec4899', // pink
};

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: '#dc2626',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [12.9716, 77.5946],
  zoom = 13,
  height = '420px',
  isPicker = false,
  selectedLocation,
  onLocationSelect,
  complaints = [],
  onSelectComplaint,
  showHeatspots = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: L.LatLngTuple = selectedLocation
        ? [selectedLocation.lat, selectedLocation.lng]
        : [center[0], center[1]];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom,
        scrollWheelZoom: true,
      });

      // Free OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CivicSense GIS',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click in picker mode
      if (isPicker && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center or handle resize
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [height]);

  // Handle Picker Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isPicker) return;

    const loc = selectedLocation || { lat: center[0], lng: center[1] };

    if (!pickerMarkerRef.current) {
      const pinHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
          <div class="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white border-2 border-emerald-700 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-3 h-1.5 bg-black/30 rounded-full blur-[1px]"></div>
        </div>
      `;

      const icon = L.divIcon({
        html: pinHtml,
        className: 'custom-picker-pin',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([loc.lat, loc.lng], {
        icon,
        draggable: true,
      }).addTo(mapInstanceRef.current);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(pos.lat, pos.lng);
        }
      });

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([loc.lat, loc.lng]);
    }
  }, [selectedLocation, isPicker, onLocationSelect]);

  // Handle Explorer Complaint Markers & Heatspots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || isPicker) return;

    markersGroupRef.current.clearLayers();

    complaints.forEach((comp) => {
      const statusColor = STATUS_COLORS[comp.status] || '#3b82f6';
      const severityColor = SEVERITY_COLORS[comp.severity] || '#f59e0b';

      // Hotspot circle if enabled
      if (showHeatspots) {
        const radius = comp.priority === 'P1-Critical' ? 450 : comp.priority === 'P2-High' ? 300 : 180;
        L.circle([comp.location.lat, comp.location.lng], {
          color: severityColor,
          fillColor: severityColor,
          fillOpacity: 0.18,
          radius,
          weight: 1,
        }).addTo(markersGroupRef.current!);
      }

      // Marker Icon
      const markerHtml = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-full transition-transform duration-200 hover:scale-125">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-white" style="background-color: ${statusColor}">
            <span class="text-[10px] font-bold tracking-tight">${comp.category.slice(0, 2).toUpperCase()}</span>
          </div>
          ${
            comp.priority === 'P1-Critical' || comp.isEscalated
              ? `<span class="absolute -top-1 -right-1 flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-civic-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([comp.location.lat, comp.location.lng], {
        icon: customIcon,
      }).addTo(markersGroupRef.current!);

      // Popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-xs w-60';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-slate-200 mb-1.5">
          <span class="font-mono font-bold text-slate-700">${comp.id}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style="background-color: ${statusColor}">
            ${comp.status}
          </span>
        </div>
        <p class="font-bold text-slate-900 line-clamp-1 mb-1">${comp.title}</p>
        <p class="text-slate-500 text-[11px] line-clamp-2 mb-2">${comp.description}</p>
        <div class="flex items-center justify-between text-[10px] text-slate-500 mb-2">
          <span>📍 ${comp.location.ward.split('-')[0]}</span>
          <span class="font-semibold text-rose-600">${comp.priority}</span>
        </div>
        <button id="btn-view-${comp.id}" class="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-center transition-colors">
          View & Track Details
        </button>
      `;

      // Attach click handler to popup button
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${comp.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(comp);
        }
      });
    });
  }, [complaints, isPicker, showHeatspots, onSelectComplaint]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Helper overlay in picker mode */}
      {isPicker && (
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-md flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Click on map or drag pin to adjust location</span>
        </div>
      )}
    </div>
  );
};
