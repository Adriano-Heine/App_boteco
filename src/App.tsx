import React, { useState, useEffect } from 'react';
import { Pessoa, Item } from './types';
import TelaInicio from './components/TelaInicio';
import TelaPessoas from './components/TelaPessoas';
import TelaItens from './components/TelaItens';
import TelaAtribuir from './components/TelaAtribuir';
import TelaResumo from './components/TelaResumo';
import Footer from './components/Footer';
import { AnimatePresence } from 'motion/react';

// Safe unique ID generator for mobile browsers
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export default function App() {
  // Load initial states from localStorage if they exist, else use defaults
  const [nomeMesa, setNomeMesa] = useState<string>(() => {
    return localStorage.getItem('racha_conta_nome_mesa') || '';
  });

  const [pessoas, setPessoas] = useState<Pessoa[]>(() => {
    const saved = localStorage.getItem('racha_conta_pessoas');
    return saved ? JSON.parse(saved) : [];
  });

  const [itens, setItens] = useState<Item[]>(() => {
    const saved = localStorage.getItem('racha_conta_itens');
    return saved ? JSON.parse(saved) : [];
  });

  const [gorjetaPercentual, setGorjetaPercentual] = useState<number>(() => {
    const saved = localStorage.getItem('racha_conta_gorjeta_pct');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [gorjetaAtiva, setGorjetaAtiva] = useState<boolean>(() => {
    const saved = localStorage.getItem('racha_conta_gorjeta_ativa');
    return saved ? saved === 'true' : true;
  });

  const [telaAtual, setTelaAtual] = useState<number>(() => {
    const saved = localStorage.getItem('racha_conta_tela');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('racha_conta_nome_mesa', nomeMesa);
  }, [nomeMesa]);

  useEffect(() => {
    localStorage.setItem('racha_conta_pessoas', JSON.stringify(pessoas));
  }, [pessoas]);

  useEffect(() => {
    localStorage.setItem('racha_conta_itens', JSON.stringify(itens));
  }, [itens]);

  useEffect(() => {
    localStorage.setItem('racha_conta_gorjeta_pct', gorjetaPercentual.toString());
  }, [gorjetaPercentual]);

  useEffect(() => {
    localStorage.setItem('racha_conta_gorjeta_ativa', gorjetaAtiva.toString());
  }, [gorjetaAtiva]);

  useEffect(() => {
    localStorage.setItem('racha_conta_tela', telaAtual.toString());
  }, [telaAtual]);

  // Actions
  const handleAddPessoa = (nome: string): boolean => {
    const nova: Pessoa = {
      id: generateId(),
      nome,
      cor: '', // Dynamic colors based on index in list to avoid conflicts
    };
    setPessoas((prev) => [...prev, nova]);
    return true;
  };

  const handleRemovePessoa = (id: string) => {
    // Remove person
    setPessoas((prev) => prev.filter((p) => p.id !== id));
    // Clean up item attributions
    setItens((prevItens) =>
      prevItens.map((item) => ({
        ...item,
        pessoasIds: item.pessoasIds.filter((pId) => pId !== id),
      }))
    );
  };

  const handleAddItem = (nome: string, preco: number, quantidade: number) => {
    const novo: Item = {
      id: generateId(),
      nome,
      preco,
      quantidade,
      pessoasIds: [],
    };
    setItens((prev) => [...prev, novo]);
  };

  const handleUpdateItem = (id: string, nome: string, preco: number, quantidade: number) => {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nome, preco, quantidade } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTogglePessoaNoItem = (itemId: string, pessoaId: string) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.pessoasIds.includes(pessoaId);
        return {
          ...item,
          pessoasIds: exists
            ? item.pessoasIds.filter((id) => id !== pessoaId)
            : [...item.pessoasIds, pessoaId],
        };
      })
    );
  };

  const handleToggleTodosNoItem = (itemId: string) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const totalPessoas = pessoas.length;
        const todasSelecionadas = item.pessoasIds.length === totalPessoas;
        return {
          ...item,
          pessoasIds: todasSelecionadas ? [] : pessoas.map((p) => p.id),
        };
      })
    );
  };

  const handleReiniciarMesa = () => {
    if (window.confirm('Deseja realmente iniciar uma nova mesa? Todo o consumo atual será apagado.')) {
      setNomeMesa('');
      setPessoas([]);
      setItens([]);
      setGorjetaPercentual(10);
      setGorjetaAtiva(true);
      setTelaAtual(1);
      localStorage.clear();
    }
  };

  const renderTela = () => {
    switch (telaAtual) {
      case 1:
        return (
          <TelaInicio
            nomeMesa={nomeMesa}
            setNomeMesa={setNomeMesa}
            onAvancar={() => setTelaAtual(2)}
          />
        );
      case 2:
        return (
          <TelaPessoas
            pessoas={pessoas}
            onAddPessoa={handleAddPessoa}
            onRemovePessoa={handleRemovePessoa}
            onVoltar={() => setTelaAtual(1)}
            onAvancar={() => setTelaAtual(3)}
          />
        );
      case 3:
        return (
          <TelaItens
            itens={itens}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onVoltar={() => setTelaAtual(2)}
            onAvancar={() => setTelaAtual(4)}
          />
        );
      case 4:
        return (
          <TelaAtribuir
            pessoas={pessoas}
            itens={itens}
            onTogglePessoaNoItem={handleTogglePessoaNoItem}
            onToggleTodosNoItem={handleToggleTodosNoItem}
            onVoltar={() => setTelaAtual(3)}
            onAvancar={() => setTelaAtual(5)}
          />
        );
      case 5:
        return (
          <TelaResumo
            nomeMesa={nomeMesa}
            pessoas={pessoas}
            itens={itens}
            gorjetaPercentual={gorjetaPercentual}
            setGorjetaPercentual={setGorjetaPercentual}
            gorjetaAtiva={gorjetaAtiva}
            setGorjetaAtiva={setGorjetaAtiva}
            onReiniciar={handleReiniciarMesa}
            onVoltar={() => setTelaAtual(4)}
          />
        );
      default:
        return (
          <TelaInicio
            nomeMesa={nomeMesa}
            setNomeMesa={setNomeMesa}
            onAvancar={() => setTelaAtual(2)}
          />
        );
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen flex flex-col bg-stone-50 select-none antialiased">
      {/* Top microbar for desktop simulation/visual polish */}
      <div className="w-full bg-stone-900 text-[10px] text-stone-400 font-mono py-1.5 px-4 flex justify-between items-center select-none border-b border-stone-800">
        <span className="font-bold tracking-wider text-amber-500">Racha Conta 🍺</span>
        <span>Mesa Virtual Offline</span>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-start w-full max-w-md mx-auto relative">
        <AnimatePresence mode="wait">
          {renderTela()}
        </AnimatePresence>
      </main>

      {/* Persistent subtle footer */}
      <Footer />
    </div>
  );
}
