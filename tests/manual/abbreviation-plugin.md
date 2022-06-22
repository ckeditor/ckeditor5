---
category: framework-plugins
order: 10
---

# Creating a simple plugin - abbreviation

This guide will show you how to create a simple rich-text editor plugin for CKEditor 5.

<info-box>
	Before you get to work, you should check out the {@link framework/guides/quick-start Quick start} guide first to set up the framework and building tools. Be sure to check out the {@link framework/guides/package-generator package generator guide} as well.
</info-box>

CKEditor plugins need to implement the {@link module:core/plugin~PluginInterface}. The easiest way to do that is to inherit from the {@link module:core/plugin~Plugin base `Plugin` class}. However, you can also write simple constructor functions. This guide uses the former method.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
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

<info-box>
	Running webpack with the `-w` option will start it in the watch mode. This means that webpack will watch your files for changes and rebuild the application every time you save them.
</info-box>

## Step 2. Demo

{@snippet framework/abbreviation-plugin}

