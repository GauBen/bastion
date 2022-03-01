<script lang="ts" context="module">
  import { session } from '$app/stores'
  import Header from '$lib/Header.svelte'
  import Nav from '$lib/Nav.svelte'
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ session }) =>
    session.user
      ? {
          stuff: {
            title: 'Settings',
          },
        }
      : { status: 307, redirect: '/register' }
</script>

<script lang="ts">
  let displayName = $session.user?.displayName ?? ''
  let files: FileList | undefined

  const submit = async () => {
    const body = new FormData()
    if (displayName.length > 0) body.append('displayName', displayName)
    if (files && files.length === 1) body.append('file', files[0])

    await fetch('/api/update-profile', {
      method: 'POST',
      body,
    })
  }
</script>

<main>
  <Header>Settings</Header>
  <form on:submit|preventDefault={submit}>
    <p>
      <label>
        Display name<br />
        <input type="text" bind:value={displayName} />
      </label>
    </p>
    <p>
      <label>
        Profile picture<br />
        <input type="file" bind:files />
      </label>
    </p>
    <p class="center">
      <button>Save</button>
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
