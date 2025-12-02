import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
  },
  missionList: {
    marginTop: 20,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  missionIconContainer: {
    position: 'relative',
    marginRight: 20,
  },
  progressCircle: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FEE500',
    backgroundColor: 'transparent',
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  missionButton: {
    marginLeft: 'auto',
    backgroundColor: '#FF6A3D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: '#FF6A3D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  invitationCodeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
  },
  invitationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});
