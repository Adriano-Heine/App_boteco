import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full text-center py-4 mt-auto border-t border-stone-200/60 flex items-center justify-center gap-1">
      <span className="text-[10px] text-stone-400 select-none">Desenvolvido por</span>
      <a
        id="link-portfolio-footer"
        href="https://www.instagram.com/solucoes_premium/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-bold text-amber-600 hover:text-amber-800 transition-colors underline decoration-dotted"
      >
        Jorge Heine
      </a>
    </footer>
  );
}
