import React from 'react';
import PlayerLinkCard from './PlayerLinkCard';
import PlayerLinksTip from './PlayerLinksTip';
import type { IPlayerLink } from '@/hooks/usePlayerLinks';

interface PlayerLinksPanelProps {
  playerLinks: IPlayerLink[];
  copiedLinkId: string | null;
  onCopy: (url: string, id: string) => void;
  onEmail: (name: string, url: string) => void;
  onWhatsApp: (name: string, url: string) => void;
  onCopyAll: () => void;
}

const PlayerLinksPanel: React.FC<PlayerLinksPanelProps> = ({
  playerLinks,
  copiedLinkId,
  onCopy,
  onEmail,
  onWhatsApp,
  onCopyAll,
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">Player Links</h2>
      <button
        onClick={onCopyAll}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center gap-1"
      >
        Copy All
      </button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {playerLinks.map((player, index) => (
        <PlayerLinkCard
          key={player.id}
          player={player}
          index={index}
          copiedLinkId={copiedLinkId}
          onCopy={onCopy}
          onOpen={url => window.open(url, '_blank')}
          onIncognito={(url, id) => {
            onCopy(url, id);
            alert('Link copied! Open an incognito tab and paste the link.');
          }}
          onEmail={onEmail}
          onWhatsApp={onWhatsApp}
        />
      ))}
    </div>
    <PlayerLinksTip />
  </div>
);

export default PlayerLinksPanel; 