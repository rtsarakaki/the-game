import React, { useState } from 'react';
import PlayerNameForm from './PlayerNameForm';
import { useUpdatePlayerName } from '@/hooks/useUpdatePlayerName';
import type { IGame, IPlayer } from '@/domain/types';

interface PlayerNameSectionProps {
  game: IGame | null;
  player: IPlayer | null;
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
}

const PlayerNameSection: React.FC<PlayerNameSectionProps> = ({ game, player, setGame, setPlayer }) => {
  const [input, setInput] = useState('');
  const {
    handleUpdatePlayerName,
    loading,
    error,
    setError,
  } = useUpdatePlayerName(game, player, setGame, setPlayer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = input.trim();
    if (!name) {
      setError('O nome não pode ser vazio.');
      return;
    }
    if (game?.players.some(j => j && j.name && j.name.toLowerCase() === name.toLowerCase())) {
      setError('Este nome já está em uso por outro jogador.');
      return;
    }
    await handleUpdatePlayerName(name);
    setInput('');
  };

  return (
    <PlayerNameForm
      value={input}
      onChange={setInput}
      onSave={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default PlayerNameSection; 