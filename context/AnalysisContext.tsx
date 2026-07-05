"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface AnalysisStepProperty {
  property: string;
  initialValue: string;
  toValue: string;
}

export interface AnalysisStep {
  step: number;
  title: string;
  element: string;
  animationType: string;
  properties: AnalysisStepProperty[];
  duration: string;
  easing: string;
  delay: string;
  clipTimestamp: string;
  confidence: number;
  notes: string;
  instruction: string;
}

export interface AnalysisResult {
  steps: AnalysisStep[];
  raw?: string;
}

interface AnalysisContextValue {
  videoFile: File | null;
  youtubeUrl: string;
  result: AnalysisResult | null;
  setSource: (source: { videoFile?: File | null; youtubeUrl?: string }) => void;
  setResult: (result: AnalysisResult | null) => void;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [result, setResultState] = useState<AnalysisResult | null>(null);

  const setSource = ({
    videoFile: file,
    youtubeUrl: url,
  }: {
    videoFile?: File | null;
    youtubeUrl?: string;
  }) => {
    setVideoFile(file ?? null);
    setYoutubeUrl(url ?? "");
  };

  const setResult = (next: AnalysisResult | null) => setResultState(next);

  const reset = () => {
    setVideoFile(null);
    setYoutubeUrl("");
    setResultState(null);
  };

  return (
    <AnalysisContext.Provider
      value={{ videoFile, youtubeUrl, result, setSource, setResult, reset }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return ctx;
}
