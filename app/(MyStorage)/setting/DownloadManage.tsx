// screens/offline/DownloadManage.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DownloadedArtwork {
  id: string;
  title: string;
  artist: string;
  localAudioUri: string;
  localThumbUri: string;
  durationTime?: number;
}

interface DownloadedExhibition {
  id: string;
  title: string;
  coverImageUri: string;
  introduction: string;
  artworks: DownloadedArtwork[];
  location?: string;
  coinCount?: number;
  isLiked?: boolean;
}

const META_DIR = `${FileSystem.documentDirectory}meta/`;

// ✅ meta 폴더에서 모든 전시 데이터 읽기
async function loadAllDownloadedExhibitions(): Promise<DownloadedExhibition[]> {
  try {
    const files = await FileSystem.readDirectoryAsync(META_DIR);
    const targetFiles = files.filter((f) =>
      f.startsWith("downloadedExhibition_")
    );

    const exhibitions: DownloadedExhibition[] = [];

    for (const fileName of targetFiles) {
      const filePath = `${META_DIR}${fileName}`;
      try {
        const json = await FileSystem.readAsStringAsync(filePath);
        const parsed = JSON.parse(json);
        exhibitions.push(parsed);
      } catch (err) {
        console.warn("⚠️ 파일 읽기 실패:", fileName, err);
      }
    }

    console.log("📦 불러온 전시 수:", exhibitions.length);
    return exhibitions;
  } catch (err) {
    console.error("❌ 메타 폴더 읽기 실패:", err);
    return [];
  }
}

// ✅ 전시 삭제 (단일)
async function deleteDownloadedExhibition(id: string) {
  const filePath = `${META_DIR}downloadedExhibition_${id}.json`;
  const exhiDir = `${FileSystem.documentDirectory}exhibitions/${id}`;
  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
    await FileSystem.deleteAsync(exhiDir, { idempotent: true });
    console.log("🗑️ 전시 삭제 완료:", id);
  } catch (err) {
    console.error("❌ 전시 삭제 실패:", id, err);
  }
}

export default function DownloadManage() {
  const [exhibitionList, setExhibitionList] = useState<DownloadedExhibition[]>([]);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  // ✅ 다운로드 목록 불러오기
  const loadData = async () => {
    const data = await loadAllDownloadedExhibitions();
    setExhibitionList(data);
    setSelectedIds([]);
  };

  // 최초 로드
  useEffect(() => {
    loadData();
  }, []);

  // 화면 재진입 시 자동 갱신
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // 선택 토글
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selectedIds.length === exhibitionList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(exhibitionList.map((ex) => ex.id));
    }
  };

  // 단일 삭제
  const handleDeleteSingle = (exhibitionId: string, title: string) => {
    Alert.alert("삭제 확인", `'${title}' 전시를 삭제하시겠어요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteDownloadedExhibition(exhibitionId);
          setExhibitionList((prev) =>
            prev.filter((ex) => ex.id !== exhibitionId)
          );
        },
      },
    ]);
  };

  // 선택 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("선택 없음", "삭제할 전시를 선택해주세요.");
      return;
    }

    Alert.alert(
      "선택 삭제",
      `총 ${selectedIds.length}개의 전시를 삭제하시겠어요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            for (const id of selectedIds) {
              await deleteDownloadedExhibition(id);
            }
            setExhibitionList((prev) =>
              prev.filter((ex) => !selectedIds.includes(ex.id))
            );
            setSelectedIds([]);
          },
        },
      ]
    );
  };

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (exhibitionList.length === 0) return;
    Alert.alert("전체 삭제", "모든 다운로드 전시를 삭제하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          for (const ex of exhibitionList) {
            await deleteDownloadedExhibition(ex.id);
          }
          setExhibitionList([]);
          setSelectedIds([]);
          console.log("🧹 전체 삭제 완료");
        },
      },
    ]);
  };

  // 전시 상세 페이지 이동
  const goToExhibitionDetail = (item: DownloadedExhibition) => {
    if (editing) {
      toggleSelect(item.id);
      return;
    }

    router.push({
      pathname: "./offline/offExhipage",
      params: {
        id: item.id,
        data: JSON.stringify(item),
      },
    });
  };

  // 렌더링
  const renderItem = ({ item }: { item: DownloadedExhibition }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <View style={styles.row}>
        {editing && (
          <TouchableOpacity
            onPress={() => toggleSelect(item.id)}
            style={{ paddingRight: 10 }}
          >
            <Ionicons
              name={isSelected ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={isSelected ? "#ff5545" : "#ccc"}
            />
          </TouchableOpacity>
        )}

        <Image
          source={
            item.coverImageUri
              ? { uri: item.coverImageUri }
              : require("../../../assets/images/icon.png")
          }
          style={styles.thumb}
        />

        <TouchableOpacity
          style={styles.meta}
          onPress={() => goToExhibitionDetail(item)}
        >
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitle}>전시 장소</Text>
        </TouchableOpacity>

        {!editing && (
          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => handleDeleteSingle(item.id, item.title)}
          >
            <Ionicons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerText}>다운로드한 전시</Text>

        <TouchableOpacity onPress={() => setEditing((v) => !v)}>
          <Text style={styles.editBtn}>{editing ? "완료" : "편집"}</Text>
        </TouchableOpacity>
      </View>

      {editing && exhibitionList.length > 0 && (
        <View style={styles.editControls}>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Text style={styles.controlText}>
              {selectedIds.length === exhibitionList.length
                ? "전체 해제"
                : "전체 선택"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={[styles.controlText, { color: "#ff5545" }]}>
              선택 삭제
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll}>
            <Text style={[styles.controlText, { color: "#ff0000" }]}>
              전체 삭제
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.countText}>총 {exhibitionList.length} 전시</Text>

      <FlatList
        data={exhibitionList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: "#777" }}>다운로드한 전시가 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

// ✅ 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  headerText: { fontSize: 19, fontWeight: "700" },
  editBtn: { fontSize: 15, color: "#ff5545" },
  countText: { fontSize: 13, color: "#b7bac6", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomColor: "#f1f2f6",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  thumb: { width: 48, height: 48, borderRadius: 10, marginRight: 14 },
  meta: { flex: 1, flexDirection: "column", marginRight: 4 },
  title: { fontSize: 15, fontWeight: "bold", color: "#15171b" },
  subtitle: { fontSize: 13, color: "#777" },
  editControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  controlText: { fontSize: 14, color: "#333" },
});
