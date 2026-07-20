import React, { useState, useMemo } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check, Users, Percent, Smile, ChevronDown, ChevronUp } from 'lucide-react';
import { Pessoa, Item } from '../types';
import { formatBRL, getAvatarColor } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface TelaResumoProps {
  nomeMesa: string;
  pessoas: Pessoa[];
  itens: Item[];
  gorjetaPercentual: number;
  setGorjetaPercentual: (val: number) => void;
  gorjetaAtiva: boolean;
  setGorjetaAtiva: (val: boolean) => void;
  onReiniciar: () => void;
  onVoltar: () => void;
}

export default function TelaResumo({
  nomeMesa,
  pessoas,
  itens,
  gorjetaPercentual,
  setGorjetaPercentual,
  gorjetaAtiva,
  setGorjetaAtiva,
  onReiniciar,
  onVoltar,
}: TelaResumoProps) {
  const [copiado, setCopiado] = useState(false);
  const [mostrarGorjetaConfig, setMostrarGorjetaConfig] = useState(false);
  const [usuarioExpandido, setUsuarioExpandido] = useState<Record<string, boolean>>({});

  // Calculations
  const calculations = useMemo(() => {
    // 1. Calculate base subtotal per person
    const subtotais: Record<string, number> = {};
    const detalhesPorPessoa: Record<string, Array<{ itemNome: string; totalItem: number; totalPessoas: number; valorIndividual: number }>> = {};

    pessoas.forEach((p) => {
      subtotais[p.id] = 0;
      detalhesPorPessoa[p.id] = [];
    });

    itens.forEach((item) => {
      const valorTotalItem = item.preco * item.quantidade;
      const numPessoas = item.pessoasIds.length;
      if (numPessoas > 0) {
        const valorPorPessoa = valorTotalItem / numPessoas;
        item.pessoasIds.forEach((pId) => {
          if (subtotais[pId] !== undefined) {
            subtotais[pId] += valorPorPessoa;
            detalhesPorPessoa[pId].push({
              itemNome: item.nome,
              totalItem: valorTotalItem,
              totalPessoas: numPessoas,
              valorIndividual: valorPorPessoa,
            });
          }
        });
      }
    });

    // 2. Sum everything up
    const subtotalGeral = Object.values(subtotais).reduce((sum, val) => sum + val, 0);
    const gorjetaPercent = gorjetaAtiva ? gorjetaPercentual : 0;
    const gorjetaGeral = subtotalGeral * (gorjetaPercent / 100);
    const totalGeral = subtotalGeral + gorjetaGeral;

    // Calculate totals per person with tip
    const totaisIndividuais: Record<string, { subtotal: number; gorjeta: number; total: number }> = {};
    pessoas.forEach((p) => {
      const sub = subtotais[p.id] || 0;
      const gorj = sub * (gorjetaPercent / 100);
      totaisIndividuais[p.id] = {
        subtotal: sub,
        gorjeta: gorj,
        total: sub + gorj,
      };
    });

    return {
      subtotais,
      detalhesPorPessoa,
      subtotalGeral,
      gorjetaGeral,
      totalGeral,
      totaisIndividuais,
    };
  }, [pessoas, itens, gorjetaPercentual, gorjetaAtiva]);

  const toggleUsuarioExpandido = (pId: string) => {
    setUsuarioExpandido((prev) => ({
      ...prev,
      [pId]: !prev[pId],
    }));
  };

  const handleCopiarResumo = () => {
    const identMesa = nomeMesa.trim() ? `da ${nomeMesa.trim()}` : '';
    let text = `📊 *Resumo Racha Conta* ${identMesa}\n\n`;

    pessoas.forEach((p, idx) => {
      const ind = calculations.totaisIndividuais[p.id];
      const detalhe = calculations.detalhesPorPessoa[p.id];
      text += `👤 *${p.nome}*: ${formatBRL(ind.total)}\n`;
      
      detalhe.forEach((d) => {
        const shareLabel = d.totalPessoas > 1 ? ` (1/${d.totalPessoas})` : '';
        text += `  - ${d.itemNome}${shareLabel}: ${formatBRL(d.valorIndividual)}\n`;
      });

      if (gorjetaAtiva) {
        text += `  - Garçom (${gorjetaPercentual}%): ${formatBRL(ind.gorjeta)}\n`;
      }
      text += `\n`;
    });

    text += `💰 *Subtotal da mesa*: ${formatBRL(calculations.subtotalGeral)}\n`;
    if (gorjetaAtiva) {
      text += `🧑🍳 *Garçom (${gorjetaPercentual}%)*: ${formatBRL(calculations.gorjetaGeral)}\n`;
      text += `✅ *Total Geral com gorjeta*: ${formatBRL(calculations.totalGeral)}\n`;
    } else {
      text += `✅ *Total Geral*: ${formatBRL(calculations.totalGeral)}\n`;
    }

    text += `\n💡 Dividido com *Racha Conta* — https://www.instagram.com/solucoes_premium/`;

    // Attempt standard copy with fallback
    let copiouSucesso = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        copiouSucesso = true;
      }
    } catch (e) {
      // ignore
    }

    if (!copiouSucesso) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        copiouSucesso = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error(err);
      }
    }

    if (copiouSucesso) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-5 animate-fadeIn"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          id="btn-voltar-atribuicao"
          onClick={onVoltar}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-display font-bold text-stone-900">
          Cada um paga:
        </h2>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Summary Big Card */}
      <div className="bg-amber-600 rounded-3xl p-5 text-stone-50 shadow-md shadow-amber-600/20 flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          {nomeMesa.trim() ? `Resumo • ${nomeMesa.trim()}` : 'Total da Mesa'}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-mono font-black">{formatBRL(calculations.totalGeral)}</span>
          {gorjetaAtiva && (
            <span className="text-xs opacity-90 font-bold">
              (com {gorjetaPercentual}% de serviço)
            </span>
          )}
        </div>
        <div className="border-t border-white/20 pt-2.5 flex items-center justify-between text-xs opacity-90 font-mono">
          <span>Subtotal: {formatBRL(calculations.subtotalGeral)}</span>
          {gorjetaAtiva && (
            <span>Serviço: {formatBRL(calculations.gorjetaGeral)}</span>
          )}
        </div>
      </div>

      {/* Tip Settings Card */}
      <div className="bg-white rounded-3xl border border-amber-100 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-amber-600" />
            <span className="font-bold text-stone-800 text-sm">Taxa de Serviço (Garçom)</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle Switch */}
            <button
              id="btn-toggle-gorjeta"
              onClick={() => setGorjetaAtiva(!gorjetaAtiva)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                gorjetaAtiva ? 'bg-amber-600' : 'bg-stone-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  gorjetaAtiva ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <button
              id="btn-toggle-config-gorjeta"
              onClick={() => setMostrarGorjetaConfig(!mostrarGorjetaConfig)}
              className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
            >
              {mostrarGorjetaConfig ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {gorjetaAtiva && mostrarGorjetaConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden mt-3 pt-3 border-t border-stone-100 flex items-center gap-4"
            >
              <label htmlFor="percentual-gorjeta-input" className="text-xs text-stone-500 font-semibold">
                Editar percentual:
              </label>
              <div className="flex items-center bg-[#FDF8F3]/50 border border-amber-100 rounded-xl px-2 py-1 max-w-[120px]">
                <input
                  id="percentual-gorjeta-input"
                  type="number"
                  min="0"
                  max="100"
                  value={gorjetaPercentual}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setGorjetaPercentual(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
                  }}
                  className="w-full bg-transparent border-none text-right font-mono font-bold text-stone-800 focus:outline-none pr-1"
                />
                <span className="text-stone-400 font-bold text-sm">%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Individual breakdowns list */}
      <div className="flex-1 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1 flex items-center gap-1.5">
          <Users size={14} />
          Divisão por Integrante
        </h3>

        <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1 pb-4">
          {pessoas.map((pessoa, index) => {
            const ind = calculations.totaisIndividuais[pessoa.id] || { subtotal: 0, gorjeta: 0, total: 0 };
            const detalhes = calculations.detalhesPorPessoa[pessoa.id] || [];
            const isExpandido = !!usuarioExpandido[pessoa.id];
            const avatarCorClass = getAvatarColor(index);

            return (
              <div
                key={pessoa.id}
                className="bg-white rounded-2xl border border-amber-100/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Header row click to toggle */}
                <button
                  id={`btn-toggle-detalhes-${pessoa.id}`}
                  onClick={() => toggleUsuarioExpandido(pessoa.id)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-stone-50/50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${avatarCorClass}`}>
                      {pessoa.nome.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate">{pessoa.nome}</p>
                      <p className="text-[10px] text-stone-400">
                        {detalhes.length === 1 ? '1 item' : `${detalhes.length} itens`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-stone-900 font-mono text-sm">
                        {formatBRL(ind.total)}
                      </p>
                      {gorjetaAtiva && ind.gorjeta > 0 && (
                        <p className="text-[9px] text-stone-400">
                          + {formatBRL(ind.gorjeta)} taxa
                        </p>
                      )}
                    </div>
                    <div className="text-stone-400">
                      {isExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details list */}
                <AnimatePresence initial={false}>
                  {isExpandido && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-stone-50/75 border-t border-stone-100"
                    >
                      <div className="p-3.5 space-y-2 text-xs">
                        {detalhes.length === 0 ? (
                          <p className="text-stone-400 italic">Não consumiu nenhum item.</p>
                        ) : (
                          <>
                            {detalhes.map((det, dIdx) => (
                              <div key={dIdx} className="flex justify-between items-start text-stone-600 font-medium">
                                <div className="max-w-[70%]">
                                  <span>{det.itemNome}</span>
                                  {det.totalPessoas > 1 && (
                                    <span className="text-[10px] text-amber-800 ml-1 bg-amber-50 px-1 py-0.5 rounded-sm font-mono font-semibold">
                                      1/{det.totalPessoas} de {formatBRL(det.totalItem)}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono">{formatBRL(det.valorIndividual)}</span>
                              </div>
                            ))}

                            {gorjetaAtiva && (
                              <div className="flex justify-between items-center text-stone-500 pt-1 border-t border-stone-200/60 font-medium">
                                <span>Gorjeta do Garçom ({gorjetaPercentual}%)</span>
                                <span className="font-mono">{formatBRL(ind.gorjeta)}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-1 text-stone-900 font-bold">
                              <span>Total de {pessoa.nome}</span>
                              <span className="font-mono">{formatBRL(ind.total)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons Block */}
      <div className="mt-auto pt-4 border-t border-stone-200/80 flex flex-col gap-3">
        <button
          id="btn-copiar-resumo"
          onClick={handleCopiarResumo}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-base ${
            copiado
              ? 'bg-emerald-600 hover:bg-emerald-700 text-stone-50 shadow-emerald-600/10'
              : 'bg-amber-600 hover:bg-amber-700 text-stone-50 shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98]'
          }`}
          style={{ minHeight: '52px' }}
        >
          {copiado ? (
            <>
              <Check size={18} strokeWidth={3} />
              Copiado para o WhatsApp!
            </>
          ) : (
            <>
              <Copy size={18} />
              Enviar resumo no WhatsApp
            </>
          )}
        </button>

        <button
          id="btn-nova-mesa"
          onClick={onReiniciar}
          className="w-full py-3.5 px-6 rounded-2xl font-bold border-2 border-amber-100 hover:border-amber-600 text-stone-700 hover:text-amber-800 bg-white hover:bg-amber-50/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          style={{ minHeight: '48px' }}
        >
          <RefreshCw size={15} />
          Começar nova mesa
        </button>
      </div>
    </motion.div>
  );
}
