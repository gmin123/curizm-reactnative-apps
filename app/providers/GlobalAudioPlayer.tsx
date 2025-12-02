// GlobalAudioPlayer.tsx
import { useRouter } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import ExhiAudioPlayer, { AudioItem } from "../(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer";
import MiniAudioPlayer from "../(mainpage)/(maincontents)/(Exhi)/MiniAudioPlayer";

type Exhibit = { title: string; imageUrl: string; works: AudioItem[] };

type Ctx = {
  item: AudioItem | null;
  isPlaying: boolean;
  progress: number;
  openPlayerWithExhibit: (
    exhibit: Exhibit,
    opts?: { initialTrackId?: string; autoplay?: boolean }
  ) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
};

const AudioCtx = createContext<Ctx | null>(null);
export const useAudio = () => useContext(AudioCtx)!;

export default function GlobalAudioPlayer({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [item, setItem] = useState<AudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [currentExhibit, setCurrentExhibit] = useState<Exhibit | null>(null);
  const [isFullVisible, setFullVisible] = useState(false);

  const openPlayerWithExhibit = (
    exhibit: Exhibit,
    opts?: { initialTrackId?: string; autoplay?: boolean }
  ) => {
    console.log("➡️ openPlayerWithExhibit 호출됨", exhibit, opts);
    setCurrentExhibit(exhibit);
    setItem(exhibit.works[0]);
    if (opts?.autoplay) setIsPlaying(true);
    setFullVisible(true);
  };

  const ctxValue: Ctx = {
    item,
    isPlaying,
    progress,
    openPlayerWithExhibit,
    toggle: () => {
      console.log("🎛 toggle 실행, 현재 isPlaying:", isPlaying);
      setIsPlaying((p) => !p);
    },
    next: () => {
      console.log("⏭ next 실행");
    },
    prev: () => {
      console.log("⏮ prev 실행");
    },
  };

  useEffect(() => {
    console.log("🌍 GlobalAudioPlayer 상태 업데이트", {
      item,
      isPlaying,
      progress,
    });
  }, [item, isPlaying, progress]);

  return (
    <AudioCtx.Provider value={ctxValue}>
      {children}

      {/* 항상 보여주는 미니 플레이어 */}
      <MiniAudioPlayer
  title={item?.title ?? ""}

  artist={item?.artist ?? ""}
  isPlaying={isPlaying}
  progressRatio={progress}
  onTogglePlay={ctxValue.toggle}
  onExpand={() => {
    if (currentExhibit) {
      router.push({
        pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
        params: { exhibit: JSON.stringify(currentExhibit) },
      });
    }
  }}
  onExpand={() => {
    if (currentExhibit) {
      router.push({
        pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
        params: { exhibit: JSON.stringify(currentExhibit) },
      });
    }
  }}
  onNext={ctxValue.next}
  onPrev={ctxValue.prev}
/>


      {/* 전체 플레이어 */}
      {currentExhibit && (
        <ExhiAudioPlayer
          visible={isFullVisible}
          exhibit={currentExhibit}
          onUpdateCurrentItem={(it) => {
            console.log("📥 GlobalAudioPlayer: onUpdateCurrentItem 수신", it);
            setItem(it);
          }}
          onPlayingChange={(p) => {
            console.log("📥 GlobalAudioPlayer: onPlayingChange 수신", p);
            setIsPlaying(p);
          }}
          onUpdateProgress={(r) => {
            console.log("📥 GlobalAudioPlayer: onUpdateProgress 수신", r);
            setProgress(r);
          }}
          onClose={() => {
            console.log("❌ ExhiAudioPlayer 닫힘");
            setFullVisible(false);
          }}
        />
      )}
    </AudioCtx.Provider>
  );
}
