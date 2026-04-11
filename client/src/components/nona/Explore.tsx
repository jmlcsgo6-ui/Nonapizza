import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { Wand2, BookOpen, ArrowRight } from 'lucide-react';

export default function Explore() {
    const { setIsBuilderOpen } = useBuilder();

    const openMenu = () => {
        document.dispatchEvent(new CustomEvent('open-menu'));
    };

    return (
        <section id="explore" className="section bg-alt reveal-on-scroll reveal-scale">
            <div className="container">
                <div className="section-header text-center explore-header">
                    <h2 className="section-title main-title">Sua Fome, Suas Regras</h2>
                    <p className="section-subtitle">Escolha como deseja se deliciar com as receitas da Nona.</p>
                </div>

                <div className="dual-action-grid">
                    <div className="action-card promo-builder" onClick={() => setIsBuilderOpen(true)}>
                        <div className="ac-overlay"></div>
                        <div className="ac-content">
                            <h3><Wand2 size={24} /> Montar Pizza</h3>
                            <p>Você é o chef. Escolha o tamanho, a quantidade de fatias, e combine os seus sabores preferidos exatamente como desejar.</p>
                            <button className="btn btn-primary mt-2">
                                Começar a Construir <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="action-card promo-menu" onClick={openMenu}>
                        <div className="ac-overlay"></div>
                        <div className="ac-content">
                            <h3><BookOpen size={24} /> Ver Cardápio</h3>
                            <p>Descubra nossas especialidades, desde os clássicos italianos até criações autorais apaixonantes e bebidas geladas.</p>
                            <button className="btn btn-secondary mt-2">
                                Explorar Receitas <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
