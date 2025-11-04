import React, { useEffect, useState } from "react";

interface DurationSelectorProps {
  duration: string;
  setDuration: (value: string) => void;
  scriptText?: string;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ duration, setDuration, scriptText }) => {
  const [autoDuration, setAutoDuration] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);

  // Auto-estimate duration when script changes
  useEffect(() => {
    let newAutoDuration = "";
    if (scriptText) {
      const words = scriptText.split(/\s+/).filter(Boolean).length;
      const estimatedSeconds = Math.round(words / 2.5); // ~2.5 words/sec average
      const cappedSeconds = Math.min(Math.max(estimatedSeconds, 10), 90);
      newAutoDuration = `${cappedSeconds}s`;
    }
    setAutoDuration(newAutoDuration);

    // If current mode is 'Auto', update the parent's duration state
    if (duration === "Auto" || duration.startsWith("Auto")) {
        setDuration(newAutoDuration ? `Auto (${newAutoDuration})` : 'Auto');
    }
  }, [scriptText, duration, setDuration]);
  
  useEffect(() => {
    const options = ["Auto", "15s", "30s", "45s", "60s"];
    // Check if the current duration is one of the standard options
    const isStandard = options.some(opt => duration.startsWith(opt));
    setIsCustom(!isStandard);

  }, [duration]);

  const handleOptionClick = (option: string) => {
    if (option === "Custom") {
        const currentDurationValue = duration.replace(/\D/g, '');
        const custom = prompt("Enter duration in seconds (e.g. 75):", currentDurationValue || "60");
        if (custom && !isNaN(Number(custom))) {
            const newDuration = `${Number(custom)}s`;
            setDuration(newDuration);
        }
    } else if (option === "Auto") {
        setDuration(autoDuration ? `Auto (${autoDuration})` : 'Auto');
    } else {
        setDuration(option);
    }
  };


  const options = ["Auto", "15s", "30s", "45s", "60s"];

  return (
    <div className="flex flex-col gap-2 bg-slate-900/50 p-4 rounded-lg">
      <label className="text-sm font-semibold text-cyan-300">Select Duration</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              duration.startsWith(option)
                ? "bg-fuchsia-600 text-white shadow-md"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
            onClick={() => handleOptionClick(option)}
          >
            {option === 'Auto' ? (duration.startsWith('Auto') ? duration : 'Auto') : option}
          </button>
        ))}
         <button
            key="Custom"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              isCustom
                ? "bg-fuchsia-600 text-white shadow-md"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
            onClick={() => handleOptionClick("Custom")}
          >
            {isCustom ? `Custom (${duration})` : 'Custom'}
          </button>
      </div>
      <p className="text-xs text-slate-400">
        Effective duration for generation will be: <span className="text-cyan-400 font-semibold">{duration.startsWith('Auto') ? autoDuration || 'N/A' : duration}</span>
      </p>
    </div>
  );
};

export default DurationSelector;
