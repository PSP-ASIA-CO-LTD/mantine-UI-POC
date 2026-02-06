import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Stack, Text, Avatar, Group, Menu, UnstyledButton, Button } from '@mantine/core';
import { 
    IconChartLine, 
    IconBox, 
    IconUsers, 
    IconUser,
    IconUserHeart,
    IconSettings,
    IconShoppingCart,
    IconReceipt,
    IconCalendarCheck,
    IconChevronDown,
    IconLogout,
    IconBuilding
} from '@tabler/icons-react';
import './AppNav.css';
import { useSidesheet } from '../contexts/SidesheetContext';
import { API } from '../api';
import { buildCompanySettingsPanels } from './CompanySettingsPanels.builder';
import { CompanySettingsEmpty, CompanySettingsLoading } from './CompanySettingsPanels';
import { AppSidesheetFooter } from './AppSidesheetFooter';
import type { BusinessProfile } from '../types';

export function AppNav() {
    const navigate = useNavigate();
    const { open, updateContent, close } = useSidesheet();
    const [companyProfile, setCompanyProfile] = useState<BusinessProfile | null>(null);
    const [companyDraft, setCompanyDraft] = useState<BusinessProfile | null>(null);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companySaving, setCompanySaving] = useState(false);
    const [companyEditing, setCompanyEditing] = useState(false);
    const [companySheetOpen, setCompanySheetOpen] = useState(false);

    const handleCloseSheet = () => {
        setCompanySheetOpen(false);
        setCompanyEditing(false);
        close();
    };

    const handleCompanySettings = async () => {
        setCompanySheetOpen(true);
        setCompanyEditing(false);
        setCompanyLoading(true);
        open({
            title: 'Company Settings',
            rightPane: <CompanySettingsLoading />,
            footer: (
                <AppSidesheetFooter
                    onCancel={handleCloseSheet}
                    cancelLabel="Close"
                    showSave={false}
                />
            ),
        });

        try {
            const profile = await API.getBusinessProfile();
            setCompanyProfile(profile);
            setCompanyDraft(profile);
        } catch (error) {
            console.error('Failed to load company settings:', error);
            setCompanyProfile(null);
            setCompanyDraft(null);
        } finally {
            setCompanyLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setCompanyDraft(companyProfile);
        setCompanyEditing(false);
    };

    const handleSave = async () => {
        if (!companyDraft) return;
        setCompanySaving(true);
        try {
            const saved = await API.saveBusinessProfile(companyDraft);
            setCompanyProfile(saved);
            setCompanyDraft(saved);
            setCompanyEditing(false);
        } catch (error) {
            console.error('Failed to save company settings:', error);
        } finally {
            setCompanySaving(false);
        }
    };

    useEffect(() => {
        if (!companySheetOpen) return;

        const defaultFooter = (
            <AppSidesheetFooter
                onCancel={handleCloseSheet}
                cancelLabel="Close"
                showSave={false}
            />
        );

        if (companyLoading) {
            updateContent({
                title: 'Company Settings',
                leftPane: null,
                rightPane: <CompanySettingsLoading />,
                footer: defaultFooter,
            });
            return;
        }

        if (!companyDraft) {
            updateContent({
                title: 'Company Settings',
                leftPane: null,
                rightPane: <CompanySettingsEmpty />,
                footer: defaultFooter,
            });
            return;
        }

        const { leftPane, rightPane } = buildCompanySettingsPanels({
            profile: companyDraft,
            editable: companyEditing,
            onBusinessInfoChange: (field, value) => {
                setCompanyDraft(prev => prev ? ({
                    ...prev,
                    businessInfo: {
                        ...prev.businessInfo,
                        [field]: value,
                    },
                }) : prev);
            },
            onAdminInfoChange: (field, value) => {
                setCompanyDraft(prev => prev ? ({
                    ...prev,
                    adminInfo: {
                        ...prev.adminInfo,
                        [field]: value,
                    },
                }) : prev);
            },
            onFacilityInfoChange: (field, value) => {
                setCompanyDraft(prev => prev ? ({
                    ...prev,
                    facilityInfo: {
                        ...prev.facilityInfo,
                        [field]: value,
                    },
                }) : prev);
            },
            onDepositMonthsChange: (value) => {
                setCompanyDraft(prev => prev ? ({
                    ...prev,
                    depositMonths: value,
                }) : prev);
            },
        });

        const footer = companyEditing ? (
            <AppSidesheetFooter
                onCancel={handleCancelEdit}
                onSave={handleSave}
                isLoading={companySaving}
            />
        ) : (
            <AppSidesheetFooter
                onCancel={handleCloseSheet}
                cancelLabel="Close"
                showSave={false}
                extraActions={(
                    <Button variant="light" onClick={() => setCompanyEditing(true)}>
                        Edit
                    </Button>
                )}
            />
        );

        updateContent({
            title: 'Company Settings',
            leftPane,
            rightPane,
            footer,
        });
    }, [
        companySheetOpen,
        companyLoading,
        companyDraft,
        companyEditing,
        companySaving,
        close,
        updateContent,
    ]);

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
                            <span>Staff Task</span>
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
                        <NavLink to="/package" className="nav-link">
                            <IconBox size={20} />
                            <span>Package</span>
                        </NavLink>
                        <NavLink to="/department" className="nav-link">
                            <IconUsers size={20} />
                            <span>Department</span>
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
                <Menu position="top-start" offset={8} withArrow>
                    <Menu.Target>
                        <UnstyledButton className="nav-user-button">
                            <Group gap="sm">
                                <Avatar color="blue" radius="md">OM</Avatar>
                                <div>
                                    <Text size="sm" fw={500}>Manager Alice</Text>
                                    <Text size="xs" c="dimmed">Administrator</Text>
                                </div>
                            </Group>
                            <IconChevronDown size={18} className="nav-user-chevron" />
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={() => navigate('/profile')} leftSection={<IconUser size={16} />}>
                            Profile
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item onClick={handleCompanySettings} leftSection={<IconBuilding size={16} />}>
                            Company
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item disabled leftSection={<IconSettings size={16} />}>
                            Settings
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item onClick={() => navigate('/business-setup')} leftSection={<IconLogout size={16} />}>
                            Logout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </footer>
        </div>
    );
}
