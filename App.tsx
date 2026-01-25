
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PipelineView from './components/PipelineView';
import FunnelChart from './components/FunnelChart';
import SaleForm from './components/SaleForm';
import { NavItem, Sale, Targets, LevelConfig } from './types';
import { MOCK_OPPORTUNITIES, NAVIGATION_ITEMS } from './constants';
import { 
  Plus, 
  X, 
  History,
  Search,
  FilterX,
  Target,
  TrendingUp,
  Settings2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Wrench,
  Droplets,
  Layers,
  Layout,
  Star,
  Construction,
  Percent,
  ChevronRight,
  Zap,
  MessageCircle,
  Share2,
  FileText,
  Download,
  ArrowUpRight
} from 'lucide-react';

const STORAGE_KEY = 'vc_quantum_data_v2';
const TARGETS_KEY = 'vc_quantum_targets_v4';

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavItem>(NavItem.Resumos);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); 
  const [savedSales, setSavedSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [targets, setTargets] = useState<Targets>({
    product: 50000,
    assistance: 3000,
    waterproofing: 2000,
    levels: {
      1: { threshold: 100, rate: 0.6 },
      2: { threshold: 120, rate: 0.8 },
      3: { threshold: 140, rate: 1.1 }
    }
  });

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      try { setSavedSales(JSON.parse(rawData)); } catch (e) {}
    }
    const rawTargets = localStorage.getItem(TARGETS_KEY);
    if (rawTargets) {
      try { setTargets(JSON.parse(rawTargets)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSales));
  }, [savedSales]);

  useEffect(() => {
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  }, [targets]);

  const saveSale = (newSaleData: any) => {
    const saleObj: Sale = {
      numeroPedido: newSaleData.pedido,
      valorProduto: newSaleData.produto,
      valorAssistencia: newSaleData.assistencia,
      valorImpermeabilizacao: newSaleData.impermeabilizacao,
      total: newSaleData.total,
      bonusTotal: newSaleData.bonusTotal,
      comissaoProduto: newSaleData.comissaoProduto,
      servicosExtras: newSaleData.servicosExtras,
      data: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };
    setSavedSales(prev => [saleObj, ...prev]);
    setActiveNav(NavItem.ResumoPedido);
  };

  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredSales = useMemo(() => {
    return savedSales.filter(sale => {
      const matchesSearch = sale.numeroPedido.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sale.total.toString().includes(searchQuery);
      if (!startDate && !endDate) return matchesSearch;
      const saleDate = new Date(sale.timestamp || 0);
      saleDate.setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate + 'T00:00:00') : null;
      const end = endDate ? new Date(endDate + 'T23:59:59') : null;
      return matchesSearch && !( (start && saleDate < start) || (end && saleDate > end) );
    });
  }, [savedSales, startDate, endDate, searchQuery]);

  const stats = useMemo(() => {
    const pTotal = filteredSales.reduce((acc, s) => acc + s.valorProduto, 0);
    const aTotal = filteredSales.reduce((acc, s) => acc + s.valorAssistencia, 0);
    const iTotal = filteredSales.reduce((acc, s) => acc + s.valorImpermeabilizacao, 0);
    const pPerc = targets.product > 0 ? (pTotal / targets.product) : 0;
    const aPerc = targets.assistance > 0 ? (aTotal / targets.assistance) : 0;
    const iPerc = targets.waterproofing > 0 ? (iTotal / targets.waterproofing) : 0;
    const aRate = aPerc >= 1 ? 0.10 : 0.05;
    const aComissao = aTotal * aRate;
    const pComissaoBase = pTotal * 0.022;

    let level = 0;
    [3, 2, 1].forEach(lvlNum => {
      if (level > 0) return;
      const lNum = lvlNum as 1 | 2 | 3;
      const thresh = targets.levels[lNum].threshold / 100;
      if (pPerc >= thresh && aPerc >= thresh && iPerc >= thresh) level = lNum;
    });

    const accelRate = level > 0 ? targets.levels[level as 1|2|3].rate / 100 : 0;
    const accelBonus = pTotal * accelRate;
    const serviceCounts = { 'Montagem': 0, 'Lavagem': 0, 'Almofada': 0, 'Pés G-Roupa': 0, 'Impermeab.': 0 };
    const serviceValues = { 'Montagem': 10, 'Lavagem': 40, 'Almofada': 10, 'Pés G-Roupa': 7, 'Impermeab.': 40 };

    filteredSales.forEach(s => {
      s.servicosExtras.forEach(ex => {
        if (serviceCounts.hasOwnProperty(ex)) {
          // @ts-ignore
          serviceCounts[ex]++;
        }
      });
    });

    const totalExtrasFixo = Object.keys(serviceCounts).reduce((acc, key) => {
      // @ts-ignore
      return acc + (serviceCounts[key] * serviceValues[key]);
    }, 0);
    
    return {
      pTotal, aTotal, iTotal, pPerc, aPerc, iPerc,
      aComissao, aRate, pComissaoBase,
      accelBonus, accelRate, level,
      totalExtrasFixo, serviceCounts,
      ganhosTotais: pComissaoBase + aComissao + accelBonus + totalExtrasFixo,
      faturamentoGeral: pTotal + aTotal + iTotal,
      ticketMedio: filteredSales.length > 0 ? (pTotal + aTotal + iTotal) / filteredSales.length : 0
    };
  }, [filteredSales, targets]);

  const renderContent = () => {
    if (activeNav === NavItem.AdicionarVenda) return <SaleForm onCancel={() => setActiveNav(NavItem.Resumos)} onSubmit={saveSale} />;

    if (activeNav === NavItem.ResumoServico) {
      return (
        <div className="content-section py-2 px-2 space-y-8 animate-in slide-in-from-right-10">
           <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Wrench size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestão V&C</span>
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Meus Serviços</h2>
              </div>
              <div className="glass p-6 rounded-[2rem] flex flex-col items-center border-emerald-500/20 bg-emerald-500/[0.03]">
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Acumulado</span>
                 <span className="text-3xl font-black text-white mono">{formatBRL(stats.totalExtrasFixo)}</span>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Montagem', icon: <Layout />, count: stats.serviceCounts['Montagem'], val: 10, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Lavagem', icon: <Droplets />, count: stats.serviceCounts['Lavagem'], val: 40, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                { label: 'Almofada', icon: <Star />, count: stats.serviceCounts['Almofada'], val: 10, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Pés G-Roupa', icon: <Layers />, count: stats.serviceCounts['Pés G-Roupa'], val: 7, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
                { label: 'Impermeab.', icon: <ShieldCheck />, count: stats.serviceCounts['Impermeab.'], val: 40, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              ].map((s, idx) => (
                <div key={idx} className="glass p-6 rounded-[2rem] border-white/5 flex items-center justify-between relative overflow-hidden group">
                   <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                         {React.cloneElement(s.icon as React.ReactElement<any>, { size: 24 })}
                      </div>
                      <div>
                         <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{s.label}</h4>
                         <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-white mono">{s.count}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Unidades</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right relative z-10">
                      <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Soma: {formatBRL(s.val)}</div>
                      <div className={`text-xl font-black mono ${s.color}`}>{formatBRL(s.count * s.val)}</div>
                   </div>
                   <div className={`absolute -right-2 -bottom-2 opacity-5 ${s.color}`}>
                      {React.cloneElement(s.icon as React.ReactElement<any>, { size: 80 })}
                   </div>
                </div>
              ))}
           </div>
        </div>
      );
    }

    if (activeNav === NavItem.Meta) {
       return (
        <div className="content-section py-4 px-2 space-y-8 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Target size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">V&C Quantum</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Metas</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
             {['product', 'assistance', 'waterproofing'].map((key) => (
               <div key={key} className="glass p-6 rounded-[2rem] border-white/5">
                 <span className="text-[10px] font-black text-slate-500 uppercase mb-4 block">
                   {key === 'product' ? 'Meta Venda' : key === 'assistance' ? 'Meta Assistência' : 'Meta Impermeabilização'}
                 </span>
                 <input 
                    type="text" 
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(targets[key as 'product'])}
                    readOnly
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-xl font-black text-white mono outline-none"
                  />
               </div>
             ))}
          </div>
        </div>
      );
    }

    return (
      <div className="content-section py-2 px-2 space-y-6 animate-in slide-in-from-bottom-6">
        <div className="glass p-4 rounded-[2rem] border-white/10 flex items-center justify-between">
           <h2 className="text-xl font-black text-white italic tracking-tighter ml-2">V&C Hub</h2>
           <button onClick={() => setActiveNav(NavItem.AdicionarVenda)} className="bg-cyan-500 text-black px-5 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">Novo Pedido</button>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">Nível Atual: {stats.level}</span>
              <Zap size={18} className="text-cyan-400 animate-pulse" />
           </div>
           <div className="space-y-6">
              {[
                { label: 'Produto', current: stats.pPerc, color: 'from-cyan-500 to-blue-600' },
                { label: 'Assistência', current: stats.aPerc, color: 'from-emerald-500 to-teal-600' },
                { label: 'Impermeab.', current: stats.iPerc, color: 'from-fuchsia-500 to-purple-600' },
              ].map((cat) => (
                <div key={cat.label} className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-slate-500">{cat.label}</span>
                      <span className="text-white">{(cat.current * 100).toFixed(1)}%</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full bg-gradient-to-r ${cat.color} transition-all duration-1000`} style={{ width: `${Math.min(cat.current * 100, 100)}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="glass p-5 rounded-[1.8rem] border-white/5">
              <span className="text-[8px] font-black text-cyan-400 uppercase block mb-1">Faturamento</span>
              <div className="text-md font-black text-white mono">{formatBRL(stats.faturamentoGeral)}</div>
           </div>
           <div className="glass p-5 rounded-[1.8rem] border-emerald-500/20 bg-emerald-500/[0.03]">
              <span className="text-[8px] font-black text-emerald-400 uppercase block mb-1">Ganhos Reais</span>
              <div className="text-md font-black text-emerald-400 mono">{formatBRL(stats.ganhosTotais)}</div>
           </div>
        </div>

        {activeNav === NavItem.ResumoPedido && (
           <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Últimos Lançamentos</h3>
              {filteredSales.map((sale, i) => (
                <div key={i} className="glass p-5 rounded-[1.5rem] border-white/5 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white mono">#{sale.numeroPedido}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{sale.data}</span>
                   </div>
                   <div className="text-right">
                      <div className="text-[11px] font-black text-emerald-400 mono">{formatBRL(sale.bonusTotal)}</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase">Ganhos</div>
                   </div>
                </div>
              ))}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#05020a] flex flex-col">
      <div className={`fixed inset-0 z-50 transition-transform duration-500 ${isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarCollapsed(true)}></div>
         <div className="relative w-64 h-full">
            <Sidebar isCollapsed={false} setIsCollapsed={setIsSidebarCollapsed} activeItem={activeNav} onSelect={(item) => { setActiveNav(item); setIsSidebarCollapsed(true); }} />
         </div>
      </div>

      <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-40 bg-[#05020a]/80 backdrop-blur-md border-b border-white/5">
         <button onClick={() => setIsSidebarCollapsed(false)} className="p-2 text-white">
            <Zap size={24} className="text-cyan-400" />
         </button>
         <h1 className="text-xl font-black text-white tracking-tighter uppercase">V&C <span className="text-cyan-400">QUANTUM</span></h1>
         <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            <img src="https://picsum.photos/seed/vc/100/100" alt="Avatar" />
         </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="max-w-md mx-auto">{renderContent()}</div>
      </main>

      {/* BOTÃO VOLTOU A SER DIRETO E COM EFEITO DE FICAR PEQUENINHO AO TOCAR */}
      <div className="fixed bottom-8 right-8 z-40">
         <button 
           onClick={() => setActiveNav(NavItem.AdicionarVenda)} 
           className="w-18 h-18 bg-cyan-500 rounded-[2rem] flex items-center justify-center text-black shadow-[0_0_40px_rgba(34,211,238,0.3)] active:scale-90 active:shadow-inner transition-all duration-200"
           style={{ width: '72px', height: '72px' }}
         >
            <Plus size={32} strokeWidth={3} />
         </button>
      </div>
    </div>
  );
};

export default App;
