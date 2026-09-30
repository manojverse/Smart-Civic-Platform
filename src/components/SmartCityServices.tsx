import React, { useState } from 'react';
import {
  Phone,
  Navigation,
  Clock,
  MapPin,
  Search,
  Filter,
  AlertCircle,
  Building2,
  Trash2,
  Droplets,
  Zap,
  Hospital,
  Shield,
  Bus,
  CheckCircle,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { SmartServiceItem } from '../types';

export const SmartCityServices: React.FC = () => {
  const { services, setActiveTab } = useCivic();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Emergency',
    'Water',
    'Waste Management',
    'Electricity',
    'Health',
    'Municipal Office',
    'Transit',
  ];

  const filteredServices = services.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q) ||
      item.ward.toLowerCase().includes(q) ||
      item.phone.includes(q)
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Emergency':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'Water':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'Waste Management':
        return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'Electricity':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Health':
        return <Hospital className="w-5 h-5 text-rose-600" />;
      case 'Municipal Office':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'Transit':
        return <Bus className="w-5 h-5 text-cyan-600" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                Smart City Directory
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1">Smart City Municipal Facilities & Helplines</h1>
            <p className="text-teal-200 text-sm mt-1 max-w-2xl">
              Locate nearby municipal utility centers, emergency contact lines, water treatment plants, and healthcare stations with direct navigation and one-touch calling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center border border-white/10">
              <div className="text-xs text-teal-200">Total Facilities</div>
              <div className="text-2xl font-bold text-white">{services.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center border border-white/10">
              <div className="text-xs text-teal-200">24x7 Emergency</div>
              <div className="text-2xl font-bold text-red-300">
                {services.filter((s) => s.isEmergency).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name, ward, or helpline..."
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                    {getCategoryIcon(service.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {service.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {service.category}
                    </span>
                  </div>
                </div>

                {service.isEmergency && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                    24x7 Emergency
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{service.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{service.timings}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Ward: {service.ward}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${service.phone}`}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call {service.phone}
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${service.lat},${service.lng}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
                title="Directions on Map"
              >
                <Navigation className="w-4 h-4" />
              </a>

              <button
                onClick={() => setActiveTab('report')}
                className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
                title="Report issue at this location"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
