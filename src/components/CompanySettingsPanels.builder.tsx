import { Title, Stack, Card, Text } from '@mantine/core';
import { SidesheetSection } from './SidesheetSection';
import type { BusinessProfile } from '../types';
import { InlineEditableField } from './InlineEditableField';

interface CompanySettingsPanelOptions {
    profile: BusinessProfile;
    onBusinessInfoSave?: (field: keyof BusinessProfile['businessInfo'], value: string) => Promise<void> | void;
    onAdminInfoSave?: (field: keyof BusinessProfile['adminInfo'], value: string) => Promise<void> | void;
    onFacilityInfoSave?: (field: keyof BusinessProfile['facilityInfo'], value: string) => Promise<void> | void;
    onDepositMonthsSave?: (value: number) => Promise<void> | void;
}

export function buildCompanySettingsPanels({
    profile,
    onBusinessInfoSave,
    onAdminInfoSave,
    onFacilityInfoSave,
    onDepositMonthsSave,
}: CompanySettingsPanelOptions) {
    const leftPane = (
        <Stack gap="lg">
            <div>
                <Title order={4}>Business Details</Title>
                <Stack gap="sm" mt="sm">
                    <InlineEditableField
                        label="Business Name"
                        value={profile.businessInfo.businessName}
                        onSave={(value) => onBusinessInfoSave?.('businessName', String(value))}
                    />
                    <InlineEditableField
                        label="Business Type"
                        value={profile.businessInfo.businessType}
                        onSave={(value) => onBusinessInfoSave?.('businessType', String(value))}
                    />
                    <InlineEditableField
                        label="Address"
                        type="textarea"
                        value={profile.businessInfo.address}
                        onSave={(value) => onBusinessInfoSave?.('address', String(value))}
                    />
                    <InlineEditableField
                        label="Phone Number"
                        type="tel"
                        value={profile.businessInfo.phone}
                        onSave={(value) => onBusinessInfoSave?.('phone', String(value))}
                    />
                </Stack>
            </div>

            <div>
                <Title order={4}>Administrator</Title>
                <Stack gap="sm" mt="sm">
                    <InlineEditableField
                        label="First Name"
                        value={profile.adminInfo.firstName}
                        onSave={(value) => onAdminInfoSave?.('firstName', String(value))}
                    />
                    <InlineEditableField
                        label="Last Name"
                        value={profile.adminInfo.lastName}
                        onSave={(value) => onAdminInfoSave?.('lastName', String(value))}
                    />
                    <InlineEditableField
                        label="Email"
                        type="email"
                        value={profile.adminInfo.email}
                        onSave={(value) => onAdminInfoSave?.('email', String(value))}
                    />
                </Stack>
            </div>

            <div>
                <Title order={4}>Facility & Billing</Title>
                <Stack gap="sm" mt="sm">
                    <InlineEditableField
                        label="License Number"
                        value={profile.facilityInfo.licenseNumber}
                        onSave={(value) => onFacilityInfoSave?.('licenseNumber', String(value))}
                    />
                    <InlineEditableField
                        label="Deposit policy (months)"
                        type="number"
                        value={profile.depositMonths}
                        onSave={(value) => onDepositMonthsSave?.(typeof value === 'number' ? value : Number(value) || 0)}
                    />
                </Stack>
            </div>
        </Stack>
    );

    const rightPane = (
        <SidesheetSection
            title="Buildings"
            actions={<Text size="xs" c="dimmed">Building 1</Text>}
        >
            <Card padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <InlineEditableField
                        label="Number of Beds"
                        value={profile.facilityInfo.numberOfBeds}
                        onSave={(value) => onFacilityInfoSave?.('numberOfBeds', String(value))}
                    />
                    <InlineEditableField
                        label="Number of Floors"
                        value={profile.facilityInfo.numberOfFloors}
                        onSave={(value) => onFacilityInfoSave?.('numberOfFloors', String(value))}
                    />
                    <InlineEditableField
                        label="Operating Hours"
                        value={profile.facilityInfo.operatingHours}
                        onSave={(value) => onFacilityInfoSave?.('operatingHours', String(value))}
                    />
                </Stack>
            </Card>
        </SidesheetSection>
    );

    return { leftPane, rightPane };
}
