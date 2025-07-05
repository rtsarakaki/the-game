import React from 'react';
import { CopyIcon, EmailIcon, WhatsAppIcon, CheckIcon, OpenInNewTabIcon, IncognitoIcon } from './ShareIcons';
import type { IPlayerLink } from '@/hooks/usePlayerLinks';

interface PlayerLinkCardProps {
  player: IPlayerLink;
  index: number;
  copiedLinkId: string | null;
  onCopy: (url: string, id: string) => void;
  onOpen: (url: string) => void;
  onIncognito: (url: string, id: string) => void;
  onEmail: (name: string, url: string) => void;
  onWhatsApp: (name: string, url: string) => void;
}

const PlayerLinkCard: React.FC<PlayerLinkCardProps> = ({
  player,
  index,
  copiedLinkId,
  onCopy,
  onOpen,
  onIncognito,
  onEmail,
  onWhatsApp,
}) => (
  <div
    className={`p-4 rounded-lg border-2 ${
      player.hasName ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">
          {player.hasName ? player.name : `Player ${index + 1}`}
        </span>
        {player.hasName ? (
          <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">✓ Connected</span>
        ) : (
          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">⏳ Waiting</span>
        )}
      </div>
    </div>
    <div className="mb-3">
      <input
        type="text"
        value={player.url}
        readOnly
        className="w-full p-2 text-xs bg-gray-100 border rounded font-mono text-gray-600"
      />
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => onCopy(player.url, player.id)}
        className="p-2 bg-blue-100 hover:bg-blue-200 rounded transition flex items-center justify-center"
        title="Copy link"
        aria-label="Copy link"
      >
        {copiedLinkId === player.id ? (
          <CheckIcon size={16} className="text-blue-600" />
        ) : (
          <CopyIcon size={16} className="text-blue-600" />
        )}
      </button>
      <button
        onClick={() => onOpen(player.url)}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center"
        title="Open in new tab"
        aria-label="Open in new tab"
      >
        <OpenInNewTabIcon size={16} className="text-gray-700" />
      </button>
      <button
        onClick={() => onIncognito(player.url, player.id)}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center"
        title="Open in incognito (copy link)"
        aria-label="Open in incognito"
      >
        <IncognitoIcon size={16} className="text-gray-700" />
      </button>
      <button
        onClick={() => onEmail(player.name, player.url)}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center"
        title="Share by Email"
        aria-label="Share by Email"
      >
        <EmailIcon size={16} className="text-gray-700" />
      </button>
      <button
        onClick={() => onWhatsApp(player.name, player.url)}
        className="p-2 bg-green-100 hover:bg-green-200 rounded transition flex items-center justify-center"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <WhatsAppIcon size={16} className="text-green-700" />
      </button>
    </div>
  </div>
);

export default PlayerLinkCard; 