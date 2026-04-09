import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_name');
        window.location.reload();
    };

    return (
        <header className="header" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
                <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <a href="/" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'var(--primary, #e07b39)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-pizza-slice" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                        </div>
                        NONA<span style={{ color: 'var(--primary, #e07b39)' }}>PIZZA</span>
                    </a>
                </div>
                
                <nav className="nav">
                    <ul style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
                        <li className="desktop-only"><a href="#home" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Início</a></li>
                        <li className="desktop-only"><a href="#explore" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Cardápio</a></li>
                        <li><a href="/meu-pedido" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>MEUS PEDIDOS</a></li>
                        
                        {customerToken ? (
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Olá</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{customerName.split(' ')[0]}</span>
                                </div>
                                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '0.8rem' }}></i>
                                </button>
                            </li>
                        ) : (
                            <li>
                                <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', borderRadius: '30px', fontWeight: 800 }}>ENTRAR</button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
