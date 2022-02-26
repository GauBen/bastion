global {
  import type { User } from '@prisma/client'
  declare module 'http' {
    interface IncomingMessage {
      cookies: Record<string, string>
    }
  }

  declare module 'socket.io' {
    export class Socket {
      user: User
    }
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    VITE_API_PORT: string
    VITE_TENOR_KEY: string
  }
}
