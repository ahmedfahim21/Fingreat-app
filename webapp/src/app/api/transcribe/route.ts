import { NextResponse } from 'next/server';
import { convertSpeechToText } from '@/lib/tts_and_stt_llm_calls';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Use the convertSpeechToText function to transcribe the audio
    const transcribedText = await convertSpeechToText(audioFile);
    
    // Return the transcribed text
    return NextResponse.json({ 
      text: transcribedText,
      success: true 
    });
    
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
