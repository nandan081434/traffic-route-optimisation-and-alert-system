/**
 * SmartRoute - Notification Service
 */

let notifications = [
  {
    id: "notif-01",
    type: "SYSTEM",
    title: "SmartRoute Online",
    message: "Live road intelligence engine initialized with simulated sensor kits.",
    severity: "INFO",
    timestamp: new Date().toISOString(),
    read: false
  }
];

export function getAllNotifications() {
  return notifications;
}

export function createNotification({ type, title, message, severity = 'INFO', data = null }) {
  const notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    severity,
    data,
    timestamp: new Date().toISOString(),
    read: false
  };

  notifications.unshift(notification);
  if (notifications.length > 50) {
    notifications.pop();
  }

  return notification;
}

export function markAsRead(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif) notif.read = true;
  return notif;
}

export function clearNotifications() {
  notifications = [];
  return true;
}
