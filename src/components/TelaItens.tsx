import React, { useState } from 'react';
import { Plus, Minus, Edit2, Trash2, ArrowRight, ArrowLeft, PlusCircle, AlertCircle, Sparkles, Check, X } from 'lucide-react';
import { Item } from '../types';
import { formatBRL, formatBRLInput, parseBRLInput } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface TelaItensProps {
  itens: Item[];
  onAddItem: (nome: string, preco: number, quantidade: number) => void;
  onUpdateItem: (id: string, nome: string, preco: number, quantidade: number) => void;
  onRemoveItem: (id: string) => void;
  onVoltar: () => void;
  onAvancar: () => void;
}

export default function TelaItens({
  itens,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onVoltar,
  onAvancar,
}: TelaItensProps) {
  const [nome, setNome] = useState('');
  const [precoInput, setPrecoInput] = useState('R$ 0,00');
  const [precoNumeric, setPrecoNumeric] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState('');
  
  // Edit mode state
  const [editId, setEditId] = useState<string | null>(null);
  const [itemParaRemover, setItemParaRemover] = useState<Item | null>(null);

  // Set default currency string on mount or reset
  const resetForm = () => {
    setNome('');
    setPrecoInput('R$ 0,00');
    setPrecoNumeric(0);
    setQuantidade(1);
    setEditId(null);
    setErro('');
  };

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseBRLInput(rawVal);
    setPrecoNumeric(parsed);
    setPrecoInput(formatBRLInput(parsed));
    if (erro) setErro('');
  };

  const handleQtdChange = (delta: number) => {
    setQuantidade((prev) => Math.max(1, prev + delta));
  };

  const handleEditClick = (item: Item) => {
    setEditId(item.id);
    setNome(item.nome);
    setPrecoNumeric(item.preco);
    setPrecoInput(formatBRLInput(item.preco));
    setQuantidade(item.quantidade);
    setErro('');
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();

    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro('Digite o nome do produto.');
      return;
    }
    if (precoNumeric <= 0) {
      setErro('O preço deve ser maior que R$ 0,00.');
      return;
    }

    if (editId) {
      onUpdateItem(editId, nomeLimpo, precoNumeric, quantidade);
    } else {
      onAddItem(nomeLimpo, precoNumeric, quantidade);
    }

    resetForm();
  };

  const confirmarRemocao = (item: Item) => {
    setItemParaRemover(item);
  };

  const executarRemocao = () => {
    if (itemParaRemover) {
      onRemoveItem(itemParaRemover.id);
      setItemParaRemover(null);
      
      // If we are currently editing the item we are removing, reset form
      if (editId === itemParaRemover.id) {
        resetForm();
      }
    }
  };

  const totalSomaItens = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const podeAvancar = itens.length >= 1;

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
          id="btn-voltar-pessoas"
          onClick={onVoltar}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-display font-bold text-stone-900">
          O que foi consumido?
        </h2>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Item Form Card */}
      <div className="bg-white rounded-3xl border border-amber-100 p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <Sparkles size={12} />
            {editId ? 'Editando Item' : 'Novo Item'}
          </span>
          {editId && (
            <button
              id="btn-cancelar-edicao"
              onClick={resetForm}
              className="text-xs font-bold text-stone-400 hover:text-stone-600 cursor-pointer flex items-center gap-0.5"
            >
              <X size={12} />
              Cancelar edição
            </button>
          )}
        </div>

        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          {/* Nome do item */}
          <div>
            <label htmlFor="nome-item-input" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Item / Produto
            </label>
            <input
              id="nome-item-input"
              type="text"
              placeholder="Ex: Cerveja Heineken, Porção de batata"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (erro) setErro('');
              }}
              className="w-full px-4 py-3 bg-[#FDF8F3]/50 border border-amber-100 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base"
              maxLength={30}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Preço BRL */}
            <div>
              <label htmlFor="preco-item-input" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Preço Unitário
              </label>
              <input
                id="preco-item-input"
                type="text"
                inputMode="numeric"
                value={precoInput}
                onChange={handlePrecoChange}
                className="w-full px-4 py-3 bg-[#FDF8F3]/50 border border-amber-100 rounded-2xl text-stone-800 font-mono text-base focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Quantidade
              </label>
              <div className="flex items-center bg-[#FDF8F3]/50 border border-amber-100 rounded-2xl h-[50px] px-2 justify-between">
                <button
                  id="btn-diminuir-qtd"
                  type="button"
                  onClick={() => handleQtdChange(-1)}
                  disabled={quantidade <= 1}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    quantidade <= 1 ? 'text-stone-300' : 'hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  <Minus size={16} />
                </button>
                <span className="font-mono font-bold text-stone-800 text-base select-none">{quantidade}</span>
                <button
                  id="btn-aumentar-qtd"
                  type="button"
                  onClick={() => handleQtdChange(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 animate-shake">
              <AlertCircle size={14} />
              <span>{erro}</span>
            </div>
          )}

          <button
            id="btn-adicionar-item-salvar"
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-stone-50 font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
            style={{ minHeight: '48px' }}
          >
            {editId ? <Check size={18} /> : <PlusCircle size={18} />}
            {editId ? 'Salvar alterações' : 'Adicionar à conta'}
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
          <span>Itens Cadastrados ({itens.length})</span>
          <span>Soma: <strong className="text-amber-800 font-mono text-sm">{formatBRL(totalSomaItens)}</strong></span>
        </div>

        {itens.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-amber-200/60 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-[#FDF8F3]/40">
            <p className="text-sm font-bold text-stone-600 mb-1">Nenhum item adicionado</p>
            <p className="text-xs text-stone-400 max-w-[200px]">Adicione bebidas, porções e outros itens consumidos pela mesa.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-2">
            <AnimatePresence initial={false}>
              {itens.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center justify-between p-3.5 bg-white rounded-2xl border transition-colors shadow-xs ${
                    editId === item.id ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-50/10' : 'border-amber-100/80'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-stone-900 truncate">{item.nome}</p>
                    <p className="text-xs text-stone-500 font-bold font-mono mt-0.5">
                      {formatBRL(item.preco)} × {item.quantidade}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800 font-mono text-sm pr-1.5">
                      {formatBRL(item.preco * item.quantidade)}
                    </span>
                    
                    <button
                      id={`btn-editar-item-${item.id}`}
                      onClick={() => handleEditClick(item)}
                      className="p-2 bg-stone-50 hover:bg-amber-50 text-stone-500 hover:text-amber-700 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-amber-100"
                    >
                      <Edit2 size={15} />
                    </button>
                    
                    <button
                      id={`btn-remover-item-${item.id}`}
                      onClick={() => confirmarRemocao(item)}
                      className="p-2 bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fixed-like bottom bar */}
      <div className="mt-auto pt-4 border-t border-stone-200/80">
        <button
          id="btn-ir-para-atribuir"
          onClick={onAvancar}
          disabled={!podeAvancar}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-base ${
            podeAvancar
              ? 'bg-amber-600 hover:bg-amber-700 text-stone-50 shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
          style={{ minHeight: '52px' }}
        >
          Quem consumiu o quê?
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemParaRemover && (
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
              <h3 className="text-lg font-bold text-stone-950 mb-1">Remover item?</h3>
              <p className="text-sm text-stone-500 mb-6">
                Tem certeza que deseja remover <strong className="text-stone-800">{itemParaRemover.nome}</strong> da conta?
              </p>
              <div className="flex gap-3">
                <button
                  id="btn-cancelar-remover-item"
                  onClick={() => setItemParaRemover(null)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-remover-item"
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
