
menu-title: Installing plugins
category: builds-development
order: 30
---

# Installing plugins

CKEditor 5 plugins are distributed through [npm](https://www.npmjs.com) packages and are implemented in a modular way, which means that a single plugin may consist of multiple JavaScript files.

In this guide you can learn how to add plugins to your editor in the two most common scenarios:

* When you use an {@link builds/guides/overview editor build},
* When you {@link framework/guides/quick-start build your editor from source}.

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) >= 6.0.0
* npm 4.x (**note:** using npm 5 [causes](https://github.com/lerna/lerna/issues/938) some [problems](https://github.com/npm/npm/issues/16991))

## Adding a plugin to a build

Adding plugins to existing builds is done through their customization. Editor builds are maintained in their respective GitHub repositories. Therefore, assuming that you want to customize the [classic editor build](https://npmjs.com/package/@ckeditor/ckeditor5-build-classic) you need to:

1. Clone the build repository.
2. Install the plugin package.
3. Add it to the build configuration.
4. Bundle the build.

```
git clone -b stable https://github.com/ckeditor/ckeditor5-build-classic.git
cd ckeditor5-build-classic
npm install
```

Now, install the plugin package:

```
npm install --save-dev @ckeditor/ckeditor5-alignment
```

Edit the `build-config.js` file to add your plugin to the list of plugins which will be included in the build and to add your feature's button to the toolbar:

```
module.exports = {
	// The editor creator to use.
	editor: '@ckeditor/ckeditor5-editor-classic/src/classiceditor',

	// The name under which the editor will be exported.
	moduleName: 'ClassicEditor',

	// Plugins to include in the build.
	plugins: [
		'@ckeditor/ckeditor5-essentials/src/essentials',

		'@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter',
		'@ckeditor/ckeditor5-autoformat/src/autoformat',
		'@ckeditor/ckeditor5-basic-styles/src/bold',
		'@ckeditor/ckeditor5-basic-styles/src/italic',
		'@ckeditor/ckeditor5-block-quote/src/blockquote',
		'@ckeditor/ckeditor5-easy-image/src/easyimage',
		'@ckeditor/ckeditor5-heading/src/heading',
		'@ckeditor/ckeditor5-image/src/image',
		'@ckeditor/ckeditor5-image/src/imagecaption',
		'@ckeditor/ckeditor5-image/src/imagestyle',
		'@ckeditor/ckeditor5-image/src/imagetoolbar',
		'@ckeditor/ckeditor5-link/src/link',
		'@ckeditor/ckeditor5-list/src/list',
		'@ckeditor/ckeditor5-paragraph/src/paragraph',
		'@ckeditor/ckeditor5-upload/src/imageupload',

		'@ckeditor/ckeditor5-alignment/src/alignment', //    <--- ADDED
	],

	// Editor config.
	config: {
		toolbar: {
			items: [
				'heading',
				'alignment', //                      <--- ADDED
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

		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},

		// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
		language: 'en'
	}
};
```

Finally, bundle the build:

```
npm run build
```

If everything worked, the editor build (which is available in the `build/` directory) should be updated.

You can open the `sample/index.html` file in your browser to see whether the plugin was installed correctly.

This was a quick version of how a build can be customized. Read more about {@link builds/guides/development/custom-builds customizing existing editor builds} in a separate guide.

## Adding a plugin to an editor

If you {@link framework/guides/quick-start build the editor from source}, then the process of installing a new plugin boils down to these three steps:

1. Installing the plugin package.
2. Adding it to your editor's configuration.
3. Building your project.

For example, if you wish to install the text alignment feature:

```
npm install --save-dev @ckeditor/ckeditor5-alignment
```

Edit the code that initializes the editor:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment'; //   <--- ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Alignment ], //   <--- MODIFIED
		toolbar: [ 'bold', 'italic', 'alignment' ] //             <--- MODIFIED
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

After rebuilding your project, the new feature will be available in the editor.

<info-box warning>
	One of the possible mistakes is trying to add a plugin in this way to an existing (bundled) editor build. Installing an existing build and then trying to add a plugin to it may not work if that plugin needs to import any of the source editor modules.

	The reason why this method will not work is that dependencies of the added plugin may duplicate the code already bundled in the used editor build. In the best scenario, this is going to raise the overall code size. In the worst scenario, an application built this way may be unstable.
</info-box>

## Difference between both methods

What is the difference between adding a plugin to an editor build and adding a plugin by passing the `config.plugins` option to the static `create()` method?

The first method builds the plugin into the editor class. This means that you can then initialize the editor without passing `config.plugins` at all and the editor will automatically enable all built-in plugins:

```js
// Assuming you use e.g. webpack which can load UMD modules by using ES6 syntax.
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

ClassicEditor
	.create( document.querySelector( 'editor' ), {
		// Look, ma! No plugins!
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

All this works because a typical `src/ckeditor.js` module that you can find in every editor build repository (see e.g. [`@ckeditor/ckeditor5-build-classic`](https://github.com/ckeditor/ckeditor5-build-classic/blob/stable/src/ckeditor.js)), which is created based on the `build-config.js` file and based on which a build is created, looks like this:

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadadapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// ...

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.build = {
	plugins: [
		EssentialsPlugin,
		UploadadapterPlugin,
		AutoformatPlugin,
		BoldPlugin,
		ItalicPlugin,
		BlockquotePlugin,
		// ...
	],
	config: {
		toolbar: {
			items: [
				'heading',
				'bold',
				// ...
			]
		},
		// ...
	}
};
```

This code imports the source of the classic editor and extends it with a static property `build` in which it defines a set of plugins and configuration to be used by this editor class.

In this approach, all editor instances created by using this editor build will by default load all these built-in plugins and configuration.

<info-box>
	You can still use the {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`} and {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} options to override the default configuration.
</info-box>

When building the editor from source and not using a build as a base, you can also use the static `build` property of editor classes. However, in this situation it is usually more convenient to simply pass all the plugins directly to the static `create()` method:

```js
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

So, in short, both methods use very similar mechanisms. However, adding a plugin through the static `build` property (which happens in editor builds) lets you automatically enable it in all editor instances created using this editor class, while passing a plugin to `create()` will naturally affect only one instance.
