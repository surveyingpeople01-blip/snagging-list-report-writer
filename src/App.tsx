import { useState, useEffect } from 'react';
import Login from './components/Login';
import { Dashboard } from './components/Dashboard';
import type { SavedReport, ReportStatus } from './components/Dashboard';
import { ReportEditor } from './components/ReportEditor';
import type { SnaggingReport, Room } from './components/ReportEditor';

// Storage keys
const STORAGE_KEYS = {
  REPORTS: 'snagging-reports',
  IS_LOGGED_IN: 'isLoggedIn'
};

// Default rooms for new reports
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  });

  const [reports, setReports] = useState<SnaggingReport[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return stored ? JSON.parse(stored) : [];
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  // Save reports to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    setIsLoggedIn(false);
  };

  const handleNewReport = () => {
    const now = Date.now();
    const newReport: SnaggingReport = {
      id: `report-${now}`,
      propertyAddress: '',
      developerName: '',
      clientName: '',
      plotNumber: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      status: 'working',
      rooms: DEFAULT_ROOMS.map((room, idx) => ({
        ...room,
        id: `room-${idx}-${now}`
      })),
      coverPhoto: null,
      createdAt: now,
      lastModified: now
    };

    setReports(prev => [...prev, newReport]);
    setCurrentReportId(newReport.id);
    setCurrentView('editor');
  };

  const handleOpenReport = (id: string) => {
    setCurrentReportId(id);
    setCurrentView('editor');
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: ReportStatus) => {
    setReports(prev => prev.map(r =>
      r.id === id ? { ...r, status } : r
    ));
  };

  const handleSaveReport = (updatedReport: SnaggingReport) => {
    setReports(prev => prev.map(r =>
      r.id === updatedReport.id ? updatedReport : r
    ));
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentReportId(null);
  };

  // Convert full reports to dashboard format
  const dashboardReports: SavedReport[] = reports.map(r => ({
    id: r.id,
    propertyAddress: r.propertyAddress,
    developerName: r.developerName,
    clientName: r.clientName,
    plotNumber: r.plotNumber,
    inspectionDate: r.inspectionDate,
    lastModified: r.lastModified,
    status: r.status,
    totalSnags: r.rooms.reduce((sum, room) => sum + room.snags.length, 0),
    openSnags: r.rooms.reduce((sum, room) => sum + room.snags.filter(s => s.status === 'open').length, 0)
  }));

  const currentReport = reports.find(r => r.id === currentReportId);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'editor' && currentReport) {
    return (
      <ReportEditor
        report={currentReport}
        onSave={handleSaveReport}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <Dashboard
      reports={dashboardReports}
      onNewReport={handleNewReport}
      onOpenReport={handleOpenReport}
      onDeleteReport={handleDeleteReport}
      onStatusChange={handleStatusChange}
      onLogout={handleLogout}
    />
  );
}

export default App;
