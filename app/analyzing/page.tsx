"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/context/AnalysisContext";
import ResponsiveCanvas from "@/components/ResponsiveCanvas";

const ShaderBackground = dynamic(() => import("@/components/ShaderBackground"), {
  ssr: false,
});

const STATUS_MESSAGES = [
  "Reading the motion",
  "Tracing every layer",
  "Untangling the easing curves",
];

const TOTAL_FRAMES = 144;

export default function AnalyzingPage() {
  const router = useRouter();
  const { videoFile, youtubeUrl, setResult } = useAnalysis();

  const [progress, setProgress] = useState(6);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoFile && !youtubeUrl) {
      router.replace("/");
      return;
    }

    const controller = new AbortController();

    const progressTimer = setInterval(() => {
      setProgress((current) =>
        current >= 92 ? current : current + Math.random() * 6 + 2
      );
    }, 450);

    const messageTimer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);

    const run = async () => {
      try {
        const formData = new FormData();
        if (videoFile) {
          formData.append("video", videoFile);
        } else {
          formData.append("youtubeUrl", youtubeUrl);
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Something went wrong while analyzing your clip."
          );
        }

        setProgress(100);
        setResult({ steps: data.steps ?? [], raw: data.raw });
        router.push("/results");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while analyzing your clip."
        );
      }
    };

    run();

    return () => {
      controller.abort();
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clampedProgress = Math.min(Math.round(progress), 100);
  const currentFrame = Math.min(
    Math.round((clampedProgress / 100) * TOTAL_FRAMES),
    TOTAL_FRAMES
  );
  const upcoming = [
    STATUS_MESSAGES[(messageIndex + 1) % STATUS_MESSAGES.length],
    STATUS_MESSAGES[(messageIndex + 2) % STATUS_MESSAGES.length],
  ]
    .map((message) => message.toLowerCase())
    .join(" • ");

  const clipLabel = videoFile ? videoFile.name : "YouTube clip";

  return (
    <ResponsiveCanvas width={1440}>
    <div
      data-node-label="LearnMotion Analyzing Loading State"
      className="relative z-0 flex w-[1440px] h-[861px] flex-col bg-[#FF4B14] font-['Inter'] overflow-clip mx-auto"
    >
      <ShaderBackground />
      <div
        data-node-label="Ambient Background Layers"
        className="size-full flex absolute flex-col left-0 top-0 overflow-clip"
      >
        <div
          data-node-label="Indigo Light Pool Top"
          className="flex absolute w-[900px] h-[700px] flex-col left-[320px] top-[-300px] bg-[radial-gradient(circle,_rgba(94,_106,_210,_0.16)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[120px] rounded-full"
        ></div>
        <div
          data-node-label="Cyan Light Pool Left"
          className="size-[600px] flex absolute flex-col left-[-260px] top-[380px] bg-[radial-gradient(circle,_rgba(56,_189,_248,_0.14)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[120px] rounded-full"
        ></div>
        <div
          data-node-label="Violet Light Pool Right"
          className="flex absolute w-[520px] h-[640px] flex-col top-[420px] right-[-220px] bg-[radial-gradient(circle,_rgba(167,_139,_250,_0.14)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[110px] rounded-full"
        ></div>
      </div>

      <div
        data-node-label="Top Navigation Bar"
        className="flex relative h-[72px] shrink-0 justify-center items-center px-16 py-0"
      >
        <div
          data-node-label="LearnMotion Brand Logo"
          className="flex w-fit h-fit shrink-0 items-center gap-2.5"
        >
          <div
            data-node-label="Logo Mark"
            className="size-7 flex justify-center items-center bg-[#5e6ad2] shadow-[0px_0px_16px_rgba(94,106,210,0.5)] rounded-lg"
          >
            <div data-node-label="Logo Wave Icon" className="size-4 flex flex-col text-white">
              <div data-node-label="SVG" className="size-4 flex flex-col">
                <svg
                  stroke="rgb(255, 255, 255)"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 12h-2c-.894 0 -1.662 -.857 -1.761 -2c-.296 -3.45 -.749 -6 -2.749 -6s-2.5 3.582 -2.5 8s-.5 8 -2.5 8s-2.452 -2.547 -2.749 -6c-.1 -1.147 -.867 -2 -1.763 -2h-2"
                    fill="none"
                    stroke="rgb(255, 255, 255)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2px"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div
            data-node-label="Brand Wordmark"
            className="text-[#16181f] font-['Inter'] text-base font-semibold tracking-[-0.4px] [display:inline-block] [overflow-wrap:normal]"
          >
            LearnMotion
          </div>
        </div>
      </div>

      <div
        data-node-label="Analyzing Stage"
        className="flex relative flex-col justify-center items-center flex-1 px-16 py-0 gap-6"
      >
        {error ? (
          <div
            data-node-label="Analysis Error Card"
            className="flex w-[640px] h-fit flex-col items-center text-center bg-[#fafafa] shadow-[0px_0px_0px_1px_rgba(94,106,210,0.18),0px_12px_40px_rgba(30,40,90,0.08),0px_0px_80px_rgba(94,106,210,0.1)] rounded-2xl p-8 gap-6"
          >
            <div className="size-14 flex justify-center items-center bg-[#fbe9ea] rounded-xl">
              <svg
                stroke="rgb(200, 69, 90)"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[26px]"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <div className="text-[#16181f] font-['Inter'] text-xl font-semibold tracking-[-0.4px]">
                Analysis failed
              </div>
              <div className="text-[#5b6070] font-['Inter'] text-sm leading-relaxed max-w-[440px]">
                {error}
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-11 items-center bg-[#5e6ad2] shadow-[0px_4px_14px_rgba(94,106,210,0.35),inset_0px_1px_0px_rgba(255,255,255,0.25)] rounded-lg px-6"
            >
              <span className="text-white font-['Inter'] text-sm font-medium">
                Try again
              </span>
            </button>
          </div>
        ) : (
          <>
            <div
              data-node-label="Analysis Progress Card"
              className="flex relative w-[640px] h-fit flex-col scale-[1.20625] bg-[#fafafa] shadow-[0px_0px_0px_1px_rgba(94,106,210,0.18),0px_12px_40px_rgba(30,40,90,0.08),0px_0px_80px_rgba(94,106,210,0.1)] rounded-2xl p-8 gap-6"
            >
              <div data-node-label="Clip Meta Row" className="flex w-full h-fit justify-between items-center">
                <div data-node-label="Clip Name Group" className="flex items-center gap-2.5">
                  <div
                    data-node-label="Clip Icon Bubble"
                    className="size-8 flex justify-center items-center bg-[#5e6ad214] rounded-lg"
                  >
                    <div data-node-label="SVG" className="size-[15px] flex flex-col text-[#5e6ad2]">
                      <svg
                        stroke="rgb(94, 106, 210)"
                        fill="none"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                        <line x1="7" y1="2" x2="7" y2="22"></line>
                        <line x1="17" y1="2" x2="17" y2="22"></line>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <line x1="2" y1="7" x2="7" y2="7"></line>
                        <line x1="2" y1="17" x2="7" y2="17"></line>
                        <line x1="17" y1="17" x2="22" y2="17"></line>
                        <line x1="17" y1="7" x2="22" y2="7"></line>
                      </svg>
                    </div>
                  </div>
                  <div
                    data-node-label="Clip File Name"
                    className="text-[#16181f] font-['Inter'] text-sm font-medium [display:inline-block] [overflow-wrap:normal]"
                  >
                    {clipLabel}
                  </div>
                </div>
                <div
                  data-node-label="Analyzing Badge"
                  className="flex h-6 items-center bg-[#5e6ad214] border-t border-b border-l border-r rounded-full px-2.5 py-0 gap-1.5 border-[#5e6ad233]"
                >
                  <div
                    data-node-label="Analyzing Pulse Dot"
                    className="size-1.5 flex flex-col bg-[#5e6ad2] rounded-full animate-pulse"
                  ></div>
                  <div
                    data-node-label="Analyzing Badge Label"
                    className="text-[#5e6ad2] font-['Inter'] text-[11px] leading-normal [display:inline-block] [overflow-wrap:normal]"
                  >
                    Analyzing
                  </div>
                </div>
              </div>

              <div
                data-node-label="Motion Wave Visual"
                className="flex w-full h-[140px] flex-col justify-center items-center bg-[#f4f6fc] rounded-xl overflow-clip"
              >
                <div data-node-label="Wave Trace Graphic" className="flex w-[576px] h-[120px] flex-col shrink-0">
                  <div data-node-label="SVG" className="flex w-[576px] h-[120px] flex-col">
                    <svg viewBox="0 0 576 120">
                      <path
                        d="M0,95 C90,95 110,25 190,25 C270,25 290,88 370,88 C450,88 470,18 576,18"
                        fill="none"
                        stroke="rgba(94,106,210,0.6)"
                        strokeWidth="2"
                      ></path>
                      <path
                        d="M0,105 C100,105 130,45 210,45 C290,45 310,100 390,100 C470,100 490,40 576,40"
                        fill="none"
                        stroke="rgba(94,106,210,0.22)"
                        strokeWidth="1.5"
                      ></path>
                      <circle cx="190" cy="25" r="5" fill="#5E6AD2"></circle>
                      <circle cx="370" cy="88" r="4" fill="rgba(94,106,210,0.7)"></circle>
                      <circle cx="500" cy="55" r="3.5" fill="rgba(56,189,248,0.8)"></circle>
                      <line
                        x1="288"
                        y1="0"
                        x2="288"
                        y2="120"
                        stroke="rgba(94,106,210,0.3)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      ></line>
                    </svg>
                  </div>
                </div>
              </div>

              <div data-node-label="Status Phrase Stack" className="flex w-full h-fit flex-col items-center gap-1.5">
                <div data-node-label="Active Status Row" className="flex items-center gap-2">
                  <div data-node-label="SVG" className="size-[18px] flex flex-col text-[#5e6ad2]">
                    <svg
                      stroke="rgb(94, 106, 210)"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 12h4l3 8l4 -16l3 8h4"></path>
                    </svg>
                  </div>
                  <div
                    data-node-label="Active Status Phrase"
                    className="text-[#16181f] font-['Inter'] text-xl font-semibold tracking-[-0.4px] [display:inline-block] [overflow-wrap:normal]"
                  >
                    {STATUS_MESSAGES[messageIndex]}…
                  </div>
                </div>
                <div
                  data-node-label="Next Status Phrase"
                  className="text-[#9aa0ad] font-['Inter'] text-[13px] leading-normal [display:inline-block] [overflow-wrap:normal]"
                >
                  up next: {upcoming}
                </div>
              </div>

              <div data-node-label="Progress Indicator Group" className="flex w-full h-fit flex-col gap-2">
                <div
                  data-node-label="Progress Track"
                  className="flex w-full h-1.5 flex-col bg-[#eceef5] rounded-full overflow-clip"
                >
                  <div
                    data-node-label="Progress Fill"
                    style={{ width: `${clampedProgress}%` }}
                    className="flex h-full flex-col bg-[linear-gradient(90deg,_rgb(94,_106,_210)_0%,_rgb(124,_136,_232)_100%)] shadow-[0px_0px_12px_rgba(94,106,210,0.4)] rounded-full transition-[width] duration-500 ease-out"
                  ></div>
                </div>
                <div data-node-label="Progress Meta Row" className="flex justify-between items-center">
                  <div
                    data-node-label="Progress Frames Text"
                    className="text-[#9aa0ad] font-['Inter'] text-xs [display:inline-block] [overflow-wrap:normal]"
                  >
                    frame {currentFrame} of {TOTAL_FRAMES}
                  </div>
                  <div
                    data-node-label="Progress Percent Text"
                    className="text-[#5e6ad2] font-['Inter'] text-xs font-medium [display:inline-block] [overflow-wrap:normal]"
                  >
                    {clampedProgress}%
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div data-node-label="Reassurance Footer Row" className="flex relative h-16 shrink-0 justify-center items-center">
        <div data-node-label="Reassurance Text Wrap" className="flex w-fit h-fit flex-col">
          <div
            data-node-label="Reassurance Text"
            className="text-[#f0f2f2] font-['Inter'] text-xs tracking-[0.3px] [display:inline-block] [overflow-wrap:normal]"
          >
            Usually done in about a minute — your clip stays private the whole time
          </div>
        </div>
      </div>
    </div>
    </ResponsiveCanvas>
  );
}
