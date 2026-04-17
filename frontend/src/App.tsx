import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import FeedbackPage from './pages/FeedbackPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import TicketPage from './pages/TicketPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/tickets" element={<TicketPage />} />
            <Route path="/ai" element={<AIAnalysisPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
