<script lang="ts">
    const {packageManager} = $props()
</script>

{#if packageManager === 'pnpm'}

```shell
pnpm i @ethercorps/sveltekit-og
```

{/if}

{#if packageManager === 'npm'}

```shell
npm i @ethercorps/sveltekit-og
```

{/if}

{#if packageManager === 'yarn'}

```shell
yarn add @ethercorps/sveltekit-og
```

{/if}

{#if packageManager === 'deno'}

```shell
deno add npm:@ethercorps/sveltekit-og
```

{/if}
