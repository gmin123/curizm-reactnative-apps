import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAudioPlayer } from "../../../store/AudioPlayerContext";
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
}

export default function MiniAudioPlayer() {
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
    isFullScreenPlayerVisible,
  } = useAudioPlayer();

  const router = useRouter();

  if (!trackList || !Array.isArray(trackList) || trackList.length === 0) return null;
  if (typeof currentIndex !== "number" || currentIndex < 0 || currentIndex >= trackList.length) return null;
  if (isFullScreenPlayerVisible) return null; // 전체 화면 플레이어가 열려있으면 미니 플레이어 숨기기

  const currentItem = trackList[currentIndex];
  if (!currentItem) return null;

  const handleMiniPlayerPress = () => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
      params: {
        visible: "true",
      },
    });
  };

  return (
    <TouchableOpacity style={styles.miniPlayerWrap} onPress={handleMiniPlayerPress} activeOpacity={0.8}>
      <Image
        source={currentItem.thumbnail ? { uri: currentItem.thumbnail } : require("../../../../assets/images/icon.png")}
        style={styles.coverImg}
      />
      <View style={styles.infoArea}>
        <Text numberOfLines={1} style={styles.title}>
          {currentItem.title}
        </Text>
        <Text numberOfLines={1} style={styles.subTitle}>
          {currentItem.artist || ""}
        </Text>
      </View>
      <TouchableOpacity onPress={(e) => {
        e.stopPropagation(); // 부모 TouchableOpacity의 onPress 방지
        togglePlay();
      }}>
        <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={32} color="#222" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}