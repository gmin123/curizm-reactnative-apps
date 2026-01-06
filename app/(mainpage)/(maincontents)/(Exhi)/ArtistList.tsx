import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExhibitionArtist, getExhibitionArtists } from '../../../../api/exhi/getExhibitionArtists';

type Props = {
  exhibitionId: string;
};

export const ArtistList: React.FC<Props> = ({ exhibitionId }) => {
  const [artists, setArtists] = useState<ExhibitionArtist[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getExhibitionArtists(exhibitionId, page)
      .then(({ artists, total }) => {
        setArtists(page === 1 ? artists : prev => [...prev, ...artists]);
        setTotal(total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [exhibitionId, page]);

  const onLoadMore = () => {
    if (!loading && artists.length < total) {
      setPage(prev => prev + 1);
    }
  };

  // ✅ 작가 클릭 시 ArtistDetail 페이지로 이동
  const handlePressArtist = (artist: ExhibitionArtist) => {
    router.push({
      pathname: '/(mainpage)/(maincontents)/(Artist)/ArtistDetail',
      params: {
        id: String(artist.id),
        name: artist.name ?? '',
        profileImg: artist.profileImg ?? '',
        numberOfArtworks: String(artist.numberOfArtworks ?? 0),
        headerImage: artist.profileImg ?? '',
      },
    });
  };

  const renderItem = ({ item }: { item: ExhibitionArtist }) => (
    <Pressable style={S.row} onPress={() => handlePressArtist(item)}>
      <Image
        source={item.profileImg ? { uri: item.profileImg } : require('../../../../assets/images/Cicon.png')}
        style={S.avatar}
      />
      <View style={S.meta}>
        <Text style={S.name}>{item.name}</Text>
      </View>
      <Ionicons
        name={item.memberFollow ? 'heart' : 'heart-outline'}
        size={20}
        color={item.memberFollow ? "#ef4444" : "#9ca3af"}
        style={S.heartWrap}
      />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={artists}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 20 }} /> : null}
      />
    </View>
  );
};

const S = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  meta: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "column",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  heartWrap: {
    padding: 8,
    marginLeft: 8,
  },
});
