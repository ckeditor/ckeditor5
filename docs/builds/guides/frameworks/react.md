---
menu-title: React component
category: builds-integration-frameworks
order: 30
---

# Rich text editor component for React

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-react)

CKEditor 5 consists of {@link builds/guides/overview ready-to-use editor builds} and {@link framework/guides/overview CKEditor 5 Framework} upon which the builds are based.

The easiest way to use CKEditor 5 in your React application is by choosing one of the {@link builds/guides/overview#available-builds rich text editor builds}. Additionally, it is also possible to integrate [CKEditor 5 built from source](#integrating-ckeditor-5-built-from-source) into your application.

## Quick start

Install the [CKEditor 5 WYSIWYG editor component for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) and the {@link builds/guides/overview#available-builds editor build of your choice}.

Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
```

Use the `<CKEditor>` component inside your project:

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>Using CKEditor 5 build in React</h2>
				<CKEditor
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor 5!</p>"
					onInit={ editor => {
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

### Component properties

The `<CKEditor>` component supports the following properties:

* `editor` (required) &ndash; The {@link module:core/editor/editor~Editor `Editor`} constructor to use.
* `data` &ndash; The initial data for the created editor. See the {@link builds/guides/integration/basic-api#interacting-with-the-editor Basic API} guide.
* `config` &ndash; The editor configuration. See the {@link builds/guides/integration/configuration Configuration} guide.
* `onInit` &ndash; A function called when the editor was initialized. It receives the initialized {@link module:core/editor/editor~Editor `editor`} as a parameter.
* `disabled` &ndash; A Boolean value. The {@link module:core/editor/editor~Editor `editor`} is being switched to read-only mode if the property is set to `true`.
* `onChange` &ndash; A function called when the editor data has changed. See the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
* `onBlur` &ndash; A function called when the editor was blurred. See the {@link module:engine/view/document~Document#event:blur `editor.editing.view.document#blur`} event.
* `onFocus` &ndash; A function called when the editor was focused. See the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
* `onError` &ndash; A function called when the editor has crashed during the initialization. It receives the error object as a parameter.

The editor events callbacks (`onChange`, `onBlur`, `onFocus`) receive two parameters:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:core/editor/editor~Editor `Editor`} instance.

### Customizing the builds

{@link builds/guides/overview CKEditor 5 builds} come ready to use, with a set of built-in plugins and a predefined configuration. While you can change the configuration easily by using the `config` property of the `<CKEditor>` component which allows you to change the {@link builds/guides/integration/configuration#toolbar-setup toolbar} or {@link builds/guides/integration/configuration#removing-features remove some plugins}, in order to add plugins you need to rebuild the editor.

There are two main ways to do that.

* {@link builds/guides/development/custom-builds Customize one of the existing builds}.

	This option does not require any changes in your project's configuration. You will create a new build somewhere next to your project and include it like you included one of the existing builds. Therefore, it is the easiest way to add missing features. Read more about this method in {@link builds/guides/integration/installing-plugins Installing plugins}.
* {@link builds/guides/integration/advanced-setup Integrate the editor from source}.

	In this approach you will include CKEditor 5 built from source &mdash; so you will choose the editor creator you want and the list of plugins, etc. It is more powerful and creates a tighter integration between your application and the WYSIWYG editor, however, it requires adjusting your `webpack.config.js` to CKEditor 5 needs.

	Read more about this option in [Integrating CKEditor 5 from source](#integrating-ckeditor-5-built-from-source).

### Building for production

If you still work with `create-react-app@1` or use a custom configuration for you application that still uses `webpack@3`, you will need to adjust the `UglifyJsPlugin` option to make CKEditor 5 compatible with this setup. CKEditor 5 builds use ES6 so the default JavaScript minifier of `webpack@3` and `create-react-app@1` is not able to digest them.

To do that, you need to first [eject the configuration](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject) from the setup created via `create-react-app` (assuming that you use it):

```bash
npm run eject
```

Then, you can customize `UglifyJsPlugin` options in the webpack configuration. Read how to do this [here](#changes-required-in-webpacks-production-configuration).

### Using the Document editor build

If you use the {@link framework/guides/document-editor Document editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}:

```jsx
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using a custom build - DecoupledEditor</h2>
				<CKEditor
					onInit={ editor => {
						console.log( 'Editor is ready to use!', editor );

						// Insert the toolbar before the editable area.
						editor.ui.getEditableElement().parentElement.insertBefore(
							editor.ui.view.toolbar.element,
							editor.ui.getEditableElement()
						);
					} }
					onChange={ ( event, editor ) => console.log( { event, editor } ) }
					editor={ DecoupledEditor }
					data="<p>Hello from CKEditor 5's DecoupledEditor!</p>"
					config={ /* the editor configuration */ }
				/>
		);
	}
}

export default App;
```

### Using the editor with collaboration plugins

The easiest way to integrate [collaboration plugins](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/collaboration.html) in a React application is to build the editor from source including collaboration plugins together with the React application.

For such scenario we provide a few ready-to-use integrations featuring collaborative editing in React applications:

- [CKEditor 5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-react)

- [CKEditor 5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-react)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

Note: These integrations are meant to be as simple as possible, so they do not use Create React App CLI. However, you should have no problem starting from `CRA` after reading the sections below.

## Integrating CKEditor 5 built from source

Integrating the rich text editor from source allows you to use the full power of {@link framework/guides/overview CKEditor 5 Framework}.

This guide assumes that you are using [Create React App CLI](https://github.com/facebook/create-react-app) as your boilerplate and it goes through adjusting it to fit CKEditor 5 needs. If you use your custom webpack setup, please read more about {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source including CKEditor 5 built from source}.

### Using `create-react-app@2+`

The configuration needs to be ejected to make it possible to customize the webpack configuration. In order to be able to build CKEditor 5 from source, you need to tell webpack how to handle CKEditor 5's SVG and CSS files (by adding loaders configuration). Additionally, you need to exclude the CKEditor 5 source from existing loaders.

<info-box>
  You can see all the changes described below in this example project: https://github.com/ckeditor/ckeditor5-react-example/commits/master.
</info-box>

Create a sample application using `create-react-app@2+` first:

```bash
npx create-react-app ckeditor5-react-example && cd ckeditor5-react-example
```

Now you can eject the configuration (you can find more information about ejecting [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject)):

```bash
yarn eject

# For some strange reasons this is needed, too
# (https://github.com/facebook/create-react-app/issues/6099).
yarn add @babel/plugin-transform-react-jsx @babel/plugin-transform-react-jsx-self
```

#### Installing missing dependencies

Before you start modifying the webpack configuration, first install some CKEditor 5 dependencies that you will need:

<info-box>
  Create React App uses `style-loader` in version `0.23.1` which might cause issues during a building process. To avoid it, it is recommended to bump the version manually to `1.0.0` which is used in CKEditor 5 packages.
</info-box>

```bash
yarn add \
	raw-loader@3 \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-theme-lark \
	@ckeditor/ckeditor5-react \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles
```

#### Modifying webpack configuration

Once you ejected the configuration and installed dependencies, you can now edit the webpack configuration (`config/webpack.config.js`).

First, import an object that creates the configuration for PostCSS:

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
				injectType: 'singletonStyleTag'
			}
		},
		{
			loader: 'postcss-loader',
			options: styles.getPostCssConfig( {
				themeImporter: {
					themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
				},
				minify: true
			} )
		}
	]
},
```

Now you need to exclude CSS files used by CKEditor 5 from the project's CSS loader.

First, find a loader that starts its definition with the following code: `test: cssRegex` and modify it:

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

Below it, you will find another loader that handles CSS files. You need to disable it for CKEditor 5 CSS as well. Its definition starts with `test: cssModuleRegex`:

```js
{
	test: cssModuleRegex,
	exclude: [
		/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
	],
	// (...)
}
```

Finally, exclude CKEditor 5 SVG and CSS files from `file-loader` . Find the last item in the `module.rules` array which should be the `file-loader` configuration, and modify it so it looks like this:

```js
{
	loader: require.resolve( 'file-loader' ),
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
	options: {
		name: 'static/media/[name].[hash:8].[ext]',
	}
}
```

#### Using CKEditor 5 source

Once your configuration is updated, you can now use CKEditor 5 directly from source. Test it by editing `src/App.js`:

```jsx
import React, { Component } from 'react';

import CKEditor from '@ckeditor/ckeditor5-react';

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
					onInit={ editor => {
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

You can read more about using CKEditor 5 from source in the {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source Advanced setup guide}.

### Using `create-react-app@1`

Install React CLI:

```bash
npm install -g create-react-app@^1.0.0
```

Create your project using the CLI and go to the project's directory:

```bash
create-react-app ckeditor5-react-example && cd ckeditor5-react-example
```

Now you can eject the configuration:

```bash
npm run eject
```

The configuration needs to be ejected to make it possible to customize the webpack configuration. To be able to build CKEditor 5 from source you must load inline SVG images and handle CKEditor 5's CSS as well as correctly minify the ES6 source.

<info-box>
	You can find more information about ejecting [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject).
</info-box>

#### Changes required in webpack's production configuration

At this stage, if you tried to build your application with CKEditor 5 source included, you would get the following error:

```bash
Failed to minify the code from this file:                                              [31/75]
        <project_root>/node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js:5:2077
```

UglifyJS exported by `webpack@3` cannot parse code written in ES6. You need to manually replace it with `uglifyjs-webpack-plugin`. **These changes touch the `webpack.config.prod.js` file only.**

After ejecting, this file is placed in `<project_root>/config/webpack.config.prod.js`. You need to make the following changes:

1. Install `uglifyjs-webpack-plugin`:

	```bash
	npm install --save-dev uglifyjs-webpack-plugin
	```

2. Load the installed package (at the top of the `webpack.config.prod.js` file):

	```js
	const UglifyJsWebpackPlugin = require( 'uglifyjs-webpack-plugin' );
	```

3. Replace the `webpack.optimize.UglifyJsPlugin` with `UglifyJsWebpackPlugin`:

	```diff
	- new webpack.optimize.UglifyJsPlugin
	+ new UglifyJsWebpackPlugin
	```

4. Options: `compress`, `mangle` and `output` cannot be passed directly to `UglifyJsWebpackPlugin`. You need to wrap these options in `uglifyOptions: { ... }`.

In the end, the entire plugin definition should look as follows:

```js
// Minify the code.
new UglifyJsWebpackPlugin( {
	uglifyOptions: {
		compress: {
			warnings: false,
			// Disabled because of an issue with Uglify breaking seemingly valid code:
			// https://github.com/facebookincubator/create-react-app/issues/2376
			// Pending further investigation:
			// https://github.com/mishoo/UglifyJS2/issues/2011
			comparisons: false,
		},
		mangle: {
			safari10: true,
		},
		output: {
			comments: false,
			// Turned on because emoji and regex is not minified properly using default
			// https://github.com/facebookincubator/create-react-app/issues/2488
			ascii_only: true,
		},
	},
	sourceMap: shouldUseSourceMap,
} )
```

#### Changes required in both webpack configurations

In order to build your application properly, you need to modify your webpack configuration files. After ejecting they are located at:

```bash
<project_root>/config/webpack.config.dev.js
<project_root>/config/webpack.config.prod.js
```

You need to modify the webpack configuration to load CKEditor 5 SVG icons properly.

First, import an object that creates the configuration for PostCSS:

```js
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
```

Then add two new elements to the exported object under the `module.rules` array (as new items for the `oneOf` array). These are SVG and CSS loaders only for CKEditor 5 code:

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
				injectType: 'singletonStyleTag'
			}
		},
		{
			loader: 'postcss-loader',
			options: styles.getPostCssConfig( {
				themeImporter: {
					themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
				},
				minify: true
			} )
		}
	]
},
```

Exclude CSS files used by CKEditor 5 from project's CSS loader:

```js
{
	test: /\.css$/,
	exclude: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
	// (...)
}
```

And exclude CKEditor 5 SVG and CSS files from `file-loader` because these files will be handled by the loaders added previously (usually the last item in the `module.rules` array is the `file-loader`) so it looks like this:

```js
{
	loader: require.resolve( 'file-loader' ),
	// Exclude `js` files to keep the "css" loader working as it injects
	// its runtime that would otherwise be processed through the "file" loader.
	// Also exclude `html` and `json` extensions so they get processed
	// by webpack's internal loaders.
	exclude: [
		/\.(js|jsx|mjs)$/,
		/\.html$/,
		/\.json$/,
		/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
		/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/
	],
	options: {
		name: 'static/media/[name].[hash:8].[ext]'
	}
}
```

**Remember that the changes above should be done in both configuration files.**

Next, install `raw-loader`, the theme for CKEditor 5, and CKEditor 5 development utilities:

```bash
npm install --save-dev raw-loader @ckeditor/ckeditor5-theme-lark @ckeditor/ckeditor5-dev-utils
```

Finally, install the component, the specific editor and plugins you want to use:

```bash
npm install --save \
	@ckeditor/ckeditor5-react \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-paragraph
```

#### Using CKEditor 5 source

Now you can use the `<CKEditor>` component together with {@link framework/guides/overview CKEditor 5 Framework}:

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>Using CKEditor 5 Framework in React</h2>
				<CKEditor
					onInit={ editor => console.log( 'Editor is ready to use!', editor ) }
					onChange={ ( event, editor ) => console.log( { event, editor } ) }
					config={ {
						plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
						toolbar: [ 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo', ]
					} }
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor 5!</p>"
				/>
			</div>
		);
	}
}

export default App;
```

## Localization

CKEditor 5 supports {@link features/ui-language multiple UI languages}, and so does the official React component. Follow the instructions below to translate CKEditor 5 in your React application.

### Ready-to-use builds

When using one of the {@link builds/guides/overview#available-builds official editor builds}, you need to import the translations first:

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Import translations for the German language.
import '@ckeditor/ckeditor5-build-classic/build/translations/de';

// ...
```

Then, {@link builds/guides/integration/configuration configure} the language of the editor in the component:

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

Using the editor [built from source](#integrating-ckeditor-5-built-from-source) requires you to modify the webpack configuration. First, install the [official webpack plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) that allows localizing editor builds:

```bash
npm install @ckeditor/ckeditor5-dev-webpack-plugin --save-dev
```

Then, add the installed plugin to the webpack configuration:

<info-box>
	We assume that you use `create-react-app@2`. For earlier versions, make sure to modify [both webpack configuration files](#changes-required-in-webpacks-production-configuration).
</info-box>

```js
// webpack.config.js
'use strict';

// ...
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );

module.exports = {
	// ...

	plugins: [
		// ....

		new CKEditorWebpackPlugin( {
			// The UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			language: 'de'
		} ),

		// ....
	],

	// ...
};
```

After building the application, CKEditor 5 will run with the UI translated to the specified language.

For more information, please refer to the {@link features/ui-language "Setting UI language"} guide.

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in https://github.com/ckeditor/ckeditor5-react.
