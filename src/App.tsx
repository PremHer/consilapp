import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DiagnosticModule from './components/DiagnosticModule';
import DashboardModule from './components/DashboardModule';
import AdmisibilidadModule from './components/AdmisibilidadModule';
import CalendarioModule from './components/CalendarioModule';
import ReportesModule from './components/ReportesModule';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  
  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`w-64 h-full fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-lg z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center px-lg mb-xl">
          <div className="flex items-center gap-sm">
            <img className="w-8 h-8 rounded-full object-cover" alt="Seal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDch-NJqXXr7K1w_Oazw6NiXeOF7dWh-b6q6VOvyRN5odxoxPzkvBW08cKC-JrfPadhfnu3NoXLdSIRTSZ2aZ5aA6Xoq49vt66NGGL99fs8nDZyx-vCZ3VSb8hfnDKhNOh-icwXUfEXhuoaBNVYZz7PhHa7diCgOeCAjogrIlvIw1COTKXLMOXJafxednXdG7OsvWOIQLy9rYYvq0fak0voP-UHAU3R_Dk7oc85ipnvZv16EhTh83xLrdpEttnLbJ4Mmb0wavJQ3CY" />
            <div>
              <h1 className="font-headline-sm text-headline-sm font-bold text-primary">BRIDGELAW</h1>
              <p className="font-label-sm text-on-surface-variant">Gestión Judicial</p>
            </div>
          </div>
          <button className="md:hidden p-sm text-on-surface-variant" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 px-sm space-y-unit overflow-y-auto">
          <Link onClick={() => setIsOpen(false)} to="/" className={`flex items-center gap-md px-md py-sm font-label-lg text-label-lg transition-colors ${location.pathname === '/' ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">folder_open</span>
            Triaje Legal
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/dashboard" className={`flex items-center gap-md px-md py-sm font-label-lg text-label-lg transition-colors ${location.pathname === '/dashboard' ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            Tablero
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/calendario" className={`flex items-center gap-md px-md py-sm font-label-lg text-label-lg transition-colors ${location.pathname === '/calendario' ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">calendar_today</span>
            Calendario
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/reportes" className={`flex items-center gap-md px-md py-sm font-label-lg text-label-lg transition-colors ${location.pathname === '/reportes' ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">analytics</span>
            Reportes
          </Link>
        </nav>
        
        <div className="px-lg mt-auto pt-lg border-t border-outline-variant">
          <div className="flex items-center gap-sm p-sm rounded-lg bg-surface-container-low">
            <img className="w-10 h-10 rounded-full border border-outline-variant object-cover" alt="Conciliador" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" />
            <div className="overflow-hidden">
              <p className="text-label-lg truncate">Dra. Yocely Tapia</p>
              <p className="text-label-sm text-on-surface-variant">Conciliadora Senior</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const Topbar = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  return (
    <header className="flex justify-between items-center px-md md:px-lg py-sm h-16 w-full bg-surface-container-lowest border-b border-outline-variant shadow-sm transition-all duration-200 z-30 sticky top-0">
      <div className="flex items-center gap-md flex-1 max-w-xl">
        <button className="md:hidden p-sm text-on-surface hover:bg-surface-container-highest rounded-full transition-all" onClick={() => setIsOpen(true)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full hidden sm:block">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-full text-body-md focus:outline-none focus:border-primary transition-colors" placeholder="Buscar expediente..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-sm md:gap-md ml-auto">
        <button className="sm:hidden p-sm text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
          <span className="material-symbols-outlined">search</span>
        </button>
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
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        <Topbar setIsOpen={setIsOpen} />
        {children}
      </div>
    </div>
  );
};

import SeguimientoModule from './components/SeguimientoModule';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DiagnosticModule />} />
          <Route path="/admisibilidad" element={<AdmisibilidadModule />} />
          <Route path="/dashboard" element={<DashboardModule />} />
          <Route path="/calendario" element={<CalendarioModule />} />
          <Route path="/reportes" element={<ReportesModule />} />
          <Route path="/seguimiento/:numero" element={<SeguimientoModule />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
