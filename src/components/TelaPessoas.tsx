import React, { useState } from 'react';
import { Plus, X, UserPlus, ArrowRight, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { Pessoa } from '../types';
import { getAvatarColor } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface TelaPessoasProps {
  pessoas: Pessoa[];
  onAddPessoa: (nome: string) => boolean; // returns true if successful
  onRemovePessoa: (id: string) => void;
  onVoltar: () => void;
  onAvancar: () => void;
}

export default function TelaPessoas({
  pessoas,
  onAddPessoa,
  onRemovePessoa,
  onVoltar,
  onAvancar,
}: TelaPessoasProps) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [pessoaParaRemover, setPessoaParaRemover] = useState<Pessoa | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdicionar(nome);
  };

  const handleAdicionar = (nomeStr: string) => {
    const limpo = nomeStr.trim();
    if (!limpo) {
      setErro('Digite um nome para adicionar.');
      return;
    }
    if (pessoas.length >= 20) {
      setErro('Máximo de 20 pessoas atingido.');
      return;
    }
    if (pessoas.some((p) => p.nome.toLowerCase() === limpo.toLowerCase())) {
      setErro('Já existe uma pessoa com esse nome.');
      return;
    }

    const sucesso = onAddPessoa(limpo);
    if (sucesso) {
      setNome('');
      setErro('');
    }
  };

  const handleAdicionarEu = () => {
    handleAdicionar('Eu');
  };

  const confirmarRemocao = (pessoa: Pessoa) => {
    setPessoaParaRemover(pessoa);
  };

  const executarRemocao = () => {
    if (pessoaParaRemover) {
      onRemovePessoa(pessoaParaRemover.id);
      setPessoaParaRemover(null);
    }
  };

  const temEu = pessoas.some((p) => p.nome.toLowerCase() === 'eu');
  const podeAvancar = pessoas.length >= 2;

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
          id="btn-voltar-inicio"
          onClick={onVoltar}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-display font-bold text-stone-900">
          Quem está na mesa?
        </h2>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Inputs card */}
      <div className="bg-white rounded-3xl border border-amber-100 p-5 shadow-sm flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="nome-pessoa-input"
              type="text"
              placeholder="Nome da pessoa"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (erro) setErro('');
              }}
              className="w-full px-4 py-3 bg-[#FDF8F3]/50 border border-amber-100 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base"
              maxLength={15}
            />
          </div>
          <button
            id="btn-add-pessoa"
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-stone-50 p-3 rounded-2xl flex items-center justify-center transition-colors shadow-md shadow-amber-600/10 cursor-pointer aspect-square"
            style={{ width: '48px', height: '48px' }}
          >
            <Plus size={24} />
          </button>
        </form>

        {erro && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 animate-shake">
            <AlertCircle size={14} />
            <span>{erro}</span>
          </div>
        )}

        {/* Quick Suggestion */}
        {!temEu && (
          <div className="flex items-center justify-start gap-2 text-xs font-bold text-stone-500">
            <span>Sugestão rápida:</span>
            <button
              id="btn-sugestao-eu"
              type="button"
              onClick={handleAdicionarEu}
              className="px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={12} />
              Adicionar "Eu"
            </button>
          </div>
        )}
      </div>

      {/* People list */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
          <span>Integrantes ({pessoas.length})</span>
          <span>Mínimo 2 • Máximo 20</span>
        </div>

        {pessoas.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-amber-200/60 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-[#FDF8F3]/40">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <UserPlus size={20} />
            </div>
            <p className="text-sm font-bold text-stone-600 mb-1">Mesa vazia</p>
            <p className="text-xs text-stone-400 max-w-[200px]">Adicione os nomes das pessoas que vão rachar a conta.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[320px] pr-1 space-y-2">
            <AnimatePresence initial={false}>
              {pessoas.map((pessoa, index) => {
                const avatarCorClass = getAvatarColor(index);
                return (
                  <motion.div
                    key={pessoa.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between p-3 bg-white rounded-2xl border border-amber-100/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm uppercase ${avatarCorClass}`}>
                        {pessoa.nome.slice(0, 2)}
                      </div>
                      <span className="text-base font-bold text-stone-800">{pessoa.nome}</span>
                    </div>
                    <button
                      id={`btn-remover-pessoa-${pessoa.id}`}
                      onClick={() => confirmarRemocao(pessoa)}
                      className="p-2.5 bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl transition-all cursor-pointer hover:border hover:border-red-100"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fixed-like bottom bar */}
      <div className="mt-auto pt-4 border-t border-stone-200/80">
        <button
          id="btn-ir-para-itens"
          onClick={onAvancar}
          disabled={!podeAvancar}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-base ${
            podeAvancar
              ? 'bg-amber-600 hover:bg-amber-700 text-stone-50 shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
          style={{ minHeight: '52px' }}
        >
          Continuar para os itens
          <ArrowRight size={18} />
        </button>
        {!podeAvancar && (
          <p className="text-center text-[11px] font-bold text-stone-400 mt-2">
            Adicione pelo menos 2 pessoas para continuar (falta {2 - pessoas.length}).
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {pessoaParaRemover && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-xl border border-stone-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-950 mb-1">Deseja remover?</h3>
              <p className="text-sm text-stone-500 mb-6">
                Isso removerá <strong className="text-stone-800">{pessoaParaRemover.nome}</strong> e todas as atribuições de itens associadas a ela.
              </p>
              <div className="flex gap-3">
                <button
                  id="btn-cancelar-remover-pessoa"
                  onClick={() => setPessoaParaRemover(null)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-remover-pessoa"
                  onClick={executarRemocao}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-red-600/10 transition-colors cursor-pointer"
                >
                  Remover
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
