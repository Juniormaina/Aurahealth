import React from 'react';
import { Box, Grid3x3, RotateCcw, Trash2, Wrench } from 'lucide-react';
import { STUDIO_GEAR_CATALOG, type GearMeshKind } from '../../content/studioGearCatalog';
import { STUDIO_ZONE_PRESETS, type ZonePresetId } from '../../content/studioZonePresets';
import type { StudioPlaygroundState } from './studioPlaygroundState';
import { GEAR_BY_ID } from '../../content/studioGearCatalog';

interface StudioGearPanelProps {
  mode: 'calisthenics' | 'yoga';
  state: StudioPlaygroundState;
  onToggleEdit: () => void;
  onAdd: (gearId: GearMeshKind) => void;
  onApplyZone: (zoneId: ZonePresetId) => void;
  onRotate: () => void;
  onRemove: () => void;
  onClear: () => void;
  /** Live AI prop binding label */
  aiStatus?: string | null;
}

export const StudioGearPanel: React.FC<StudioGearPanelProps> = ({
  mode,
  state,
  onToggleEdit,
  onAdd,
  onApplyZone,
  onRotate,
  onRemove,
  onClear,
  aiStatus,
}) => {
  const catalog = STUDIO_GEAR_CATALOG.filter(
    (g) => g.category === 'shared' || g.category === mode || g.category === 'calisthenics' || g.category === 'yoga'
  );
  const selected = state.instances.find((i) => i.instanceId === state.selectedId);
  const meta = state.sessionMeta;

  return (
    <div className="studio-gear-panel pointer-events-auto flex max-w-[min(100%,20rem)] flex-col gap-1.5">
      {(aiStatus || meta) && (
        <span
          className={`w-fit max-w-full truncate rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm ${
            meta?.usingFallback
              ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30'
              : meta?.bindMode === 'bodyweight'
                ? 'bg-black/40 text-emerald-200/75 border border-white/10'
                : 'bg-emerald-500/20 text-emerald-50 border border-emerald-400/35'
          }`}
          title={aiStatus ?? meta?.affinityLabel}
        >
          {meta?.usingFallback
            ? 'AI · bodyweight fallback'
            : meta?.bindMode === 'bodyweight'
              ? 'AI · bodyweight'
              : `AI · ${meta?.affinityLabel ?? aiStatus}`}
        </span>
      )}

      <button
        type="button"
        onClick={onToggleEdit}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm transition-colors w-fit ${
          state.editMode
            ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-50'
            : 'border-emerald-500/30 bg-black/45 text-emerald-200/80 hover:text-emerald-50'
        }`}
        aria-pressed={state.editMode}
      >
        <Wrench className="h-3.5 w-3.5 shrink-0" />
        {state.editMode ? 'Editing zone' : 'Gear & zones'}
      </button>

      {state.editMode && (
        <div className="rounded-xl border border-emerald-500/25 bg-black/55 p-2 shadow-lg backdrop-blur-md max-h-[min(42vh,18rem)] overflow-y-auto overscroll-contain">
          <p className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300/70">
            <Grid3x3 className="h-3 w-3" />
            Training zones
          </p>
          <div className="mb-2 grid grid-cols-2 gap-1">
            {STUDIO_ZONE_PRESETS.map((zone) => {
              const active = state.zoneId === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => onApplyZone(zone.id)}
                  className={`min-h-10 rounded-lg border px-1.5 py-1 text-left transition-colors ${
                    active
                      ? 'border-emerald-400/45 bg-emerald-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-[10px] font-semibold text-emerald-50 leading-tight">{zone.label}</span>
                  <span className="block text-[8px] text-emerald-200/50 leading-snug line-clamp-2">{zone.description}</span>
                </button>
              );
            })}
          </div>

          <p className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300/70">
            <Box className="h-3 w-3" />
            Prop catalog
          </p>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-2">
            {catalog.map((gear) => (
              <button
                key={gear.id}
                type="button"
                title={gear.description}
                onClick={() => onAdd(gear.id)}
                className="min-h-10 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-left hover:border-emerald-400/35 hover:bg-emerald-500/10"
              >
                <span className="block text-[10px] font-semibold text-emerald-50 leading-tight">{gear.shortLabel}</span>
                <span className="block text-[8px] capitalize text-emerald-200/45">{gear.category}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-white/10 pt-2">
              <span className="mr-auto truncate text-[9px] text-emerald-200/70">
                {GEAR_BY_ID[selected.gearId].label}
              </span>
              <button
                type="button"
                onClick={onRotate}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-emerald-100"
                aria-label="Rotate prop"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-rose-400/30 bg-rose-500/15 text-rose-100"
                aria-label="Remove prop"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClear}
            className="mt-2 w-full min-h-9 rounded-lg border border-white/10 text-[9px] font-semibold uppercase tracking-wide text-emerald-200/55 hover:text-emerald-100"
          >
            Clear all props
          </button>
          <p className="mt-1.5 text-[8px] leading-snug text-emerald-200/40">
            Drag props on the grid · snap cells avoid overlaps · red ring is coach space
          </p>
        </div>
      )}
    </div>
  );
};
