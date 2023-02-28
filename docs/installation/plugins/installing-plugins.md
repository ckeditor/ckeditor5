
---
menu-title: Installing plugins
category: plugins
order: 30
---

# Installing plugins

CKEditor 5 plugins, responsible for various features, are distributed through [npm](https://www.npmjs.com) packages and are implemented in a modular way, which means that a single plugin may consist of multiple JavaScript files. Don't hesitate and {@link features/index explore available CKEditor 5 features}, they are waiting to be installed!

In this guide you can learn how to add plugins to your editor in the two most common scenarios:

* When you use a {@link installation/getting-started/predefined-builds predefined editor build}.
* When you {@link framework/quick-start build your editor from source}.

<info-box hint>
	If you are looking for an easy way to create a custom build of CKEditor 5 without installing anything, check the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), which allows you to create a build with a custom set of plugins through a simple and intuitive UI.
</info-box>

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 14.0.0+
* npm 5.7.1+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)

<info-box warning>
	When installing CKEditor 5 Framework packages, you need to make sure their versions match the version of the base editor package. For example: if you would like to install the `@ckeditor/ckeditor5-alignment` package and your other packages are outdated, e.g. at version `18.0.0`, you should consider updating your editor and other packages to the latest version or install the alignment package at version `18.0.0`. Otherwise, this will result in [`ckeditor-duplicated-modules error`](https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-ckeditor-duplicated-modules).

	The simplest way to avoid such situations is to always use the latest versions of the official packages. If you already stumbled upon this error, you can use [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates), which is a handy tool for keeping your packages up to date.

	**NOTE:** The above rule rule does not apply to packages named `@ckeditor/ckeditor5-dev-*`.
</info-box>

## Adding a plugin to a build

Adding plugins to existing, predefined builds is done through their customization. {@link installation/getting-started/predefined-builds Predefined editor builds} are maintained in their respective GitHub repositories. Therefore, assuming that you want to customize the [classic editor build](https://npmjs.com/package/@ckeditor/ckeditor5-build-classic), you need to:

1. Clone the build repository.
2. Install the plugin package.
3. Add it to the build configuration.
4. Bundle the build.

```bash
git clone -b stable https://github.com/ckeditor/ckeditor5

cd ckeditor5/packages/ckeditor5-build-classic
npm install
```

Now, install the plugin package:

```bash
npm install --save-dev @ckeditor/ckeditor5-alignment
```

Edit the `src/ckeditor.js` file to add your plugin to the list of plugins which will be included in the build and to add your feature's button to the toolbar:

```js
// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';     // <--- ADDED

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Link,
	List,
	Paragraph,
	Alignment                                                            // <--- ADDED
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'alignment',                                                 // <--- ADDED
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'uploadImage',
			'blockQuote',
			'undo',
			'redo'
		]
	},
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
```

Finally, bundle the build:

```bash
yarn run build
```

If everything worked, the editor build (which is available in the `build/` directory) should be updated.

You can open the `sample/index.html` file in your browser to see whether the plugin was installed correctly.

This was a quick version of how a build can be customized. Read more about {@link installation/getting-started/quick-start-other customizing existing editor builds} in a separate guide.

## Adding a plugin to an editor

If you {@link framework/quick-start build the editor from source}, then the process of installing a new plugin boils down to these three steps:

1. Installing the plugin package.
2. Adding it to your editor's configuration.
3. Building your project.

For example, if you wish to install the text alignment feature:

```bash
npm install --save-dev @ckeditor/ckeditor5-alignment
```

Edit the code that initializes the editor:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';     // <--- ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Alignment ],     // <--- MODIFIED
		toolbar: [ 'bold', 'italic', 'alignment' ]                       // <--- MODIFIED
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
	.create( document.querySelector( '#editor' ), {
		// Look, ma! No plugins!
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

All this works because a typical `src/ckeditor.js` module that you can find in every editor build repository (see for example [`@ckeditor/ckeditor5-build-classic`](https://github.com/ckeditor/ckeditor5-build-classic/blob/stable/src/ckeditor.js)) looks like this:

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// Rest of the imports.
// ...

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	// Rest of plugins to include in the build.
	// ...
];

ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'bold',
			// Remaining toolbar items.
			// ...
		]
	},
	// Rest of classic editor configuration. 
	// ...
};
```

This code imports the source of the classic editor and extends it with a static `builtinPlugins` and `defaultConfig` properties where it defines a set of plugins and configuration to be used by this editor class.

In this approach, all editor instances created by using this editor build will by default load all these built-in plugins and configuration.

<info-box>
	You can still use the {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`} and {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} options to override the default configuration.
</info-box>

When building the editor from source and not using a build as a base, you can also use the static `builtinPlugins` and `defaultConfig` properties of editor classes. However, in this situation it is usually more convenient to simply pass all the plugins directly to the static `create()` method:

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

So, in short, both methods use very similar mechanisms. However, adding a plugin through the static `builtinPlugins` property (which happens in editor builds) lets you automatically enable it in all editor instances created using this editor class, while passing a plugin to `create()` will naturally affect only one instance.
