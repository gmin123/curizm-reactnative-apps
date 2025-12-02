// constants/download.ts
import * as FileSystem from "expo-file-system";

// 전시 데이터 저장 경로
const BASE_DIR = `${FileSystem.documentDirectory}exhibitions/`;
const META_DIR = `${FileSystem.documentDirectory}meta/`;

// 타입 정의
type ArtworkData = {
  id: string;
  title: string;
  artist: string;
  sound: string;
  thumbnail: string;
  durationTime: number;
};

type ArtistData = {
  id: string;
  name: string;
  profileImage: string;
};

type ExhibitionData = {
  id: string;
  title: string;
  coverImage: string;
  introduction: string;
  artworks: ArtworkData[];
  artists?: ArtistData[];
};

// ✅ JSON 저장/불러오기 유틸 (AsyncStorage 대체)
async function saveJSON(key: string, data: any) {
  try {
    await FileSystem.makeDirectoryAsync(META_DIR, { intermediates: true });
    const filePath = `${META_DIR}${key}.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
    console.log("🧩 [메타 저장 완료]:", filePath);
  } catch (err) {
    console.error("❌ [메타 저장 실패]", err);
  }
}

async function loadJSON(key: string) {
  try {
    const filePath = `${META_DIR}${key}.json`;
    const content = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(content);
  } catch {
    console.warn("⚠️ [메타 불러오기 실패 또는 없음]:", key);
    return null;
  }
}

async function deleteJSON(key: string) {
  try {
    const filePath = `${META_DIR}${key}.json`;
    await FileSystem.deleteAsync(filePath, { idempotent: true });
    console.log("🧩 [메타 삭제 완료]:", key);
  } catch (err) {
    console.error("❌ [메타 삭제 실패]", err);
  }
}

// ✅ 파일 다운로드
async function downloadFile(url: string, folder: string) {
  try {
    if (!url) return "";

    const fileName = url.split("/").pop()?.split("?")[0] || "file";
    const localUri = `${folder}/${fileName}`;

    console.log(`📥 [파일 다운로드 시작]
URL: ${url}
→ 저장 경로: ${localUri}`);

    const res = await FileSystem.downloadAsync(url, localUri);
    const sizeKB = (Number(res.headers["content-length"]) || 0) / 1024;
    console.log(`✅ [파일 다운로드 완료] ${fileName} (${sizeKB.toFixed(2)} KB)`);

    return res.uri;
  } catch (err) {
    console.error("❌ [파일 다운로드 실패]", url, err);
    return "";
  }
}

// ✅ 전시 전체 다운로드
export async function downloadExhibition(data: ExhibitionData) {
  console.log("🚀 [전시 다운로드 시작]");
  console.log("📄 전시 메타데이터:", data.title, "(", data.id, ")");

  const exhibitionDir = `${BASE_DIR}${data.id}`;
  await FileSystem.makeDirectoryAsync(exhibitionDir, { intermediates: true });

  const meta: any = {
    id: data.id,
    title: data.title,
    introduction: data.introduction,
    coverImageUri: "",
    artworks: [],
    artists: [],
  };

  // 🖼️ 커버 이미지
  if (data.coverImage) {
    console.log("🖼️ [커버 이미지 다운로드]");
    meta.coverImageUri = await downloadFile(data.coverImage, exhibitionDir);
  }

  // 🎨 작품 다운로드
  console.log(`🎨 [작품 다운로드 시작] 총 ${data.artworks.length}개`);
  let successCount = 0;

  for (const [index, art] of data.artworks.entries()) {
    console.log(`\n🎧 [${index + 1}/${data.artworks.length}] ${art.title}`);
    const artworkDir = `${exhibitionDir}/artworks/${art.id}`;
    await FileSystem.makeDirectoryAsync(artworkDir, { intermediates: true });

    const localSound = art.sound ? await downloadFile(art.sound, artworkDir) : "";
    const localThumb = art.thumbnail ? await downloadFile(art.thumbnail, artworkDir) : "";

    if (localSound || localThumb) successCount++;

    meta.artworks.push({
      ...art,
      localAudioUri: localSound,
      localThumbUri: localThumb,
    });
  }

  console.log(`🎯 [작품 다운로드 완료] ${successCount}/${data.artworks.length} 성공`);

  // 👩‍🎨 작가 이미지 다운로드
  if (data.artists && data.artists.length > 0) {
    console.log(`👩‍🎨 [작가 이미지 다운로드 시작] 총 ${data.artists.length}명`);
    for (const artist of data.artists) {
      const artistDir = `${exhibitionDir}/artists/${artist.id}`;
      await FileSystem.makeDirectoryAsync(artistDir, { intermediates: true });
      const localProfile = artist.profileImage
        ? await downloadFile(artist.profileImage, artistDir)
        : "";
      meta.artists.push({
        ...artist,
        localProfileUri: localProfile,
      });
    }
    console.log("✅ [작가 이미지 다운로드 완료]");
  }

  // 💾 메타 저장 (expo-only)
  const metaPath = `${exhibitionDir}/meta.json`;
  await FileSystem.writeAsStringAsync(metaPath, JSON.stringify(meta, null, 2));
  await saveJSON(`downloadedExhibition_${data.id}`, meta);
  console.log("💾 [전시 메타데이터 저장 완료]:", metaPath);

  return metaPath;
}

// ✅ 저장된 전시 목록
export async function getSavedExhibitions() {
  try {
    const dirs = await FileSystem.readDirectoryAsync(BASE_DIR);
    console.log("📦 저장된 전시 폴더:", dirs);
    return dirs;
  } catch (err) {
    console.warn("⚠️ 저장된 전시 폴더 없음:", err);
    return [];
  }
}

// ✅ 전시 데이터 불러오기
export async function loadExhibition(id: string) {
  console.log("📖 [오프라인 전시 불러오기]", id);
  const metaPath = `${BASE_DIR}${id}/meta.json`;

  try {
    const json = await FileSystem.readAsStringAsync(metaPath);
    return JSON.parse(json);
  } catch (err) {
    console.error("❌ [전시 로드 실패]", err);
    return await loadJSON(`downloadedExhibition_${id}`);
  }
}

// ✅ 전시 삭제
export async function deleteExhibition(id: string) {
  try {
    const dir = `${BASE_DIR}${id}`;
    await FileSystem.deleteAsync(dir, { idempotent: true });
    await deleteJSON(`downloadedExhibition_${id}`);
    console.log("✅ [전시 삭제 완료]");
  } catch (err) {
    console.error("❌ [전시 삭제 실패]", err);
  }
}
