import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ExhiPageModal from "../../../(mainpage)/(maincontents)/(Exhi)/ExhiPageModal";
import { OffArtistList } from "./offArtistList";
import OffExhiAudioPlayer, { AudioItem } from "./offExhiAudioPlayer";
import OffExhiNotes from "./offExhiNotes";
import { Styles } from "./page.style";

const META_DIR = `${FileSystem.documentDirectory}meta/`;

export default function OffExhiPage() {
  const navigation = useNavigation();
  const { id, initialTab } = useLocalSearchParams<{
    id: string;
    initialTab?: "docent" | "artist" | "community";
  }>();

  const [exhibitData, setExhibitData] = useState<any | null>(null);
  const [tab, setTab] = useState<"docent" | "artist" | "community">(
    initialTab || "docent"
  );
  const [audioVisible, setAudioVisible] = useState(false);
  const [initialTrackId, setInitialTrackId] = useState<string | undefined>();
  const [exhiLiked, setExhiLiked] = useState(false);
  const [exhiLikeBusy, setExhiLikeBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const worksRef = useRef<AudioItem[]>([]);

  /** ✅ Expo FileSystem에서 오프라인 전시 불러오기 */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function loadOfflineExhibit() {
      try {
        console.log("📦 [오프라인 전시 로드 시도]:", id);
        const filePath = `${META_DIR}downloadedExhibition_${id}.json`;
        const exists = await FileSystem.getInfoAsync(filePath);

        if (!exists.exists) {
          console.warn("⚠️ [저장된 전시 데이터 없음]:", id);
          setExhibitData(null);
          return;
        }

        const jsonStr = await FileSystem.readAsStringAsync(filePath);
        const parsed = JSON.parse(jsonStr);
        console.log("✅ [오프라인 전시 불러오기 완료]:", parsed.title);
        setExhibitData(parsed);

        if (parsed.artworks && Array.isArray(parsed.artworks)) {
          worksRef.current = parsed.artworks.map((art: any) => ({
            id: art.id,
            title: art.title,
            artist: art.artist,
            thumbnail: art.localThumbUri,
            sound: art.localAudioUri,
            durationTime: art.durationTime,
          }));
        }
      } catch (error) {
        console.error("❌ [FileSystem에서 전시 데이터 로드 실패]", error);
      } finally {
        setLoading(false);
      }
    }

    loadOfflineExhibit();
  }, [id]);

  /** ❤️ 좋아요 토글 */
  const onToggleExhiLike = async () => {
    if (exhiLikeBusy) return;
    setExhiLikeBusy(true);
    setExhiLiked((prev) => !prev);
    setTimeout(() => setExhiLikeBusy(false), 500);
  };

  /** 🎧 도슨트 듣기 */
  const onPressDocent = () => {
    const works = worksRef.current ?? [];
    if (!works.length) {
      Alert.alert("안내", "작품 목록을 아직 불러오지 못했어요.");
      return;
    }
    setInitialTrackId(works[0]?.id || undefined);
    setAudioVisible(true);
  };

  /** 🎨 작품 클릭 */
  const onSelectArtwork = (index: number) => {
    const works = worksRef.current ?? [];
    if (index >= 0 && index < works.length) {
      setInitialTrackId(works[index].id);
      setAudioVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={Styles.centered}>
        <ActivityIndicator size="large" />
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (!exhibitData) {
    return (
      <View style={Styles.centered}>
        <Text>저장된 전시 데이터가 없습니다.</Text>
      </View>
    );
  }

  const snap = exhibitData;
  const cover = snap.coverImageUri || undefined;
  const intro = snap.introduction || "";
  const likes = snap.likesCount ?? snap.likes ?? 0;
  const thoughts = snap.thoughtsCount ?? snap.thoughts ?? 0;
  const artworks = snap.artworks || [];

  return (
    <>
      {/* 🎧 오디오 플레이어 */}
      {audioVisible && (
        <OffExhiAudioPlayer
          visible={audioVisible}
          onMinimize={() => setAudioVisible(false)}
          onClose={() => setAudioVisible(false)}
          playerDataList={worksRef.current}
          initialTrackId={initialTrackId}
        />
      )}

      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 상단 헤더 */}
        <View style={Styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={Styles.likeButton}
              onPress={onToggleExhiLike}
              disabled={exhiLikeBusy}
            >
              <Ionicons
                name={exhiLiked ? "heart" : "heart-outline"}
                size={24}
                color={exhiLiked ? "#ef4444" : "#333"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 커버 이미지 */}
        {cover && (
          <Image
            source={{ uri: cover }}
            style={Styles.coverImage}
            resizeMode="cover"
          />
        )}

        {/* 전시 설명 */}
        <View style={Styles.content}>
          <Text style={Styles.title}>{snap.title}</Text>
          <Text style={Styles.metaText}>
            ♥ {likes.toLocaleString()} · 생각 {thoughts.toLocaleString()}
          </Text>
          {!!intro && (
            <View style={Styles.introContainer}>
              <Text style={Styles.introText} numberOfLines={3}>
                {intro}
              </Text>
              <Text style={Styles.moreText} onPress={() => setModalVisible(true)}>
                더보기
              </Text>
            </View>
          )}
          <View style={Styles.buttonsRow}>
            <TouchableOpacity style={Styles.listenButton} onPress={onPressDocent}>
              <Text style={Styles.listenButtonText}>도슨트 듣기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.downloadButton}>
              <Text style={Styles.downloadButtonText}>다운로드 완료</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 탭 메뉴 */}
        <View style={Styles.tabBarContainer}>
          {(["docent", "artist", "community"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setTab(type)}
              style={[Styles.tabItem, tab === type && Styles.activeTab]}
            >
              <Text
                style={[Styles.tabText, tab === type && Styles.activeTabText]}
              >
                {type === "docent"
                  ? "도슨트"
                  : type === "artist"
                  ? "작가"
                  : "커뮤니티"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 탭 콘텐츠 */}
        {tab === "docent" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            {artworks.length > 0 ? (
              artworks.map((art: any, idx: number) => (
                <TouchableOpacity
                  key={art.id || idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                  onPress={() => onSelectArtwork(idx)}
                >
                  <Image
                    source={{ uri: art.localThumbUri || art.thumbnail }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      backgroundColor: "#eee",
                    }}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                      {art.title || "무제"}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 13 }}>
                      {art.artist || ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text
                style={{ textAlign: "center", color: "#aaa", marginTop: 20 }}
              >
                작품이 없습니다.
              </Text>
            )}
          </View>
        )}

        {tab === "artist" && (
          <OffArtistList exhibitionId={id} artists={snap.artists || []} />
        )}

        {tab === "community" && (
          <OffExhiNotes exhibitionId={id} notes={snap.notes || []} />
        )}

        {/* 전시 정보 모달 */}
        {modalVisible && (
          <ExhiPageModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            detail={{
              id: snap.id,
              title: snap.title,
              organizer: snap.organizer,
              coverImage: snap.coverImageUri,
              viewingTime: undefined,
              address: undefined,
              startDate: snap.startDate,
              endDate: snap.endDate,
              introduction: snap.introduction,
              likes: snap.likes,
              likesCount: snap.likesCount,
              thoughts: snap.thoughts,
              thoughtsCount: snap.thoughtsCount,
              sound: undefined,
              durationTime: undefined,
              price: undefined,
              priceCoins: undefined,
              tts: undefined,
              subtitles: undefined,
              memberLike: exhiLiked,
            }}
          />
        )}
      </ScrollView>
    </>
  );
}
