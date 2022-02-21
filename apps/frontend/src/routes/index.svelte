<script lang="ts" context="module">
  import Nav from '$lib/Nav.svelte'
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ props }) => ({
    props,
    stuff: { title: 'Conversations' },
  })
</script>

<script lang="ts">
  export let contacts: {
    id: number
    name: string
    displayName: string
  }[]
</script>

<main>
  <div class="people">
    <div class="shadow">
      {#each contacts as contact}
        <div class="person">
          <img
            src="/api/image?{new URLSearchParams({
              name: contact.name,
              accept: 'png,jpg',
            })}"
            alt="{contact.displayName} picture"
            width={64}
            height={64}
          />
          <a class="display-name" href="/chat/{contact.name}">
            {contact.displayName}
          </a>
          <span class="user-name">{contact.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <Nav />
</main>

<style lang="scss">
  main {
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
