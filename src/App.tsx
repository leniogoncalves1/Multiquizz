import React, { useEffect, useState } from 'react';
import { CategoryWithCount, ProcessedQuestion, QuizMode, Screen, UserAnswer } from './types/quiz';
import { Activity, ActivityItem, ActivityTarget } from './types/activity';
import { fetchQuizData, prepareCategoryQuestions } from './services/quizService';
import {
  getCategoriesWithActivities,
  getActivitiesByCategory,
  getActivityTargets,
  getActivityItems,
} from './services/activityService';
import { Header } from './components/common/Header';
import { HomeScreen } from './components/screens/HomeScreen';
import { CategoryScreen } from './components/screens/CategoryScreen';
import { QuestionScreen } from './components/screens/QuestionScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { ActivityCategoryScreen } from './components/activities/ActivityCategoryScreen';
import { ActivityListScreen } from './components/activities/ActivityListScreen';
import { AssociarActivityScreen } from './components/activities/AssociarActivityScreen';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'remote' | 'fallback'>('fallback');
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  // Dark mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('multiquizz_theme');
      if (saved) return saved === 'dark';
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('multiquizz_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('multiquizz_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Data from backend proxy
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [activityTargets, setActivityTargets] = useState<ActivityTarget[]>([]);

  // Quiz navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentMode, setCurrentMode] = useState<QuizMode>('quiz');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<ProcessedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  // Activities navigation state
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Initial data loading
  const loadData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchQuizData(forceRefresh);
      setCategories(data.categories);
      setAllQuestions(data.questions);
      if (data.atividades) setActivities(data.atividades);
      if (data.itensAtividade) setActivityItems(data.itensAtividade);
      if (data.alvosAtividade) setActivityTargets(data.alvosAtividade);
      setDataSource(data.source || 'fallback');
      setSyncWarning(data.warning || null);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Não foi possível carregar os dados do questionário.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Handlers for Quiz
  const handleStart = (mode: QuizMode = 'quiz') => {
    setCurrentMode(mode);
    setCurrentScreen('categories');
  };

  // Handlers for Activities Module
  const handleOpenActivities = () => {
    setCurrentScreen('activity-categories');
  };

  const handleSelectActivityCategory = (catName: string) => {
    setSelectedActivityCategory(catName);
    setCurrentScreen('activity-list');
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentScreen('activity-play');
  };

  const handleBackFromActivityList = () => {
    setSelectedActivityCategory(null);
    setCurrentScreen('activity-categories');
  };

  const handleBackFromActivityPlay = () => {
    setSelectedActivity(null);
    setCurrentScreen('activity-list');
  };

  const handleRefreshFromSheet = () => {
    loadData(true);
  };

  const handleSelectCategory = (
    categoryName: string,
    mode: QuizMode,
    isRandom: boolean
  ) => {
    if (!categoryName) return;

    const prepared = prepareCategoryQuestions(allQuestions, categoryName);
    if (prepared.length === 0) {
      console.warn(`Nenhuma questão encontrada para a categoria ${categoryName}`);
      return;
    }

    setSelectedCategoryName(categoryName);
    setCurrentMode(mode);
    setActiveQuestions(prepared);
    setCurrentIndex(0);
    setAnswers({});
    setCurrentScreen('quiz');
  };

  const handleNextQuestion = (answer: UserAnswer) => {
    const updatedAnswers = {
      ...answers,
      [answer.questionId]: answer,
    };
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all questions
      setCurrentScreen('result');
    }
  };

  const handleReview = () => {
    setCurrentScreen('review');
  };

  const handleBackToResult = () => {
    setCurrentScreen('result');
  };

  const handleRestart = () => {
    // Reset state and return to category selection
    setActiveQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedCategoryName(null);
    setSelectedActivityCategory(null);
    setSelectedActivity(null);
    setCurrentScreen('categories');
  };

  const handleHomeClick = () => {
    handleRestart();
    setCurrentScreen('home');
  };

  // Calculate scores for Result screen
  const correctCount = Object.values(answers).filter((a: UserAnswer) => a.isCorrect).length;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDarkMode ? 'dark bg-neutral-900 text-neutral-100' : 'bg-neutral-50 text-neutral-900'
      } selection:bg-emerald-200`}
    >
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        mode={currentScreen === 'quiz' || currentScreen === 'result' ? currentMode : undefined}
        categoryName={
          selectedCategoryName ||
          selectedActivity?.titulo ||
          selectedActivityCategory ||
          undefined
        }
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onHomeClick={handleHomeClick}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {error ? (
          <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-8 ring-amber-50/50 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-950/40">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Aviso de Carregamento</h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed dark:text-neutral-300">{error}</p>
            <button
              type="button"
              onClick={() => loadData(true)}
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        ) : (
          <>
            {currentScreen === 'home' && (
              <HomeScreen
                onStart={handleStart}
                onOpenActivities={handleOpenActivities}
                isLoading={loading}
              />
            )}

            {currentScreen === 'categories' && (
              <CategoryScreen
                categories={categories}
                initialMode={currentMode}
                onSelectCategory={handleSelectCategory}
                onBack={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'quiz' && activeQuestions.length > 0 && (
              <QuestionScreen
                key={activeQuestions[currentIndex]?.id || currentIndex}
                question={activeQuestions[currentIndex]}
                currentIndex={currentIndex}
                totalQuestions={activeQuestions.length}
                mode={currentMode}
                onNextQuestion={handleNextQuestion}
              />
            )}

            {currentScreen === 'result' && (
              <ResultScreen
                categoryName={selectedCategoryName || 'Procedimento Cirúrgico'}
                correctCount={correctCount}
                totalQuestions={activeQuestions.length}
                onReview={handleReview}
                onRestart={handleRestart}
              />
            )}

            {currentScreen === 'review' && (
              <ReviewScreen
                categoryName={selectedCategoryName || 'Procedimento Cirúrgico'}
                questions={activeQuestions}
                answers={answers}
                onBackToResult={handleBackToResult}
                onRestart={handleRestart}
              />
            )}

            {/* ATIVIDADES MODULE SCREENS */}
            {currentScreen === 'activity-categories' && (
              <ActivityCategoryScreen
                categories={getCategoriesWithActivities(categories, activities)}
                onSelectCategory={handleSelectActivityCategory}
                onBack={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'activity-list' && selectedActivityCategory && (
              <ActivityListScreen
                categoryName={selectedActivityCategory}
                activities={getActivitiesByCategory(activities, selectedActivityCategory)}
                onSelectActivity={handleSelectActivity}
                onBack={handleBackFromActivityList}
              />
            )}

            {currentScreen === 'activity-play' && selectedActivity && (
              <AssociarActivityScreen
                activity={selectedActivity}
                targets={getActivityTargets(activityTargets, selectedActivity.id)}
                items={getActivityItems(activityItems, selectedActivity.id)}
                onBack={handleBackFromActivityPlay}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
