import React from 'react';
import {
  Cpu,
  Radio,
  Sparkles,
  Droplets,
  Truck,
  PhoneCall,
  Shield,
  Layers,
  Zap,
  Flame,
  Binary,
  Plane,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const FutureScope: React.FC = () => {
  const futureModules = [
    {
      title: 'Autonomous Drone Pothole & Road Surface Scanners',
      desc: 'Scheduled drone flights over Smart City Fort Road and Ring Road capturing high-resolution 3D lidar mesh data to detect micro-cracks before they turn into severe potholes.',
      icon: <Plane className="w-5 h-5 text-indigo-600" />,
      tag: 'Q1 2027 • Computer Vision',
    },
    {
      title: 'IoT Drainage Level & Monsoon Flash Flood Sensors',
      desc: 'Submersible ultrasonic telemetry nodes installed along Pedda Cheruvu canal and railway underpasses alerting municipal engineers 30 minutes before overflow.',
      icon: <Droplets className="w-5 h-5 text-blue-600" />,
      tag: 'Q2 2027 • Smart Sensors',
    },
    {
      title: 'Multilingual Voice IVR & WhatsApp Citizen Bot',
      desc: 'Citizens can dial a toll-free number or send a WhatsApp voice note in Telugu or Hindi. Automated Speech-to-Text transcribes and files the complaint instantly.',
      icon: <PhoneCall className="w-5 h-5 text-emerald-600" />,
      tag: 'Q3 2027 • Conversational AI',
    },
    {
      title: 'Smart Garbage Compactor GPS Route Optimization',
      desc: 'Dynamic rerouting of hydraulic waste compactor trucks based on fill-level sensors inside community dumper bins across all 50 wards.',
      icon: <Truck className="w-5 h-5 text-amber-600" />,
      tag: 'Q3 2027 • Logistics AI',
    },
    {
      title: 'Decentralized Municipal Proof-of-Work Blockchain',
      desc: 'Immutable cryptographic timestamping of before-and-after repair photographs to prevent contractor billing fraud and ensure public auditability.',
      icon: <Binary className="w-5 h-5 text-purple-600" />,
      tag: 'Q4 2027 • Distributed Ledger',
    },
    {
      title: 'Smart Streetlight Solar Grid & Fault Telemetry',
      desc: 'LoRaWAN smart meters at all 1,200 street poles detecting blown LED bulbs or burnt MCB fuses within 90 seconds without requiring citizen complaints.',
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      tag: 'Q1 2028 • Smart Grid',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Roadmap & Architecture
          </span>
        </div>
        <h1 className="text-2xl font-bold">Future Scope & Municipal Smart City Innovations</h1>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Scalable next-generation modules expanding Smart Civic into a fully autonomous, predictive urban infrastructure management operating system.
        </p>
      </div>

      {/* Grid of Future Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {futureModules.map((module, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                {module.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{module.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{module.desc}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {module.tag}
              </span>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Designed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
