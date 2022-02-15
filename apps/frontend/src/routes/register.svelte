<main>
  <form on:submit|preventDefault>
    <h1>Register</h1>
    <p>
      <label for="username">Username</label><br />
      <input type="text" id="username" required />
    </p>
    <p>
      <label for="displayname">Dislay name</label><br />
      <input type="text" id="displayname" required />
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
    background-color: #c1ddd7;
  }

  main {
    padding: 1em 2em;
    background-color: #fff;
    border-radius: 1em;
    box-shadow: 0 1em 2em #718a84a2;
    width: 400px;
    max-width: 100%;
    margin: 0.5em;
  }

  input {
    width: 100%;
    border-radius: 0.5em;
  }

  button {
    background-color: #a6dacf;
    border: 0;
    border-radius: 0.5em;
    padding: 0.5em 1em;
  }

  .center {
    text-align: center;
  }
</style>
