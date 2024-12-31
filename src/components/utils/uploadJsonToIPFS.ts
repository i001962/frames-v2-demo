import { FrameContext } from "@farcaster/frame-sdk";
import { PinataSDK } from "pinata-web3";

// Define the correct return type for the response object
interface PinResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
    isDuplicate?: boolean;
  };
  
const uploadJsonToIPFS = async (jsonData: object, context: FrameContext): Promise<PinResponse> => {
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINTATAJWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINTATAGATEWAY,
});
  try {
    const upload = await pinata.upload.json(jsonData).addMetadata({
        name: context.user.username,
        keyValues: {
          gw: 18
        }
      });
    console.log(upload);
    return upload;
  } catch (error) {
    console.log(error);
  }
};

export default uploadJsonToIPFS;
