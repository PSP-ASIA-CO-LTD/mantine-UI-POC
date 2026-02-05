import { useState } from 'react';
import { TextInput, Textarea, Button, Paper, Title, Text, Stack, Progress, Group, NumberInput, Select, PasswordInput, Modal } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { DEFAULT_BUSINESS_SETTINGS, saveBusinessSettings } from '../utils/businessSettings';
import { API } from '../api';

interface BusinessSetupFlowProps {
  onComplete?: () => void;
}

const BUSINESS_TYPE_OPTIONS = [
  'Nursing Home',
  'Assisted Living',
  'Spa',
  'Construction',
  'Clinic',
  'Hotel',
  'Restaurant',
  'Retail',
  'Manufacturing',
  'Education',
];

export function BusinessSetupFlow({ onComplete }: BusinessSetupFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [depositMonths, setDepositMonths] = useState(DEFAULT_BUSINESS_SETTINGS.depositMonths);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [disagreeOpen, setDisagreeOpen] = useState(false);

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

  const totalSteps = 2;

  const clearError = (field: string) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateAll = () => {
    const nextErrors: Record<string, string> = {};

    if (!businessInfo.businessName.trim()) nextErrors.businessName = 'Business name is required.';
    if (!businessInfo.businessType.trim()) nextErrors.businessType = 'Select a business type.';
    if (!businessInfo.address.trim()) nextErrors.address = 'Address is required.';
    if (!businessInfo.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!facilityInfo.licenseNumber.trim()) nextErrors.licenseNumber = 'License number is required.';

    if (!adminInfo.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!adminInfo.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    if (!adminInfo.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/.+@.+\..+/.test(adminInfo.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!adminInfo.password.trim()) nextErrors.password = 'Password is required.';
    if (!adminInfo.confirmPassword.trim()) nextErrors.confirmPassword = 'Confirm your password.';
    if (adminInfo.password && adminInfo.confirmPassword && adminInfo.password !== adminInfo.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setBusinessInfo({
      businessName: '',
      businessType: '',
      address: '',
      phone: '',
    });
    setAdminInfo({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setFacilityInfo({
      numberOfBeds: '',
      numberOfFloors: '',
      operatingHours: '',
      licenseNumber: '',
    });
    setPreferences({
      timezone: '',
      currency: '',
      language: '',
    });
    setDepositMonths(DEFAULT_BUSINESS_SETTINGS.depositMonths);
    setErrors({});
    setCurrentStep(0);
  };

  const handleComplete = async () => {
    try {
      if (!validateAll()) return;
      await API.saveBusinessProfile({
        id: 'business-1',
        businessInfo,
        adminInfo,
        facilityInfo,
        preferences,
        depositMonths,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      saveBusinessSettings({ depositMonths });
      resetForm();
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to save business profile:', error);
    }
  };

  const handleReadAgreements = () => {
    if (!validateAll()) return;
    setCurrentStep(1);
  };

  const handleExit = () => {
    resetForm();
    if (onComplete) {
      onComplete();
    }
  };

  const handleDisagree = () => {
    setDisagreeOpen(true);
  };

  const confirmDisagree = () => {
    resetForm();
    setCurrentStep(0);
    setDisagreeOpen(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - (var(--app-shell-padding) * 2))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
      padding: 0,
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
              Step {currentStep + 1} of {totalSteps}
            </Text>
            <Text size="xs" c="dimmed">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </Text>
          </div>
          <Progress
            value={((currentStep + 1) / totalSteps) * 100}
            size="sm"
          />
        </div>

          {/* Form Card */}
          <Paper
            shadow="sm"
            p={0}
            radius="md"
          >
          {currentStep === 0 && (
            <div className="business-setup-split">
              <div className="business-setup-pane">
                <Stack gap="md" data-er-field="BUSINESS">
                  <Title order={3} mb="sm">Business Information</Title>

                  <div data-er-field="BUSINESS">
                    <TextInput
                      label="Business Name"
                      placeholder="Enter your nursing home name"
                      value={businessInfo.businessName}
                      onChange={(e) => {
                        setBusinessInfo({ ...businessInfo, businessName: e.target.value });
                        clearError('businessName');
                      }}
                      required
                      error={errors.businessName}
                      data-er-field="BUSINESS.business_name"
                    />
                  </div>

                  <Select
                    label="Business Type"
                    placeholder="Select your business type"
                    data={BUSINESS_TYPE_OPTIONS}
                    searchable
                    value={businessInfo.businessType}
                    onChange={(value) => {
                      setBusinessInfo({ ...businessInfo, businessType: value ?? '' });
                      clearError('businessType');
                    }}
                    required
                    error={errors.businessType}
                    data-er-field="BUSINESS.business_type"
                  />

                  <Textarea
                    label="Address"
                    placeholder="Enter your business address"
                    value={businessInfo.address}
                    onChange={(e) => {
                      setBusinessInfo({ ...businessInfo, address: e.target.value });
                      clearError('address');
                    }}
                    required
                    rows={3}
                    error={errors.address}
                    data-er-field="BUSINESS.address"
                  />

                  <TextInput
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter your contact number"
                    value={businessInfo.phone}
                    onChange={(e) => {
                      setBusinessInfo({ ...businessInfo, phone: e.target.value });
                      clearError('phone');
                    }}
                    required
                    error={errors.phone}
                    data-er-field="BUSINESS.phone"
                  />

                  <TextInput
                    label="License Number"
                    placeholder="Enter facility license number"
                    value={facilityInfo.licenseNumber}
                    onChange={(e) => {
                      setFacilityInfo({ ...facilityInfo, licenseNumber: e.target.value });
                      clearError('licenseNumber');
                    }}
                    required
                    error={errors.licenseNumber}
                    data-er-field="VENUE.license_number"
                  />

                  <NumberInput
                    label="Deposit policy (months)"
                    description="Invoice deposit will be calculated as +N month(s) and added as a line item"
                    value={depositMonths}
                    onChange={(val) => {
                      const parsed = typeof val === 'number' ? val : Number(val);
                      const next = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 1;
                      setDepositMonths(next);
                      saveBusinessSettings({ depositMonths: next });
                    }}
                    min={0}
                    step={1}
                    allowDecimal={false}
                    data-er-field="BUSINESS.deposit_months"
                  />
                </Stack>
              </div>

              <div className="business-setup-pane business-setup-pane--contrast">
                <Stack gap="md">
                  <Title order={3} mb="sm">Owner Account</Title>

                  <Group grow>
                    <TextInput
                      label="First Name"
                      placeholder="First name"
                      value={adminInfo.firstName}
                      onChange={(e) => {
                        setAdminInfo({ ...adminInfo, firstName: e.target.value });
                        clearError('firstName');
                      }}
                      required
                      error={errors.firstName}
                    />

                    <TextInput
                      label="Last Name"
                      placeholder="Last name"
                      value={adminInfo.lastName}
                      onChange={(e) => {
                        setAdminInfo({ ...adminInfo, lastName: e.target.value });
                        clearError('lastName');
                      }}
                      required
                      error={errors.lastName}
                    />
                  </Group>

                  <TextInput
                    label="Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminInfo.email}
                    onChange={(e) => {
                      setAdminInfo({ ...adminInfo, email: e.target.value });
                      clearError('email');
                    }}
                    required
                    error={errors.email}
                  />

                  <PasswordInput
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    value={adminInfo.password}
                    onChange={(e) => {
                      setAdminInfo({ ...adminInfo, password: e.target.value });
                      clearError('password');
                    }}
                    required
                    error={errors.password}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    value={adminInfo.confirmPassword}
                    onChange={(e) => {
                      setAdminInfo({ ...adminInfo, confirmPassword: e.target.value });
                      clearError('confirmPassword');
                    }}
                    required
                    error={errors.confirmPassword}
                  />
                </Stack>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="business-setup-terms">
              <Title order={3} mb="sm">Terms &amp; Condition Agreement</Title>
              <Text size="sm" c="dimmed">
                Please read and accept the Terms &amp; Conditions to complete business setup.
              </Text>

              <div className="business-setup-terms-body">
                <Stack gap="md">
                  <Text>
                    By continuing, you agree to maintain accurate business records, protect resident data,
                    and comply with applicable local regulations. You acknowledge responsibility for staff
                    accounts, billing accuracy, and facility operations within the platform.
                  </Text>
                  <Text>
                    Usable App Company Limited provides the platform “as is” and is not liable for
                    operational decisions made using this system. Please review all local compliance
                    obligations before onboarding residents.
                  </Text>
                  <Text>
                    If you do not agree to these terms, select Disagree to return and edit your information
                    or exit setup.
                  </Text>
                </Stack>
              </div>
            </div>
          )}

          <Modal
            opened={disagreeOpen}
            onClose={() => setDisagreeOpen(false)}
            title="Discard setup information?"
            centered
          >
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                If you disagree, all information you entered on the previous page will be removed for your convenience.
              </Text>
              <Group justify="flex-end">
                <Button variant="subtle" color="gray" onClick={() => setDisagreeOpen(false)}>
                  Keep Editing
                </Button>
                <Button color="red" onClick={confirmDisagree}>
                  Disagree &amp; Clear
                </Button>
              </Group>
            </Stack>
          </Modal>

          {/* Navigation Buttons */}
          <div className="business-setup-footer">
            {currentStep === 0 ? (
              <Button variant="subtle" color="gray" onClick={handleExit}>
                Exit Bourbon
              </Button>
            ) : (
              <Button variant="subtle" color="gray" onClick={handleDisagree}>
                Disagree
              </Button>
            )}

            {currentStep === 0 ? (
              <Button onClick={handleReadAgreements} rightSection={<IconArrowRight size={16} />}>
                Read Agreements
              </Button>
            ) : (
              <Button onClick={handleComplete} leftSection={<IconCheck size={16} />}>
                Agree with the Terms &amp; Condition
              </Button>
            )}
          </div>
        </Paper>

      </div>
    </div>
  );
}
