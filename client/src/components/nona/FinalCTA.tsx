import React from 'react';

export default function FinalCTA() {
    return (
        <section className="section final-cta reveal-on-scroll reveal-scale">
            <div className="container text-center">
                <h2 className="section-title">Peça agora e sinta o sabor de verdade.</h2>
                <p className="section-subtitle">Massa de longa fermentação e ingredientes nobres.</p>
                <div className="mt-4">
                    <button 
                        className="btn btn-primary btn-large"
                        style={{ display: 'inline-block' }}
                        onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Pedir Agora
                    </button>
                </div>
            </div>
        </section>
    );
}
