"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("~/components/Demo"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: "FC Footy" }
) {
  console.log(title); // TODO remove this shit
  return <Demo />;
}
