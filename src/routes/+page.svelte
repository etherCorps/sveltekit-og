<script lang="ts">
  import AceEditor from "/src/components/AceEditor.svelte";
  import "brace/mode/html";
  import "brace/theme/chrome";
  let text = "<h1>hii</h1>";
</script>

<div class="grid grid-cols-2 space-x-10 p-10">
  <AceEditor style="border: solid"
             on:selectionChange={(obj) => console.log(obj.detail)}
             on:paste={(obj) => console.log(obj.detail)}
             on:input={(obj) => console.log(obj.detail)}
             on:focus={() => console.log('focus')}
             on:documentChange={(obj) => console.log(`document change : ${obj.detail}`)}
             on:cut={() => console.log('cut')}
             on:cursorChange={() => console.log('cursor change')}
             on:copy={() => console.log('copy')}
             on:init={(editor) => console.log(editor.detail)}
             on:commandKey={(obj) => console.log(obj.detail)}
             on:changeMode={(obj) => console.log(`change mode : ${obj.detail}`)}
             on:blur={() => console.log('blur')}
             lang="html"
             theme="chrome"
             value={text}
  />
  <div class="grid grid-rows-2 mt-8 space-y-4">
    <div class="common">
      Editor Under Development
    </div>
    <div class="common">
      Coming Soon...
    </div>
  </div>
</div>

<style>
  .common {
      @apply border border-gray-800 rounded p-5
  }
</style>
