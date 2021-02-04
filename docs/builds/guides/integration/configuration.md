---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: builds-integration
order: 30
---

# Configuration

When creating an editor in your page, it is possible to set up {@link module:core/editor/editorconfig~EditorConfig configurations} that change many of its aspects. For example:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		}
	} )
	.catch( error => {
		console.log( error );
	} );
```

As you can see, configurations are set by a simple JavaScript object passed to the `create()` method.

## Removing features

The official builds come with all the features included in the distribution package enabled by default. They are defined as plugins for CKEditor.

In some cases, you may need to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in the editor at runtime.

In the example below `Heading` and `Link` plugins are removed:

```js
// Remove a few plugins from the default setup.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading', 'Link' ],
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```
<info-box>
	Be careful when removing plugins from CKEditor builds using `config.removePlugins`. If removed plugins were providing toolbar buttons, the default toolbar configuration included in a build will become invalid. In such case you need to provide the {@link features/toolbar updated toolbar configuration} as in the example above or by providing only items that need to be removed using `config.toolbar.removeItems`.
</info-box>

### List of plugins

Each build has a number of plugins available. You can easily list all plugins available in your build:

```js
ClassicEditor.builtinPlugins.map( plugin => plugin.pluginName );
```

## Adding features

### Adding complex features

As CKEditor builds do not include all possible features, the only way to add more features to them is to {@link builds/guides/development/custom-builds create a custom build}.

### Adding simple (standalone) features

There is an exception to every rule. Although it is impossible to add plugins that have dependencies to {@link api/core `@ckeditor/ckeditor5-core`} or {@link api/engine `@ckeditor/ckeditor5-engine`} (that includes nearly all existing official plugins) without rebuilding the build, it is still possible to add simple, **dependency-free** plugins.

You can do that using the {@link module:core/editor/editorconfig~EditorConfig#extraPlugins `config.extraPlugins`} configuration. The {@link module:core/plugin~PluginInterface plugin interface} allows plugins to be simple functions and you can define them in just a few lines, for instance:

```js
function MyPlugin( editor ) {
	// ...
}
```

or

```js
class MyPlugin {
	constructor( editor ) {
		// ...
	}

	init() {
		// ...
	}
}
```

An example plugin that you may want to add this way is a {@link framework/guides/deep-dive/upload-adapter custom upload adapter}.

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function MyUploadAdapterPlugin( editor ) {
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = function( loader ) {
		// ...
	};
}

// Load the custom upload adapter as a plugin of the editor.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		extraPlugins: [ MyUploadAdapterPlugin ],

		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```

## Toolbar setup

In the builds that contain toolbars an optimal default configuration is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration. Check the detailed {@link features/toolbar toolbar feature guide} for the available options.

## Other configuration options

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options.

Some of the options may require loading plugins which are not available in the build you use. Read more about {@link builds/guides/development/custom-builds customizing builds}.
