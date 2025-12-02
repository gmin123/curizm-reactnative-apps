import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  toggleArtistFollow,
  toggleArtworkLike,
  toggleExhibitionLike,
} from "../../api/like";
import { useAuth } from "../context/AuthContext";
import {
  getRecentKeywords,
  getRecommendedTags,
  saveRecentKeyword,
  searchAll,
  searchArtists,
  searchArtworks,
  searchExhibitions,
} from "./search";
import { styles as S } from "./style";

// 🔸 디바운스 함수
const useDebounce = (callback: Function, delay = 500) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const debounced = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
  return debounced;
};

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [keyword, setKeyword] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [tab, setTab] = useState<"all" | "artist" | "artwork" | "exhibition">(
    "all"
  );
  const [loading, setLoading] = useState(false);
  const [pagingData, setPagingData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const [tags, recents] = await Promise.all([
          getRecommendedTags(),
          getRecentKeywords(token).catch(() => []),
        ]);
        setRecommended(tags);
        setRecent(recents);
      } catch (e) {
        console.error("검색 초기 데이터 로드 실패:", e);
      }
    })();
  }, []);

  // 🔸 자동 검색 (디바운스)
  const debouncedSearch = useDebounce(async (kw: string) => {
    if (!kw.trim()) {
      setSearchResult(null);
      return;
    }
    setLoading(true);
    try {
      const data = await searchAll(kw, token);
      setSearchResult(data);
      setTab("all");
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleInputChange = (kw: string) => {
    setKeyword(kw);
    debouncedSearch(kw);
  };

  const handleSearchPress = async () => {
    if (!keyword.trim()) return;
    await saveRecentKeyword(keyword, token).catch(() => {});
    debouncedSearch(keyword);
  };

  // 🔸 탭별 데이터 호출
  useEffect(() => {
    if (!keyword || tab === "all") return;
    setLoading(true);
    setPagingData([]);
    const fetch = async () => {
      try {
        let res;
        if (tab === "artist") res = await searchArtists(keyword, 1, token);
        if (tab === "artwork") res = await searchArtworks(keyword, 1, token);
        if (tab === "exhibition")
          res = await searchExhibitions(keyword, 1, token);
        setPagingData(res.data || []);
        setTotal(res.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tab]);

  const loadMore = async () => {
    if (loading || pagingData.length >= total) return;
    const nextPage = page + 1;
    setPage(nextPage);
    try {
      let res;
      if (tab === "artist") res = await searchArtists(keyword, nextPage, token);
      if (tab === "artwork")
        res = await searchArtworks(keyword, nextPage, token);
      if (tab === "exhibition")
        res = await searchExhibitions(keyword, nextPage, token);
      setPagingData((prev) => [...prev, ...(res.data || [])]);
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ 좋아요 / 팔로우 토글 (API 연동)
  const toggleLike = async (id: string, type: "artwork" | "exhibition") => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      if (type === "artwork") await toggleArtworkLike(id, token);
      if (type === "exhibition") await toggleExhibitionLike(id, token);
    } catch (e) {
      console.warn("좋아요 실패:", e);
    }
  };

  const toggleFollow = async (id: string) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      await toggleArtistFollow(id, token);
    } catch (e) {
      console.warn("팔로우 실패:", e);
    }
  };

  const TabBtn = ({ name, label }) => (
    <TouchableOpacity
      onPress={() => setTab(name)}
      style={[S.tabBtn, tab === name && S.tabActive]}
    >
      <Text style={[S.tabTxt, tab === name && S.tabTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={S.empty}>
      <Text style={S.emptyTitle}>일치하는 결과가 없어요</Text>
      <Text style={S.emptySub}>
        찾으려는 검색어가 맞는지 {"\n"}
        다시 한번 확인해 주세요.
      </Text>
      <Image
        source={require("@/assets/images/nosearch.png")}
        style={{
          width: "65%",
          aspectRatio: 1,
          alignSelf: "center",
        }}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <View style={S.container}>
      {/* 검색창 */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <TextInput
          value={keyword}
          onChangeText={handleInputChange}
          placeholder="검색어를 입력하세요"
          style={S.input}
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => setKeyword("")}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSearchPress}>
          <MaterialIcons name="search" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : !searchResult && tab === "all" ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
          {/* 추천 검색어 */}
          <Text style={S.sectionTitle}>추천 검색어</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommended.map((t) => (
              <TouchableOpacity
                key={t.tag}
                style={S.tagBox}
                onPress={() => handleInputChange(t.tag)}
              >
                <Image source={{ uri: t.image }} style={S.tagImg} />
                <Text style={S.tagTxt}>{t.tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 최근 검색어 */}
          {recent.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={S.sectionTitle}>최근 검색어</Text>
              {recent.map((r) => (
                <TouchableOpacity key={r} onPress={() => handleInputChange(r)}>
                  <Text style={S.recentTxt}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          {/* 탭 */}
          <View style={S.tabBar}>
            <TabBtn name="all" label="전체" />
            <TabBtn name="artist" label="작가" />
            <TabBtn name="artwork" label="작품" />
            <TabBtn name="exhibition" label="전시" />
          </View>

          {/* 전체 탭 */}
          {tab === "all" && (
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
            >
              {/* 작가 섹션 */}
              {searchResult?.artists?.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <View style={S.sectionHeader}>
                    <Text style={S.sectionTitle}>작가</Text>
                    <TouchableOpacity onPress={() => setTab("artist")}>
                      <Text style={S.moreTxt}>더보기</Text>
                    </TouchableOpacity>
                  </View>
                  {searchResult.artists.slice(0, 3).map((a) => (
                    <View key={a.id} style={S.row}>
                      <Image source={{ uri: a.profileImg }} style={S.avatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={S.name}>{a.name}</Text>
                        <Text style={S.sub}>작품 {a.numberOfArtworks}</Text>
                      </View>
                      <TouchableOpacity
                        style={[S.followBtn, followed[a.id] && S.followActive]}
                        onPress={() => toggleFollow(a.id)}
                      >
                        <Text
                          style={[
                            S.followTxt,
                            followed[a.id] && { color: "#fff" },
                          ]}
                        >
                          {followed[a.id] ? "✓ 팔로잉" : "+ 팔로우"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 작품 섹션 */}
              {searchResult?.artworks?.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <View style={S.sectionHeader}>
                    <Text style={S.sectionTitle}>작품</Text>
                    <TouchableOpacity onPress={() => setTab("artwork")}>
                      <Text style={S.moreTxt}>더보기</Text>
                    </TouchableOpacity>
                  </View>
                  {searchResult.artworks.slice(0, 3).map((w) => (
                    <View key={w.id} style={S.row}>
                      <Image source={{ uri: w.thumbnail }} style={S.thumbSquare} />
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={S.name}>
                          {w.name}
                        </Text>
                        <Text style={S.sub}>{w.artistName}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleLike(w.id, "artwork")}>
                        <MaterialIcons
                          name={liked[w.id] ? "favorite" : "favorite-outline"}
                          size={22}
                          color={liked[w.id] ? "#FF6A3D" : "#ccc"}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 전시 섹션 */}
              {searchResult?.exhibitions?.length > 0 && (
                <View>
                  <View style={S.sectionHeader}>
                    <Text style={S.sectionTitle}>전시</Text>
                    <TouchableOpacity onPress={() => setTab("exhibition")}>
                      <Text style={S.moreTxt}>더보기</Text>
                    </TouchableOpacity>
                  </View>
                  {searchResult.exhibitions.slice(0, 3).map((ex) => (
                    <View key={ex.id} style={S.row}>
                      <Image
                        source={{ uri: ex.thumbnail }}
                        style={S.thumbSquare}
                      />
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={S.name}>
                          {ex.title}
                        </Text>
                        <Text style={S.sub}>
                          {ex.period ? `${ex.period} · ${ex.place}` : ex.place}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleLike(ex.id, "exhibition")}
                      >
                        <MaterialIcons
                          name={liked[ex.id] ? "favorite" : "favorite-outline"}
                          size={22}
                          color={liked[ex.id] ? "#FF6A3D" : "#ccc"}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* 개별 탭 */}
          {tab !== "all" && (
            <FlatList
              contentContainerStyle={{ paddingHorizontal: 16 }}
              data={pagingData}
              keyExtractor={(item) => item.id}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={renderEmpty}
              renderItem={({ item }) => (
                <View style={S.row}>
                  <Image
                    source={{
                      uri:
                        item.profileImg || item.thumbnail || item.coverImage,
                    }}
                    style={S.avatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={S.name}>{item.name || item.title}</Text>
                    <Text style={S.sub}>
                      {item.artistName || item.organizer}
                    </Text>
                  </View>

                  {/* 작가 탭 팔로우 버튼 */}
                  {tab === "artist" ? (
                    <TouchableOpacity
                      style={[S.followBtn, followed[item.id] && S.followActive]}
                      onPress={() => toggleFollow(item.id)}
                    >
                      <Text
                        style={[
                          S.followTxt,
                          followed[item.id] && { color: "#fff" },
                        ]}
                      >
                        {followed[item.id] ? "✓ 팔로잉" : "+ 팔로우"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => toggleLike(item.id, tab)}>
                      <MaterialIcons
                        name={
                          liked[item.id] ? "favorite" : "favorite-outline"
                        }
                        size={20}
                        color={liked[item.id] ? "#FF6A3D" : "#ccc"}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}
