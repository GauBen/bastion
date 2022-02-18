/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="@sveltejs/kit" />

import type { User } from '@prisma/client'

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
global {
  declare namespace App {
    interface Locals {
      user: User | null
    }

    interface Platform {}

    interface Session {
      user: User | null
    }

    interface Stuff {
      title: string
    }
  }
}
