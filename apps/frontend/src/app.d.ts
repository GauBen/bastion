/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="@sveltejs/kit" />

import type { User } from '@prisma/client'

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
global {
  declare namespace App {
    interface Locals {
      mobile: boolean
      user: User | null
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Platform {}

    interface Session {
      mobile: boolean
      user: User | null
    }

    interface Stuff {
      title: string
    }
  }
}
