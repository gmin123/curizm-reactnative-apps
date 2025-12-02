import CustomText from "@/app/components/CustomeText";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import NoteList from "./(notelist)/NoteList";
import HorizontalCardSlider from "./HorizontalCardSlider";

export default function CustomTabBar() {
  const [activeTab, setActiveTab] = useState<"discover" | "note">("discover");

  return (
    <View>
      {/* 탭 선택 UI */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "discover" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("discover")}
        >
          <CustomText
            style={
              activeTab === "discover"
                ? styles.activeText
                : styles.inactiveText
            }
          >
            새로운 발견
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "note" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("note")}
        >
          <CustomText
            style={
              activeTab === "note"
                ? styles.activeText
                : styles.inactiveText
            }
          >
            생각 노트
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* 탭에 따라 내용 보여주기 */}
      {activeTab === "discover" && <HorizontalCardSlider />}
      {activeTab === "note" && (
        <View style={{ padding: 20 }}>
          <NoteList />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f5fa",
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  activeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  inactiveText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#7f8fa6",
  },
});
