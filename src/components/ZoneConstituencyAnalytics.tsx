import React, { useState, useMemo } from 'react';
import {
  Compass,
  Building2,
  HardHat,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Filter,
  Layers,
  MapPin,
  ChevronRight,
  PieChart,
  BarChart3,
  Award,
  Sparkles,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { ZONES, CONSTITUENCIES } from '../data/seedData';
import { formatINR, formatFullINR } from './InfrastructureProjects';

export const ZoneConstituencyAnalytics: React.FC = () => {
  const { infrastructureProjects, complaints } = useCivic();
  const [viewMode, setViewMode] = useState<'zone' | 'constituency'>('zone');
  const [selectedItem, setSelectedItem] = useState<string>('All');

  // Calculate Zone metrics dynamically from authoritative Firestore data
  const zoneMetrics = useMemo(() => {
    return ZONES.map((zoneName) => {
      const zoneKey = zoneName.split(' - ')[1]?.split(' ')[0] || zoneName;
      const projects = infrastructureProjects.filter((p) => {
        if (!p) return false;
        if (p.zone === zoneName) return true;
        if (p.zone && p.zone.includes(zoneKey)) return true;
        if (p.ward && zoneName.toLowerCase().includes(p.ward.toLowerCase().split(' ')[0])) return true;
        if (p.location && p.location.toLowerCase().includes(zoneKey.toLowerCase())) return true;
        return false;
      });

      const zoneComplaints = complaints.filter((c) => {
        if (!c) return false;
        if (c.zone === zoneName) return true;
        if (c.location?.ward && zoneName.toLowerCase().includes(c.location.ward.toLowerCase().split(' ')[0])) return true;
        if (c.location?.address && c.location.address.toLowerCase().includes(zoneKey.toLowerCase())) return true;
        return false;
      });

      const totalSanctioned = projects.reduce((sum, p) => sum + (p.sanctionedBudget || p.budget || 0), 0);
      const totalUtilized = projects.reduce((sum, p) => sum + (p.utilizedBudget || 0), 0);
      const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / projects.length) : 0;
      const completedProjects = projects.filter((p) => p.progressPercent === 100 || String(p.status).toUpperCase() === 'COMPLETED').length;
      const delayedProjects = projects.filter((p) => String(p.status).toUpperCase() === 'DELAYED' || p.delayStatus === 'Delayed').length;

      const openComplaints = zoneComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'Work Completed').length;
      const resolvedComplaints = zoneComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'Work Completed').length;
      const highPriorityComplaints = zoneComplaints.filter((c) => c.priority === 'P1-Critical' || c.priority === 'P2-High' || c.severity === 'Critical' || c.severity === 'High').length;

      return {
        name: zoneName,
        projectCount: projects.length,
        totalSanctioned,
        totalUtilized,
        remainingBudget: Math.max(0, totalSanctioned - totalUtilized),
        avgProgress,
        completedProjects,
        delayedProjects,
        totalComplaints: zoneComplaints.length,
        openComplaints,
        resolvedComplaints,
        highPriorityComplaints,
        projects,
        complaints: zoneComplaints,
      };
    });
  }, [infrastructureProjects, complaints]);

  // Calculate Constituency metrics dynamically from authoritative Firestore data
  const constituencyMetrics = useMemo(() => {
    return CONSTITUENCIES.map((constName) => {
      const shortName = constName.replace(' Assembly Constituency', '').trim();
      const projects = infrastructureProjects.filter((p) => {
        if (!p) return false;
        if (p.constituency === constName || p.constituency === shortName) return true;
        if (p.constituency && p.constituency.toLowerCase().includes(shortName.toLowerCase())) return true;
        if (p.ward && p.ward.toLowerCase().includes(shortName.toLowerCase())) return true;
        if (p.location && p.location.toLowerCase().includes(shortName.toLowerCase())) return true;
        return false;
      });

      const constComplaints = complaints.filter((c) => {
        if (!c) return false;
        if (c.constituency === constName || c.constituency === shortName) return true;
        if (c.location?.ward && c.location.ward.toLowerCase().includes(shortName.toLowerCase())) return true;
        if (c.location?.address && c.location.address.toLowerCase().includes(shortName.toLowerCase())) return true;
        return false;
      });

      const totalSanctioned = projects.reduce((sum, p) => sum + (p.sanctionedBudget || p.budget || 0), 0);
      const totalUtilized = projects.reduce((sum, p) => sum + (p.utilizedBudget || 0), 0);
      const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / projects.length) : 0;
      const completedProjects = projects.filter((p) => p.progressPercent === 100 || String(p.status).toUpperCase() === 'COMPLETED').length;
      const delayedProjects = projects.filter((p) => String(p.status).toUpperCase() === 'DELAYED' || p.delayStatus === 'Delayed').length;

      const openComplaints = constComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'Work Completed').length;
      const resolvedComplaints = constComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'Work Completed').length;
      const resolutionRate = constComplaints.length > 0 ? Math.round((resolvedComplaints / constComplaints.length) * 100) : 100;

      return {
        name: constName,
        shortName,
        projectCount: projects.length,
        totalSanctioned,
        totalUtilized,
        remainingBudget: Math.max(0, totalSanctioned - totalUtilized),
        avgProgress,
        completedProjects,
        delayedProjects,
        totalComplaints: constComplaints.length,
        openComplaints,
        resolvedComplaints,
        resolutionRate,
        projects,
        complaints: constComplaints,
      };
    });
  }, [infrastructureProjects, complaints]);

  const activeDataList = viewMode === 'zone' ? zoneMetrics : constituencyMetrics;

  const filteredDataList = useMemo(() => {
    if (selectedItem === 'All') return activeDataList;
    return activeDataList.filter((item) => item.name === selectedItem);
  }, [activeDataList, selectedItem]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Geographic Development &amp; Ward Governance Analytics
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Development Visibility by Zone &amp; Constituency
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time municipal development progress, sanctioned budget utilization, active infrastructure projects, and grievance resolution efficiency aggregated by geographic administrative boundaries.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-800 border border-slate-700 rounded-2xl shrink-0">
          <button
            onClick={() => {
              setViewMode('zone');
              setSelectedItem('All');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'zone' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Development by Zone
          </button>
          <button
            onClick={() => {
              setViewMode('constituency');
              setSelectedItem('All');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'constituency' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Development by Constituency
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Boundary:</span>
        </div>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 max-w-xs"
        >
          <option value="All">All {viewMode === 'zone' ? 'Zones' : 'Constituencies'}</option>
          {activeDataList.map((item) => (
            <option key={item.name} value={item.name}>{item.name}</option>
          ))}
        </select>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDataList.map((item: any) => (
          <div key={item.name} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-5">
            
            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                  {viewMode === 'zone' ? 'Municipal Zone' : 'Assembly Constituency'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {item.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-700">{item.avgProgress}%</span>
                <span className="block text-[10px] font-bold uppercase text-slate-400">Avg Development Progress</span>
              </div>
            </div>

            {/* Financial & Progress Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Sanctioned Budget</span>
                <span className="text-xs font-black text-slate-900">{formatINR(item.totalSanctioned)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Utilized Budget</span>
                <span className="text-xs font-black text-emerald-700">{formatINR(item.totalUtilized)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Remaining</span>
                <span className="text-xs font-black text-slate-700">{formatINR(item.remainingBudget)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Infrastructure Execution Rate</span>
                <span className="text-emerald-700">{item.avgProgress}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${item.avgProgress}%` }} />
              </div>
            </div>

            {/* Key Operational Counts */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Infrastructure Projects</span>
                  <span className="text-base">{item.projectCount}</span>
                </div>
                <div className="text-[11px] text-emerald-700 flex justify-between">
                  <span>Completed: {item.completedProjects}</span>
                  <span className="text-rose-700 font-semibold">Delayed: {item.delayedProjects}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-indigo-900">
                  <span>Public Complaints</span>
                  <span className="text-base">{item.totalComplaints}</span>
                </div>
                <div className="text-[11px] text-indigo-700 flex justify-between">
                  <span>Open: {item.openComplaints}</span>
                  <span className="text-emerald-700 font-semibold">Resolved: {item.resolvedComplaints}</span>
                </div>
              </div>
            </div>

            {/* Recent Project Highlights */}
            {item.projects.length > 0 && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Active Projects in Boundary
                </span>
                <div className="space-y-1.5">
                  {item.projects.slice(0, 2).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between text-slate-700 font-medium">
                      <span className="truncate max-w-[200px]">• {p.name}</span>
                      <span className="font-mono font-bold text-emerald-700">{p.progressPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};
