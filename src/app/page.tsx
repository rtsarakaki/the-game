"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DiceIcon } from "@/components/ShareIcons";
import AppFooter from "@/components/AppFooter";
import ErrorMessage from '@/components/ErrorMessage';
import InputBlock from '@/components/InputBlock';
import PrimaryButton from '@/components/PrimaryButton';
import SectionCard from '@/components/SectionCard';
import HowToPlayCard from '@/components/HowToPlayCard';
import CreateGameIntro from '@/components/CreateGameIntro';
import PageTitle from '@/components/PageTitle';
import { createGame } from '@/services/gameService';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const router = useRouter();

  const navigateToGamePage = (gameId: string) => {
    router.push(`/partida/${gameId}`);
  };

  const handleCreateGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const gameId = await createGame(numPlayers);
      navigateToGamePage(gameId);
    } catch {
      setError("Não foi possível criar a partida. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gray-50">
      <PageTitle>The Game Online</PageTitle>
      
      <CreateGameIntro />

      <SectionCard className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <InputBlock
            id="numPlayers"
            label="Número de jogadores"
            type="number"
            min={2}
            max={6}
            value={numPlayers}
            onChange={e => setNumPlayers(Math.max(2, Math.min(6, Number(e.target.value))))}
          />
          
          <PrimaryButton
            onClick={handleCreateGame}
            loading={loading}
            iconLeft={<DiceIcon size={24} className="text-white" />}
            aria-label="Criar nova partida"
            title="Criar nova partida"
          >
            Criar Nova Partida
          </PrimaryButton>
          
          <ErrorMessage message={error} />
        </div>
      </SectionCard>

      <HowToPlayCard />

      <AppFooter />
    </div>
  );
}
