import { useState, useRef } from 'react';
import { ChevronLeft, Save, FileText, Plus, Trash2, ChevronDown, ChevronRight, Camera, AlertCircle, CheckCircle, Clock, Image, X } from 'lucide-react';
import logoImg from '/logo.jpg';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Types
export type SnagPriority = 'critical' | 'high' | 'medium' | 'low';
export type SnagStatus = 'open' | 'in-progress' | 'resolved';
export type ReportStatus = 'working' | 'complete' | 'archived';

export interface Photo {
    id: string;
    url: string;
    name?: string;
}

export interface SnagItem {
    id: string;
    location: string;
    description: string;
    priority: SnagPriority;
    status: SnagStatus;
    photos: Photo[];
    createdAt: number;
}

export interface Room {
    id: string;
    name: string;
    snags: SnagItem[];
}

export interface SnaggingReport {
    id: string;
    propertyAddress: string;
    developerName: string;
    clientName: string;
    plotNumber: string;
    inspectionDate: string;
    status: ReportStatus;
    rooms: Room[];
    coverPhoto: Photo | null;
    createdAt: number;
    lastModified: number;
}

// Default rooms
const DEFAULT_ROOMS: Omit<Room, 'id'>[] = [
    { name: 'Front Elevation', snags: [] },
    { name: 'Rear Elevation', snags: [] },
    { name: 'Driveway/Parking', snags: [] },
    { name: 'Garden/Landscaping', snags: [] },
    { name: 'Hallway/Entrance', snags: [] },
    { name: 'Living Room', snags: [] },
    { name: 'Kitchen', snags: [] },
    { name: 'Dining Room', snags: [] },
    { name: 'Utility Room', snags: [] },
    { name: 'WC/Cloakroom', snags: [] },
    { name: 'Landing', snags: [] },
    { name: 'Master Bedroom', snags: [] },
    { name: 'En-Suite', snags: [] },
    { name: 'Bedroom 2', snags: [] },
    { name: 'Bedroom 3', snags: [] },
    { name: 'Bedroom 4', snags: [] },
    { name: 'Family Bathroom', snags: [] },
    { name: 'Garage', snags: [] },
    { name: 'Loft Space', snags: [] },
    { name: 'General/Miscellaneous', snags: [] },
];

// Snag templates
const SNAG_TEMPLATES: Record<string, string[]> = {
    'Paint & Decoration': [
        "Paint finish requires touch-up - visible brush marks/roller marks",
        "Emulsion not rubbed down or finished properly",
        "Paint splashes on floor/surfaces to be cleaned",
        "Sealant around frame needs finishing",
        "Filler visible through paint - requires sanding and repainting",
    ],
    'Doors': [
        "Door not closing properly - requires adjustment",
        "Door furniture loose/scratched - requires tightening/replacement",
        "Fire door not self-closing correctly",
        "Door sticking on frame - requires easing",
        "Door handle mechanism not operating smoothly",
    ],
    'Windows': [
        "Window mechanism stiff - requires adjustment/lubrication",
        "Scratches on glass to be replaced",
        "Window seal incomplete/requires attention",
        "Window not locking properly",
        "Condensation between panes - sealed unit failure",
    ],
    'Flooring': [
        "Flooring not level - noticeable dip/rise",
        "Scratches/damage to floor finish",
        "Skirting board gap to floor - requires filler",
        "Floor tile loose/cracked",
        "Carpet fitting poor - requires re-stretching",
    ],
    'Plumbing': [
        "Tap dripping - requires washer replacement",
        "Waste pipe leaking under sink",
        "Toilet not flushing correctly",
        "Radiator not heating properly - requires bleeding",
        "Low water pressure at outlet",
    ],
    'Electrical': [
        "Light fitting not working",
        "Socket plate loose/damaged",
        "Switch not operating correctly",
        "Extractor fan noisy/not working",
        "Doorbell not functioning",
    ],
    'Kitchen': [
        "Kitchen unit door misaligned",
        "Drawer runner not operating smoothly",
        "Worktop joint visible/poor finish",
        "Appliance not functioning correctly",
        "Splashback tile cracked/missing grout",
    ],
    'Bathroom': [
        "Silicone sealant around bath/shower incomplete",
        "Tile grouting missing/incomplete",
        "Shower screen not sealing properly",
        "Extractor fan not working",
        "Toilet seat loose",
    ],
};

interface ReportEditorProps {
    report: SnaggingReport;
    onSave: (report: SnaggingReport) => void;
    onBack: () => void;
}

export function ReportEditor({ report, onSave, onBack }: ReportEditorProps) {
    const [currentReport, setCurrentReport] = useState<SnaggingReport>(() => {
        // Initialize rooms if empty
        if (!report.rooms || report.rooms.length === 0) {
            return {
                ...report,
                rooms: DEFAULT_ROOMS.map((room, idx) => ({
                    ...room,
                    id: `room-${idx}-${Date.now()}`
                }))
            };
        }
        return report;
    });
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
        currentReport.rooms.length > 0 ? currentReport.rooms[0].id : null
    );
    const [isSaving, setIsSaving] = useState(false);
    const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set([selectedRoomId || '']));
    const [showTemplates, setShowTemplates] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    const selectedRoom = currentReport.rooms.find(r => r.id === selectedRoomId);

    const handleSave = () => {
        setIsSaving(true);
        const updatedReport = {
            ...currentReport,
            lastModified: Date.now()
        };
        onSave(updatedReport);
        setTimeout(() => setIsSaving(false), 500);
    };

    const handlePropertyUpdate = (field: keyof SnaggingReport, value: string) => {
        setCurrentReport(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSnag = (roomId: string) => {
        const newSnag: SnagItem = {
            id: `snag-${Date.now()}`,
            location: '',
            description: '',
            priority: 'medium',
            status: 'open',
            photos: [],
            createdAt: Date.now()
        };

        setCurrentReport(prev => ({
            ...prev,
            rooms: prev.rooms.map(room =>
                room.id === roomId
                    ? { ...room, snags: [...room.snags, newSnag] }
                    : room
            )
        }));
    };

    const handleUpdateSnag = (roomId: string, snagId: string, updates: Partial<SnagItem>) => {
        setCurrentReport(prev => ({
            ...prev,
            rooms: prev.rooms.map(room =>
                room.id === roomId
                    ? {
                        ...room,
                        snags: room.snags.map(snag =>
                            snag.id === snagId ? { ...snag, ...updates } : snag
                        )
                    }
                    : room
            )
        }));
    };

    const handleDeleteSnag = (roomId: string, snagId: string) => {
        setCurrentReport(prev => ({
            ...prev,
            rooms: prev.rooms.map(room =>
                room.id === roomId
                    ? { ...room, snags: room.snags.filter(s => s.id !== snagId) }
                    : room
            )
        }));
    };

    const handlePhotoUpload = (roomId: string, snagId: string, files: FileList) => {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const photo: Photo = {
                    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    url: reader.result as string,
                    name: file.name
                };
                handleUpdateSnag(roomId, snagId, {
                    photos: [...(currentReport.rooms.find(r => r.id === roomId)?.snags.find(s => s.id === snagId)?.photos || []), photo]
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemovePhoto = (roomId: string, snagId: string, photoId: string) => {
        const room = currentReport.rooms.find(r => r.id === roomId);
        const snag = room?.snags.find(s => s.id === snagId);
        if (snag) {
            handleUpdateSnag(roomId, snagId, {
                photos: snag.photos.filter(p => p.id !== photoId)
            });
        }
    };

    const toggleRoomExpand = (roomId: string) => {
        setExpandedRooms(prev => {
            const next = new Set(prev);
            if (next.has(roomId)) {
                next.delete(roomId);
            } else {
                next.add(roomId);
            }
            return next;
        });
    };

    const totalSnags = currentReport.rooms.reduce((sum, room) => sum + room.snags.length, 0);
    const openSnags = currentReport.rooms.reduce((sum, room) => sum + room.snags.filter(s => s.status === 'open').length, 0);
    const criticalSnags = currentReport.rooms.reduce((sum, room) => sum + room.snags.filter(s => s.priority === 'critical').length, 0);

    const handleExportPDF = async () => {
        if (!reportRef.current) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;

        // Title page
        pdf.setFillColor(0, 45, 98);
        pdf.rect(0, 0, pageWidth, 60, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.text('Snagging List Report', margin, 35);

        pdf.setFontSize(12);
        pdf.setTextColor(212, 184, 138);
        pdf.text('Professional New Build Defects Report', margin, 45);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        let y = 80;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Property Details', margin, y);
        y += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.text(`Address: ${currentReport.propertyAddress || 'Not specified'}`, margin, y);
        y += 8;
        pdf.text(`Plot Number: ${currentReport.plotNumber || 'Not specified'}`, margin, y);
        y += 8;
        pdf.text(`Client: ${currentReport.clientName || 'Not specified'}`, margin, y);
        y += 8;
        pdf.text(`Developer: ${currentReport.developerName || 'Not specified'}`, margin, y);
        y += 8;
        pdf.text(`Inspection Date: ${currentReport.inspectionDate || 'Not specified'}`, margin, y);
        y += 15;

        // Summary
        pdf.setFont('helvetica', 'bold');
        pdf.text('Summary', margin, y);
        y += 10;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total Snags: ${totalSnags}`, margin, y);
        y += 8;
        pdf.text(`Open Snags: ${openSnags}`, margin, y);
        y += 8;
        pdf.text(`Critical Items: ${criticalSnags}`, margin, y);
        y += 15;

        // Snags by room
        for (const room of currentReport.rooms) {
            if (room.snags.length === 0) continue;

            if (y > pageHeight - 40) {
                pdf.addPage();
                y = margin;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(0, 61, 130);
            pdf.text(room.name, margin, y);
            y += 8;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);

            for (const snag of room.snags) {
                if (y > pageHeight - 30) {
                    pdf.addPage();
                    y = margin;
                }

                const priorityColors: Record<SnagPriority, [number, number, number]> = {
                    critical: [220, 38, 38],
                    high: [245, 158, 11],
                    medium: [59, 130, 246],
                    low: [34, 197, 94]
                };

                pdf.setFillColor(...priorityColors[snag.priority]);
                pdf.circle(margin + 2, y - 1, 2, 'F');

                pdf.text(`${snag.location || 'No location'}: ${snag.description || 'No description'}`, margin + 8, y);
                y += 6;
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Priority: ${snag.priority.toUpperCase()} | Status: ${snag.status.replace('-', ' ').toUpperCase()}`, margin + 8, y);
                pdf.setTextColor(0, 0, 0);
                y += 10;
            }
            y += 5;
        }

        pdf.save(`snagging-report-${currentReport.propertyAddress.replace(/\s+/g, '-') || 'report'}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col" ref={reportRef}>
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-survey-blue transition-colors font-medium"
                        >
                            <ChevronLeft size={20} />
                            Dashboard
                        </button>
                        <div className="h-6 w-px bg-gray-200" />
                        <img src={logoImg} alt="Logo" className="h-10 object-contain" />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-4 text-sm mr-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Total:</span>
                                <span className="font-bold text-gray-900">{totalSnags}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Open:</span>
                                <span className="font-bold text-amber-600">{openSnags}</span>
                            </div>
                            {criticalSnags > 0 && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-full">
                                    <AlertCircle size={14} className="text-red-500" />
                                    <span className="font-bold text-red-600">{criticalSnags} critical</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 bg-[#d4b88a] text-[#1a1a1a] px-4 py-2 rounded-lg font-bold hover:bg-[#c4a87a] transition-colors"
                        >
                            <FileText size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Left Sidebar - Rooms */}
                <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-bold text-gray-900 text-lg">Rooms & Areas</h2>
                        <p className="text-xs text-gray-500 mt-1">Select a room to add snags</p>
                    </div>

                    <div className="p-2">
                        {currentReport.rooms.map(room => {
                            const roomSnagCount = room.snags.length;
                            const roomOpenCount = room.snags.filter(s => s.status === 'open').length;
                            const isSelected = room.id === selectedRoomId;

                            return (
                                <button
                                    key={room.id}
                                    onClick={() => {
                                        setSelectedRoomId(room.id);
                                        if (!expandedRooms.has(room.id)) {
                                            toggleRoomExpand(room.id);
                                        }
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all ${isSelected
                                        ? 'bg-survey-blue text-white'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{room.name}</span>
                                        <div className="flex items-center gap-2">
                                            {roomSnagCount > 0 && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {roomSnagCount}
                                                </span>
                                            )}
                                            {roomOpenCount > 0 && !isSelected && (
                                                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Property Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Property Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Property Address</label>
                                <input
                                    type="text"
                                    value={currentReport.propertyAddress}
                                    onChange={(e) => handlePropertyUpdate('propertyAddress', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue"
                                    placeholder="Enter property address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Plot/Unit Number</label>
                                <input
                                    type="text"
                                    value={currentReport.plotNumber}
                                    onChange={(e) => handlePropertyUpdate('plotNumber', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue"
                                    placeholder="e.g., Plot 42"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Inspection Date</label>
                                <input
                                    type="date"
                                    value={currentReport.inspectionDate}
                                    onChange={(e) => handlePropertyUpdate('inspectionDate', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    value={currentReport.clientName}
                                    onChange={(e) => handlePropertyUpdate('clientName', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue"
                                    placeholder="Enter client name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Developer/Builder</label>
                                <input
                                    type="text"
                                    value={currentReport.developerName}
                                    onChange={(e) => handlePropertyUpdate('developerName', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue"
                                    placeholder="Enter developer name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Selected Room Snags */}
                    {selectedRoom && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedRoom.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedRoom.snags.length} snag{selectedRoom.snags.length !== 1 ? 's' : ''} recorded
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleAddSnag(selectedRoom.id)}
                                    className="flex items-center gap-2 bg-survey-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-survey-blue-dark transition-colors"
                                >
                                    <Plus size={18} />
                                    Add Snag
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {selectedRoom.snags.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={32} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No snags recorded for this room</p>
                                        <p className="text-sm text-gray-400 mt-1">Click "Add Snag" to record a defect</p>
                                    </div>
                                ) : (
                                    selectedRoom.snags.map((snag, index) => (
                                        <SnagItemEditor
                                            key={snag.id}
                                            snag={snag}
                                            index={index + 1}
                                            roomId={selectedRoom.id}
                                            onUpdate={(updates) => handleUpdateSnag(selectedRoom.id, snag.id, updates)}
                                            onDelete={() => handleDeleteSnag(selectedRoom.id, snag.id)}
                                            onPhotoUpload={(files) => handlePhotoUpload(selectedRoom.id, snag.id, files)}
                                            onRemovePhoto={(photoId) => handleRemovePhoto(selectedRoom.id, snag.id, photoId)}
                                            templates={SNAG_TEMPLATES}
                                            showTemplates={showTemplates}
                                            setShowTemplates={setShowTemplates}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Snag Item Editor Component
interface SnagItemEditorProps {
    snag: SnagItem;
    index: number;
    roomId: string;
    onUpdate: (updates: Partial<SnagItem>) => void;
    onDelete: () => void;
    onPhotoUpload: (files: FileList) => void;
    onRemovePhoto: (photoId: string) => void;
    templates: Record<string, string[]>;
    showTemplates: string | null;
    setShowTemplates: (id: string | null) => void;
}

function SnagItemEditor({
    snag,
    index,
    onUpdate,
    onDelete,
    onPhotoUpload,
    onRemovePhoto,
    templates,
    showTemplates,
    setShowTemplates
}: SnagItemEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const priorityColors: Record<SnagPriority, string> = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        high: 'bg-amber-100 text-amber-700 border-amber-200',
        medium: 'bg-blue-100 text-blue-700 border-blue-200',
        low: 'bg-green-100 text-green-700 border-green-200'
    };

    const statusColors: Record<SnagStatus, string> = {
        'open': 'bg-amber-100 text-amber-700 border-amber-200',
        'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
        'resolved': 'bg-green-100 text-green-700 border-green-200'
    };

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-survey-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index}
                </div>

                <div className="flex-1 space-y-4">
                    {/* Location */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
                        <input
                            type="text"
                            value={snag.location}
                            onChange={(e) => onUpdate({ location: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue"
                            placeholder="e.g., Above door frame, Left wall, etc."
                        />
                    </div>

                    {/* Description with Templates */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                            value={snag.description}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-survey-blue min-h-[100px]"
                            placeholder="Describe the defect..."
                        />
                        <div className="absolute top-0 right-0">
                            <button
                                onClick={() => setShowTemplates(showTemplates === snag.id ? null : snag.id)}
                                className="text-xs text-survey-blue hover:underline font-medium flex items-center gap-1"
                            >
                                Templates
                                <ChevronDown size={14} className={`transition-transform ${showTemplates === snag.id ? 'rotate-180' : ''}`} />
                            </button>

                            {showTemplates === snag.id && (
                                <div className="absolute right-0 top-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                                    {Object.entries(templates).map(([category, items]) => (
                                        <div key={category}>
                                            <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase sticky top-0">
                                                {category}
                                            </div>
                                            {items.map((template, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        onUpdate({ description: template });
                                                        setShowTemplates(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    {template}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Priority and Status */}
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Priority</label>
                            <select
                                value={snag.priority}
                                onChange={(e) => onUpdate({ priority: e.target.value as SnagPriority })}
                                className={`appearance-none px-4 py-2 rounded-lg border font-bold text-sm cursor-pointer focus:outline-none ${priorityColors[snag.priority]}`}
                            >
                                <option value="critical">CRITICAL</option>
                                <option value="high">HIGH</option>
                                <option value="medium">MEDIUM</option>
                                <option value="low">LOW</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                            <select
                                value={snag.status}
                                onChange={(e) => onUpdate({ status: e.target.value as SnagStatus })}
                                className={`appearance-none px-4 py-2 rounded-lg border font-bold text-sm cursor-pointer focus:outline-none ${statusColors[snag.status]}`}
                            >
                                <option value="open">OPEN</option>
                                <option value="in-progress">IN PROGRESS</option>
                                <option value="resolved">RESOLVED</option>
                            </select>
                        </div>
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Photos</label>
                        <div className="flex flex-wrap gap-3">
                            {snag.photos.map(photo => (
                                <div key={photo.id} className="relative group">
                                    <img
                                        src={photo.url}
                                        alt={photo.name || 'Snag photo'}
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        onClick={() => onRemovePhoto(photo.id)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => e.target.files && onPhotoUpload(e.target.files)}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-survey-blue hover:text-survey-blue transition-colors"
                            >
                                <Camera size={24} />
                                <span className="text-xs mt-1">Add Photo</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    onClick={onDelete}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete snag"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

export default ReportEditor;
