import React, { useEffect, useState } from 'react';
import GameIcon from './icons/GameIcon';

interface GameStartNotificationProps {
  onClose: () => void;
  duration?: number; // em ms
}

const GameStartNotification: React.FC<GameStartNotificationProps> = ({ onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration, visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 w-full flex justify-center z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <GameIcon size={22} className="inline align-text-bottom" />
        <span className="font-semibold">Game started automatically! Good luck!</span>
      </div>
    </div>
  );
};

export default GameStartNotification; 