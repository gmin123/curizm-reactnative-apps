import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const isValidUrl = (v?: any) =>
  typeof v === "string" && v.trim() !== "" && v.trim().toLowerCase() !== "string" && /^https?:\/\//.test(v);

// 안전 픽커: 함수 목록 중 처음으로 “쓸만한 문자열/URL”을 반환
const pickStr = (n: any, ...fns: Array<(x: any) => any>) => {
  for (const f of fns) {
    try {
      const v = f(n);
      if (typeof v === "string" && v.trim() && v.trim().toLowerCase() !== "string") return v.trim();
    } catch {}
  }
  return "";
};
const pickUrl = (n: any, ...fns: Array<(x: any) => any>) => {
  for (const f of fns) {
    try {
      const v = f(n);
      if (isValidUrl(v)) return v;
    } catch {}
  }
  return "";
};

export default function SecondartworkDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let note: any = null;
  try { note = params.note ? JSON.parse(String(params.note)) : null; } catch { note = null; }
  if (!note) {
    return (
      <View style={[S.screen, { backgroundColor: "#0f3b3b" }]}>
        <SafeAreaView><StatusBar barStyle="light-content" /><Text style={{ color:"#fff", padding:16 }}>노트 데이터가 없습니다.</Text></SafeAreaView>
      </View>
    );
  }

  const bg = (typeof params.bg === "string" && params.bg) || note.color || "#0f3b3b";
  const accent = (typeof params.accent === "string" && params.accent) || "#6aa8b3";

  // ✅ 이미지/제목/작가를 다양한 키에서 시도
  const thumb = pickUrl(
    note,
    n => n.imageUrl,
    n => n.thumbnail,
    n => n.coverImage,
    n => n.artwork?.thumbnail,
    n => n.exhibition?.coverImage,
    n => n.images?.[0]
  );
  const artistName = pickStr(note, n => n.artistName, n => n.artist?.name, n => n.artist, n => n.author);
  const artworkTitle = pickStr(note, n => n.title, n => n.artworkTitle, n => n.artwork?.title, n => n.label, n => n.name);
  const topLine = [artistName, artworkTitle].filter(Boolean).join(", ");
  const subLine = pickStr(note, n => n.source, n => n.groupName, n => n.group, n => n.venue) || "AWA";

  const question = pickStr(note, n => n.question, n => n.q, n => n.prompt);
  const answer =
    pickStr(note, n => n.answer, n => n.explanation, n => n.content, n => n.body, n => n.text);

  const userName = pickStr(note, n => n.memberName, n => n.nickname, n => n.userName) || "사용자 이름";
  const profileImg = pickUrl(
    note,
    n => n.memberProfileImg,
    n => n.profileImg,
    n => n.userImage,
    n => n.memberImage
  );
  const initial = (userName?.[0] ?? "A").toUpperCase();

  const exhibitionTitle = pickStr(note, n => n.exhibitionTitle, n => n.exhibitionName);

  return (
    <View style={[S.screen, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView>
        <View style={S.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
            <Text style={S.back}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={S.container}>
          {/* 썸네일 + (작가,작품) 1줄 말줄임 */}
          <View style={S.headRow}>
            <View style={S.thumbWrap}>
              {isValidUrl(thumb) ? (
                <Image source={{ uri: thumb }} style={S.thumb} />
              ) : (
                <View style={[S.thumb, { backgroundColor: "#ffffff22" }]} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.topLine} numberOfLines={1} ellipsizeMode="tail">
                {topLine}
              </Text>
              {!!subLine && (
                <Text style={S.subLine} numberOfLines={1} ellipsizeMode="tail">
                  {subLine}
                </Text>
              )}
            </View>
          </View>

          {/* 유저 칩 */}
          <View style={S.userRow}>
            {isValidUrl(profileImg) ? (
              <Image source={{ uri: profileImg }} style={S.avatarImg} />
            ) : (
              <View style={[S.avatarLetter, { backgroundColor: accent }]}>
                <Text style={S.avatarLetterTxt}>{initial}</Text>
              </View>
            )}
            <Text style={S.userName} numberOfLines={1} ellipsizeMode="tail">
              {userName}
            </Text>
          </View>

          {/* 질문/답변 */}
          {!!question && (
            <Text style={S.bigQ} numberOfLines={4} ellipsizeMode="tail">
              {question}
            </Text>
          )}
          {!!answer && <Text style={S.answer}>{answer}</Text>}

          {!!exhibitionTitle && (
            <Text style={S.footerHint} numberOfLines={1} ellipsizeMode="tail">
              {exhibitionTitle}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const PADDING_H = 16;

const S = StyleSheet.create({
  screen:{ flex:1 },
  topBar:{ paddingHorizontal:PADDING_H, paddingTop:6, paddingBottom:6, flexDirection:"row", alignItems:"center" },
  back:{ color:"#EAF2F2", fontSize:20, fontWeight:"700" },
  container:{ paddingHorizontal:PADDING_H, paddingBottom:20 },
  headRow:{ flexDirection:"row", alignItems:"center", gap:10, marginTop:4 },
  thumbWrap:{ width:44, height:44, borderRadius:8, overflow:"hidden", backgroundColor:"#00000020" },
  thumb:{ width:"100%", height:"100%" },
  topLine:{ color:"#EAF2F2", fontSize:12, fontWeight:"800" },
  subLine:{ color:"#D7E7E7", fontSize:11, marginTop:4, opacity:0.9 },
  userRow:{ flexDirection:"row", alignItems:"center", gap:10, marginTop:14, marginBottom:6 },
  avatarImg:{ width:24, height:24, borderRadius:12, backgroundColor:"#00000022" },
  avatarLetter:{ width:24, height:24, borderRadius:12, alignItems:"center", justifyContent:"center" },
  avatarLetterTxt:{ color:"#fff", fontWeight:"900", fontSize:12 },
  userName:{ color:"#F2F8F8", fontSize:12, fontWeight:"700" },
  bigQ:{ color:"#FDFEFE", fontSize:18, lineHeight:28, fontWeight:"900", marginTop:8, marginBottom:12 },
  answer:{ color:"#F3FBFB", fontSize:14, lineHeight:24, opacity:0.95 },
  footerHint:{ marginTop:16, color:"#E1EEEE", fontSize:11, textAlign:"right", opacity:0.9 },
});
