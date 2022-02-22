<script lang="ts" context="module">
  import Header from '$lib/Header.svelte'
  import Nav from '$lib/Nav.svelte'
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ session }) =>
    session.user
      ? {
          stuff: {
            title: 'New Conversation',
          },
        }
      : { status: 307, redirect: '/register' }
</script>

<main>
  <Header>New conversation</Header>
  <form action="">
    <p>
      <label>To <input type="text" /></label>
    </p>
    <p class="center">
      <button>Open conversation</button>
    </p>
  </form>
  <Nav />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $background;
  }

  form {
    flex: 1;
    overflow: auto;
    background: $light-background;
    padding: 0 1em;
  }

  input {
    width: 100%;
    border-radius: 0.5em;
    border-color: $border;
  }

  button {
    background-color: $accent;
    border: 0;
    border-radius: 0.5em;
    padding: 0.5em 1em;
  }

  .center {
    text-align: center;
  }
</style>
