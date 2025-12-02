// 파일: app/(mainpage)/(maincontents)/(Artist)/ArtistDetail.tsx
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { apiGetFollowedArtists } from "../../../../api/like";
import { useAuth } from "../../../context/AuthContext";
import { styles } from "./style"; // ✅ 스타일은 그대로 사용

type TabKey = "works" | "exhibitions";

type ArtistDetailData = {
  id: string;
  name: string;
  profileImg?: string;
  numberOfArtworks?: number;
  headerImage?: string;
  introduction?: string;
  latestExhibition?: {
    id?: string;
    title?: string;
    place?: string;
    organizer?: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
    thumbnail?: string;
  };
  artworks?: Array<{
    id: string;
    title: string;
    thumbnail?: string;
  }>;
  memberFollow?: boolean; // 서버/하이드레이션으로 확정
};

const API_BASE =
  "https://api.curizm.io";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const encodeOnce = (s: string) =>
  /%[0-9A-Fa-f]{2}/.test(s) ? s : encodeURIComponent(s);

// 상세 불러오기
async function fetchArtistDetail(id: string, token?: string): Promise<ArtistDetailData> {
  const url = `${API_BASE}/api/v1/artist/${encodeOnce(id)}`;
  const headers: HeadersInit = token
    ? { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { Accept: "application/json", "Content-Type": "application/json" };
  const res = await fetch(url, { method: "GET", headers });
  const raw = await res.text().catch(() => "");
  if (!res.ok) throw new Error(`artist detail http ${res.status} ${raw}`);
  const json = raw ? JSON.parse(raw) : {};

  const latest =
    json?.latestExhibition ||
    json?.representativeExhibition ||
    json?.exhibition ||
    undefined;

  const artworks: ArtistDetailData["artworks"] = Array.isArray(json?.artworks)
    ? json.artworks.map((a: any) => ({
        id: String(a?.id ?? a?.workId ?? ""),
        title: a?.title ?? a?.name ?? "",
        thumbnail: a?.thumbnail ?? a?.image ?? json?.firstArtworkThumbnail,
      }))
    : [];

  return {
    id: String(json?.id ?? id),
    name: json?.name ?? "-",
    profileImg: json?.profileImg ?? json?.image ?? undefined,
    numberOfArtworks:
      json?.numberOfArtworks ?? json?.artworksCount ?? artworks.length ?? 0,
    headerImage:
      json?.headerImage ?? json?.coverImage ?? json?.profileImg ?? json?.firstArtworkThumbnail,
    introduction: json?.introduction ?? json?.bio ?? "",
    latestExhibition: latest && {
      id: latest.id,
      title: latest.title,
      place: latest.place ?? latest.organizer,
      organizer: latest.organizer,
      startDate: latest.startDate,
      endDate: latest.endDate,
      coverImage: latest.coverImage ?? latest.image,
      thumbnail: latest.thumbnail,
    },
    memberFollow:
      typeof json?.memberFollow === "boolean" ? !!json.memberFollow : undefined,
  };
}

// HomeArtist.tsx와 동일한 간단한 방식 사용

export default function ArtistDetail() {
  const router = useRouter();

  // HomeArtist에서 넘어온 값이 있을 수 있음(초기 깜빡임 줄이기)
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    profileImg?: string;
    numberOfArtworks?: string;
    headerImage?: string;
  }>();

  const { user, isLoading: authLoading } = useAuth();
  const token = user?.token ?? undefined;
  const isLoggedIn = !!token;

  const mounted = useRef(true);

  const initialData: ArtistDetailData | null = React.useMemo(() => {
    if (!params?.id) return null;
    return {
      id: String(params.id),
      name: params.name ? String(params.name) : "-",
      profileImg: params.profileImg ? String(params.profileImg) : undefined,
      numberOfArtworks: params.numberOfArtworks ? Number(params.numberOfArtworks) : undefined,
      headerImage: params.headerImage ? String(params.headerImage) : undefined,
      introduction: "",
      artworks: [],
    };
  }, [params]);

  const [data, setData] = useState<ArtistDetailData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [tab, setTab] = useState<TabKey>("works");
  const [introModal, setIntroModal] = useState(false);

  const [toggling, setToggling] = useState(false);
  
  // HomeArtist.tsx와 동일한 팔로우 상태 관리 방식
  const [followStatus, setFollowStatus] = useState<boolean | null>(null); // null = 미확정, boolean = 확정

  // 기본 작가 정보 로드
  useEffect(() => {
    if (authLoading) return;
    mounted.current = true;
    const id = params?.id ? String(params.id) : undefined;
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const artistDetail = await fetchArtistDetail(id, token);
        
        if (!mounted.current) return;

        console.log("🎨 ArtistDetail 기본 정보 로드:", {
          artist: artistDetail.name,
          serverFollow: artistDetail.memberFollow
        });

        // 서버 데이터로 설정 (팔로우 상태는 별도 동기화)
        setData((prev) => ({ 
          ...(prev ?? {} as any), 
          ...artistDetail
        }));

      } catch (e: any) {
        console.error("[ArtistDetail] fetch error:", e?.message || e);
        if (!initialData) Alert.alert("오류", "작가 정보를 불러오지 못했어요.");
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();

    return () => { mounted.current = false; };
  }, [params?.id, token, authLoading]);

  // HomeArtist.tsx와 동일한 팔로우 동기화 방식
  useEffect(() => {
    if (!isLoggedIn || !token || !data?.id) {
      // 로그아웃 상태면 팔로우 상태 초기화
      setFollowStatus(false);
      return;
    }

    (async () => {
      try {
        console.log("🔍 팔로우 상태 동기화 시작:", data.id);
        
        const followedIds = new Set<string>();
        let page = 1;
        
        // 모든 팔로우한 작가 가져오기 (HomeArtist.tsx와 동일)
        for (let i = 0; i < 100; i++) {
          const res = await apiGetFollowedArtists(token, page);
          (res?.likedArtists ?? []).forEach((a) => followedIds.add(a.id));
          
          const got = (res?.likedArtists ?? []).length;
          const total = res?.total ?? got;
          if (got === 0 || followedIds.size >= total) break;
          page += 1;
        }

        const isFollowing = followedIds.has(data.id);
        
        console.log("🔍 팔로우 동기화 완료:", {
          artistId: data.id,
          artistName: data.name,
          totalFollowed: followedIds.size,
          isFollowing
        });

        // followStatus 상태로 관리 (HomeArtist.tsx와 동일한 방식)
        setFollowStatus(isFollowing);

      } catch (e) {
        console.error("🔍 팔로우 동기화 실패:", e);
        setFollowStatus(false); // 실패시 기본값
      }
    })();
  }, [token, isLoggedIn, data?.id]);

  // 화면 포커스 시 팔로우 상태 동기화 (HomeArtist.tsx와 동일한 방식)
  useFocusEffect(
    React.useCallback(() => {
      if (!data?.id || !isLoggedIn || !token) return;
      
      (async () => {
        try {
          console.log("🔍 포커스 시 팔로우 상태 재동기화:", data.id);
          
          const followedIds = new Set<string>();
          let page = 1;
          
          for (let i = 0; i < 100; i++) {
            const res = await apiGetFollowedArtists(token, page);
            (res?.likedArtists ?? []).forEach((a) => followedIds.add(a.id));
            
            const got = (res?.likedArtists ?? []).length;
            const total = res?.total ?? got;
            if (got === 0 || followedIds.size >= total) break;
            page += 1;
          }

          const isFollowing = followedIds.has(data.id);
          console.log("🔍 포커스 시 팔로우 상태:", { artistId: data.id, isFollowing });
          
          setFollowStatus(isFollowing);
        } catch (e) {
          console.warn("[ArtistDetail] 포커스 시 팔로우 상태 동기화 실패:", e);
        }
      })();
    }, [data?.id, isLoggedIn, token])
  );

  // 팔로우 토글
  const doToggleFollow = async () => {
    console.log("🎨 doToggleFollow 호출됨!", {
      hasData: !!data,
      isLoggedIn,
      toggling,
      followStatus,
      currentFollow: followStatus ?? false
    });

    if (!data) {
      console.log("🎨 data 없음으로 리턴");
      return;
    }
    if (!isLoggedIn) {
      console.log("🎨 로그인 안됨으로 알림");
      Alert.alert("로그인이 필요합니다", "팔로우 기능은 로그인해주세요.");
      return;
    }
    if (toggling) {
      console.log("🎨 이미 토글 중이라 리턴");
      return;
    }

    setToggling(true);
    const prevFollow = followStatus ?? false; // HomeArtist.tsx와 동일하게 followStatus 사용
    const nextFollow = !prevFollow;

    console.log("🎨 팔로우 토글:", {
      artistId: data.id,
      artistName: data.name,
      from: prevFollow,
      to: nextFollow
    });

    // 낙관적 업데이트 (HomeArtist.tsx와 동일)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFollowStatus(nextFollow);

    try {
      // HomeArtist.tsx와 동일한 방식으로 직접 fetch 사용
      const resp = await fetch(
        `${API_BASE}/api/v1/member/follow/artist/${encodeOnce(data.id)}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${txt}`);
      }

      console.log("🎨 팔로우 토글 성공:", { artistId: data.id, newState: nextFollow });
      
    } catch (e) {
      // 실패 시 롤백 (HomeArtist.tsx와 동일)
      console.error("[ArtistDetail] 팔로우 토글 실패:", e);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFollowStatus(prevFollow);
      Alert.alert("오류", "팔로우 변경에 실패했어요.");
    } finally {
      setToggling(false);
    }
  };

  const routerToExhi = (exId?: string) => {
    if (!exId) {
      Alert.alert("안내", "연결된 전시 정보가 없어요.");
      return;
    }
    console.log("🎨 ArtistDetail -> ExhiPage 이동:", {
      exhibitionId: exId,
      latestExhibition: data?.latestExhibition
    });
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
      params: {
        id: String(exId),
      },
    });
  };

  const goExhibitionPage = () => routerToExhi(data?.latestExhibition?.id);

  const goPlayWork = (workId: string) => {
    const exId = data?.latestExhibition?.id;
    if (!exId) {
      Alert.alert("안내", "이 작품과 연결된 전시 정보가 없어요.");
      return;
    }
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
      params: {
        id: String(exId),
        openAudio: "1",
        trackId: String(workId),
      },
    });
  };

  const headerImage = useMemo(
    () => data?.headerImage || data?.profileImg,
    [data]
  );

  if (authLoading || loading) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerFill}>
        <Text>작가 정보를 찾을 수 없어요.</Text>
      </View>
    );
  }

  // 렌더링 시 팔로우 상태 로그 (HomeArtist.tsx와 동일한 방식)
  const isFollowing = followStatus ?? false; // null이면 false로 기본값 처리
  
  console.log("🎨 ArtistDetail 렌더링:", {
    artistName: data?.name,
    followStatus,
    isFollowing,
    isLoggedIn,
    toggling
  });

  const TopHeader = (
    <>
      <View style={styles.topActions}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.actionIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity onPress={() => Alert.alert("준비 중", "공유 기능은 준비 중입니다.")}>
            <Text style={styles.actionIcon}>🔗</Text>
          </TouchableOpacity>

          {/* 팔로우 하트 버튼 */}
          {isLoggedIn && (
            <TouchableOpacity onPress={doToggleFollow} disabled={toggling}>
              <Text style={styles.actionIcon}>
                {toggling ? "⏳" : (isFollowing ? "❤️" : "🤍")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Pressable onPress={goExhibitionPage}>
        {headerImage ? (
          <Image source={{ uri: headerImage }} style={styles.headerImage} resizeMode="cover" />
        ) : (
          <View style={[styles.headerImage, { backgroundColor: "#eee" }]} />
        )}
      </Pressable>

      <View style={styles.infoBox}>
        <View style={styles.row}>
          {data.profileImg ? (
            <Image source={{ uri: data.profileImg }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: "#eee" }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.meta}>작품 {data.numberOfArtworks ?? 0}</Text>
          </View>

          {/* 팔로우 버튼 */}
                  {isLoggedIn && (
          <TouchableOpacity
            style={[
              styles.followBtn,
              { backgroundColor: isFollowing ? "#333" : "#FF5A5F" },
              toggling && { opacity: 0.6 },
            ]}
            onPress={doToggleFollow}
            disabled={toggling}
          >
            <Text style={styles.followTxt}>
              {toggling ? "처리중..." : (isFollowing ? "✓ 팔로잉" : "+ 팔로우")}
            </Text>
          </TouchableOpacity>
        )}
        </View>

        {!!data.introduction && (
          <Pressable onPress={() => setIntroModal(true)} style={{ marginTop: 10 }}>
            <Text style={styles.intro} numberOfLines={3}>{data.introduction}</Text>
           
           
            <Text style={styles.moreLink}>더보기</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabRow}>
        {(["works", "exhibitions"] as TabKey[]).map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tabItem, active && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t === "works" ? "작품" : "전시"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const renderWork = ({ item }: { item: NonNullable<ArtistDetailData["artworks"]>[number] }) => (
    <TouchableOpacity style={styles.workRow} onPress={() => goPlayWork(item.id)}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.workThumb} />
      ) : (
        <View style={[styles.workThumb, { backgroundColor: "#eee" }]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.workTitle}>{item.title}</Text>
        <Text style={styles.workSub}>{data.name}</Text>
      </View>
      <Text style={{ fontSize: 20, color: "#ccc" }}>▶</Text>
    </TouchableOpacity>
  );

  const renderExhibition = () => {
    const ex = data.latestExhibition;
    if (!ex) {
      return <View style={styles.emptyBox}><Text style={{ color: "#888" }}>전시가 아직 없어요.</Text></View>;
    }
    return (
      <TouchableOpacity style={styles.exCard} onPress={goExhibitionPage} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exBadge}>작품 전시</Text>
          <Text style={styles.exTitle}>{ex.title ?? "-"}</Text>
          {!!(ex.place || ex.organizer) && (
            <Text style={styles.exMeta}>장소 {ex.place ?? ex.organizer}</Text>
          )}
          {!!(ex.startDate || ex.endDate) && (
            <Text style={styles.exMeta}>
              기간: {(ex.startDate ?? "").replaceAll("-", ".")} - {(ex.endDate ?? "").replaceAll("-", ".")}
            </Text>
          )}
        </View>
        {ex.thumbnail || ex.coverImage ? (
          <Image source={{ uri: ex.thumbnail || ex.coverImage! }} style={styles.exThumb} />
        ) : (
          <View style={[styles.exThumb, { backgroundColor: "#eee" }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={tab === "works" ? data.artworks ?? [] : []}
        keyExtractor={(it, idx) => (it?.id ? String(it.id) : String(idx))}
        ListHeaderComponent={TopHeader}
        renderItem={tab === "works" ? renderWork : undefined}
        ListEmptyComponent={tab === "works" ? (
          <View style={styles.emptyBox}><Text style={{ color: "#888" }}>작품이 아직 없어요.</Text></View>
        ) : (
          renderExhibition()
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />

    {/* 작가 소개 모달 */}
<Modal
  visible={introModal}
  animationType="slide"
  transparent={false} // 전체 화면 덮기
  onRequestClose={() => setIntroModal(false)} // 안드로이드 물리키
>
  <View style={{ flex: 1, backgroundColor: "#fff" }}>
    {/* 상단 헤더 */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <TouchableOpacity onPress={() => setIntroModal(false)}>
        <Text style={{ fontSize: 20 }}>←</Text>
      </TouchableOpacity>
      <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 12 }}>
        작가 소개
      </Text>
    </View>

    {/* 본문 */}
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 6, color: "#222" }}>
        이름
      </Text>
      <Text style={{ marginBottom: 20 }}>{data.name}</Text>

      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 6, color: "#222" }}>
        소개
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 22, color: "#333" }}>
        {data.introduction}
      </Text>
    </View>
  </View>
</Modal>

    </View>
  );
}
