import React from 'react';

export default function Header() {
    return (
        <header className="header">
            <div className="container nav-container">
                <div className="logo">
                    <a href="#">NONA<span>.</span></a>
                </div>
                <nav className="nav">
                    <ul>
                        <li><a href="#home">Início</a></li>
                        <li><a href="#explore">Fazer Pedido</a></li>
                        <li><a href="#why-us">Sobre a Nona</a></li>
                        <li><a href="#contact">Contato</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
