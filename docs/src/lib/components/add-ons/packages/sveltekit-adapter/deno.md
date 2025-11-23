<script lang="ts">
    const {packageManager} = $props();
</script>

{#if packageManager === 'pnpm'}
```shell
pnpm i -D svelte-adapter-deno
```
{/if}

{#if packageManager === 'npm'}
```shell
npm i -D svelte-adapter-deno
```
{/if}

{#if packageManager === 'yarn'}
```shell
yarn add -D svelte-adapter-deno
```
{/if}

{#if packageManager === 'deno'}
```shell
deno add --dev npm:svelte-adapter-deno
```
{/if}
