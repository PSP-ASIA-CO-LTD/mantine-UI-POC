import { NavLink } from 'react-router-dom';
import { Stack, Text, Avatar, Group } from '@mantine/core';
import { IconChartLine, IconBox, IconUsers, IconUser, IconSettings } from '@tabler/icons-react';
import './AppNav.css';

export function AppNav() {
    return (
        <div className="app-nav">
            <header className="app-nav-header">
                <NavLink to="/" className="brand">Bourbon <span>Mall</span></NavLink>
                <div className="subtitle">Operation Manager</div>
            </header>
            
            <nav className="app-nav-content">
                <Stack gap="xs">
                    <NavLink to="/business-setup" className="nav-link">
                        <IconSettings size={20} />
                        <span>Business Setup</span>
                    </NavLink>
                    <NavLink to="/dashboard" className="nav-link">
                        <IconChartLine size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/packages" className="nav-link">
                        <IconBox size={20} />
                        <span>Packages</span>
                    </NavLink>
                    <NavLink to="/teams" className="nav-link">
                        <IconUsers size={20} />
                        <span>Departments</span>
                    </NavLink>
                    <NavLink to="/staff" className="nav-link">
                        <IconUser size={20} />
                        <span>Staff</span>
                    </NavLink>
                </Stack>
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
