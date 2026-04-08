import React from 'react';

export default function WhyUs() {
    return (
        <section id="why-us" className="section reveal-on-scroll">
            <div className="container">
                <div className="why-grid">
                    <div className="why-content">
                        <h2 className="section-title">Por que a NONA?</h2>
                        <p className="section-subtitle">Não é apenas pizza, é uma experiência gastronômica superior na sua casa.</p>

                        <div className="benefit-block hover-scale">
                            <div className="benefit-icon"><i className="fa-solid fa-star"></i></div>
                            <div className="benefit-text">
                                <h4>Qualidade Absoluta</h4>
                                <p>Farinha 00 importada e fermentação natural de 48 horas para uma massa leve e de fácil digestão.</p>
                            </div>
                        </div>
                        <div className="benefit-block hover-scale">
                            <div className="benefit-icon"><i className="fa-solid fa-clock"></i></div>
                            <div className="benefit-text">
                                <h4>Preparo Cronometrado</h4>
                                <p>Tudo calculado para que sua pizza saia do forno diretamente para as mãos do entregador.</p>
                            </div>
                        </div>
                        <div className="benefit-block hover-scale">
                            <div className="benefit-icon"><i className="fa-solid fa-box-open"></i></div>
                            <div className="benefit-text">
                                <h4>Embalagem Térmica Premium</h4>
                                <p>Nossa caixa exclusiva mantém a temperatura e a crocância de pizzaria moderna.</p>
                            </div>
                        </div>
                    </div>
                    <div className="why-visual">
                        <div className="smoke-container">
                            <div className="smoke"></div>
                            <div className="smoke"></div>
                            <div className="smoke"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
