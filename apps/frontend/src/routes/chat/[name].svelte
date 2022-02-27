<script lang="ts" context="module">
  import Header from '$lib/Header.svelte'
  import { io, Socket } from '$lib/io'
  import type { Load } from '@sveltejs/kit'
  import { onMount, tick } from 'svelte'
  import { Gif, MobileKeyboard } from 'svelte-tenor'

  export const load: Load = ({ props }) => ({
    props,
    stuff: {
      title: `Conversation with ${props.contact.displayName}`,
    },
  })
</script>

<script lang="ts">
  export let messages: Array<{
    gif: boolean | undefined
    body: string
    me: boolean
  }>
  export let contact: { id: number; name: string; displayName: string }

  let value: string
  let socket: Socket
  let gifs = false

  onMount(() => {
    socket = io()

    socket.on('message', (message) => {
      if (message.contact.id !== contact.id) return
      messages = [...messages, message]
    })
  })

  let wrapper: HTMLElement
  let firstScroll = true
  $: {
    messages
    tick().then(() => {
      wrapper?.scrollTo({
        top: wrapper.scrollHeight,
        behavior: firstScroll ? 'auto' : 'smooth',
      })
      firstScroll = false
    })
  }
</script>

<main>
  <Header>{contact.displayName}</Header>
  <div class="messages" bind:this={wrapper}>
    {#each messages as { gif, me, body }}
      <div class="message" class:gif class:me>
        {#if gif}
          <Gif gif={JSON.parse(body)} />
        {:else}
          {body}
        {/if}
      </div>
    {/each}
  </div>
  {#if gifs}
    <div class="bottom keyboard">
      <MobileKeyboard
        q={value}
        key={import.meta.env.VITE_TENOR_KEY}
        on:click={({ detail }) => {
          socket.emit('message', {
            toId: contact.id,
            gif: true,
            body: detail.id,
          })
          gifs = false
          value = ''
        }}
        on:close={() => (gifs = false)}
      />
    </div>
  {:else}
    <form
      on:submit|preventDefault={() => {
        socket.emit('message', { toId: contact.id, body: value })
        value = ''
      }}
      class="bottom"
    >
      <button type="button" on:click={() => (gifs = true)}>GIF</button>
      <input type="text" required bind:value />
      <button type="submit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z"
          />
        </svg>
      </button>
    </form>
  {/if}
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $background;
  }

  form {
    display: flex;

    > input {
      height: 2em;
      flex: 1;
      padding: 0.25em;
      background: $light-background;
      border-radius: 0.5em;
    }

    > button {
      height: 2em;
      border: 0;
      background: none;
    }
  }

  .messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0.5em;
    overflow: auto;
  }

  .message {
    background-color: $light-background;
    border-radius: 0.5em;
    padding: 0.5em;
    align-self: start;
    max-width: min(75%, 500px);
    z-index: 1;

    &.gif {
      padding: 0;

      :global(.gif) {
        border-radius: 0.5em;
      }
    }

    &.me {
      align-self: end;
    }
  }

  .message:first-of-type {
    margin-top: auto;
  }

  .bottom {
    padding: 0.5rem;
    border-top: 1px solid $border;
    background-color: $light-background;
    box-shadow: 0 1em 2em $shadow;
  }
</style>
