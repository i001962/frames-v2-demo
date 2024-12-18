import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "FC Footy App",
    action: {
      type: "launch_frame",
      name: "FC Footy App",
      url: appUrl,
      splashImageUrl: `${appUrl}/defifa_spinner.gif`,
      splashBackgroundColor: "#010513",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FC Footy App",
    openGraph: {
      title: "FC Footy App",
      description: "FC Footy App: Live Match Summaries, Fantasy League, Banter bot, Collectables & Contests",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}
