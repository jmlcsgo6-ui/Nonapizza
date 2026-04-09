import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Zap, Box, Info } from 'lucide-react';

export default function WhyUs() {
    const benefits = [
        { 
            icon: ShieldCheck, 
            title: "Alquimia de 48h", 
            desc: "Farinha 00 importada e fermentação natural prolongada para uma leveza inigualável e digestão perfeita." 
        },
        { 
            icon: Zap, 
            title: "Velocidade & Precisão", 
            desc: "Cronometramos do forno à porta. Logística de elite para garantir que o calor italiano chegue intocado." 
        },
        { 
            icon: Box, 
            title: "Embalagem Sci-Fi", 
            desc: "Nossa caixa tecnológica mantém a umidade sob controle e preserva a crocância da crosta até a última fatia." 
        }
    ];

    return (
        <section id="why-us" className="py-24 bg-deep overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        <div>
                            <span className="nona-badge mb-6 inline-block">NOSSA DIFERENÇA</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9] mb-8">
                                Não é apenas <span className="text-gradient">Pizza</span>.<br/>É Alta Performance.
                            </h2>
                            <p className="text-lg text-white/40 max-w-xl font-medium leading-relaxed">
                                Elevamos cada detalhe do processo para que você receba em casa uma experiência digna do Guia Michelin.
                            </p>
                        </div>

                        <div className="space-y-10">
                            {benefits.map((b, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex gap-6 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-primary/20">
                                        <b.icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-2 group-hover:text-primary transition-colors">{b.title}</h4>
                                        <p className="text-white/40 text-sm font-medium leading-relaxed">{b.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="relative">
                        {/* Immersive Visual Decoration */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            className="relative z-10 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl skew-x-1"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=1000&auto=format&fit=crop" 
                                alt="Pizza Premium" 
                                className="w-full h-[600px] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent"></div>
                            
                            {/* Stats Overlay */}
                            <div className="absolute bottom-10 left-10 p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl max-w-xs">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <Star size={16} fill="currentColor" />
                                    <span className="text-xs font-black uppercase tracking-widest text-white">Top 1% Delivery</span>
                                </div>
                                <p className="text-white/60 text-[10px] font-bold leading-relaxed uppercase">Ranking baseado em frescor, tempo de entrega e satisfação do paladar.</p>
                            </div>
                        </motion.div>
                        
                        {/* Floating Blobs */}
                        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
