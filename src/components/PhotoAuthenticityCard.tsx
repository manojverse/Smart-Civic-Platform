import React, { useState } from 'react';
import { PhotoAuthenticityAnalysis, ImageFraudVerdict } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TEST_EVIDENCE_PRESETS, analyzePhotoAuthenticity } from '../services/imageAuthenticityService';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Camera,
  Layers,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Cpu,
  Fingerprint,
} from 'lucide-react';

interface PhotoAuthenticityCardProps {
  analysis: PhotoAuthenticityAnalysis | null;
  onSelectPreset?: (preset: (typeof TEST_EVIDENCE_PRESETS)[0], analysisResult: PhotoAuthenticityAnalysis) => void;
  isLoading?: boolean;
}

export const PhotoAuthenticityCard: React.FC<PhotoAuthenticityCardProps> = ({
  analysis,
  onSelectPreset,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [isPresetLoading, setIsPresetLoading] = useState<boolean>(false);

  const handleApplyPreset = async (preset: (typeof TEST_EVIDENCE_PRESETS)[0]) => {
    setSelectedPresetId(preset.id);
    setIsPresetLoading(true);
    try {
      const result = await analyzePhotoAuthenticity({
        photoUrl: preset.url,
        reportedCategory: preset.category,
        reportedDescription: preset.description,
      });
      if (onSelectPreset) {
        onSelectPreset(preset, result);
      }
    } finally {
      setIsPresetLoading(false);
    }
  };

  const isAiSuspect = analysis?.isAiGenerated || analysis?.imageFraudVerdict === 'SUSPECTED_AI_GENERATED';
  const isMismatched = analysis?.imageFraudVerdict === 'MISMATCHED_IMAGE';
  const isAuthentic = analysis?.imageFraudVerdict === 'AUTHENTIC_FIELD_CAPTURE';

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{t.photoAuthTitle}</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                CV 2.4
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">{t.photoAuthSubtitle}</p>
          </div>
        </div>

        {analysis && (
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                isAuthentic
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isAiSuspect
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isAuthentic ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : isAiSuspect ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <HelpCircle className="w-3.5 h-3.5" />
              )}
              <span>{analysis.authenticityScore}% Score</span>
            </span>
          </div>
        )}
      </div>

      {/* Preset Test Suite Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300">{t.testPhotosTitle}:</span>
          <span className="text-[10px] text-slate-400">Click to test instant fraud detection</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {TEST_EVIDENCE_PRESETS.slice(0, 3).map((p) => {
            const active = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                disabled={isPresetLoading || isLoading}
                className={`text-left p-2 rounded-lg border text-[11px] transition-all flex items-center justify-between gap-1.5 ${
                  active
                    ? 'bg-indigo-900/60 border-indigo-400 text-white font-medium'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <div className="font-semibold truncate">{p.label.split('(')[0]}</div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {p.id === 'preset-real-pothole'
                      ? '✓ Authentic 96%'
                      : p.id === 'preset-ai-fake-pothole'
                      ? '⚠️ Fake AI 94%'
                      : '❓ Mismatched'}
                  </div>
                </div>
                {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Result Box */}
      {analysis ? (
        <div className="space-y-3 pt-1">
          {/* Main Verdict Banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isAuthentic
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100'
                : isAiSuspect
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-100'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-100'
            }`}
          >
            <div className="mt-0.5">
              {isAuthentic ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : isAiSuspect ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : (
                <HelpCircle className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wide">
                  {isAuthentic
                    ? t.verdictAuthentic
                    : isAiSuspect
                    ? t.verdictAiGenerated
                    : isMismatched
                    ? t.verdictMismatched
                    : t.verdictStockOrEdited}
                </span>
                <span className="text-[10px] opacity-80 font-mono">
                  Tamper Risk: {analysis.tamperRisk}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{analysis.relevanceExplanation}</p>
            </div>
          </div>

          {/* Forensic Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block">{t.detectedVisualProblem}</span>
              <span className="font-semibold text-slate-200 truncate block">
                {analysis.detectedCivicFeature}
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block">{t.visualSeverity}</span>
              <span className="font-semibold text-slate-200 block">
                {analysis.detectedFeatureSeverity} Hazard
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block">{t.tamperIntegrityTitle}</span>
              <span className="font-mono text-slate-200 text-[11px] block">
                {analysis.exifIntegrity}
              </span>
            </div>
          </div>

          {/* Detection Markers list */}
          {analysis.detectionMarkers && analysis.detectionMarkers.length > 0 && (
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Forensic CV Markers Identified
              </span>
              <div className="space-y-1">
                {analysis.detectionMarkers.map((marker, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
                    <span>{marker}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Warning Alert if AI or Mismatch */}
          {(isAiSuspect || isMismatched) && (
            <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-200 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{t.aiPhotoWarningAlert}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-slate-400 text-xs py-5">
          <Camera className="w-6 h-6 mx-auto mb-1.5 text-slate-500" />
          <p>Upload a photo or select a test scenario to inspect image authenticity & civic feature features.</p>
        </div>
      )}
    </div>
  );
};
