---
category: framework-guides
order: 20
---

# Quick start

This guide will show you how to initialize the editor from source and how to create a simple plugin.

## How to install the framework?

The framework is made of several [npm packages](https://npmjs.com). To install it you need:

* [Node.js](https://nodejs.org/en/) >= 6.0.0
* npm 4.x (**note:** using npm 5 [is not recommended](https://github.com/npm/npm/issues/16991))

Besides Node.js and npm you also need [webpack](https://webpack.js.org) (>=2.0.0) with a few additional packages to use the framework. They are needed to bundle the source code. Read more about building CKEditor 5 in the {@link builds/guides/integration/advanced-setup CKEditor 5 Builds Advanced setup} guide.

<!-- TODO replace the link above when the Framework will get its own building guide. -->

## Let's start!

This guide assumes that you are familiar with npm and your project uses npm already. If not, see the [npm documentation](https://docs.npmjs.com/getting-started/what-is-npm) or call `npm init` in an empty directory and keep your fingers crossed.

First, install packages needed to build CKEditor 5.

```bash
npm install --save \
	postcss-loader \
	raw-loader \
	style-loader \
	webpack
```

The minimal webpack configuration needed to enable building CKEditor 5 is:

```js
// webpack.config.js

'use strict';

const path = require( 'path' );
const { getPostCssConfig } = require( '@ckeditor/ckeditor5-dev-utils' ).styles;

module.exports = {
	// https://webpack.js.org/configuration/entry-context/
	entry: './app.js',

	// https://webpack.js.org/configuration/output/
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},

	module: {
		rules: [
			{
				// Or /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/ if you want to limit this loader
				// to CKEditor 5's icons only.
				test: /\.svg$/,

				use: [ 'raw-loader' ]
			},
			{
				// Or /ckeditor5-[^/]+\/theme\/[^/]+\.css$/ if you want to limit this loader
				// to CKEditor 5's theme only.
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							singleton: true
						}
					},
					{
						loader: 'postcss-loader',
						options: getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					},
				]
			}
		]
	},

	// Useful for debugging.
	devtool: 'source-map'
};
```

Now, you can install some of the CKEditor 5 Framework packages which will allow you initialize a simple editor. You can start with the {@link examples/builds/classic-editor classic editor} with a small set of features.

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-theme-lark
```

Based on these packages you can create a simple application.

<info-box>
	This guide is using the ES6 modules syntax. If you are not familiar with it, check out this [article](http://exploringjs.com/es6/ch_modules.html).
</info-box>

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

You can now run webpack to build the application. To do that, call the `webpack` executable:

```bash
./node_modules/.bin/webpack
```

<info-box>
	You can also install webpack globally (using `npm install -g`) and run it via a globally available `webpack`.

	Alternatively, you can add it as an [npm script](https://docs.npmjs.com/misc/scripts):

	```js
	"scripts": {
		"build": "webpack"
	}
	```

	And use it via:

	```bash
	npm run build
	```

	npm adds `./node_modules/.bin/` to the `PATH` automatically, so in this case you do not need to install webpack globally.
</info-box>

If everything worked correctly, you should see:

```
p@m /workspace/quick-start> ./node_modules/.bin/webpack
Hash: 3973724171776d324f0c
Version: webpack 3.6.0
Time: 3322ms
        Asset     Size  Chunks                    Chunk Names
    bundle.js  1.93 MB       0  [emitted]  [big]  main
bundle.js.map   2.2 MB       0  [emitted]         main
 [143] (webpack)/buildin/harmony-module.js 596 bytes {0} [built]
 [249] ./app.js 546 bytes {0} [built]
 [269] (webpack)/buildin/global.js 509 bytes {0} [built]
    + 456 hidden modules
```

Finally, it is time to create an HTML page:

```html
<div id="editor">
	<p>Editor content goes here.</p>
</div>

<script src="dist/bundle.js"></script>
```

Open this page in your browser and you should see the editor up and running. Make sure to check the browser console in case anything seems wrong.

{@img assets/img/framework-quick-start-classic-editor.png 837 Screenshot of a classic editor with bold and italic features.}

## Creating a simple plugin

After you initilized the editor from source, you are ready to create your first CKEditor 5 plugin.

CKEditor plugins need to implement the {@link module:core/plugin~PluginInterface}. The easiest way to do that is to inherit from the {@link module:core/plugin~Plugin base `Plugin` class}, however, you can also write simple constructor functions. This guide uses the former method.

The plugin that you will write will use a part of the {@link features/image image feature} and will add a simple UI to it &mdash; an "Insert image" button, which will open a prompt window asking for the image URL when clicked. Submitting the URL will result in inserting the image into the content and selecting it.

### Step 1. Installing dependencies

Start from installing necessary dependencies:

* The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package that contains the image feature (on which the plugin will rely).
* The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package which contains the {@link module:core/plugin~Plugin} and {@link module:core/command~Command} classes.
* The [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) package which contains the editing engine.
* The [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package which contains the UI library and framework.

```bash
npm install --save @ckeditor/ckeditor5-image @ckeditor/ckeditor5-core @ckeditor/ckeditor5-engine
```

Now, open the `app.js` file and start adding code there. Usually, when implementing more complex features you will want to split the code into multiple files (modules). However, to make this guide simpler the entire code will be kept in `app.js`.

First thing to do will be to load the core of the image feature:

```js
import Image from '@ckeditor/ckeditor5-image/src/image';

// ...

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Add Image to the plugin list.
		plugins: [ Essentials, Paragraph, Bold, Italic, Image ],

		// ...
	} )
	// ...
```

Save the file and run webpack. Refresh the page in your browser (**remember about the cache**) and... you should not see any changes. Right! The core of the image feature does not come with any UI, nor have you added any image to the initial HTML. Change this now:

```html
<div id="editor">
	<p>Simple image:</p>

	<figure class="image">
		<img src="https://via.placeholder.com/1000x300/02c7cd/fff?text=Placeholder image" alt="CKEditor 5 rocks!">
	</figure>
</div>
```

{@img assets/img/framework-quick-start-classic-editor-with-image.png 837 Screenshot of a classic editor with bold, italic and image features.}

<info-box>
	Running webpack with the `-w` option will start it in the watch mode. This means that webpack will watch your files for changes and rebuild the application every time you save them.
</info-box>

### Step 2. Creating a plugin

You can now start implementing your new plugin. Create the `InsertImage` plugin:

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class InsertImage extends Plugin {
	init() {
		console.log( 'InsertImage was initialized' );
	}
}
```

And add your new plugin to the `config.plugins` array. After rebuilding the application and refreshing the page you should see "InsertImage was initialized" logged to the console.

<info-box hint>
	It was said that your `InsertImage` plugin relies on the image feature represented here by the `Image` plugin. You could add the `Image` plugin as a {@link module:core/plugin~PluginInterface#requires dependency} of your `InsertImage` plugin. This would make the editor initialize `Image` automatically before initializing `InsertImage`, so you would be able to remove `Image` from `config.plugins`.

	However, this means that your plugin would be coupled with the `Image` plugin. This is unnecessary &mdash; they do not need to know about each other. And while it does not change anything in this simple example, it is a good practice to keep plugins as decoupled as possible.
</info-box>

### Step 3. Registering a button

Create a button now:

```js
// This SVG file import will be handled by webpack's raw-text loader.
// This means that imageIcon will hold the source SVG.
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class InsertImage extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertImage', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				const imageURL = prompt( 'Image URL' );
			} );

			return view;
		} );
	}
}
```

And add `insertImage` to `config.toolbar`:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...

		toolbar: [ 'bold', 'italic', 'insertImage' ]
	} )
	// ...
```

Rebuild the application and refresh the page. You should see a new button in the toolbar. Clicking the button should open a prompt window asking you for the image URL.

### Step 4. Inserting a new image

```js
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

// ...

view.on( 'execute', () => {
	const imageUrl = prompt( 'Image URL' );

	editor.document.enqueueChanges( () => {
		const imageElement = new ModelElement( 'image', {
			src: imageUrl
		} );

		// Insert the image in the current selection location.
		editor.data.insertContent( imageElement, editor.document.selection );
	} );
} );
```

If you refresh the page, you should now be able to insert new images into the content:

{@img assets/img/framework-quick-start-classic-editor-insert-image.gif 640 Screencast of inserting a new image.}

The image is fully functional, you can undo inserting by pressing <kbd>Ctrl</kbd>+<kbd>Z</kbd> and the image is always inserted as a block element (the paragraph that contains the selection is automatically split). This is all handled by the CKEditor 5 engine.

<info-box>
	As you can see, by clicking the button you are inserting an `<image src="...">` element into the model. The image feature is represented in the model as `<image>`, while in the view (i.e. the virtual DOM) and in the real DOM it is rendered as `<figure class="image"><img src="..."></figure>`.

	The `<image>` to `<figure><img></figure>` transformation is called "conversion" and it requires a separate guide. However, as you can see in this example, it is a powerful mechanism because it allows non-1:1 mappings.
</info-box>

Congratulations! You have just created your first CKEditor 5 plugin!

### Bonus. Enabling image captions

Thanks to the fact that all plugins operate on the model and on the view and know as little about themselves as possible, you can easily enable image captions by simply loading the {@link module:image/imagecaption~ImageCaption} plugin:

```js
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';

// ...

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Add ImageCaption to the plugin list.
		plugins: [ Essentials, Paragraph, Bold, Italic, Image, InsertImage, ImageCaption ],

		// ...
	} )
	// ...
```

This should be the result of the change:

{@img assets/img/framework-quick-start-classic-editor-bonus.gif 640 Screencast of inserting a new image with a caption.}

### Final code

If you got lost at any point, this should be your final `app.js`:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

class InsertImage extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertImage', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true
			} );

			view.on( 'execute', () => {
				const imageUrl = prompt( 'Image URL' );

				editor.document.enqueueChanges( () => {
					const imageElement = new ModelElement( 'image', {
						src: imageUrl
					} );

					editor.data.insertContent( imageElement, editor.document.selection );
				} );
			} );

			return view;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Image, InsertImage, ImageCaption ],
		toolbar: [ 'bold', 'italic', 'insertImage' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

