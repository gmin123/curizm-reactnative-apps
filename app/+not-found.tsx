import CustomText from "@/app/components/CustomeText";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <CustomText>Page not found</CustomText>
    </View>
  );
}