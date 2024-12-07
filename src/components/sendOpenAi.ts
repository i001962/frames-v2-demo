import axios, { AxiosError } from 'axios';
import { ToastContainer, ToastContentProps, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let conversationHistory: { role: string; content: any; }[] = [];
const MAX_TOKENS = 4096; // Adjust this according to the model's limits (for gpt-3.5-turbo, total tokens include input and output)

const estimateTokens = (messages: { role: string; content: string; }[]): number => {
    return messages.reduce((total, message) => total + (message.content.length / 4), 0); // Rough estimate
};

const trimConversationHistory = () => {
    while (estimateTokens(conversationHistory) > (MAX_TOKENS - 500)) { // Leave room for response
        conversationHistory.shift(); // Remove the oldest message
    }
};

const sendOpenAi = async (aiPrompt: string, openAiApiKey: string): Promise<string> => {
    const notify = (message: string | number | boolean | null | undefined) => toast(message);

    if (!openAiApiKey) {
        const errorMessage = 'OpenAI API Key is missing. Please add it in the Account settings.';
        notify(errorMessage);
        throw new Error(errorMessage);  // Throw an error when API key is missing
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    trimConversationHistory();
    conversationHistory.push({ role: 'user', content: aiPrompt });

    const requestData = {
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
    };

    try {
        const aiResponse = await axios.post(apiUrl, requestData, { headers });
        if (aiResponse.status === 200) {
            const aiResponseContent = aiResponse.data.choices[0].message.content;
            conversationHistory.push({ role: 'system', content: aiResponseContent });
            console.log('aiResponseContent', aiResponseContent);
            return aiResponseContent;  // Return valid AI response content
        } else {
            const errorMessage = `Failed to fetch AI. Status code: ${aiResponse.status}`;
            notify(errorMessage);
            throw new Error(errorMessage);  // Throw error on failed response
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data?.error?.message || 'An unknown error occurred while fetching AI.';
            notify(errorMessage);
            throw new Error(errorMessage);  // Throw the error message
        } else {
            const errorMessage = 'An unexpected error occurred.';
            notify(errorMessage);
            throw new Error(errorMessage);  // Handle unexpected errors
        }
    }
};

export default sendOpenAi;
