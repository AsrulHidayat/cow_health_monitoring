import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Area,
    AreaChart,
    Dot,
    ReferenceLine
} from 'recharts';
import { Heart, AlertTriangle, Activity, Info } from 'lucide-react';

const HealthTrendChart = ({ data, timeFilter }) => {
    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum, entry) => sum + entry.value, 0);
            
            return (
                <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
                    <p className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                        {timeFilter === 'hari' && `Pukul ${label}`}
                        {timeFilter === 'minggu' && `Hari ${label}`}
                        {timeFilter === 'bulan' && `Tanggal ${label}`}
                        {timeFilter === 'tahun' && `Bulan ${label}`}
                    </p>
                    <div className="space-y-1">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs font-medium text-gray-700">
                                        {entry.name}:
                                    </span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: entry.color }}>
                                    {entry.value} sapi
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Total:</span>
                            <span className="text-xs font-bold text-gray-800">{total} sapi</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom Legend Component
    const CustomLegend = () => {
        const legendItems = [
            { value: 'sehat', label: 'Sehat', color: '#10b981', icon: '✅', description: 'Kondisi Normal' },
            { value: 'perhatian', label: 'Perhatian', color: '#eab308', icon: '⚠️', description: 'Perlu Monitoring' },
            { value: 'peringatan', label: 'Peringatan', color: '#f97316', icon: '⚡', description: 'Butuh Tindakan' },
            { value: 'kritis', label: 'Kritis', color: '#ef4444', icon: '🚨', description: 'Darurat' }
        ];

        return (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {legendItems.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <span className="text-lg">{item.icon}</span>
                        <div 
                            className="w-3 h-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: item.color }}
                        />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800">{item.label}</span>
                            <span className="text-[10px] text-gray-500">{item.description}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Custom Dot untuk menandai data point penting
    const CustomDot = (props) => {
        const { cx, cy, value, fill } = props;
        
        // Highlight jika nilai tinggi
        if (value > 5) {
            return (
                <g>
                    <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill={fill}
                        fillOpacity={0.3}
                        className="animate-pulse"
                    />
                    <circle 
                        cx={cx} 
                        cy={cy} 
                        r={4} 
                        fill={fill}
                        stroke="#fff"
                        strokeWidth={2}
                    />
                </g>
            );
        }
        
        return (
            <circle 
                cx={cx} 
                cy={cy} 
                r={3} 
                fill={fill}
                stroke="#fff"
                strokeWidth={1.5}
            />
        );
    };

    // Calculate max value for Y-axis
    const maxValue = Math.max(
        ...data.map(d => Math.max(
            d.sehat || 0,
            d.perhatian || 0,
            d.peringatan || 0,
            d.kritis || 0
        ))
    );

    // Custom label for X-axis
    const CustomXAxisTick = ({ x, y, payload }) => {
        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize={11}
                    fontWeight={500}
                >
                    {payload.value}
                </text>
            </g>
        );
    };

    // Custom label for Y-axis
    const CustomYAxisTick = ({ x, y, payload }) => {
        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dx={-10}
                    dy={4}
                    textAnchor="end"
                    fill="#6b7280"
                    fontSize={11}
                    fontWeight={500}
                >
                    {payload.value}
                </text>
            </g>
        );
    };

    return (
        <div className="w-full">
            {/* Info Header */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                    <span className="font-semibold">Tips:</span> Grafik menampilkan tren kondisi kesehatan sapi dalam periode 
                    {timeFilter === 'hari' && ' 24 jam terakhir'}
                    {timeFilter === 'minggu' && ' 7 hari terakhir'}
                    {timeFilter === 'bulan' && ' 30 hari terakhir'}
                    {timeFilter === 'tahun' && ' 12 bulan terakhir'}. 
                    Hover untuk detail.
                </p>
            </div>

            {/* Chart Container with Background */}
            <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner">
                {/* Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b7280' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                
                {/* Main Chart */}
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 10,
                        }}
                    >
                        <defs>
                            {/* Gradient untuk Sehat */}
                            <linearGradient id="colorSehat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                            </linearGradient>
                            {/* Gradient untuk Perhatian */}
                            <linearGradient id="colorPerhatian" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0.05}/>
                            </linearGradient>
                            {/* Gradient untuk Peringatan */}
                            <linearGradient id="colorPeringatan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                            </linearGradient>
                            {/* Gradient untuk Kritis */}
                            <linearGradient id="colorKritis" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#e5e7eb"
                            strokeOpacity={0.5}
                            vertical={false}
                        />
                        
                        <XAxis 
                            dataKey="time" 
                            tick={<CustomXAxisTick />}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                        />
                        
                        <YAxis 
                            tick={<CustomYAxisTick />}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            domain={[0, maxValue + 2]}
                        />
                        
                        <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ 
                                stroke: '#6b7280', 
                                strokeWidth: 1, 
                                strokeDasharray: '5 5',
                                fill: 'rgba(156, 163, 175, 0.1)'
                            }}
                        />

                        {/* Area Charts dengan gradient */}
                        <Area
                            type="monotone"
                            dataKey="sehat"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#colorSehat)"
                            dot={<CustomDot />}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="Sehat"
                            animationDuration={1000}
                            animationBegin={0}
                        />
                        
                        <Area
                            type="monotone"
                            dataKey="perhatian"
                            stroke="#eab308"
                            strokeWidth={2.5}
                            fill="url(#colorPerhatian)"
                            dot={<CustomDot />}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="Perhatian"
                            animationDuration={1000}
                            animationBegin={200}
                        />
                        
                        <Area
                            type="monotone"
                            dataKey="peringatan"
                            stroke="#f97316"
                            strokeWidth={2.5}
                            fill="url(#colorPeringatan)"
                            dot={<CustomDot />}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="Peringatan"
                            animationDuration={1000}
                            animationBegin={400}
                        />
                        
                        <Area
                            type="monotone"
                            dataKey="kritis"
                            stroke="#ef4444"
                            strokeWidth={2.5}
                            fill="url(#colorKritis)"
                            dot={<CustomDot />}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="Kritis"
                            animationDuration={1000}
                            animationBegin={600}
                        />

                        {/* Reference Line untuk batas normal */}
                        <ReferenceLine 
                            y={5} 
                            stroke="#6b7280" 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.5}
                            label={{ 
                                value: "Batas Normal", 
                                position: "topLeft",
                                style: { fill: '#6b7280', fontSize: 10 }
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Custom Legend */}
                <CustomLegend />
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-green-600 font-medium">Rata-rata Sehat</p>
                            <p className="text-lg font-bold text-green-700">
                                {(data.reduce((acc, d) => acc + (d.sehat || 0), 0) / data.length).toFixed(1)}
                            </p>
                        </div>
                        <Heart className="w-5 h-5 text-green-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-yellow-600 font-medium">Rata-rata Perhatian</p>
                            <p className="text-lg font-bold text-yellow-700">
                                {(data.reduce((acc, d) => acc + (d.perhatian || 0), 0) / data.length).toFixed(1)}
                            </p>
                        </div>
                        <Activity className="w-5 h-5 text-yellow-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-orange-600 font-medium">Rata-rata Peringatan</p>
                            <p className="text-lg font-bold text-orange-700">
                                {(data.reduce((acc, d) => acc + (d.peringatan || 0), 0) / data.length).toFixed(1)}
                            </p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-red-600 font-medium">Rata-rata Kritis</p>
                            <p className="text-lg font-bold text-red-700">
                                {(data.reduce((acc, d) => acc + (d.kritis || 0), 0) / data.length).toFixed(1)}
                            </p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthTrendChart;