import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { askExhibitionQuestion } from "../../../../../api/AI/AIChat";
import { useAuth } from "../../../../context/AuthContext";
import { useAudioPlayer } from "../../../../store/AudioPlayerContext";
import { styles } from "./audio.style";
import CircularProgressPlayButton from "./Circle";
import CuriTypingBubble from "./CuriTypingBubble";

const { height: SCREEN_H } = Dimensions.get("window");

type ChatBubble = {
  id: string;
  type: "curi" | "user";
  text: string;
  share?: boolean;
};

interface AudioQuestionInputProps {
  item?: {
    title?: string;
    artist?: string;
    thumbnail?: string;
    sound?: string;
    id?: string;
    exhibitionId?: string;
  };
  onClose?: () => void;
}

const defaultItem = {
  id: "",
  title: "전시 제목 또는 작품 제목",
  artist: "전시 장소 또는 작가 이름",
  thumbnail: "",
  exhibitionId: "",
};

const defaultThumbnail = require("../../../../../assets/images/icon.png");

export default function AudioQuestionInput({
  item,
  onClose,
}: AudioQuestionInputProps) {
  const {
    trackList,
    currentIndex,
    isPlaying: globalIsPlaying,
    position: globalPosition,
    duration: globalDuration,
    togglePlay,
  } = useAudioPlayer();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const token = user?.token;
  const router = useRouter();

  let safeItem = null;
  if (
    trackList &&
    trackList.length > 0 &&
    typeof currentIndex === "number" &&
    currentIndex >= 0
  ) {
    safeItem = trackList[currentIndex];
  } else {
    safeItem = { ...defaultItem, ...item, ...params };
  }
  const imageSource = safeItem.thumbnail
    ? { uri: safeItem.thumbnail }
    : defaultThumbnail;

  const [inputText, setInputText] = useState("");
  const [chat, setChat] = useState<ChatBubble[]>([
    {
      id: "intro",
      type: "curi",
      text: "안녕하세요 Curi입니다. 작품을 보고 궁금한게 있으신가요?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  
  // 슬라이드 제스처를 위한 위치 추적
  const slideY = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync("questionCount");
        if (stored) {
          const parsed = JSON.parse(stored);
          const now = new Date();
          const lastReset = new Date(parsed.lastReset);
          const diff =
            (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
          if (diff >= 24) {
            await SecureStore.setItemAsync(
              "questionCount",
              JSON.stringify({ count: 0, lastReset: now.toISOString() })
            );
            setQuestionCount(0);
          } else {
            setQuestionCount(parsed.count);
          }
        } else {
          await SecureStore.setItemAsync(
            "questionCount",
            JSON.stringify({ count: 0, lastReset: new Date().toISOString() })
          );
        }
      } catch (e) {
        console.log("질문 카운트 불러오기 실패:", e);
      }
    })();
  }, []);

  const easyQuestions =
    safeItem.title !== defaultItem.title
      ? ["이 그림을 그린 작가에 대해 설명해줘", "색감에 대해 설명해줘"]
      : [];

  // 슬라이드 제스처 핸들러
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // 수직 방향으로만 슬라이드 감지
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (_, gestureState) => {
      slideY.current = gestureState.dy;
    },
    onPanResponderRelease: (_, gestureState) => {
      // 아래로 50px 이상 슬라이드하면 뒤로가기
      if (gestureState.dy > 50) {
        if (onClose) {
          onClose();
        } else {
          router.back();
        }
      }
    },
  });

  const handleSend = async (q?: string) => {
    const question = (q ?? inputText).trim();
    console.log("🔍 handleSend 호출됨:", { question, loading, exhibitionId: safeItem.exhibitionId, token });
    if (!question || loading) {
      console.log("⛔ 질문 전송 스킵:", { question: !!question, loading });
      return;
    }

    const stored = await SecureStore.getItemAsync("questionCount");
    let parsed = stored
      ? JSON.parse(stored)
      : { count: 0, lastReset: new Date().toISOString() };

    console.log("📊 질문 횟수 체크:", { count: parsed.count, token: !!token });

    const limit = token ? 5 : 3;
    if (parsed.count >= limit) {
      console.log("⛔ 질문 횟수 제한 도달:", { count: parsed.count, limit });
      if (!token) {
        router.push("/(Login)/LoginChoiceScreen");
        return;
      } else {
        setLimitModalVisible(true);
        return;
      }
    }

    console.log("✅ 질문 횟수 체크 통과, 계속 진행");

    parsed.count += 1;
    await SecureStore.setItemAsync("questionCount", JSON.stringify(parsed));
    setQuestionCount(parsed.count);

    const userMsg: ChatBubble = {
      id: `${Date.now()}`,
      type: "user",
      text: question,
    };

    // ✅ 로딩 버블 추가
    setChat((prev) => [
      ...prev,
      userMsg,
      { id: "loading", type: "curi", text: "__loading__" },
    ]);
    setInputText("");
    setLoading(true);

    // ✅ 렌더링 여유 시간 확보
    await new Promise((r) => setTimeout(r, 250));

    try {
      // ✅ 토큰을 함께 전달
      console.log("📤 API 호출 시작:", { exhibitionId: safeItem.exhibitionId, question, token: !!token });
      const data = await askExhibitionQuestion(safeItem.exhibitionId, question, token);
      console.log("✅ API 응답 성공:", data);
      setChat((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({
            id: `${Date.now()}_ai`,
            type: "curi",
            text: data?.answer ?? "답변을 가져올 수 없습니다.",
            share: true,
          })
      );
    } catch (error: any) {
      console.error("❌ AI 답변 오류:", error);
      console.error("❌ 에러 상세:", error.message, error.stack);
      setChat((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({
            id: `${Date.now()}_ai`,
            type: "curi",
            text: `AI 답변을 가져오지 못했습니다: ${error.message}`,
          })
      );
    }

    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const handleShare = (text: string) => Share.share({ message: text });

  const renderBubble = ({ item }: { item: ChatBubble }) => {
    if (item.text === "__loading__") {
      return (
        <View style={[styles.bubble, styles.curiBubble]}>
          <CuriTypingBubble />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.bubble,
          item.type === "user" ? styles.userBubble : styles.curiBubble,
        ]}
      >
        <Text
          style={{
            color: item.type === "user" ? "white" : "#222",
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {item.text}
        </Text>
        {item.share && (
          <TouchableOpacity
            onPress={() => handleShare(item.text)}
            style={styles.shareBtn}
          >
            <Text
              style={{ color: "#ff5b55", fontWeight: "600", fontSize: 12 }}
            >
              생각 공유하기
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const isPlaying =
    typeof globalIsPlaying === "boolean" ? globalIsPlaying : false;
  const progress =
    typeof globalPosition === "number" &&
    typeof globalDuration === "number" &&
    globalDuration > 0
      ? globalPosition / globalDuration
      : 0;

  const handlePlayToggle = () => {
    togglePlay();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* 헤더 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onClose ? onClose : () => router.back()} style={{ padding: 8 }}>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={imageSource} style={styles.thumbnail} />
        <View style={styles.metaBox}>
          <Text style={styles.title}>{safeItem.title}</Text>
          <Text style={styles.artist}>{safeItem.artist}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => handleShare(safeItem.title || "")}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 12 }}>
            <Ionicons name="heart" size={24} color="#333" />
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            <CircularProgressPlayButton
              progress={progress}
              isPlaying={isPlaying}
              onToggle={handlePlayToggle}
            />
          </View>
        </View>
      </View>
      
      {/* 슬라이드 막대기 */}
      <View {...panResponder.panHandlers}>
        <View style={styles.slideHandle} />
      </View>
      
      <Text style={styles.infoText}>
        Curi는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.
      </Text>

      <FlatList
        ref={flatListRef}
        data={chat}
        renderItem={renderBubble}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.chatContentContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
        style={styles.chatList}
      />

      {/* 질문 제안 섹션 */}
      {easyQuestions.length > 0 && (
        <View style={styles.suggestedQuestionsContainer}>
          <View style={styles.suggestedHeader}>
            <MaterialIcons name="info" size={16} color="#ff5b55" />
            <Text style={styles.suggestedHeaderText}>이렇게 질문해 보세요</Text>
          </View>
          <View style={styles.easyQRow}>
            {easyQuestions.map((q, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleSend(q)}
                style={styles.easyQBtn}
              >
                <Text style={styles.easyQText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.bottomBox}>
        <TextInput
          placeholder="생각을 적어주세요"
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          editable={!loading}
          onSubmitEditing={() => handleSend()}
          maxLength={100}
        />
        <View style={styles.countSendBtnGroup}>
          <Text style={styles.charCount}>{`${inputText.length}/100`}</Text>
          <TouchableOpacity
            onPress={() => handleSend()}
            style={styles.sendBtn}
            disabled={loading}
          >
            <MaterialIcons name="arrow-upward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 질문 제한 모달 */}
      <Modal
        visible={limitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLimitModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              width: 280,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
              질문 횟수를 모두 사용했습니다.
            </Text>
            <Text
              style={{
                color: "#555",
                textAlign: "center",
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              큐리즘은 현재 베타 버전으로 운영 중입니다.
              {"\n"}24시간 후 질문 횟수가 다시 충전됩니다.
            </Text>
            <TouchableOpacity
              onPress={() => setLimitModalVisible(false)}
              style={{
                backgroundColor: "#ff5b55",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
