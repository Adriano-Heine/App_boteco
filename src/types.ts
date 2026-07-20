export interface Pessoa {
  id: string;
  nome: string;
  cor: string; // Tailwind class name or hex color
}

export interface Item {
  id: string;
  nome: string;
  preco: number; // Unit price in BRL
  quantidade: number;
  pessoasIds: string[]; // List of Pessoa.id who consumed this item
}

export interface MesaState {
  nome: string;
  pessoas: Pessoa[];
  itens: Item[];
  gorjetaPercentual: number;
  gorjetaAtiva: boolean;
  telaAtual: number; // 1 | 2 | 3 | 4 | 5
}
