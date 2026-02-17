import { useState } from 'react';
import { API } from '../api';
import type { Notification } from '../types';

export function useNotifications() {
    const [sending, setSending] = useState(false);

    const createNotification = async (data: Omit<Notification, 'id' | 'createdAt'>) => {
        setSending(true);
        try {
            return await API.createNotification(data);
        } finally {
            setSending(false);
        }
    };

    return { createNotification, sending };
}
