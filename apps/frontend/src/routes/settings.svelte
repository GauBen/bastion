<script>
  import Header from '$lib/Header.svelte'

  import Nav from '$lib/Nav.svelte'
</script>

<Header>Settings</Header>
<form on:submit|preventDefault>
  <p>
    <label>Display name<br /><input type="text" /></label>
  </p>
  <p>
    <label>Profile picture<br /><input type="file" /></label>
  </p>
  <p class="center">
    <button>Save</button>
  </p>
</form>
<Nav />

<style lang="scss">
  :global(#app) {
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
