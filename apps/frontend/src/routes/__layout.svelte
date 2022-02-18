<script lang="ts" context="module">
  import { page } from '$app/stores'
  import type { Load } from '@sveltejs/kit'
  import '../app.scss'

  export const load: Load = ({ session }) => {
    if (!session.user) return { redirect: '/register', status: 307 }
    return {}
  }
</script>

<svelte:head>
  <title>
    {$page.stuff.title ? `${$page.stuff.title} – ` : ''}Bastion
  </title>
</svelte:head>

<slot />
