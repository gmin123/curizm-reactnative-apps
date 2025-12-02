import { StyleSheet } from 'react-native';

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  // 상단 헤더 (뒤로가기, 공유, 좋아요 버튼)
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  
  exhipagetopiconcontainer: {
    flexDirection: "row",   // 가로 배치
    alignItems: "center",   // 세로 가운데
    justifyContent: "flex-end", // 오른쪽 정렬
    gap: 12,
  },
  
  // 커버 이미지
  coverImage: {
    width: "100%",
    height: 200,

    backgroundColor: "#666",
  },
  
  // 내용 카드 (흰색 둥근 박스)
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,


    marginHorizontal: 16,
    marginTop: 124,
    
    elevation: 4,
    zIndex: 2,
  },
  
  // 제목
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },
  
  // 메타 정보 (좋아요, 생각 수)
  metaText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  
  // 소개글 컨테이너
  introContainer: {
    marginBottom: 16,
  },
  
  // 소개글
  introText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  
  // 더보기 텍스트
  moreText: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  
  // 버튼 행 (도슨트 듣기, 다운로드)
  buttonsRow: {
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    gap: 8,
  },
  
  // 도슨트 듣기 버튼
  listenButton: {
    backgroundColor: "#fa6336",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 6,
    width: "45%",
  },
  
  // 도슨트 듣기 텍스트
  listenButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  // 다운로드 버튼
  downloadButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  
  // 다운로드 텍스트
  downloadButtonText: {
    color: "#666",
    fontSize: 14,
  },
  
  // 좋아요 버튼
  likeButton: {
position: "absolute",
flexDirection: "row",   // 가로 배치
alignItems: "center",  
    top: 16,
    right: 16,
  },
  
  // 탭 바 컨테이너
  tabBarContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f2f3",
    backgroundColor: "#fff",
    marginTop: 16,
  },
  
  // 개별 탭
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  
  // 활성 탭
  activeTab: {
    borderBottomColor: "#fa6336",
  },
  
  // 탭 텍스트
  tabText: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "500",
  },
  
  // 활성 탭 텍스트
  activeTabText: {
    color: "#fa6336",
    fontWeight: "bold",
  },
  
  // 페이지 컨테이너
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  // 중앙 정렬
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
