---
layout: post
title: TypeScript 2.1, npm, and webpack
description: How to setup a TypeScript 2.1 project with npm and webpack
published: true
---

Each time I want to start a new project with TypeScript and npm I find that
I've forgotten how to do it. This article is my personal reminder.

My old [pixi.js article]({% post_url 2016-08-06-typescript-pixi-webpack %}) has
similar, more complicated, and out of date info.

## Goals

* Use aggressive TypeScript settings for typechecking
* Don't rely on anything installed globally (except npm)
* `npm install` gets a freshly cloned repo up and running reliably
* npm (commands) for automation and dependencies (no grunt, no typings, no bower, etc)
* webpack for bundling

I don't know if this is good or "cool", but it has been working for me and seems
relatively small and understandable.

## How

```text
mkdir myproj
cd myproj
mkdir src dist
npm init     # (use `./dist/bundle.js` as entry point)
npm install --save typescript webpack ts-loader source-map-loader
git init
```

## Files to add to project root

### .gitignore

I mostly use IDEA for TypeScript, but sometimes alm too.

```text
*.iml
.idea
.alm
dist
node_modules
```

### .editorconfig

Optional. See [http://editorconfig.org/](http://editorconfig.org/)

```text
[*.{js,jsx,ts,tsx}]
indent_style = space
indent_size = 4
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = true
insert_final_newline = true
```

### tsconfig.json

Create a
[`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
in the project root. This will vary a lot by project, but it's a starting
point.

```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
    "outDir": "./dist/",
    "sourceMap": true,
    "target": "es5"
  },
  "filesGlob": [
    "./src/*.ts"
  ]
}
```

### webpack.config.js

Create `webpack.config.js` in the project root. Something like:

```js
module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "./dist/bundle.js"
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    resolve: {
        // Add '.ts' as resolvable extensions.
        extensions: [".ts", ".js"]
    },
    module: {
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by
            // 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ],

        loaders: [
            // All files with a '.ts' extension will be handled by 'ts-loader'.
            { test: /\.ts$/, loader: "ts-loader" }
        ]
    },
    // Omit "externals" if you don't have any. Just an example because it's
    // common to have them.
    externals: [
        // Don't bundle giant dependencies, instead assume they're available in
        // the html doc as global variables node module name -> JS global
        // through which it is available
        {"d3": "d3",
         "immutable": "Immutable"}
    ]
};
```

### npm run commands

So you can do stuff like `npm run build`, etc. Add this to `package.json`. The
only semi-interesting thing here is that I'm not relying on globally installed
webpack.

```text
  // add to package.json
  "scripts": {
    "build": "node_modules/.bin/webpack",
    "build:watch": "node_modules/.bin/webpack -w",
    "clean": "rm ./dist/*"
  },
```

## Add a new dependency with its types

Use
[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped#definitelytyped-).

e.g. Use [D3](https://d3js.org) as a dependency, with types as a dev-time
dependency for TypeScript:

```text
npm install --save d3
npm install --save-dev @types/d3
```
