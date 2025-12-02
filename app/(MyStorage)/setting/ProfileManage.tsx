// app/(MyStorage)/setting/ProfileManage.tsx
import { apiGetMe, apiUpdateProfile, apiUploadProfileImage, MeResponse } from "../../../api/setting/profile";
import { useAuth } from "../../context/AuthContext";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function toErrorMessage(e: any) {
  if (!e) return "알 수 없는 오류";
  if (typeof e === "string") return e;
  if (e?.message) return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

export default function ProfileManage() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [serverProfileImg, setServerProfileImg] = useState<string | undefined>(undefined);

  const [pickedUri, setPickedUri] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const [showSaved, setShowSaved] = useState(false);

  // 최초 로딩: 토큰이 있을 때만 서버 조회
  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const me = await apiGetMe(token);
          hydrate(me);
        }
      } catch (e: any) {
        console.log("❌ [ProfileManage] apiGetMe error:", e);
        Alert.alert("오류", toErrorMessage(e) || "프로필을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const hydrate = (me: MeResponse) => {
    setEmail(me.email || "");
    setName(me.name || "");
    setServerProfileImg(me.profileImg || undefined);
  };

  // 아바타 이니셜
  const initialChar = useMemo(() => {
    const base = (name || email || "?").trim();
    return base ? base[0]?.toUpperCase() : "?";
  }, [name, email]);

  const nameError = touched && name.trim().length === 0;

  // 사진 선택
  const onChangePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요해요.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset?.uri) setPickedUri(asset.uri);
    } catch (e: any) {
      console.log("❌ [ProfileManage] ImagePicker error:", e);
      Alert.alert("오류", toErrorMessage(e) || "사진 선택에 실패했어요.");
    }
  };

// 저장
const onSave = async () => {
  setTouched(true);

  if (name.trim().length === 0) {
    Alert.alert("안내", "이름을 입력해 주세요.");
    return;
  }

  if (!token) {
    Alert.alert("안내", "로그인 상태가 아니라 서버에 저장할 수 없어요.\n(테스트용으로 화면만 열어둡니다)");
    return;
  }

  try {
    setSaving(true);

    let profileImgUrl = serverProfileImg;

    if (pickedUri) {
      try {
        console.log("🖼️ 업로드 시작:", pickedUri);
        const up = await apiUploadProfileImage(token, pickedUri, "profile.jpg");
        profileImgUrl = up.url;
        console.log("✅ 업로드 성공 URL:", profileImgUrl);
      } catch (e: any) {
        console.log("❌ 업로드 실패:", e);
        Alert.alert("업로드 오류", toErrorMessage(e));
        return;
      }
    }

    // ✅ name과 profileImg 모두 보냄
    await apiUpdateProfile(token, { 
      name: name.trim(), 
      profileImg: profileImgUrl 
    });

    setServerProfileImg(profileImgUrl);
    setPickedUri(undefined);
    setShowSaved(true);
  } catch (e: any) {
    console.log("❌ [ProfileManage] onSave error:", e);
    Alert.alert("오류", toErrorMessage(e) || "저장에 실패했어요.");
  } finally {
    setSaving(false);
  }
};


  const previewUri = pickedUri || serverProfileImg;

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>회원 정보 관리</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={s.container}>
        <View style={s.center}>
          <View style={s.avatar}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={s.avatarImg} />
            ) : (
              <Text style={s.avatarInitial}>{initialChar}</Text>
            )}
          </View>

          <TouchableOpacity style={s.photoBtn} onPress={onChangePhoto} disabled={saving}>
            <Text style={s.photoBtnText}>📷 사진 변경</Text>
          </TouchableOpacity>
        </View>

        <View style={s.labelWrap}>
          <Text style={s.label}>아이디 (변경 불가)</Text>
        </View>
        <TextInput
          editable={false}
          value={email}
          style={[s.input, s.inputDisabled]}
          placeholder="이메일 주소"
          placeholderTextColor="#B9C0CF"
        />

        <View style={s.labelWrap}>
          <Text style={s.label}>이름</Text>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={() => setTouched(true)}
          placeholder="가입시 등록한 사용자 이름"
          placeholderTextColor="#B9C0CF"
          style={[s.input, nameError && s.inputError]}
          editable={!saving}
          autoCapitalize="none"
        />
        {nameError && <Text style={s.errorTxt}>이름을 입력해 주세요.</Text>}

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnTxt}>저장</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={showSaved} transparent animationType="fade">
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>회원 정보를 저장했어요</Text>
            <Text style={s.modalDesc}>입력하신 정보를 정상적으로 변경했어요.</Text>
            <TouchableOpacity style={s.modalBtn} onPress={() => setShowSaved(false)}>
              <Text style={s.modalBtnTxt}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  back: { fontSize: 18, color: "#111" },
  title: { fontSize: 20, fontWeight: "800", color: "#111", marginLeft: 4 },

  container: { paddingHorizontal: 16, paddingTop: 10 },
  center: { alignItems: "center", marginTop: 6, marginBottom: 18 },

  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#EAEFF5",
    alignItems: "center", justifyContent: "center", marginBottom: 10, overflow: "hidden"
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitial: { fontSize: 18, color: "#222", fontWeight: "700" },

  photoBtn: { backgroundColor: "#FFEEE8", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  photoBtnText: { color: "#FF6A3D", fontWeight: "700" },

  labelWrap: { marginTop: 8, marginBottom: 6 },
  label: { fontSize: 12, color: "#77819A", fontWeight: "600" },

  input: { height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#E5E8F0", paddingHorizontal: 14, fontSize: 14, color: "#111", backgroundColor: "#fff" },
  inputDisabled: { backgroundColor: "#F6F7FB", color: "#9AA3B2" },
  inputError: { borderColor: "#FF6A6A", backgroundColor: "#FFF6F6" },
  errorTxt: { color: "#FF6A6A", marginTop: 6, fontSize: 12 },

  saveBtn: { marginTop: 18, backgroundColor: "#FF5A3C", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  saveBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 22 },
  modalCard: { width: "100%", backgroundColor: "#fff", borderRadius: 14, padding: 18, alignItems: "center" },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 8 },
  modalDesc: { fontSize: 13, color: "#555", marginBottom: 12, textAlign: "center" },
  modalBtn: { backgroundColor: "#FF5A3C", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  modalBtnTxt: { color: "#fff", fontWeight: "800" },
});
