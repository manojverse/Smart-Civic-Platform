import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Flame,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { useCivic } from '../context/CivicContext';
import { Complaint, ComplaintCategory, ComplaintStatus, Priority } from '../types';
import { WARDS } from '../data/seedData';

interface CivicMapViewProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CivicMapView: React.FC<CivicMapViewProps> = ({ onSelectComplaint }) => {
  const { complaints } = useCivic();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState(true);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchWard = wardFilter === 'All' || c.location.ward === wardFilter;
    return matchCat && matchStatus && matchPriority && matchWard;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <MapPin className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Civic GIS & Hotspot Map</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time geospatial visualization of active complaints, municipal field clusters, and high-risk zones.
          </p>
        </div>

        {/* Hotspot Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border ${
              showHotspots
                ? 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flame className={`w-4 h-4 ${showHotspots ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{showHotspots ? 'Hotspots Active' : 'Show Hotspots'}</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="All">All Categories ({complaints.length})</option>
              <option value="Pothole">Potholes</option>
              <option value="Garbage">Garbage & Solid Waste</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Drainage">Drainage & Sewage</option>
              <option value="Streetlight">Streetlights</option>
              <option value="Traffic">Traffic & Roads</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="All">All Priorities</option>
              <option value="P1-Critical">Critical (P1)</option>
              <option value="P2-High">High (P2)</option>
              <option value="P3-Medium">Medium (P3)</option>
              <option value="P4-Low">Low (P4)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Ward
            </label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="All">All Wards</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Display */}
      <div className="space-y-4">
        <LeafletMap
          height="540px"
          complaints={filteredComplaints}
          showHeatspots={showHotspots}
          onSelectComplaint={onSelectComplaint}
        />

        {/* Legend Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700">Status Pins:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Submitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Assigned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-slate-600">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600"></span>
              <span className="text-slate-600 font-semibold">Critical / Escalated</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <strong>{filteredComplaints.length}</strong> geolocated civic markers
          </div>
        </div>
      </div>
    </div>
  );
};
