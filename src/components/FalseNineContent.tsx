import { Button } from '~/components/ui/Button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useReadTFN } from './utils/readTFN'; // Adjust import path if necessary

const FalseNineContent = () => {
  const [falseNineContent, setFalseNineContent] = useState<unknown[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current post index
  const [isReading, setIsReading] = useState(false); // Track if speech is reading
  const [pauseAt, setPauseAt] = useState(0); // Track the position when paused
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);

  // Fetch False Nine content when the component mounts
  useEffect(() => {
    const fetchFalseNineContent = async () => {
      try {
        const response = await axios.get('https://api.paragraph.xyz/blogs/rss/@thefalsenine');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');

        const content = Array.from(items).map(item => ({
          title: item.getElementsByTagName('title')[0]?.textContent || '',
          link: item.getElementsByTagName('link')[0]?.textContent || '',
          pubDate: item.getElementsByTagName('pubDate')[0]?.textContent || '',
          content: item.getElementsByTagName('content:encoded')[0]?.textContent || '',
          author: item.getElementsByTagName('author')[0]?.textContent || '',
          image: item.getElementsByTagName('enclosure')[0]?.getAttribute('url') || ''
        }));
        
        if (content.length === 0 || content.every(c => !c.content.trim())) {
          setErrorTFN("No content available.");
        } else {
          setFalseNineContent(content); // Set the fetched and formatted content
        }
      } catch (err) {
        setErrorTFN("Failed to load content.");
        console.error('Error fetching or parsing RSS:', err);
      } finally {
      }
    };

    fetchFalseNineContent();
  }, []);

  // Read out the article content when clicked
  const { readTFN, stopReading } = useReadTFN(
    falseNineContent,     
    isReading,
    pauseAt,
    setIsReading,
    setPauseAt,
    setSpeechInstance,
    speechInstance
  );

  // Handle subscription click (for now, it's just a placeholder link)
  const handleSubscribeClick = () => { //TODO: Replace with actual subscription link and FC Footy address
    const subscriptionLink = `${falseNineContent[currentIndex]?.link}?referrer=0x8b80755C441d355405CA7571443Bb9247B77Ec16`;
    window.open(subscriptionLink, "_blank", "noopener noreferrer allow-popups");
  };

  return (
    <div>
      {falseNineContent.length > 0 ? (
        <div key={currentIndex} className="mb-4">
          {/* Title, Author, and Date */}
          <h3 className="font-bold text-xl text-notWhite">{falseNineContent[currentIndex].title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(falseNineContent[currentIndex].pubDate).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-500">Author: {falseNineContent[currentIndex].author}</p>

          {/* Read and Stop buttons */}
          <button className="text-gray-500 ml-2" onClick={readTFN}>
            {isReading ? '⏸️ Pause' : '🗣️🎧1.5x'}
          </button>
          {isReading && (
            <button className="text-notWhite ml-2" onClick={stopReading}>
              🛑 Stop
            </button>
          )}

          {/* Image and title */}
          {falseNineContent[currentIndex].image && (
            <button
              onClick={() => {
                setCurrentIndex(currentIndex);
                window.scrollTo(0, 0); // Scroll to the top of the article
              }}
              className="mt-2 w-full"
            >
              <div className="flex flex-col items-center space-y-2">
                <Image
                  src={falseNineContent[currentIndex].image}
                  alt="Post Image"
                  className="rounded-md"
                  layout="responsive"
                  width={500}
                  height={300}
                />
                <h3 className="font-bold text-xl text-notWhite">{falseNineContent[currentIndex].title}</h3>
              </div>
            </button>
          )}

          {/* Subscribe Button */}
          <div className="mt-4">
            <Button onClick={handleSubscribeClick}>Subscribe</Button>
          </div>

          {/* Article Content */}
          <div
            className="text-lightPurple bg-purplePanel mt-2 space-y-2"
            dangerouslySetInnerHTML={{
              __html: falseNineContent[currentIndex].content,
            }}
          />

          {/* Full width preview cards for other articles */}
          <div className="mt-8">
            <h4 className="text-xl font-bold text-notWhite">People also read</h4>
            <div className="mt-4 space-y-6">
              {falseNineContent.slice(1, 5).map((post, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index + 1); // Update the current index when a card is clicked
                    window.scrollTo(0, 0); // Scroll to top
                  }}
                  className="bg-purplePanel p-4 rounded-md text-lightPurple flex items-center w-full"
                >
                  {/* Left side: Title and Date */}
                  <div className="flex-1 pr-4">
                    <div className="flex flex-col">
                      <h5 className="font-bold text-md text-notWhite">{post.title}</h5>
                      <p className="text-sm text-gray-500">
                        {new Date(post.pubDate).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Image */}
                  <div className="w-36 h-24 overflow-hidden rounded-md ml-4">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt="Thumbnail"
                        width={150}
                        height={100}
                        className="w-full h-auto object-cover"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='text-fontRed'>Content not available.</div>
      )}
    </div>
  );
};

export default FalseNineContent;
