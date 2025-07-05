import React from "react";

interface PlayerNameFormProps {
  value: string;
  onChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

const PlayerNameForm: React.FC<PlayerNameFormProps> = ({ value, onChange, onSave, loading, error }) => (
  <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
    <div className="bg-white/90 rounded-lg shadow p-6 w-full max-w-md flex flex-col gap-6 items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Identifique-se</h1>
      <form onSubmit={onSave} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Digite seu nome"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="px-4 py-2 rounded border w-full text-lg"
          minLength={2}
          maxLength={16}
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !value.trim()}
        >
          {loading ? "Salvando..." : "Salvar nome"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
    <footer className="mt-12 text-xs text-gray-400">Desenvolvido com Next.js, TypeScript e Tailwind CSS</footer>
  </main>
);

export default PlayerNameForm; 