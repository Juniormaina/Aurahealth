import React from 'react';
import { VALUE_PROPS } from '../content/valueProps';

interface UpgradePromptProps {
  onUpgrade: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onUpgrade }) => (
  <div className="aura-card p-4 rounded-2xl border border-[#FFB800]/40 flex flex-col sm:flex-row sm:items-center gap-3">
    <p className="text-sm text-slate-200 leading-[1.6] flex-1">{VALUE_PROPS.culturalRelevance}</p>
    <button type="button" onClick={onUpgrade} className="btn-primary text-xs shrink-0">
      Start Free Trial
    </button>
  </div>
);
