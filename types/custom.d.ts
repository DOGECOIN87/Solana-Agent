/**
 * Simplified type declarations for all missing modules.
 * These are minimal declarations just to make TypeScript happy.
 */

// bs58 module
declare module 'bs58' {
  export function encode(data: any): string;
  export function decode(str: string): any;
}

// chalk module
declare module 'chalk' {
  interface ChalkInstance {
    (text: string): string;
    red: ChalkInstance;
    green: ChalkInstance;
    blue: ChalkInstance;
    yellow: ChalkInstance;
    cyan: ChalkInstance;
    magenta: ChalkInstance;
    white: ChalkInstance;
    gray: ChalkInstance;
    grey: ChalkInstance;
    black: ChalkInstance;
    bold: ChalkInstance;
  }

  const chalk: ChalkInstance;
  export default chalk;
}

// connect module
declare module 'connect' {
  function connectModule(): any;
  export default connectModule;
}

// figlet module
declare module 'figlet' {
  function textSync(text: string, options?: any): string;
  export { textSync };
}

// uuid module
declare module 'uuid' {
  export function v4(): string;
}

// ws module
declare module 'ws' {
  import { EventEmitter } from 'events';
  
  class WebSocketServer extends EventEmitter {
    constructor(options?: any);
    on(event: string, listener: Function): this;
    close(): void;
  }
  
  class WebSocketClient extends EventEmitter {
    constructor(address: string, options?: any);
    on(event: string, listener: Function): this;
    send(data: any, callback?: Function): void;
    close(): void;
  }
  
  export { WebSocketServer as Server };
  export default WebSocketClient;
}

// node module
declare module 'node' {
  // Empty declaration
}
