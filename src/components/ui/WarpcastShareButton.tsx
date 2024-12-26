import React, { useCallback } from 'react';
import html2canvas from 'html2canvas';
import sdk from "@farcaster/frame-sdk";

interface SelectedMatch {
  competitorsLong: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  clock: string;
  homeLogo: string;
  awayLogo: string;
  eventStarted: boolean;
}

interface WarpcastShareButtonProps {
  selectedMatch: SelectedMatch;
  targetElement?: HTMLElement | null;
}

export function WarpcastShareButton({ selectedMatch, targetElement }: WarpcastShareButtonProps) {
   // UseCallback hook for openWarpcastUrl to handle URL opening
   const openWarpcastUrl = useCallback(() => {
    if (selectedMatch) {
      const { competitorsLong, homeTeam, awayTeam, homeScore, awayScore, clock, homeLogo, awayLogo, eventStarted } = selectedMatch;
      const matchSummary = `${competitorsLong}\n${homeTeam} ${eventStarted ? homeScore : ''} - ${eventStarted ? awayScore : ''} ${awayTeam.toUpperCase()}\n${eventStarted ? `${clock}` : `Kickoff: ${clock}`}\n\nUsing the FC Footy mini-app https://d33m-frames-v2.vercel.app cc @kmacb.eth`;
      const encodedSummary = encodeURIComponent(matchSummary);
      const url = `https://warpcast.com/~/compose?text=${encodedSummary}&channelKey=football&embeds[]=${homeLogo}&embeds[]=${awayLogo}`;
      sdk.actions.openUrl(url);  // This is where you replace window.open with sdk.actions.openUrl
    }
  }, [selectedMatch]);

  // Function to capture screenshot
/*   const takeScreenshot = async () => {
    try {
      if (!targetElement) {
        alert("No element found to capture.");
        return;
      }

      // Capture the passed target element
      const canvas = await html2canvas(targetElement);

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve)
      );
      if (!blob) throw new Error("Screenshot failed");

      // Write blob to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      alert("Screenshot copied to clipboard!");

      // Proceed with the cast after screenshot is taken
      openWarpcastUrl();
    } catch (error) {
      console.error("Failed to take screenshot:", error);
      alert("Failed to take screenshot. Please try again.");
    }
  }; */

  return (
    <button
      onClick={openWarpcastUrl} // Call takeScreenshot on click
      className={`w-full max-w-xs mx-auto block bg-deepPink text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-deepPink hover:bg-fontRed`}
    >
      Cast
    </button>
  );
};

export default WarpcastShareButton;
