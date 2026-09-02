import React from 'react';
import { Proof } from './landing/Proof';
import { Rewards } from './landing/Rewards';
import { Pricing } from './landing/Pricing';
import { Trust } from './landing/Trust';

interface AboutViewProps {
  onStartTrial: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onStartTrial }) => (
  <div className="space-y-2">
    <header className="glass-panel rounded-2xl p-5 sm:p-6 mb-4">
      <p className="view-kicker">About</p>
      <h2 className="view-title !text-2xl sm:!text-3xl mt-1">Proof, rewards & pricing</h2>
      <p className="view-copy mt-2 max-w-2xl">
        Outcomes we track, optional wellness points, and plans — kept here so the landing page stays focused on the daily habit.
      </p>
    </header>
    <Proof />
    <Rewards />
    <Pricing onStartTrial={onStartTrial} />
    <Trust />
  </div>
);
