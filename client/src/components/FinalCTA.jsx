import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
            
            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-card border border-white/5 rounded-[3rem] p-12 md:p-20 shadow-2xl"
                >
                    <span className="nona-badge mb-8 inline-block">EXPERIÊNCIA EXCLUSIVA</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-[1] mb-8 uppercase">
                        Pronto para sentir o <span className="text-primary">verdadeiro sabor</span> da Itália?
                    </h2>
                    <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto font-medium">
                        Não espere pelo amanhã. A alquimia de 48h está pronta para ser entregue na sua porta agora.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 95, 0, 0.4)' }}
                            className="btn-premium py-5 px-10 text-lg"
                            onClick={() => document.dispatchEvent(new CustomEvent('open-builder'))}
                        >
                            MONTAR MINHA PIZZA <ShoppingBag size={22} strokeWidth={3} />
                        </motion.button>
                        
                        <button 
                            className="flex items-center justify-center gap-2 text-white/40 hover:text-white font-black uppercase tracking-[0.2em] text-xs transition-all"
                            onClick={() => document.dispatchEvent(new CustomEvent('open-menu'))}
                        >
                            VER CARDÁPIO COMPLETO <ChevronRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
