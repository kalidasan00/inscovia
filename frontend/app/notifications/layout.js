// app/notifications/layout.js
// ✅ Private/auth page — should NOT be indexed by Google
export const metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({ children }) {
  return children;
}