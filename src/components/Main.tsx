/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import TabNavigation from './TabNavigation';
import MatchesTab from './MatchesTab';
import FantasyTab from './FantasyTab';
import FalseNineContent from './FalseNineContent';

export default function Main() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState("matches"); 

  useEffect(() => {
    const load = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) return <div>Waiting for VAR...</div>;

  if (!context) {
    return (
      <div className="w-[375px] mx-auto py-4 px-2">
        <h2 className="text-2xl font-bold text-center text-notWhite">FC Footy mini-app. Live match summaries, fantasy league, analysis and more.</h2>
        <p className="text-center mt-4 text-fontRed">Open in a Farcaster app</p>
        <a href="https://warpcast.com/kmacb.eth/0xac8d7401" target="_blank" rel="noreferrer" className="block text-center mt-4 text-lightPurple underline">Go to Warpcast</a>
      </div>
    );
  }

  return (
    <div className="w-[400px] mx-auto py-4 px-2">
      <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div className="bg-darkPurple p-4 rounded-md text-white">
        {selectedTab === 'matches' && 
        <MatchesTab />}
        {selectedTab === 'fantasy' && 
        <FantasyTab />}
         {selectedTab === 'falseNine' && <FalseNineContent />}
      </div>
    </div>
  );
};
