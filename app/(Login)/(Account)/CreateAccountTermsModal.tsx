import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateAccountTermsModal({ navigation }) {
  const [allChecked, setAllChecked] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    terms: false,
    privacy: false,
    marketing: false,
    age: false,
  });

  const handleAllCheck = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setCheckedItems({
      terms: newValue,
      privacy: newValue,
      marketing: newValue,
      age: newValue,
    });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.box}>
        <Text style={styles.modalTitle}>이용약관에 동의해 주세요</Text>

        <TouchableOpacity onPress={handleAllCheck}>
          <Text>☐ 전체 동의</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>☐ [필수] 큐리즘 이용약관 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>☐ [필수] 개인정보처리방침 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>☐ [선택] 마케팅 수신</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>☐ [필수] 본인은 만 14세 이상입니다.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate("CreateAccountStep2")}
        >
          <Text style={styles.continueText}>계속</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  box: {
    backgroundColor: "#fff",
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
  },
  continueBtn: {
    marginTop: 24,
    backgroundColor: "#FF5B55",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
