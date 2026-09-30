import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Building2,
  Wrench,
  Sparkles,
  Layers,
  CopyCheck,
  ShieldCheck,
  ArrowRight,
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { AIVerificationResult } from '../types';

interface AIVerificationCardProps {
  result: AIVerificationResult;
  onConfirmSubmit?: () => void;
  onRevise?: () => void;
  onAddLocation?: (locationData: { address: string; landmark: string }) => void;
  onSubmitForManualReview?: () => void;
  isSubmitting?: boolean;
  ticketCreatedId?: string;
  onTrackTicket?: () => void;
}

export const AIVerificationCard: React.FC<AIVerificationCardProps> = ({
  result,
  onConfirmSubmit,
  onRevise,
  onAddLocation,
  onSubmitForManualReview,
  isSubmitting = false,
  ticketCreatedId,
  onTrackTicket
}) => {
  const [extraAddress, setExtraAddress] = React.useState('');
  const [extraLandmark, setExtraLandmark] = React.useState('');
  const [locationSaved, setLocationSaved] = React.useState(false);

  const isLocationMissing = result.location_status === 'MISSING' && !locationSaved;

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraAddress.trim()) return;
    if (onAddLocation) {
      onAddLocation({ address: extraAddress, landmark: extraLandmark });
      setLocationSaved(true);
    }
  };

  // 1. INVALID STATE UI
  if (result.validity === 'INVALID') {
    return (
      <div className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                  Classification Result
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {result.confidence}% Confidence
                </span>
              </div>
              <h3 className="text-lg font-black text-rose-900 mt-0.5">✕ NOT A CIVIC COMPLAINT</h3>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Verification Complete</span>
          </div>
        </div>

        {/* Reason card */}
        <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-200 text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-950">AI Analysis & Explanation:</div>
              <p className="text-rose-800 text-xs mt-1 leading-relaxed">{result.reason}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5 border border-slate-200 leading-relaxed">
          <span className="font-semibold text-slate-800">Note:</span> The municipal portal verifies citizen reports to ensure municipal workforce and equipment are deployed for genuine public infrastructure maintenance (e.g. road repairs, garbage removal, drainage, water supply, or streetlights).
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {onRevise && (
            <button
              type="button"
              onClick={onRevise}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <span>Submit a Civic Complaint / Revise Text</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. NEEDS REVIEW STATE UI
  if (result.validity === 'NEEDS_REVIEW') {
    return (
      <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Classification Result
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {result.confidence}% Confidence
                </span>
              </div>
              <h3 className="text-lg font-black text-amber-900 mt-0.5">⚠ NEEDS REVIEW</h3>
            </div>
          </div>
        </div>

        {/* Guidance */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs space-y-2">
          <div className="font-bold text-amber-900 text-sm">AI Explanation:</div>
          <p className="text-amber-800 leading-relaxed">{result.reason}</p>
          <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-200 font-medium text-amber-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Guidance: Please provide more details about the issue and its location.</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {onRevise && (
            <button
              type="button"
              onClick={onRevise}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Add More Details & Re-Verify
            </button>
          )}
          {onSubmitForManualReview && (
            <button
              type="button"
              onClick={onSubmitForManualReview}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <span>Submit for Manual Officer Verification</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. VALID COMPLAINT STATE UI
  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-lg space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Verified Civic Issue
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {result.confidence}% Confidence
              </span>
            </div>
            <h3 className="text-lg font-black text-emerald-950 mt-0.5 flex items-center gap-2">
              <span>✓ VALID COMPLAINT</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </h3>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Priority:</span>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border shadow-xs ${
              result.priority === 'CRITICAL'
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : result.priority === 'HIGH'
                ? 'bg-amber-500 text-white border-amber-600'
                : result.priority === 'MEDIUM'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            {result.priority}
          </span>
        </div>
      </div>

      {/* Grid of Verified Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Category & Subcategory */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-slate-500 font-semibold flex items-center gap-1.5 mb-1">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Category & Issue:</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">{result.category}</div>
          <div className="text-slate-600 mt-0.5">Issue: <span className="font-semibold text-slate-900">{result.subcategory}</span></div>
        </div>

        {/* Location Extraction */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-slate-500 font-semibold flex items-center gap-1.5 mb-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Extracted Location:</span>
          </div>
          {isLocationMissing ? (
            <div className="text-amber-800 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Location: ⚠ Location required</span>
            </div>
          ) : (
            <div className="font-bold text-slate-900 text-sm truncate">
              {locationSaved ? `${extraAddress} (${extraLandmark || 'Smart City'})` : result.location || 'Location Provided by Citizen'}
            </div>
          )}
          <div className="text-[11px] text-slate-500 mt-0.5">
            Status: <span className="font-semibold uppercase">{locationSaved ? 'PROVIDED' : result.location_status}</span>
          </div>
        </div>

        {/* Recommended Department */}
        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
          <div className="text-emerald-800 font-semibold flex items-center gap-1.5 mb-1">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Recommended Department:</span>
          </div>
          <div className="font-bold text-emerald-950 text-sm">{result.recommended_department}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Smart Municipal Redirection Routing</div>
        </div>

        {/* Duplicate Status */}
        <div className={`p-3.5 rounded-xl border ${result.duplicate ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-slate-500 font-semibold flex items-center gap-1.5 mb-1">
            <CopyCheck className="w-4 h-4 text-slate-700" />
            <span>Duplicate Check:</span>
          </div>
          {result.duplicate ? (
            <div>
              <div className="font-bold text-amber-900 text-xs">⚠ Duplicate Detected</div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                {result.duplicate_summary || `Similar complaint #${result.duplicate_complaint_id || ''} already reported in this locality.`}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-emerald-700 text-xs">✓ No duplicate found</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Unique complaint in municipal registry</div>
            </div>
          )}
        </div>
      </div>

      {/* AI Explanation / Reason */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1">
        <div className="font-bold text-slate-800">AI Reason:</div>
        <p className="text-slate-600 leading-relaxed">{result.reason}</p>
      </div>

      {/* Recommended Action */}
      <div className="bg-indigo-50/60 rounded-xl p-3.5 border border-indigo-200 text-xs space-y-1">
        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-indigo-700" />
          <span>Recommended Municipal Action:</span>
        </div>
        <p className="text-indigo-900 leading-relaxed font-medium">{result.recommended_action}</p>
      </div>

      {/* Missing Location Warning & Inline Addition Form */}
      {isLocationMissing && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-950 text-sm">Location Required</div>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                Your complaint appears valid, but adding the location will help the responsible department identify the issue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveLocation} className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={extraAddress}
                onChange={(e) => setExtraAddress(e.target.value)}
                placeholder="Street address / Area (e.g. Fort Road, Ward 3)"
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <input
                type="text"
                value={extraLandmark}
                onChange={(e) => setExtraLandmark(e.target.value)}
                placeholder="Landmark (e.g. Near Royal Palace Gate)"
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Add Location to Complaint
            </button>
          </form>
        </div>
      )}

      {/* Advisory Notice */}
      <div className="text-[10px] text-slate-500 bg-slate-50/80 rounded-xl p-2.5 border border-slate-200 leading-normal">
        <span className="font-semibold text-slate-700">Advisory Notice:</span> The AI verification and department recommendations are designed to assist citizens and municipal authorities in Smart City. AI suggestions are advisory and do not constitute an official government action until accepted by the municipal corporation.
      </div>

      {/* Bottom CTA Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {onRevise && (
          <button
            type="button"
            onClick={onRevise}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            Edit Grievance Text
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {ticketCreatedId ? (
            <button
              type="button"
              onClick={onTrackTicket}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Track Ticket #{ticketCreatedId}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            onConfirmSubmit && (
              <button
                type="button"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering Ticket...' : 'Confirm & Register Grievance Ticket'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
