---
# Scope:
# * Introduction on how to set configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

title: Configuration
category: builds-integration
order: 30
---

When creating an editor in your page, it is possible to set up configurations that change many of its aspects. For example:

```js
ClassicEditor
	.create( document.querySelector( '#text-editor' ), {
		toolbar: [ 'bold', 'link' ],
		removePlugins: [ 'ImageToolbar', 'ImageStyle' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

As you can see, configurations are set by a simple JavaScript object passed to the editor creator class. It works in the same way when the `create()` method is used instead.

## Enabling features

Builds come with all features included in the distribution package enabled by default. They are defined as plugins for CKEditor.

In some cases, you may need to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in an editor at runtime. The following are a few examples:

```js
// Remove a few plugins from the default setup.
ClassicEditor
	.create( document.querySelector( '#text-editor' ), {
		removePlugins: [ 'Heading', 'Link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

```js
// Define the full list of plugins to enable.
ClassicEditor
	.create( document.querySelector( '#text-editor' ), {
		plugins: [ 'Paragraph', 'Heading', 'Bold', 'Link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<info-box hint>
	If a build contains too many or too few features, the best approach is to create a custom build instead of simply using configurations.
</info-box>

### List of plugins

Each build has a number of plugins available. You can easily list all plugins available in your build:

```js
ClassicEditor.build.plugins.map( plugin => plugin.pluginName );
```

## Toolbar setup

In builds that contain toolbars an optimal default configuration is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration.

Each creator may have a different toolbar configuration scheme, so it is recommended to check the creator API documentation. In any case, the following example may give you a general idea:

```js
ClassicEditor
	.create( document.querySelector( '#text-editor' ), {
		toolbar: [ 'bold', 'italic', 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<info-box hint>
	The above is a strict UI-related configuration. Removing a toolbar item does not remove the feature from the editor internals. If your goal with the toolbar configuration is to remove features, the right solution is to remove their relative plugins. Check [Enabling features](#Enabling-features) above for more information.
</info-box>

## Other configuration options

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options.

Some of the options may require loading plugins which are not available in the build you use. Read more about {@linkTODO builds/guides/development/custom-builds.md customizing builds}.
