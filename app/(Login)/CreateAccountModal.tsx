import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateAccountModal({ visible, onClose }: Props) {
  const [agreeAll, setAgreeAll] = useState(false);
  const [terms, setTerms] = useState(false);      // 필수
  const [privacy, setPrivacy] = useState(false);  // 필수
  const [marketing, setMarketing] = useState(false); // 선택
  const [age, setAge] = useState(false);          // 필수

  const [showError, setShowError] = useState(false);

  const toggleAll = () => {
    const newValue = !agreeAll;
    setAgreeAll(newValue);
    setTerms(newValue);
    setPrivacy(newValue);
    setMarketing(newValue);
    setAge(newValue);
  };

  // 전체 동의 체크 상태 감지
  useEffect(() => {
    if (terms && privacy && age && marketing) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [terms, privacy, marketing, age]);

  const handleContinue = () => {
    if (!terms || !privacy || !age) {
      setShowError(true);
      return;
    }

    // 모든 필수 항목 동의 완료
    setShowError(false);
    onClose();
  };

  const CustomCheckBox = ({
    checked,
    onToggle,
    label,
    hasLink = false,
    onLinkPress,
    error = false,
  }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
    hasLink?: boolean;
    onLinkPress?: () => void;
    error?: boolean;
  }) => (
    <View style={styles.checkItem}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkBox, error && styles.checkBoxError]}
      >
        {checked && <View style={styles.checkMark} />}
      </TouchableOpacity>
      <Text style={styles.checkText}>{label}</Text>
      {hasLink && (
        <TouchableOpacity onPress={onLinkPress}>
          <Text style={styles.link}>보기</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>이용약관에 동의해 주세요</Text>

          <View style={styles.checkList}>
            <CustomCheckBox
              checked={agreeAll}
              onToggle={toggleAll}
              label="전체 동의"
            />
            <CustomCheckBox
              checked={terms}
              onToggle={() => setTerms(!terms)}
              label="[필수] 큐리즘 이용약관"
              hasLink
              onLinkPress={() => {}}
              error={showError && !terms}
            />
            <CustomCheckBox
              checked={privacy}
              onToggle={() => setPrivacy(!privacy)}
              label="[필수] 개인정보처리방침"
              hasLink
              onLinkPress={() => {}}
              error={showError && !privacy}
            />
            <CustomCheckBox
              checked={marketing}
              onToggle={() => setMarketing(!marketing)}
              label="[선택] 마케팅 수신"
            />
            <CustomCheckBox
              checked={age}
              onToggle={() => setAge(!age)}
              label="[필수] 본인은 만 14세 이상입니다."
              error={showError && !age}
            />
          </View>

          {showError && (
            <Text style={styles.errorText}>
              필수 약관에 모두 동의하셔야 다음 단계로 진행할 수 있어요.
            </Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>계속</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  checkList: {
    gap: 12,
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBoxError: {
    borderColor: "red",
  },
  checkMark: {
    width: 12,
    height: 12,
    backgroundColor: "#FF5C39",
  },
  checkText: {
    flex: 1,
    fontSize: 14,
  },
  link: {
    color: "red",
    marginLeft: 6,
    fontSize: 13,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#FF5C39",
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
