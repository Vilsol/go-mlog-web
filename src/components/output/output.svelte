<script context="module">
    import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import '../../mlog-lang';
</script>

<script lang="ts">
  import {onMount} from 'svelte';
  import type {editor} from "monaco-editor";

  export let outputData: string | undefined;

  let container;
  let editor: editor.IStandaloneCodeEditor;

  $: {
    if (editor) {
      if (outputData) {
        try {
          editor.setValue(outputData);
        } catch (err) {
          console.error(err);
        }
      } else {
        editor.setValue('');
      }
    }
  }

  onMount(() => {
    editor = monaco.editor.create(
      container,
      {
        value: '',
        language: 'mlog',
        theme: 'mlog-theme',
        fontFamily: '\'Roboto Mono\', monospace',
        readOnly: true,
        lineNumbers: (n) => (n - 1).toString(),
        minimap: {
          enabled: false
        }
      }
    )

    document.fonts.ready.then(() => monaco.editor.remeasureFonts());

    editor.setValue(outputData || '');
  });
</script>

<div class="monaco-container" bind:this={container} style="flex: 1; overflow: hidden;">
</div>
