import * as monaco from 'monaco-editor';
import type {languages} from "monaco-editor";

monaco.languages.register({id: 'mlog'})

monaco.languages.setMonarchTokensProvider('mlog', {
  keywords: [
    "color",
    "stroke",
    "line",
    "rect",
    "lineRect",
    "poly",
    "linePoly",
    "triangle",
    "image",
    "enabled",
    "shoot",
    "shootp",
    "configure",
    "color",
    "any",
    "enemy",
    "ally",
    "player",
    "attacker",
    "flying",
    "boss",
    "ground",
    "stop",
    "move",
    "approach",
    "boost",
    "pathfind",
    "target",
    "targetp",
    "itemDrop",
    "itemTake",
    "payTake",
    "mine",
    "flag",
    "build",
    "getBlock",
    "within",
    "distance",
    "health",
    "shield",
    "armor",
    "maxHealth",
    "ore",
    "building",
    "spawn",
    "damaged",
    "core",
    "storage",
    "generator",
    "turret",
    "factory",
    "repair",
    "rally",
    "battery",
    "resupply",
    "reactor",
    "max",
    "min",
    "atan2",
    "dst",
    "noise",
    "abs",
    "log",
    "log10",
    "sin",
    "cos",
    "tan",
    "floor",
    "ceil",
    "sqrt",
    "rand",
    "add",
    "sub",
    "mul",
    "div",
    "idiv",
    "mod",
    "equal",
    "notEqual",
    "lessThan",
    "lessThanEq",
    "greaterThan",
    "greaterThanEq",
    "land",
    "shl",
    "shr",
    "or",
    "and",
    "and",
    "xor",
    "not"
  ],
  simple: [
    "read",
    "write",
    "draw",
    "print"
  ],
  actions: [
    "drawflush",
    "printflush",
    "getlink",
    "control",
    "radar",
    "sensor"
  ],
  variables: [
    "set",
    "op"
  ],
  pointers: [
    "end",
    "jump"
  ],
  units: [
    "ubind",
    "ucontrol",
    "uradar",
    "ulocate"
  ],
  tokenizer: {
    root: [
      [
        /^[a-zA-Z]\w*/,
        {
          cases: {
            '@simple': 'custom-simple',
            '@actions': 'custom-actions',
            '@variables': 'custom-variables',
            '@pointers': 'custom-pointers',
            '@units': 'custom-units',
          }
        }
      ],

      [/@[a-zA-Z]\w*/, 'custom-specials'],

      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@keywords': {token: 'keyword.$0'},
            '@default': 'identifier'
          }
        }
      ],

      [/[\-+]?\d+\.\d+/, 'number.float'],
      [/[\-+]?\d+/, 'number'],

      [/"/, 'string', '@string'],

      [/#.*$/, 'comment'],
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],
  }
} as any);

monaco.editor.defineTheme('mlog-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {token: 'custom-simple', foreground: 'a08a8a'},
    {token: 'custom-actions', foreground: 'd4816b'},
    {token: 'custom-variables', foreground: '877bad'},
    {token: 'custom-pointers', foreground: '6bb2b2'},
    {token: 'custom-units', foreground: 'c7b59d'},
    {token: 'custom-specials', foreground: 'cbd87e'},
  ]
} as any);

interface GoData<T extends ('function' | 'value')> {
  type: T;
}

interface GoField {
  type: string;
  name?: string;
}

interface GoFunction extends GoData<'function'> {
  comments?: string[];
  params?: GoField[];
  results?: GoField[];
}

interface GoValue extends GoData<'value'> {
  value: string;
  comments?: string[];
}

interface GoPackage {
  [key: string]: GoFunction | GoValue;
}

interface GoTypings {
  [key: string]: GoPackage;
}

const getSuggestions = (range: languages.CompletionItem['range']) => {
  const goTypings = window['goTypings'] as GoTypings;
  const suggestions: languages.CompletionItem[] = [];

  Object.keys(goTypings).forEach(pack => {
    const packName = pack.substr(pack.lastIndexOf('/') + 1);
    Object.keys(goTypings[pack]).forEach(name => {
      const data = goTypings[pack][name];
      const label = packName + '.' + name;

      if (data.type === 'function') {
        let detail = name + '(';
        let insertText = label + '(';

        if (data.params) {
          insertText += data.params.map((param, i) => {
            if (param.name) {
              return `\${${i + 1}:${param.name}}`;
            }
            return `\${${i + 1}:}}`;
          }).join(', ');

          detail += data.params.map((param, i) => {
            if (param.name) {
              return param.name + ' ' + param.type;
            }
            return param.type;
          }).join(', ');
        }

        insertText += ')';
        detail += ')';

        if (data.results) {
          detail += ' '
          if (data.results.length > 1) {
            detail += '('
          }

          detail += data.results.map(result => {
            if (result.name) {
              return result.name + ' ' + result.type;
            }
            return result.type;
          }).join(', ');

          if (data.results.length > 1) {
            detail += ')'
          }
        }

        suggestions.push({
          label,
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: !data.comments ? undefined : data.comments.map(c => c.substr(2).trim()).join('\n'),
          insertText: insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: detail
        });
      } else if (data.type === 'value') {
        suggestions.push({
          label,
          kind: monaco.languages.CompletionItemKind.Constant,
          documentation: !data.comments ? undefined : data.comments.map(c => c.substr(2).trim()).join('\n'),
          insertText: label,
          range: range,
          detail: data.value
        });
      }
    })
  });

  return suggestions;
}

monaco.languages.registerCompletionItemProvider('go', {
  provideCompletionItems: function (model, position) {
    const word = model.getWordUntilPosition(position);
    return {
      suggestions: getSuggestions({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      })
    };
  }
});