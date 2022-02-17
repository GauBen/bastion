<script>
  import Nav from '$lib/Nav.svelte'

  let people = [
    { display: 'Alice', user: 'alice' },
    { display: 'Bob', user: 'bob' },
    { display: 'Eve', user: 'eve' },
  ]
</script>

<div class="people">
  <div class="shadow">
    {#each people as person}
      <div class="person">
        <img
          src="/api/image/{person.user}"
          alt="{person.display} picture"
          width={64}
          height={64}
        />
        <a class="display-name" href="/chat/{person.user}">{person.display}</a>
        <span class="user-name">{person.user}</span>
      </div>
    {/each}
  </div>
</div>

<Nav />

<style lang="scss">
  :global(#app) {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $background;
  }

  .people {
    flex: 1;
    overflow: auto;
  }

  .shadow {
    box-shadow: 0 1em 2em $shadow;
  }

  .person {
    position: relative;
    padding: 1em;
    background-color: $light-background;
    display: grid;
    grid-template-columns: 4em 1fr;
    column-gap: 0.5em;

    > img {
      grid-row: 1 / 3;
      border-radius: 50%;
    }
  }

  .person + .person {
    background-color: $light-background;
    border-top: 1px solid $border;
  }

  .display-name {
    align-self: end;
    color: inherit;
    font-weight: bold;
    text-decoration: inherit;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
    }
  }

  .user-name {
    opacity: 0.75;
  }
</style>
