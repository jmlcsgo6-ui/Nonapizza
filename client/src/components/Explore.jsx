import React from 'react';
import { useBuilder } from '../context/BuilderContext';

export default function Explore() {
    const { setIsBuilderOpen } = useBuilder();

    const openMenu = () => {
        document.dispatchEvent(new CustomEvent('open-menu'));
    };

    return (
        <section id="explore" className="section bg-alt reveal-on-scroll">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title animated-title">Sua Fome, Suas Regras</h2>
                    <p className="section-subtitle">Escolha como deseja se deliciar com as receitas da Nona.</p>
                </div>
                
                <div className="dual-action-grid">
                    <div className="action-card promo-builder hover-scale" id="card-monte-pizza" onClick={() => setIsBuilderOpen(true)}>
                        <div className="ac-overlay"></div>
                        <div className="ac-content">
                            <h3><i className="fa-solid fa-wand-magic-sparkles"></i> Montar Pizza</h3>
                            <p>Você é o chef. Escolha o tamanho, a quantidade de fatias, e combine os seus sabores preferidos exatamente como desejar.</p>
                            <button className="btn btn-primary mt-2">Começar a Construir <i className="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                    
                    <div className="action-card promo-menu hover-scale" id="card-ver-cardapio" onClick={openMenu}>
                        <div className="ac-overlay"></div>
                        <div className="ac-content">
                            <h3><i className="fa-solid fa-book-open"></i> Ver Cardápio</h3>
                            <p>Descubra nossas especialidades, desde os clássicos italianos até criações autorais apaixonantes e bebidas geladas.</p>
                            <button className="btn btn-secondary mt-2">Explorar Receitas <i className="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
