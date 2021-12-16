---
category: framework-plugins
order: 30
---

# Creating a simple plugin

This guide will show you how to create a simple rich-text editor plugin for CKEditor 5.

<info-box>
	Before you get to work, you should check out the {@link framework/guides/quick-start Quick start} guide first to set up the framework and building tools. Be sure to check out the {@link framework/guides/package-generator package generator guide} as well.
</info-box>

CKEditor plugins need to implement the {@link module:core/plugin~PluginInterface}. The easiest way to do that is to inherit from the {@link module:core/plugin~Plugin base `Plugin` class}. However, you can also write simple constructor functions. This guide uses the former method.

The plugin that you will write will use a part of the {@link features/images-overview image feature} and will add a simple UI to it &mdash; an "Insert image" button that will open a prompt window asking for the image URL when clicked. Submitting the URL will result in inserting the image into the content and selecting it.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

<info-box hint>
	For simplicity reasons this guide does not describe how to localize the created plugin. To see how to localize plugins, refer to the {@link framework/guides/deep-dive/localization localization guide}.
</info-box>

## Step 1. Installing dependencies

Start from installing the necessary dependencies:

* The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package that contains the image feature (on which the plugin will rely).
* The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package which contains the {@link module:core/plugin~Plugin} and {@link module:core/command~Command} classes.
* The [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package which contains the UI library and framework.

```
npm install --save @ckeditor/ckeditor5-image \
	@ckeditor/ckeditor5-core \
	@ckeditor/ckeditor5-ui
```

<info-box>
	Most of the time, you will also want to install the [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) package (it contains the {@link framework/guides/architecture/editing-engine editing engine}). It was omitted in this guide because it is unnecessary for a simple plugin like this one.
</info-box>

Now, open the `app.js` file and start adding code there. Usually, when implementing more complex features you will want to split the code into multiple files (modules). However, to make this guide simpler the entire code will be kept in `app.js`.

The first thing to do will be to load the core of the image feature:

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

Save the file and run webpack. Refresh the page in your browser (**remember about the cache**) and... you should not see any changes. This is correct! The core of the image feature does not come with any UI, nor have you added any image to the initial HTML. Change this now:

```html
<div id="editor">
	<p>Simple image:</p>

	<figure class="image">
		<img src="https://via.placeholder.com/1000x300/02c7cd/fff?text=Placeholder%20image" alt="CKEditor 5 rocks!">
	</figure>
</div>
```

{@img assets/img/framework-quick-start-classic-editor-with-image.png 837 Screenshot of a classic editor with bold, italic and image features.}

<info-box>
	Running webpack with the `-w` option will start it in the watch mode. This means that webpack will watch your files for changes and rebuild the application every time you save them.
</info-box>

## Step 2. Creating a plugin

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
	It was said that your `InsertImage` plugin relies on the image feature represented here by the `Image` plugin. You could add the `Image` plugin as a {@link module:core/plugin~PluginInterface#requires dependency} of the `InsertImage` plugin. This would make the editor initialize `Image` automatically before initializing `InsertImage`, so you would be able to remove `Image` from `config.plugins`.

	However, this means that your plugin would be coupled with the `Image` plugin. This is unnecessary &mdash; they do not need to know about each other. And while it does not change anything in this simple example, it is a good practice to keep plugins as decoupled as possible.
</info-box>

## Step 3. Registering a button

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

## Step 4. Inserting a new image

Now, expand the button's `#execute` event listener, so it will actually insert the new image into the content:

```js
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
				const imageUrl = prompt( 'Image URL' );

				editor.model.change( writer => {
					const imageElement = writer.createElement( 'imageBlock', {
						src: imageUrl
					} );

					// Insert the image in the current selection location.
					editor.model.insertContent( imageElement, editor.model.document.selection );
				} );
			} );

			return view;
		} );
	}
}
```

If you refresh the page, you should now be able to insert new images into the content:

{@img assets/img/framework-quick-start-classic-editor-insert-image.gif 640 Screencast of inserting a new image.}

The image is fully functional. You can undo inserting by pressing <kbd>Ctrl</kbd>+<kbd>Z</kbd> and the image is always inserted as a block element (the paragraph that contains the selection is automatically split). This is all handled by the CKEditor 5 engine.

<info-box>
	As you can see, by clicking the button you are inserting an `<imageBlock src="...">` element into the model. The image feature is represented in the model as `<imageBlock>`, while in the view (i.e. the virtual DOM) and in the real DOM it is rendered as `<figure class="image"><img src="..."></figure>`.

	The `<imageBlock>` to `<figure><img></figure>` transformation is called "conversion" and it requires a separate guide. However, as you can see in this example, it is a powerful mechanism because it allows non-1:1 mappings.
</info-box>

Congratulations! You have just created your first CKEditor 5 plugin!

## Bonus. Enabling image captions

Thanks to the fact that all plugins operate on the model and on the view, and know as little about themselves as possible, you can easily enable image captions by simply loading the {@link module:image/imagecaption~ImageCaption} plugin:

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

## Final code

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

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				const imageUrl = prompt( 'Image URL' );

				editor.model.change( writer => {
					const imageElement = writer.createElement( 'imageBlock', {
						src: imageUrl
					} );

					// Insert the image in the current selection location.
					editor.model.insertContent( imageElement, editor.model.document.selection );
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

## What's next?

If you would like to read more tutorials, check out the following one:

* {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget}
* {@link framework/guides/tutorials/implementing-an-inline-widget Implementing an inline widget}

If you want to read more about the CKEditor 5 architecture, check out the {@link framework/guides/architecture/intro Introduction to CKEditor 5 architecture} guide.

If you want your plugin to be easily integrated by other developers, learn about the {@link framework/guides/contributing/package-metadata package metadata file} that can be added to your package.
