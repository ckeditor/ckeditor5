---
category: alternative-setups
menu-title: Integrating from source using webpack
meta-title: Integrating CKEditor 5 from source using Webpack | Legacy CKEditor 5 documentation
order: 10
---

# Integrating from source using webpack &ndash; Legacy guide

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you want to learn more about these changes, please refer to the {@link updating/nim-migration/migration-to-new-installation-methods Migrating to new installation methods} guide.
</info-box>

CKEditor&nbsp;5 is currently built using [webpack@5](https://webpack.js.org/). All builds, examples and demos are generated using this bundler. It should also be possible to build CKEditor&nbsp;5 using other bundlers (if they are configured properly), such as [Rollup](https://github.com/rollup/rollup) or [Browserify](http://browserify.org/), but these setups are not officially supported yet. However, there is integration for {@link getting-started/advanced/integrating-from-source-vite Vite}. It is still in an experimental phase and supports a limited number of features. For example, the [`@ckeditor/ckeditor5-dev-translations`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) that allows localizing the editor is only available for webpack. More work on this subject will be done in the future.

Therefore, a prerequisite to this guide is that you are using webpack as your build tool.

This scenario allows you to fully control the building process of CKEditor&nbsp;5. This means that you will not actually use the builds anymore, but instead build CKEditor&nbsp;5 from the source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

You can achieve similar results to what this method allows by {@link getting-started/legacy-getting-started/quick-start-other#building-the-editor-from-source customizing an existing build} and integrating your custom build. This will give faster build times (since CKEditor&nbsp;5 will be built once and committed), however, it requires maintaining a separate repository and installing the code from that repository into your project (for example, by publishing a new npm package or using tools like [Lerna](https://github.com/lerna/lerna)). This makes it less convenient than the method described in this scenario.

First of all, you need to install the source packages that you will use in your existing project. If you base your integration on one of the existing builds, you can take them from that build's `package.json` file (see, for example, [classic build's `package.json`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-build-classic/package.json)). At this moment you can choose the editor type and the features you want. Keep in mind, however, that all packages (excluding `@ckeditor/ckeditor5-dev-*`) must have the same version as the base editor package.

Copy these dependencies to your `package.json` and call `npm install` to install them. You can also install them individually. An example list of plugins may look like this:

```bash
npm install --save @ckeditor/ckeditor5-theme-lark \
  @ckeditor/ckeditor5-autoformat \
  @ckeditor/ckeditor5-basic-styles \
  @ckeditor/ckeditor5-block-quote \
  @ckeditor/ckeditor5-editor-classic \
  @ckeditor/ckeditor5-essentials \
  @ckeditor/ckeditor5-heading \
  @ckeditor/ckeditor5-link \
  @ckeditor/ckeditor5-list \
  @ckeditor/ckeditor5-paragraph
```

The second step is to install the dependencies needed to build the editor. The list may differ if you want to customize the webpack configuration, but this is a typical setup:

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-translations \
	@ckeditor/ckeditor5-dev-utils \
	css-loader@5 \
	postcss-loader@4 \
	raw-loader@4 \
	style-loader@2 \
	webpack@5 \
	webpack-cli@4
```

The list will differ if you want to use **TypeScript** in your project - additionally, you need to install `ts-loader`.

```bash
npm install --save ts-loader
```

## Webpack configuration

You can now configure webpack. There are a couple of things that you need to take care of when building CKEditor&nbsp;5:

* Handling CSS files of the CKEditor theme. They are included in the CKEditor&nbsp;5 sources using `import 'path/to/styles.css'` statements, so you need [proper loaders](https://webpack.js.org/loaders/).
* Similarly, you need to handle bundling SVG icons, which are also imported directly into the source. For that, you need the [`raw-loader`](https://webpack.js.org/loaders/raw-loader/).
* Finally, to localize the editor you need to use the [`@ckeditor/ckeditor5-dev-translations`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) webpack plugin.

### JavaScript

The minimal configuration, assuming that you use the same methods of handling assets as CKEditor&nbsp;5 builds, will look like this:

```js
// webpack.config.js

const path = require( 'path' );
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	entry: './main.js',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},
	plugins: [
		// More plugins.
		// ...

		new CKEditorTranslationsPlugin( {
			// See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
			language: 'pl'
		} )
	],
	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	}
};
```

<info-box>
	If you cannot use the latest webpack (at the moment of writing this guide, it is 5), the provided configuration will also work with webpack 4.
</info-box>

### TypeScript

Optionally, you may need to handle `.ts` files to use TypeScript in your project. There is the [`ts-loader`](https://webpack.js.org/guides/typescript/#loader) for this purpose. Webpack configuration must take into account these changes.

```js
// webpack.config.js

const path = require( 'path' );
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	entry: './main.ts',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},
	plugins: [
		// More plugins.
		// ...

		new CKEditorTranslationsPlugin( {
			// See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
			language: 'pl'
		} )
	],
	resolve: {
		extensions: [ '.ts', '.js', '.json' ],
		extensionAlias: {
			'.js': [ '.js', '.ts' ]
		}
	},
	module: {
		rules: [
			{
				test: /\.ts/,
				use: [ 'ts-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,

				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,

				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	}
};
```

### Webpack Encore

If you use [Webpack Encore](https://github.com/symfony/webpack-encore), you can use the following configuration:

```js
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

Encore.
	// Your configuration.
	// ...

	.addPlugin( new CKEditorTranslationsPlugin( {
		// See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
		language: 'pl'
	} ) )

	// Use raw-loader for CKEditor 5 SVG files.
	.addRule( {
		test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
		loader: 'raw-loader'
	} )

	// Configure other image loaders to exclude CKEditor 5 SVG files.
	.configureLoaderRule( 'images', loader => {
		loader.exclude = /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/;
	} )

	// Configure PostCSS loader.
	.addLoader({
		test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
		loader: 'postcss-loader',
		options: {
			postcssOptions: styles.getPostCssConfig( {
				themeImporter: {
					themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
				},
				minify: true
			} )
		}
	} )
```

## TypeScript configuration

If you want to use TypeScript, add the `tsconfig.json` file at the root of your project. You can copy the below example configuration or create your own.

```json
// tsconfig.json

{
	"compilerOptions": {
		"types": [],
		"lib": [
		"ES2019",
		"ES2020.String",
		"DOM",
		"DOM.Iterable"
		],
		"noImplicitAny": true,
		"noImplicitOverride": true,
		"strict": true,
		"module": "es6",
		"target": "es2019",
		"sourceMap": true,
		"allowJs": true,
		"moduleResolution": "node",
		"skipLibCheck": true
	},
	"include": ["./**/*.ts"],
	"exclude": [
		"node_modules/**/*"
	]
}
```

## Running the editor – method 1

### JavaScript

You can now import all the needed plugins and the creator directly into your code and use it there. The easiest way to do so is to copy it from the `src/ckeditor.js` file available in every build repository.

```js
// ckeditor.js

import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
	Essentials,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	Heading,
	Link,
	List,
	Paragraph
];

ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		]
	},
	language: 'en'
};
```

This module will export an editor creator class which has all the plugins and configuration settings that you need already built-in. To use the configured editor, simply import that class and call the static `.create()` method like in all {@link getting-started/setup/editor-lifecycle#creating-an-editor-with-create examples}.

```js
// main.js

import ClassicEditor from './ckeditor';

ClassicEditor
	// Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
	.create( document.querySelector( '#app' ) )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

### TypeScript

If you want to use TypeScript, the `ckeditor` file looks similar. However, do not forget about the `.ts` extension.

```ts
// ckeditor.ts

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

export default class CustomEditor extends ClassicEditor {}

CustomEditor.builtinPlugins = [
	Essentials,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	Heading,
	Link,
	List,
	Paragraph
];

CustomEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		]
	},
	language: 'en'
};
```

Then, you can use the configured editor with TypeScript in your application.

```ts
// main.ts

import ClassicEditor from './ckeditor';

ClassicEditor
	// Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
	.create( document.querySelector( '#app' ) as HTMLElement )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

## Running the editor – method 2

### JavaScript

The second variant of how to run the editor is to use the creator class directly, without creating an intermediary subclass. The above code would translate to:

```js
// main.js

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

ClassicEditor
	.create( document.querySelector( '#app'), {
		// The plugins are now passed directly to .create().
		plugins: [
			Essentials,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			Heading,
			Link,
			List,
			Paragraph,
		],

		// So is the rest of the default configuration.
		toolbar: [
			'heading',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		]
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

### TypeScript

You can also translate the above code using TypeScript.

```ts
// main.ts

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

ClassicEditor
	.create( document.querySelector( '#app') as HTMLElement, {
		// The plugins are now passed directly to .create().
		plugins: [
			Essentials,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			Heading,
			Link,
			List,
			Paragraph
		],

		// So is the rest of the default configuration.
		toolbar: [
			'heading',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		]
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

## Building

Finally, you can build your application. Add the build command to the scripts of your `package.json`.

```json
// package.json

{
  "scripts": {
	"test": "echo \"Error: no test specified\" && exit 1",
	"build": "webpack"
  }
}
```

Now you can type `npm run build` in the terminal to run webpack on your project. The rich-text editor will be a part of it.

## Option: Minifying JavaScript

Webpack 4 introduced the [concept of modes](https://webpack.js.org/concepts/mode/). It comes with two predefined modes: `development` and `production`. The latter automatically enables [`uglifyjs-webpack-plugin`](https://www.npmjs.com/package/uglifyjs-webpack-plugin) which takes care of JavaScript minification. Therefore, it is enough to execute `webpack` with the `--mode production` option or set `mode: 'production'` in your `webpack.config.js` to optimize the build.

<info-box>
	Prior to version 1.2.7 `uglifyjs-webpack-plugin` had a bug which caused webpack to crash with the following error: `TypeError: Assignment to constant variable`. If you experienced this error, make sure that your `node_modules` contains an up-to-date version of this package (and that webpack uses this version).

	CKEditor&nbsp;5 builds use [`Terser`](https://github.com/terser/terser) instead of `uglifyjs-webpack-plugin` because [the latter one is not supported anymore](https://github.com/ckeditor/ckeditor5/issues/1353).
</info-box>

## Option: Extracting CSS

One of the most common requirements is to extract CKEditor&nbsp;5 CSS to a separate file (by default it is included in the output JavaScript file). To do that, you can use [`mini-css-extract-plugin`](https://www.npmjs.com/package/mini-css-extract-plugin):

```bash
npm install --save \
	mini-css-extract-plugin \
	css-loader@5
```

And add it to your webpack configuration:

```js
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = {
	// More configuration.
	// ...

	plugins: [
		// More plugins.
		// ...

		new MiniCssExtractPlugin( {
			filename: 'styles.css'
		} )
	],

	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	}
};
```

Webpack will now create a separate file called `styles.css` which you will need to load manually into your HTML (using the `<link rel="stylesheet">` tag).

## Option: Building to ES5 target

CKEditor&nbsp;5 is written in ECMAScript 2015 (also called ES6). All browsers in which CKEditor&nbsp;5 is {@link support/browser-compatibility currently supported} have sufficient ES6 support to run CKEditor&nbsp;5. Thanks to that, CKEditor&nbsp;5 builds are also published in the original ES6 format.

However, it may happen that your environment requires ES5. For instance, if you use tools like the original [UglifyJS](https://github.com/mishoo/UglifyJS) which do not support ES6+ yet, you may need to transpile CKEditor&nbsp;5 source to ES5. This will create ~80% bigger builds but will ensure that your environment can process CKEditor&nbsp;5 code.

To create an ES5 build of CKEditor&nbsp;5, you can use [Babel](https://babeljs.io/):

```bash
npm install --save babel-loader @babel/core @babel/preset-env regenerator-runtime
```

Then, add this item to webpack [`module.rules`](https://webpack.js.org/configuration/module/#module-rules) section:

```js
module: {
	rules: [
		{
			// Match files from the `ckeditor5` package but also `ckeditor5-*` packages.
			test: /(ckeditor5(?:-[^\/\\]+)?)[\/\\].+\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [ require( '@babel/preset-env' ) ]
					}
				}
			]
		},
		// More rules.
		// ...
	]
}
```

Then, load [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) (needed to make ES6 generators work after transpilation) by adding it as the first [entry point](https://webpack.js.org/configuration/entry-context/#entry):

```js
entry: [
	require.resolve( 'regenerator-runtime/runtime.js' ),

	// Your entries.
	// ...
]
```

<info-box>
	This setup ensures that the source code is transpiled to ES5. However, it does not ensure that all ES6 polyfills are loaded. Therefore, if you would like to, for example, give [bringing IE11 compatibility](https://github.com/ckeditor/ckeditor5/issues/330) a try, make sure to also load [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/).
</info-box>

<info-box>
	The [`babel-preset-env`](https://github.com/babel/babel-preset-env) package lets you choose the environment that you want to support and transpiles ES6+ features to match that environment's capabilities. Without configuration, it will produce ES5 builds.
</info-box>
