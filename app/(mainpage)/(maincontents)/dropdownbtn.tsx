// components/DropdownButton.tsx
import CustomText from "@/app/components/CustomeText";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface DropdownButtonProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export default function DropdownButton({
  options,
  selected,
  onSelect,
  placeholder = "선택하세요",
}: DropdownButtonProps) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (item: string) => {
    onSelect(item);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <CustomText style={styles.buttonText}>
          {selected || placeholder}
        </CustomText>
        <CustomText style={styles.arrow}>▼</CustomText>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalView}>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelect(item)}
                  >
                    <CustomText style={styles.modalItemText}>{item}</CustomText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  buttonText: {
    fontSize: 14,
    color: "#333",
  },
  arrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 14,
    color: "#333",
  },
});
