<script lang="ts">
    const {packageManager} = $props();
</script>

{#if packageManager === 'pnpm'}
```shell
pnpm i -D @sveltejs/adapter-vercel
```
{/if}

{#if packageManager === 'npm'}
```shell
npm i -D @sveltejs/adapter-vercel
```
{/if}

{#if packageManager === 'yarn'}
```shell
yarn add -D @sveltejs/adapter-vercel
```
{/if}

{#if packageManager === 'deno'}
```shell
deno add --dev npm:@sveltejs/adapter-vercel
```
{/if}
