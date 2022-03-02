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
  let errors: { [x: string]: string[] } = {
    displayName: [],
    file: [],
  }

  const toSentence = (str: string) =>
    (str.at(0) ?? '').toUpperCase() + str.slice(1) + '.'

  const submit = async () => {
    const body = new FormData()
    if (displayName.length > 0) body.append('displayName', displayName)
    if (files && files.length === 1) body.append('file', files[0])

    const response = await fetch('/api/update-profile', {
      method: 'POST',
      body,
    })
    const responseBody = await response.json()
    errors = {
      displayName: [],
      file: [],
    }

    if (response.status >= 400) {
      const messages: string[] = responseBody?.message ?? []
      for (const message of messages) {
        const index = message.indexOf(' ')
        var [scope, details] = [
          message.slice(0, index),
          message.slice(index + 1),
        ]
        errors[scope].push(message)
      }
      // Trigger Svelte refresh
      errors = errors
      return
    }
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
      {#each errors.displayName as error}
        <div class="error">{toSentence(error)}</div>
      {/each}
    </p>
    <p>
      <label>
        Profile picture<br />
        <input type="file" bind:files />
      </label>
      {#each errors.file as error}
        <div class="error">{toSentence(error)}</div>
      {/each}
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

  .error {
    font-weight: bold;
    color: $error;
  }
</style>
