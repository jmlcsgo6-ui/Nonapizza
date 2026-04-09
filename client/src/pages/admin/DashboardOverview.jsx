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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex-1 min-w-[240px] bg-black border border-white/10 p-8 space-y-4 hover:border-primary/50 transition-all shadow-xl relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-primary"></div>
            <div className={`p-3 border border-white/10 ${color.replace('bg-', 'text-')} w-fit group-hover:scale-110 transition-transform`}>
                <Icon size={20} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">{title}</p>
                <p className="text-3xl font-black tracking-tighter text-white mt-1 uppercase italic">{value}</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Live update active</span>
                <TrendingUp size={10} className="text-primary" />
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-12 font-mono">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-1 h-6 bg-primary"></div>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white italic">MONITOR_REALTIME</h3>
                </div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] ml-6">MÉTRICAS DE INTEGRIDADE DO SISTEMA v2.0</p>
            </div>

            <div className="flex flex-wrap gap-6">
                <MetricCard title="RECEITA_BRUTA" value={`R$ ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="text-green-500" delay={0} />
                <MetricCard title="ORDENS_WAITING" value={pendingCount} icon={Bell} color="text-red-500" delay={0.1} />
                <MetricCard title="FORNOS_CALIB" value={cookingCount} icon={Flame} color="text-primary" delay={0.2} />
                <MetricCard title="CICLOS_DONE" value={completedCount} icon={CheckCircle2} color="text-blue-500" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-black border border-white/10 p-10 space-y-6 relative"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 italic text-[10px] font-bold">ALQUIMIA_ENGINE</div>
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="text-primary" size={16} />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">STATUS_DA_INFRAESTRUTURA</h4>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed font-medium uppercase tracking-wider">
                        O cluster <strong className="text-white">NEON_POSTGRES</strong> está operando em <span className="text-green-500">OPTIMAL_MODE</span>. 
                        O motor <strong className="text-white">NODE_EXPRESS</strong> está modulando cargas dinâmicas para pedidos de alta prioridade. Latência média: 24ms.
                    </p>
                    <div className="h-0.5 w-full bg-white/5"></div>
                    <div className="flex gap-6">
                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2 border border-green-500/20 px-3 py-1 bg-green-500/5">
                            <Server size={10} /> API_UP
                        </span>
                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2 border border-green-500/20 px-3 py-1 bg-green-500/5">
                            <Database size={10} /> DB_SYNC
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-black border border-white/10 p-10 flex flex-col justify-center space-y-6 relative"
                >
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h4 className="text-lg font-black italic tracking-tighter text-white uppercase italic">KPI_TARGET_MET</h4>
                            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">META MENSAL DE PERFORMANCE</p>
                        </div>
                        <div className="text-primary font-black italic text-4xl tracking-tighter">85%</div>
                    </div>
                    <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-primary shadow-[0_0_15px_rgba(255,95,0,0.5)]"
                        />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        <span>LOWER_BOUND_v1.0</span>
                        <span>TARGET_ACQUIRED</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
