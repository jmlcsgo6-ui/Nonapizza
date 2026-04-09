import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const reviews = [
        {
            name: "Rafael Costa",
            text: "A melhor pizza que já pedi por delivery. A massa de 48h é incrivelmente leve e o aroma que sai da caixa é hipnotizante.",
            role: "Gastro-Entusiasta",
            rating: 5,
            img: "https://i.pravatar.cc/100?u=raf"
        },
        {
            name: "Mariana Souza",
            text: "A qualidade dos ingredientes San Marzano é nítida. O presunto de parma e a burrata são fantásticos. Experiência de restaurante em casa.",
            role: "Sommelier",
            rating: 5,
            img: "https://i.pravatar.cc/100?u=mari"
        },
        {
            name: "Lucas Moreira",
            text: "Achei a embalagem térmica fantástica. Mantém a pizza quentinha e a crosta crocante como se tivesse acabado de sair do forno.",
            role: "Designer de UX",
            rating: 5,
            img: "https://i.pravatar.cc/100?u=luc"
        }
    ];

    return (
        <section id="testimonials" className="py-24 bg-[#080808]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">VOZ DOS ALQUIMISTAS</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Relatos de quem <span className="text-gradient">provou o impossível</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((r, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            viewport={{ once: true }}
                            className="bg-card border border-white/5 rounded-[2.5rem] p-8 relative group hover:border-primary/20 transition-all duration-500"
                        >
                            <Quote size={40} className="absolute top-8 right-8 text-white/5 group-hover:text-primary/10 transition-colors" />
                            
                            <div className="flex gap-1 mb-8">
                                {[...Array(r.rating)].map((_, j) => (
                                    <Star key={j} size={14} fill="#FF5F00" color="#FF5F00" />
                                ))}
                            </div>

                            <p className="text-lg text-white/60 font-medium italic leading-relaxed mb-10">"{r.text}"</p>
                            
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-deep">
                                    <img src={r.img} alt={r.name} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">{r.name}</h4>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">{r.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
