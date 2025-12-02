import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DescriptionModal({ visible, onClose, description }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.desc}>{description}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: "#fff" }}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", borderRadius: 12, padding: 24, width: "80%" },
  desc: { fontSize: 16, marginBottom: 20 },
  closeBtn: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, alignItems: "center" },
}); 