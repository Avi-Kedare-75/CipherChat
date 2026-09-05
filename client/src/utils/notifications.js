/**
 * 🔔 Native Web Notifications Helper
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendDesktopNotification = (title, body, icon = '/favicon.ico') => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted' && document.hidden) {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: icon,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('Desktop notification failed:', e);
    }
  }
};
