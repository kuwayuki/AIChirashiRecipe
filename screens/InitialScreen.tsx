import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  AppContextDispatch,
  AppContextState,
  RootStackParamList,
} from "../App";
import { PermissionStatus } from "expo-camera";

const InitialScreen: React.FC = () => {
  const appContextState = useContext(AppContextState);
  const appContextDispatch = useContext(AppContextDispatch);

  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "Initial">>();

  useEffect(() => {
    // カメラ情報取得が終わった場合
    if (appContextState.permission?.status !== PermissionStatus.UNDETERMINED)
      navigation.navigate("Camera");
  }, [appContextState.permission]);

  return <View style={styles.container}></View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default InitialScreen;
