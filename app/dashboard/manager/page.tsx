'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Clock, ShieldAlert, ArrowUpRight, ArrowDownRight, Users2, Timer } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const waitTimeData = [
    { time: '08:00', wait: 12 },
    { time: '09:00', wait: 25 },
    { time: '10:00', wait: 45 },
    { time: '11:00', wait: 60 },
    { time: '12:00', wait: 55 },
    { time: '13:00', wait: 20 },
    { time: '14:00', wait: 35 },
];

const loadData = [
    { name: 'Registration', value: 45, fill: 'var(--chart-1)' },
    { name: 'Refraction', value: 30, fill: 'var(--chart-2)' },
    { name: 'Dilation', value: 65, fill: 'var(--chart-3)' },
    { name: 'Doctor Queue', value: 20, fill: 'var(--chart-4)' },
    { name: 'Pharmacy', value: 15, fill: 'var(--chart-5)' },
];

export default function ManagerDashboard() {
    const { patients } = useStore();

    const totalIn = patients.length;
    const waiting = patients.filter(p => p.status === 'WAITING').length;
    const inProgress = patients.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = patients.filter(p => p.status === 'COMPLETED').length;

    return (
        <ProtectedRoute allowedRoles={['MANAGER']}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Control Tower</h2>
                        <p className="text-slate-500 mt-1">Hospital overview and flow optimization.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1 text-xs">
                            System Normal
                        </Badge>
                        <span className="text-xs text-slate-500 font-mono">14:02:45 UTC</span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Total Inside"
                        value={452 + totalIn}
                        icon={Users2}
                        trend="+12% from avg"
                        up={true}
                    />
                    <MetricCard
                        title="Avg Wait Time"
                        value="42 min"
                        icon={Clock}
                        trend="-5% from avg"
                        up={false}
                        alert
                    />
                    <MetricCard
                        title="Currently Waiting"
                        value={180 + waiting}
                        icon={Timer}
                        trend="Critical load approaching"
                        up={true}
                        alert
                    />
                    <MetricCard
                        title="Completed Today"
                        value={completed + 28}
                        icon={Activity}
                        trend="On track"
                        up={true}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
                    <Card className="col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-teal-900 font-semibold">Hourly Patient Inflow & Wait</CardTitle>
                            <CardDescription>Predicted vs Actual Wait Times across all zones.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={waitTimeData}>
                                    <defs>
                                        <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#64748b" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis stroke="#64748b" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="wait" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorWait)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 bg-white border border-slate-200 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-teal-900 font-semibold">Department Load Heatmap</CardTitle>
                            <CardDescription>Live distribution of patients.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={loadData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {loadData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-panel border-amber-200 bg-gradient-to-br from-white to-amber-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-amber-700 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5" />
                                    Delta-T Gap Monitor
                                </CardTitle>
                                <CardDescription className="text-amber-900/70">Wait Time Heatmap: Refraction to Doctor</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                <div className="relative pt-4">
                                    <div className="h-4 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full w-full"></div>
                                    <div className="absolute top-2 left-[75%] -translate-x-1/2 flex flex-col items-center">
                                        <div className="w-1 h-8 bg-slate-900 rounded-full"></div>
                                        <span className="text-xs font-bold mt-1 text-slate-800">45m</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                                        <span>Optimal (15m)</span>
                                        <span>Critical (60m)</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    Gap divergence detected. Refraction saves are outpacing Consultation starts by 3:1.
                                </p>
                                <button className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold py-2.5 rounded-xl transition-colors border border-amber-200">
                                    View Prediction
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl col-span-2">
                        <CardHeader>
                            <CardTitle className="text-teal-900 font-semibold">Time-Value Efficiency</CardTitle>
                            <CardDescription>Waste segments dynamically identified.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Post-Dilation Idle', 'Registration Queuing', 'Doctor Handshaking'].map((issue, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {idx === 0 ? <Timer className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-800">{issue}</p>
                                                <p className="text-xs text-slate-500">Est. time wasted: {12 - idx * 3} mins/patient</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={idx === 0 ? "border-red-200 text-red-600 bg-red-50" : "bg-slate-50 text-slate-600 border-slate-200"}>
                                            {idx === 0 ? "Critical" : "Monitor"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function MetricCard({ title, value, icon: Icon, trend, up, alert }: { title: string; value: string | number; icon: any; trend: string; up: boolean; alert?: boolean }) {
    return (
        <Card className={`relative overflow-hidden rounded-xl shadow-sm ${alert ? 'bg-red-50 border border-red-100' : 'bg-white border border-slate-200'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                <Icon className={`w-4 h-4 ${alert ? 'text-red-500' : 'text-emerald-500'}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-teal-600'}`}>{value}</div>
                <p className="text-xs flex items-center mt-1 text-slate-500">
                    {up ? <ArrowUpRight className="w-3 h-3 text-red-500 mr-1" /> : <ArrowDownRight className="w-3 h-3 text-emerald-500 mr-1" />}
                    {trend}
                </p>
            </CardContent>
            {alert && <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>}
        </Card>
    );
}
