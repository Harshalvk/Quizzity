"use client";
import { useTheme } from "next-themes";
import React from "react";
import D3WordCloud from "react-d3-cloud";

type Props = {};

const data = [
  {
    text: "Algorithm",
    value: 3,
  },
  {
    text: "Database",
    value: 7,
  },
  {
    text: "API",
    value: 1,
  },
  {
    text: "Framework",
    value: 9,
  },
  {
    text: "Frontend",
    value: 5,
  },
  {
    text: "Backend",
    value: 6,
  },
  {
    text: "Server",
    value: 2,
  },
  {
    text: "Deployment",
    value: 8,
  },
  {
    text: "Cloud Computing",
    value: 4,
  },
  {
    text: "Machine Learning",
    value: 10,
  },
];

const fontSizeMapper = (word: { value: number }) => {
  return Math.log2(word.value) * 5 + 16;
};

const CustomWordCloud = (props: Props) => {
  const theme = useTheme();
  return (
    <>
      <D3WordCloud
        height={550}
        data={data}
        font={"Times"}
        fontSize={fontSizeMapper}
        rotate={0}
        padding={10}
        fill={theme.theme == "dark" ? "white" : "black"}
      />
    </>
  );
};

export default CustomWordCloud;
