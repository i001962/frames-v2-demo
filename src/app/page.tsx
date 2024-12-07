import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "See match summaries",
    action: {
      type: "launch_frame",
      name: "d33m EPL",
      url: appUrl,
      splashImageUrl: `${appUrl}/defifa_spinner.gif`,
      splashBackgroundColor: "#BD195D",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "d33m EPL",
    openGraph: {
      title: "d33m EPL",
      description: "d33m EPL",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}
