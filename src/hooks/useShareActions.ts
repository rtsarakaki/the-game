import { useState } from 'react';
import type { IPlayerLink } from './usePlayerLinks';

export function useShareActions() {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = (playerName: string, url: string) => {
    const subject = encodeURIComponent('The Game - Invitation');
    const body = encodeURIComponent(
      `Hello ${playerName}!\n\n` +
      `You have been invited to play The Game!\n\n` +
      `Click the link below to join the game:\n${url}\n\n` +
      `Have fun! 🎮`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = (playerName: string, url: string) => {
    const message = encodeURIComponent(
      `🎮 *The Game - Invitation*\n\n` +
      `Hello ${playerName}!\n\n` +
      `You have been invited to play The Game!\n\n` +
      `Click the link to join the game:\n${url}\n\n` +
      `Have fun! 🎯`
    );
    window.open(`https://wa.me/?text=${message}`);
  };

  const copyAllLinks = (playerLinks: IPlayerLink[]) => {
    const allLinks = playerLinks.map((player, index) =>
      `Player ${index + 1}: ${player.url}`
    ).join('\n');
    copyToClipboard(allLinks, 'all-links');
  };

  return { copiedLinkId, copyToClipboard, shareViaEmail, shareViaWhatsApp, copyAllLinks };
} 