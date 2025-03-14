import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import DropDownPicker, {
  DropDownPickerProps,
} from "react-native-dropdown-picker";
import { i18n } from "./locales/i18n";

export type DropdownType = { label: string; value: number; kind?: number };

type DropDownPickerAtomProps = Omit<
  DropDownPickerProps<any>,
  "open" | "setOpen"
> & {
  width?: number;
  open: boolean;
  setOpen: (open: any) => void;
};
export default function DropDownPickerAtom(props: DropDownPickerAtomProps) {
  return (
    <DropDownPicker
      style={
        props.width !== undefined
          ? [styles.picker, { maxWidth: props.width }]
          : styles.picker
      }
      searchPlaceholder={i18n.t("search.filter")}
      placeholder={i18n.t("search.select_item")}
      // placeholderStyle={styles.picker}
      // dropDownContainerStyle={styles.picker}
      // tickIconStyle={styles.picker}
      // closeIconStyle={styles.picker}
      // modalContentContainerStyle={styles.picker}
      // listItemContainerStyle={styles.picker}
      // listItemLabelStyle={styles.picker}
      // listChildContainerStyle={styles.picker}
      // listChildLabelStyle={styles.picker}
      // listParentContainerStyle={styles.picker}
      // listParentLabelStyle={styles.picker}
      // selectedItemContainerStyle={styles.picker}
      // selectedItemLabelStyle={styles.picker}
      // customItemContainerStyle={styles.picker}
      // customItemLabelStyle={styles.picker}
      // listMessageContainerStyle={styles.picker}
      // listMessageTextStyle={styles.picker}
      // itemSeparatorStyle={styles.picker}
      // badgeSeparatorStyle={styles.picker}
      listMode="SCROLLVIEW"
      searchable={false}
      {...props}
    />
  );
}
const styles = StyleSheet.create({
  picker: {
    fontSize: 14,
    display: "flex",
    borderWidth: 0,
    borderRadius: 10,
    // backgroundColor: "whitesmoke",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    minHeight: 36,
  },
  dropDown: {
    fontSize: 14,
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});
