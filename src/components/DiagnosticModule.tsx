import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, AlertTriangle, CheckCircle, ArrowRight, PhoneCall, ShieldAlert, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Step = 'nlp_input' | 'nlp_processing' | 'ai_response' | 'filter_violence' | 'filter_penal' | 'branch_civil' | 'branch_family' | 'result_success' | 'result_rejected';

const DiagnosticModule = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('nlp_input');
  const [nlpText, setNlpText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [detectedBranch, setDetectedBranch] = useState<'Familia' | 'Civil' | null>(null);

  const simulateNLP = async () => {
    if (!nlpText) return;
    setStep('nlp_processing');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [], message: nlpText })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setAiResponse(`❌ Error del servidor de Inteligencia Artificial: ${data.error || 'Verifica la API KEY de Gemini'}`);
      } else {
        setAiResponse(data.response || "No se recibió respuesta de la IA.");
      }
      
      if (nlpText.toLowerCase().includes('hijo') || nlpText.toLowerCase().includes('alimento') || nlpText.toLowerCase().includes('espos')) {
        setDetectedBranch('Familia');
      } else {
        setDetectedBranch('Civil');
      }
      setStep('ai_response');
    } catch (err) {
      console.error(err);
      if (nlpText.toLowerCase().includes('hijo') || nlpText.toLowerCase().includes('alimento')) {
        setDetectedBranch('Familia');
      } else {
        setDetectedBranch('Civil');
      }
      setStep('filter_violence');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'nlp_input':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
            <div className="flex items-center gap-md mb-lg">
              <MessageSquare className="text-primary" />
              <h2 className="font-headline-sm text-primary">Cuéntanos tu problema</h2>
            </div>
            <div className="flex flex-col">
              <p className="mb-lg text-on-surface-variant">
                Escribe de forma sencilla cuál es el motivo de tu consulta. Nuestro sistema analizará tu caso para guiarte.
                <br/><small className="text-outline">Ej: "El papá de mi hijo no me pasa dinero desde hace 3 meses" o "Mi inquilino no me paga el alquiler".</small>
              </p>
              <textarea 
                className="w-full p-md mb-lg bg-surface-container border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary transition-colors" 
                rows={4} 
                placeholder="Describe tu caso aquí..."
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                style={{ resize: 'none' }}
              />
              <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 active:scale-95 transition-all shadow-md self-start flex items-center gap-sm" onClick={simulateNLP} disabled={!nlpText}>
                Analizar Caso <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        );
      
      case 'nlp_processing':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm flex flex-col items-center justify-center">
            <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', width: '40px', height: '40px', borderRadius: '50%', borderLeftColor: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h3 className="font-headline-sm mt-md">Analizando con IA Jurídica...</h3>
            <p className="text-on-surface-variant">Clasificando la materia según la Ley Nº 26872</p>
          </motion.div>
        );

      case 'ai_response':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
            <div className="flex items-center gap-md mb-lg">
              <MessageSquare className="text-primary" />
              <h2 className="font-headline-sm text-primary">Análisis de IA Jurídica</h2>
            </div>
            <div className="bg-primary-container/10 p-md rounded-lg mb-lg border border-primary/20 whitespace-pre-wrap text-body-md text-on-surface leading-relaxed">
              {aiResponse}
            </div>
            <div className="flex flex-col gap-sm">
              <p className="font-label-lg text-on-surface">¿Desea continuar con el proceso de admisibilidad?</p>
              <div className="flex gap-md mt-sm">
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md" onClick={() => setStep('filter_violence')}>
                  Sí, continuar
                </button>
                <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-lg hover:bg-surface-container transition-colors" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                  Hacer otra consulta
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'filter_violence':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-md bg-error-container p-md border-b border-error/20">
              <ShieldAlert className="text-error" />
              <h2 className="text-error font-headline-sm">Filtro de Seguridad Obligatorio (Ley Nº 30364)</h2>
            </div>
            <div className="p-xl">
              <p className="text-body-lg mb-xl text-on-surface">
                ¿Este problema involucra episodios de <strong>violencia física, psicológica o sexual</strong> hacia usted, sus hijos o algún miembro de su familia por parte de la otra persona?
              </p>
              <div className="flex gap-md">
                <button className="border border-error text-error px-lg py-sm rounded-lg font-label-lg hover:bg-error-container transition-colors" onClick={() => setStep('result_rejected')}>
                  Sí, hay violencia
                </button>
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md" onClick={() => setStep('filter_penal')}>
                  No, es un tema estrictamente civil/familiar
                </button>
              </div>
            </div>
          </motion.div>
        );
      
      case 'filter_penal':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
            <div className="flex items-center gap-md mb-lg">
              <AlertTriangle className="text-secondary" />
              <h2 className="font-headline-sm">Filtro Penal y Bienes del Estado</h2>
            </div>
            <div className="flex flex-col">
              <p className="text-body-lg mb-xl text-on-surface">
                ¿Su consulta está relacionada con la comisión de un delito (robo, estafa, agresión) o involucra bienes del Estado peruano?
              </p>
              <div className="flex gap-md">
                <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-lg hover:bg-surface-container transition-colors" onClick={() => setStep('result_rejected')}>
                  Sí
                </button>
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md" onClick={() => setStep(detectedBranch === 'Familia' ? 'branch_family' : 'branch_civil')}>
                  No
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'branch_civil':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
            <div className="flex items-center gap-md mb-lg">
              <FileText className="text-primary" />
              <h2 className="font-headline-sm">Materia Civil: Evidencia Documentaria</h2>
            </div>
            <div className="flex flex-col">
              <p className="text-body-lg mb-xl text-on-surface">
                ¿Tiene algún documento que pruebe su reclamo o deuda (contrato firmado, letras de cambio, facturas, recibos, correos, mensajes de WhatsApp)?
              </p>
              <div className="flex gap-md">
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md" onClick={() => setStep('result_success')}>
                  Sí, tengo pruebas
                </button>
                <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-lg hover:bg-surface-container transition-colors" onClick={() => setStep('result_success')}>
                  No tengo pruebas, pero quiero intentar
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 'branch_family':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
            <div className="flex items-center gap-md mb-lg">
              <FileText className="text-primary" />
              <h2 className="font-headline-sm">Materia de Familia: Vínculo Legal</h2>
            </div>
            <div className="flex flex-col">
              <p className="text-body-lg mb-xl text-on-surface">
                ¿El menor de edad está reconocido legalmente por la persona a la que desea invitar (figura en la Partida de Nacimiento)?
              </p>
              <div className="flex gap-md">
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md" onClick={() => setStep('result_success')}>
                  Sí, está reconocido
                </button>
                <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-lg hover:bg-surface-container transition-colors" onClick={() => alert('Primero debe realizar un proceso judicial de Filiación o Reconocimiento de Paternidad.')}>
                  No está reconocido
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'result_rejected':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-container-lowest border border-error rounded-xl shadow-sm">
            <div className="flex flex-col items-center text-center p-xl">
              <ShieldAlert size={64} className="text-error mb-md" />
              <h2 className="text-error font-headline-md mb-md">Materia No Conciliable por Ley</h2>
              <p className="text-body-lg mb-xl text-on-surface-variant max-w-lg">
                Los casos de violencia familiar o delitos penales <strong>no son conciliables</strong>. Por tu seguridad y bienestar, debes acudir a las autoridades correspondientes.
              </p>
              <div className="flex justify-center gap-md mb-lg">
                <button className="bg-error text-on-error px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md flex items-center gap-sm">
                  <PhoneCall size={16} /> Llamar a Línea 100
                </button>
                <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-lg hover:bg-surface-container transition-colors">
                  Ubicar Comisaría/CEM
                </button>
              </div>
              <button className="text-on-surface-variant font-label-lg hover:text-primary transition-colors mt-md" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                Volver al inicio
              </button>
            </div>
          </motion.div>
        );

      case 'result_success':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-container-lowest border-2 border-green-600 rounded-xl shadow-sm">
            <div className="flex flex-col items-center text-center p-xl">
              <CheckCircle size={64} className="text-green-600 mb-md" />
              <h2 className="text-green-600 font-headline-md mb-md">¡Materia Conciliable!</h2>
              <p className="text-body-lg mb-xl text-on-surface-variant max-w-lg">
                Su caso clasifica como <strong>{detectedBranch}</strong> y cumple con los requisitos iniciales de la Ley de Conciliación.
              </p>
              <div className="flex justify-center gap-md mb-lg">
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md flex items-center gap-sm" onClick={() => navigate('/admisibilidad', { state: { materia: detectedBranch, hechos: nlpText } })}>
                  Continuar al Módulo 2 (Checklist) <ArrowRight size={16} />
                </button>
              </div>
              <button className="text-on-surface-variant font-label-lg hover:text-primary transition-colors mt-md" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                Evaluar otro caso
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="bg-surface">
      {/* Hero Section */}
      <div className="bg-primary-container/30 border-b border-outline-variant pb-2xl pt-xl px-md text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-headline-lg md:text-5xl text-primary font-bold mb-md leading-tight">
            Resuelva sus conflictos legales <br className="hidden md:block" /> sin ir a juicio
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-xl">
            La conciliación extrajudicial es un mecanismo rápido, económico y seguro para resolver problemas familiares y civiles con valor legal de sentencia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-md">
            <button 
              onClick={() => {
                document.getElementById('triaje-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-primary text-on-primary px-xl py-sm rounded-full font-label-lg hover:opacity-90 transition-all shadow-md flex justify-center items-center gap-sm text-lg"
            >
              Iniciar Triaje Gratuito <ArrowRight size={20} />
            </button>
            <button className="border border-outline-variant text-on-surface px-xl py-sm rounded-full font-label-lg hover:bg-surface-container transition-colors text-lg">
              Conocer más
            </button>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="max-w-6xl mx-auto py-2xl px-md grid grid-cols-1 md:grid-cols-3 gap-xl">
        <div className="text-center p-lg">
          <div className="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mx-auto mb-md rotate-3 shadow-sm">
            <CheckCircle size={32} />
          </div>
          <h3 className="font-headline-sm mb-sm text-on-surface">100% Legal</h3>
          <p className="text-on-surface-variant text-body-md">El acta de conciliación tiene el mismo valor que la sentencia de un juez.</p>
        </div>
        <div className="text-center p-lg">
          <div className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center mx-auto mb-md -rotate-3 shadow-sm">
            <Clock size={32} />
          </div>
          <h3 className="font-headline-sm mb-sm text-on-surface">Mucho más rápido</h3>
          <p className="text-on-surface-variant text-body-md">Un juicio puede durar años. Una conciliación se resuelve en 1 a 2 semanas.</p>
        </div>
        <div className="text-center p-lg">
          <div className="w-16 h-16 bg-error-container text-on-error-container rounded-2xl flex items-center justify-center mx-auto mb-md rotate-3 shadow-sm">
            <FileText size={32} />
          </div>
          <h3 className="font-headline-sm mb-sm text-on-surface">Menos desgaste</h3>
          <p className="text-on-surface-variant text-body-md">Se evita el estrés de los tribunales conversando en un ambiente pacífico.</p>
        </div>
      </div>

      {/* Casos de Uso */}
      <div className="bg-surface-container-lowest py-2xl px-md border-y border-outline-variant">
        <div className="max-w-4xl mx-auto text-center mb-xl">
          <h2 className="font-headline-md text-primary font-bold mb-sm">¿Qué casos se pueden conciliar?</h2>
          <p className="text-on-surface-variant text-body-lg">Existen materias específicas reguladas por la Ley de Conciliación N° 26872.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="bg-surface p-xl rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-sm text-primary mb-md border-b border-outline-variant pb-sm">Familia</h3>
            <ul className="space-y-sm text-on-surface">
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Pensión de alimentos (aumento, reducción o exoneración)</li>
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Régimen de visitas para los hijos</li>
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Tenencia y custodia de menores</li>
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Gastos de embarazo y parto</li>
            </ul>
          </div>
          <div className="bg-surface p-xl rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-sm text-secondary mb-md border-b border-outline-variant pb-sm">Civil y Comercial</h3>
            <ul className="space-y-sm text-on-surface">
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Desalojos y problemas con inquilinos</li>
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Cobro de deudas (préstamos, alquileres)</li>
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> Incumplimiento de contratos</li>
              <li className="flex items-start gap-sm"><CheckCircle size={18} className="text-green-600 mt-xs" /> División y partición de bienes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Triaje Section */}
      <div id="triaje-section" className="max-w-3xl mx-auto pt-2xl px-md pb-2xl">
        <div className="mb-xl text-center">
          <div className="inline-flex items-center justify-center p-sm bg-primary-container text-on-primary-container rounded-full mb-md">
            <ShieldAlert size={24} />
          </div>
          <h2 className="font-headline-lg text-primary font-bold mb-sm">Triaje Legal Virtual</h2>
          <p className="text-on-surface-variant text-body-lg">
            Nuestra IA analizará su caso gratis en segundos para decirle si es conciliable y qué debe hacer.
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiagnosticModule;
