"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizState {
  // Current exam answers: { [questionId]: "A" | "B" | "C" | "D" }
  answers: Record<number, string>;
  // Current question index (0-based)
  currentQuestion: number;
  // Timer remaining seconds
  timeRemaining: number;
  // Whether the exam has been submitted
  isSubmitted: boolean;
  // The exam ID being taken
  examId: number | null;
  // Whether the exam has actually started (past lobby)
  isStarted: boolean;

  // Actions
  setAnswer: (questionId: number, answer: string) => void;
  setCurrentQuestion: (index: number) => void;
  setTimeRemaining: (seconds: number) => void;
  decrementTime: () => void;
  setSubmitted: (val: boolean) => void;
  startExam: () => void;
  initExam: (examId: number, totalQuestions: number, minutesPerQuestion?: number) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      answers: {},
      currentQuestion: 0,
      timeRemaining: 0,
      isSubmitted: false,
      examId: null,
      isStarted: false,

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),

      setCurrentQuestion: (index) => set({ currentQuestion: index }),

      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

      decrementTime: () =>
        set((state) => ({
          timeRemaining: Math.max(0, state.timeRemaining - 1),
        })),

      setSubmitted: (val) => set({ isSubmitted: val }),
      
      startExam: () => set({ isStarted: true }),

      initExam: (examId, totalQuestions, minutesPerQuestion = 1.5) => {
        const currentState = get();
        // If resuming the same exam, keep existing answers
        if (currentState.examId === examId && !currentState.isSubmitted) {
          return;
        }
        // New exam
        set({
          examId,
          answers: {},
          currentQuestion: 0,
          timeRemaining: Math.ceil(totalQuestions * minutesPerQuestion * 60),
          isSubmitted: false,
          isStarted: false,
        });
      },

      resetQuiz: () =>
        set({
          answers: {},
          currentQuestion: 0,
          timeRemaining: 0,
          isSubmitted: false,
          examId: null,
          isStarted: false,
        }),
    }),
    {
      name: "quiz-store",
      version: 1, // Clear corrupted state from previous iterations
      // Only persist answers and examId to survive page reloads
      partialize: (state) => ({
        answers: state.answers,
        currentQuestion: state.currentQuestion,
        timeRemaining: state.timeRemaining,
        isSubmitted: state.isSubmitted,
        examId: state.examId,
        isStarted: state.isStarted,
      }),
    }
    }
  )
);

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  nickname?: string;
  gender?: string;
  status?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  
  // Guest/Lobby state
  lobbyNickname: string;
  lobbyAvatar: string;

  setAuth: (token: string, user: UserProfile) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
  setLobbyInfo: (nickname: string, avatar: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      lobbyNickname: "",
      lobbyAvatar: "/avatars/avatar1.png",

      setAuth: (token, user) => set({ token, user }),
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => set({ token: null, user: null }),
      
      setLobbyInfo: (nickname, avatar) => set({ lobbyNickname: nickname, lobbyAvatar: avatar }),
    }),
    {
      name: "auth-store",
    }
  )
);

