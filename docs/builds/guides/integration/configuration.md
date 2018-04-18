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
				{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ modelElement: 'heading1', viewElement: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ modelElement: 'heading2', viewElement: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		}
	} )
	.catch( error => {
		console.log( error );
	} );
```

As you can see, configurations are set by a simple JavaScript object passed to the `create()` method.

## Removing features

Builds come with all features included in the distribution package enabled by default. They are defined as plugins for CKEditor.

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
	Be careful when removing plugins from CKEditor builds using `config.removePlugins`. If removed plugins were providing toolbar buttons, the default toolbar configuration included in a build will become invalid. In such case you need to provide the updated toolbar configuration as in the example above.
</info-box>

### List of plugins

Each build has a number of plugins available. You can easily list all plugins available in your build:

```js
ClassicEditor.build.plugins.map( plugin => plugin.pluginName );
```

## Adding features

As CKEditor builds do not include all possible features, the only way to add more features to them is to {@link builds/guides/development/custom-builds create a custom build}.

## Toolbar setup

In builds that contain toolbars an optimal default configuration is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration.

Each editor may have a different toolbar configuration scheme, so it is recommended to check its documentation. In any case, the following example may give you a general idea:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'bold', 'italic', 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<info-box hint>
	The above is a strict UI-related configuration. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to also remove their respective plugins. Check [Removing features](#removing-features) above for more information.
</info-box>

### Listing available items

You can use the following snippet to retrieve all toolbar items available in your editor:

```js
Array.from( editor.ui.componentFactory.names() );
```

## Other configuration options

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options.

Some of the options may require loading plugins which are not available in the build you use. Read more about {@link builds/guides/development/custom-builds customizing builds}.
