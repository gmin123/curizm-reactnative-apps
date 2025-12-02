// AudioPlayerContext.tsx
import { Audio } from "expo-av";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AudioItem } from "../(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer";

type AudioPlayerContextType = {
  trackList: AudioItem[];
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  subtitlesUrl: string;
  isFullScreenPlayerVisible: boolean;
  setTrackList: (list: AudioItem[]) => void;
  setCurrentIndex: (idx: number) => void;
  setIsPlaying: (b: boolean) => void;
  setPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
  setFullScreenPlayerVisible: (visible: boolean) => void;
  play: (idx?: number) => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerContextType>({} as AudioPlayerContextType);

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trackList, setTrackList] = useState<AudioItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreenPlayerVisible, setFullScreenPlayerVisible] = useState(false);
  const playbackInstance = useRef<Audio.Sound | null>(null);

  const subtitlesUrl = trackList[currentIndex]?.subtitlesUrl || "";

  // ✅ 오디오 모드 설정 (가장 중요)
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true, // ✅ 무음 모드에서도 재생 가능
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log("🎧 Audio mode initialized");
      } catch (e) {
        console.error("❌ Audio mode 설정 실패:", e);
      }
    })();987
  }, []);

  // ✅ 재생 상태 업데이트
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
  };

  // ✅ 기존 사운드 정리
  const unloadCurrentSound = async () => {
    if (playbackInstance.current) {
      try {
        await playbackInstance.current.stopAsync();
        await playbackInstance.current.unloadAsync();
      } catch (e) {
        console.warn("🧹 unload 실패 (무시 가능):", e);
      }
      playbackInstance.current = null;
    }
  };

  // ✅ 새 오디오 로드 및 준비
  const loadAudio = async (idx: number) => {
    try {
      const item = trackList[idx];
      if (!item || !item.sound) {
        console.warn("⚠️ 유효하지 않은 사운드 URL:", item);
        return;
      }

      await unloadCurrentSound(); // 기존 오디오 정리

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.sound },
        { shouldPlay: false, positionMillis: 0 },
        onPlaybackStatusUpdate
      );

      playbackInstance.current = sound;
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);
    } catch (err) {
      console.error("[AudioPlayer] loadAudio error:", err);
    }
  };

  // ✅ 재생
  const play = async (idx = currentIndex) => {
    try {
      console.log("🎵 [AudioPlayer] play 호출:", idx, trackList[idx]?.title);
      
      // ✅ currentIndex 업데이트 (next/prev에서 호출 시)
      if (idx !== currentIndex) {
        setCurrentIndex(idx);
      }
      
      await loadAudio(idx);

      if (playbackInstance.current) {
        await playbackInstance.current.playAsync();
        setIsPlaying(true);
        console.log("✅ [AudioPlayer] 재생 시작 성공");
      } else {
        console.warn("⚠️ [AudioPlayer] playbackInstance 없음");
      }
    } catch (err) {
      console.error("[AudioPlayer] play error:", err);
    }
  };

  // ✅ 일시정지
  const pause = async () => {
    try {
      await playbackInstance.current?.pauseAsync();
      setIsPlaying(false);
    } catch (err) {
      console.error("[AudioPlayer] pause error:", err);
    }
  };

  // ✅ 재생 / 일시정지 토글
  const togglePlay = async () => {
    try {
      const sound = playbackInstance.current;
      if (!sound) {
        console.warn("⚠️ [AudioPlayer] togglePlay - sound 없음");
        return;
      }

      // ✅ state를 직접 확인 (getStatusAsync보다 빠름)
      console.log("🎛️ [AudioPlayer] togglePlay:", isPlaying ? "일시정지" : "재생");
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        console.log("⏸️ [AudioPlayer] 일시정지됨");
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        console.log("▶️ [AudioPlayer] 재생됨");
      }
    } catch (err) {
      console.error("[AudioPlayer] togglePlay error:", err);
    }
  };

  // ✅ 특정 위치로 이동
  const seekTo = async (ms: number) => {
    try {
      await playbackInstance.current?.setPositionAsync(ms);
      setPosition(ms);
    } catch (err) {
      console.error("[AudioPlayer] seekTo error:", err);
    }
  };

  // ✅ 다음 트랙
  const next = async () => {
    if (currentIndex < trackList.length - 1) {
      console.log("⏭️ 다음 트랙:", currentIndex + 1);
      await play(currentIndex + 1);
    } else {
      console.log("⏹️ 마지막 트랙입니다");
    }
  };

  // ✅ 이전 트랙
  const prev = async () => {
    if (currentIndex > 0) {
      console.log("⏮️ 이전 트랙:", currentIndex - 1);
      await play(currentIndex - 1);
    } else {
      console.log("⏹️ 첫 트랙입니다");
    }
  };

  const audioPlayerValue: AudioPlayerContextType = {
    trackList,
    setTrackList,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    position,
    setPosition,
    duration,
    setDuration,
    isFullScreenPlayerVisible,
    setFullScreenPlayerVisible,
    play,
    pause,
    togglePlay,
    prev,
    next,
    seekTo,
    subtitlesUrl,
  };

  return (
    <AudioPlayerContext.Provider value={audioPlayerValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
