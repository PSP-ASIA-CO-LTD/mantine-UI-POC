import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { AppNav } from './components/AppNav';
import { BusinessSetup } from './pages/BusinessSetup';
import { Dashboard } from './pages/Dashboard';
import { Packages } from './pages/Packages';
import { Teams } from './pages/Teams';
import { Staff } from './pages/Staff';
import { SidesheetProvider } from './contexts/SidesheetContext';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <SidesheetProvider>
                <AppShell
                    navbar={{ width: 280, breakpoint: 'sm' }}
                    padding="md"
                >
                    <AppShell.Navbar p={0}>
                        <AppNav />
                    </AppShell.Navbar>
                    <AppShell.Main>
                        <Routes>
                            <Route path="/" element={<Navigate to="/business-setup" replace />} />
                            <Route path="/business-setup" element={<BusinessSetup />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/packages" element={<Packages />} />
                            <Route path="/teams" element={<Teams />} />
                            <Route path="/staff" element={<Staff />} />
                        </Routes>
                    </AppShell.Main>
                </AppShell>
            </SidesheetProvider>
        </BrowserRouter>
    );
}

export default App;
