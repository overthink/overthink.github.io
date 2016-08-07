---
layout: post
title: TypeScript 2.0, pixi.js, and Webpack
description: How to get a simple pixi.js project started with TypeScript 2.0 and Webpack
published: true
---

This article describes how to get a minimal [pixi.js](http://www.pixijs.com/)
project started with [TypeScript](https://www.typescriptlang.org/) 2.0 and
[Webpack](https://webpack.github.io/).

## Why?

I want to do a graphics thing and the browser is the natural target these days.
Pixi.js is an impressive looking 2d renderer that seems relatively small and is
widely used.  TypeScript in order to add basic sanity to JavaScript.
TypeScript **2.0** for non-nullable types (finally). Webpack... well, I have
not been much of a JS/node.js/npm person in the past, so I'm not really sure
what I'm doing here.  However, in my flailing around in this enormous ecosystem
it seems that Webpack is a relatively sane way to get apps developed with
node.js running in the browser.  If nothing else it seems to be very popular.

## Prerequisites

Have the latest node.js installed and in your path. v6.3.1 at the time of writing.

```text
$ node --version
v6.3.1
```

## How

Install TypeScript 2.0 (currently considered beta) globally so the `tsc`
command ends up on the path.

```text
npm install -g typescript@beta
```

Install the other global commands we need.
[`typings`](https://github.com/typings/typings) will give us TypeScript support
for pixi.js.

```text
npm install -g typings webpack
```

Setup the project directories.

```text
mkdir pixitest
cd pixitest
mkdir src dist
```

Initialize the `npm` project.  Accept defaults for all prompts _except_ "entry
point".  For that use `./dist/bundle.js`.

```text
npm init
...
entry point: (index.js) ./dist/bundle.js
...
```

Add pixi.js as a dependency for the project.

```text
npm install --save pixi.js
```

Add Webpack as a dev dependency for the project  Earlier we installed it
globally.  Now we install it locally because the `source-map-loader` (coming
up) won't work if we don't.  I don't fully grok this.  See [open question](#q).

```text
npm install --save-dev webpack
```

Add a few development dependencies that allow TypeScript and Webpack to work
together.  `ts-loader` helps Webpack compile TypeScript files.
`source-map-loader` uses source maps coming out of TypeScript to inform its own
source maps. I'm impressed that this is possible.

```text
npm install --save-dev ts-loader source-map-loader
```

Now some dependencies to get pixi.js and Webpack to work together.

```text
npm install --save-dev brfs transform-loader
```

Add TypeScript to this project. Earlier we installed it globally, so we'll
just link that install to our project. See [open question](#q).

```text
npm link typescript
```

Use `typings` to get the type info for pixi.js.

```text
typings install --global --save-dev dt~pixi.js
```

At this point, `package.json` should look roughly like this:

```json
{
  "name": "pixitest",
  "version": "1.0.0",
  "description": "",
  "main": "./dist/bundle.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "pixi.js": "^3.0.11"
  },
  "devDependencies": {
    "brfs": "^1.4.3",
    "source-map-loader": "^0.1.5",
    "transform-loader": "^0.2.3",
    "ts-loader": "^0.8.2",
    "webpack": "^1.13.1"
  }
}
```

We now need to create a `tsconfig.json` file so all the various tools (`tsc`, IDEs)
can use the same TypeScript configuration.

```json
{
    "compilerOptions": {
        "strictNullChecks": true,
        "outDir": "./dist/",
        "sourceMap": true,
        "noImplicitAny": true,
        "module": "commonjs",
        "target": "es5"
    },
    "files": [
        "./typings/index.d.ts",
        "./src/helloworld.ts"
    ]
}
```

Including `./typings/index.d.ts` is how we make available the type info for
pixi.js.

Create a skeleton index.html page in the project root to host our app.

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Hello World, Pixi!</title>
    </head>
    <body>
        <script src="./dist/bundle.js"></script>
    </body>
</html>
```

Now we actually write some code!  Call this file `./src/helloworld.ts`

```javascript
import PIXI = require('pixi.js');

var renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();
var texture = PIXI.Texture.fromImage('bunny.png');
var bunny = new PIXI.Sprite(texture);
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;
bunny.position.x = 400;
bunny.position.y = 300;
bunny.scale.x = 2;
bunny.scale.y = 2;
stage.addChild(bunny);
animate();

function animate() {
    requestAnimationFrame(animate);
    var bunny = stage.getChildAt(0);
    bunny.rotation += 0.01;
    renderer.render(stage);
}
```

Last, and most ugly/confusing, configure Webpack.  This file is called `webpack.config.js`.

```javascript
var path = require('path');

module.exports = {
    entry: "./src/helloworld.ts",
    output: {
        filename: "./dist/bundle.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
    },

    module: {
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ],

        loaders: [
            // All files with a '.ts' extension will be handled by 'ts-loader'.
            { test: /\.ts$/, loader: "ts-loader" },
            // Pixi apparently needs to read its package.json file, so we tell webpack
            // how to load these.
            { test: /\.json$/, loader: "json" }
        ],

        // Pixi expects people to be using Browserify. We're not, but we still can use
        // its brfs module to deal with pixi code using "fs".
        postLoaders: [
          { include: path.resolve(__dirname, "node_modules/pixi.js"), loader: "transform?brfs" }
        ]
    },
};
```

## Try it

Run `webpack` in the root of the project.

```text
$ webpack
ts-loader: Using typescript@2.0.0 and /home/mark/pixitest/tsconfig.json
Hash: 7bd716353f96e5ace42c
Version: webpack 1.13.1
Time: 5256ms
               Asset     Size  Chunks             Chunk Names
    ./dist/bundle.js  1.03 MB       0  [emitted]  main
./dist/bundle.js.map  1.23 MB       0  [emitted]  main
    + 137 hidden modules
```

This command does a lot of work, most of which, I think, is assembling pixi.js
for the browser.  I believe this can be reduced significantly through better
Webpack config.

Start a web server in the project dir (I use `python -m SimpleHTTPServer`) and
check out index.html in the browser.  You should have a little pixi.js rabbit
rotating on a blue background.

## Code

All the code described here is available at <https://github.com/overthink/pixitest>

## <a name="q"></a>Open question

Why don't we `npm install --save-dev typescript@beta`?  We have to do it for
`webpack`.  We install TypeScript globally and then just assume people
have them on their systems?  Seems wrong to me.  I'd prefer a model where you
clone a repo, type `npm install` and you get _everything_ you need.  Is this
not how it works in JS-land?  If you can explain this to me, I'd be grateful.

## References

* <https://blogs.msdn.microsoft.com/typescript/2016/07/11/announcing-typescript-2-0-beta/>
* <http://www.jbrantly.com/typescript-and-webpack/>
* <https://www.typescriptlang.org/docs/handbook/react-&-webpack.html>
* <https://gist.github.com/overthink/e13829adc2bf3574dedfeef11e635f05>

