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
