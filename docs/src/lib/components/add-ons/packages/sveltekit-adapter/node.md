<script lang="ts">
    const {packageManager} = $props();
</script>

{#if packageManager === 'pnpm'}

```shell
pnpm i -D @sveltejs/adapter-node
```

{/if}

{#if packageManager === 'npm'}

```shell
npm i -D @sveltejs/adapter-node
```

{/if}

{#if packageManager === 'yarn'}

```shell
yarn add -D @sveltejs/adapter-node
```

{/if}

{#if packageManager === 'deno'}

```shell
deno add --dev npm:@sveltejs/adapter-node
```

{/if}
