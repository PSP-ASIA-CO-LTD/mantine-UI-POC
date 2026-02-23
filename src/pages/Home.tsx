import { Button, Container, Title, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBellRinging } from '@tabler/icons-react';

export function Home() {
    const handleNotify = () => {
        notifications.show({
            title: 'สำเร็จ!',
            message: 'Mantine ทำงานได้แล้ว 🐱',
            icon: <IconBellRinging size={18} />,
        });
    };

    return (
        <Container py="xl">
            <Stack align="center">
                <Title>Healthy Cat Project</Title>
                <Button
                    size="lg"
                    onClick={handleNotify}
                    leftSection={<IconBellRinging size={20} />}
                >
                    ทดสอบแจ้งเตือน
                </Button>
            </Stack>
        </Container>
    );
}