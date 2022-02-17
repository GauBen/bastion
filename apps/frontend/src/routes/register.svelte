<main>
  <form on:submit|preventDefault>
    <h1>Register</h1>
    <p>
      <label>
        Username<br />
        <input type="text" required />
      </label>
    </p>
    <p>
      <label>
        Dislay name<br />
        <input type="text" required />
      </label>
    </p>
    <p class="center"><button>Register</button></p>
  </form>
</main>

<style lang="scss">
  :global(#app) {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: $background;
  }

  main {
    padding: 1em 2em;
    background-color: $light-background;
    border-radius: 1em;
    box-shadow: 0 1em 2em $shadow;
    width: 400px;
    max-width: 100%;
    margin: 0.5em;
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
