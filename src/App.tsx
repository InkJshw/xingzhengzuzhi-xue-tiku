import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';

export default function App() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:mode" element={<QuizPage />} />
      </Routes>
    </div>
  );
}
