<script lang="ts" context="module">
  import Header from '$lib/Header.svelte'
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ props }) => ({
    props,
    stuff: {
      title: `Conversation with ${props.contact.displayName}`,
    },
  })
</script>

<script lang="ts">
  export let messages: Array<{ body: string; me: boolean }>
  export let contact: { id: number; name: string; displayName: string }

  let value: string
</script>

<main>
  <Header>{contact.displayName}</Header>
  <div class="messages">
    {#each messages as { me, body }}
      <div class="message" class:me>
        {body}
      </div>
    {/each}
  </div>
  <form
    on:submit|preventDefault={() => {
      messages = [...messages, { me: true, body: value }]
      value = ''
    }}
  >
    <input type="text" required bind:value />
    <button>
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
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: $background;
  }

  form {
    display: flex;
    padding: 0.5rem;
    border-top: 1px solid $border;
    background-color: $light-background;
    box-shadow: 0 1em 2em $shadow;

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
  }

  .message {
    background-color: $light-background;
    border-radius: 0.5em;
    padding: 0.5em;
    align-self: start;
    max-width: min(75%, 500px);
    z-index: 1;

    &.me {
      align-self: end;
    }
  }

  .message:first-of-type {
    margin-top: auto;
  }
</style>
