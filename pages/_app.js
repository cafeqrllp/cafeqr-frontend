import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import SubscriptionGate from '../components/SubscriptionGate';
import GlobalUI from '../components/GlobalUI';
import PwaLifecycle from '../components/PwaLifecycle';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SubscriptionGate>
          <Component {...pageProps} />
        </SubscriptionGate>
        <PwaLifecycle />
        <GlobalUI />
      </NotificationProvider>
    </AuthProvider>
  );
}
