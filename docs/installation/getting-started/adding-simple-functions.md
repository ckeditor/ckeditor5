---
category: getting-started
order: 90
---

# Adding simple functions

You can make use of the API exposed by the editor and its plugins and extend the editor using the {@link module:core/plugin~PluginInterface plugin interface} like this:

```js
function MyPlugin( editor ) {
	// Plugin code.
	// ...
}
```

or

```js
class MyPlugin extends Plugin {
	constructor( editor ) {
		// Constructor code.
		// ...
	}

	init() {
		// Initializations code.
		// ...
	}
}
```

This method allows writing simple plugins that will be executed during the initialization of the editor, and don't need to interact with other plugin schema's or UI. To add a newly created plugin to an editor you need to use {@link module:core/editor/editorconfig~EditorConfig#extraPlugins `config.extraPlugins`} property in configuration.

## Example

An example plugin that you may want to use this way is a {@link framework/deep-dive/upload-adapter custom upload adapter}.

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function MyUploadAdapterPlugin( editor ) {
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = function( loader ) {
		// Custom upload adapter.
		// ...
	};
}

// Load the custom upload adapter as a plugin of the editor.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		extraPlugins: [ MyUploadAdapterPlugin ],
		// More of the editor's configuration.
		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```
