import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, FileCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const AdmisibilidadModule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addExpediente = useStore(state => state.addExpediente);
  
  const materiaPreseleccionada = location.state?.materia || 'CIVIL';

  const [nombres, setNombres] = useState('');
  const [dniSolicitante, setDniSolicitante] = useState('');
  const [contraparte, setContraparte] = useState('');
  const [dniContraparte, setDniContraparte] = useState('');
  const [celularInvitado, setCelularInvitado] = useState('');
  const [materia, setMateria] = useState(materiaPreseleccionada);
  
  const [files, setFiles] = useState<{ dni: File | null, voucher: File | null, pruebas: File[] }>({
    dni: null,
    voucher: null,
    pruebas: []
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'dni' | 'voucher' | 'pruebas') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'pruebas') {
        setFiles(prev => ({ ...prev, pruebas: [...prev.pruebas, ...Array.from(e.target.files!)] }));
      } else {
        setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addExpediente({
      materia: materia.toUpperCase(),
      solicitanteNom: nombres,
      solicitanteDni: dniSolicitante,
      invitadoNom: contraparte,
      invitadoDni: dniContraparte,
      invitadoCelular: celularInvitado || undefined
    });
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto pt-xl px-md text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface-container-lowest border-2 border-green-600 rounded-xl shadow-sm p-xl">
          <CheckCircle size={80} className="text-green-600 mx-auto mb-md" />
          <h2 className="text-green-600 font-headline-lg mb-md">¡Solicitud Enviada con Éxito!</h2>
          <p className="text-body-lg text-on-surface-variant mb-xl">
            Su solicitud de conciliación y sus documentos han sido cargados. Nuestro equipo validará el voucher y los anexos en un plazo máximo de 1 día hábil.
          </p>
          <div className="flex justify-center gap-md">
            <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 shadow-md" onClick={() => navigate('/dashboard')}>
              Ir al Tablero del Conciliador (Demo)
            </button>
            <button className="border border-outline-variant px-lg py-sm rounded-lg font-label-lg text-on-surface hover:bg-surface-container" onClick={() => navigate('/')}>
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
        <p className="text-on-surface-variant text-body-lg">Carga manual de anexos obligatorios y validación de voucher.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
        {/* Datos Básicos */}
        <div className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
          <h3 className="font-headline-sm text-on-surface mb-md">1. Datos de la Solicitud</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="md:col-span-2">
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Materia Conciliable</label>
              <input type="text" value={materia} onChange={e => setMateria(e.target.value)} className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:outline-none" required />
            </div>
            
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">DNI del Solicitante</label>
              <input type="text" maxLength={8} value={dniSolicitante} onChange={e => setDniSolicitante(e.target.value.replace(/\D/g,''))} placeholder="8 dígitos" className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Nombres del Solicitante</label>
              <input type="text" value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:outline-none" required />
            </div>

            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">DNI/RUC del Invitado</label>
              <input type="text" maxLength={11} value={dniContraparte} onChange={e => setDniContraparte(e.target.value.replace(/\D/g,''))} placeholder="8 u 11 dígitos" className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Nombres de la Contraparte</label>
              <input type="text" value={contraparte} onChange={e => setContraparte(e.target.value)} placeholder="Ej. Empresa ABC S.A.C" className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:outline-none" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-label-lg font-bold text-on-surface mb-xs">Celular del Invitado (WhatsApp)</label>
              <input type="text" maxLength={15} value={celularInvitado} onChange={e => setCelularInvitado(e.target.value.replace(/\D/g,''))} placeholder="Ej. 987654321" className="w-full p-sm bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:outline-none" required />
              <p className="text-label-sm text-on-surface-variant mt-xs">A este número se enviarán las notificaciones de audiencias.</p>
            </div>
          </div>
        </div>

        {/* Carga de Documentos */}
        <div className="bg-surface-container-lowest p-xl border border-outline-variant rounded-xl shadow-sm">
          <h3 className="font-headline-sm text-on-surface mb-md">2. Anexos y Pruebas</h3>
          <p className="text-label-md text-on-surface-variant mb-lg">Formatos aceptados: JPG, PNG, PDF (Máx. 5MB por archivo).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* DNI Upload */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-colors relative">
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
                  <span className="font-bold text-on-surface text-label-lg">Copia de DNI (Opcional)</span>
                  <span className="text-label-sm text-on-surface-variant mt-xs">Click o arrastrar archivo</span>
                </>
              )}
            </div>

            {/* Voucher Upload */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-colors relative">
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
                  <span className="font-bold text-on-surface text-label-lg">Voucher de Pago (Opcional)</span>
                  <span className="text-label-sm text-on-surface-variant mt-xs">Captura de Yape/Plin o transferencia</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-md mt-md">
          <button type="button" onClick={() => navigate('/')} className="px-lg py-sm rounded-lg font-label-lg text-on-surface border border-outline-variant hover:bg-surface-container transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={!nombres || !contraparte || !dniSolicitante || !dniContraparte || !celularInvitado} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md flex items-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Enviar Solicitud <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmisibilidadModule;
