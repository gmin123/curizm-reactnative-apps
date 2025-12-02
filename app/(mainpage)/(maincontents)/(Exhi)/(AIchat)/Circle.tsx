import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
  progress: number; // 0 ~ 1
  isPlaying: boolean;
  onToggle: () => void;
  showStopWhenPlaying?: boolean; // ✅ 재생 중일 때 정지 아이콘 표시 여부
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgressPlayButton({
  progress,
  isPlaying,
  onToggle,
  showStopWhenPlaying = false,
}: Props) {
  const size = 64;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 애니메이션 값
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // progress 유효성 검증
    if (typeof progress !== "number" || isNaN(progress) || !isFinite(progress)) return;

    Animated.timing(animatedProgress, {
      toValue: progress >= 1 ? 1.001 : progress, // 완전한 원 표현
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1.001],
    outputRange: [circumference, 0],
  });

  return (
    <TouchableOpacity onPress={onToggle} style={styles.wrapper}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff5b55"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.iconOverlay}>
        <MaterialIcons
          name={
            isPlaying 
              ? (showStopWhenPlaying ? "stop" : "pause")
              : "play-arrow"
          }
          size={32}
          color="#111"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  iconOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
