import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useContext, useState, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { AppContextState, RootStackParamList } from "../App";
import PurchaseOptions from "./PurchaseOptions";
import { getLocalStorage } from "./utils";
import MarkdownAtom from "./MarkdownAtom";

const { width: screenWidth } = Dimensions.get("window");

const HistoryScreen: React.FC = () => {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "Setting">>();
  const appContextState = useContext(AppContextState);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [localStorageValues, setLocalStorageValues] = useState<
    { key: string; value: string | undefined | null }[]
  >([]);

  const getLocalStorage2 = async (
    key: string
  ): Promise<string | undefined | null> => {
    return await getLocalStorage(key);
  };

  useEffect(() => {
    const fetchLocalStorageValues = async () => {
      if (
        appContextState.historyList &&
        appContextState.historyList.length > 0
      ) {
        const values = await Promise.all(
          appContextState.historyList.map(async (key: string) => {
            const value = await getLocalStorage2(key);
            return { key, value };
          })
        );
        setLocalStorageValues(values);
      }
    };
    fetchLocalStorageValues();
  }, [appContextState.historyList]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {appContextState.historyList &&
        appContextState.historyList.length > 0 ? (
          appContextState.historyList.map((dateKey, index) => (
            <View style={styles.resultItem} key={index}>
              <TouchableOpacity
                onPress={() =>
                  setExpandedItems((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }))
                }
              >
                <Text style={styles.title}>{dateKey}</Text>
              </TouchableOpacity>
              {!expandedItems[index] && (
                <View style={styles.markdownContainer}>
                  <MarkdownAtom>
                    {localStorageValues[index]
                      ? `${localStorageValues[index].value}`
                      : "No data available."}
                  </MarkdownAtom>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.body}>No history available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: "#ffffff",
    padding: 14,
    marginVertical: 6,
    borderRadius: 8,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  body: {
    fontSize: 16,
    marginBottom: 8,
  },
  markdownContainer: {
    marginTop: 0,
  },
});

export default HistoryScreen;
