import { Title, Stack, TextInput, Textarea, Card, Text, NumberInput } from '@mantine/core';
import { SidesheetSection } from './SidesheetSection';
import type { BusinessProfile } from '../types';

interface CompanySettingsPanelOptions {
    profile: BusinessProfile;
    editable?: boolean;
    onBusinessInfoChange?: (field: keyof BusinessProfile['businessInfo'], value: string) => void;
    onAdminInfoChange?: (field: keyof BusinessProfile['adminInfo'], value: string) => void;
    onFacilityInfoChange?: (field: keyof BusinessProfile['facilityInfo'], value: string) => void;
    onDepositMonthsChange?: (value: number) => void;
}

export function buildCompanySettingsPanels({
    profile,
    editable = false,
    onBusinessInfoChange,
    onAdminInfoChange,
    onFacilityInfoChange,
    onDepositMonthsChange,
}: CompanySettingsPanelOptions) {
    const leftPane = (
        <Stack gap="lg">
            <div>
                <Title order={4}>Business Details</Title>
                <Stack gap="sm" mt="sm">
                    <TextInput
                        label="Business Name"
                        value={profile.businessInfo.businessName}
                        readOnly={!editable}
                        onChange={editable ? (event) => onBusinessInfoChange?.('businessName', event.currentTarget.value) : undefined}
                    />
                    <TextInput
                        label="Business Type"
                        value={profile.businessInfo.businessType}
                        readOnly={!editable}
                        onChange={editable ? (event) => onBusinessInfoChange?.('businessType', event.currentTarget.value) : undefined}
                    />
                    <Textarea
                        label="Address"
                        value={profile.businessInfo.address}
                        readOnly={!editable}
                        onChange={editable ? (event) => onBusinessInfoChange?.('address', event.currentTarget.value) : undefined}
                        minRows={2}
                    />
                    <TextInput
                        label="Phone Number"
                        value={profile.businessInfo.phone}
                        readOnly={!editable}
                        onChange={editable ? (event) => onBusinessInfoChange?.('phone', event.currentTarget.value) : undefined}
                    />
                </Stack>
            </div>

            <div>
                <Title order={4}>Administrator</Title>
                <Stack gap="sm" mt="sm">
                    <TextInput
                        label="First Name"
                        value={profile.adminInfo.firstName}
                        readOnly={!editable}
                        onChange={editable ? (event) => onAdminInfoChange?.('firstName', event.currentTarget.value) : undefined}
                    />
                    <TextInput
                        label="Last Name"
                        value={profile.adminInfo.lastName}
                        readOnly={!editable}
                        onChange={editable ? (event) => onAdminInfoChange?.('lastName', event.currentTarget.value) : undefined}
                    />
                    <TextInput
                        label="Email"
                        value={profile.adminInfo.email}
                        readOnly={!editable}
                        onChange={editable ? (event) => onAdminInfoChange?.('email', event.currentTarget.value) : undefined}
                    />
                </Stack>
            </div>

            <div>
                <Title order={4}>Facility & Billing</Title>
                <Stack gap="sm" mt="sm">
                    <TextInput
                        label="License Number"
                        value={profile.facilityInfo.licenseNumber}
                        readOnly={!editable}
                        onChange={editable ? (event) => onFacilityInfoChange?.('licenseNumber', event.currentTarget.value) : undefined}
                    />
                    {editable ? (
                        <NumberInput
                            label="Deposit policy (months)"
                            value={profile.depositMonths}
                            min={0}
                            onChange={(value) => onDepositMonthsChange?.(typeof value === 'number' ? value : Number(value) || 0)}
                        />
                    ) : (
                        <TextInput
                            label="Deposit policy (months)"
                            value={String(profile.depositMonths)}
                            readOnly
                        />
                    )}
                </Stack>
            </div>
        </Stack>
    );

    const rightPane = editable ? (
        <SidesheetSection title="Building Details" actions={<Text size="xs" c="dimmed">Building 1</Text>}>
            <Card padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <TextInput
                        label="Number of Beds"
                        value={profile.facilityInfo.numberOfBeds}
                        onChange={(event) => onFacilityInfoChange?.('numberOfBeds', event.currentTarget.value)}
                    />
                    <TextInput
                        label="Number of Floors"
                        value={profile.facilityInfo.numberOfFloors}
                        onChange={(event) => onFacilityInfoChange?.('numberOfFloors', event.currentTarget.value)}
                    />
                    <TextInput
                        label="Operating Hours"
                        value={profile.facilityInfo.operatingHours}
                        onChange={(event) => onFacilityInfoChange?.('operatingHours', event.currentTarget.value)}
                    />
                </Stack>
            </Card>
        </SidesheetSection>
    ) : (
        <SidesheetSection title="Buildings">
            <Stack gap="md">
                {[profile.facilityInfo].map((facility, index) => (
                    <Card key={index} padding="lg" radius="md" withBorder>
                        <Stack gap="xs">
                            <Text fw={600}>Building {index + 1}</Text>
                            <Text size="sm" c="dimmed">License Number</Text>
                            <Text size="sm">{facility.licenseNumber || 'Not provided'}</Text>
                            <Text size="sm" c="dimmed">Number of Beds</Text>
                            <Text size="sm">{facility.numberOfBeds || 'Not provided'}</Text>
                            <Text size="sm" c="dimmed">Number of Floors</Text>
                            <Text size="sm">{facility.numberOfFloors || 'Not provided'}</Text>
                            <Text size="sm" c="dimmed">Operating Hours</Text>
                            <Text size="sm">{facility.operatingHours || 'Not provided'}</Text>
                        </Stack>
                    </Card>
                ))}
            </Stack>
        </SidesheetSection>
    );

    return { leftPane, rightPane };
}

