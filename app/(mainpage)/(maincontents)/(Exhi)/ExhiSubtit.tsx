import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAudioPlayer } from "../../../store/AudioPlayerContext";

type SubtitleLine = {
  start: number;
  end: number;
  text: string;
};

interface Props {
  exhibition: {
    title: string;
    artist?: string;
    thumbnail?: string;
    subtitles?: string;
    subtitlesUrl?: string;
  };
}

function ExhiSubtit({ exhibition }: Props) {
  const [loading, setLoading] = useState(true);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const lineHeightsRef = useRef<number[]>([]); // ✅ ref로도 관리
  const scrollRef = useRef<ScrollView>(null);
  const lastPositionRef = useRef<number>(0); // ✅ 마지막 체크한 position
  const { position } = useAudioPlayer(); // 전역 오디오 재생 위치(ms)

  // 🔹 SRT 파싱 함수
  const parseSRT = (srtText: string): SubtitleLine[] => {
    const blocks = srtText.split(/\n\s*\n/);
    const result: SubtitleLine[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").filter(Boolean);
      if (lines.length < 2) continue;

      const timeLine = lines[1];
      const textLines = lines.slice(2).join("\n").trim();

      const match = timeLine.match(
        /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/
      );
      if (!match) continue;

      const start =
        parseInt(match[1]) * 3600000 +
        parseInt(match[2]) * 60000 +
        parseInt(match[3]) * 1000 +
        parseInt(match[4]);
      const end =
        parseInt(match[5]) * 3600000 +
        parseInt(match[6]) * 60000 +
        parseInt(match[7]) * 1000 +
        parseInt(match[8]);

      result.push({ start, end, text: textLines });
    }

    return result;
  };

  // 🔹 SRT 파일 가져오기
  useEffect(() => {
    const url = exhibition.subtitles || exhibition.subtitlesUrl;
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchSubtitle = async () => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        const parsed = parseSRT(text);
        setSubtitles(parsed);
      } catch (e) {
        console.error("[ExhiSubtit] subtitle fetch error:", e);
        setSubtitles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtitle();
  }, [exhibition.subtitles, exhibition.subtitlesUrl]); // ✅ 전체 exhibition 객체 대신 url만 체크

  // 🔹 현재 재생 위치에 해당하는 자막 인덱스 계산 - throttled
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeIndexRef = useRef(-1);
  
  useEffect(() => {
    // ✅ 500ms 이상 차이날 때만 업데이트 (throttle)
    const diff = Math.abs(position - lastPositionRef.current);
    if (diff < 500 && lastPositionRef.current !== 0) return;
    
    lastPositionRef.current = position;
    
    // ✅ activeIndex 계산
    const newActiveIndex = subtitles.findIndex(
      (line) => position >= line.start && position <= line.end
    );
    
    // ✅ 인덱스가 변경될 때만 상태 업데이트
    if (newActiveIndex !== activeIndexRef.current) {
      activeIndexRef.current = newActiveIndex;
      setActiveIndex(newActiveIndex);
    }
  }, [position, subtitles]); // ✅ activeIndex dependency 제거

  const lastScrollIndex = useRef<number>(-1); // ✅ 마지막 스크롤 인덱스 추적

  // 🔹 자동 스크롤 처리 (throttled)
  useEffect(() => {
    if (activeIndex < 0 || !scrollRef.current || lineHeightsRef.current.length === 0) return;
    
    // ✅ 같은 인덱스면 스크롤하지 않음 (무한 스크롤 방지)
    if (lastScrollIndex.current === activeIndex) return;
    
    lastScrollIndex.current = activeIndex;

    // 이전 줄들 높이 합 계산 (scroll offset) - ref 사용
    const offset = lineHeightsRef.current.slice(0, activeIndex).reduce((sum, h) => sum + h, 0);

    scrollRef.current.scrollTo({
      y: Math.max(0, offset - 100), // 약간 위로 띄워 보여주기
      animated: true,
    });
  }, [activeIndex]); // ✅ lineHeights dependency 제거

  // 🔹 각 줄의 실제 높이 기록 (스크롤 위치 계산용) - 메모이제이션
  const handleLayout = useCallback((index: number, e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setLineHeights((prev) => {
      // ✅ 같은 값이면 업데이트하지 않음 (불필요한 리렌더링 방지)
      if (prev[index] === height) return prev;
      const copy = [...prev];
      copy[index] = height;
      // ✅ ref도 함께 업데이트
      lineHeightsRef.current = copy;
      return copy;
    });
  }, []);

  // 🔹 로딩 상태
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.gray}>자막을 불러오는 중...</Text>
      </View>
    );
  }

  // 🔹 자막 없음
  if (!subtitles.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.gray}>자막 정보가 없습니다.</Text>
      </View>
    );
  }

  // 🔹 자막 렌더링
  return (
    <ScrollView ref={scrollRef} style={styles.container}>
     <Text style={styles.subtitleTitle}>전시 해설 전문 </Text>
      {subtitles.map((line, i) => (
        <View
          key={i}
          onLayout={(e) => handleLayout(i, e)}
          style={[
            styles.subtitleBlock,
            i === activeIndex && styles.activeBlock,
          ]}
        > 
          <Text
            style={[
              styles.subtitleText,
              i === activeIndex && styles.activeText,
            ]}
          >
            {line.text}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 12,
    maxHeight: 300, // 자막 영역 제한 (필요시 조정)
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    
  },
  subtitleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  subtitleBlock: {
    paddingVertical: 6,
    borderRadius: 8,

    marginBottom: 6,
  },
  subtitleText: {
  fontWeight: "300",
    fontSize: 14,
    lineHeight: 22,
  },
  activeBlock: {
    backgroundColor: "#F1F5F9",
  },
  activeText: {
    fontWeight: "700",
    color: "#000000",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  gray: { color: "#888" },
});

// ✅ React.memo로 감싸서 props가 실제로 변경될 때만 리렌더링
export default React.memo(ExhiSubtit, (prevProps, nextProps) => {
  // subtitlesUrl과 subtitles만 비교
  return (
    prevProps.exhibition.subtitlesUrl === nextProps.exhibition.subtitlesUrl &&
    prevProps.exhibition.subtitles === nextProps.exhibition.subtitles
  );
});
