import React from "react";
import Markdown from "react-native-markdown-display";

type MarkdownAtomProps = {
  children: React.ReactNode;
  style?: any;
};

const MarkdownAtom: React.FC<MarkdownAtomProps> = ({ children, style }) => {
  return (
    <Markdown
      style={{
        heading3: {
          color: "#007AFF",
          fontSize: 20,
          fontWeight: "bold",
          paddingVertical: 6,
          borderTopWidth: 2,
          marginTop: 16,
          fontFamily: "System",
        },
        ordered_list: {
          fontSize: 18,
          paddingTop: 8,
          marginTop: 8,
          marginBottom: 8,
          borderTopWidth: 1,
          fontFamily: "System",
        },
        list_item: {
          color: "black",
          fontSize: 18,
          marginBottom: 6,
          fontFamily: "System",
        },
        strong: { color: "#D32F2F" },
      }}
    >
      {children}
    </Markdown>
  );
};

export default MarkdownAtom;
