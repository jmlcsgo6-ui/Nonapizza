import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, X, Utensils, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="contact" className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
                                <Utensils size={16} color="#fff" strokeWidth={3} />
                            </div>
                            <span className="text-xl font-display font-black tracking-tighter text-white">
                                NONA<span className="text-primary">PIZZA</span>
                            </span>
                        </div>
                        <p className="text-sm text-white/40 font-medium leading-relaxed max-w-xs">
                            A alquimia entre a fermentação natural de 48h e a paixão italiana. Simplesmente a pizza perfeita.
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, X].map((Icon, i) => (
                                <motion.a 
                                    key={i}
                                    href="#" 
                                    whileHover={{ y: -3, color: '#FF5F00' }}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 transition-all"
                                >
                                    <Icon size={18} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Navegação</h4>
                        <ul className="space-y-4">
                            {['Início', 'Como Funciona', 'Cardápio', 'Clube Nona'].map(item => (
                                <li key={item}>
                                    <a href="#" className="group flex items-center gap-2 text-sm font-bold text-white/60 hover:text-primary transition-colors no-underline">
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Suporte</h4>
                        <ul className="space-y-4 text-sm font-bold text-white/60">
                            <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Trabalhe Conosco</a></li>
                        </ul>
                    </div>

                    {/* Contact Detail */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Contato</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <MapPin size={18} />
                                </div>
                                <p className="text-xs font-bold leading-relaxed text-white/60 uppercase tracking-tighter">Rua das Pizzas Culturadas, 123<br/>São Paulo, Brasil</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <Phone size={18} />
                                </div>
                                <p className="text-xs font-black text-white">(11) 99999-9999</p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} Nona Pizza Alquimia. Crafted for the premium palate.
                    </p>
                    <div className="flex gap-4 items-center">
                        <div className="w-8 h-5 bg-white/5 rounded border border-white/10 opacity-40"></div>
                        <div className="w-8 h-5 bg-white/5 rounded border border-white/10 opacity-40"></div>
                        <div className="w-8 h-5 bg-white/5 rounded border border-white/10 opacity-40"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
