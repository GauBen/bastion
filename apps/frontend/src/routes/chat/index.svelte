<script>
  import Nav from '$lib/Nav.svelte'
</script>

<h1>
  <a href=".">
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 .755l-14.374 11.245 14.374 11.219-.619.781-15.381-12 15.391-12 .609.755z"
      />
    </svg>
  </a>
  New conversation
</h1>
<form action="">
  <p>
    <label>To <input type="text" /></label>
  </p>
  <p class="center">
    <button>Open conversation</button>
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

  h1 {
    margin: 0;
    padding: 1rem;
    background: $light-background;
    border-bottom: 1px solid $border;

    > a {
      margin-right: 0.5rem;
    }
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
