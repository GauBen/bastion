<script>
  import { page } from '$app/stores'
  import '../app.scss'
</script>

<svelte:head>
  <title>
    {$page.stuff.title ? `${$page.stuff.title} – ` : ''}Bastion
  </title>
</svelte:head>

<slot />
