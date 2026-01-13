import { useState } from 'react';
import { TextInput, Textarea, Button, Paper, Title, Text, Stack, Progress, Group } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';

interface BusinessSetupFlowProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export function BusinessSetupFlow({ onBack, onComplete }: BusinessSetupFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    address: '',
    phone: '',
  });

  const [adminInfo, setAdminInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [facilityInfo, setFacilityInfo] = useState({
    numberOfBeds: '',
    numberOfFloors: '',
    operatingHours: '',
    licenseNumber: '',
  });

  const [preferences, setPreferences] = useState({
    timezone: '',
    currency: '',
    language: '',
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mock completion logic
    console.log('Setup complete:', { businessInfo, adminInfo, facilityInfo, preferences });
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '48rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <Title order={1} mb="xs">Business Setup</Title>
          <Text c="dimmed">Let's set up your nursing home facility</Text>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <Text size="xs" c="dimmed">
              Step {currentStep + 1} of 4
            </Text>
            <Text size="xs" c="dimmed">
              {Math.round(((currentStep + 1) / 4) * 100)}% Complete
            </Text>
          </div>
          <Progress
            value={((currentStep + 1) / 4) * 100}
            size="sm"
          />
        </div>

        {/* Form Card */}
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
        >
          {/* Step 1: Business Information */}
          {currentStep === 0 && (
            <Stack gap="md">
              <Title order={3} mb="sm">Business Information</Title>

              <TextInput
                label="Business Name"
                placeholder="Enter your nursing home name"
                value={businessInfo.businessName}
                onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                required
              />

              <TextInput
                label="Business Type"
                placeholder="e.g., Nursing Home, Assisted Living"
                value={businessInfo.businessType}
                onChange={(e) => setBusinessInfo({ ...businessInfo, businessType: e.target.value })}
                required
              />

              <Textarea
                label="Address"
                placeholder="Enter your business address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                required
                rows={3}
              />

              <TextInput
                label="Phone Number"
                type="tel"
                placeholder="Enter your contact number"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                required
              />
            </Stack>
          )}

          {/* Step 2: Administrator Account */}
          {currentStep === 1 && (
            <Stack gap="md">
              <Title order={3} mb="sm">Administrator Account</Title>

              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="First name"
                  value={adminInfo.firstName}
                  onChange={(e) => setAdminInfo({ ...adminInfo, firstName: e.target.value })}
                  required
                />

                <TextInput
                  label="Last Name"
                  placeholder="Last name"
                  value={adminInfo.lastName}
                  onChange={(e) => setAdminInfo({ ...adminInfo, lastName: e.target.value })}
                  required
                />
              </Group>

              <TextInput
                label="Email"
                type="email"
                placeholder="admin@example.com"
                value={adminInfo.email}
                onChange={(e) => setAdminInfo({ ...adminInfo, email: e.target.value })}
                required
              />

              <TextInput
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={adminInfo.password}
                onChange={(e) => setAdminInfo({ ...adminInfo, password: e.target.value })}
                required
              />

              <TextInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={adminInfo.confirmPassword}
                onChange={(e) => setAdminInfo({ ...adminInfo, confirmPassword: e.target.value })}
                required
              />
            </Stack>
          )}

          {/* Step 3: Facility Details */}
          {currentStep === 2 && (
            <Stack gap="md">
              <Title order={3} mb="sm">Facility Details</Title>

              <Group grow>
                <TextInput
                  label="Number of Beds"
                  type="number"
                  placeholder="e.g., 50"
                  value={facilityInfo.numberOfBeds}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, numberOfBeds: e.target.value })}
                  required
                />

                <TextInput
                  label="Number of Floors"
                  type="number"
                  placeholder="e.g., 3"
                  value={facilityInfo.numberOfFloors}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, numberOfFloors: e.target.value })}
                  required
                />
              </Group>

              <TextInput
                label="Operating Hours"
                placeholder="e.g., 24/7 or 8:00 AM - 8:00 PM"
                value={facilityInfo.operatingHours}
                onChange={(e) => setFacilityInfo({ ...facilityInfo, operatingHours: e.target.value })}
                required
              />

              <TextInput
                label="License Number"
                placeholder="Enter facility license number"
                value={facilityInfo.licenseNumber}
                onChange={(e) => setFacilityInfo({ ...facilityInfo, licenseNumber: e.target.value })}
                required
              />
            </Stack>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 3 && (
            <Stack gap="md">
              <Title order={3} mb="sm">System Preferences</Title>

              <TextInput
                label="Timezone"
                placeholder="e.g., Asia/Bangkok"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                required
              />

              <TextInput
                label="Currency"
                placeholder="e.g., THB, USD"
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                required
              />

              <TextInput
                label="Language"
                placeholder="e.g., English, Thai"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                required
              />

              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  marginTop: '1rem'
                }}
              >
                <Text size="xs" c="dimmed">
                  <strong>Almost there!</strong> Review your information and click Complete Setup to
                  finish creating your account.
                </Text>
              </Paper>
            </Stack>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--mantine-color-gray-2)'
          }}>
            <div>
              {currentStep === 0 && onBack ? (
                <Button
                  variant="subtle"
                  onClick={onBack}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Back
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  leftSection={<IconCheck size={16} />}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </Paper>

        {/* Step Indicators */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                height: '0.5rem',
                width: '0.5rem',
                borderRadius: '50%',
                backgroundColor: index === currentStep
                  ? 'var(--mantine-color-blue-6)'
                  : index < currentStep
                  ? 'var(--mantine-color-blue-4)'
                  : 'var(--mantine-color-gray-3)',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
