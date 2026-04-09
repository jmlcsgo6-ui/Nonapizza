import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, BookOpen, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { useBuilder } from '../context/BuilderContext';

export default function Explore() {
    const { setIsBuilderOpen } = useBuilder();

    const openMenu = () => {
        document.dispatchEvent(new CustomEvent('open-menu'));
    };

    return (
        <section id="explore" className="py-24 bg-[#050505]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block"
                    >
                        PERSONALIZAÇÃO & VARIEDADE
                    </motion.span>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                        Sua Fome, <span className="text-gradient">Suas Regras</span>
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Action 1: Builder */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        onClick={() => setIsBuilderOpen(true)}
                        className="group relative h-[500px] rounded-[3rem] overflow-hidden cursor-pointer bg-card border border-white/5"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                        
                        <div className="absolute inset-0 p-12 flex flex-col justify-end">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <ChefHat size={32} strokeWidth={2.5} />
                                <div className="h-[2px] w-12 bg-primary"></div>
                            </div>
                            <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">Montar <span className="text-primary italic">Pizza</span></h3>
                            <p className="text-white/60 font-medium mb-8 max-w-sm leading-relaxed">
                                Você é o alquimista. Escolha o tamanho, a quantidade de fatias, e combine os sabores exatamente como desejar.
                            </p>
                            <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-6 transition-all">
                                COMEÇAR A CONSTRUIR <ArrowRight size={18} />
                            </button>
                        </div>

                        <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                            <span className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                                <Sparkles size={12} className="text-primary" /> Sugestão do Chef
                            </span>
                        </div>
                    </motion.div>
                    
                    {/* Action 2: Menu */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        onClick={openMenu}
                        className="group relative h-[500px] rounded-[3rem] overflow-hidden cursor-pointer bg-card border border-white/5"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                        
                        <div className="absolute inset-0 p-12 flex flex-col justify-end">
                            <div className="flex items-center gap-2 mb-6 text-white/40">
                                <BookOpen size={32} />
                                <div className="h-[2px] w-12 bg-white/20"></div>
                            </div>
                            <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">Ver <span className="text-white italic">Cardápio</span></h3>
                            <p className="text-white/60 font-medium mb-8 max-w-sm leading-relaxed">
                                Descubra nossas especialidades, desde os clássicos italianos até criações autorais apaixonantes.
                            </p>
                            <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white group-hover:gap-6 transition-all group-hover:text-primary">
                                EXPLORAR RECEITAS <ArrowRight size={18} />
                            </button>
                        </div>

                        <div className="absolute top-8 right-8 bg-primary/20 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-full">
                            <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                <Flame size={12} /> Alta Demanda
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
