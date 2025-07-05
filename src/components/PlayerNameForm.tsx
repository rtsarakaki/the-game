import React from "react";
import InputBlock from './InputBlock';
import AppFooter from './AppFooter';
import SectionCard from './SectionCard';

interface PlayerNameFormProps {
  value: string;
  onChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

const PlayerNameForm: React.FC<PlayerNameFormProps> = ({ value, onChange, onSave, loading, error }) => (
  <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
    <SectionCard className="bg-white/90 w-full max-w-md flex flex-col gap-6 items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Identifique-se</h1>
      <form onSubmit={onSave} className="flex flex-col gap-4 w-full max-w-xs">
        <InputBlock
          id="playerName"
          label="Nome do jogador"
          type="text"
          placeholder="Digite seu nome"
          value={value}
          onChange={e => onChange(e.target.value)}
          minLength={2}
          maxLength={16}
          disabled={loading}
          autoFocus
          error={error}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !value.trim()}
        >
          {loading ? "Salvando..." : "Salvar nome"}
        </button>
      </form>
    </SectionCard>
    <AppFooter />
  </main>
);

export default PlayerNameForm; 