import React from 'react';
import html2canvas from 'html2canvas';

interface ScreenshotButtonProps {
  targetElement: HTMLElement | null; // Accept the element to capture
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ targetElement }) => {
  const takeScreenshot = async () => {
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
    } catch (error) {
      console.error("Failed to take screenshot:", error);
      alert("Failed to take screenshot. Please try again.");
    }
  };

  return (
    <div>
      <button
        onClick={takeScreenshot}
        className={`w-full max-w-xs mx-auto block bg-deepPink text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-deepPink hover:bg-fontRed`}
      >
        Cast
      </button>
    </div>
  );
};

export default ScreenshotButton;
