import { NavLink } from 'react-router-dom';
import { Stack, Text, Avatar, Group } from '@mantine/core';
import { 
    IconChartLine, 
    IconBox, 
    IconUsers, 
    IconUser,
    IconUserHeart,
    IconSettings,
    IconShoppingCart,
    IconReceipt,
    IconCalendarCheck
} from '@tabler/icons-react';
import './AppNav.css';

export function AppNav() {
    return (
        <div className="app-nav">
            <header className="app-nav-header">
                <NavLink to="/" className="brand">Bourbon <span>Mall</span></NavLink>
                <div className="subtitle">Operation Manager</div>
            </header>
            
            <nav className="app-nav-content">
                <div className="nav-group">
                    <div className="nav-group-label">Frontoffice</div>
                    <Stack gap="xs">
                        <NavLink to="/sales" end className="nav-link">
                            <IconChartLine size={20} />
                            <span>Sales Dashboard</span>
                        </NavLink>
                        <NavLink to="/sales/order" className="nav-link">
                            <IconShoppingCart size={20} />
                            <span>Create Sales Order</span>
                        </NavLink>
                    </Stack>
                </div>

                <div className="nav-group">
                    <div className="nav-group-label">Operations</div>
                    <Stack gap="xs">
                        <NavLink to="/staff/tasks" className="nav-link">
                            <IconCalendarCheck size={20} />
                            <span>Staff Tasks</span>
                        </NavLink>
                    </Stack>
                </div>

                <div className="nav-group">
                    <div className="nav-group-label">Backoffice</div>
                    <Stack gap="xs">
                        <NavLink to="/business-setup" className="nav-link">
                            <IconSettings size={20} />
                            <span>Business Setup</span>
                        </NavLink>
                        <NavLink to="/dashboard" className="nav-link">
                            <IconReceipt size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/packages" className="nav-link">
                            <IconBox size={20} />
                            <span>Packages</span>
                        </NavLink>
                        <NavLink to="/departments" className="nav-link">
                            <IconUsers size={20} />
                            <span>Departments</span>
                        </NavLink>
                        <NavLink to="/staff" end className="nav-link">
                            <IconUser size={20} />
                            <span>Staff</span>
                        </NavLink>
                        <NavLink to="/patient" end className="nav-link">
                            <IconUserHeart size={20} />
                            <span>Patient</span>
                        </NavLink>
                    </Stack>
                </div>
            </nav>
            
            <footer className="app-nav-footer">
                <Group gap="sm">
                    <Avatar color="blue" radius="md">OM</Avatar>
                    <div>
                        <Text size="sm" fw={500}>Manager Alice</Text>
                        <Text size="xs" c="dimmed">Administrator</Text>
                    </div>
                </Group>
            </footer>
        </div>
    );
}
