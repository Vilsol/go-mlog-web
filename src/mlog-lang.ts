import * as monaco from 'monaco-editor';

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
    { token: 'custom-simple', foreground: 'a08a8a' },
    { token: 'custom-actions', foreground: 'd4816b' },
    { token: 'custom-variables', foreground: '877bad' },
    { token: 'custom-pointers', foreground: '6bb2b2' },
    { token: 'custom-units', foreground: 'c7b59d' },
    { token: 'custom-specials', foreground: 'cbd87e' },
  ]
} as any);

