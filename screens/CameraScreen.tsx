import { post } from "@aws-amplify/api";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  CameraType,
  CameraView,
  PermissionStatus,
  useCameraPermissions,
} from "expo-camera";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as StoreReview from "expo-store-review";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import {
  ApiBodyType,
  AppContextDispatch,
  AppContextState,
  RootStackParamList,
} from "../App";
import { BANNER_UNIT_ID, PROMPT_TEMPLATE, PROMPT_TEMPLATES } from "./constant";
import Constants from "expo-constants";
import {
  GestureEvent,
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import DropDownPickerAtom from "./DropDownPickerAtom";
import IconAtom from "./IconAtom";
import { uploadFile } from "./s3";
import {
  DEBUG_MODE,
  KEY,
  pointsChange,
  checkOverMaxLimit,
  checkOverMaxLimitPoints,
  getLocalStorage,
  returnMaxLimit,
  saveLocalStorage,
} from "./utils";
import * as ImageManipulator from "expo-image-manipulator";
import {
  MediaTypeOptions,
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import ConfirmDialog from "./ConfirmDialog";
import LinkDialog from "./LinkDialog";
import { initializeInterstitialAd, showInterstitialAd } from "./AdmobInter";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import {
  rewardInitializeInterstitialAd,
  showRewardInterstitialAd,
} from "./AdmobRewardInter";
import { aiAnswer } from "./api";
import { i18n } from "./locales/i18n";

const { width: screenWidth } = Dimensions.get("window");
const CameraScreen: React.FC = () => {
  const appContextState = useContext(AppContextState);
  const appContextDispatch = useContext(AppContextDispatch);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [resizedPhotoUri, setResizedPhotoUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDisplayExplane, setDisplayExplane] = useState(false);
  const [isOpenDropbox, setOpenDropbox] = useState(false);
  const [prompt, setProompt] = useState<PROMPT_TEMPLATE>();
  const [mode, setMode] = useState<number>(1);
  const [zoom, setZoom] = useState(0);
  const pinchRef = useRef(null);

  const [bodyResult, setBodyResult] = useState<string | null>(null);
  const [photoUriResult, setPhotoUriResult] = useState<string | null>(null);

  const [visible, setVisible] = useState(false);

  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "Camera">>();

  useEffect(() => {
    (async () => {
      const appName = Constants.expoConfig?.name;
      const prompt = Object.values(PROMPT_TEMPLATES).find(
        (template) => template.AppName === appName
      );
      const settingAiType = prompt!.No;
      setMode(settingAiType);
      if (!appContextState.isPremium) {
        rewardInitializeInterstitialAd(appContextDispatch.setShowedAdmob);
        initializeInterstitialAd(appContextDispatch.setShowedAdmob);
      }
    })();
  }, []);

  // 結果画面へ遷移処理
  useEffect(() => {
    if (!bodyResult || !photoUriResult) return;

    // 広告をまだ見てない場合は待機
    if (!appContextState.isPremium && appContextState.isShowedAdmob === null)
      return;

    if (appContextState.isPremium || appContextState.isShowedAdmob) {
      navigation.navigate("Result", {
        result: bodyResult,
        uri: photoUriResult,
      });
      setBodyResult(null);
      setPhotoUriResult(null);
    }
  }, [bodyResult, photoUriResult, appContextState.isShowedAdmob]);

  useEffect(() => {
    if (mode === 0) return;

    const propmpt = Object.values(PROMPT_TEMPLATES).find(
      (template) => template.No === mode
    );
    setProompt(propmpt);
    saveLocalStorage(KEY.AI_TYPE, mode);

    setDisplayExplane(false);
  }, [mode]);

  const [modes, setModes] = useState<number[]>([]); // modes配列のステートを管理する
  const GeneralPattern = [3, 4, 5, 7];
  const SubPremiumPattern = [7, 6, 5, 3];
  const PremiumPattern = [1, 2, 14, 13];
  useEffect(() => {
    // 配列が4要素以上にならないように調整し、新しいステートを設定
    setModes((prevModes) => {
      const updatedModes =
        prevModes.length >= 4
          ? [...prevModes.slice(1), mode]
          : [...prevModes, mode];
      return updatedModes;
    });
  }, [mode]);

  useEffect(() => {
    if (modes.length !== 4) return;

    if (GeneralPattern.every((value, index) => value === modes[index])) {
      Alert.alert("裏コード", "一般モード", [
        { text: "キャンセル", style: "cancel" },
        {
          text: "🤖💻：👨？",
          onPress: () => {
            appContextDispatch.setSubPremium(false);
            appContextDispatch.setPremium(false);
            saveLocalStorage(KEY.DEBUG_MODE, DEBUG_MODE.GENERAL);
          },
        },
      ]);
    } else if (
      SubPremiumPattern.every((value, index) => value === modes[index])
    ) {
      Alert.alert("裏コード", "サブプレミアムモード", [
        { text: "キャンセル", style: "cancel" },
        {
          text: "🤖💻：👸？",
          onPress: () => {
            appContextDispatch.setSubPremium(true);
            appContextDispatch.setPremium(false);
            saveLocalStorage(KEY.DEBUG_MODE, DEBUG_MODE.SUB_PREMIUM);
          },
        },
      ]);
    } else if (PremiumPattern.every((value, index) => value === modes[index])) {
      Alert.alert("裏コード", "プレミアムモード", [
        { text: "キャンセル", style: "cancel" },
        {
          text: "🤖💻：👑？",
          onPress: () => {
            appContextDispatch.setSubPremium(false);
            appContextDispatch.setPremium(true);
            saveLocalStorage(KEY.DEBUG_MODE, DEBUG_MODE.PREMIUM);
            pointsChange(5);
          },
        },
      ]);
    }
  }, [modes, appContextDispatch]);

  const handlePinchGesture = (event: GestureEvent<any>) => {
    console.log(event);
    if (event.nativeEvent.state === State.ACTIVE) {
      let newZoom = zoom + event.nativeEvent.velocity * 0.0002;
      if (newZoom < 0) newZoom = 0;
      if (newZoom > 1) newZoom = 1;
      setZoom(newZoom);
    }
  };

  const takePicture = async () => {
    if (appContextState.imagePhotoUri) {
      appContextDispatch.setImagePhotoUri(null);
      saveLocalStorage(KEY.IMAGE_PHOTO, "");
      return;
    }

    await appContextDispatch.requestPermission();
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setPhotoUri(photo!.uri);
      Image.getSize(photo!.uri, (width, height) => {
        setImageSize({ width, height });
      });
      // 確認ダイアログの表示
      setVisible(true);
    }
  };

  const getImageStyle = () => {
    if (!imageSize) {
      return styles.preview;
    }
    const aspectRatio = imageSize.width / imageSize.height;
    if (imageSize.width > screenWidth) {
      return {
        width: screenWidth,
        height: screenWidth / aspectRatio,
      };
    }
    return {
      width: imageSize.width,
      height: imageSize.height,
    };
  };

  const openImagePickerAsync = async () => {
    if (!appContextState.imagePermission?.granted) {
      if (
        appContextState.imagePermission?.status ===
        PermissionStatus.UNDETERMINED
      ) {
        const tmpPermission = await requestMediaLibraryPermissionsAsync();
        appContextDispatch.setImagePermission(tmpPermission);
      } else {
        Alert.alert(
          i18n.t("permissions_alerts.image_view_permission"),
          i18n.t("permissions_alerts.refer_permission"),
          [
            { text: i18n.t("actions.cancel"), style: "cancel" },
            {
              text: i18n.t("actions.go_to_settings"),
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]
        );
        return;
      }
    }

    const pickerResult = await launchImageLibraryAsync({
      selectionLimit: 1,
      mediaTypes: MediaTypeOptions.Images,
      quality: 0.1,
    });
    if (!pickerResult.canceled) {
      const url = pickerResult.assets[0].uri;
      setPhotoUri(url);
      appContextDispatch.setImagePhotoUri(url);
      saveLocalStorage(KEY.IMAGE_PHOTO, url);
      Image.getSize(url, (width, height) => {
        setImageSize({ width, height });
      });
      // 確認ダイアログの表示
      setVisible(true);
    }
  };

  const storeReview = async () => {
    try {
      if (await StoreReview.hasAction()) {
        const isReviewed = getLocalStorage(KEY.INIT_REVIEW);
        if (!isReviewed) {
          await saveLocalStorage(KEY.INIT_REVIEW, "true");
          alert(i18n.t("rewards.five_star_rating"));
          await StoreReview.requestReview();
          await pointsChange(10);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadPhoto = async (_photoUri?: string, isPointUse = false) => {
    try {
      // プレミアム会員ではなくて、最大回数を超えている場合は戻る
      if (
        (!isPointUse && (await checkOverMaxLimit())) ||
        (isPointUse && (await checkOverMaxLimitPoints()))
      ) {
        if (!isPointUse) await storeReview();
        // Alert.alert(
        //   isPointUse
        //     ? i18n.t("errors.not_enough_tickets")
        //     : i18n.t("errors.daily_limit_exceeded"),
        //   i18n.t("errors.purchase_tickets"),
        //   [
        //     { text: i18n.t("actions.cancel"), style: "cancel" },
        //     {
        //       text: i18n.t("errors.purchase"),
        //       onPress: () => navigation.navigate("Setting"),
        //     },
        //   ]
        // );
        Alert.alert(
          isPointUse
            ? i18n.t("errors.not_enough_tickets")
            : i18n.t("errors.daily_limit_exceeded")
        );
        return;
      }

      setLoading(true);
      if (!isPointUse) {
        // TODO: Google Admob
        showInterstitialAd(appContextDispatch.setShowedAdmob);
        showRewardInterstitialAd(appContextDispatch.setShowedAdmob);
      } else {
        // ポイント使用時は広告を見たとみなす
        appContextDispatch.setShowedAdmob(true);
      }
      let tmpPhotoUri = _photoUri ?? photoUri;
      if (!tmpPhotoUri) return;
      const size = tmpPhotoUri
        ? Image.getSize(tmpPhotoUri, (width, height) => {
            setImageSize({ width, height });
          })
        : null;
      const response = await fetch(tmpPhotoUri);
      const blob = await response.blob();
      const fileName = tmpPhotoUri.split("/").pop() || "image.jpg";

      const filePath = `public/${fileName}`;
      try {
        // const result = await uploadFileAmplify(blob, filePath);
        const result = await uploadFile(blob, filePath);
        console.log(result);
      } catch (error) {
        console.error(JSON.stringify(error, null, 2));
        returnMaxLimit();
        return;
      }

      const dateString = new Date().toISOString().split("T")[0];
      const updatedPromptUser =
        prompt!.PromptUser +
        `\r\n・今日は${dateString}なので日付が過ぎている食材は対象外です。`;
      console.log(updatedPromptUser);
      const apiResponse = await aiAnswer(filePath, updatedPromptUser);
      if (apiResponse.statusCode !== 200) {
        alert(i18n.t("errors.api_load_failed"));
        // returnMaxLimit();
        return;
      }
      const bodyJson = await apiResponse.body.json();
      const markdown = bodyJson.body
        .replace(/^###.*?```|```$/gs, "")
        .replace(/^markdown|MARKDOWN$/i, "");
      console.log(markdown);
      setBodyResult(markdown);

      getLocalStorage(KEY.HISTORY_LIST).then((currentList) => {
        const updatedList =
          currentList && !currentList.includes(dateString)
            ? `${dateString}\n${currentList}`
            : currentList || dateString;
        saveLocalStorage(KEY.HISTORY_LIST, updatedList);
        appContextDispatch.setHistoryList(updatedList.split("\n"));
      });
      saveLocalStorage(dateString, markdown);

      setPhotoUriResult(tmpPhotoUri);
      if (isPointUse) await pointsChange(-1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setPhotoUri(null);
    }
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#000000" />
  //       <Text>解析中...</Text>
  //     </View>
  //   );
  // } else if (!appContextState.permission?.granted) {
  //   // return (
  //   //   <View style={styles.loadingContainer}>
  //   //     <ActivityIndicator size="large" color="#000000" />
  //   //     <Text>解析中...</Text>
  //   //   </View>
  //   // );
  // }

  function toggleCameraFacing() {
    setFacing((current: any) => (current === "back" ? "front" : "back"));
  }

  const CameraOrView = (child?: ReactNode) => {
    if (appContextState.permission?.granted && !appContextState.imagePhotoUri) {
      return (
        <GestureHandlerRootView style={styles.cameraOutLine}>
          <PinchGestureHandler
            onGestureEvent={handlePinchGesture}
            ref={pinchRef}
          >
            <CameraView
              style={styles.camera}
              facing={facing}
              mute={true}
              zoom={zoom}
              pictureSize="640x480"
              ref={(ref) => setCameraRef(ref)}
            >
              {child}
            </CameraView>
          </PinchGestureHandler>
        </GestureHandlerRootView>
      );
    } else {
      return (
        <View style={styles.cameraOutLine}>
          {!appContextState.imagePhotoUri ? (
            <View style={styles.camera}>{child}</View>
          ) : (
            // 前に取った写真を表示
            <Image
              source={{ uri: appContextState.imagePhotoUri }}
              style={styles.camera}
            />
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={getImageStyle()} />
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text>{i18n.t("errors.analyzing")}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.container}>
          {prompt?.ShortExplane && (
            <View>
              <Text style={styles.headerHelpText}>{prompt?.ShortExplane}</Text>
            </View>
          )}
          {
            CameraOrView()
            // <TouchableOpacity
            //   style={styles.toogleFacing}
            //   onPress={toggleCameraFacing}
            // >
            //   <IconAtom name="camera-reverse" type="ionicon" size={20} />
            // </TouchableOpacity>
          }
          <TouchableOpacity
            style={styles.toogle}
            onPress={() => navigation.navigate("History")}
          >
            <IconAtom
              name="history"
              type="material-community"
              size={30}
              style={styles.toogleText}
            />
          </TouchableOpacity>
          {(isDisplayExplane || isOpenDropbox) && prompt?.Explane && (
            <View style={styles.explaneContainer}>
              <Text style={styles.explaneTitle}>
                {i18n.t("errors.explane")}
              </Text>
              <Text style={styles.explaneText}>{prompt?.Explane}</Text>
            </View>
          )}
          <View style={styles.shutterButtonContainer}>
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePicture}
            ></TouchableOpacity>
          </View>
          <View style={styles.galleryButtonContainer}>
            <TouchableOpacity onPress={openImagePickerAsync}>
              <IconAtom
                name="picture"
                type="simple-line-icon"
                style={styles.galleryButtonText}
                size={24}
                onPress={openImagePickerAsync}
              />
            </TouchableOpacity>
          </View>
          {/* <View style={styles.settingButtonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
              <IconAtom
                name="settings"
                type="material"
                size={19}
                style={styles.settingButtonText}
              />
            </TouchableOpacity>
          </View> */}
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => {
                if (!appContextState.registeredLink) {
                  appContextDispatch.setTempLink("");
                  appContextDispatch.setShowLinkDialog(true);
                } else {
                  Linking.openURL(appContextState.registeredLink);
                }
              }}
              onLongPress={() => {
                appContextDispatch.setTempLink(
                  appContextState.registeredLink || ""
                );
                appContextDispatch.setShowLinkDialog(true);
              }}
            >
              <Text>
                {appContextState.registeredLink
                  ? "広告リンクへ移動"
                  : "広告リンクを登録"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* <View style={styles.pickerContainer}>
            <DropDownPickerAtom
              value={mode}
              setValue={setMode}
              items={Object.values(PROMPT_TEMPLATES)
                .filter((allExclude) => allExclude.No > 0)
                .map((template: PROMPT_TEMPLATE) => ({
                  label: template.Title,
                  value: template.No,
                  icon: template.Icon,
                }))}
              open={isOpenDropbox}
              setOpen={setOpenDropbox}
            />
          </View> */}
        </View>
      )}
      {!appContextState.isPremium && (
        // TODO: Google Admob
        // <></>
        <BannerAd
          // unitId={TestIds.BANNER}
          unitId={BANNER_UNIT_ID.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      )}
      {ConfirmDialog({
        visible,
        setVisible,
        onClickMain: async () => {
          setVisible(false);
          await uploadPhoto(undefined, true);
        },
        onClickSub: async () => {
          setVisible(false);
          await uploadPhoto(undefined, false);
        },
        onClickCancel: async () => {
          setPhotoUri(null);
          setVisible(false);
        },
      })}
      {appContextState.showLinkDialog && (
        <LinkDialog
          visible={appContextState.showLinkDialog}
          tempLink={appContextState.tempLink || ""}
          setTempLink={appContextDispatch.setTempLink}
          setRegisteredLink={appContextDispatch.setRegisteredLink}
          onClose={() => appContextDispatch.setShowLinkDialog(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dcdcdc",
  },
  cameraOutLine: {
    backgroundColor: "#f5f5f5",
    marginTop: 64,
    // marginBottom: 30,
    flex: 1,
  },
  camera: {
    margin: 8,
    flex: 1,
    maxHeight: "76%",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    flex: 1,
    width: "100%",
  },
  loading: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  headerHelpText: {
    top: 36,
    position: "absolute",
    alignSelf: "center",
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.6)",
  },
  toogleFacing: {
    top: 8,
    right: 8,
    position: "absolute",
    alignSelf: "flex-end",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  buttonContainer: {
    flex: 0.1,
    justifyContent: "flex-end",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  shutterButtonContainer: {
    position: "absolute",
    bottom: 80,
    left: "50%",
    transform: [{ translateX: -35 }],
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200, 200, 200, 0.3)", // 完全に透明に設定
    borderWidth: 5, // 枠線を追加
    borderColor: "gray", // 枠線の色を白に設定
  },
  explaneContainer: {
    position: "absolute",
    top: "24%",
    left: "10%",
    right: "10%",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // 透明度を下げる
  },
  explaneTitle: {
    fontSize: 20,
    padding: 8,
  },
  explaneText: {
    left: 20,
    maxWidth: "90%",
    height: 250,
    fontSize: 16,
  },
  galleryButtonContainer: {
    position: "absolute",
    bottom: 85,
  },
  galleryButtonText: {
    fontSize: 32,
    width: 200,
    height: 200,
    top: 4,
    left: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  settingButtonContainer: {
    position: "absolute",
    bottom: 93,
    right: 20,
  },
  settingButtonText: {
    fontSize: 32,
    width: 200,
    height: 200,
    top: 4,
    left: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    position: "absolute",
    bottom: 30,
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0)", // 透明度を下げる
    borderRadius: 10,
    padding: 10,
    alignSelf: "center",
    maxWidth: 295,
  },
  pickerText: {
    // color: "rgba(255, 255, 255, 0.3)", // 透明度を下げる
    textAlign: "center",
    fontSize: 18,
  },
  toogle: {
    bottom: 0,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0)", // 透明度を下げる
    position: "absolute",
    alignSelf: "flex-end",
  },
  toogleText: {
    width: 200,
    height: 200,
    left: 3,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraScreen;
