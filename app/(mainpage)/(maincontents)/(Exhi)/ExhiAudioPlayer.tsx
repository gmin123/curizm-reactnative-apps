import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getExhibitionPlayer } from "../../../../api/exhi/getEXhicombi";
import { useAudioPlayer } from "../../../store/AudioPlayerContext";
import ExhiSubtit from "./ExhiSubtit";
import { styles } from "./style/audioplayer.style";

function formatTime(millisec: number) {
  if (!millisec || millisec <= 0) return "0:00";
  const totalSeconds = Math.floor(millisec / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export interface AudioItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  sound: string;
  exhibitionId: string;
  durationTime?: number;
  subtitlesUrl?: string;
}

interface Props {
  playerDataList?: AudioItem[];
  singleWork?: AudioItem; // 단일 작품용
  visible: boolean;
  initialTrackId?: string;
  onClose: () => void;
  onMinimize: () => void;
  onUpdateCurrentItem?: (item: AudioItem) => void;
  onPlayingChange?: (playing: boolean) => void;
}

export default function ExhiAudioPlayer({
  playerDataList,
  singleWork,
  visible,
  initialTrackId,
  onClose,
  onMinimize,
  onUpdateCurrentItem,
  onPlayingChange,
}: Props) {
  const {
    trackList,
    currentIndex,
    isPlaying,
    position,
    duration,
    play,
    pause,
    togglePlay,
    prev,
    next,
    seekTo,
    setTrackList,
    setCurrentIndex,
    setFullScreenPlayerVisible,
  } = useAudioPlayer();

  const [isLoading, setIsLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  useEffect(() => {
  setIsInitialized(false);
}, [params.singleWork]);
useEffect(() => {
  subtitlesUrlMapRef.current = {};
  setSubtitlesUrlMap({});
}, [params.singleWork]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [subtitlesUrlMap, setSubtitlesUrlMap] = useState<Record<string, string>>({}); // ✅ 자막 URL 캐시
  const subtitlesUrlMapRef = useRef<Record<string, string>>({}); // ✅ ref 버전

  // ✅ 오디오 리스트 설정
  useEffect(() => {
    if (isInitialized) return;
  
    try {
      if (params.singleWork && typeof params.singleWork === "string") {
        // ✅ 1) URL 디코딩
        const decoded = decodeURIComponent(params.singleWork);
  
        // ✅ 2) JSON 파싱
        const raw = JSON.parse(decoded);
  
        // ✅ 3) 스키마 정규화 (한 줄 보강 포함)
        // - artist: artist ?? artistName
        // - title: title ?? name
        // - thumbnail, sound 기본값 처리
        // - exhibitionId 문자열화
        const normalized = {
          ...raw,
          title: (raw.title ?? raw.name ?? "제목 미상") as string,
          artist: (raw.artist ?? raw.artistName ?? "작가 미상") as string,
          thumbnail: (raw.thumbnail ?? raw.image ?? "") as string,
          sound: (raw.sound ?? "") as string,
          exhibitionId: String(raw.exhibitionId ?? ""),
        };
  
        console.log("🎵 [ExhiAudioPlayer] normalized workData:", normalized);
        console.log("🎵 [ExhiAudioPlayer] normalized.sound:", normalized.sound);
  
        setTrackList([normalized]);
        setCurrentIndex(0);
        console.log("✅ [ExhiAudioPlayer] trackList와 currentIndex 설정 완료");
      } else if (singleWork) {
        // props로 들어오는 케이스도 동일한 정규화 적용 (안전)
        const raw = singleWork as any;
        const normalized = {
          ...raw,
          title: (raw.title ?? raw.name ?? "제목 미상") as string,
          artist: (raw.artist ?? raw.artistName ?? "작가 미상") as string,
          thumbnail: (raw.thumbnail ?? raw.image ?? "") as string,
          sound: (raw.sound ?? "") as string,
          exhibitionId: String(raw.exhibitionId ?? ""),
        };
        setTrackList([normalized]);
        setCurrentIndex(0);
      } else if (playerDataList?.length) {
        // 리스트 플레이
        const normalizedList = playerDataList.map((raw: any) => ({
          ...raw,
          title: (raw.title ?? raw.name ?? "제목 미상") as string,
          artist: (raw.artist ?? raw.artistName ?? "작가 미상") as string,
          thumbnail: (raw.thumbnail ?? raw.image ?? "") as string,
          sound: (raw.sound ?? "") as string,
          exhibitionId: String(raw.exhibitionId ?? ""),
        }));
        setTrackList(normalizedList);
        if (typeof initialTrackId === "string") {
          const idx = normalizedList.findIndex((it) => it.id === initialTrackId);
          if (idx >= 0) setCurrentIndex(idx);
        }
      }
  
      setIsInitialized(true);
    } catch (e) {
      console.error("❌ 트랙 초기화 실패:", e);
    }
  }, [params.singleWork, playerDataList, singleWork, initialTrackId]);
  
  // ✅ trackList 변경 시 로그 출력
  useEffect(() => {
    console.log("🎵 [trackList 변경됨] trackList.length:", trackList.length);
    if (trackList.length > 0) {
      console.log("🎵 [trackList] 첫 번째 아이템:", JSON.stringify(trackList[0], null, 2));
      console.log("🎵 [trackList] 첫 번째 아이템의 sound:", trackList[0]?.sound);
    }
  }, [trackList]);

// ✅ sound가 비어있으면 서버에서 다시 받아와 채우는 폴백
useEffect(() => {
  (async () => {
    if (!trackList.length || currentIndex === null) return;
    const current = trackList[currentIndex];
    if (!current || (current.sound && current.sound.trim() !== "")) return;

    try {
      // getExhibitionPlayer(exhibitionId, artworkId) 시그니처 유지
      const pd = await getExhibitionPlayer(current.exhibitionId, current.id);

      // ttsVoices 우선 → 루트 sound 보조
      const dv =
        pd?.ttsVoices?.find((v: any) => v?.isDefault) ||
        pd?.ttsVoices?.[0];

      const fixedSound =
        (dv?.audioUrl && dv.audioUrl.trim() !== "")
          ? dv.audioUrl
          : (pd?.sound && pd.sound.trim() !== "")
          ? pd.sound
          : "";

      const fixedSubtitles =
        (dv?.subtitlesUrl && dv.subtitlesUrl.trim() !== "")
          ? dv.subtitlesUrl
          : (pd?.subtitles && pd.subtitles.trim() !== "")
          ? pd.subtitles
          : "";

      if (fixedSound) {
        const updated = { ...current, sound: fixedSound, subtitlesUrl: current.subtitlesUrl || fixedSubtitles };
        const next = [...trackList];
        next[currentIndex] = updated;
        setTrackList(next);
        console.log("🎧 [ExhiAudioPlayer] sound 폴백 완료:", fixedSound);
      } else {
        console.warn("⚠️ sound 폴백 실패: 서버에도 없음", pd);
      }
    } catch (err) {
      console.error("❌ sound 폴백 조회 실패:", err);
    }
  })();
}, [currentIndex, trackList.length]);


// ✅ 트랙 변경 시 자막 불러오기만 (재생은 자동으로 됨)
useEffect(() => {
  if (!trackList.length || currentIndex === null) return;
  const currentItem = trackList[currentIndex];
  if (!currentItem) return;

  // ✅ 이미 자막 URL이 캐시되어 있으면 스킵
  if (subtitlesUrlMapRef.current[currentItem.id]) {
    setIsLoading(false);
    onUpdateCurrentItem?.(currentItem);
    return;
  }

  // ✅ currentItem에 이미 subtitlesUrl이 있으면 API 호출 스킵
  if (currentItem.subtitlesUrl && currentItem.subtitlesUrl.trim() !== "") {
    console.log("✅ 이미 자막 URL이 제공됨:", currentItem.subtitlesUrl);
    subtitlesUrlMapRef.current = {
      ...subtitlesUrlMapRef.current,
      [currentItem.id]: currentItem.subtitlesUrl
    };
    setSubtitlesUrlMap(subtitlesUrlMapRef.current);
    setIsLoading(false);
    onUpdateCurrentItem?.(currentItem);
    return;
  }

  // ✅ 자막 URL 불러오기
  setIsLoading(true);
 (async () => {
  try {
    let playerData: any = null;

    // 🔥 핵심 분기
    if (currentItem.exhibitionId && currentItem.exhibitionId.trim() !== "") {
      // ✅ 전시 작품 (exhibition 기반)
      playerData = await getExhibitionPlayer(
        currentItem.exhibitionId,
        currentItem.id
      );
    } else {
      // ✅ 단일 작품 (artwork 단독)
      const res = await fetch(
        `https://api.curizm.io/api/v1/exhibition/player?artworkId=${encodeURIComponent(
          currentItem.id
        )}&type=artwork`
      );

      if (!res.ok) {
        throw new Error(`Failed to load player: ${res.status}`);
      }

      playerData = await res.json();
    }

    // -------------------------
    // 자막 URL 추출
    // -------------------------
    let subtitleUrl = "";

    if (playerData?.tts?.subtitlesUrl) {
      subtitleUrl = playerData.tts.subtitlesUrl;
    } else if (playerData?.subtitles) {
      subtitleUrl = playerData.subtitles;
    } else if (playerData?.ttsVoices?.length) {
      const defaultVoice =
        playerData.ttsVoices.find((v: any) => v.isDefault) ||
        playerData.ttsVoices[0];
      subtitleUrl = defaultVoice?.subtitlesUrl ?? "";
    }

    // -------------------------
    // 캐시 저장 (state + ref)
    // -------------------------
    if (subtitleUrl) {
      subtitlesUrlMapRef.current = {
        ...subtitlesUrlMapRef.current,
        [currentItem.id]: subtitleUrl,
      };
      setSubtitlesUrlMap(subtitlesUrlMapRef.current);
    }

    setIsLoading(false);
    onUpdateCurrentItem?.(currentItem);
  } catch (err) {
    console.error("❌ 자막 로드 실패:", err);
    setIsLoading(false);
    onUpdateCurrentItem?.(currentItem);
  }
})();

}, [currentIndex, trackList.length]);

  const prevTrack = async () => {
    if (currentIndex === null || currentIndex === 0) return;
    if (trackList.length === 1) return;
    setCurrentIndex(currentIndex - 1);
  };

  const nextTrack = async () => {
    if (currentIndex === null || currentIndex + 1 >= trackList.length) return;
    if (trackList.length === 1) return;
    setCurrentIndex(currentIndex + 1);
  };

  const handleClose = async () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      router.back();
    }
  };

  // === 가이드 모달 ===
  const renderGuideModal = () => (
    <Modal
      visible={showGuideModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowGuideModal(false)}
    >
      <TouchableOpacity
        style={guideModalStyles.backdrop}
        activeOpacity={1}
        onPress={() => setShowGuideModal(false)}
      >
        <View style={guideModalStyles.modalContainer}>
          {/* 헤더 */}
          <View style={guideModalStyles.header}>
            <Text style={guideModalStyles.title}>이런 질문은 싫어요</Text>
            <TouchableOpacity onPress={() => setShowGuideModal(false)} style={guideModalStyles.closeBtn}>
              <Text style={guideModalStyles.closeBtnText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* 규칙 리스트 */}
          <View style={guideModalStyles.listBox}>
            <View style={guideModalStyles.listRow}>
              <View style={guideModalStyles.numberIcon}>
                <Text style={guideModalStyles.numberText}>1</Text>
              </View>
              <Text style={guideModalStyles.listItem}>욕설, 비방 등 작품과 관련없는 글</Text>
            </View>
            <View style={guideModalStyles.listRow}>
              <View style={guideModalStyles.numberIcon}>
                <Text style={guideModalStyles.numberText}>2</Text>
              </View>
              <Text style={guideModalStyles.listItem}>작품과 관련 없는 글이나 광고</Text>
            </View>
            <View style={guideModalStyles.listRow}>
              <View style={guideModalStyles.numberIcon}>
                <Text style={guideModalStyles.numberText}>3</Text>
              </View>
              <Text style={guideModalStyles.listItem}>다른 관람객을 불쾌하게 하는 글</Text>
            </View>
          </View>

          {/* 확인 버튼 */}
          <TouchableOpacity
            style={guideModalStyles.confirmBtn}
            onPress={async () => {
              setShowGuideModal(false);
              const currentItem = trackList[currentIndex];
              router.push({
                pathname: "/(mainpage)/(maincontents)/(Exhi)/(AIchat)/AudioQuestionInput",
                params: {
                  id: currentItem.id,
                  title: currentItem.title,
                  artist: currentItem.artist,
                  thumbnail: currentItem.thumbnail,
                  sound: currentItem.sound,
                  exhibitionId: currentItem.exhibitionId,
                  positionMillis: position,
                  wasPlaying: isPlaying ? "1" : "0",
                },
              });
            }}
          >
            <Text style={guideModalStyles.confirmText}>확인했어요</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ✅ 전체 화면 플레이어 상태 관리
  useEffect(() => {
    const isVisible = visible === true || params.visible === "true";
    setFullScreenPlayerVisible(isVisible);
    return () => {
      setFullScreenPlayerVisible(false);
    };
  }, [visible, params.visible, setFullScreenPlayerVisible]);

  const lastPlayedIndex = useRef<number | null>(null); // ✅ 마지막 재생 인덱스 추적

  // ✅ 플레이어 마운트 및 트랙 변경 시 자동 재생
  useEffect(() => {
    const isVisible = visible === true || params.visible === "true"; // ✅ 문자열도 허용
    console.log("🎬 [자동 재생 체크]", { isVisible, currentIndex, len: trackList.length });
  
    // 트랙이 준비되었으면 바로 재생
    if (  trackList.length > 0 &&
  currentIndex !== null &&
  trackList[currentIndex]?.sound &&
  trackList[currentIndex].sound.trim() !== "") {
      console.log("🎬 [자동 재생 실행]:", trackList[currentIndex]?.title);
      play(currentIndex);
    } else {
      console.log("🎬 [자동 재생 대기중] trackList.length:", trackList.length);
    }
  }, [trackList.length, currentIndex, visible, params.visible]);
  
  // ✅ 현재 아이템 가져오기 (안전하게)
  const currentItem = currentIndex !== null ? trackList[currentIndex] : null;

  // ✅ subtitlesUrl 계산 (조건부 return 이전에)
  const subtitleUrl = React.useMemo(() => {
    if (!currentItem) return "";
    
    // ✅ state를 직접 사용 (ref는 state 변경을 감지하지 못함)
    const cachedUrl = subtitlesUrlMap[currentItem.id];
    if (cachedUrl) {
      console.log("✅ 자막 캐시에서 찾음:", cachedUrl);
      return cachedUrl;
    }
    
    return (currentItem.subtitlesUrl && currentItem.subtitlesUrl.trim() !== "")
    ? currentItem.subtitlesUrl
    : currentItem.sound?.endsWith(".wav")
    ? currentItem.sound.replace(".wav", ".vtt")
    : currentItem.sound?.endsWith(".mp3")
    ? currentItem.sound.replace(".mp3", ".vtt")
    : "";
  }, [currentItem, subtitlesUrlMap]); // ✅ subtitlesUrlMap dependency 추가

  // ✅ ExhiSubtit으로 전달할 exhibition 데이터 보정 (메모이제이션)
  const exhibitionData = React.useMemo(() => {
    if (!currentItem) return null;
    console.log("📺 exhibitionData:", {
      title: currentItem.title,
      subtitlesUrl: subtitleUrl,
      hasSubtitles: !!subtitleUrl,
      id: currentItem.id,

    });
    return {
      ...currentItem,
      subtitlesUrl: subtitleUrl,
    };
  }, [currentItem, subtitleUrl]);

  // ✅ 조건부 return (모든 훅 호출 후)
  if (currentIndex === null || isLoading) {
    return (
      <>
        {renderGuideModal()}
        <View style={styles.overlay}>
          <Text>Loading audio...</Text>
        </View>
      </>
    );
  }

  if (!currentItem) {
    return (
      <>
        {renderGuideModal()}
        <Text>재생할 트랙이 없습니다.</Text>
      </>
    );
  }

  if (!exhibitionData) return null;

  return (
    <>
      {renderGuideModal()}

      <View style={styles.overlay}>
        <View style={styles.audioCard}>
          {/* 상단 버튼 */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={handleMinimize}>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={20} color="#bbb" />
            </TouchableOpacity>
          </View>

          {/* 썸네일 */}
          <Image
            source={
              currentItem.thumbnail
                ? { uri: currentItem.thumbnail }
                : require("../../../../assets/images/Cicon.png")
            }
            style={styles.coverImage}
            resizeMode="cover"
          />

          {/* 제목 / 작가 */}
          <Text style={styles.audioTitle} numberOfLines={2}>
            {currentItem.title ?? "전시/작품 제목"}
          </Text>
          <Text style={styles.audioArtist} numberOfLines={1}>
            {currentItem.artist ?? "작가 / 주최"}
          </Text>

          {/* 진행바 */}
          <View style={styles.progressBox}>
            <Text style={styles.progressTime}>{formatTime(position)}</Text>
            <View style={styles.progressBarOuter}>
              <View
                style={[
                  styles.progressBarInner,
                  {
                    width: duration ? `${(position / duration) * 100}%` : "0%",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressTime}>{formatTime(duration)}</Text>
          </View>

          {/* 컨트롤 버튼 */}
          <View style={styles.audioControls}>
            <TouchableOpacity onPress={prevTrack}>
              <MaterialIcons
                name="chevron-left"
                size={32}
                color={currentIndex === 0 || trackList.length === 1 ? "#ccc" : "#333"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={44}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextTrack}>
              <MaterialIcons
                name="chevron-right"
                size={32}
                color={
                  currentIndex === trackList.length - 1 || trackList.length === 1
                    ? "#ccc"
                    : "#333"
                }
              />
            </TouchableOpacity>
          </View>

          {/* 큐리 질문 카드 */}
          <TouchableOpacity style={styles.queryCard} onPress={() => setShowGuideModal(true)}>
            <Text style={styles.queryLabel}>큐리에게 질문하세요</Text>
            <View style={styles.queryInputWrap}>
              <MaterialIcons
                name="person"
                size={26}
                color="#8593b3"
                style={{ marginRight: 4 }}
              />
              <TextInput
                editable={false}
                pointerEvents="none"
                style={styles.queryInput}
                placeholder="질문을 입력하세요"
                placeholderTextColor="#bbc5da"
                multiline
              />
            </View>
          </TouchableOpacity>

          {/* ✅ 자막 컴포넌트 (자동추론된 subtitlesUrl 적용) */}
    <ExhiSubtit
  key={`${exhibitionData.id}-${exhibitionData.subtitlesUrl}`}
  exhibition={exhibitionData}
/>

        </View>
      </View>
    </>
  );
}

const guideModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 15,
  },
  modalContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    width: "90%",
    maxWidth: 360,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#64748B",
    justifyContent: "center",
    alignItems: "center",
    color: "#ffffff",
  },
  closeBtnText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
    textAlignVertical: "center",
  },
  listBox: {
    marginBottom: 24,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  numberIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  listItem: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    lineHeight: 22,
  },
  confirmBtn: {
    backgroundColor: "#FF6542",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
