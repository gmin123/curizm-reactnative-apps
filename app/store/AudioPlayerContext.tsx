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

  // ✅ “로딩 중에 또 다른 play() 호출”이 들어오면 이전 작업 무효화하기 위한 토큰
  const loadTokenRef = useRef(0);

  const subtitlesUrl = trackList[currentIndex]?.subtitlesUrl || "";

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log("🎧 Audio mode initialized");
      } catch (e) {
        console.error("❌ Audio mode 설정 실패:", e);
      }
    })();
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
  };

  const unloadCurrentSound = async () => {
    if (!playbackInstance.current) return;
    try {
      await playbackInstance.current.stopAsync();
    } catch {}
    try {
      await playbackInstance.current.unloadAsync();
    } catch {}
    playbackInstance.current = null;

    // 상태도 초기화 (이전 트랙 잔상 방지)
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const loadAudio = async (idx: number) => {
    // ✅ 토큰 갱신: 이 호출 이전에 시작된 로딩은 무효
    const myToken = ++loadTokenRef.current;

    // ✅ 가장 중요: “사운드 검증 전에” 무조건 이전 사운드 unload
    await unloadCurrentSound();

    const item = trackList[idx];
    const url = item?.sound?.trim?.() || "";

    if (!item || !url) {
      console.warn("⚠️ 유효하지 않은 사운드 URL(로드 중단):", item);
      return { ok: false as const };
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false, positionMillis: 0 },
        onPlaybackStatusUpdate
      );

      // ✅ 로딩 도중에 다른 로딩이 시작되었으면 지금 로딩 결과는 폐기
      if (myToken !== loadTokenRef.current) {
        try {
          await sound.unloadAsync();
        } catch {}
        return { ok: false as const };
      }

      playbackInstance.current = sound;
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);

      return { ok: true as const };
    } catch (err) {
      console.error("[AudioPlayer] loadAudio error:", err);
      return { ok: false as const };
    }
  };

  const play = async (idx = currentIndex) => {
    try {
      console.log("🎵 [AudioPlayer] play 호출:", idx, trackList[idx]?.title);

      // ✅ 인덱스 업데이트
      if (idx !== currentIndex) setCurrentIndex(idx);

      const loaded = await loadAudio(idx);

      // ✅ 여기서 ok 아니면 절대 playAsync 하지 않음 (이전 트랙 재생 방지)
      if (!loaded.ok || !playbackInstance.current) {
        console.warn("⛔ play 중단: 오디오 로드 실패/사운드 없음");
        return;
      }

      await playbackInstance.current.playAsync();
      setIsPlaying(true);
      console.log("✅ [AudioPlayer] 재생 시작 성공");
    } catch (err) {
      console.error("[AudioPlayer] play error:", err);
    }
  };

  const pause = async () => {
    try {
      await playbackInstance.current?.pauseAsync();
      setIsPlaying(false);
    } catch (err) {
      console.error("[AudioPlayer] pause error:", err);
    }
  };

  const togglePlay = async () => {
    try {
      const sound = playbackInstance.current;
      if (!sound) {
        console.warn("⚠️ [AudioPlayer] togglePlay - sound 없음");
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("[AudioPlayer] togglePlay error:", err);
    }
  };

  const seekTo = async (ms: number) => {
    try {
      await playbackInstance.current?.setPositionAsync(ms);
      setPosition(ms);
    } catch (err) {
      console.error("[AudioPlayer] seekTo error:", err);
    }
  };

  const next = async () => {
    if (currentIndex < trackList.length - 1) {
      await play(currentIndex + 1);
    }
  };

  const prev = async () => {
    if (currentIndex > 0) {
      await play(currentIndex - 1);
    }
  };

  const value: AudioPlayerContextType = {
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

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};
