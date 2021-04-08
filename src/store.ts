import {writable} from "svelte/store";

export interface File {
  data: string;
}

export interface Filesystem {
  [key: string]: File
}

export interface ErrorCompiling {
  offset: number;
  message: string;
  end: number;
}

const initialFile = `package main

import "github.com/Vilsol/go-mlog/m"

func main() {
\tprint("Hello World: ")
\tprintln(fibonacci(10))
\tm.PrintFlush("message1")
}

func fibonacci(n int) int {
\tif n <= 1 {
\t\treturn n
\t}

\tgrandparent := 1
\tparent := 2
\tme := parent
\tfor i := 3; i < n; i++ {
\t\tme = parent + grandparent
\t\tgrandparent = parent
\t\tparent = me
\t}

\treturn me
}`

let initialFs: Filesystem = {example: {data: initialFile}};

if (localStorage.getItem('mlog_fs')) {
  initialFs = JSON.parse(localStorage.getItem('mlog_fs'));
}

export const filesystem = writable(initialFs);

export const currentFile = writable(Object.keys(initialFs).sort()[0]);

export const errorCompiling = writable<ErrorCompiling | undefined>(undefined);

filesystem.subscribe((fs) => localStorage.setItem('mlog_fs', JSON.stringify(fs)));
