"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("~/components/Demo"), {
  ssr: false,
});

export default function App(
  //{ title }: { title?: string } = { title: "d33m" }
) {
  //return <Demo title={title} />;
  return <Demo />;
}
