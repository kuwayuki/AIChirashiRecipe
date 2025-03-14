import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, Dialog, Paragraph, TouchableRipple } from "react-native-paper";
import { AppContextState } from "../App";
import { KEY, getLocalStorageSecure } from "./utils";

type confirm = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onClickMain: (prop: any) => Promise<void>;
  onClickSub: (prop: any) => Promise<void>;
  onClickCancel: (prop: any) => Promise<void>;
};

const ConfirmDialog = (props: confirm) => {
  const [point, setpoint] = useState(0);
  const hideDialog = () => props.setVisible(false);

  useEffect(() => {
    if (!props.visible) return;
    (async () => {
      const tmp = await getLocalStorageSecure(KEY.POINTS_LIMIT);
      if (tmp) setpoint(Number(tmp));
    })();
  }, [props.visible]);

  return (
    <Dialog
      visible={props.visible}
      onDismiss={hideDialog}
      style={{
        margin: 0, // 左右のマージンを調整
        padding: 0, // 上部のパディングを調整
      }}
    >
      <Dialog.Title
        style={{
          fontSize: 20,
          margin: 0, // 左右のマージンを調整
          padding: 0, // 上部のパディングを調整
        }}
      >
        画像を解析します
      </Dialog.Title>
      <TouchableRipple onPress={props.onClickMain}>
        <Text
          style={{
            backgroundColor: "orange",
            margin: 15,
            padding: 20,
            fontSize: 16,
          }}
        >
          チケットを消費して解析
        </Text>
      </TouchableRipple>
      <Dialog.Content
        style={{
          margin: 0, // 左右のマージンを調整
          padding: 0, // 上部のパディングを調整
        }}
      >
        <Paragraph>チケット数：{point}</Paragraph>
      </Dialog.Content>
      <Dialog.Actions
        style={{
          justifyContent: "space-between",
          borderTopWidth: 1,
          borderTopColor: "#ccc",
          paddingTop: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              borderRightWidth: 1, // 右側の境界線
              borderRightColor: "#ccc", // 境界線の色
              paddingRight: 10, // 境界線とボタンの間のパディング
            }}
          >
            <Button color="gray" onPress={props.onClickCancel}>
              キャンセル
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={props.onClickSub}>広告を見て解析</Button>
          </View>
        </View>
      </Dialog.Actions>
    </Dialog>
  );
};

export default ConfirmDialog;
