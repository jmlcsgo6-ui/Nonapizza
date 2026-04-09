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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            className="flex-1 min-w-[280px] bg-[#0c0c0c] border border-white/5 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group hover:bg-white/[0.02] transition-all border border-white/[0.03]"
        >
            <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-3xl rounded-full ${color.replace('text-', 'bg-')}`}></div>
            
            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                </div>
                <p className="text-xs font-bold text-white/30 mb-2 uppercase tracking-[0.2em]">{title}</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter">{value}</h3>
                
                <div className="mt-8 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full text-[10px] font-black text-green-500 uppercase tracking-tighter">
                        <TrendingUp size={10} /> +12%
                    </div>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">vs mês anterior</span>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-wrap gap-8">
                <MetricCard title="Receita Total" value={`R$ ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="text-green-500" delay={0} />
                <MetricCard title="Pedidos Pendentes" value={pendingCount} icon={Bell} color="text-red-500" delay={0.1} />
                <MetricCard title="Em Preparo" value={cookingCount} icon={Flame} color="text-primary" delay={0.2} />
                <MetricCard title="Finalizados" value={completedCount} icon={CheckCircle2} color="text-blue-500" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-[#0c0c0c] border border-white/5 p-10 rounded-[40px] relative overflow-hidden border border-white/[0.03]"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h4 className="text-xl font-bold text-white tracking-tight uppercase italic">Atividade do <span className="text-primary">Sistema</span></h4>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Status da infraestrutura Alquimia</p>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-green-500/5 border border-green-500/10 rounded-2xl text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                            Operacional
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        <p className="text-base text-white/50 leading-relaxed max-w-2xl font-medium">
                            O banco de dados <span className="text-white font-bold">PostgreSQL</span> está processando requisições com latência média de 12ms. 
                            O motor de processamento está otimizado para a demanda atual.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { lab: 'API', val: '99.9%', icon: Activity },
                                { lab: 'Banco', val: 'Sync', icon: Users },
                                { lab: 'Cache', val: 'Hit', icon: ShoppingBag },
                                { lab: 'Upload', val: 'OK', icon: CheckCircle2 }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl text-center hover:bg-white/[0.03] transition-colors">
                                    <item.icon size={20} className="mx-auto mb-3 text-white/10" />
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{item.lab}</p>
                                    <p className="text-lg font-black text-white mt-1">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-primary to-orange-600 p-10 rounded-[40px] flex flex-col justify-between text-white relative overflow-hidden shadow-2xl shadow-primary/20"
                >
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/10 blur-[80px] rounded-full"></div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black italic tracking-tight uppercase mb-1">Meta Mensal</h4>
                        <div className="w-fit px-3 py-1 bg-black/20 rounded-lg text-[10px] font-bold uppercase tracking-widest mt-2">85% Atingido</div>
                    </div>
                    
                    <div className="relative z-10 my-10">
                        <div className="text-7xl font-black tracking-tighter italic">85<span className="text-3xl font-bold opacity-50">%</span></div>
                        <div className="w-full h-3 bg-black/20 rounded-full mt-6 overflow-hidden p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                                className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                            />
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Status: Sync</p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">2min atrás</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

