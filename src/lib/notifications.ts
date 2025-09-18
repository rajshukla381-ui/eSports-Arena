
import { Notification } from '@/lib/types';

let notificationsData: Notification[] = [];

// Simulate API calls
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return new Promise(resolve => setTimeout(() => {
    const userNotifications = notificationsData
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    resolve(userNotifications);
  }, 50));
};

export const addNotification = async (notification: Omit<Notification, 'id' | 'date' | 'isRead'>): Promise<Notification> => {
    const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        date: new Date().toISOString(),
        isRead: false
    };
    notificationsData.unshift(newNotification);
    return new Promise(resolve => setTimeout(() => resolve(newNotification), 50));
}

export const markNotificationAsRead = async (id: string, userId: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const notificationIndex = notificationsData.findIndex(n => n.id === id && n.userId === userId);
            if (notificationIndex > -1) {
                notificationsData[notificationIndex].isRead = true;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 50)
    });
}
