---
category: getting-started
order: 90
---

# Extending features

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/api-and-events previous guide} you have explored events and API. This article shows how to extend and create features in the editor.

</info-box>

Editor has a lot of already built features. But there's always room for more! You can make use of the API exposed by the editor and its plugins and extend the editor using the {@link module:core/plugin~PluginInterface plugin interface} like this:

```js
function MyPlugin( editor ) {
	// Plugin code.
	// ...
}
```

or

```js
class MyPlugin {
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

This method allows writing simple, vanilla JS plugins that will be executed during the initialization of the editor, and don't need to interact with other plugin schema's or UI. To add a newly created plugin to an editor you need to use {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} property in configuration (or {@link module:core/editor/editorconfig~EditorConfig#extraPlugins `config.extraPlugins` for predefined builds}).

<info-box warning>

It is not possible to do everything with simple plugins as shown above.

**What's possible:**

* Reacting to plugins' events.
* Executing commands.
* Overwriting editor's conversion mechanism.

**What's not possible:**

* Adding new UI elements (e.g., a new button to a toolbar).
* Creation of widgets or new commands.

Creating advanced plugins often involves using classes like `Plugin` or the UI package, and requires a build step.

</info-box>

An example of a simple, dependency-free plugin that you may want to use this way is a {@link framework/deep-dive/upload-adapter custom upload adapter}.

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
		plugins: [ MyUploadAdapterPlugin ], /* Or extraPlugins in predefinded builds. */
		// More of the editor's configuration.
		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```

<info-box hint>
**What's next?**

Want to deepen your understanding of CKEditor 5? Dive into our {@link framework/abbreviation-plugin-tutorial/abbreviation-plugin-level-1 tutorial} to explore creating plugins hands-on.

</info-box>
