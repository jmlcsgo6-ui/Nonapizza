import React from 'react';
import { motion } from 'framer-motion';
import { Pizza, Flame, Truck, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        { 
            icon: Pizza, 
            title: "Escolha seu Destino", 
            text: "Explore o cardápio ou desperte o chef em você montando sua pizza do zero.",
            color: "text-primary"
        },
        { 
            icon: Flame, 
            title: "O Ritual do Fogo", 
            text: "Massa de 48h assada à perfeição em forno de altíssima temperatura.",
            color: "text-[#FF8A00]"
        },
        { 
            icon: Truck, 
            title: "Missão Entrega", 
            text: "Embalagem térmica blindada para garantir o calor e a essência intactos.",
            color: "text-[#FFB000]"
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-deep">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-4 block">DO FORNO AO SEU PALADAR</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">O Caminho da <span className="text-gradient">Perfeição</span></h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative">
                    {/* SVG Connector Line (Desktop) */}
                    <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent hidden lg:block"></div>

                    {steps.map((s, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="flex-1 flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-8">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={`w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:border-primary/40 group-hover:bg-primary/5 shadow-2xl ${s.color}`}
                                >
                                    <s.icon size={40} strokeWidth={1.5} />
                                </motion.div>
                                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-deep border border-white/5 flex items-center justify-center text-[10px] font-black text-white/40 group-hover:text-primary transition-colors">
                                    0{i+1}
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-4 group-hover:text-primary transition-colors">{s.title}</h3>
                            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-[250px]">{s.text}</p>
                            
                            {i < 2 && (
                                <ArrowRight className="mt-8 text-white/5 hidden md:block lg:hidden" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
