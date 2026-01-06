import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useFocusEffect } from "expo-router"; // ✅ 페이지 포커스 감지용
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  durationTime?: number;
}

interface Props {
  playerDataList: AudioItem[];
  visible: boolean;
  initialTrackId?: string;
  onClose: () => void;
  onMinimize: () => void;
  onUpdateCurrentItem?: (item: AudioItem) => void;
  onPlayingChange?: (playing: boolean) => void;
}

export default function OffExhiAudioPlayer({
  playerDataList,
  visible,
  initialTrackId,
  onClose,
  onMinimize,
  onUpdateCurrentItem,
  onPlayingChange,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isSeekingRef = useRef(false);

  /** ✅ 페이지 포커스 감시: 벗어나면 오디오 자동 정지 및 언로드 */
  useFocusEffect(
    React.useCallback(() => {
      // 화면이 포커스될 때 실행
      return () => {
        // 화면이 언포커스(벗어남)될 때 실행
        if (playbackInstance) {
          playbackInstance.unloadAsync().catch(() => {});
          setPlaybackInstance(null);
          setIsPlaying(false);
          console.log("🛑 페이지 벗어남 → 오디오 정지됨");
        }
      };
    }, [playbackInstance])
  );

  /** ✅ 초기 트랙 인덱스 설정 */
  useEffect(() => {
    if (!playerDataList.length) {
      setCurrentIndex(null);
      return;
    }
    const idx =
      initialTrackId !== undefined
        ? playerDataList.findIndex((item) => item.id === initialTrackId)
        : 0;
    setCurrentIndex(idx >= 0 ? idx : 0);
  }, [initialTrackId, playerDataList]);

  /** ✅ 트랙 변경 시 오디오 로딩 */
  useEffect(() => {
    if (currentIndex === null) return;
    if (!playerDataList.length) return;

    const currentItem = playerDataList[currentIndex];
    if (!currentItem) return;

    setIsLoading(true);

    (async () => {
      if (playbackInstance) {
        await playbackInstance.unloadAsync().catch(() => {});
        setPlaybackInstance(null);
      }
      await loadAudio(currentItem.sound);
      setIsLoading(false);
    })();

    onUpdateCurrentItem?.(currentItem);

    return () => {
      if (playbackInstance) {
        playbackInstance.unloadAsync().catch(() => {});
        setPlaybackInstance(null);
      }
    };
  }, [currentIndex, playerDataList]);

  /** ✅ 오디오 로드 */
  async function loadAudio(uri: string) {
    if (!uri) return;
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setPlaybackInstance(sound);
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis || 0);
        setIsPlaying(status.isPlaying);
      }
    } catch (error) {
      console.error("loadAudio error:", error);
    }
  }

  /** ✅ 상태 업데이트 */
  function onPlaybackStatusUpdate(status: any) {
    if (!status.isLoaded) {
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      return;
    }
    if (!isSeekingRef.current) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
    }
    setIsPlaying(status.isPlaying);
    onPlayingChange?.(status.isPlaying);
  }

  /** ✅ 재생/일시정지 */
  const togglePlay = async () => {
    if (!playbackInstance) return;
    try {
      if (isPlaying) {
        await playbackInstance.pauseAsync();
        setIsPlaying(false);
      } else {
        await playbackInstance.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("togglePlay error", error);
    }
  };

  /** ✅ 이전/다음 트랙 */
  const prevTrack = async () => {
    if (currentIndex === null || currentIndex === 0) return;
    if (playbackInstance) {
      await playbackInstance.unloadAsync().catch(() => {});
      setPlaybackInstance(null);
    }
    setCurrentIndex(currentIndex - 1);
  };

  const nextTrack = async () => {
    if (currentIndex === null || currentIndex + 1 >= playerDataList.length) return;
    if (playbackInstance) {
      await playbackInstance.unloadAsync().catch(() => {});
      setPlaybackInstance(null);
    }
    setCurrentIndex(currentIndex + 1);
  };

  /** ✅ 닫기 버튼 → 완전 정지 */
  const handleClose = async () => {
    if (playbackInstance) {
      await playbackInstance.unloadAsync().catch(() => {});
      setPlaybackInstance(null);
      setIsPlaying(false);
    }
    onClose();
  };

  if (!visible) return null;
  if (currentIndex === null || isLoading) {
    return (
      <View style={styles.overlay}>
        <Text>Loading audio...</Text>
      </View>
    );
  }

  const currentItem = playerDataList[currentIndex];
  if (!currentItem) return <Text>재생할 트랙이 없습니다.</Text>;

  return (
    <View style={styles.overlay}>
      <View style={styles.audioCard}>
        {/* 상단 버튼 */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onMinimize}>
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
                { width: duration ? `${(position / duration) * 100}%` : "0%" },
              ]}
            />
          </View>
          <Text style={styles.progressTime}>{formatTime(duration)}</Text>
        </View>

        {/* 재생 컨트롤 */}
        <View style={styles.audioControls}>
          <TouchableOpacity onPress={prevTrack} disabled={currentIndex === 0}>
            <MaterialIcons
              name="chevron-left"
              size={32}
              color={currentIndex === 0 ? "#ccc" : "#333"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
            <MaterialIcons
              name={isPlaying ? "pause" : "play-arrow"}
              size={44}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextTrack}
            disabled={currentIndex === playerDataList.length - 1}
          >
            <MaterialIcons
              name="chevron-right"
              size={32}
              color={
                currentIndex === playerDataList.length - 1 ? "#ccc" : "#333"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ✅ 스타일 동일 */
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f7fafd",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    // ✅ 스크롤 방지
    overflow: "hidden",
  },
  audioCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    width: "92%",         // ✅ 살짝 여백만 두고
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 7,
    flexShrink: 0,        // ✅ 내부에서 스크롤 생기는 현상 방지
    overflow: "hidden",   // ✅ 내부 콘텐츠 넘침 방지
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 13,
    backgroundColor: "#dde3ea",
    marginBottom: 16,
  },
  audioTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1a2230",
    textAlign: "center",
    marginBottom: 2,
  },
  audioArtist: {
    fontSize: 13,
    color: "#9291b",
    textAlign: "center",
    marginBottom: 12,
  },
  progressBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  progressTime: {
    width: 38,
    textAlign: "right",
    fontSize: 12,
    color: "#7d869a",
  },
  progressBarOuter: {
    flex: 1,
    height: 3,
    backgroundColor: "#e1e7ef",
    marginHorizontal: 6,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#ff6542",
    borderRadius: 1,
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "88%",
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: "#ff6542",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#ff6542",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
