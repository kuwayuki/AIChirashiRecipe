import { NavigationContainer, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator,
} from "@react-navigation/stack";
import { Amplify } from "aws-amplify";
import React, { useEffect, useMemo, useState } from "react";
import CameraScreen from "./screens/CameraScreen";
import { getLocales, getCalendars } from "expo-localization";
import { authenticate } from "./screens/GuestAuth";
import ResultScreen from "./screens/ResultScreen";
import Constants from "expo-constants";
import {
  CameraPermissionResponse,
  MediaLibraryPermissionResponse,
  PermissionStatus,
  getCameraPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
} from "expo-image-picker";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { Alert, AppState, AppStateStatus, Linking } from "react-native";
import { PROMPT_TEMPLATES } from "./screens/constant";
import {
  DEBUG_MODE,
  KEY,
  getLocalStorage,
  getLocalStorageSecure,
  pointsChange,
  pointsService,
  saveLocalStorage,
  saveLocalStorageSecure,
} from "./screens/utils";
import InitialScreen from "./screens/InitialScreen";
import SettingScreen from "./screens/SettingScreen";
import PurchaseOptions from "./screens/PurchaseOptions";
import { i18n } from "./screens/locales/i18n";
import HistoryScreen from "./screens/HistoryScreen";
// import i18n from "./screens/locales/i18n";
// import en from "./screens/locales/en/translation.json";

const Stack = createStackNavigator<RootStackParamList>();
// ナビゲーションのパラメータ型を定義
export type RootStackParamList = {
  Initial: undefined;
  Camera: undefined;
  Result: {
    result: string;
    uri: string;
  };
  Setting: undefined;
  Purchase: undefined;
  History: undefined;
};

export type ResultScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Result"
>;
export type ResultScreenRouteProp = RouteProp<RootStackParamList, "Result">;

// 全ページの共通項目
export type appContextState = {
  aiType: number;
  settingAiType: number;
  isAppOpenRead: boolean;
  isInitialRead: boolean;
  isShowedAdmob: boolean | null;
  isPremium: boolean;
  isSubPremium: boolean;
  permission: CameraPermissionResponse | null;
  imagePermission: MediaLibraryPermissionResponse | null;
  historyList: string[];
  registeredLink: string;
  tempLink: string;
  showLinkDialog: boolean;
  imagePhotoUri: string | null;
};
export const AppContextState = React.createContext({} as appContextState);

export type appContextDispatch = {
  setAiType: (aiType: number) => void;
  setSettingAiType: (settingAiType: number) => void;
  setAppOpenRead: (isAppOpenRead: boolean) => void;
  setInitialRead: (isInitialRead: boolean) => void;
  setShowedAdmob: (isShowedAdmob: boolean | null) => void;
  setPremium: (isPremium: boolean) => void;
  setSubPremium: (isSubPremium: boolean) => void;
  setPermission: (permission: CameraPermissionResponse) => void;
  setImagePermission: (imagePermission: MediaLibraryPermissionResponse) => void;
  requestPermission: () => Promise<void>;
  setHistoryList: (historyList: string[]) => void;
  setRegisteredLink: (registeredLink: string) => void;
  setTempLink: (tempLink: string) => void;
  setShowLinkDialog: (showLinkDialog: boolean) => void;
  setImagePhotoUri: (tempLink: string | null) => void;
};
export const AppContextDispatch = React.createContext({} as appContextDispatch);

export type ApiBodyType = {
  key: string;
  promptUser?: string;
};

export type ApiResponseType = {
  statusCode: number;
  openAiResult: OpenAiResult[];
};

export type OpenAiResult = {
  No: number;
  body: string;
};

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-northeast-1_ko24HbtRe",
      userPoolClientId: "7g9p34va70an8glcrcd9tc2fn",
      identityPoolId: "ap-northeast-1:8aef5d24-b742-4b96-8734-1129d8e2179c",
    },
  },
  API: {
    REST: {
      IAnswer: {
        service: "IAnswer",
        endpoint:
          "https://3b1n19hsu4.execute-api.ap-northeast-1.amazonaws.com/Init",
        region: "ap-northeast-1",
      },
    },
  },
  Storage: {
    S3: {
      bucket: "ianswer1c0febcad18d444ca1fb391b19a950abb6a53-dev",
      region: "ap-northeast-1",
    },
  },
});

const App: React.FC = () => {
  const [aiType, setAiType] = useState(0);
  // インストール後初回読込フラグ
  const [isInitialRead, setInitialRead] = useState(false);
  // 起動時読込を行うフラグ
  const [isAppOpenRead, setAppOpenRead] = useState(false);
  // 広告動画見終わりフラグ
  const [isShowedAdmob, setShowedAdmob] = useState<boolean | null>(null);
  const [isPremium, setPremium] = useState(false);
  const [isSubPremium, setSubPremium] = useState(false);
  const [settingAiType, setSettingAiType] = useState(0);
  const [permission, setPermission] = useState<CameraPermissionResponse | null>(
    null
  );
  const [imagePermission, setImagePermission] =
    useState<MediaLibraryPermissionResponse | null>(null);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [registeredLink, setRegisteredLink] = useState<string>("");
  const [tempLink, setTempLink] = useState<string>("");
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [imagePhotoUri, setImagePhotoUri] = useState<string | null>(null);

  useEffect(() => {
    const func = async () => {
      const initialRead = await getLocalStorage(KEY.INITIAL_READ);
      if (!initialRead) {
        saveLocalStorage(KEY.INITIAL_READ, "true");

        // 初回だけ1チケット追加
        await pointsService(true);

        Alert.alert(
          i18n.t("instructions.part1"),
          i18n.t("instructions.part2"),
          [
            {
              text: "OK",
              onPress: () => {
                setInitialRead(true);
              },
            },
          ]
        );
      } else {
        // 起動読込開始
        setAppOpenRead(true);
      }
    };
    func();
  }, []);

  // 初回読込時だけ、トラッキングを表示
  useEffect(() => {
    if (!isInitialRead) return;

    const func = async () => {
      const { granted, canAskAgain } = await getTrackingPermissionsAsync();
      if (!granted && canAskAgain) {
        await requestTrackingPermissionsAsync();
      }
      // 起動読込開始
      setAppOpenRead(true);
    };
    func();
  }, [isInitialRead]);

  useEffect(() => {
    const appName = Constants.expoConfig?.name;
    const prompt = Object.values(PROMPT_TEMPLATES).find(
      (template) => template.AppName === appName
    );
    setSettingAiType(prompt!.No);
    getLocalStorage(KEY.LINK_AD).then((linkAd) => {
      if (linkAd) setRegisteredLink(linkAd);
    });
    getLocalStorage(KEY.HISTORY_LIST).then((currentList) => {
      if (currentList) setHistoryList(currentList.split("\n"));
    });
    getLocalStorage(KEY.IMAGE_PHOTO).then((uri) => {
      if (uri) setImagePhotoUri(uri);
    });
  }, []);

  // useEffect(() => {
  //   const startSignIn = async () => {
  //     await authenticate();
  //   };
  //   // startSignIn();
  // }, []);

  useEffect(() => {
    if (!isAppOpenRead) return;

    const func = async () => {
      await requestPermission();
      setImagePermission(await getMediaLibraryPermissionsAsync());
      // 初回読込完了
      setInitialRead(false);
      // 起動読込完了
      setAppOpenRead(false);

      // 以降はアプリを開く度に確認
      const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        // 初回読み完了かつ、起動後読み込み完了
        if (!isInitialRead && !isAppOpenRead && nextAppState === "active") {
          if (!permission?.granted === false) {
            await requestPermission();
          }
          if (!imagePermission?.granted === false) {
            setImagePermission(await getMediaLibraryPermissionsAsync());
          }
        }
      };
      const subscription = AppState.addEventListener(
        "change",
        handleAppStateChange
      );
      return () => {
        subscription.remove();
      };
    };
    func();
  }, [isAppOpenRead]);

  useEffect(() => {
    const func = async () => {
      const debug = await getLocalStorage(KEY.DEBUG_MODE);
      if (debug) {
        if (Number(debug) === DEBUG_MODE.GENERAL) {
          setSubPremium(false);
          setPremium(false);
        } else if (Number(debug) === DEBUG_MODE.SUB_PREMIUM) {
          setSubPremium(true);
          setPremium(false);
        } else if (Number(debug) === DEBUG_MODE.PREMIUM) {
          setSubPremium(false);
          setPremium(true);
        }
      }
    };
    func();
  }, []);

  const requestPermission = async () => {
    const cameraPermission = await getCameraPermissionsAsync();
    setPermission(cameraPermission);
    if (!cameraPermission.granted) {
      if (cameraPermission.status === PermissionStatus.UNDETERMINED) {
        const tmpPermission = await requestCameraPermissionsAsync();
        setPermission(tmpPermission);
      } else {
        Alert.alert(
          i18n.t("permissions.camera_required"),
          i18n.t("permissions.camera_usage"),
          [
            { text: i18n.t("actions.cancel"), style: "cancel" },
            {
              text: i18n.t("actions.go_to_settings"),
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]
        );
      }
    }
  };

  const appContextStateValue = useMemo(
    () => ({
      aiType,
      settingAiType,
      isAppOpenRead,
      isInitialRead,
      isShowedAdmob,
      isPremium,
      isSubPremium,
      permission,
      imagePermission,
      historyList,
      registeredLink,
      tempLink,
      showLinkDialog,
      imagePhotoUri,
    }),
    [
      aiType,
      settingAiType,
      isAppOpenRead,
      isInitialRead,
      isShowedAdmob,
      permission,
      imagePermission,
      isPremium,
      isSubPremium,
      historyList,
      registeredLink,
      tempLink,
      showLinkDialog,
      imagePhotoUri,
    ]
  );

  return (
    <AppContextState.Provider value={appContextStateValue}>
      <AppContextDispatch.Provider
        value={{
          setAiType,
          setSettingAiType,
          setAppOpenRead,
          setInitialRead,
          setShowedAdmob,
          setPremium,
          setSubPremium,
          setPermission,
          setImagePermission,
          requestPermission,
          setHistoryList,
          setRegisteredLink,
          setTempLink,
          setShowLinkDialog,
          setImagePhotoUri,
        }}
      >
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isInitialRead ? "Initial" : "Camera"}
          >
            <Stack.Screen
              name="Initial"
              component={InitialScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ headerShown: false, title: i18n.t("camera") }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ headerShown: false, title: i18n.t("result") }}
            />
            <Stack.Screen
              name="Setting"
              component={SettingScreen}
              options={{ title: i18n.t("settings") }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: i18n.t("history") }}
            />
            {/* <Stack.Screen
              name="Purchase"
              component={PurchaseOptions}
              options={{ headerShown: false }}
            /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </AppContextDispatch.Provider>
    </AppContextState.Provider>
  );
};

export default App;
