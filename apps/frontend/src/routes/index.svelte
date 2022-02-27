<script lang="ts" context="module">
  import { io } from '$lib/io'
  import Nav from '$lib/Nav.svelte'
  import type { User } from '@prisma/client'
  import type { Load } from '@sveltejs/kit'
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'

  export const load: Load = ({ props }) => ({
    props,
    stuff: { title: 'Conversations' },
  })
</script>

<script lang="ts">
  export let contacts: {
    id: number
    name: string
    displayName: string
  }[] = []

  onMount(() => {
    const socket = io()
    socket.on('message', ({ contact }: { contact: User }) => {
      contacts = [contact, ...contacts.filter((c) => c.id !== contact.id)]
    })
  })
</script>

<main>
  <div class="people">
    <div class="shadow">
      {#each contacts as contact (contact.id)}
        <div
          class="person"
          animate:flip={{ duration: 200 }}
          transition:slide|local={{ duration: 200 }}
        >
          <img
            src="/api/image?{new URLSearchParams({
              name: contact.name,
              accept: 'png,jpg',
            })}"
            alt="{contact.displayName} picture"
            width={64}
            height={64}
          />
          <a
            class="display-name"
            href="/chat/{contact.name}"
            sveltekit:prefetch
          >
            {contact.displayName}
          </a>
          <span class="user-name">{contact.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <Nav />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $background;
  }

  .people {
    flex: 1;
    overflow: auto;
  }

  .shadow {
    background-color: $shadow;
    box-shadow: 0 0 2em 1em $shadow;
  }

  .person {
    position: relative;
    padding: 1em;
    background-color: $light-background;
    display: grid;
    grid-template-columns: 4em 1fr;
    column-gap: 0.5em;

    > img {
      grid-row: 1 / 3;
      border-radius: 50%;
    }
  }

  .person + .person {
    background-color: $light-background;
    border-top: 1px solid $border;
  }

  .display-name {
    align-self: end;
    color: inherit;
    font-weight: bold;
    text-decoration: inherit;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
    }
  }

  .user-name {
    opacity: 0.75;
  }
</style>
