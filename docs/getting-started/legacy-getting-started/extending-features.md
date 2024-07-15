---
category: installation-methods
menu-title: (Legacy) Extending features
meta-title: Extending features | Legacy CKEditor 5 documentation
order: 90
---

# (Legacy) Extending features

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you are looking for current CKEditor 5 installation instructions, please refer to the newest version of the {@link getting-started/setup/configuration Configuring features} guide.
</info-box>

The editor has a lot of ready-made features. However, there is always room for more! You can make use of the API exposed by the editor and its plugins, and extend the editor using the {@link module:core/plugin~PluginInterface plugin interface} like this:

```js
// It can be a function:
function MyPlugin( editor ) {
	// Plugin code.
	// ...
}

// Or a class:
class MyPlugin {
	constructor( editor ) {
		// Constructor code.
		// ...
	}

	init() {
		// Initialization code.
		// ...
	}
}

// Added later to the plugins' list:
ClassicEditor.create( document.querySelector( '#editor' ), {
	// If you are using builds, this is going to be the "extraPlugins" property.
	plugins: [
		MyPlugin,
		// Other plugins.
		// ...
	]
} );
```

This method allows writing simple JavaScript plugins that will be executed during the initialization of the editor, and do not need to interact with other plugin schemas or UI. To add a newly created plugin to an editor, you need to use the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} property in the configuration (or {@link module:core/editor/editorconfig~EditorConfig#extraPlugins `config.extraPlugins` for predefined builds}).

<info-box warning>

It is not possible to do everything with simple plugins as shown above.

**Simple plugins capabilities:**

* Reacting to main editor's events.
* Overwriting editor's conversion mechanism.

**Standard plugins capabilities:**

* Adding new UI elements (for example, a new button to a toolbar).
* Creation of widgets or new commands.
* Depending on other plugins' or commands' behaviors.

Creating more {@link framework/architecture/core-editor-architecture#plugins advanced plugins} often involves using classes like `Plugin` or the UI package, and requires a build step.

</info-box>

A focus listener could be an example of a simple, dependency-free plugin:

```js
function ReactOnFocusChange( editor ) {
	// Add a listener on the focus change.
	editor.editing.view.document.on(
		'change:isFocused',
		( evt, data, isFocused ) => {
			if ( isFocused ) {
				// Implement your logic what should happen
				// when the editor is focused.
			}
		}
	);
}

// Load it as a plugin of the editor.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ReactOnFocusChange ], /* Or extraPlugins in predefined builds. */
		// More of the editor's configuration.
		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```
