import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DiagnosticModule from './components/DiagnosticModule';
import DashboardModule from './components/DashboardModule';
import AdmisibilidadModule from './components/AdmisibilidadModule';

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 h-full fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-lg z-50">
      <div className="px-lg mb-xl">
        <div className="flex items-center gap-sm mb-xs">
          <img className="w-8 h-8 rounded-full object-cover" alt="Seal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDch-NJqXXr7K1w_Oazw6NiXeOF7dWh-b6q6VOvyRN5odxoxPzkvBW08cKC-JrfPadhfnu3NoXLdSIRTSZ2aZ5aA6Xoq49vt66NGGL99fs8nDZyx-vCZ3VSb8hfnDKhNOh-icwXUfEXhuoaBNVYZz7PhHa7diCgOeCAjogrIlvIw1COTKXLMOXJafxednXdG7OsvWOIQLy9rYYvq0fak0voP-UHAU3R_Dk7oc85ipnvZv16EhTh83xLrdpEttnLbJ4Mmb0wavJQ3CY" />
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">CONCILIACIÓN</h1>
        </div>
        <p className="font-label-md text-on-surface-variant">Gestión Judicial</p>
      </div>
      
      <nav className="flex-1 px-sm space-y-unit">
        <Link to="/" className={`flex items-center gap-md px-md py-sm font-label-lg text-label-lg transition-colors ${location.pathname === '/' ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>
          <span className="material-symbols-outlined">folder_open</span>
          Triaje Legal
        </Link>
        <Link to="/dashboard" className={`flex items-center gap-md px-md py-sm font-label-lg text-label-lg transition-colors ${location.pathname === '/dashboard' ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          Tablero
        </Link>
        <Link to="#" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors font-label-lg text-label-lg">
          <span className="material-symbols-outlined">calendar_today</span>
          Calendario
        </Link>
        <Link to="#" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors font-label-lg text-label-lg">
          <span className="material-symbols-outlined">analytics</span>
          Reportes
        </Link>
      </nav>
      
      <div className="px-lg mt-auto pt-lg border-t border-outline-variant">
        <div className="flex items-center gap-sm p-sm rounded-lg bg-surface-container-low">
          <img className="w-10 h-10 rounded-full border border-outline-variant" alt="Conciliador" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-HXj8TUyWODWGgxkVsaz2reynhp5Kb25IdUYl_FKKAwoMFYJ_mxOIpbNCWghDNIZiNYqfqS-CIE5gDJkNFvAs28VmIGJez9lRNwxuQYznoGDovfpqptyuIBnmcvUdDUe3_pkA_A026U0q21gno8XCEZJ5OBhx2bp3T-d6SItnzxDeCcI8DMjR2pViqCzJXDSTHY7o5CV7M-CT0lEvuQusklVO53XjNEK-O77P5Dw059sOi6aAi-hHDFmgh_XZdwv7PQX_2kLQVCs" />
          <div className="overflow-hidden">
            <p className="text-label-lg truncate">Dr. Ricardo Palma</p>
            <p className="text-label-sm text-on-surface-variant">Conciliador Senior</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Topbar = () => {
  return (
    <header className="flex justify-between items-center px-lg py-sm h-16 w-full bg-surface-container-lowest border-b border-outline-variant shadow-sm transition-all duration-200 z-40">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-full text-body-md focus:outline-none focus:border-primary transition-colors" placeholder="Buscar expediente, DNI o nombre..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-md ml-lg">
        <p className="font-body-md text-on-surface-variant hidden md:block">Portal de Conciliación</p>
        <button className="p-sm text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-sm text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-surface text-on-surface font-body-md">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DiagnosticModule />} />
          <Route path="/admisibilidad" element={<AdmisibilidadModule />} />
          <Route path="/dashboard" element={<DashboardModule />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
