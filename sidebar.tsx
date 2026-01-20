
import React from 'react';
import { ShoppingCart, BarChart3, History, Medal, Zap, X, LogOut, Layers, ShieldCheck } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, onLogout, user }: any) => {
  const isAdmin = user?.r === 'admin';
  const menu = isAdmin ? [
    { id: 'admin-panel', label: 'Gestão de Usuários', icon: <ShieldCheck size={22} /> },
    { id: 'relat-ped', label: 'Conferência Geral', icon: <BarChart3 size={22} /> },
  ] : [
    { id: 'novo-ped', label: 'Lançar Pedido', icon: <ShoppingCart size={22} /> },
    { id: 'resumo-serv', label: 'Resumo de Ganhos', icon: <Layers size={22} /> },
    { id: 'hist-serv', label: 'Meus Lançamentos', icon: <History size={22} /> },
    { id: 'ranking-lojas', label: 'Top Ranking', icon: <Medal size={22} /> },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[101] w-80 bg-white border-r border-stone-100 flex flex-col h-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-orange-100"><Zap className="text-white" size={26} /></div>
            <span className="text-2xl font-black text-stone-800 tracking-tighter uppercase">V&C <span className="text-orange-500">Elite</span></span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-stone-300"><X size={28} /></button>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 mt-4">
          {menu.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); onClose(); }} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.75rem] transition-all duration-300 ${activeTab === item.id ? 'bg-orange-500 text-white shadow-2xl shadow-orange-200 scale-[1.02]' : 'text-stone-400 hover:bg-orange-50 hover:text-orange-500'}`}>
              {item.icon}<span className="font-extrabold text-[13px] tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-stone-50">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.75rem] text-stone-300 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-widest">
            <LogOut size={22} /> Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
