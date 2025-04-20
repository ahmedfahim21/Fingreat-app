export interface SpeechGenerationResult {
  audio: HTMLAudioElement;
  audioUrl: string;
  play: () => Promise<void>;
  stop: () => void;
  cleanup: () => void;
}

/**
 * Converts speech audio to text using the Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcribed text
 */
export async function convertSpeechToText(audioBlob: Blob): Promise<string> {
  try {
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'en');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY_1 || ''}`,
      },
      body: formData
    });

    console.log('Response:', response);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return 'Transcription failed. Please try again.';
  }
}

/**
 * Generates speech from text using OpenAI's TTS API
 * @param input - The text to convert to speech
 * @param voiceType - The voice type to use (default: 'ballad')
 * @param instructions - Optional custom instructions for the voice
 * @returns An object with the audio element and control functions
 */
export async function generateSpeech(
  input: string, 
  voiceType: string = 'ballad', 
  instructions: string = ''
): Promise<SpeechGenerationResult> {
  try {
    const defaultInstructions = "Voice: Warm, upbeat, and reassuring, with a steady and confident cadence that keeps the conversation calm and productive.\n\nTone: Positive and solution-oriented, always focusing on the next steps rather than dwelling on the problem.\n\nPronunciation: Clear and precise, with a natural rhythm that emphasizes key words to instill confidence and keep the customer engaged.\n\nFeatures: Uses empathetic phrasing, gentle reassurance, and proactive language to shift the focus from frustration to resolution.";
    
    const speechInstructions = instructions || defaultInstructions;
    
    // Make the API request to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voiceType,
        input: input,
        instructions: speechInstructions
      })
    });

    console.log('Response:', response);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error (${response.status}): ${errorData}`);
    }

    // Get the audio blob from the response
    const audioBlob = await response.blob();
    
    // Create an audio element and play the speech
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Return both the audio element (for control) and the blob URL (for cleanup)
    return {
      audio,
      audioUrl,
      play: () => audio.play(),
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
      },
      cleanup: () => URL.revokeObjectURL(audioUrl)
    };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}
