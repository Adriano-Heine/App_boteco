import React from 'react';
import { Beer, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TelaInicioProps {
  nomeMesa: string;
  setNomeMesa: (name: string) => void;
  onAvancar: () => void;
}

export default function TelaInicio({ nomeMesa, setNomeMesa, onAvancar }: TelaInicioProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAvancar();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-6 py-8 flex-1"
    >
      {/* Hero Icon & Title */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center shadow-inner mb-4 text-amber-600 border border-amber-200">
          <Beer size={44} strokeWidth={1.5} className="animate-pulse" />
        </div>
        <h1 className="text-4xl font-display font-black tracking-tight text-stone-900 mb-2">
          Racha <span className="text-amber-600">Conta</span>
        </h1>
        <p className="text-stone-500 text-sm max-w-[260px]">
          Divida a conta da mesa do bar de forma simples, justa e sem estresse.
        </p>
      </div>

      {/* Main card */}
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-3xl border border-amber-100 p-6 shadow-sm mb-6 flex flex-col gap-5">
        <div>
          <label htmlFor="nome-mesa-input" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Identificar a Mesa (Opcional)
          </label>
          <input
            id="nome-mesa-input"
            type="text"
            placeholder="Ex: Mesa 3, Aniversário do João"
            value={nomeMesa}
            onChange={(e) => setNomeMesa(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#FDF8F3]/50 border border-amber-100 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-all"
            maxLength={35}
          />
        </div>

        <button
          id="btn-comecar-mesa"
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-stone-50 font-bold py-4 px-6 rounded-2xl shadow-md shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group text-base"
          style={{ minHeight: '52px' }}
        >
          Começar nova mesa
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </motion.div>
  );
}
