export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LiveWebSocketCallbacks {
  onStatusChange?: (status: ConnectionStatus) => void;
  onTextReceived?: (text: string, isFinished: boolean) => void;
  onError?: (error: string) => void;
}

export class GeminiLiveWebSocket {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private callbacks: LiveWebSocketCallbacks = {};
  private currentResponse: string = '';

  constructor(callbacks: LiveWebSocketCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: LiveWebSocketCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
  }

  private activeSystemInstruction: string = '';

  public connect(apiKey: string, systemInstruction: string = 'You are SATI AI Copilot for Dubai school compliance.', forceReconnect: boolean = false): Promise<boolean> {
    return new Promise((resolve) => {
      if (!apiKey) {
        this.setStatus('error');
        if (this.callbacks.onError) this.callbacks.onError('API Key missing');
        return resolve(false);
      }

      const instructionChanged = this.activeSystemInstruction !== systemInstruction;
      if (forceReconnect || (instructionChanged && this.ws)) {
        this.disconnect();
      }

      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        if (this.ws.readyState === WebSocket.OPEN) this.setStatus('connected');
        return resolve(true);
      }

      this.activeSystemInstruction = systemInstruction;
      this.setStatus('connecting');
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      try {
        this.ws = new WebSocket(wsUrl);
        // Ensure browser WebSocket receives binary/ArrayBuffer safely
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[Gemini Live WS] Connected to endpoint, sending setup frame...');
          const setupMsg = {
            setup: {
              model: 'models/gemini-2.5-flash-native-audio-latest',
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              }
            }
          };
          this.ws?.send(JSON.stringify(setupMsg));
          this.setStatus('connected');
          resolve(true);
        };

        this.ws.onmessage = async (event) => {
          try {
            let rawText = '';
            if (typeof event.data === 'string') {
              rawText = event.data;
            } else if (event.data instanceof Blob) {
              rawText = await event.data.text();
            } else if (event.data instanceof ArrayBuffer) {
              rawText = new TextDecoder().decode(event.data);
            } else {
              return;
            }

            if (!rawText || !rawText.trim().startsWith('{')) return;

            const data = JSON.parse(rawText);
            if (data.setupComplete) {
              console.log('[Gemini Live WS] Setup complete acknowledged by server.');
              return;
            }

            if (data.serverContent) {
              const serverContent = data.serverContent;

              if (serverContent.outputTranscription?.text) {
                const textChunk = serverContent.outputTranscription.text;
                this.currentResponse += textChunk;
                if (this.callbacks.onTextReceived) {
                  this.callbacks.onTextReceived(this.currentResponse, !!serverContent.turnComplete);
                }
              } else if (serverContent.modelTurn?.parts) {
                for (const part of serverContent.modelTurn.parts) {
                  if (part.text) {
                    this.currentResponse += part.text;
                    if (this.callbacks.onTextReceived) {
                      this.callbacks.onTextReceived(this.currentResponse, !!serverContent.turnComplete);
                    }
                  }
                }
              }

              if (serverContent.turnComplete) {
                this.currentResponse = '';
              }
            }
          } catch (e) {
            // Ignore non-JSON binary frames or silent log
            console.debug('[Gemini Live WS] Non-JSON message received');
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[Gemini Live WS] Connection notice:', err);
          this.setStatus('error');
          if (this.callbacks.onError) this.callbacks.onError('WebSocket Connection Notice');
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[Gemini Live WS] Disconnected');
          this.setStatus('disconnected');
        };
      } catch (err) {
        console.error('[Gemini Live WS] Failed to initialize WebSocket:', err);
        this.setStatus('error');
        resolve(false);
      }
    });
  }

  public sendTextMessage(text: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Gemini Live WS] Cannot send, WebSocket not connected.');
      return false;
    }

    this.currentResponse = '';
    const msg = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }]
          }
        ],
        turnComplete: true
      }
    };
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }
}
