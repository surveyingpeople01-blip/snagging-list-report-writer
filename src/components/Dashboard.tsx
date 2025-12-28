import { FileText, Trash2, Clock, User, Grid, List as ListIcon, ChevronDown, Search, LogOut, Home, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import logoImg from '/logo.jpg';

export type ReportStatus = 'working' | 'complete' | 'archived';

export interface SavedReport {
    id: string;
    propertyAddress: string;
    developerName: string;
    clientName: string;
    plotNumber: string;
    inspectionDate: string;
    lastModified: number;
    status: ReportStatus;
    totalSnags: number;
    openSnags: number;
}

interface DashboardProps {
    reports: SavedReport[];
    onNewReport: () => void;
    onOpenReport: (id: string) => void;
    onDeleteReport: (id: string) => void;
    onStatusChange: (id: string, status: ReportStatus) => void;
    onLogout?: () => void;
}

export function Dashboard({ reports, onNewReport, onOpenReport, onDeleteReport, onStatusChange, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('snagging-view-mode') as 'grid' | 'list') || 'grid';
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'address' | 'client'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('snagging-view-mode', mode);
    };

    const filteredReports = reports.filter(r => {
        const status = r.status || 'working';
        const matchesStatus = activeTab === 'all' || status === activeTab;
        const matchesSearch =
            r.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.developerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortBy) {
            case 'date':
                valA = a.lastModified;
                valB = b.lastModified;
                break;
            case 'address':
                valA = (a.propertyAddress || '').toLowerCase();
                valB = (b.propertyAddress || '').toLowerCase();
                break;
            case 'client':
                valA = (a.clientName || '').toLowerCase();
                valB = (b.clientName || '').toLowerCase();
                break;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-[#002d62] py-10 px-12 mb-12 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="bg-white p-4 rounded-lg">
                            <img src={logoImg} alt="Logo" className="h-16 object-contain" />
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="text-left">
                            <h1 className="text-white text-4xl md:text-5xl font-semibold leading-tight">
                                Snagging List Report Writer
                            </h1>
                            <p className="text-[#d4b88a] text-base md:text-lg mt-1">
                                Professional New Build Defects System - London, UK
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="bg-[#d4b88a] text-[#1a1a1a] px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#c4a87a] transition-all shadow-md hover:shadow-lg"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-0 pb-8 px-8 max-w-6xl mx-auto w-full">
                {/* Title and New Report Button */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[32px] font-bold text-[#002855]">Snagging Reports</h2>
                    <button
                        onClick={onNewReport}
                        className="bg-[#003d82] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#002d62] transition-all shadow-md hover:shadow-lg"
                    >
                        + New Report
                    </button>
                </div>

                {/* Tabs, Search, and Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 w-full md:w-auto overflow-x-auto">
                        {(['all', 'working', 'complete', 'archived'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all capitalize whitespace-nowrap ${activeTab === tab
                                    ? 'bg-survey-blue text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 w-full md:w-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by address, client, or developer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-survey-blue focus:border-transparent outline-none shadow-sm text-sm"
                        />
                    </div>

                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'address' | 'client')}
                            className="bg-transparent text-sm font-bold text-gray-600 px-3 outline-none cursor-pointer border-r border-gray-100"
                        >
                            <option value="date">Date</option>
                            <option value="address">Address</option>
                            <option value="client">Client</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-2 text-gray-500 hover:text-survey-blue transition-colors flex items-center gap-1"
                            title={sortOrder === 'asc' ? "Sort Ascending" : "Sort Descending"}
                        >
                            <div className={`transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                                <ChevronDown size={18} />
                            </div>
                        </button>
                    </div>

                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                        <button
                            onClick={() => handleViewModeChange('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-survey-blue' : 'text-gray-400'}`}
                            title="Grid View"
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => handleViewModeChange('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 text-survey-blue' : 'text-gray-400'}`}
                            title="List View"
                        >
                            <ListIcon size={20} />
                        </button>
                    </div>
                </div>

                {filteredReports.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="bg-blue-50 p-6 rounded-full text-survey-blue">
                            <FileText size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">No reports found</h2>
                        <p className="text-gray-500 max-w-xs mx-auto text-lg text-center">
                            {activeTab === 'all'
                                ? "Start by creating your first snagging report for a new build property."
                                : `You don't have any reports marked as ${activeTab}.`}
                        </p>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredReports.map(report => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onOpen={onOpenReport}
                                    onDelete={onDeleteReport}
                                    onStatusChange={onStatusChange}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Property Address</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Client</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Developer</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Snags</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredReports.map(report => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{report.propertyAddress || 'No Address'}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(report.lastModified).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {report.clientName || 'No Client'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {report.developerName || 'No Developer'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">{report.totalSnags}</span>
                                                    {report.openSnags > 0 && (
                                                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                                                            {report.openSnags} open
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusSelector
                                                    status={report.status || 'working'}
                                                    onChange={(s) => onStatusChange(report.id, s)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => onOpenReport(report.id)}
                                                        className="px-3 py-1.5 bg-survey-blue text-white rounded-md text-xs font-bold hover:bg-blue-800 transition-all"
                                                    >
                                                        OPEN
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteReport(report.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </main>

            <footer className="p-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Surveying People. All rights reserved.
            </footer>
        </div>
    );
}

function StatusSelector({ status, onChange }: { status: ReportStatus; onChange: (s: ReportStatus) => void }) {
    return (
        <div className="relative group/sel">
            <select
                value={status || 'working'}
                onChange={(e) => onChange(e.target.value as ReportStatus)}
                className={`appearance-none pl-2 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none transition-all ${status === 'complete' ? 'bg-green-100 text-green-700 border-green-200' :
                    status === 'archived' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                    }`}
            >
                <option value="working">WORKING</option>
                <option value="complete">COMPLETE</option>
                <option value="archived">ARCHIVED</option>
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
    );
}

function ReportCard({ report, onOpen, onDelete, onStatusChange }: {
    report: SavedReport;
    onOpen: (id: string) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: ReportStatus) => void;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col relative">
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <StatusSelector
                        status={report.status || 'working'}
                        onChange={(s) => onStatusChange(report.id, s)}
                    />
                    {report.openSnags > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <AlertTriangle size={12} />
                            {report.openSnags} open
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {report.propertyAddress || 'Unnamed Property'}
                </h3>

                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <User size={14} /> {report.clientName || 'No Client Name'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Home size={14} /> {report.developerName || 'No Developer'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} /> {new Date(report.lastModified).toLocaleDateString()}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total Snags:</span>
                        <span className="font-bold text-gray-900">{report.totalSnags}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onOpen(report.id)}
                className="w-full bg-gray-50 border-t border-gray-100 p-4 font-bold text-survey-blue hover:bg-survey-blue hover:text-white transition-all uppercase tracking-wider text-xs"
            >
                Open Report
            </button>
            <button
                onClick={() => onDelete(report.id)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
