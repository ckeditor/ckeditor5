---
menu-title: React component
category: frameworks
order: 30
---

{@snippet installation/frameworks/framework-integration}

# React rich text editor component

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor 5 consists of {@link installation/getting-started/predefined-builds ready-to-use editor builds} and {@link framework/index CKEditor 5 Framework} upon which the builds are based.

The easiest way to use CKEditor 5 in your React application is by choosing one of the {@link installation/getting-started/predefined-builds#available-builds rich text editor builds}. Additionally, it is also possible to integrate [CKEditor 5 built from source](#integrating-ckeditor-5-built-from-source) into your application. You can also use a customized editor built by using [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/) in any React application.

## Quick start

Install the [CKEditor 5 WYSIWYG editor component for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) and the {@link installation/getting-started/predefined-builds#available-builds editor build of your choice}.

Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
```

Use the `<CKEditor>` component inside your project:

```jsx
import React, { Component } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>Using CKEditor 5 build in React</h2>
				<CKEditor
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor 5!</p>"
					onReady={ editor => {
						// You can store the "editor" and use when it is needed.
						console.log( 'Editor is ready to use!', editor );
					} }
					onChange={ ( event, editor ) => {
						const data = editor.getData();
						console.log( { event, editor, data } );
					} }
					onBlur={ ( event, editor ) => {
						console.log( 'Blur.', editor );
					} }
					onFocus={ ( event, editor ) => {
						console.log( 'Focus.', editor );
					} }
				/>
			</div>
		);
	}
}

export default App;
```

## Component properties

The `<CKEditor>` component supports the following properties:

* `editor` (required) &ndash; The {@link module:core/editor/editor~Editor `Editor`} constructor to use.
* `data` &ndash; The initial data for the created editor. See the {@link installation/getting-started/getting-and-setting-data Getting and setting data} guide.
* `config` &ndash; The editor configuration. See the {@link installation/getting-started/configuration Configuration} guide.
* `id` &ndash; The editor ID. When this property changes, the component restarts the editor with new data instead of setting it on an initialized editor.
* `disabled` &ndash; A Boolean value. The {@link module:core/editor/editor~Editor `editor`} is being switched to read-only mode if the property is set to `true`.
* `watchdogConfig` &ndash; {@link module:watchdog/watchdog~WatchdogConfig Configuration object} for the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html).
* `onReady` &ndash; A function called when the editor is ready with an {@link module:core/editor/editor~Editor `editor`} instance. This callback is also called after the reinitialization of the component if an error occurred.
* `onChange` &ndash; A function called when the editor data has changed. See the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
* `onBlur` &ndash; A function called when the editor was blurred. See the {@link module:engine/view/document~Document#event:blur `editor.editing.view.document#blur`} event.
* `onFocus` &ndash; A function called when the editor was focused. See the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
* `onError` &ndash; A function called when the editor has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details.
    Error details is an object that contains two properties:
    * `{String} phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
     * `{Boolean} willEditorRestart` &ndash; When `true`, it means that the editor component will restart itself.

The editor event callbacks (`onChange`, `onBlur`, `onFocus`) receive two arguments:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:core/editor/editor~Editor `Editor`} instance.

## Context feature

The [`@ckeditor/ckeditor5-react`](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) package provides a ready-to-use component for the {@link features/context-and-collaboration-features context feature} that is useful when used together with some {@link features/collaboration CKEditor 5 collaboration features}.

```jsx
// This sample assumes that the application is using a CKEditor 5 editor built from source.
import React, { Component } from 'react';
import { CKEditor, CKEditorContext } from '@ckeditor/ckeditor5-react';

import Context from '@ckeditor/ckeditor5-core/src/context';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

class App extends Component {
	render() {
		return (
			<div className="App">
				<CKEditorContext context={ Context }>
					<h2>Using the CKeditor 5 context feature in React</h2>
					<CKEditor
						editor={ ClassicEditor }
						config={ {
							plugins: [ Paragraph, Bold, Italic, Essentials ],
							toolbar: [ 'bold', 'italic' ]
						} }
						data="<p>Hello from the first editor working with the context!</p>"
						onReady={ editor => {
							// You can store the "editor" and use when it is needed.
							console.log( 'Editor1 is ready to use!', editor );
						} }
					/>

					<CKEditor
						editor={ ClassicEditor }
						config={ {
							plugins: [ Paragraph, Bold, Italic, Essentials ],
							toolbar: [ 'bold', 'italic' ]
						} }
						data="<p>Hello from the first editor working with the context!</p>"
						onReady={ editor => {
							// You can store the "editor" and use when it is needed.
							console.log( 'Editor1 is ready to use!', editor );
						} }
					/>
				</CKEditorContext>
			</div>
		);
	}
}

export default App;
```

### Context feature properties

The `CKEditorContext` component supports the following properties:

* `context` (required) &ndash; {@link module:core/context~Context The CKEditor 5 context class}.
* `config` &ndash; The CKEditor 5 context configuration.
* `isLayoutReady` &ndash; A property that delays the context creation when set to `false`. It creates the context and the editor children once it is `true` or unset. Useful when the CKEditor 5 annotations or a presence list are used.
* `id` &ndash; The context ID. When this property changes, the component restarts the context with its editor and reinitializes it based on the current configuration.
* `onReady` &ndash; A function called when the context is ready and all editors inside were initialized with the `context` instance. This callback is also called after the reinitialization of the component if an error has occurred.
* `onError` &ndash; A function called when the context has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details.
    Error details is an object that contains two properties:
    * `{String} phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
     * `{Boolean} willContextRestart` &ndash; When `true`, it means that the context component will restart itself.

<info-box>
	An example build that exposes both context and classic editor can be found in the [CKEditor 5 collaboration sample](https://github.com/ckeditor/ckeditor5-collaboration-samples/blob/master/real-time-collaboration-comments-outside-of-editor-for-react).
</info-box>

## Customizing the builds

The {@link installation/getting-started/predefined-builds CKEditor 5 builds} come ready to use, with a set of built-in plugins and a predefined configuration. While you can change the configuration easily by using the `config` property of the `<CKEditor>` component which allows you to change the {@link features/toolbar toolbar} or {@link installation/getting-started/configuration#removing-features remove some plugins}, in order to add more plugins you need to rebuild the editor.

There are three main ways to do that.

### Using the CKEditor 5 online builder

Create your own CKEditor 5 build with customized plugins, toolbar and language in five simple steps using our dedicated [online builder](https://ckeditor.com/ckeditor-5/online-builder/). It is a fast, intuitive tool that allows for customizing your editing experience with a set of plugins of your own choice. Read more about this option in the [Integrating a build from the online builder](#integrating-a-build-from-the-online-builder) section.

<info-box>
	If you want to use the [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/), make sure that the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html) is not selected. The React integration comes with the watchdog feature already integrated into the core.
</info-box>

### Customizing one of the predefined builds

This option requires making changes to a {@link installation/getting-started/quick-start-other#building-the-editor-from-source predefined build} of your choice. Much like in [the case of online builder](#integrating-a-build-from-the-online-builder), you then need to place the custom editor's folder next to `src/` directory and add it as a dependency using `yarn add file` command.

Read more about customising a predefined build in the {@link installation/plugins/installing-plugins Installing plugins} guide.

### Integrating the editor from source

In this approach, you will include a CKEditor 5 {@link installation/advanced/integrating-from-source-webpack built from source}, so you will choose the editor creator you want and the list of plugins, etc. It is more powerful and creates a tighter integration between your application and the WYSIWYG editor, however, it requires adjusting your `webpack.config.js` to CKEditor 5 needs.

Read more about this option in the [Integrating CKEditor 5 from source](#integrating-ckeditor-5-built-from-source) section.

### Using the document editor build

If you use the {@link framework/document-editor document (decoupled) editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}:

```jsx
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

class App extends Component {
	editor = null;

	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using a custom build - decoupled editor</h2>
				<CKEditor
					onReady={ editor => {
						console.log( 'Editor is ready to use!', editor );

						// Insert the toolbar before the editable area.
						editor.ui.getEditableElement().parentElement.insertBefore(
							editor.ui.view.toolbar.element,
							editor.ui.getEditableElement()
						);

						this.editor = editor;
					} }
					onError={ ( error, { willEditorRestart } ) => {
						// If the editor is restarted, the toolbar element will be created once again.
						// The `onReady` callback will be called again and the new toolbar will be added.
						// This is why you need to remove the older toolbar.
						if ( willEditorRestart ) {
							this.editor.ui.view.toolbar.element.remove();
						}
					} }
					onChange={ ( event, editor ) => console.log( { event, editor } ) }
					editor={ DecoupledEditor }
					data="<p>Hello from CKEditor 5's decoupled editor!</p>"
					config={ /* the editor configuration */ }
				/>
		);
	}
}

export default App;
```

### Using the editor with collaboration plugins

The easiest way to integrate {@link features/collaboration collaboration plugins} in a React application is to build the editor from source including the collaboration plugins together with the React application.

For such a scenario we provide a few ready-to-use integrations featuring collaborative editing in React applications:

* [CKEditor 5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-react)
* [CKEditor 5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-react)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

Note: These integrations are meant to be as simple as possible, so they do not use the Create React App CLI. However, you should have no problem starting from `CRA` after reading the sections below.

## Integrating a build from the online builder

This guide assumes that you have created a zip archive with the editor built using the [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

The directory with the editor's build cannot be placed inside the `src/` directory because Node could return an error:

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

Because of that, we recommend placing the directory next to the `src/` and `node_modules/` folders:

```
├── ckeditor5
│   ├── build
│   ├── sample
│   ├── src
│   ├── ...
│   ├── package.json
│   └── webpack.config.js
├── node_modules
├── public
├── src
├── ...
└── package.json
```

Then, add the package located in the `ckeditor5` directory as a dependency of your project:

```
yarn add file:./ckeditor5
```

Now, import the build in your application:

```jsx
import React, { Component } from 'react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { CKEditor } from '@ckeditor/ckeditor5-react'

const editorConfiguration = {
	toolbar: [ 'bold', 'italic' ]
};

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>Using CKEditor 5 from online builder in React</h2>
				<CKEditor
					editor={ Editor }
					config={ editorConfiguration }
					data="<p>Hello from CKEditor 5!</p>"
					onReady={ editor => {
						// You can store the "editor" and use when it is needed.
						console.log( 'Editor is ready to use!', editor );
					} }
					onChange={ ( event, editor ) => {
						const data = editor.getData();
						console.log( { event, editor, data } );
					} }
					onBlur={ ( event, editor ) => {
						console.log( 'Blur.', editor );
					} }
					onFocus={ ( event, editor ) => {
						console.log( 'Focus.', editor );
					} }
				/>
			</div>
		);
	}
}

export default App;
```

### The `JavaScript heap out of memory` error

When building the application for the production using the `yarn build` command, it may produce an error related to the memory available on the build machine:

```
<--- Last few GCs --->

[32550:0x110008000]    42721 ms: Scavenge (reduce) 4061.0 (4069.6) -> 4060.5 (4070.8) MB, 4.3 / 0.0 ms  (average mu = 0.358, current mu = 0.374) allocation failure
[32550:0x110008000]    42726 ms: Scavenge (reduce) 4061.2 (4069.8) -> 4060.6 (4071.3) MB, 4.0 / 0.0 ms  (average mu = 0.358, current mu = 0.374) allocation failure
[32550:0x110008000]    42730 ms: Scavenge (reduce) 4061.4 (4073.3) -> 4060.9 (4073.3) MB, 3.7 / 0.0 ms  (average mu = 0.358, current mu = 0.374) allocation failure

<--- JS stacktrace --->

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 1: 0x1012e4da5 node::Abort() (.cold.1) [/usr/local/bin/node]
```

This issue has not been fixed yet, however, there is a workaround for this. Increasing the available memory for Node.js using the `--max_old_space_size` modifier should resolve the problem.

```bash
node --max_old_space_size=4096 node_modules/.bin/react-scripts build
```

The memory limit can be set globally as well:

```bash
# Save it in the `.bash_profile` file to avoid typing it after rebooting the machine.
export NODE_OPTIONS="--max-old-space-size=4096"

yarn build
```

It can also be set on-demand, per command call:

```bash
NODE_OPTIONS="--max-old-space-size=4096" yarn build
```

## Integrating CKEditor 5 built from source

Integrating the rich text editor from source allows you to use the full power of the {@link framework/index CKEditor 5 Framework}.

### `create-react-app@3+`

This guide assumes that you are using the [Create React App CLI](https://github.com/facebook/create-react-app) as your boilerplate and it goes through adjusting it to fit CKEditor 5 needs. If you use your custom webpack setup, please read more about {@link installation/advanced/integrating-from-source-webpack including CKEditor 5 built from source}.

The configuration needs to be ejected to make it possible to customize the webpack configuration. In order to be able to build CKEditor 5 from source, you need to tell webpack how to handle CKEditor 5's SVG and CSS files (by adding loaders configuration). Additionally, you need to exclude the CKEditor 5 source from the existing loaders.

<info-box>
  You can see all the changes described below in this example project: [https://github.com/ckeditor/ckeditor5-react-example/](https://github.com/ckeditor/ckeditor5-react-example/).
</info-box>

Create a sample application using `create-react-app@3+` first:

```
npx create-react-app ckeditor5-react-example && cd ckeditor5-react-example
```

Now you can eject the configuration (you can find more information about ejecting [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject)):

```
yarn eject
```

#### Installing missing dependencies

Before you start modifying the webpack configuration, first install some CKEditor 5 dependencies that you will need:

```
yarn add \
	raw-loader@4 \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-theme-lark \
	@ckeditor/ckeditor5-react \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles
```

Please note that all packages (excluding `@ckeditor/ckeditor5-dev-*` and `@ckeditor/ckeditor5-react`) {@link installation/plugins/installing-plugins#requirements must have the same version as the base editor package}.

#### Modifying the webpack configuration

Once you ejected the configuration and installed dependencies, you can now edit the webpack configuration (`config/webpack.config.js`).

First, import an object that provides a utility for creating the configuration for PostCSS:

```js
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
```

Then, add two new elements to the exported object under the `module.rules` array (as new items of the `oneOf` array). These are SVG and CSS loaders required to handle the CKEditor 5 source:

```js
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
},
```

Now you need to exclude CSS files used by CKEditor 5 from the project's CSS loader.

First, find a loader that starts its definition with the following code: `test: cssRegex`. Then modify it:

```js
{
	test: cssRegex,
	exclude: [
		cssModuleRegex,
		/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
	],
	// (...)
}
```

Below it, you will find another loader that handles the CSS files. You need to disable it for CKEditor 5 CSS as well. Its definition starts with `test: cssModuleRegex`:

```js
{
	test: cssModuleRegex,
	exclude: [
		/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
	],
	// (...)
}
```

Finally, exclude CKEditor 5 SVG and CSS files from `file-loader`. Find the last item in the `module.rules` array which should be the `file-loader` configuration, and modify it so it looks like this:

```js
{
	loader: require.resolve( 'file-loader' ),
	options: {
		// Exclude `js` files to keep the "css" loader working as it injects
		// its runtime that would otherwise be processed through the "file" loader.
		// Also exclude `html` and `json` extensions so they get processed
		// by webpack's internal loaders.
		exclude: [
			/\.(js|mjs|jsx|ts|tsx)$/,
			/\.html$/,
			/\.json$/,
			/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
			/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/
		],
		name: 'static/media/[name].[hash:8].[ext]',
	}
}
```

Now, your setup with `create-react-app` is complete. You can also check how to configure Vite in the next section or move straight to [Using the editor from source](#using-the-editor-from-source).

### Vite

This guide assumes that you use `create-vite` as your boilerplate. To get started with Vite and React, run the command below.

```bash
# npm 6.x
npm create vite@latest ckeditor5-react-example --template react

# npm7+, extra double-dash is needed:
npm create vite@latest ckeditor5-react-example -- --template react
```

This command will install and execute `create-vite`, the official project scaffolding tool for Vite.

#### Installing necessary packages

Besides the CKEditor base and plugins, you need to install additional packages to use it from source with React and Vite: the Vite plugin, the official React component, and the default theme.

<info-box>
	Using the Vite plugin to build CKEditor 5 from the source in Vite is still in the experimental phase. We encourage you to test it and give us feedback. To read more about integration with Vite or its limitations, check the {@link installation/advanced/integrating-from-source-vite Integrating from source with Vite} guide.
</info-box>

Install necessary packages alongside the default theme using the following command.

```
npm install --save \
	@ckeditor/vite-plugin-ckeditor5 \
	@ckeditor/ckeditor5-react \
	@ckeditor/ckeditor5-theme-lark \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles
```

#### Configuring `vite.config.js`

Configuring CKEditor with React and Vite is simple. Modify the existing config by importing `ckeditor5` and adding it to the list of plugins.

```js
// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';

export default defineConfig( {
  plugins: [
    react(),
    ckeditor5( { theme: require.resolve( '@ckeditor/ckeditor5-theme-lark' ) } )
  ],
} )
```

The configuration slightly differs for ESM projects. If you try to start the dev server using the `npm run dev` command, you may encounter an error: `require.resolve is not a function`. In this case, you need some additional lines of code.

```js
// vite.config.js

import { createRequire } from 'node:module';
const require = createRequire( import.meta.url );
```

### Using the editor from source

Once your configuration is updated, you can use CKEditor 5 directly from source. Test it by editing `src/App.js`:

```jsx
import React, { Component } from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';

// NOTE: Use the editor from source (not a build)!
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

const editorConfiguration = {
	plugins: [ Essentials, Bold, Italic, Paragraph ],
	toolbar: [ 'bold', 'italic' ]
};

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>Using CKEditor 5 from source in React</h2>
				<CKEditor
					editor={ ClassicEditor }
					config={ editorConfiguration }
					data="<p>Hello from CKEditor 5!</p>"
					onReady={ editor => {
						// You can store the "editor" and use when it is needed.
						console.log( 'Editor is ready to use!', editor );
					} }
					onChange={ ( event, editor ) => {
						const data = editor.getData();
						console.log( { event, editor, data } );
					} }
					onBlur={ ( event, editor ) => {
						console.log( 'Blur.', editor );
					} }
					onFocus={ ( event, editor ) => {
						console.log( 'Focus.', editor );
					} }
				/>
			</div>
		);
	}
}

export default App;
```

Finally, you can see your application live:

```
yarn start
```

You can read more about using CKEditor 5 from source in the {@link installation/advanced/integrating-from-source-webpack Advanced setup guide}.

## Localization

CKEditor 5 supports {@link features/ui-language multiple UI languages}, and so does the official React component. Follow the instructions below to translate CKEditor 5 in your React application.

### Predefined builds

When using one of the {@link installation/getting-started/predefined-builds predefined builds} or the editor built by the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), you need to import the translations first:

**Official editor builds:**

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Import translations for the German language.
import '@ckeditor/ckeditor5-build-classic/build/translations/de';

// ...
```

**The editor build from the online builder:**

```js
import Editor from 'ckeditor5-custom-build/build/ckeditor';

// Import translations for the German language.
import 'ckeditor5-custom-build/build/translations/de';
```

Then, {@link installation/getting-started/configuration configure} the language of the editor in the component:

```jsx
<CKEditor
	config={ {
		// Use the German language for this editor.
		language: 'de',

		// ...
	} }
	editor={ ClassicEditor }
	data="<p>Hello from CKEditor 5!</p>"
/>
```

For more information, please refer to the {@link features/ui-language Setting the UI language} guide.

### CKEditor 5 built from source

Using the editor [built from source](#integrating-ckeditor-5-built-from-source) requires you to modify the webpack configuration. First, install the [official translations webpack plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) that allows localizing editor builds:

```
yarn add @ckeditor/ckeditor5-dev-translations --dev
```

Then, add the installed plugin to the webpack configuration:

```js
// webpack.config.js
'use strict';

// ...
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );

module.exports = {
	// ...

	plugins: [
		// ....

		new CKEditorTranslationsPlugin( {
			// The UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			language: 'de',
			addMainLanguageTranslationsToAllAssets: true
		} ),

		// ....
	],

	// ...
};
```

After building the application, CKEditor 5 will run with the UI translated into the specified language.

For more information, please refer to the {@link features/ui-language Setting the UI language} guide.

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).
