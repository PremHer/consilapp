import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, FileCheck, CheckCircle, ArrowRight, User, Users, FileText, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

const AdmisibilidadModule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addExpediente = useStore(state => state.addExpediente);
  
  const materiaPreseleccionada = location.state?.materia || 'CIVIL';
  const hechosPreseleccionados = location.state?.hechos || '';

  const [nombres, setNombres] = useState('');
  const [dniSolicitante, setDniSolicitante] = useState('');
  const [solicitanteEmail, setSolicitanteEmail] = useState('');
  const [solicitanteCelular, setSolicitanteCelular] = useState('');
  
  const [contraparte, setContraparte] = useState('');
  const [dniContraparte, setDniContraparte] = useState('');
  const [celularInvitado, setCelularInvitado] = useState('');
  const [invitadoDireccion, setInvitadoDireccion] = useState('');
  
  const [materia, setMateria] = useState(materiaPreseleccionada);
  const [detalles, setDetalles] = useState(hechosPreseleccionados);
  
  const [files, setFiles] = useState<{ dni: File | null, voucher: File | null, especifico: File | null, pruebas: File[] }>({
    dni: null,
    voucher: null,
    especifico: null,
    pruebas: []
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdExp, setCreatedExp] = useState<any>(null);

  // Auto-completar DNI Solicitante
  useEffect(() => {
    if (dniSolicitante.length === 8) {
      const fetchDni = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://consilapp-production.up.railway.app/api');
          const res = await fetch(`${API_URL}/reniec/dni/${dniSolicitante}`);
          if (res.ok) {
            const data = await res.json();
            if (data.nombres) {
              setNombres(`${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchDni();
    }
  }, [dniSolicitante]);

  // Auto-completar DNI/RUC Invitado
  useEffect(() => {
    if (dniContraparte.length === 8) {
      const fetchDni = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://consilapp-production.up.railway.app/api');
          const res = await fetch(`${API_URL}/reniec/dni/${dniContraparte}`);
          if (res.ok) {
            const data = await res.json();
            if (data.nombres) {
              setContraparte(`${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchDni();
    } else if (dniContraparte.length === 11) {
      const fetchRuc = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://consilapp-production.up.railway.app/api');
          const res = await fetch(`${API_URL}/reniec/ruc/${dniContraparte}`);
          if (res.ok) {
            const data = await res.json();
            if (data.nombre) {
              setContraparte(data.nombre);
              if (data.direccion) {
                setInvitadoDireccion(`${data.direccion.trim()}, ${data.distrito}, ${data.provincia}`);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchRuc();
    }
  }, [dniContraparte]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'dni' | 'voucher' | 'especifico' | 'pruebas') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'pruebas') {
        setFiles(prev => ({ ...prev, pruebas: [...prev.pruebas, ...Array.from(e.target.files!)] }));
      } else {
        setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
      }
    }
  };

  const getSpecificDocInfo = () => {
    switch(materia) {
      case 'ALIMENTOS': return { title: 'Partida de Nacimiento', desc: 'Firmada por el demandado (Requerido)' };
      case 'VISITAS_TENENCIA': return { title: 'Partida de Nacimiento', desc: 'Firmada por el demandado (Requerido)' };
      case 'DESALOJO': return { title: 'Contrato o Copia Literal', desc: 'Sustento de propiedad o arriendo' };
      case 'DEUDAS': return { title: 'Sustento de Deuda', desc: 'Letra de cambio, recibo, transferencias' };
      default: return { title: 'Documento Probatorio', desc: 'Documento principal de prueba' };
    }
  };

  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setErrorSubmit(null);
    setIsSubmitting(true);
    
    try {
      const newExp = await addExpediente({
        materia: materia.toUpperCase(),
        detalles,
        solicitanteNom: nombres,
        solicitanteDni: dniSolicitante,
        solicitanteEmail,
        solicitanteCelular,
        invitadoNom: contraparte,
        invitadoDni: dniContraparte,
        invitadoCelular: celularInvitado || undefined,
        invitadoDireccion
      });
      setCreatedExp(newExp);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorSubmit(err.message || "Error desconocido al guardar el expediente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const trackingCode = createdExp?.numero || (createdExp?.id ? createdExp.id.substring(0, 8) : '2026-003');
    return (
      <div className="max-w-2xl mx-auto pt-xl px-md text-center pb-xl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-xl flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-container text-primary rounded-full flex items-center justify-center mb-md">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-primary font-headline-md mb-sm">¡Solicitud Enviada con Éxito!</h2>
          <p className="text-body-md text-on-surface-variant mb-lg">
            Su solicitud de conciliación ha sido cargada correctamente en nuestro sistema. El equipo de admisiones validará sus documentos y el voucher en un plazo máximo de 1 día hábil.
          </p>

          <div className="bg-surface-container border border-outline-variant p-lg rounded-xl mb-xl w-full max-w-md">
            <p className="text-label-sm text-on-surface-variant mb-xs font-bold uppercase tracking-wider">Código de Seguimiento</p>
            <p className="font-headline-sm text-primary tracking-wide text-3xl font-extrabold select-all mb-sm">{trackingCode}</p>
            <p className="text-body-sm text-on-surface-variant">
              Guarde este código para consultar el avance del trámite en cualquier momento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-md w-full justify-center">
            <button 
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-sm"
              onClick={() => navigate(`/seguimiento/${trackingCode}`)}
            >
              <Search size={18} />
              Hacer Seguimiento de mi Solicitud
            </button>
            <button 
              className="border border-outline-variant px-lg py-sm rounded-lg font-label-lg text-on-surface hover:bg-surface-container transition-colors"
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-xl px-md pb-xl">
      <div className="mb-xl">
        <h1 className="font-headline-lg text-primary mb-sm">Módulo de Admisibilidad</h1>
        <p className="text-on-surface-variant text-body-lg">Complete los datos de las partes y adjunte los documentos probatorios.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
        {/* Detalles del Conflicto */}
        <div className="bg-surface-container-lowest p-lg md:p-xl border border-outline-variant rounded-xl shadow-sm">
          <div className="flex items-center gap-sm mb-md border-b border-outline-variant pb-sm">
            <FileText className="text-primary" />
            <h3 className="font-headline-sm text-on-surface">1. Detalles del Conflicto</h3>
          </div>
          <div className="grid grid-cols-1 gap-md">
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Materia Conciliable</label>
              <select value={materia} onChange={e => setMateria(e.target.value)} className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                <option value="ALIMENTOS">Familia - Pensión de Alimentos</option>
                <option value="VISITAS_TENENCIA">Familia - Visitas y Tenencia</option>
                <option value="DESALOJO">Civil - Desalojos</option>
                <option value="DEUDAS">Civil - Cobro de Deudas</option>
                <option value="CIVIL">Civil - Otros (Incumplimientos, etc)</option>
                <option value="FAMILIA">Familia - Otros</option>
                <option value="LABORAL">Laboral</option>
                <option value="CONTRATACIONES">Contrataciones con el Estado</option>
              </select>
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Descripción de los Hechos</label>
              <textarea 
                rows={4} 
                value={detalles} 
                onChange={e => setDetalles(e.target.value)} 
                placeholder="Describa brevemente el problema y qué es lo que solicita..." 
                className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" 
              />
              {hechosPreseleccionados && <p className="text-label-sm text-secondary font-bold mt-xs">✨ Pre-llenado inteligentemente desde el Triaje Legal.</p>}
            </div>
          </div>
        </div>

        {/* Datos del Solicitante */}
        <div className="bg-surface-container-lowest p-lg md:p-xl border border-outline-variant rounded-xl shadow-sm">
          <div className="flex items-center gap-sm mb-md border-b border-outline-variant pb-sm">
            <User className="text-primary" />
            <h3 className="font-headline-sm text-on-surface">2. Datos del Solicitante (Usted)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">DNI del Solicitante *</label>
              <input type="text" maxLength={8} value={dniSolicitante} onChange={e => setDniSolicitante(e.target.value.replace(/\D/g,''))} placeholder="8 dígitos" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Nombres Completos *</label>
              <input type="text" value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Correo Electrónico *</label>
              <input type="email" value={solicitanteEmail} onChange={e => setSolicitanteEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Celular *</label>
              <input type="text" maxLength={15} value={solicitanteCelular} onChange={e => setSolicitanteCelular(e.target.value.replace(/\D/g,''))} placeholder="Ej. 987654321" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
          </div>
        </div>

        {/* Datos del Invitado */}
        <div className="bg-surface-container-lowest p-lg md:p-xl border border-outline-variant rounded-xl shadow-sm">
          <div className="flex items-center gap-sm mb-md border-b border-outline-variant pb-sm">
            <Users className="text-secondary" />
            <h3 className="font-headline-sm text-on-surface">3. Datos del Invitado (A quien desea conciliar)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">DNI/RUC del Invitado *</label>
              <input type="text" maxLength={11} value={dniContraparte} onChange={e => setDniContraparte(e.target.value.replace(/\D/g,''))} placeholder="8 u 11 dígitos" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Nombres o Razón Social *</label>
              <input type="text" value={contraparte} onChange={e => setContraparte(e.target.value)} placeholder="Ej. Empresa ABC S.A.C" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Celular del Invitado (Opcional pero recomendado)</label>
              <input type="text" maxLength={15} value={celularInvitado} onChange={e => setCelularInvitado(e.target.value.replace(/\D/g,''))} placeholder="Ej. 987654321" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              <p className="text-label-sm text-on-surface-variant mt-xs">Acelera el proceso al permitir notificaciones inmediatas por WhatsApp.</p>
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Dirección Física del Invitado *</label>
              <input type="text" value={invitadoDireccion} onChange={e => setInvitadoDireccion(e.target.value)} placeholder="Av. Los Pinos 123, Distrito" className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              <p className="text-label-sm text-on-surface-variant mt-xs">Requerido legalmente para enviar la notificación por courier.</p>
            </div>
          </div>
        </div>

        {/* Carga de Documentos */}
        <div className="bg-surface-container-lowest p-lg md:p-xl border border-outline-variant rounded-xl shadow-sm">
          <div className="flex items-center gap-sm mb-md border-b border-outline-variant pb-sm">
            <UploadCloud className="text-primary" />
            <h3 className="font-headline-sm text-on-surface">4. Anexos y Pruebas</h3>
          </div>
          <p className="text-label-md text-on-surface-variant mb-lg">Formatos aceptados: JPG, PNG, PDF (Máx. 5MB por archivo).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* DNI Upload */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-colors relative bg-surface">
              <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'dni')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {files.dni ? (
                <>
                  <FileCheck size={40} className="text-primary mb-sm" />
                  <span className="font-bold text-on-surface text-label-lg truncate max-w-[200px]">{files.dni.name}</span>
                  <span className="text-label-sm text-success font-bold mt-xs">Cargado exitosamente</span>
                </>
              ) : (
                <>
                  <UploadCloud size={40} className="text-on-surface-variant mb-sm" />
                  <span className="font-bold text-on-surface text-label-lg">Copia de DNI</span>
                  <span className="text-label-sm text-on-surface-variant mt-xs">Requerido por Ley</span>
                </>
              )}
            </div>

            {/* Documento Específico Dinámico */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-colors relative bg-surface">
              <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'especifico')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {files.especifico ? (
                <>
                  <FileCheck size={40} className="text-primary mb-sm" />
                  <span className="font-bold text-on-surface text-label-lg truncate max-w-[200px]">{files.especifico.name}</span>
                  <span className="text-label-sm text-success font-bold mt-xs">Cargado exitosamente</span>
                </>
              ) : (
                <>
                  <FileText size={40} className="text-on-surface-variant mb-sm" />
                  <span className="font-bold text-on-surface text-label-lg">{getSpecificDocInfo().title}</span>
                  <span className="text-label-sm text-on-surface-variant mt-xs">{getSpecificDocInfo().desc}</span>
                </>
              )}
            </div>

            {/* Voucher Upload */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-colors relative bg-surface">
              <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'voucher')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {files.voucher ? (
                <>
                  <FileCheck size={40} className="text-primary mb-sm" />
                  <span className="font-bold text-on-surface text-label-lg truncate max-w-[200px]">{files.voucher.name}</span>
                  <span className="text-label-sm text-success font-bold mt-xs">Cargado exitosamente</span>
                </>
              ) : (
                <>
                  <UploadCloud size={40} className="text-on-surface-variant mb-sm" />
                  <span className="font-bold text-on-surface text-label-lg">Voucher de Pago</span>
                  <span className="text-label-sm text-on-surface-variant mt-xs">Captura de Yape o Plin</span>
                </>
              )}
            </div>
          </div>
        </div>

        {errorSubmit && (
          <div className="bg-error-container text-on-error-container p-md rounded-lg text-body-md border border-error">
            <strong>Error al guardar:</strong> {errorSubmit}
          </div>
        )}

        <div className="flex justify-end gap-md">
          <button type="button" onClick={() => navigate('/')} className="px-lg py-sm rounded-lg font-label-lg text-on-surface border border-outline-variant hover:bg-surface-container transition-colors bg-surface">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting || !nombres || !contraparte || !dniSolicitante || !dniContraparte || !invitadoDireccion || !solicitanteEmail} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md flex items-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Enviando...' : (
              <>Enviar Solicitud Legal <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmisibilidadModule;
