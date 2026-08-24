---
name: gemini-live-api
description: Integration guide and reference implementation for Google Gemini Live API using WebSockets for real-time bidirectional text, audio, and coding agent interactions.
---

# Gemini Live API & WebSockets Skill

This skill documents how to integrate and use the **Google Gemini Live API** over WebSockets for real-time bidirectional text and multimodal interactions.

## 1. Connection Endpoint

The Gemini Live API WebSocket endpoint connects via WSS with the API key as a query parameter:

```text
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
```

## 2. Session Setup (First Message)

Immediately after opening the WebSocket connection, send an initial configuration JSON object:

```json
{
  "setup": {
    "model": "models/gemini-3.1-flash-live-preview",
    "responseModalities": ["TEXT"],
    "systemInstruction": {
      "parts": [
        { "text": "You are SATI Copilot AI for Dubai school compliance." }
      ]
    }
  }
}
```

## 3. Sending Realtime Text Inputs

To send text messages to the live session:

```json
{
  "realtimeInput": {
    "text": "Hello, explain KHDA teacher permit requirements."
  }
}
```

Or structured client content turns:

```json
{
  "clientContent": {
    "turns": [
      {
        "role": "user",
        "parts": [{ "text": "What document expirations are pending?" }]
      }
    ],
    "turnComplete": true
  }
}
```

## 4. Handling Server Responses

The WebSocket receives `BidiGenerateContentServerMessage` JSON objects containing:
- `serverContent.modelTurn.parts[].text`: The text response from Gemini Live.
- `serverContent.outputTranscription.text`: Real-time text transcription.
- `serverContent.turnComplete`: Indicates completion of the current model turn.
- `toolCall`: Function execution requests from the model.

## 5. Client WebSocket Implementation Example (TypeScript / JS)

```typescript
export class GeminiLiveWebSocketClient {
  private ws: WebSocket | null = null;

  connect(apiKey: string, systemInstructionText: string) {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      // Send setup frame
      this.ws?.send(JSON.stringify({
        setup: {
          model: "models/gemini-3.1-flash-live-preview",
          responseModalities: ["TEXT"],
          systemInstruction: {
            parts: [{ text: systemInstructionText }]
          }
        }
      }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.serverContent?.modelTurn?.parts) {
        for (const part of data.serverContent.modelTurn.parts) {
          if (part.text) {
            console.log("Live AI Response:", part.text);
          }
        }
      }
    };
  }

  sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        realtimeInput: { text }
      }));
    }
  }
}
```
