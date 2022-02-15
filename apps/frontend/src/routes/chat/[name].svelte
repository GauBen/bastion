<script lang="ts">
  import { page } from '$app/stores'

  let messages = [
    { me: true, body: 'Hello' },
    { me: false, body: 'Hi!' },
  ]

  let value = ''
</script>

<h1>
  <a href="../..">
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 .755l-14.374 11.245 14.374 11.219-.619.781-15.381-12 15.391-12 .609.755z"
      />
    </svg>
  </a>
  {$page.params.name}
</h1>
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

<style lang="scss">
  :global(#app) {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: $background;
  }

  h1 {
    margin: 0;
    padding: 1rem;
    background-color: $light-background;
    border-bottom: 1px solid $border;
    box-shadow: 0 -1em 2em $shadow;

    > a {
      margin-right: 1rem;
    }
  }

  form {
    display: flex;
    padding: 0.5rem;
    border-top: 1px solid $border;
    background-color: $light-background;
    box-shadow: 0 1em 2em $shadow;

    > input {
      background: $light-background;
      border-radius: 0.5em;
      flex: 1;
    }

    > button {
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
