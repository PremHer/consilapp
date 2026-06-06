import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, AlertTriangle, CheckCircle, ArrowRight, PhoneCall, ShieldAlert, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Step = 'nlp_input' | 'nlp_processing' | 'ai_response' | 'filter_violence' | 'filter_penal' | 'branch_civil' | 'branch_family' | 'result_success' | 'result_rejected';

interface TriajeWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const TriajeWidget = ({ isOpen, onClose }: TriajeWidgetProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('nlp_input');
  const [nlpText, setNlpText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [detectedBranch, setDetectedBranch] = useState<'Familia' | 'Civil' | null>(null);

  const [hasAiError, setHasAiError] = useState(false);
  const [isConciliable, setIsConciliable] = useState<boolean | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);

  // Focus trap simple
  useEffect(() => {
    if (isOpen && widgetRef.current) {
      const textarea = widgetRef.current.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  }, [isOpen]);

  const simulateNLP = async () => {
    if (!nlpText) return;
    setStep('nlp_processing');
    setHasAiError(false);
    setIsConciliable(null);
    
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
        setHasAiError(true);
      } else {
        setAiResponse(data.response || "No se recibió respuesta de la IA.");
        if (data.isConciliable !== undefined) {
          setIsConciliable(data.isConciliable);
        }
      }
      
      if (nlpText.toLowerCase().includes('hijo') || nlpText.toLowerCase().includes('alimento') || nlpText.toLowerCase().includes('espos')) {
        setDetectedBranch('Familia');
      } else {
        setDetectedBranch('Civil');
      }
      setStep('ai_response');
    } catch (err) {
      console.error(err);
      setAiResponse(`❌ Error de conexión con la IA. Por favor, intente nuevamente.`);
      setHasAiError(true);
      setStep('ai_response');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'nlp_input':
        return (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-md">
              <div className="bg-surface-container rounded-lg p-md mb-md text-on-surface-variant text-body-md relative">
                <div className="absolute w-3 h-3 bg-surface-container rotate-45 -bottom-1.5 left-6"></div>
                ¡Hola! Soy tu asistente legal de triaje. Cuéntame de forma sencilla cuál es el motivo de tu consulta y analizaré si es posible conciliar tu caso.
                <br/><br/>
                <span className="text-outline">Ej: "El papá de mi hijo no me pasa dinero desde hace 3 meses" o "Mi inquilino no me paga el alquiler".</span>
              </div>
            </div>
            <div className="p-md bg-surface border-t border-outline-variant flex flex-col gap-sm">
              <textarea 
                className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary transition-colors" 
                rows={3} 
                placeholder="Describe tu caso aquí..."
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                style={{ resize: 'none' }}
              />
              <button 
                className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-sm disabled:opacity-50" 
                onClick={simulateNLP} 
                disabled={!nlpText}
              >
                Analizar Caso <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        );
      
      case 'nlp_processing':
        return (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full p-xl text-center">
            <div className="spinner" style={{ border: '3px solid rgba(0,0,0,0.1)', width: '32px', height: '32px', borderRadius: '50%', borderLeftColor: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <h3 className="font-headline-sm mt-md text-on-surface">Analizando con IA...</h3>
            <p className="text-on-surface-variant text-body-md mt-sm">Clasificando materia legal</p>
          </motion.div>
        );

      case 'ai_response':
        return (
          <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-md">
              <div className={`p-md rounded-lg mb-md border whitespace-pre-wrap text-body-md text-on-surface leading-relaxed relative ${hasAiError || isConciliable === false ? "bg-error-container/20 border-error/30" : "bg-primary-container/20 border-primary/20"}`}>
                <div className={`absolute w-3 h-3 rotate-45 -bottom-1.5 left-6 ${hasAiError || isConciliable === false ? "bg-error-container/20 border-r border-b border-error/30" : "bg-primary-container/20 border-r border-b border-primary/20"}`}></div>
                {aiResponse}
              </div>

              {!hasAiError ? (
                <>
                  {isConciliable === false ? (
                    <div className="mt-lg">
                      <p className="font-label-lg text-error font-bold mb-sm text-center">El caso no cumple los requisitos.</p>
                      <button className="w-full border border-outline-variant text-on-surface px-md py-sm rounded-lg font-label-md hover:bg-surface-container transition-colors" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                        Evaluar otro caso
                      </button>
                    </div>
                  ) : (
                    <div className="mt-lg">
                      <p className="font-label-md text-on-surface mb-sm text-center">¿Desea continuar con el proceso?</p>
                      <div className="flex flex-col gap-sm">
                        <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm" onClick={() => setStep('filter_violence')}>
                          Sí, continuar
                        </button>
                        <button className="border border-outline-variant text-on-surface px-md py-sm rounded-lg font-label-md hover:bg-surface-container transition-colors" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                          Hacer otra consulta
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-lg">
                  <p className="font-label-md text-on-surface mb-sm text-center">Error de red. ¿Qué desea hacer?</p>
                  <div className="flex flex-col gap-sm">
                    <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm" onClick={simulateNLP}>
                      Intentar de nuevo
                    </button>
                    <button className="border border-outline-variant text-on-surface px-md py-sm rounded-lg font-label-md hover:bg-surface-container transition-colors" onClick={() => setStep('filter_violence')}>
                      Continuar manualmente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'filter_violence':
        return (
          <motion.div key="fv" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full p-md overflow-y-auto">
            <div className="flex items-center gap-sm text-error mb-md">
              <ShieldAlert size={20} />
              <h2 className="font-headline-sm">Seguridad (Ley 30364)</h2>
            </div>
            <p className="text-body-md mb-lg text-on-surface">
              ¿Este problema involucra episodios de <strong>violencia física, psicológica o sexual</strong> hacia usted o un familiar por parte de la otra persona?
            </p>
            <div className="flex flex-col gap-sm mt-auto">
              <button className="border border-error text-error px-md py-sm rounded-lg font-label-md hover:bg-error-container transition-colors" onClick={() => setStep('result_rejected')}>
                Sí, hay violencia
              </button>
              <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm" onClick={() => setStep('filter_penal')}>
                No, es tema civil/familiar
              </button>
            </div>
          </motion.div>
        );
      
      case 'filter_penal':
        return (
          <motion.div key="fp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full p-md overflow-y-auto">
            <div className="flex items-center gap-sm text-secondary mb-md">
              <AlertTriangle size={20} />
              <h2 className="font-headline-sm">Filtro Penal</h2>
            </div>
            <p className="text-body-md mb-lg text-on-surface">
              ¿Su consulta está relacionada con la comisión de un delito (robo, estafa, agresión) o involucra bienes del Estado?
            </p>
            <div className="flex flex-col gap-sm mt-auto">
              <button className="border border-outline-variant text-on-surface px-md py-sm rounded-lg font-label-md hover:bg-surface-container transition-colors" onClick={() => setStep('result_rejected')}>
                Sí, es un delito
              </button>
              <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm" onClick={() => setStep(detectedBranch === 'Familia' ? 'branch_family' : 'branch_civil')}>
                No
              </button>
            </div>
          </motion.div>
        );

      case 'branch_civil':
        return (
          <motion.div key="bc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full p-md overflow-y-auto">
            <div className="flex items-center gap-sm text-primary mb-md">
              <FileText size={20} />
              <h2 className="font-headline-sm">Evidencia Civil</h2>
            </div>
            <p className="text-body-md mb-lg text-on-surface">
              ¿Tiene algún documento que pruebe su reclamo o deuda (contrato, facturas, recibos, correos, WhatsApp)?
            </p>
            <div className="flex flex-col gap-sm mt-auto">
              <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm" onClick={() => setStep('result_success')}>
                Sí, tengo pruebas
              </button>
              <button className="border border-outline-variant text-on-surface px-md py-sm rounded-lg font-label-md hover:bg-surface-container transition-colors" onClick={() => setStep('result_success')}>
                No tengo, quiero intentar
              </button>
            </div>
          </motion.div>
        );
        
      case 'branch_family':
        return (
          <motion.div key="bf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full p-md overflow-y-auto">
            <div className="flex items-center gap-sm text-primary mb-md">
              <FileText size={20} />
              <h2 className="font-headline-sm">Vínculo Legal</h2>
            </div>
            <p className="text-body-md mb-lg text-on-surface">
              ¿El menor de edad está reconocido legalmente por la persona a la que desea invitar (figura en la Partida de Nacimiento)?
            </p>
            <div className="flex flex-col gap-sm mt-auto">
              <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm" onClick={() => setStep('result_success')}>
                Sí, está reconocido
              </button>
              <button className="border border-outline-variant text-on-surface px-md py-sm rounded-lg font-label-md hover:bg-surface-container transition-colors" onClick={() => alert('Primero debe realizar un proceso judicial de Filiación o Reconocimiento de Paternidad.')}>
                No está reconocido
              </button>
            </div>
          </motion.div>
        );

      case 'result_rejected':
        return (
          <motion.div key="rr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full p-md items-center justify-center text-center overflow-y-auto">
            <ShieldAlert size={48} className="text-error mb-md" />
            <h2 className="text-error font-headline-sm mb-sm">Materia No Conciliable</h2>
            <p className="text-body-sm mb-lg text-on-surface-variant">
              Los casos de violencia familiar o delitos no son conciliables. Debes acudir a las autoridades.
            </p>
            <div className="flex flex-col gap-sm w-full mt-auto">
              <button className="bg-error text-on-error px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-sm">
                <PhoneCall size={16} /> Línea 100
              </button>
              <button className="text-on-surface-variant font-label-md hover:text-primary transition-colors py-sm" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                Volver al inicio
              </button>
            </div>
          </motion.div>
        );

      case 'result_success':
        return (
          <motion.div key="rs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full p-md items-center justify-center text-center overflow-y-auto">
            <CheckCircle size={48} className="text-green-600 mb-md" />
            <h2 className="text-green-600 font-headline-sm mb-sm">¡Materia Conciliable!</h2>
            <p className="text-body-sm mb-lg text-on-surface-variant">
              Su caso clasifica como <strong>{detectedBranch}</strong> y cumple con los requisitos iniciales.
            </p>
            <div className="flex flex-col gap-sm w-full mt-auto">
              <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-sm" onClick={() => {
                onClose();
                navigate('/admisibilidad', { state: { materia: detectedBranch, hechos: nlpText } });
              }}>
                Continuar a Solicitud <ArrowRight size={16} />
              </button>
              <button className="text-on-surface-variant font-label-md hover:text-primary transition-colors py-sm" onClick={() => { setStep('nlp_input'); setNlpText(''); }}>
                Evaluar otro caso
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 md:right-8 w-[calc(100vw-32px)] md:w-[380px] h-[550px] max-h-[75vh] bg-surface border border-outline-variant rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
            ref={widgetRef}
          >
            {/* Header del Widget */}
            <div className="bg-primary text-on-primary p-md flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-sm">
                <ShieldAlert size={20} className="text-primary-container" />
                <span className="font-headline-sm">Triaje Legal IA</span>
              </div>
              <button onClick={onClose} className="text-on-primary hover:bg-primary-container/20 p-xs rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Contenido Dinámico */}
            <div className="flex-1 overflow-hidden relative bg-surface-container-lowest">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Botón Flotante para abrir/cerrar */}
      <motion.button
        className="fixed bottom-6 right-4 md:right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:opacity-90 hover:scale-105 active:scale-95 transition-all z-40"
        onClick={isOpen ? onClose : () => {}} // onClose is handled if open, but if it's closed we don't handle opening here if controlled by parent. 
        // Oh wait, the parent controls isOpen. So we should probably let parent control it, or just emit an event. 
        // If it's closed, `isOpen` is false, this whole component still renders the FAB?
        // Yes, the FAB is always here. We need an onToggle prop or similar if the parent holds the state.
        // Wait, let's keep the FAB strictly inside the widget, and the widget manages its own state if possible, but the parent also wants to open it via a button.
        // We will pass `onOpen` if closed, and `onClose` if open. But wait, `isOpen` is controlled. 
        // I will change the logic below to assume `TriajeWidget` is rendered always, and it receives `isOpen` and `onToggle` or `setIsOpen`.
        style={{ display: 'none' }} // Actually, we will render the FAB in the parent so it's perfectly synchronized. Let's hide this one and let parent render the FAB.
      >
        <MessageSquare size={24} />
      </motion.button>
    </>
  );
};

export default TriajeWidget;
