// app/(mypage)/settings/PersonRaw.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PersonRaw() {
  const router = useRouter();

  return (
    <SafeAreaView style={S.safe}>
      {/* 상단 헤더 */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={S.back}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={S.body}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator
      >
        {/* 제목 */}
        <Text style={S.title}>개인정보 처리방침</Text>

        {/* 본문 */}
        <P>
          제1조 (목적){"\n"}
          주식회사 메시스(이하 “회사”)는 「개인정보 보호법」 등 관계 법령을 준수하며,
          이용자의 개인정보를 안전하게 보호하기 위하여 본 개인정보 처리방침을
          수립·공개합니다.
        </P>

        <P>
          제2조 (수집하는 개인정보 항목){"\n"}
          • 회원가입 시: 이름, 이메일, 비밀번호, 연락처{"\n"}
          • 서비스 이용 시: 접속 로그, 기기 정보, 쿠키, IP 주소{"\n"}
          • 유료 서비스 결제 시: 결제 수단 정보(카드사/PG사에서 필요한 최소한의 정보)
        </P>

        <P>
          제3조 (개인정보의 수집 및 이용 목적){"\n"}
          회사는 다음 목적을 위하여 개인정보를 처리합니다.{"\n"}
          • 회원 식별 및 본인 확인{"\n"}
          • 서비스 제공 및 운영{"\n"}
          • 결제 및 환불{"\n"}
          • 고객 상담 및 불만 처리{"\n"}
          • 부정이용 방지 및 법적 분쟁 대응
        </P>

        <P>
          제4조 (개인정보의 보관 및 이용기간){"\n"}
          • 회원 탈퇴 시 즉시 파기{"\n"}
          • 단, 관련 법령에 의해 일정 기간 보관이 필요한 경우 해당 기간 동안 별도 보관
        </P>

        <P>
          제5조 (개인정보 제3자 제공){"\n"}
          회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다. 다만, 법령에 따른
          요청이 있는 경우에 한하여 예외적으로 제공합니다.
        </P>

        <P>
          제6조 (개인정보 처리의 위탁){"\n"}
          회사는 서비스 향상을 위해 필요한 경우 위탁 계약을 체결하여 개인정보 처리를
          위탁할 수 있으며, 수탁사는 개인정보 보호법에 따라 안전하게 관리합니다.
        </P>

        <P>
          제7조 (정보주체의 권리){"\n"}
          이용자는 언제든지 자신의 개인정보에 대해 열람·정정·삭제·처리정지를 요구할 수
          있습니다. 관련 요청은 고객센터(이메일: contact@mesis.kr, 전화: 02-6406-4789)를
          통해 가능합니다.
        </P>

        <P>
          제8조 (개인정보 보호책임자){"\n"}
          회사는 개인정보 보호책임자를 지정하여 이용자의 개인정보 보호 관련 문의를
          처리하고 있습니다.{"\n"}
          • 개인정보보호 책임자: OOO{"\n"}
          • 이메일: contact@mesis.kr
        </P>

        <P>
          제9조 (개인정보 처리방침의 변경){"\n"}
          본 개인정보 처리방침은 법령·서비스 변경 등으로 개정될 수 있으며, 변경 시 최소
          7일 전 서비스 내 공지합니다.
        </P>

        <P>
          제10조 (시행일){"\n"}
          본 방침은 2025년 3월 23일부터 시행됩니다.
        </P>
      </ScrollView>
    </SafeAreaView>
  );
}

function P({ children }: React.PropsWithChildren<{}>) {
  return <Text style={S.p}>{children}</Text>;
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  back: { fontSize: 20, color: "#111" },
  body: { paddingHorizontal: 16 },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
    marginTop: 8,
    marginBottom: 16,
  },
  p: { fontSize: 14, lineHeight: 22, color: "#111", marginBottom: 12 },
});
