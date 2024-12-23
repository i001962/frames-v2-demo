import html2canvas from 'html2canvas';

const takeScreenshot = async (targetElement: HTMLElement | null): Promise<Blob | null> => {
  try {
    if (!targetElement) {
      alert("No element found to capture.");
      return null;
    }

    // Capture the passed target element
    const canvas = await html2canvas(targetElement);

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve)
    );

    if (!blob) {
      throw new Error("Screenshot failed");
    }

    // Optionally, you can copy the blob to the clipboard or return it
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);

    alert("Screenshot copied to clipboard!");

    return blob; // Return the blob in case you want to do something else with it
  } catch (error) {
    console.error("Failed to take screenshot:", error);
    alert("Failed to take screenshot. Please try again.");
    return null;
  }
};

export default takeScreenshot;
