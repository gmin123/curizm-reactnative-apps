import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ExhiHeaderProps = {
  cover?: string | null;
  title: string;
  intro?: string;
  likes?: number;
  thoughts?: number;
  isPaid: boolean;
  priceCoins: number;
  purchased: boolean;
  onBack: () => void;
  onShare?: () => void;
  onToggleLike: () => void;
  liked: boolean;
  onMore?: () => void;
  onDocent: () => void;
  onPressCoin: () => void;
};

export default function ExhiHeader({
  cover,
  title,
  intro,
  likes = 0,
  thoughts = 0,
  isPaid,
  priceCoins,
  purchased,
  onBack,
  onShare,
  onToggleLike,
  liked,
  onMore,
  onDocent,
  onPressCoin,
}: ExhiHeaderProps) {
  return (
    <>
      <View style={S.headerBar}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ paddingHorizontal: 4 }} onPress={onShare}>
            <MaterialIcons name="ios-share" size={20} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 4 }} onPress={onToggleLike}>
            <MaterialIcons name={liked ? "favorite" : "favorite-border"} size={20} color={liked ? "#ff5b55" : "#111"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ position: "relative" }}>
        {!!cover && <Image source={{ uri: cover }} style={S.cover} />}
        {isPaid && (
          <Pressable onPress={onPressCoin} style={P.coinPill}>
            <View style={P.coinDot} />
            <Text style={P.coinText}>{priceCoins} {purchased ? "구매완료" : ""}</Text>
          </Pressable>
        )}
      </View>

      <View style={S.infoBox}>
        <Text style={S.title}>{title}</Text>

        <View style={S.statsRow}>
          <View style={S.statItem}>
            <MaterialIcons name="favorite" size={16} color="#ff5b55" />
            <Text style={S.statText}>{likes.toLocaleString()}</Text>
          </View>
          <View style={[S.statItem, { marginLeft: 12 }]}>
            <MaterialIcons name="chat-bubble-outline" size={16} color="#9AA1B2" />
            <Text style={S.statTextGray}>{thoughts.toLocaleString()}</Text>
          </View>
        </View>

        {!!intro && (
          <>
            <Text style={S.desc} numberOfLines={3} ellipsizeMode="tail">{intro}</Text>
            <TouchableOpacity onPress={onMore} style={S.moreBtn}>
              <Text style={S.moreText}>더보기</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity activeOpacity={0.9} style={S.docentBtn} onPress={onDocent}>
          <Text style={S.docentBtnText}>도슨트 듣기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const S = StyleSheet.create({
  headerBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, marginBottom: 10 },
  cover: { width: "100%", height: 280, backgroundColor: "#eee" },
  infoBox: { paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#111", marginBottom: 6 },
  statsRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  statItem: { flexDirection: "row", alignItems: "center" },
  statText: { marginLeft: 4, fontSize: 13, color: "#111" },
  statTextGray: { marginLeft: 4, fontSize: 13, color: "#9AA1B2" },
  desc: { fontSize: 14, color: "#333" },
  moreBtn: { marginTop: 4 },
  moreText: { color: "#4C6FFF", fontWeight: "600" },
  docentBtn: { marginTop: 12, backgroundColor: "#FF6B45", paddingVertical: 12, borderRadius: 10 },
  docentBtnText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 15 },
});

const P = StyleSheet.create({
  coinPill: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "#FF6B45",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 32,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  coinDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff" },
  coinText: { color: "#fff", fontWeight: "700" },
});
