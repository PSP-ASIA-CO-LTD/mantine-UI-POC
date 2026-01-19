import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { AppNav } from './components/AppNav';
import { BusinessSetup } from './pages/BusinessSetup';
import { Dashboard } from './pages/Dashboard';
import { Packages } from './pages/Packages';
import { Teams } from './pages/Teams';
import { Staff } from './pages/Staff';
import { SalesDashboard } from './pages/SalesDashboard';
import { SalesOrderPage } from './pages/SalesOrder';
import { StaffTasks } from './pages/StaffTasks';
import { SidesheetProvider } from './contexts/SidesheetContext';
import { DebugProvider } from './contexts/DebugContext';
import { DebugOverlay } from './components/DebugOverlay';
import './App.css';

// Routes that should hide the navbar (standalone/mobile-focused pages)
const STANDALONE_ROUTES = ['/staff/tasks'];

function AppLayout() {
    const location = useLocation();
    const isStandalone = STANDALONE_ROUTES.some(route => location.pathname.startsWith(route));

    if (isStandalone) {
        return (
            <AppShell padding="md">
                <AppShell.Main>
                    <Routes>
                        <Route path="/staff/tasks" element={<StaffTasks />} />
                    </Routes>
                </AppShell.Main>
            </AppShell>
        );
    }

    return (
        <AppShell
            navbar={{ width: 280, breakpoint: 'sm' }}
            padding="md"
        >
            <AppShell.Navbar p={0}>
                <AppNav />
            </AppShell.Navbar>
            <AppShell.Main>
                <Routes>
                    <Route path="/" element={<Navigate to="/sales" replace />} />
                    <Route path="/sales" element={<SalesDashboard />} />
                    <Route path="/sales/order" element={<SalesOrderPage />} />
                    <Route path="/business-setup" element={<BusinessSetup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/staff" element={<Staff />} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

function App() {
    return (
        <BrowserRouter>
            <DebugProvider>
            <SidesheetProvider>
                <AppLayout />
                <DebugOverlay />
            </SidesheetProvider>
            </DebugProvider>
        </BrowserRouter>
    );
}

export default App;
