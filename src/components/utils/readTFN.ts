/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// utils/readTFN.ts

import { useCallback } from 'react';

export const useReadTFN = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  falseNineContent: any[], 
  isReading: boolean, 
  pauseAt: number, 
  setIsReading: Function, 
  setPauseAt: Function, 
  setSpeechInstance: Function, 
  speechInstance: SpeechSynthesisUtterance | null
) => {
  
  const readTFN = useCallback(() => {
    // Check if speech is already in progress, if so, pause it
    if (isReading) {
      window.speechSynthesis.pause(); // Pause the speech if it's already playing
      setIsReading(false); // Mark as paused
      return;
    }

    // Create a temporary DOM element to parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(falseNineContent[0].content, 'text/html');
    
    // Extract the plain text content without HTML tags
    const plainText = doc.body.textContent || "";

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.5;

    // If it's a resume after a pause, resume from where it left off
    if (pauseAt > 0) {
      const resumedText = plainText.slice(pauseAt); // Slice the string to start from the last paused position
      utterance.text = resumedText;
      setPauseAt(0); // Reset pause position
    }

    // Store the speech instance in state
    setSpeechInstance(utterance);

    // Set the speech to start
    window.speechSynthesis.speak(utterance);
    setIsReading(true); // Mark as reading

    // Handle when speech is completed
    utterance.onend = () => {
      setIsReading(false); // Reset reading state when the speech is finished
    };

    // Track where speech is paused
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setPauseAt(event.charIndex); // Track the position of the speech
      }
    };

  }, [falseNineContent, isReading, pauseAt, setIsReading, setPauseAt, setSpeechInstance]); // Re-run when `falseNineContent`, `isReading`, or `pauseAt` changes

  // Stop function to stop the speech entirely
  const stopReading = useCallback(() => {
    if (speechInstance) {
      window.speechSynthesis.cancel(); // Stops the speech
      setIsReading(false); // Mark that it's not being read anymore
    }
  }, [speechInstance, setIsReading]);

  return { readTFN, stopReading };
};
