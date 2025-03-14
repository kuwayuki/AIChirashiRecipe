import { StyleSheet } from "react-native";
import { Icon, IconProps } from "react-native-elements";

export default function IconAtom(props: IconProps) {
  return (
    <Icon
      raised
      // color="#999999"
      size={18}
      {...props}
      iconStyle={props.style ?? styles.base}
    />
  );
}
const styles = StyleSheet.create({
  base: {
    // transform: [{ rotate: "60deg" }],
  },
});
