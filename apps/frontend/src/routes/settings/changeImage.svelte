<script lang="ts" context="module">
  import { session } from '$app/stores'
  import Header from '$lib/Header.svelte'
  import Nav from '$lib/Nav.svelte'
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ session }) =>
    session.user
      ? {
          stuff: {
            title: 'Profile picture',
          },
        }
      : { status: 307, redirect: '/register' }
</script>

<script lang="ts">
  let deleteAvatar: string | undefined
  let files: FileList | undefined
  let errors: { [x: string]: string[] } = {
    deleteAvatar: [],
    file: [],
  }

  const toSentence = (str: string) =>
    (str.at(0) ?? '').toUpperCase() + str.slice(1) + '.'

  const updateAvatar = async () => {
    const body = new FormData()
    if (deleteAvatar === 'delete') body.append('deleteAvatar', deleteAvatar)
    if (files && files.length === 1) body.append('file', files[0])

    const response = await fetch('/api/update-avatar', {
      method: 'POST',
      body,
    })
    const responseBody = await response.json()
    errors = {
      file: [],
      deleteAvatar: [],
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
    if (response.status < 400) {
      // reload page
      location.reload()
    }
  }

  function setDelVal() {
    deleteAvatar = 'delete'
  }
</script>

<main>
  <Header>Profile picture</Header>
  <p class="center">
    <img
      src="/api/image?{new URLSearchParams({
        name: $session.user?.name ?? '',
        accept: 'png,jpg',
      })}"
      alt="{$session.user?.displayName ?? ''} picture"
      width={128}
      height={128}
    />
  </p>
  <form on:submit|preventDefault={updateAvatar}>
    <p class="center">
      <button on:click={setDelVal}>Delete profile picture</button>
    </p>
    {#each errors.deleteAvatar as error}
      <div class="error">{toSentence(error)}</div>
    {/each}
    <p>
      <label>
        Change profile picture<br />
        <input type="file" bind:files />
      </label>
    </p>
    <p class="center">
      <button>Submit changes</button>
    </p>
    {#each errors.file as error}
      <div class="error">{toSentence(error)}</div>
    {/each}
  </form>
  <Nav />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $light-background;
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
