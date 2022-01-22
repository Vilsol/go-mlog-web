<script lang="ts">
  import MonacoEditor from './components/monaco/monaco.svelte';
  import Files from './components/files/files.svelte';
  import Output from './components/output/output.svelte';

  import {derived} from 'svelte/store';
  import {currentFile, filesystem, errorCompiling} from './store';
  import * as clipboard from "clipboard-copy";
  import * as toastr from "toastr";

  let code = '';

  let compileOnChange = true;

  let transpiled = '';

  let numbers = false;
  let comments = false;
  let source = false;

  function compile(): boolean {
    if (code === '') {
      transpiled = '';
      return true;
    }

    try {
      if (window['transpiler_instantiated'] && transpileGo) {
        transpiled = transpileGo(code, numbers, comments, source);

        if (transpiled) {
          const match = transpiled.match(/^error at ([0-9]+)(?:-([0-9]+))?: (.+)$/);
          if (match) {
            errorCompiling.set({
              message: match[3],
              offset: parseInt(match[1]),
              end: parseInt(match[2] === undefined ? match[1] : match[2])
            });
          } else {
            errorCompiling.set(undefined);
          }
        }

        return true;
      }
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  function copyOutput() {
    clipboard.default(transpiled);
    toastr.options.positionClass = 'toast-bottom-center';
    toastr.success('Output copied to clipboard');
  }

  derived([currentFile, filesystem], (a) => a).subscribe(([cf, fs]) => {
    code = '';
    if (cf && fs) {
      if (cf in fs) {
        code = fs[cf].data;
      }
    }
    if (compileOnChange) {
      compile();
    }
  });

  let loops = 0;
  const initCompile = setInterval(() => {
    if (compile() || loops++ > 40) {
      clearInterval(initCompile);
    }
  }, 250)
</script>

<main style="height: 100%">
    <div class="ide">
        <div class="file-tree">
            <Files/>
        </div>
        <div class="editor">
            <MonacoEditor/>
        </div>
        <div class="output">
            <div class="output-buttons">
                <div>
                    <button on:click={compile}>Compile</button>
                    <input type="checkbox" bind:checked={compileOnChange}> Auto
                </div>
                <div>
                    <button on:click={copyOutput}>Copy</button>
                </div>
            </div>
            <div>
                <input type="checkbox" bind:checked={numbers}> Numbers
                <input type="checkbox" bind:checked={comments}> Comments
                <input type="checkbox" bind:checked={source}> Source
            </div>
            <Output outputData="{transpiled}"/>
        </div>
    </div>

    <a class="github-fork-ribbon right-bottom" href="https://github.com/Vilsol/go-mlog-web"
       data-ribbon="Fork me on GitHub" title="Fork me on GitHub" target="_blank">Fork me on GitHub</a>
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        background: #1e1e1e;
        color: #fff;
    }

    main {
        height: 100%;
    }

    .ide {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
        flex-direction: row
    }

    .file-tree {
        width: 15vw;
    }

    .editor {
        flex: 1;
        display: flex;
        border-left: #2d2d2d 3px solid;
        border-right: #2d2d2d 3px solid;
    }

    .output {
        width: 20vw;
        display: flex;
        flex-direction: column;
    }

    .output .output-buttons {
        padding: 5px;
        border-bottom: #2d2d2d 3px solid;
        display: flex;
        justify-content: space-between;
    }

    button {
        color: #fff;
        background: #333333;
        border: #2d2d2d 2px solid;
        margin: 0;
    }

    button:active {
        background: #444444;
    }

    .output textarea {
        padding: 10px 15px;
        width: 100%;
        height: 100%;
        overflow: auto;
        background: #1e1e1e;
        color: #fff;
        border: none;
        outline: none;
        flex: 1;
        white-space: pre;
        font-family: 'Roboto Mono', monospace;
        font-size: 10pt;
    }

    .github-fork-ribbon:before {
        background-color: rgb(38, 42, 43);
    }

    .github-fork-ribbon::after {
        color: rgb(232, 230, 227);
        text-decoration-color: initial;
        text-shadow: rgba(0, 0, 0, 0.5) 0 -0.08em;
        border-color: rgba(48, 52, 54, 0.7);
    }

    textarea {
        resize: none;
    }
</style>
