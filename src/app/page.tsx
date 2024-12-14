import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Farcaster Footy App",
    action: {
      type: "launch_frame",
      name: "Farcaster Footy App",
      url: appUrl,
      splashImageUrl: `${appUrl}/defifa_spinner.gif`,
      splashBackgroundColor: "#BD195D",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcaster Footy App",
    openGraph: {
      title: "Farcaster Footy App",
      description: "Farcaster Footy App: Live Match Summaries, Fantasy League, Banter bot, Collectables & Contests",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}
