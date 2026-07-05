"use client";

import { useRef, useState, DragEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/context/AnalysisContext";
import ResponsiveCanvas from "@/components/ResponsiveCanvas";

const ShaderBackground = dynamic(() => import("@/components/ShaderBackground"), {
  ssr: false,
});

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"];

export default function UploadPage() {
  const router = useRouter();
  const { setSource } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const applyFile = (file: File | undefined | null) => {
    if (!file) return;
    const isAcceptedType =
      ACCEPTED_TYPES.includes(file.type) || file.type.startsWith("video/");
    if (!isAcceptedType) {
      setFileError("That file isn't a supported video format.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That clip is over the 20MB limit — try a shorter one.");
      return;
    }
    setFileError(null);
    setFormError(null);
    setVideoFile(file);
    setYoutubeUrl("");
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    applyFile(event.dataTransfer.files?.[0]);
  };

  const handleAnalyze = () => {
    if (!videoFile && !youtubeUrl.trim()) {
      setFormError("Add a video file or a YouTube link before analyzing.");
      return;
    }
    setFormError(null);
    setSource({ videoFile, youtubeUrl: youtubeUrl.trim() });
    router.push("/analyzing");
  };

  const dropzoneLabel = videoFile
    ? videoFile.name
    : "Drop a video or click to upload";

  return (
    <ResponsiveCanvas width={1440}>
    <div
      data-node-label="LearnMotion Light Mood Variant"
      className="relative z-0 flex w-[1440px] h-fit flex-col bg-[#FF4B14] font-['Inter'] overflow-clip mx-auto"
    >
      <ShaderBackground />
      <div
        data-node-label="Shader Background Layers"
        className="size-full flex absolute flex-col left-0 top-0 overflow-clip"
      >
        <div
          data-node-label="Indigo Light Pool Top"
          className="flex absolute w-[900px] h-[700px] flex-col left-[320px] top-[-300px] bg-[radial-gradient(circle,_rgba(94,_106,_210,_0.16)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[120px] rounded-full"
        ></div>
        <div
          data-node-label="Cyan Light Pool Left"
          className="size-[600px] flex absolute flex-col left-[-260px] top-[420px] bg-[radial-gradient(circle,_rgba(56,_189,_248,_0.14)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[120px] rounded-full"
        ></div>
        <div
          data-node-label="Violet Light Pool Right"
          className="flex absolute w-[520px] h-[640px] flex-col top-[720px] right-[-220px] bg-[radial-gradient(circle,_rgba(167,_139,_250,_0.14)_0%,_rgba(255,_255,_255,_0)_70%)] blur-[110px] rounded-full"
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
          className="flex shrink-0 items-center gap-2.5"
        >
          <div
            data-node-label="Logo Mark"
            className="size-7 flex justify-center items-center bg-[#5e6ad2] shadow-[0px_0px_16px_rgba(94,106,210,0.5)] rounded-lg"
          >
            <div data-node-label="SVG" className="size-4 flex flex-col text-white">
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
        data-node-label="Hero Section"
        className="flex relative h-[789px] flex-col shrink-0 items-center pt-[88px] pb-[112px] px-16 gap-6"
      >
        <div
          data-node-label="Hero Headline Block"
          className="flex w-full h-fit flex-col items-center gap-2"
        >
          <div
            data-node-label="Hero Headline"
            className="text-[#16181f] font-['Inter'] text-[76px] font-semibold leading-none tracking-[-2.28px] text-center [display:inline-block] [overflow-wrap:normal]"
          >
            Decode simple motion
          </div>
        </div>
        <div
          data-node-label="Hero Subheadline Block"
          className="flex w-[620px] h-fit flex-col items-center"
        >
          <div
            data-node-label="Hero Subheadline"
            className="text-[#c4c6ce] font-['Inter'] text-[17px] leading-relaxed text-center [display:inline-block] [overflow-wrap:normal]"
          >
            Upload a video or paste a YouTube link. LearnMotion breaks the
            animation down step by step — easing curves, timing, and layer
            choreography you can actually rebuild.
          </div>
        </div>

        <div
          data-node-label="Upload Dropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          className={`flex relative w-[760px] min-h-[240px] flex-col justify-center items-center mt-6 mb-0 bg-[#fafafa] shadow-[0px_0px_0px_1px_rgba(94,106,210,0.18),0px_12px_40px_rgba(30,40,90,0.08),0px_0px_80px_rgba(94,106,210,0.1)] rounded-2xl mx-0 gap-3.5 cursor-pointer transition-shadow ${
            isDragActive ? "shadow-[0px_0px_0px_2px_rgba(94,106,210,0.4)]" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/*"
            hidden
            onChange={(event) => applyFile(event.target.files?.[0])}
          />
          <div
            data-node-label="Dropzone Dashed Frame"
            className="size-[calc(100%_-_24px)] flex absolute flex-col left-3 top-3 border-t border-b border-l border-r rounded-xl border-l-[#ff491266] border-r-[#ff4b0f66] border-y-[#ff4b0f66]"
          ></div>
          <div
            data-node-label="Upload Icon Bubble"
            className="size-14 flex justify-center items-center bg-[#fcf6f514] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.8)] rounded-xl"
          >
            <div
              data-node-label="SVG"
              className="size-[26px] flex flex-col text-[#8b95e8]"
            >
              <div data-node-label="SVG" className="size-[26px] flex flex-col">
                <svg
                  stroke="rgb(139, 149, 232)"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline
                    points="16 16 12 12 8 16"
                    fill="none"
                    stroke="rgb(139, 149, 232)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2px"
                  ></polyline>
                  <line
                    x1="12"
                    y1="12"
                    x2="12"
                    y2="21"
                    fill="none"
                    stroke="rgb(139, 149, 232)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2px"
                  ></line>
                  <path
                    d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"
                    fill="none"
                    stroke="rgb(139, 149, 232)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2px"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div
            data-node-label="Dropzone Primary Text"
            className="text-[#16181f] font-['Inter'] text-lg font-medium leading-normal [display:inline-block] [overflow-wrap:normal]"
          >
            {dropzoneLabel}
          </div>
          <div
            data-node-label="Dropzone Hint Text"
            className="text-[#e3e1e2] font-['Inter'] text-[13px] leading-normal [display:inline-block] [overflow-wrap:normal]"
          >
            Your clip stays private — analysis runs in about a minute
          </div>
        </div>

        {fileError && (
          <div className="w-[760px] text-[#c8455a] font-['Inter'] text-xs leading-normal -mt-2">
            {fileError}
          </div>
        )}

        <div
          data-node-label="YouTube Link Input Row"
          className="flex w-[760px] h-[52px] gap-3"
        >
          <div
            data-node-label="YouTube Link Input Field"
            className="flex h-[52px] items-center bg-[#693b1a] border-t border-b border-l border-r shadow-[0px_2px_8px_rgba(30,40,90,0.05)] flex-1 rounded-lg px-4 py-0 gap-2.5 border-[#e2e5ee]"
          >
            <div
              data-node-label="SVG"
              className="size-4 flex flex-col shrink-0 text-[#5c5f6b]"
            >
              <div data-node-label="SVG" className="size-4 flex flex-col">
                <svg
                  stroke="rgb(92, 95, 107)"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    fill="none"
                    stroke="rgb(92, 95, 107)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2px"
                  ></path>
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    fill="none"
                    stroke="rgb(92, 95, 107)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2px"
                  ></path>
                </svg>
              </div>
            </div>
            <input
              data-node-label="YouTube Input Field"
              type="text"
              value={youtubeUrl}
              onChange={(event) => {
                setYoutubeUrl(event.target.value);
                if (event.target.value) {
                  setVideoFile(null);
                  setFileError(null);
                }
                setFormError(null);
              }}
              placeholder="Or paste a YouTube link"
              className="flex-1 bg-transparent outline-none text-white font-['Inter'] text-sm leading-normal placeholder:text-[#9aa0ad]"
            />
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            data-node-label="Analyze Button"
            className="flex h-[52px] shrink-0 justify-center items-center bg-[#5e6ad2] shadow-[0px_4px_14px_rgba(94,106,210,0.35),inset_0px_1px_0px_rgba(255,255,255,0.25)] rounded-lg px-7 py-0"
          >
            <div
              data-node-label="Analyze Button Label"
              className="text-white font-['Inter'] text-sm font-medium leading-normal [display:inline-block] [overflow-wrap:normal]"
            >
              Analyze
            </div>
          </button>
        </div>

        {formError && (
          <div className="w-[760px] text-[#c8455a] font-['Inter'] text-xs leading-normal -mt-3">
            {formError}
          </div>
        )}

        <div data-node-label="Format Support Text Row" className="flex w-fit h-fit flex-col">
          <div
            data-node-label="Format Support Text"
            className="text-[#f7f7f7] font-['Inter'] text-xs leading-normal tracking-[0.3px] [display:inline-block] [overflow-wrap:normal]"
          >
            MP4, MOV — up to 20 MB, best under 30 seconds
          </div>
        </div>
      </div>
    </div>
    </ResponsiveCanvas>
  );
}
