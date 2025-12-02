import CustomText from "@/app/components/CustomeText";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TouchableOpacity,
    View,
} from "react-native";
import { Exhibition, getFilteredExhibitions } from "../../../../api/ExhibitionListSwiper";
import DropdownButton from "../dropdownbtn";
import styles from "./listswiper.styles";

const { width } = Dimensions.get("window");
interface ExhibitionListSwiperProps {
  style?: object;
}

const getCurrentMonthString = () => {
  const currentMonth = new Date().getMonth() + 1;
  return `${currentMonth}월`;
};

export default function ExhibitionListSwiper({ style }: ExhibitionListSwiperProps) {
  const [region, setRegion] = useState("서울");
  const [month, setMonth] = useState(getCurrentMonthString());
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exhibitionData, setExhibitionData] = useState<Exhibition[]>([]);
  const navigation = router;

  const regions = [
    "서울",
    "경기, 인천",
    "충청도, 대전",
    "강원도",
    "전라도, 광주",
    "경상도, 대구",
    "부산, 울산",
    "제주도",
    "아시아",
    "유럽",
    "북아메리카",
    "남아메리카",
    "아프리카",
    "오세아니아",
    "온라인",
    "큐리즘",
  ];

  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

  const fetchExhibitions = async () => {
    setLoading(true);
    try {
      const monthNum = parseInt(month.replace("월", ""));
      const rawData = await getFilteredExhibitions(region, monthNum);
      const flatList = rawData.flat();

      // 온라인 필터
      const filtered = region === "온라인"
        ? flatList
        : flatList.filter(item => item.source !== "온라인");

      setExhibitionData(filtered);
      setCurrentPage(0); // 필터 변경 시 페이지 초기화
    } catch (error) {
      setExhibitionData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, [region, month]);

  // 3개씩 페이지 단위
  const pages: Exhibition[][] = [];
  for (let i = 0; i < exhibitionData.length; i += 3) {
    pages.push(exhibitionData.slice(i, i + 3));
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentPage(newIndex);
  };

  const renderPaginationDots = () => (
    <View style={styles.pagination}>
      {pages.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            currentPage === i ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <CustomText style={styles.header}>전시 보러 갈래요?</CustomText>

      <View style={styles.filterContainer}>
        <View style={styles.dropdownWrapper}>
          <DropdownButton
            options={regions}
            selected={region}
            onSelect={setRegion}
            placeholder="지역 선택"
          />
        </View>
        <View style={styles.dropdownWrapper}>
          <DropdownButton
            options={months}
            selected={month}
            onSelect={setMonth}
            placeholder="월 선택"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : exhibitionData.length === 0 ? (
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <CustomText>해당 조건의 전시가 없습니다.</CustomText>
        </View>
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.page}>
              {item.map((exhibit, idx) => (
                <TouchableOpacity
                  key={exhibit.id || idx}
                  onPress={() =>
                    navigation.push({
                      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
                      params: { id: String(exhibit.id) },
                    })
                  }
                >
                  <View style={styles.card}>
                    <View style={styles.topTag}>
                      <CustomText style={styles.topTagText}>
                        {exhibit.priceCoins > 0 ? "유료 전시" : "무료 전시"}
                      </CustomText>
                    </View>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <CustomText style={styles.title}>
                          {exhibit.title || "제목 없음"}
                        </CustomText>
                        <CustomText style={styles.place}>
                          장소{" "}
                          {typeof exhibit.organizer === "string"
                            ? exhibit.organizer
                            : exhibit.organizer?.location?.trim() || "미정"}
                        </CustomText>
                        <CustomText style={styles.date}>
                          기간{" "}
                          {exhibit.startDate?.slice(0, 10).replace(/-/g, ".") || "?"} ~{" "}
                          {exhibit.endDate?.slice(0, 10).replace(/-/g, ".") || "?"}
                        </CustomText>
                      </View>
                      <Image
                        source={
                          exhibit.coverImage
                            ? { uri: exhibit.coverImage }
                            : require("../../../../assets/images/icon.png")
                        }
                        style={styles.image}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}

      {pages.length > 1 && renderPaginationDots()}
    </View>
  );
}
