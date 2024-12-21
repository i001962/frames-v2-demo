"use client";

import dynamic from "next/dynamic";

const Main = dynamic(() => import("~/components/Main"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: "FC Footy" }
) {
  console.log(title); // TODO remove this shit
  return <Main />;
}
