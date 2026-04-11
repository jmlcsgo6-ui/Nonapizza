import React from 'react';

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="section reveal-on-scroll">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">Como Funciona</h2>
                    <p className="section-subtitle">O caminho da perfeição até você em 3 passos simples.</p>
                </div>
                <div className="steps-grid reveal-on-scroll reveal-scale">
                    <div className="step-card hover-scale">
                        <div className="step-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                        <h3>Escolha sua Pizza</h3>
                        <p>Explore nosso cardápio artesanal ou monte a sua própria obra prima.</p>
                    </div>
                    <div className="step-card hover-scale">
                        <div className="step-icon"><i className="fa-solid fa-fire-burner"></i></div>
                        <h3>Forno a Lenha</h3>
                        <p>Assada perfeitamente na temperatura ideal para aquela crosta impossível de resistir.</p>
                    </div>
                    <div className="step-card hover-scale">
                        <div className="step-icon"><i className="fa-solid fa-motorcycle"></i></div>
                        <h3>Entrega Premium</h3>
                        <p>Direto do forno para sua porta, chegando sempre quente graças à nossa embalagem térmica.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
