import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionIcon, Button, Paper, Stack, Text, TextInput, Title, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { API } from '../api';
import { PageActionBar } from '../components/PageActionBar';
import type { StoredContract } from '../types';
import './PublicContractView.css';

export function PublicContractView() {
    const navigate = useNavigate();
    const params = useParams();
    const contractId = params.id as string | undefined;

    const [loading, setLoading] = useState(true);
    const [stored, setStored] = useState<StoredContract | null>(null);
    const [email, setEmail] = useState('');
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!contractId) {
                setStored(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            const found = await API.getStoredContractById(contractId);
            setStored(found || null);
            setLoading(false);
        };
        run();
    }, [contractId]);

    const allowed = useMemo(() => {
        const fromExplicit = (stored?.allowedGuardianEmails || []).map(e => e.trim().toLowerCase()).filter(Boolean);
        if (fromExplicit.length > 0) return new Set(fromExplicit);
        const fromSource = (stored?.source?.guardians || [])
            .map(g => (g.email || '').trim().toLowerCase())
            .filter(Boolean);
        return new Set(fromSource);
    }, [stored?.allowedGuardianEmails, stored?.source?.guardians]);

    const handleAuthorize = () => {
        const normalized = email.trim().toLowerCase();
        if (!normalized) return;
        if (!allowed.has(normalized)) {
            notifications.show({
                title: 'Not authorized',
                message: 'This email is not listed as a guardian on this contract.',
                color: 'red',
            });
            setAuthorized(false);
            return;
        }
        setAuthorized(true);
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="public-contract-page">
                <Paper p="lg" withBorder>
                    <Title order={2}>Contract</Title>
                    <Text c="dimmed">Loading…</Text>
                </Paper>
            </div>
        );
    }

    if (!stored) {
        return (
            <div className="public-contract-page">
                <Paper p="lg" withBorder>
                    <Stack gap="md">
                        <Title order={2}>Contract</Title>
                        <Text c="dimmed">Contract not found.</Text>
                        <Button onClick={() => navigate('/sales')}>Go to Sales</Button>
                    </Stack>
                </Paper>
            </div>
        );
    }

    return (
        <div className="public-contract-page">
            <PageActionBar
                left={
                    <>
                        <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)} aria-label="Back">
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <Title order={3}>Contract #{stored.contractNumber}</Title>
                    </>
                }
                right={
                    authorized ? (
                        <Button variant="light" leftSection={<IconPrinter size={18} />} onClick={handlePrint}>
                            Print
                        </Button>
                    ) : null
                }
            />

            {!authorized ? (
                <Paper withBorder p="lg" className="public-contract-gate">
                    <Stack gap="md">
                        <Title order={2}>Verify email to view</Title>
                        <Text c="dimmed">
                            Enter a guardian email address associated with this contract to view the document.
                        </Text>
                        <TextInput
                            label="Guardian email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                        />
                        <Group justify="flex-end" gap="sm">
                            <Button onClick={handleAuthorize}>View contract</Button>
                        </Group>
                    </Stack>
                </Paper>
            ) : (
                <div className="contract-a4-paper" dangerouslySetInnerHTML={{ __html: stored.compiledHtml }} />
            )}
        </div>
    );
}

