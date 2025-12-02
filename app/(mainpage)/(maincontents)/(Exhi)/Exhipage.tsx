
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getExhibitionArtists, type ExhibitionArtist } from "../../../../api/exhi/getExhibitionArtists";
import { getExhibitionDetailData } from "../../../../api/exhi/getExhibitionDetail";
import * as LikeAPI from "../../../../api/like";
import { useAuth } from "../../../context/AuthContext";

import { useAudioPlayer } from "../../../store/AudioPlayerContext"; // 전역 오디오 컨텍스트 경로에 맞게 수정
import { ArtistList } from "./ArtistList";
import { ExhiArtworks } from "./ExhiArtworks";
import ExhiAudioPlayer, { AudioItem } from "./ExhiAudioPlayer";

import ExhiNotes from "./ExhiNotes";
import MiniAudioPlayer from "./MiniAudioPlayer";

import { downloadExhibition } from '../../../constants/download'; // 실제 파일 위치에 맞게 import
import AudioQuestionInput from "./(AIchat)/AudioQuestionInput";
import ExhiPageModal from "./ExhiPageModal";
import { Styles } from "./page.style";

type ExhibitDetail = {
  id: string;
  title: string;
  organizer: string;
  coverImage: string | null | undefined;
  startDate: string;
  endDate: string;
  introduction: string | null;
  likes?: number;
  likesCount?: number;
  thoughts?: number;
  thoughtsCount?: number;
};

export default function ExhiPage() {
  const { currentIndex, position, setTrackList, setCurrentIndex, setIsPlaying, setPosition } = useAudioPlayer();

  const onPressDownload = async () => {
    if (!user || !token) {
      Alert.alert("로그인이 필요해요", "전시를 다운로드하려면 로그인해주세요.");
      return;
    }
  
    try {
      const exhibit = exhibitSnapRef.current;
      const works = worksRef.current;
      const artists = artistList; // ✅ 추가
  
      console.log("다운로드 시도:", exhibit);
  
      if (!exhibit || !works || works.length === 0) {
        Alert.alert("다운로드 불가", "데이터가 완전히 준비되지 않았습니다.");
        return;
      }
  
      const result = await downloadExhibition({
        id: exhibit.id,
        title: exhibit.title,
        coverImage: exhibit.coverImage || "",
        introduction: exhibit.introduction || "",
        artworks: works.map((w) => ({
          id: w.id,
          title: w.title,
          artist: w.artist,
          sound: w.sound,
          thumbnail: w.thumbnail,
          durationTime: w.durationTime,
        })),
        artists: artists.map((a) => ({
          id: a.id,
          name: a.name,
          profileImage: a.profileImg, // ✅ API 필드명에 맞게 수정
        })),
      });
  
      console.log("다운로드 성공 결과:", result);
      Alert.alert("다운로드 완료", "오프라인 저장이 완료되었습니다.");
    } catch (e) {
      console.error("다운로드 에러 발생:", e);
      Alert.alert("다운로드 실패", "오류가 발생했습니다.");
    }
  };
  

  const navigation = useNavigation();
  const { id, initialTab, coverImage: routeCoverImage } = useLocalSearchParams<{ id: string; initialTab?: "docent" | "artist" | "community"; coverImage?: string }>();
  const { user } = useAuth();

  const token = user?.token || "";

  const [exhibitData, setExhibitData] = useState<ExhibitDetail | null>(null);
  const exhibitSnapRef = useRef<ExhibitDetail | null>(null);

  const [tab, setTab] = useState<"docent" | "artist" | "community">(initialTab || "docent");
  const [audioVisible, setAudioVisible] = useState(false);
  const [aiInputVisible, setAiInputVisible] = useState(false); // AI챗 입력창(질문) 노출 여부
  const [showPip, setShowPip] = useState(false);
  const [initialTrackId, setInitialTrackId] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false); // 전시 정보 모달 표시 여부

  const [loading, setLoading] = useState(true);

  const [artistList, setArtistList] = useState<ExhibitionArtist[]>([]);
  const [artistPage, setArtistPage] = useState(1);
  const [artistTotal, setArtistTotal] = useState(0);
  const [artistLoadingMore, setArtistLoadingMore] = useState(false);

  const [exhiLiked, setExhiLiked] = useState(false);
  const [exhiLikeBusy, setExhiLikeBusy] = useState(false);

  const worksRef = useRef<AudioItem[]>([]);
  const currentItem = worksRef.current[currentIndex ?? 0];

  // ✅ onSyncWorks 메모이제이션 (ExhiArtworks 리렌더링 방지)
  const handleSyncWorks = useCallback((works: any[]) => {
    console.log("ExhiArtworks에서 전달된 works:", works);
    const audioItems: AudioItem[] = works.map((artwork) => ({
      id: artwork.id,
      title: artwork.name,
      artist: artwork.artistName || "",
      thumbnail: artwork.thumbnail || "",
      sound: artwork.sound || "",
      exhibitionId: id || "",
      durationTime: artwork.durationTime,
      subtitlesUrl: artwork.subtitlesUrl ?? "",
    }));
    worksRef.current = audioItems;
    console.log('audioItems:', audioItems);
  }, [id]);

  // ✅ 초기 데이터 로드
  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      try {
        const [detail, artistsPage1] = await Promise.all([
          getExhibitionDetailData(String(id)),
          getExhibitionArtists(String(id), 1),
        ]);

        if (!alive) return;

        console.log("📥 [useEffect] detail 데이터:", detail);
        console.log("📥 [useEffect] detail.likes:", detail.likes, "detail.likesCount:", detail.likesCount);
        console.log("📥 [useEffect] detail.thoughts:", detail.thoughts, "detail.thoughtsCount:", detail.thoughtsCount);

        const exhibitDetail: ExhibitDetail = {
          ...detail,
          coverImage: detail.coverImage ?? null,
          introduction: detail.introduction ?? null,
        };
        exhibitSnapRef.current = exhibitDetail;
        setExhibitData(exhibitDetail);
        setArtistList(artistsPage1.artists ?? []);
        setArtistTotal(artistsPage1.total ?? (artistsPage1.artists ?? []).length);
        setArtistPage(1);
      } catch (err: any) {
        console.error("전시/작가 정보 에러:", err);
        Alert.alert("데이터 로드 실패", err.message || "");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // 좋아요 상태 조회
  useEffect(() => {
    (async () => {
      if (!id || !token) {
        setExhiLiked(false);
        return;
      }
      try {
        const api = (LikeAPI as any).apiIsExhibitionLiked || (LikeAPI as any).getExhibitionLikeStatus;
        if (api) {
          const r = await api(token, String(id));
          setExhiLiked(!!(r?.liked ?? r === true));
        }
      } catch {
        setExhiLiked(false);
      }
    })();
  }, [id, token]);

  // 도슨트 듣기 버튼 클릭
  const onPressDocent = () => {
    console.log('도슨트 듣기 진입 worksRef.current:', worksRef.current);
    const works = worksRef.current ?? [];
    if (!works.length) {
      Alert.alert("안내", "작품 목록을 아직 불러오지 못했어요.");
      return;
    }
    setTrackList(works);
    setCurrentIndex(0);
    setIsPlaying(true);
    setPosition(0);
    setInitialTrackId(works[0]?.id || undefined);
    setAudioVisible(true);
    setAiInputVisible(false);
    setShowPip(false);
  };

  // 작품 선택
  const onSelectArtwork = (workIndex: number) => {
    const works = worksRef.current ?? [];
    if (workIndex >= 0 && workIndex < works.length) {
      setTrackList(works);
      setCurrentIndex(workIndex);
      setIsPlaying(true);
      setPosition(0);
      setInitialTrackId(works[workIndex].id);
      setAudioVisible(true);
      setAiInputVisible(false);
      setShowPip(false);
    }
  };

  // 전시 좋아요 토글
  const onToggleExhiLike = async () => {
    if (!id) return;
    if (!token) {
      Alert.alert("로그인이 필요해요");
      return;
    }
    if (exhiLikeBusy) return;

    setExhiLikeBusy(true);
    const optimistic = !exhiLiked;
    setExhiLiked(optimistic);
    try {
      const toggle = (LikeAPI as any).apiToggleLikeExhibition || (LikeAPI as any).toggleExhibitionLike;
      if (toggle) await toggle(token, String(id));
    } catch {
      setExhiLiked(!optimistic);
      Alert.alert("오류", "전시 좋아요 처리 실패");
    } finally {
      setExhiLikeBusy(false);
    }
  };

  // AudioQuestionInput 열기(예시)
  const openAIInput = () => {
    setAiInputVisible(true);
    setAudioVisible(false);
    setShowPip(false);
  };

  const closeAIInput = () => {
    setAiInputVisible(false);
    setShowPip(true);
  };

  const handleAudioClose = () => {
    setAudioVisible(false);
    setShowPip(true);
  };

  if (loading) {
    return (
      <View style={Styles.centered}>
        <ActivityIndicator size="large" />
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (!id) {
    return (
      <View style={Styles.centered}>
        <Text>잘못된 접근입니다.</Text>
      </View>
    );
  }

  if (!exhibitSnapRef.current) {
    return (
      <View style={Styles.centered}>
        <Text>전시 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const snap = exhibitSnapRef.current;
  const cover = (snap.coverImage && snap.coverImage.trim() !== "" ? snap.coverImage : undefined)
    || (typeof routeCoverImage === "string" && routeCoverImage.trim() !== "" ? routeCoverImage : undefined)
    || (worksRef.current[0]?.thumbnail && worksRef.current[0]?.thumbnail.trim() !== "" ? worksRef.current[0]?.thumbnail : undefined);
  const intro = snap.introduction || "";
  const likes = snap.likesCount ?? snap.likes ?? 0;
  const thoughts = snap.thoughtsCount ?? snap.thoughts ?? 0;
  
  // 디버깅 로그
  console.log("🔍 [Exhipage] snap 데이터:", {
    likesCount: snap.likesCount,
    likes: snap.likes,
    thoughtsCount: snap.thoughtsCount,
    thoughts: snap.thoughts,
    최종_likes: likes,
    최종_thoughts: thoughts
  });

  return (
    
    <ScrollView style={Styles.container}>
      {/* 상단 헤더 */}
      <View style={Styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View className="exhipagetopiconcontainer">
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={Styles.likeButton} onPress={onToggleExhiLike} disabled={exhiLikeBusy}>
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
        <Image source={{ uri: cover }} style={Styles.coverImage} resizeMode="cover" />
      )}

      {/* 내용 카드 */}
      <View style={Styles.content}>
        <Text style={Styles.title}>{snap.title}</Text>
        <Text style={Styles.metaText}>
          ♥ {likes ? likes.toLocaleString() : "0"} · 생각 {thoughts ? thoughts.toLocaleString() : "0"}
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
          <TouchableOpacity
  style={[
    Styles.downloadButton,
    !user && { backgroundColor: "#d1d5db" }, // 비로그인 시 회색 처리
  ]}
  onPress={() => {
    if (!user || !token) {
      Alert.alert("로그인이 필요해요", "전시를 다운로드하려면 로그인해주세요.");
      return;
    }
    onPressDownload();
  }}
  disabled={!user || !token} // 로그인 안되어 있으면 비활성화
>
  <Text
    style={[
      Styles.downloadButtonText,
      !user && { color: "#9ca3af" }, // 회색 텍스트
    ]}
  >
    다운로드
  </Text>
</TouchableOpacity>

        </View>
      </View>

      {/* 탭 메뉴 */}
      <View style={Styles.tabBarContainer}>
        {(["docent", "artist", "community"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setTab(type)}
            style={[Styles.tabItem, tab === type ? Styles.activeTab : null]}
          >
            <Text style={[Styles.tabText, tab === type ? Styles.activeTabText : null]}>
              {type === "docent" ? "도슨트" : type === "artist" ? "작가" : "커뮤니티"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 콘텐츠 */}
      {tab === "community" ? (
        <ExhiNotes exhibitionId={id} />
      ) : tab === "artist" ? (
        <ArtistList exhibitionId={id} />
      ) : (
        <ExhiArtworks
          exhibitionId={id}
          onSelectWork={onSelectArtwork}
          onSyncWorks={handleSyncWorks}
        />
      )}

      {/* 오디오 플레이어 */}
      {audioVisible && (
        <ExhiAudioPlayer
          visible={audioVisible}
          onMinimize={handleAudioClose}
          onClose={handleAudioClose}
        />
      )}

      {/* AI 질문 입력 플레이어 */}
      {aiInputVisible && (
        <AudioQuestionInput onClose={closeAIInput} />
      )}

      {/* ✅ 미니 오디오 플레이어는 ExhiPage에서 숨김 */}
      {false && !audioVisible && !aiInputVisible && showPip && (
        <MiniAudioPlayer />
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
            coverImage: snap.coverImage,
            viewingTime: undefined, // 이 데이터가 있다면 추가
            address: undefined, // 이 데이터가 있다면 추가
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
  );
}
