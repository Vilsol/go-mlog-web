<script lang="ts">
  import type {Filesystem} from '../../store';
  import {currentFile, filesystem} from '../../store';
  import {derived} from "svelte/store";
  import * as clipboard from 'clipboard-copy';
  import * as toastr from "toastr";
  import * as hastebin from 'hastebin-gen';

  const keys = derived(filesystem, (fs) => Object.keys(fs).sort());

  function rename(fs: Filesystem, filename: string) {
    const newName = prompt("Enter new name:", filename);

    if (newName === '') {
      alert("Please enter a name");
      return;
    }

    if (newName in fs) {
      alert("This file already exists");
      return;
    }

    const newObj = {
      ...fs,
      [newName]: fs[filename]
    };

    delete newObj[filename];

    filesystem.set(newObj);
  }

  function newFile(fs: Filesystem) {
    const filename = prompt("Enter new name:");

    if (filename === '') {
      alert("Please enter a name");
      return;
    }

    if (filename in fs) {
      alert("This file already exists");
      return;
    }

    filesystem.set({
      ...fs,
      [filename]: {
        data: `package main

import "github.com/Vilsol/go-mlog/m"

func main() {
	// Your code here
    println("Hello World!")
    m.PrintFlush("message1")
}`
      }
    });

    currentFile.set(filename);
  }

  function deleteFile(fs: Filesystem, filename: string) {
    const newObj = {
      ...fs,
    };

    delete newObj[filename];

    filesystem.set(newObj);

    if (filename === $currentFile) {
      currentFile.set(Object.keys(newObj).sort()[0]);
    }
    toastr.options.positionClass = 'toast-bottom-center';
    toastr.success('File deleted');
  }

  function exportFile(fs: Filesystem, filename: string) {
    clipboard.default(JSON.stringify({
      [filename]: fs[filename],
    }));
    toastr.options.positionClass = 'toast-bottom-center';
    toastr.success('File copied to clipboard');
  }

  function importFile(fs: Filesystem) {
    const data = prompt("Enter import data:");

    if (data === '') {
      alert("Please enter data");
      return;
    }

    let parsed: Filesystem;
    try {
      parsed = JSON.parse(data)
    } catch (e) {
      alert("Error parsing JSON: " + e.toString());
      return;
    }

    parseImport(fs, parsed);
  }

  function parseImport(fs: Filesystem, parsed: Filesystem) {
    const result: Filesystem = {};
    for (let name of Object.keys(parsed)) {
      let validName = name;
      if (name in fs) {
        // Surely 100 is enough, right?
        for (let i = 1; i < 100; i++) {
          const testName = name + '_' + i;
          if (!(testName in fs)) {
            validName = testName;
            break;
          }
        }

        if (validName === name) {
          alert("Too many files with the same name!");
          return;
        }
      }

      result[validName] = parsed[name];
    }

    filesystem.set({
      ...fs,
      ...result
    });

    toastr.options.positionClass = 'toast-bottom-center';
    toastr.success('Imported ' + Object.keys(result).length + ' files');
  }

  function shareFile(fs: Filesystem, filename: string) {
    toastr.options.positionClass = 'toast-bottom-center';
    toastr.info('Generating link...');

    hastebin.default(fs[filename].data, {
      extension: "go",
      url: "https://hb.vil.so"
    }).then(haste => {
      const fullUrl = 'https://hb.vil.so/raw/' + haste.match(/hb.vil.so\/([^.]+).go/)[1];
      clipboard.default(window.location.origin + window.location.pathname + '?import=' + encodeURIComponent(fullUrl) + '&name=' + encodeURIComponent(filename));
      toastr.options.positionClass = 'toast-bottom-center';
      toastr.success('Link copied to clipboard');
    }).catch(error => {
      console.error(error);
      toastr.options.positionClass = 'toast-bottom-center';
      toastr.error('Error generating link');
    });
  }

  if (window && window.location && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('import') && urlParams.has('name')) {
      toastr.options.positionClass = 'toast-bottom-center';
      toastr.info('Importing ' + urlParams.get('import'));

      const name = urlParams.get('name');
      fetch(urlParams.get('import'))
        .then(async (data) => parseImport($filesystem, {[name]: {data: await data.text()}}));
      window.history.replaceState({}, '', window.location.origin + window.location.pathname);
    }
  }
</script>

<div class="files">
    <div class="files-buttons">
        <div>
            <button on:click={() => newFile($filesystem)}>New</button>
        </div>
        <div>
            <button on:click={() => importFile($filesystem)}>Import</button>
        </div>
    </div>
    <div>
        {#each $keys as name (name)}
            <div class="file" class:selected="{name === $currentFile}" on:click={() => currentFile.set(name)}>
                <div class="file-name">
                    <span>{name}</span>
                </div>
                <div>
                    <button on:click={() => rename($filesystem, name)} title="Edit Name">
                        <div class='codicon codicon-edit'></div>
                    </button>
                    <button on:click={() => deleteFile($filesystem, name)} title="Delete File">
                        <div class='codicon codicon-trash'></div>
                    </button>
                    <button on:click={() => exportFile($filesystem, name)} title="Export File">
                        <div class='codicon codicon-json'></div>
                    </button>
                    <button on:click={() => shareFile($filesystem, name)} title="Share File">
                        <div class='codicon codicon-package'></div>
                    </button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .files {
        display: flex;
        flex-direction: column;
    }

    .files .files-buttons {
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

    .file {
        padding: 5px;
        display: flex;
        justify-content: space-between;
    }

    .file.selected {
        background: rgba(255, 255, 255, 0.05);
    }

    .file:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .file-name {
        padding: 10px 15px;
    }
</style>
