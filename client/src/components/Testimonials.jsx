import React from 'react';

export default function Testimonials() {
    return (
        <section id="testimonials" className="section bg-alt">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">O que dizem nossos clientes</h2>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i
                                className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i
                                className="fa-solid fa-star"></i></div>
                        <p>"A melhor pizza que já pedi por delivery. A massa é incrivelmente leve e chegou super
                            quente!"</p>
                        <h4>— Rafael Costa</h4>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i
                                className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i
                                className="fa-solid fa-star"></i></div>
                        <p>"A qualidade dos ingredientes é nítida. O presunto de parma e a burrata são fantásticos.
                            Virei cliente fiel na hora."</p>
                        <h4>— Mariana Souza</h4>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i
                                className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i
                                className="fa-solid fa-star"></i></div>
                        <p>"Achei a embalagem fantástica, mantém a pizza quentinha de verdade. E sabor digno da Itália."
                        </p>
                        <h4>— Lucas M.</h4>
                    </div>
                </div>
            </div>
        </section>
    );
}
