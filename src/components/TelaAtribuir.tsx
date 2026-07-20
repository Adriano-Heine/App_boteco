import React from 'react';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Users2 } from 'lucide-react';
import { Pessoa, Item } from '../types';
import { formatBRL, getAvatarColor } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface TelaAtribuirProps {
  pessoas: Pessoa[];
  itens: Item[];
  onTogglePessoaNoItem: (itemId: string, pessoaId: string) => void;
  onToggleTodosNoItem: (itemId: string) => void;
  onVoltar: () => void;
  onAvancar: () => void;
}

export default function TelaAtribuir({
  pessoas,
  itens,
  onTogglePessoaNoItem,
  onToggleTodosNoItem,
  onVoltar,
  onAvancar,
}: TelaAtribuirProps) {
  
  // Check if every item has at least one person assigned
  const todosItensAtribuidos = itens.every((item) => item.pessoasIds.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-5"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          id="btn-voltar-itens"
          onClick={onVoltar}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-display font-bold text-stone-900">
          Quem consumiu o quê?
        </h2>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <p className="text-stone-500 text-xs px-1 leading-relaxed">
        Selecione cada item abaixo para marcar quem o consumiu. Se o item foi compartilhado, marque mais de uma pessoa para dividir o valor igualmente.
      </p>

      {/* Items Attribution List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[460px]">
        {itens.map((item, itemIdx) => {
          const valorTotal = item.preco * item.quantidade;
          const qtdPessoasAtribuidas = item.pessoasIds.length;
          const valorDividido = qtdPessoasAtribuidas > 0 ? valorTotal / qtdPessoasAtribuidas : valorTotal;
          const isPendente = qtdPessoasAtribuidas === 0;
          const todosSelecionados = qtdPessoasAtribuidas === pessoas.length;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all duration-200 ${
                isPendente
                  ? 'bg-red-50/40 border-red-200 ring-1 ring-red-100'
                  : 'bg-white border-amber-100 shadow-sm'
              }`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between gap-2 mb-3.5">
                <div>
                  <h4 className="font-bold text-stone-900 text-base flex items-center gap-1.5 leading-snug">
                    {item.nome}
                    <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full font-mono font-medium">
                      x{item.quantidade}
                    </span>
                  </h4>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    Total: {formatBRL(valorTotal)}
                    {qtdPessoasAtribuidas > 1 && (
                      <span className="text-amber-800 font-semibold ml-1 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                        {formatBRL(valorDividido)}/cada
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  {isPendente ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded-md">
                      <AlertTriangle size={12} />
                      Pendente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                      <Check size={12} strokeWidth={3} />
                      {qtdPessoasAtribuidas === 1 ? '1 Pessoa' : `${qtdPessoasAtribuidas} Pessoas`}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick action: SELECT ALL */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                  Marcar integrantes:
                </span>
                <button
                  id={`btn-toggle-todos-${item.id}`}
                  onClick={() => onToggleTodosNoItem(item.id)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    todosSelecionados
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Users2 size={12} />
                  {todosSelecionados ? 'Limpar todos' : 'Todos'}
                </button>
              </div>

              {/* People grid */}
              <div className="grid grid-cols-2 gap-2">
                {pessoas.map((pessoa, pIdx) => {
                  const estaSelecionado = item.pessoasIds.includes(pessoa.id);
                  const avatarCorClass = getAvatarColor(pIdx);

                  return (
                    <button
                      key={pessoa.id}
                      id={`btn-atribuir-${item.id}-${pessoa.id}`}
                      onClick={() => onTogglePessoaNoItem(item.id, pessoa.id)}
                      className={`flex items-center gap-2 p-2 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-98 ${
                        estaSelecionado
                          ? 'bg-amber-50 border-amber-500 shadow-xs'
                          : 'bg-[#FDF8F3]/50 border-amber-100/60 text-stone-500 hover:bg-white hover:border-amber-200'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs transition-opacity ${avatarCorClass} ${
                            estaSelecionado ? 'opacity-100' : 'opacity-60'
                          }`}
                        >
                          {pessoa.nome.slice(0, 2)}
                        </div>
                        {estaSelecionado && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold truncate transition-colors leading-tight ${
                            estaSelecionado ? 'text-stone-900' : 'text-stone-500'
                          }`}
                        >
                          {pessoa.nome}
                        </p>
                        {estaSelecionado && (
                          <p className="text-[10px] font-mono text-amber-800 font-semibold mt-0.5">
                            {formatBRL(valorDividido)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed-like bottom bar */}
      <div className="mt-auto pt-4 border-t border-stone-200/80 flex flex-col gap-2">
        <button
          id="btn-ver-resultado"
          onClick={onAvancar}
          disabled={!todosItensAtribuidos}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-base ${
            todosItensAtribuidos
              ? 'bg-amber-600 hover:bg-amber-700 text-stone-50 shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
          style={{ minHeight: '52px' }}
        >
          Ver resultado
          <ArrowRight size={18} />
        </button>
        {!todosItensAtribuidos && (
          <p className="text-center text-[11px] text-red-500 font-bold animate-pulse">
            Selecione quem consumiu os itens marcados como "Pendente" para continuar.
          </p>
        )}
      </div>
    </motion.div>
  );
}
