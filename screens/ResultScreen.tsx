import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppContextState,
  OpenAiResult,
  ResultScreenRouteProp,
  RootStackParamList,
} from "../App";
import IconAtom from "./IconAtom";
import { BANNER_UNIT_ID } from "./constant";
// TODO: Google Admob
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { i18n } from "./locales/i18n";

const { width: screenWidth } = Dimensions.get("window");
const ResultScreen: React.FC = () => {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "Result">>();
  const appContextState = useContext(AppContextState);

  const route = useRoute<ResultScreenRouteProp>();
  const { result, uri } = route.params;
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!uri) return;
    const size = Image.getSize(uri, (width, height) => {
      return { width, height };
    });
    try {
      setImageSize(getImageStyle(size));
    } catch (error) {
      setImageSize(getImageStyle(size));
    }
  }, [uri]);

  if (!Array.isArray(result))
    return (
      <View style={styles.container}>
        <Text style={styles.resultItem}>
          {i18n.t("actions.analysis_result")}
          {result}
        </Text>
      </View>
    );

  const normalView = (item: OpenAiResult, index: number) => {
    return (
      <View key={index} style={styles.resultItem}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title} </Text>
          {item.result != undefined && (
            <Text style={item.result ? styles.answer : styles.answer_failed}>
              {`（${item.result ? "〇" : "×"}）`}
            </Text>
          )}
        </View>
        {item.body && <Text style={styles.body}>{item.body}</Text>}
        {item.answer && (
          <Text
            selectable={true}
            style={item.result ? styles.answer : styles.answer_failed}
          >
            {i18n.t("actions.answer")}
            {item.answer}
          </Text>
        )}
        {item.explanation && (
          <Text style={styles.explanation}>
            {i18n.t("actions.explanation")}
            {item.explanation}
          </Text>
        )}
      </View>
    );
  };
  const getImageStyle = (imageSize?: { width: number; height: number }) => {
    console.log("getImageStyle");
    console.log(imageSize);
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {!appContextState.isPremium && (
          // TODO: Google Admob
          // <></>
          <View style={styles.bannerContainer}>
            <BannerAd
              // unitId={TestIds.BANNER}
              unitId={BANNER_UNIT_ID.BANNER_2}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
          </View>
        )}
        {result.map((item: OpenAiResult, index: number) =>
          normalView(item, index)
        )}
        <>
          <Image source={{ uri: uri }} style={{ ...imageSize }} />
        </>
        {!appContextState.isPremium && (
          // TODO: Google Admob
          // <></>
          <>
            <BannerAd
              // unitId={TestIds.BANNER}
              unitId={BANNER_UNIT_ID.BANNER_4}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
            <BannerAd
              // unitId={TestIds.BANNER}
              unitId={BANNER_UNIT_ID.BANNER_5}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
          </>
        )}
      </ScrollView>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.toogleContainer}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <IconAtom
            color="blue"
            name="arrow-back"
            type="ionicon"
            size={28}
            style={styles.toogle}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    top: 65,
  },
  bannerContainer: {
    marginTop: 16,
  },
  preview: {
    width: screenWidth,
    height: 500,
  },
  headerContainer: {
    position: "absolute",
  },
  toogleContainer: {
    top: 32,
    left: 5,
    backgroundColor: "rgba(255, 255, 255, 0)",
    alignSelf: "flex-start",
  },
  toogle: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  resultItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "green",
  },
  answer_failed: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "red",
  },
  explanation: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  result: {
    fontSize: 14,
    fontWeight: "bold",
    color: "green",
  },
});
export default ResultScreen;
