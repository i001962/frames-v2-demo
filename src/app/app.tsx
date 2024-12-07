"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("~/components/Demo"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: "EPL Match Summaries" }
) {
  const backgroundImageUrl = "defifa_spinner.gif"; // Replace with your image URL
  
  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover", // Makes the image cover the whole area
        backgroundPosition: "center", // Centers the image
        minHeight: "100vh", // Makes sure the background image covers the full viewport height
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // Centers the content in the middle
        padding: "20px", // Add padding to the content if needed
      }}
    >
      <Demo title={title} />
    </div>
  );
}
