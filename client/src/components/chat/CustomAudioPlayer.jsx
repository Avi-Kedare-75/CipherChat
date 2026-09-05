import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, FastForward, Loader2 } from 'lucide-react';

const WAVEFORM_BARS = [
  35, 60, 40, 85, 50, 95, 70, 45, 65, 80,
  100, 75, 90, 55, 65, 85, 45, 70, 95, 60,
  40, 75, 90, 50, 65, 80, 45, 70, 55, 30
];

export const CustomAudioPlayer = ({ src, duration = 0, isVoice = true }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.warn('Audio playback error for source:', src);
      setHasError(true);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Audio play failed:', err);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleSeek = (index) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;

    const targetRatio = (index + 1) / WAVEFORM_BARS.length;
    const newTime = targetRatio * audioDuration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [1, 1.5, 2];
    const nextRateIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextRateIndex];

    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1 px-1 select-none min-w-[240px] sm:min-w-[280px]">
      <audio ref={audioRef} src={src} preload="metadata" crossOrigin="anonymous" />

      {/* Futuristic Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={hasError}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-dark-bg flex items-center justify-center shadow-glow transition-all active:scale-95 flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play voice message'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5 fill-dark-bg" />
        ) : (
          <Play className="w-5 h-5 fill-dark-bg ml-0.5" />
        )}
      </button>

      {/* Waveform Equalizer Display */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div className="h-7 flex items-center gap-[3px] cursor-pointer" title="Click to seek">
          {WAVEFORM_BARS.map((height, i) => {
            const barRatio = (i + 1) / WAVEFORM_BARS.length;
            const isPassed = (currentTime / (audioDuration || 1)) >= barRatio;

            return (
              <div
                key={i}
                onClick={() => handleSeek(i)}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-all duration-150 hover:opacity-100 ${
                  isPassed
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : 'bg-white/20 hover:bg-white/40'
                } ${isPlaying && isPassed ? 'scale-y-110' : ''}`}
              />
            );
          })}
        </div>

        {/* Time and Speed bar */}
        <div className="flex items-center justify-between text-[11px] font-mono font-medium text-dark-textMuted px-0.5">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlaybackRate}
              className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Change playback speed"
            >
              {playbackRate}x
            </button>
            <span>{formatTime(audioDuration || duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
