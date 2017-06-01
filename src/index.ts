import { ConnectableWire } from 'viae';
import { LiteEventEmitter } from 'lite-event-emitter';

export type WebSocketConstructor = {
  new (...args: any[]): WebSocket;
};

export class WebSocketWire extends LiteEventEmitter implements ConnectableWire {
  ws?: WebSocket;
  state: "opening" | "open" | "closing" | "closed";
  [index: string]: any;

  constructor(private WS: WebSocketConstructor = WebSocket) {
    super();

    if (WS === undefined) {
      throw Error("WebSocket class is undefined");
    }
  }

  connect(url: string): void {    
    this.state = "opening";

    this.ws = new this.WS(url);
    this.ws.binaryType = 'arraybuffer';
    this.ws.onopen = () => {
      this.state = "open";
      this.emit("open");
    };

    this.ws.onclose = () => {
      this.state = "closed";
      this.emit("close");
      delete this.ws;
    };

    this.ws.onmessage = (msg) => {
      this.emit("message", msg.data);
    };

    this.ws.onerror = (err) => {
      this.state = "closed";
      this.emit("error", err);
    };
  }

  close(): void {
    if (this.ws === undefined || this.state === "closing")
      return;

    this.state = "closing";
    this.emit("closing");
    this.ws.close();
  }

  send(message: ArrayBuffer) {
    if (this.ws === undefined || this.state !== "open")
      throw Error("Wire is not open");

    this.ws.send(message);
  }
}