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
import { i18n } from "./locales/i18n";
// Markdownコンポーネントのインポート
import MarkdownAtom from "./MarkdownAtom";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

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
    console.log(size);
    try {
      // setImageSize(getImageStyle(size));
    } catch (error) {
      // setImageSize(getImageStyle(size));
    }
  }, [uri]);

  const getImageStyle = (imageSize?: { width: number; height: number }) => {
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
          <View style={styles.bannerContainer}>
            <BannerAd
              unitId={BANNER_UNIT_ID.BANNER_2}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
          </View>
        )}
        <MarkdownAtom>{result}</MarkdownAtom>
        <Image source={{ uri: uri }} style={{ ...imageSize }} />
        {!appContextState.isPremium && (
          <>
            <BannerAd
              unitId={BANNER_UNIT_ID.BANNER_4}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
            <BannerAd
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
    margin: 10,
    marginBottom: 80,
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
});

export default ResultScreen;
