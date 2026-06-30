import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-lg min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-lg">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">explore_off</span>
        </div>
        <h1 className="font-headline-lg text-on-surface mb-sm">Página no encontrada</h1>
        <p className="text-body-lg text-on-surface-variant mb-xl">
          La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Link 
            to="/" 
            className="px-lg py-sm bg-primary text-on-primary rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined">home</span>
            Ir al Inicio
          </Link>
          <Link 
            to="/login" 
            className="px-lg py-sm bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg font-label-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined">login</span>
            Portal Interno
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
