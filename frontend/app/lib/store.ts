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

  // Actions
  setAnswer: (questionId: number, answer: string) => void;
  setCurrentQuestion: (index: number) => void;
  setTimeRemaining: (seconds: number) => void;
  decrementTime: () => void;
  setSubmitted: (val: boolean) => void;
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
        });
      },

      resetQuiz: () =>
        set({
          answers: {},
          currentQuestion: 0,
          timeRemaining: 0,
          isSubmitted: false,
          examId: null,
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
      }),
    }
  )
);
