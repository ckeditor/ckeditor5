---
menu-title: DLL
category: builds-guides
---

# CKEditor 5 DLL builds

CKEditor 5 can be integrated into the application using DLL compatible builds. A DLL builds uses [DLL webpack plugin](https://webpack.js.org/plugins/dll-plugin/) to provide a CKEditor 5 base DLL and set of [DLL consumer plugins](https://webpack.js.org/plugins/dll-plugin/#dllreferenceplugin). In contrary to the approach of {@link builds/guides/development/custom-builds creating custom builds}, when using DLL builds you don't have to build everything from sources. To use CKEditor 5 base DLL and editor features you need to add proper `<scritp>` tags to the page.

A minimal example of an editor using `ClassicEditor` build is presented below:

```html

<html>
<head>
	<title>Example CKEditor 5 DLL page</title>
</head>
<body>
<div id="editor"></div>

<!-- This adds the CKEditor5_DLL in the global scope, so it is possible to reference its contents -->
<script src="/path/to/ckeditor5-dll.js"></script>

<!-- Those are stripped-down editors with Essentials plugins loaded from a DLL, exposed on CKEditor global -->
<script src="/path/to/dll-classic.js"></script>

<!-- Editor features as DLL consumer builds exposed as CKEditor5[FeatureName] -->
<script src="/path/to/dll-basic-styles.js"></script>

<script>
	// Use ClassicEditor and BasicStyles from the CKEditor 5 global object.
	const { ClassicEditor, BasicStyles } = CKEditor5;
	const { Bold, Italic } = BasicStyles;

	const config = {
		// All required essentials plugins are bundled into the editor.
		extraPlugins: [ Bold, Italic ],
		toolbar: [
			'bold',
			'italic',
			'|',
			'undo',
			'redo'
		]
	};

	// ClassicEditor is exposed by the ckeditor5-dll-classic:
	ClassicEditor.create( document.querySelector( '#editor' ), config )
			.then( editor => {
				window.editor = editor;

				CKEditorInspector.attach( { 'dll-classic': editor } );
			} );
</script>
</body>
</html>
```

<info-box>
	The DLL builds bundles full plugins code even if not used by the editor. To create a size-optimized file use a {@link builds/guides/development/custom-builds creating custom build}.
</info-box>

## DLL packages anatomy

To use DLL compatible editor you need to use base DLL build, an DLL-consumer editor build and DLL-consumer editor features builds for every package.

### Base DLL bundle

The base `ckeditor5-dll` build bundles:

* Core editor plugins:
	* `ckeditor5-engine`
	* `ckeditor5-core`
	* `ckeditor5-ui`
	* `ckeditor5-utils`
* The essential plugins:
	* `ckeditor5-enter`
	* `ckeditor5-paragraph`
	* `ckeditor5-select-all`
	* `ckeditor5-typing`
	* `ckeditor5-undo`
	* `ckeditor5-widget`
* Other, frequently required plugins:
	* `ckeditor5-upload`

### The editor bundles

Each editor DLL-consumer builds have a limited set of bundled features that are required for a base editing experience:

```js
const builtinPlugins = [
	Clipboard,
	Enter,
	Paragraph,
	SelectAll,
	ShiftEnter,
	Typing,
	Undo
];
```

<info-box>
	The DLL-consumer editor builds differ from standard editor builds and do not bundle any other feature.
</info-box>

### The editor features bundles

As explained above, the editor dll build contains only bare minimum set of plugins required to provide plain-text editing. To add other features, like bold, table, or image you need to add them to the editor configuration and attach their `<script>` tags to the webpage.

Every package is build as `dll-feature-name.js` in their npm repository.

An example classic editor build configuration using dll bundles:

```html
<!-- This adds the CKEditor5_DLL in the global scope, so it is possible to reference its contents -->
<script src="/path/to/ckeditor5-dll.js"></script>

<!-- Those are stripped-down editors with Essentials plugins loaded from a DLL, exposed on CKEditor global -->
<script src="/path/to/dll-classic.js"></script>

<!-- Editor features as DLL consumer builds exposed as CKEditor5[FeatureName] -->
<script src="/path/to/dll-adapter-ckfinder.js"></script>
<script src="/path/to/dll-autoformat.js"></script>
<script src="/path/to/dll-basic-styles.js"></script>
<script src="/path/to/dll-block-quote.js"></script>
<script src="/path/to/dll-ckfinder.js"></script>
<script src="/path/to/dll-easy-image.js"></script>
<script src="/path/to/dll-heading.js"></script>
<script src="/path/to/dll-image.js"></script>
<script src="/path/to/dll-indent.js"></script>
<script src="/path/to/dll-link.js"></script>
<script src="/path/to/dll-list.js"></script>
<script src="/path/to/dll-media-embed.js"></script>
<script src="/path/to/dll-paste-from-office.js"></script>
<script src="/path/to/dll-table.js"></script>

<script>
	// Use ClassicEditor and BasicStyles from the CKEditor 5 global object.
	const {
		ClassicEditor, Autoformat, BasicStyles, CKFinder, BlockQuote, EasyImage,
		Heading, Image, Indent, Link, List, Table, MediaEmbed, PasteFromOffice
	} = CKEditor5;

	const config = {
		// All required essentials plugins are bundled into the editor.
		extraPlugins: [
			BasicStyles.Bold,
			BasicStyles.Italic
			CKFinder.UploadAdapter,
			Autoformat.Autoformat,
			BasicStyles.Bold,
			BasicStyles.Italic,
			BlockQuote.BlockQuote,
			CKFinder.CKFinder,
			EasyImage.EasyImage,
			Heading.Heading,
			Image.Image,
			Image.ImageCaption,
			Image.ImageStyle,
			Image.ImageToolbar,
			Image.ImageUpload,
			Indent.Indent,
			Link.Link,
			List.List,
			MediaEmbed.MediaEmbed,
			PasteFromOffice.PasteFromOffice,
			Table.Table,
			Table.TableToolbar
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'indent',
				'outdent',
				'|',
				'imageUpload',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			]
		},
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};

	// ClassicEditor is exposed by the ckeditor5-dll-classic:
	ClassicEditor.create( document.querySelector( '#editor' ), config )
			.then( editor => {
				window.editor = editor;

				CKEditorInspector.attach( { 'dll-classic': editor } );
			} );
</script>
```

## DLL developer guide

The CKEditor 5 DLL build can be used to add plugins to existing editor build in two ways:

1. Using webpack to create a DLL consumer plugin.
2. Using DLL directly from a script.

### Creating DLL consumer plugins

To create a DLL consumer plugin using webpack you need to use provide DLL manifest in your build:

```js

const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	mode: 'development',
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	entry: {
		path: path.resolve( __dirname, 'src/dllconsumerplugin.js' )
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'dll-consumer-plugin.js',
		library: 'DLLConsumerPlugin',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	plugins: [
		new webpack.DllReferencePlugin( {
			manifest: require( 'node_modules/ckeditor5/build/ckeditor5-dll.manifest.json' ),
			scope: 'ckeditor5/src'
		} )
	]
};
```

In the above example webpack config we use [`DLLReferencePlugin`](https://webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) to tell the bundler that all packages from `ckeditor5/src` will be loaded during the run-time using the `window.CKEditor5.DLL`. Every imported dependecy from base CKEditor 5 DLL should be loaded from `ckeditor5` package:

```js
import { Plugin, Command } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

class ACommand extends Command {
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			model.insertContent( writer.createText( 'The cake is a lie!' ) );
		} );
	}
}

class DLLConsumerPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.commands.add( 'a-command', new ACommand( editor ) );

		editor.ui.componentFactory.add( 'a-button', locale => {
			const button = new ButtonView( locale );

			const command = editor.commands.get( 'a-command' );

			button.set( {
				withText: true,
				icon: false,
				label: 'Click me!'
			} );

			button.bind( 'isEnabled' ).to( command );

			button.on( 'execute', () => editor.execute( 'a-command' ) );

			return button;
		} );
	}
}

export default DLLConsumerPlugin;
```

After building your plugin using webpack, you can then use it together with the editor DLL build:

```html
<!-- This adds the CKEditor5_DLL in the global scope, so it is possible to reference its contents -->
<script src="./node_modules/ckeditor5/build/ckeditor5-dll.js"></script>

<!-- Those are stripped-down editors with Essentials plugins loaded from a DLL, exposed on CKEditor global -->
<script src="./node_modules/@ckeditor/ckeditor5-dll-classic/build/dll-classic.js"></script>

<!-- Editor features as DLL consumer builds exposed as CKEditor5[FeatureName] -->
<script src="./node_modules/@ckeditor/ckeditor5-basic-styles/build/basic-styles.js"></script>

<!-- Finally, this is a end-user plugin that uses DLL -->
<script src="./build/dll-consumer-plugin.js"></script>

<script>
	// Import Bold, Italic from the CKEditor 5 global.
	const { ClassicEditor, BasicStyles } = CKEditor5;
	const { Bold, Italic } = BasicStyles;

	const config = {
		extraPlugins: [
			Bold,
			Italic,
			DLLConsumerPlugin // exposed by the dll-consumer-plugin.js
		],
		toolbar: [
			'bold',
			'italic',
			'|',
			'htmlEmbed',
			'|',
			'a-button',
			'|',
			'undo',
			'redo'
		]
	};

	// ClassicEditor is exposed by the ckeditor5-dll-classic:
	ClassicEditor.create( document.querySelector( '#editor-classic' ), config )
		.then( editor => {
			window.editor = editor;

			CKEditorInspector.attach( { 'dll-classic': editor } );
		} );

</script>
```

### Using DLL directly from a script.

The code bundled in the DLL can be used directly in a `<script>` tag:

```html
<!-- This adds the CKEditor5_DLL in the global scope, so it is possible to reference its contents -->
<script src="./node_modules/ckeditor5/build/ckeditor5-dll.js"></script>

<!-- Those are stripped-down editors with Essentials plugins loaded from a DLL, exposed on CKEditor global -->
<script src="./node_modules/@ckeditor/ckeditor5-dll-classic/build/dll-classic.js"></script>

<!-- Editor features as DLL consumer builds exposed as CKEditor5[FeatureName] -->
<script src="./node_modules/@ckeditor/ckeditor5-basic-styles/build/basic-styles.js"></script>

<!-- Finally, this is a end-user plugin that uses DLL -->
<script src="./build/dll-consumer-plugin.js"></script>

<script>
	// Import Bold, Italic from the CKEditor 5 global.
	const { ClassicEditor, BasicStyles } = CKEditor5;
	const { Bold, Italic } = BasicStyles;

	const { Plugin, Command } = CKEditor5.DLL( './src/core.js' );
	const { ButtonView } = CKEditor5.DLL( './src/core.js' );

	class ACommand extends Command {
		execute() {
			const model = this.editor.model;

			model.change( writer => {
				model.insertContent( writer.createText( 'The cake is a lie!' ) );
			} );
		}
	}

	class DLLConsumerPlugin extends Plugin {
		constructor( editor ) {
			super( editor );

			editor.commands.add( 'a-command', new ACommand( editor ) );

			editor.ui.componentFactory.add( 'a-button', locale => {
				const button = new ButtonView( locale );

				const command = editor.commands.get( 'a-command' );

				button.set( {
					withText: true,
					icon: false,
					label: 'Click me!'
				} );

				button.bind( 'isEnabled' ).to( command );

				button.on( 'execute', () => editor.execute( 'a-command' ) );

				return button;
			} );
		}
	}

	const config = {
		extraPlugins: [
			Bold,
			Italic,
			DLLConsumerPlugin
		],
		toolbar: [
			'bold',
			'italic',
			'|',
			'htmlEmbed',
			'|',
			'a-button',
			'|',
			'undo',
			'redo'
		]
	};

	// ClassicEditor is exposed by the ckeditor5-dll-classic:
	ClassicEditor.create( document.querySelector( '#editor-classic' ), config )
		.then( editor => {
			window.editor = editor;

			CKEditorInspector.attach( { 'dll-classic': editor } );
		} );

</script>
```

## Building DLL and writing for DLLs

To allow simultaneous development of standard and DLL builds you need to follow the below rules:

1. You are allowed to import only from base DLL packages listed in [Base DLL bundle](#base-dll-bundle) using `ckeditor5` package.
   For instance, import public API from the `ckeditor5` package:
   ```js
   import { Plugin } from 'ckeditor5/core';
   ```
   Do not import by a full path:
   ```js
   import { Plugin } from '@ckeditor5-core/src/plugin';
   ```
2. Do not import anything from other packages.
   Imports from other packages are disallowed. Their API should be provided on the editor plugin:
   Do not:
   ```js
   import { doBar } from '@ckeditor/ckeditor5-foo-bar/src/utils/bar';

   doBar();
   ```
   Do instead:
   ```js
   editor.plugins.get( 'Foo' ).doBar();
   ```
