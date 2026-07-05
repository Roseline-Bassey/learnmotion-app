"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/context/AnalysisContext";
import ResponsiveCanvas from "@/components/ResponsiveCanvas";

const ShaderBackground = dynamic(() => import("@/components/ShaderBackground"), {
  ssr: false,
});

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function parseTimestampToSeconds(value: string): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  const mmss = trimmed.match(/^(\d+):(\d+(?:\.\d+)?)$/);
  if (mmss) {
    return parseInt(mmss[1], 10) * 60 + parseFloat(mmss[2]);
  }
  const secOnly = trimmed.match(/^(\d+(?:\.\d+)?)s?$/);
  if (secOnly) {
    return parseFloat(secOnly[1]);
  }
  return null;
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}

export default function ResultsPage() {
  const router = useRouter();
  const { videoFile, youtubeUrl, result, reset } = useAnalysis();
  const [copyLabel, setCopyLabel] = useState("Copy as code snippet");
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (!videoFile) {
      setVideoObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (videoFile || !youtubeUrl) return;
    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) return;

    const createPlayer = () => {
      youtubePlayerRef.current = new window.YT.Player("learnmotion-yt-player", {
        videoId,
        playerVars: { rel: 0 },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        createPlayer();
      };
    }

    return () => {
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeUrl, videoFile]);

  if (!result) return null;

  const steps = result.steps ?? [];
  const clipLabel = videoFile ? videoFile.name : youtubeUrl || "your clip";

  const handleSeek = (clipTimestamp: string) => {
    const seconds = parseTimestampToSeconds(clipTimestamp);
    if (seconds === null) return;
    if (videoObjectUrl && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    } else if (youtubePlayerRef.current?.seekTo) {
      youtubePlayerRef.current.seekTo(seconds, true);
      youtubePlayerRef.current.playVideo();
    }
  };

  const toggleDetails = (event: React.MouseEvent, stepNumber: number) => {
    event.stopPropagation();
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const text = steps
      .map(
        (step) =>
          `Step ${step.step}: ${step.title}\n` +
          `  Clip timestamp: ${step.clipTimestamp}\n` +
          `  Element: ${step.element}\n` +
          `  Animation type: ${step.animationType}\n` +
          step.properties
            .map((prop) => `  ${prop.property}: ${prop.initialValue} → ${prop.toValue}\n`)
            .join("") +
          `  Duration: ${step.duration}\n` +
          `  Easing: ${step.easing}\n` +
          `  Delay: ${step.delay}\n` +
          `  Confidence: ${step.confidence}%\n` +
          (step.notes ? `  Notes: ${step.notes}\n` : "") +
          `  ${step.instruction}`
      )
      .join("\n\n");
    await navigator.clipboard.writeText(text || result.raw || "");
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy as code snippet"), 1500);
  };

  const handleNewClip = () => {
    reset();
    router.push("/");
  };

  return (
    <ResponsiveCanvas width={1440}>
    <div
      data-node-label="LearnMotion Breakdown Results Page"
      className="relative z-0 flex w-[1440px] h-fit flex-col bg-[#FF4B14] font-['Inter'] overflow-clip mx-auto"
    >
      <ShaderBackground />
      <div
        data-node-label="Light Background Layers"
        className="size-full flex absolute flex-col left-0 top-0 overflow-clip"
      >
        <div
          data-node-label="Indigo Light Pool Top"
          className="flex absolute w-[900px] h-[700px] flex-col left-[320px] top-[-300px] bg-[radial-gradient(circle,_rgba(94,_106,_210,_0.14)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[120px] rounded-full"
        ></div>
        <div
          data-node-label="Cyan Light Pool Left"
          className="size-[600px] flex absolute flex-col left-[-260px] top-[420px] bg-[radial-gradient(circle,_rgba(56,_189,_248,_0.12)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[120px] rounded-full"
        ></div>
        <div
          data-node-label="Motion Wave Trace"
          className="flex absolute w-full h-[520px] flex-col left-0 top-[180px] overflow-hidden"
        >
          <div data-node-label="SVG" className="size-full flex flex-col">
            <div
              data-node-label="SVG"
              className="flex w-full max-w-none h-[520px] flex-col"
            >
              <svg viewBox="0 0 1440 520">
                <path
                  d="M0,420 C240,420 300,120 480,120 C660,120 700,380 900,380 C1100,380 1180,80 1440,80"
                  fill="none"
                  stroke="#5E6AD2"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M0,460 C260,460 340,200 520,200 C700,200 760,440 960,440 C1160,440 1240,160 1440,160"
                  fill="none"
                  stroke="#5E6AD2"
                  strokeWidth="1"
                ></path>
                <circle cx="480" cy="120" r="4" fill="#5E6AD2"></circle>
                <circle cx="900" cy="380" r="3" fill="#5E6AD2"></circle>
                <circle cx="1180" cy="180" r="3" fill="#5E6AD2"></circle>
              </svg>
            </div>
          </div>
        </div>
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
            className="size-7 flex justify-center items-center bg-[#5e6ad2] shadow-[0px_2px_12px_rgba(94,106,210,0.35)] rounded-lg"
          >
            <div data-node-label="SVG" className="size-4 flex flex-col">
              <svg
                stroke="rgb(255, 255, 255)"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
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
          <div
            data-node-label="Brand Wordmark"
            className="text-[#16181f] font-['Inter'] text-base font-semibold tracking-[-0.4px] [display:inline-block] [overflow-wrap:normal]"
          >
            LearnMotion
          </div>
        </div>
      </div>

      <div
        data-node-label="Results Header Row"
        className="flex relative h-[121px] shrink-0 items-center pt-8 pb-6 px-16 gap-4"
      >
        <div data-node-label="Clip Meta Block" className="flex h-fit flex-col flex-1 gap-1.5">
          <div data-node-label="Clip Title Row" className="flex items-center gap-3">
            <div
              data-node-label="Clip Title"
              className="text-[#16181f] font-['Inter'] text-[26px] font-semibold leading-normal tracking-[-0.65px] [display:inline-block] [overflow-wrap:normal]"
            >
              {clipLabel}
            </div>
            <div
              data-node-label="Analysis Complete Badge"
              className="flex h-6 items-center bg-[#f5f5f5] border-t border-b border-l border-r rounded-full px-2.5 py-0 gap-1.5 border-[#bfe3cf]"
            >
              <div data-node-label="SVG" className="size-3 flex flex-col">
                <svg
                  stroke="rgb(46, 143, 90)"
                  fill="none"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div
                data-node-label="Analysis Complete Label"
                className="text-[#2e8f5a] font-['Inter'] text-[11px] font-medium leading-normal [display:inline-block] [overflow-wrap:normal]"
              >
                Analysis complete
              </div>
            </div>
          </div>
          <div
            data-node-label="Clip Meta Line"
            className="text-[#fafafa] font-['Inter'] text-[13px] leading-normal [display:inline-block] [overflow-wrap:normal]"
          >
            {steps.length} step{steps.length === 1 ? "" : "s"} traced · analyzed just now
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          data-node-label="Copy Code Snippet Button"
          className="flex w-fit h-11 shrink-0 items-center bg-[#5e6ad2] shadow-[0px_2px_10px_rgba(94,106,210,0.3),inset_0px_1px_0px_rgba(255,255,255,0.25)] rounded-lg px-5 py-0 gap-2"
        >
          <div data-node-label="SVG" className="size-4 flex flex-col">
            <svg
              stroke="rgb(255,255,255)"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <div
            data-node-label="Copy Code Button Label"
            className="text-white font-['Inter'] text-sm font-medium [display:inline-block] [overflow-wrap:normal]"
          >
            {copyLabel}
          </div>
        </button>
        <button
          type="button"
          onClick={handleNewClip}
          data-node-label="New Clip Button"
          className="flex w-fit h-11 shrink-0 items-center bg-white border-t border-b border-l border-r shadow-[0px_1px_4px_rgba(20,24,45,0.06)] rounded-lg px-5 py-0 gap-2 border-[#e2e5ee]"
        >
          <div className="size-4 flex flex-col">
            <svg
              stroke="rgb(61, 64, 72)"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div className="text-[#3d4048] font-['Inter'] text-sm font-medium [display:inline-block] [overflow-wrap:normal]">
            New clip
          </div>
        </button>
      </div>

      <div
        data-node-label="Results Body Columns"
        className="flex relative h-fit shrink-0 items-start pt-2 pb-16 px-16 gap-10"
      >
        <div
          data-node-label="Video Preview Panel"
          className="flex w-[520px] h-fit flex-col shrink-0 bg-white shadow-[0px_0px_0px_1px_rgba(94,106,210,0.12),0px_8px_32px_rgba(64,78,148,0.1)] rounded-2xl p-5 gap-4"
        >
          <div
            data-node-label="Video Thumbnail Frame"
            className="flex relative w-full h-[290px] flex-col justify-center items-center bg-black rounded-xl overflow-clip"
          >
            {videoObjectUrl ? (
              <video
                ref={videoRef}
                src={videoObjectUrl}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : youtubeUrl ? (
              <div id="learnmotion-yt-player" className="w-full h-full" />
            ) : (
              <div className="text-[#7a7f8c] font-['Inter'] text-sm">
                Preview unavailable
              </div>
            )}
          </div>
          <div data-node-label="Timeline Scrubber Row" className="flex w-full h-fit items-center gap-3">
            <div
              data-node-label="Scrubber Start Time"
              className="shrink-0 text-[#7a7f8c] font-['Inter'] text-[11px] leading-normal [display:inline-block] [overflow-wrap:normal]"
            >
              0.0s
            </div>
            <div data-node-label="Scrubber Track" className="flex relative h-1.5 bg-[#e6e9f2] flex-1 rounded-full">
              <div
                data-node-label="Scrubber Step Markers"
                className="size-full flex absolute justify-between items-center px-1 py-0"
              >
                {steps.slice(0, 6).map((step) => (
                  <div
                    key={step.step}
                    data-node-label={`Marker Step ${step.step}`}
                    className="size-2 flex shrink-0 bg-[#5e6ad2] rounded-full"
                  ></div>
                ))}
              </div>
            </div>
            <div
              data-node-label="Scrubber End Time"
              className="shrink-0 text-[#7a7f8c] font-['Inter'] text-[11px] leading-normal [display:inline-block] [overflow-wrap:normal]"
            >
              2.4s
            </div>
          </div>
        </div>

        <div data-node-label="Breakdown Steps Column" className="flex h-fit flex-col flex-1 gap-3">
          <div
            data-node-label="Steps Column Heading"
            className="text-[#16181f] font-['Inter'] text-[15px] font-semibold leading-normal tracking-[-0.2px] [display:inline-block] [overflow-wrap:normal]"
          >
            Step-by-step breakdown
          </div>

          {steps.length > 0 ? (
            <div data-node-label="Breakdown Step Cards List" className="flex w-full h-fit flex-col gap-3">
              {steps.map((step) => {
                const isExpanded = expandedSteps.has(step.step);
                return (
                  <div
                    key={step.step}
                    data-node-label={`Step Card ${step.title}`}
                    onClick={() => handleSeek(step.clipTimestamp)}
                    role="button"
                    tabIndex={0}
                    className="flex w-full flex-col bg-white shadow-[0px_0px_0px_1px_rgba(94,106,210,0.1),0px_2px_12px_rgba(64,78,148,0.07)] rounded-xl p-3 gap-2 cursor-pointer hover:shadow-[0px_0px_0px_1px_rgba(94,106,210,0.3),0px_4px_16px_rgba(64,78,148,0.12)] transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        data-node-label="Step Number Bubble"
                        className="size-9 flex shrink-0 justify-center items-center bg-[#eef0fb] rounded-full"
                      >
                        <div className="text-[#5e6ad2] font-['Inter'] text-[13px] font-semibold leading-normal [display:inline-block] [overflow-wrap:normal]">
                          {step.step}
                        </div>
                      </div>
                      <div data-node-label="Step Detail Column" className="flex flex-col flex-1 gap-0.5">
                        <div className="text-[#16181f] font-['Inter'] text-[15px] font-semibold leading-normal tracking-[-0.2px] [display:inline-block] [overflow-wrap:normal]">
                          {step.title}
                        </div>
                        <div className="text-[#5b6070] font-['Inter'] text-[13px] leading-relaxed [display:inline-block] [overflow-wrap:normal]">
                          {step.instruction}
                        </div>
                      </div>
                      <div
                        data-node-label="Step Badge Row"
                        className="flex items-center shrink-0 gap-1.5"
                      >
                        <div className="flex h-6 items-center bg-[#5e6ad214] border-t border-b border-l border-r rounded-full px-2.5 py-0 border-[#5e6ad233]">
                          <div className="text-[#5e6ad2] font-['Inter'] text-[11px] font-medium leading-normal [display:inline-block] [overflow-wrap:normal]">
                            {step.clipTimestamp}
                          </div>
                        </div>
                        <div className="flex h-6 items-center bg-[#f4f6fc] border-t border-b border-l border-r rounded-full px-2.5 py-0 border-[#e6e9f2]">
                          <div className="text-[#6a708c] font-['Inter'] text-[11px] leading-normal [display:inline-block] [overflow-wrap:normal]">
                            {step.easing}
                          </div>
                        </div>
                        <div className="text-[#c0c4cd] font-['Inter'] text-[10px] leading-normal [display:inline-block] [overflow-wrap:normal]">
                          {step.confidence}% confidence
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => toggleDetails(event, step.step)}
                      data-node-label="Step Details Toggle"
                      className="flex items-center self-start ml-[48px] gap-1 text-[#9aa0ad] hover:text-[#5e6ad2]"
                    >
                      <svg
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`size-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      <span className="font-['Inter'] text-[11px] leading-normal">
                        Details
                      </span>
                    </button>

                    {isExpanded && (
                      <div
                        data-node-label="Step Keyframe Grid"
                        className="grid grid-cols-2 gap-x-6 gap-y-1.5 ml-[48px]"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="text-[#9aa0ad] font-['Inter'] text-[10px] font-medium leading-normal tracking-[0.6px]">
                            ELEMENT
                          </div>
                          <div className="text-[#5b6070] font-['Inter'] text-xs leading-normal">
                            {step.element}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-[#9aa0ad] font-['Inter'] text-[10px] font-medium leading-normal tracking-[0.6px]">
                            ANIMATION TYPE
                          </div>
                          <div className="text-[#5b6070] font-['Inter'] text-xs leading-normal">
                            {step.animationType}
                          </div>
                        </div>
                        <div className="col-span-2 flex flex-col gap-0.5">
                          <div className="text-[#9aa0ad] font-['Inter'] text-[10px] font-medium leading-normal tracking-[0.6px]">
                            PROPERTIES
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {step.properties.map((prop, index) => (
                              <div
                                key={index}
                                className="text-[#5b6070] font-['Inter'] text-xs leading-normal capitalize"
                              >
                                {prop.property}: {prop.initialValue} → {prop.toValue}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-[#9aa0ad] font-['Inter'] text-[10px] font-medium leading-normal tracking-[0.6px]">
                            DURATION
                          </div>
                          <div className="text-[#5b6070] font-['Inter'] text-xs leading-normal">
                            {step.duration}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-[#9aa0ad] font-['Inter'] text-[10px] font-medium leading-normal tracking-[0.6px]">
                            DELAY
                          </div>
                          <div className="text-[#5b6070] font-['Inter'] text-xs leading-normal">
                            {step.delay}
                          </div>
                        </div>
                        {step.notes && (
                          <div
                            data-node-label="Step Notes"
                            className="col-span-2 flex items-start bg-[#fbf4e9] border-t border-b border-l border-r rounded-lg px-3 py-2 gap-2 border-[#f0e2c8]"
                          >
                            <div className="text-[#8a6d1f] font-['Inter'] text-xs leading-relaxed">
                              {step.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              data-node-label="Raw Analysis Fallback"
              className="flex w-full flex-col bg-white shadow-[0px_0px_0px_1px_rgba(94,106,210,0.1),0px_2px_12px_rgba(64,78,148,0.07)] rounded-xl p-4 gap-2"
            >
              <div className="text-[#16181f] font-['Inter'] text-[13px] font-medium leading-normal">
                Couldn&apos;t parse a structured breakdown — here&apos;s the raw
                analysis:
              </div>
              <pre className="whitespace-pre-wrap text-[#5b6070] font-['Inter'] text-[13px] leading-relaxed">
                {result.raw || "No analysis text was returned."}
              </pre>
            </div>
          )}

          <div data-node-label="Export Hint Row" className="flex items-center mt-1 mb-0 mx-0 gap-2">
            <div data-node-label="SVG" className="size-3.5 flex flex-col shrink-0">
              <svg
                stroke="#FFFFFF"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div
              data-node-label="Export Hint Text"
              className="text-[#f5f5f5] font-['Inter'] text-xs [display:inline-block] [overflow-wrap:normal]"
            >
              Instructions written for Jitter and Figma Motion
            </div>
          </div>
        </div>
      </div>

      <div
        data-node-label="Footer Strip"
        className="flex relative h-16 shrink-0 justify-center items-center border-t gap-2 border-t-[#e6e9f2]"
      >
        <div data-node-label="Footer Text Row" className="flex w-fit h-fit items-center gap-2"></div>
      </div>
    </div>
    </ResponsiveCanvas>
  );
}
