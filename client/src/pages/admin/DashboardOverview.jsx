import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { TrendingUp, Bell, Flame, CheckCircle2, DollarSign, Users, ShoppingBag, Activity } from 'lucide-react';

export default function DashboardOverview({ token }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch(e) { console.error('Error fetching admin stats', e); }
        };
        fetchOrders();
    }, [token]);

    const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((acc, o) => acc + o.total, 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const cookingCount = orders.filter(o => o.status === 'COOKING').length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

    const MetricCard = ({ title, value, icon: Icon, color, delay }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex-1 min-w-[240px] bg-[#0c0c0c] border border-white/5 p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all"
        >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${color}`}>
                <Icon size={80} />
            </div>
            
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 ${color}`}>
                    <Icon size={24} />
                </div>
                <p className="text-sm font-medium text-white/40 mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white italic tracking-tight">{value}</h3>
                
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-green-500">
                    <TrendingUp size={12} />
                    <span>+12% vs mês anterior</span>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tight">Visão <span className="text-primary italic">Geral</span></h2>
                <p className="text-white/40 mt-1 font-medium">Desempenho da Alquimia em tempo real</p>
            </div>

            <div className="flex flex-wrap gap-6">
                <MetricCard title="Receita Total" value={`R$ ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="text-green-500" delay={0} />
                <MetricCard title="Pedidos Pendentes" value={pendingCount} icon={Bell} color="text-red-500" delay={0.1} />
                <MetricCard title="Em Preparo" value={cookingCount} icon={Flame} color="text-primary" delay={0.2} />
                <MetricCard title="Finalizados" value={completedCount} icon={CheckCircle2} color="text-blue-500" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-[#0c0c0c] border border-white/5 p-8 rounded-3xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-bold text-white tracking-tight">Atividade do Sistema</h4>
                            <p className="text-sm text-white/40 font-medium">Status da infraestrutura Alquimia</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Operacional
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <p className="text-sm text-white/60 leading-relaxed">
                            O banco de dados <strong>PostgreSQL</strong> está processando requisições com latência média de 12ms. 
                            O motor de processamento está otimizado para a demanda atual.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { lab: 'API', val: '99.9%', icon: Activity },
                                { lab: 'Banco', val: 'Sync', icon: Users },
                                { lab: 'Cache', val: 'Hit', icon: ShoppingBag },
                                { lab: 'Upload', val: 'OK', icon: CheckCircle2 }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                                    <item.icon size={16} className="mx-auto mb-2 text-white/20" />
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.lab}</p>
                                    <p className="text-sm font-bold text-white mt-1">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary p-8 rounded-3xl flex flex-col justify-between text-white relative overflow-hidden"
                >
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/10 blur-[60px] rounded-full"></div>
                    <div className="relative z-10">
                        <h4 className="text-xl font-black italic tracking-tight uppercase mb-1">Meta Mensal</h4>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">85% Atingido</p>
                    </div>
                    
                    <div className="relative z-10 my-8">
                        <div className="text-6xl font-black tracking-tighter">85%</div>
                        <div className="w-full h-2 bg-black/20 rounded-full mt-4 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 1, delay: 1 }}
                                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                    
                    <p className="relative z-10 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Sincronizado há 2min</p>
                </motion.div>
            </div>
        </div>
    );
}

