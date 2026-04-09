import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { TrendingUp, Bell, Flame, CheckCircle2, Server, Database, Activity, DollarSign } from 'lucide-react';

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
            className="flex-1 min-w-[240px] bg-card border border-white/5 rounded-[2.5rem] p-8 space-y-4 hover:border-white/10 transition-all shadow-2xl relative overflow-hidden group"
        >
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-500 w-fit group-hover:scale-110 transition-transform`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{title}</p>
                <p className="text-3xl font-black italic tracking-tighter text-white mt-1">{value}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </motion.div>
    );

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Hub de <span className="text-primary italic">Comando</span></h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Métricas e integridade do sistema</p>
            </div>

            <div className="flex flex-wrap gap-8">
                <MetricCard title="Receita Bruta" value={`R$ ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="bg-green-500" delay={0} />
                <MetricCard title="Ordens Pendentes" value={pendingCount} icon={Bell} color="bg-red-500" delay={0.1} />
                <MetricCard title="Fornos Ativos" value={cookingCount} icon={Flame} color="bg-primary" delay={0.2} />
                <MetricCard title="Ciclos Finalizados" value={completedCount} icon={CheckCircle2} color="bg-blue-500" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card border border-white/5 rounded-[3rem] p-10 space-y-6 relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="text-primary" size={20} />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Status da Alquimia</h4>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                        Sua infraestrutura está operando em alta performance. O cluster <strong>Neon Postgres</strong> está respondendo abaixo de 50ms e o motor <strong>Node/Express</strong> está escalado para lidar com o fluxo de pedidos premium.
                    </p>
                    <div className="h-[2px] w-full bg-white/5"></div>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                            <Server size={12} /> API UP
                        </span>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                            <Database size={12} /> DB CONNECTED
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary/5 border border-primary/10 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
                        <TrendingUp size={32} />
                    </div>
                    <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">Crescimento Exponencial</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-black">Meta Mensal: 85% Concluída</p>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-4">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-primary shadow-[0_0_15px_rgba(255,95,0,0.5)]"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
