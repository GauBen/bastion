<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'
  import '../../app.scss'

  export const load: Load = ({ session }) => {
    if (session.user) return { redirect: '/', status: 307 }
    return {}
  }
</script>

<svelte:head>
  <title>Register – Bastion</title>
</svelte:head>

<slot />
