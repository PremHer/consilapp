import { useState } from 'react';
import { CheckCircle, FileText, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import TriajeWidget from './TriajeWidget';
import { motion } from 'framer-motion';

const DiagnosticModule = () => {
  const [isTriajeOpen, setIsTriajeOpen] = useState(true);

  return (
    <div className="bg-surface relative min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary-container/30 border-b border-outline-variant pb-3xl pt-2xl px-lg text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline-lg md:text-5xl lg:text-6xl text-primary font-bold mb-lg leading-tight"
          >
            Resuelva sus conflictos legales <br className="hidden md:block" /> sin ir a juicio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-body-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto mb-2xl leading-relaxed"
          >
            La conciliación extrajudicial es un mecanismo rápido, económico y seguro para resolver problemas familiares y civiles con valor legal de sentencia.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-lg"
          >
            <button 
              onClick={() => setIsTriajeOpen(true)}
              className="bg-primary text-on-primary px-2xl py-md rounded-full font-label-lg hover:opacity-90 active:scale-95 transition-all shadow-md flex justify-center items-center gap-md text-lg"
            >
              <ShieldAlert size={20} />
              Iniciar Triaje Gratuito
            </button>
            <button 
              onClick={() => document.getElementById('casos-de-uso')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-outline text-on-surface px-2xl py-md rounded-full font-label-lg hover:bg-surface-container hover:border-outline-variant transition-colors text-lg"
            >
              Conocer más
            </button>
          </motion.div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="max-w-6xl mx-auto py-3xl px-lg grid grid-cols-1 md:grid-cols-3 gap-2xl">
        <div className="text-center p-xl bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mx-auto mb-lg rotate-3 shadow-sm">
            <CheckCircle size={40} />
          </div>
          <h3 className="font-headline-sm mb-md text-on-surface">100% Legal</h3>
          <p className="text-on-surface-variant text-body-lg">El acta de conciliación tiene el mismo valor que la sentencia de un juez ante la ley peruana.</p>
        </div>
        <div className="text-center p-xl bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center mx-auto mb-lg -rotate-3 shadow-sm">
            <Clock size={40} />
          </div>
          <h3 className="font-headline-sm mb-md text-on-surface">Mucho más rápido</h3>
          <p className="text-on-surface-variant text-body-lg">Un juicio puede durar años. Una conciliación extrajudicial se resuelve en 1 a 2 semanas.</p>
        </div>
        <div className="text-center p-xl bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 bg-error-container text-on-error-container rounded-2xl flex items-center justify-center mx-auto mb-lg rotate-3 shadow-sm">
            <FileText size={40} />
          </div>
          <h3 className="font-headline-sm mb-md text-on-surface">Menos desgaste</h3>
          <p className="text-on-surface-variant text-body-lg">Se evita el estrés y costo emocional de los tribunales conversando en un ambiente pacífico.</p>
        </div>
      </div>

      {/* Casos de Uso */}
      <div id="casos-de-uso" className="bg-surface-container py-3xl px-lg border-t border-outline-variant">
        <div className="max-w-4xl mx-auto text-center mb-2xl">
          <h2 className="font-headline-lg text-primary font-bold mb-md">¿Qué casos se pueden conciliar?</h2>
          <p className="text-on-surface-variant text-body-xl">Existen materias específicas reguladas por la Ley de Conciliación N° 26872.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2xl">
          <div className="bg-surface p-2xl rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-md text-primary mb-lg border-b border-outline-variant pb-md">Familia</h3>
            <ul className="space-y-md text-on-surface text-body-lg">
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Pensión de alimentos (aumento, reducción o exoneración)</li>
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Régimen de visitas para los hijos menores</li>
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Tenencia y custodia de menores</li>
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Gastos de embarazo y parto</li>
            </ul>
          </div>
          <div className="bg-surface p-2xl rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-md text-secondary mb-lg border-b border-outline-variant pb-md">Civil y Comercial</h3>
            <ul className="space-y-md text-on-surface text-body-lg">
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Desalojos y problemas con inquilinos (falta de pago)</li>
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Cobro de deudas (préstamos, alquileres, letras)</li>
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> Incumplimiento de contratos comerciales</li>
              <li className="flex items-start gap-md"><CheckCircle size={24} className="text-green-600 mt-xs shrink-0" /> División y partición de bienes familiares</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer / Quiénes Somos */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-2xl px-lg relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2xl">
          <div>
            <h3 className="font-headline-sm text-primary-fixed mb-md flex items-center gap-sm">
              <ShieldAlert size={24} /> BRIDGELAW
            </h3>
            <p className="text-body-lg text-surface-container-highest max-w-md">
              <strong>Quiénes Somos:</strong> Somos un centro de conciliación extrajudicial moderno, comprometido con la resolución pacífica de conflictos, utilizando tecnología e inteligencia artificial para agilizar y democratizar el acceso a la justicia.
            </p>
          </div>
          <div className="md:text-right flex flex-col justify-center">
            <p className="text-body-md text-surface-variant mb-xs">
              Desarrollado por:
            </p>
            <p className="font-headline-sm text-white mb-xs">
              Yocely Tapia
            </p>
            <p className="text-body-md text-primary-fixed-dim">
              Estudiante de Derecho
            </p>
            <p className="text-body-sm text-outline-variant mt-lg">
              © {new Date().getFullYear()} Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Padding extra para que el footer no sea tapado por el widget flotante en móviles */}
      <div className="h-24 bg-inverse-surface md:hidden"></div>

      {/* FAB (Floating Action Button) para abrir Triaje */}
      {!isTriajeOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-4 md:right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:opacity-90 hover:scale-105 active:scale-95 transition-all z-40"
          onClick={() => setIsTriajeOpen(true)}
          aria-label="Abrir Triaje Legal"
        >
          <MessageSquare size={28} />
          {/* Indicador de notificación */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-error rounded-full border-2 border-surface animate-pulse"></span>
        </motion.button>
      )}

      {/* Widget Flotante de IA */}
      <TriajeWidget 
        isOpen={isTriajeOpen} 
        onClose={() => setIsTriajeOpen(false)} 
      />
    </div>
  );
};

export default DiagnosticModule;
