import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { AppNav } from './components/AppNav';
import { BusinessSetup } from './pages/BusinessSetup';
import { Dashboard } from './pages/Dashboard';
import { Packages } from './pages/Packages';
import { Departments } from './pages/Departments';
import { Staff } from './pages/Staff';
import { SalesDashboard } from './pages/SalesDashboard';
import { SalesOrderPage } from './pages/SalesOrder';
import { SalesOrderInvoice } from './pages/SalesOrderInvoice';
import { SalesOrderContract } from './pages/SalesOrderContract';
import { PublicContractView } from './pages/PublicContractView';
import { StaffTasks } from './pages/StaffTasks';
import { Patient } from './pages/Patient';
import { SidesheetProvider } from './contexts/SidesheetContext';
import { DebugProvider } from './contexts/DebugContext';
import { SalesOrderProvider } from './contexts/SalesOrderContext';
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
            navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: true } }}
            padding="md"
        >
            <AppShell.Navbar p={0}>
                <AppNav />
            </AppShell.Navbar>
            <AppShell.Main>
                <Routes>
                    <Route path="/" element={<SalesDashboard />} />
                    <Route path="/sales" element={<SalesDashboard />} />
                    <Route path="/sales/order" element={<SalesOrderPage />} />
                    <Route path="/sales/order/invoice" element={<SalesOrderInvoice />} />
                    <Route path="/sales/order/contract" element={<SalesOrderContract />} />
                    <Route path="/contract/:id" element={<PublicContractView />} />
                    <Route path="/business-setup" element={<BusinessSetup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/package" element={<Packages />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/department" element={<Departments />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/patient" element={<Patient />} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

function App() {
    return (
        <BrowserRouter>
            <DebugProvider>
            <SalesOrderProvider>
            <SidesheetProvider>
                <AppLayout />
                <DebugOverlay />
            </SidesheetProvider>
            </SalesOrderProvider>
            </DebugProvider>
        </BrowserRouter>
    );
}

export default App;
