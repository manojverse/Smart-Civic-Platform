import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { useCivic } from '../context/CivicContext';
import { Complaint, InfrastructureProject } from '../types';
import { WARDS, ZONES, CONSTITUENCIES } from '../data/seedData';

interface CivicMapViewProps {
  onSelectComplaint: (complaint: Complaint) => void;
  onSelectProject?: (project: InfrastructureProject) => void;
}

const ALL_CATEGORIES = [
  'Pothole',
  'Garbage',
  'Water Leakage',
  'Drainage',
  'Streetlight',
  'Traffic',
  'Road Damage',
  'Sanitation',
  'Illegal Dumping',
  'Tree Hazard',
  'Public Safety',
  'Other Civic Issue',
];

export const CivicMapView: React.FC<CivicMapViewProps> = ({ onSelectComplaint, onSelectProject }) => {
  const { complaints, infrastructureProjects } = useCivic();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [constituencyFilter, setConstituencyFilter] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState(true);
  const [mapLayer, setMapLayer] = useState<'complaints' | 'projects' | 'both'>('both');

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchWard = wardFilter === 'All' || c.location?.ward === wardFilter;
    const matchZone =
      zoneFilter === 'All' ||
      c.zone === zoneFilter ||
      c.location?.zone === zoneFilter;
    const matchConstituency =
      constituencyFilter === 'All' ||
      c.constituency === constituencyFilter ||
      c.location?.constituency === constituencyFilter;
    return matchCat && matchStatus && matchPriority && matchWard && matchZone && matchConstituency;
  });

  // Filter infrastructure projects by ward/zone/constituency
  const filteredProjects = infrastructureProjects.filter((p) => {
    const matchWard = wardFilter === 'All' || p.ward === wardFilter;
    const matchZone = zoneFilter === 'All' || p.zone === zoneFilter;
    const matchConstituency =
      constituencyFilter === 'All' || p.constituency === constituencyFilter;
    return matchWard && matchZone && matchConstituency;
  });

  const hasActiveFilters =
    categoryFilter !== 'All' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    wardFilter !== 'All' ||
    zoneFilter !== 'All' ||
    constituencyFilter !== 'All';

  const resetFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setPriorityFilter('All');
    setWardFilter('All');
    setZoneFilter('All');
    setConstituencyFilter('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <MapPin className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Interactive Civic GIS &amp; Hotspot Map
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time geospatial visualization of active complaints, infrastructure projects, and ward-level clusters.
          </p>
        </div>

        {/* Layer & Hotspot Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-[11px]">
            <button
              onClick={() => setMapLayer('complaints')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                mapLayer === 'complaints' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Complaints ({filteredComplaints.length})
            </button>
            <button
              onClick={() => setMapLayer('projects')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                mapLayer === 'projects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Projects ({filteredProjects.length})
            </button>
            <button
              onClick={() => setMapLayer('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                mapLayer === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Both
            </button>
          </div>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="Work Planned">Work Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
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

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Zone
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="All">All Zones</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Constituency
            </label>
            <select
              value={constituencyFilter}
              onChange={(e) => setConstituencyFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="All">All Constituencies</option>
              {CONSTITUENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Map Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="space-y-4">
        <LeafletMap
          height="540px"
          complaints={mapLayer === 'projects' ? [] : filteredComplaints}
          showHeatspots={mapLayer === 'projects' ? false : showHotspots}
          onSelectComplaint={onSelectComplaint}
          infrastructureProjects={mapLayer === 'complaints' ? [] : filteredProjects}
          onSelectProject={onSelectProject}
        />

        {/* Legend Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700">Status Pins:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Submitted / Under Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Assigned / Work Planned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-slate-600">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Resolved / Closed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600"></span>
              <span className="text-slate-600 font-semibold">Critical / Escalated</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Showing <strong>{mapLayer === 'projects' ? 0 : filteredComplaints.length}</strong> complaint
            {mapLayer !== 'complaints' ? ` · ${filteredProjects.length} project` : ''} markers
          </div>
        </div>
      </div>
    </div>
  );
};
