import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/Button";
import { fetchPlayerElements } from "./utils/fetchPlayerElements";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi"; // Move this import into the component
import sdk, {
  type FrameContext,
} from "@farcaster/frame-sdk";
import uploadJsonToIPFS from "./utils/uploadJsonToIPFS";
import { ethers } from 'ethers';
import { useAccount } from "wagmi";
import { BaseError, UserRejectedRequestError } from "viem";
import { truncateAddress } from "../components/utils/truncateAdress";

/* interface PinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
} */

const abiCoder = new ethers.AbiCoder();

const PlayerCardScroll = () => {
  // State to keep track of cart items with quantities
  const [cartItems, setCartItems] = useState<Map<number, number>>(new Map());
  // Timer state
  const [timer, setTimer] = useState<number>(5);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false); // Track checkout status
  const [players, setPlayers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);    
  const [context, setContext] = useState<FrameContext>();
  const [txHash, setTxHash] = useState<string | null>(null);

  const [isMinting, setIsMinting] = useState(false);  // Minting in progress state
  const [mintingError, setMintingError] = useState<string | null>(null);  // Error state for minting
  const [mintingSuccess, setMintingSuccess] = useState<string | null>(null);  // Success message

  // TODO - CREATE or get this ABI this one is not correct

  const { address, isConnected } = useAccount();

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

  // Fetch player data from the API
  useEffect(() => {
    const getPlayerData = async () => {
      try {
        const data = await fetchPlayerElements();
        console.log('in Kmac Attackers score', data);
        const filteredPlayers = data.filter(data => data.minutes > 1000);

        // Sort the players based on expected goals per 90 minutes
        const sortedPlayers = filteredPlayers.sort((a, b) => {
          const xgiPer90A = (a.expected_assists_per_90 * 3)+(a.expected_goals_per_90 * 5);
          const xgiPer90B = (b.expected_assists_per_90 * 3)+(b.expected_goals_per_90 * 5);
          return xgiPer90B - xgiPer90A; // Sort in descending order
        });

        // Only take the top 20 players
        const topPlayers = sortedPlayers.slice(0, 20);
        console.log('topPlayers', topPlayers);
        setPlayers(topPlayers);
        console.log('data', topPlayers);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    getPlayerData();
  }, []); // Ensure this useEffect runs only once on mount

  // Start the timer when the first card is added to the cart
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer <= 0) {
      setTimerRunning(false); // Stop the timer when it reaches 0
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerRunning, timer]); // This effect is purely related to timer

  // Handle adding/removing cards from the cart
  const handleCardClick = (card: typeof players[0]) => {
    if (timer <= 0) {
      return; // Prevent adding cards when the timer ends
    }

    setCartItems((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQuantity = newCart.get(card.id) || 0;
      if (currentQuantity > 0) {
        // If the card is already in the cart, increment its quantity
        newCart.set(card.id, currentQuantity + 1);
      } else {
        // If the card is not in the cart, add it with quantity 1
        newCart.set(card.id, 1);
      }
      return newCart;
    });

    if (!timerRunning) {
      // Start the timer when the first card is added
      setTimerRunning(true);
    }
  };

  // Handle removing a card from the cart
  const handleRemoveCard = (card: typeof players[0]) => {
    setCartItems((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQuantity = newCart.get(card.id) || 0;
      if (currentQuantity > 1) {
        // If the card is in the cart with quantity > 1, decrement its quantity
        newCart.set(card.id, currentQuantity - 1);
      } else {
        // If quantity is 1, remove the card completely
        newCart.delete(card.id);
      }
      return newCart;
    });
  };

  // useSendTransaction hook to send the transaction
  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  // Updated handleCheckout to include sendTx inside useCallback
  const sendTx = useCallback(async (recipient: string, ipfsHash: string) => {
    const functionSignature = "0x3db13784"; // TODO ABI THIS but likely to change with new contract
    const encodedData = abiCoder.encode(
      ['address', 'string'],
      [recipient, ipfsHash]
    );
    // Combine the function selector and the encoded data
    const formattedData = functionSignature + encodedData.slice(2); // Remove "0x" from the encoded data

    try {
      await sendTransaction({
        to: "0xAC4506a1F2A90DdB477D24716D96b6E49591B4b0", // Contract address
        data: formattedData, // ABI-encoded data
        //gasLimit: 1000000,  // Example gas limit
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
        },
      });
      console.log("Transaction sent successfully.");
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  }, [sendTransaction]);

  const handleCheckout = async () => {
    if (!context) {
      setError("Context is not available");
      return;
    }

    try {
      setIsMinting(true); // Set minting state to true to show loading message

      const cid = await uploadJsonToIPFS(Array.from(cartItems.entries()), context);
      if (!cid) {
        throw new Error("Failed to upload to IPFS");
      }

      const defifalogo = 'bafybeihxxnb7xt5vglgvgnxbhiqnjvqkaqtxuitluzdkp6sn54x2mdwcae';

      const metadata = {
        name: "FC Footy Test NFT",
        description: "This work is dedicated to the public domain via CC0...",
        image: `ipfs://${defifalogo}`,
        content: { mime: "image/png", uri: `ipfs://${defifalogo}` },
        attributes: [
          { trait_type: "License", value: "CC0" },
          { trait_type: "Theme", value: "FC Footy test" },
          { trait_type: "FID", value: context.user.fid },
          { trait_type: "UserName", value: context.user.username },
          { trait_type: "GameWeek", value: "GW18" }
        ]
      };

      const additionalTraits = Array.from(cartItems.entries()).map(([id, quantity]) => ({
        trait_type: `Player ${id}`,
        value: `Quantity: ${quantity}`,
      }));

      metadata.attributes = [...metadata.attributes, ...additionalTraits];

      const metadataCid = await uploadJsonToIPFS(metadata, context);
      if (!metadataCid) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      if (address) {
        const recipient = address;
        const ipfsHash = `ipfs://${metadataCid.IpfsHash}`;
        await sendTx(recipient, ipfsHash);
      } else {
        throw new Error("No address found");
      }

      //setMintingSuccess("Transaction sent to your wallet for approval.");
      setIsCheckedOut(true);
      setCartItems(new Map()); // Reset cart after checkout
    } catch (error) {
      setMintingError("Error during checkout: " + error.message);
    } finally {
      setIsMinting(false); // End minting process (loading state)
    }
  };

  const renderError = (error: Error | null) => {
    if (!error) return null;
    if (error instanceof BaseError) {
      const isUserRejection = error.walk(
        (e) => e instanceof UserRejectedRequestError
      );
  
      if (isUserRejection) {
        return <div className="text-red-500 text-xs mt-1">Transaction rejected. Try again.</div>;
      }
    }
    console.error(error);
    return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
  };

    const handleBasescanClick = () => {
      sdk.actions.openUrl(txHash?`https://basescan.org/address/${txHash}`:'https://basescan.org/');  
      
    };

  return (
    <div className="mb-4">
      <h2 className="font-2xl text-notWhite font-bold mb-4">Guess Top Scorers</h2>

      {/* Display loading message */}

      {/* Display error message */}
      {mintingError && <p className="error">{mintingError}</p>}

      {/* Display success message */}
      {mintingSuccess && <p className="success">{mintingSuccess}</p>}

      {/* Player Cards Scroll */}
      <div className="flex overflow-x-auto space-x-4 mb-4 sticky top-0 z-10 bg-darkPurple p-4">
        {players.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`flex-shrink-0 py-2 px-6 text-sm font-semibold cursor-pointer rounded-lg border-2 ${
              cartItems.get(card.id) > 0
                ? "border-limeGreenOpacity text-lightPurple"
                : "border-gray-500 text-notWhite"
            }`}
          >
            <img
              src={card.code}
              alt={card.webName}
              className="w-32 h-32 object-cover rounded-lg mb-2"
            />
            <div className="text-center">{card.webName}</div>
            <div className="text-xs text-center text-lightPurple">{card.position}</div>
            <div className="text-xs text-center text-gray-400">
              xGoal Involvement 90m: {card.xgi90.toFixed(2)}
            </div>
            <div className="text-xs text-center text-gray-400">
              xConceded 90m: {card.xgc90.toFixed(2)}
            </div>
            {cartItems.get(card.id) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-lightPurple ml-2">
                  Quantity: {cartItems.get(card.id)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the onClick of the parent
                    handleRemoveCard(card);
                  }}
                  className="mt-2 text-xs bg-deepPink text-white py-1 px-3 rounded"
                >
                  -
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-6 p-4 bg-gray-800 text-lightPurple rounded-lg">
        <h3 className="font-semibold text-notWhite text-lg">Selected</h3>
        {isMinting && <p>Minting in progress, please wait...</p>}
        <div>
          {cartItems.size === 0 && !isCheckedOut ? (
            <p>No players selected</p>
          ) : (
            <ul className="grid grid-cols-2 gap-1">
              {Array.from(cartItems.entries()).map(([id, quantity]) => {
                const card = players.find((card) => card.id === id);
                return (
                  <li key={id} className="mb-1">
                    <div className="flex justify-leftitems-center">
                      <span className="mr-1">({quantity})</span>
                      <span> {card?.webName}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Timer Display */}
      <div className="mt-6 p-4 text-white">
        {timer > 0 ? (
          <p>Time remaining: {timer}s</p>
        ) : (
          <>
            {timer <= 0 && !isCheckedOut && (
              <Button onClick={handleCheckout} 
              disabled={!isConnected || isSendTxPending}
              isLoading={isSendTxPending}
              className="mt-4 text-white py-2 px-4 rounded">
                Save / Mint
              </Button>)}
            {isSendTxError && renderError(sendTxError)}
            {txHash && (
              <div className="mt-2 text-xs">
                <Button onClick={handleBasescanClick} className="text-white py-2 px-4 rounded">
                    Picks saved - View on Basescan
                  </Button>
                <div>
                  Status:{" "}
                  {isConfirming
                    ? "Confirming..."
                    : isConfirmed
                    ? "Confirmed!"
                    : "Pending"}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerCardScroll;