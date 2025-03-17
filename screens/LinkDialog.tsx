import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { KEY, saveLocalStorage } from "./utils";

interface LinkDialogProps {
  visible: boolean;
  tempLink: string;
  setTempLink: (link: string) => void;
  setRegisteredLink: (link: string) => void;
  onClose: () => void;
}

const LinkDialog: React.FC<LinkDialogProps> = ({
  visible,
  tempLink,
  setTempLink,
  setRegisteredLink,
  onClose,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>リンク登録</Text>
          <Text style={styles.modalDescription}>
            頻繁にアクセスする広告のリンクURLを登録してください。簡単にアクセスできます。
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="URLを入力"
            value={tempLink}
            onChangeText={setTempLink}
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setRegisteredLink(tempLink);
                saveLocalStorage(KEY.LINK_AD, tempLink);
                onClose();
              }}
            >
              <Text style={styles.modalButtonText}>登録する</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "gray" }]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default LinkDialog;
