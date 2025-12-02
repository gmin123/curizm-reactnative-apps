
import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window"); 
const styles = StyleSheet.create({
    container: { paddingVertical: 20, backgroundColor: "#fff" },
    header: { fontSize: 18, fontWeight: "bold", marginHorizontal: 20, marginBottom: 10 },
    filterContainer: { flexDirection: "row", marginBottom: 12, paddingHorizontal: 20 },
    dropdownWrapper: {
      flex: 1,
      marginHorizontal: 4,
    },
    page: { width, paddingHorizontal: 20 },
    card: { borderColor: "#eee", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20, backgroundColor: "#fff" },
    topTag: { backgroundColor: "#FFE3DC", alignSelf: "flex-start", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 },
    topTagText: { color: "#FF5630", fontSize: 11, fontWeight: "bold" },
    row: { flexDirection: "row", alignItems: "center" },
    title: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
    place: { fontSize: 13, color: "#666" },
    date: { fontSize: 13, color: "#666", marginTop: 2 },
    image: { width: 64, height: 64, borderRadius: 8, marginLeft: 10 },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: "#0F172A",
    },
    inactiveDot: {
      backgroundColor: "#ccc",
    },
  });
  export default styles;