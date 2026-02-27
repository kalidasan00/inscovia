// backend/src/controllers/notification.controller.js
import prisma from "../lib/prisma.js";

// Get notifications for logged-in institute
export const getMyNotifications = async (req, res) => {
  try {
    const instituteId = req.userId;

    const notifications = await prisma.notification.findMany({
      where: { instituteId },
      orderBy: { createdAt: "desc" }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark one as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const instituteId = req.userId;

    await prisma.notification.update({
      where: { id, instituteId },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// Mark all as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const instituteId = req.userId;

    await prisma.notification.updateMany({
      where: { instituteId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};