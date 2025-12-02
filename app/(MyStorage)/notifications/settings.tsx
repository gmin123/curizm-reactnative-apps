import {
  apiGetNotificationPrefs,
  apiRegisterPushToken,
  apiUpdateNotificationPrefs
} from "../../../api/setting/notifications";
import { useAuth } from "../../context/AuthContext";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, Platform,
  StyleSheet, Switch, Text, TouchableOpacity, View
} from "react-native";

/* ---- Android 채널 설정 (중요) ---- */
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF5B55",
    sound: "default",
  });
}

export default function NotificationSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    marketingConsent: true,
    nightBenefits: true,
  });
  const [saving, setSaving] = useState(false);

  // 권한/토큰 요청
  const ensurePushPermissionAndToken = useCallback(async () => {
    if (!Device.isDevice) {
      Alert.alert("알림", "푸시는 실제 디바이스에서만 동작합니다.");
      return null;
    }
    // 권한 체크/요청
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("알림 권한 필요", "설정 > 알림에서 권한을 허용해주세요.");
      return null;
    }
    // Expo Push Token 획득 (projectId는 app.json의 extra.eas.projectId와 일치)
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
    const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenRes.data;
  }, []);

  // 초기 설정 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return;
      try {
        const p = await apiGetNotificationPrefs(token);
        if (!alive) return;
        setPrefs((prev) => ({ ...prev, ...p }));
      } catch {}
    })();
    return () => { alive = false; };
  }, [token]);

  const savePrefs = useCallback(async (next: NotificationPrefs) => {
    if (!token) return;
    setSaving(true);
    try {
      // 마케팅/이벤트 푸시를 켜는 순간 → 권한/토큰 등록
      if (next.marketingConsent) {
        const expoPushToken = await ensurePushPermissionAndToken();
        if (expoPushToken) {
          await apiRegisterPushToken(token, expoPushToken);
        }
      }
      await apiUpdateNotificationPrefs(token, next);
      setPrefs(next);
    } catch (e: any) {
      Alert.alert("오류", e?.message || "설정을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }, [token, ensurePushPermissionAndToken]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 헤더 */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={S.back}>←</Text></TouchableOpacity>
        <Text style={S.title}>알림 설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={S.section}>혜택 / 이벤트 푸시</Text>

      {/* 마케팅 푸시 동의 */}
      <View style={S.row}>
        <View style={{ flex: 1 }}>
          <Text style={S.rowTitle}>마케팅 푸시 알람 동의</Text>
          <Text style={S.rowSub}>이벤트 및 쿠폰 혜택 소식</Text>
        </View>
        <Switch
          value={prefs.marketingConsent}
          onValueChange={(v) => savePrefs({ ...prefs, marketingConsent: v })}
          trackColor={{ true: "#FFB6A9", false: "#E5E7EB" }}
          thumbColor={prefs.marketingConsent ? "#FF5B55" : "#fff"}
          disabled={saving}
        />
      </View>

      {/* 야간 혜택 알림 */}
      <View style={S.row}>
        <View style={{ flex: 1 }}>
          <Text style={S.rowTitle}>야간 혜택 알림</Text>
          <Text style={S.rowSub}>21:00 - 08:00 알림 발송</Text>
        </View>
        <Switch
          value={prefs.nightBenefits}
          onValueChange={(v) => savePrefs({ ...prefs, nightBenefits: v })}
          trackColor={{ true: "#FFB6A9", false: "#E5E7EB" }}
          thumbColor={prefs.nightBenefits ? "#FF5B55" : "#fff"}
          disabled={saving}
        />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  back: { fontSize: 20 },
  title: { fontSize: 20, fontWeight: "900" },
  section: { marginTop: 16, marginBottom: 8, paddingHorizontal: 16, fontWeight: "800", fontSize: 14 },
  row: {
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#EFF2F6",
  },
  rowTitle: { fontWeight: "800", fontSize: 15, color: "#111" },
  rowSub: { color: "#8A8F9A", marginTop: 4 },
});
