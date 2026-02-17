import {
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
    Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom'; // add Import
import { TextInput, PasswordInput } from '../components/EditableFields';

export function Login() {
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format'),
            password: (value) => {
                if (value.length < 6) {
                    return 'Password must be at least 6 characters long';
                }
                if (!/[a-zA-Z]/.test(value)) {
                    return 'Password must contain at least one English letter';
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: typeof form.values) => {
        notifications.show({
            title: 'Logging in',
            message: `Welcome, ${values.email}`,
            color: 'blue',
        });

        // Dashboard or Home after Login
        // Route in App.tsx
        navigate('/home');
    };

    return (
        <Center h="100vh">
            <Container size={420}>
                <Title ta="center" fw={900}>
                    Nursing Home 🐱
                </Title>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput
                            label="Email"
                            placeholder="your@email.com"
                            required
                            {...form.getInputProps('email')}
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Enter Password"
                            required
                            mt="md"
                            {...form.getInputProps('password')}
                        />
                        <Group justify="space-between" mt="lg">
                            <Text
                                size="sm"
                                c="blue"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/forgot-password')} // if forgot password
                            >
                                Forgot Password?
                            </Text>
                        </Group>
                        <Button fullWidth mt="xl" type="submit">
                            LOG-IN
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Center>
    );
}
