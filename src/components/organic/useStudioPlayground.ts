import { useCallback, useEffect, useState } from 'react';
import type { GearMeshKind } from '../../content/studioGearCatalog';
import { GEAR_BY_ID } from '../../content/studioGearCatalog';
import type { ZonePresetId } from '../../content/studioZonePresets';
import type { ExercisePropContext } from '../../content/exercisePropAffinity';
import {
  CoachPropBinding,
  idlePropBinding,
  syncPropsForExercise,
} from './coachPropInteraction';
import {
  GearInstance,
  StudioPlaygroundState,
  applyZonePreset,
  canPlace,
  findOpenCell,
  loadPlaygroundState,
  newInstanceId,
  savePlaygroundState,
} from './studioPlaygroundState';

export function useStudioPlayground() {
  const [state, setState] = useState<StudioPlaygroundState>(() => loadPlaygroundState());
  const [dragging, setDragging] = useState(false);
  const [propBinding, setPropBinding] = useState<CoachPropBinding>(() => idlePropBinding());

  useEffect(() => {
    savePlaygroundState(state);
  }, [state.instances, state.zoneId]);

  const setEditMode = useCallback((editMode: boolean) => {
    setState((s) => ({ ...s, editMode, selectedId: editMode ? s.selectedId : null }));
  }, []);

  const select = useCallback((selectedId: string | null) => {
    setState((s) => ({ ...s, selectedId }));
  }, []);

  const moveInstance = useCallback((id: string, x: number, z: number) => {
    setState((s) => ({
      ...s,
      zoneId: null,
      instances: s.instances.map((i) => (i.instanceId === id ? { ...i, x, z } : i)),
    }));
  }, []);

  const rotateSelected = useCallback(() => {
    setState((s) => {
      if (!s.selectedId) return s;
      const inst = s.instances.find((i) => i.instanceId === s.selectedId);
      if (!inst) return s;
      const steps = GEAR_BY_ID[inst.gearId].yawSteps;
      const idx = Math.max(0, steps.indexOf(inst.yawDeg));
      const nextYaw = steps[(idx + 1) % steps.length] ?? ((inst.yawDeg + 90) % 360);
      const trial = { ...inst, yawDeg: nextYaw };
      if (!canPlace(trial, s.instances, inst.instanceId, { allowCoachOverlap: Boolean(inst.sessionRole) })) {
        return s;
      }
      return {
        ...s,
        zoneId: null,
        instances: s.instances.map((i) => (i.instanceId === s.selectedId ? trial : i)),
      };
    });
  }, []);

  const removeSelected = useCallback(() => {
    setState((s) => {
      if (!s.selectedId) return s;
      return {
        ...s,
        zoneId: null,
        selectedId: null,
        instances: s.instances.filter((i) => i.instanceId !== s.selectedId),
      };
    });
  }, []);

  const addGear = useCallback((gearId: GearMeshKind) => {
    setState((s) => {
      const open = findOpenCell(gearId, s.instances);
      if (!open) return s;
      const inst: GearInstance = {
        instanceId: newInstanceId(gearId),
        gearId,
        x: open.x,
        z: open.z,
        yawDeg: 0,
      };
      return {
        ...s,
        zoneId: null,
        editMode: true,
        selectedId: inst.instanceId,
        instances: [...s.instances, inst],
      };
    });
  }, []);

  const applyZone = useCallback((zoneId: ZonePresetId) => {
    setPropBinding(idlePropBinding());
    setState((s) => ({
      ...s,
      zoneId,
      selectedId: null,
      editMode: true,
      instances: applyZonePreset(zoneId),
      sessionMeta: null,
      activeInstanceId: null,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setPropBinding(idlePropBinding());
    setState((s) => ({
      ...s,
      zoneId: 'clear',
      selectedId: null,
      instances: [],
      sessionMeta: null,
      activeInstanceId: null,
    }));
  }, []);

  /**
   * Session transition hook — fire when the active exercise / asana changes.
   * Updates prop selection, auto-spawns required gear, and coach binding.
   */
  const syncExercise = useCallback((ctx: ExercisePropContext) => {
    setState((s) => {
      const result = syncPropsForExercise(ctx, s.instances, {
        editMode: s.editMode,
        autoSpawn: !s.editMode,
      });
      Promise.resolve().then(() => setPropBinding(result.binding));
      return {
        ...s,
        instances: result.instances,
        activeInstanceId: result.meta.activeInstanceId,
        sessionMeta: result.meta,
        selectedId: s.editMode ? s.selectedId : result.meta.activeInstanceId ?? s.selectedId,
      };
    });
  }, []);

  return {
    state,
    dragging,
    setDragging,
    propBinding,
    setEditMode,
    select,
    moveInstance,
    rotateSelected,
    removeSelected,
    addGear,
    applyZone,
    clearAll,
    syncExercise,
  };
}
