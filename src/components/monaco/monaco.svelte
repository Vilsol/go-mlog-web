<script context="module">
    import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
    import 'monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js';
    import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js';
    // import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js';
    // import 'monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js';
    import 'monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js';
    // import 'monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js';
    // import 'monaco-editor/esm/vs/editor/contrib/colorPicker/colorDetector.js';
    import 'monaco-editor/esm/vs/editor/contrib/comment/comment.js';
    import 'monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js';
    // import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js';
    // import 'monaco-editor/esm/vs/editor/contrib/dnd/dnd.js';
    import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
    import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js';
    // import 'monaco-editor/esm/vs/editor/contrib/format/formatActions.js';
    // import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationCommands.js';
    // import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationMouse.js';
    // import 'monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js';
    import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
    // import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js';
    // import 'monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js';
    // import 'monaco-editor/esm/vs/editor/contrib/links/links.js';
    import 'monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js';
    // import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js';
    // import 'monaco-editor/esm/vs/editor/contrib/quickFix/quickFixCommands.js';
    // import 'monaco-editor/esm/vs/editor/contrib/referenceSearch/referenceSearch.js';
    // import 'monaco-editor/esm/vs/editor/contrib/rename/rename.js';
    import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js';
    import 'monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js';
    import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js';
    // import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js';
    // import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js';
    // import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js';
    import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import 'monaco-editor/esm/vs/basic-languages/go/go.contribution.js';
</script>

<script lang="ts">
  import {onMount} from 'svelte';
  import {currentFile, errorCompiling, filesystem} from '../../store';
  import type {editor} from "monaco-editor";
  import {MarkerSeverity} from "monaco-editor";

  let container;
  let editor: editor.IStandaloneCodeEditor;

  onMount(() => {
    editor = monaco.editor.create(
      container,
      {
        value: '',
        language: 'go',
        theme: 'vs-dark',
        fontFamily: '\'Roboto Mono\', monospace'
      }
    )

    document.fonts.ready.then(() => monaco.editor.remeasureFonts());

    function updateFs() {
      const fs = $filesystem;
      const cf = $currentFile;
      if (fs && cf) {
        if (cf in fs) {
          filesystem.set({
            ...fs,
            [cf]: {
              ...fs[cf],
              data: editor.getValue()
            }
          })
        }
      }
    }

    editor.onKeyUp(updateFs);

    currentFile.subscribe(file => {
      const fs = $filesystem;
      if (fs && file) {
        if (file in fs) {
          try {
            editor.setValue(fs[file].data);
            updateFs();
          } catch (err) {
            console.error(err);
          }
          return;
        }
      }
      editor.setValue('');
    });

    errorCompiling.subscribe(err => {
      const model = editor.getModel();
      if (model) {
        if (err) {
          const pos = model.getPositionAt(err.offset - 1);
          const endPos = model.getPositionAt(err.end - 1);
          if (pos) {
            monaco.editor.setModelMarkers(model, '1', [
              {
                startColumn: pos.column,
                startLineNumber: pos.lineNumber,
                message: err.message,
                severity: MarkerSeverity.Error,
                endColumn: endPos.column,
                endLineNumber: endPos.lineNumber
              }
            ]);
          }
        } else {
          monaco.editor.setModelMarkers(model, '1', []);
        }
      }
    });
  });
</script>

<div class="monaco-container" bind:this={container} style="flex: 1; overflow: hidden;">
</div>
