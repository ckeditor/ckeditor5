---
# Scope:
# * Introduction on how to set configurations.
# * Introduction on the top/must-know configurations.
# * Point where to find the list of configuration options.

title: Configuration
category: builds-integration
order: 30
---

When creating an editor in your page, it is possible to setup configurations that changes many of its aspects. For example:

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

As you can see, configurations are set by a simple JavaScript object passed to the editor creator class. It works in the same fashion when the create method is used instead.

## Enabling features

Builds come with all features included in the distribution package enabled by default. They’re defined as plugins for CKEditor.

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

<side-box tip>
	If a build contains too many or too few features, the best approach is creating a custom build instead of simply using configurations.
</side-box>

### List of plugins

Each build has a number of plugins available. You can easily list all plugins available in your build:

```js
ClassicEditor.build.plugins.map( plugin => plugin.pluginName );
```

## Toolbar setup

On builds that contain toolbars, an optimal default configuration is defined for it. You may need a different toolbar arrangement though and this can be achieved through configuration.

Each creator may have a different toolbar configuration scheme, so it is recommended to check the creator API documentation. In any case, the following example may give you a general idea of it:

```js
ClassicEditor
	.create( document.querySelector( '#text-editor' ), {
		toolbar: [ 'bold', 'italic', 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<side-box tip>
	The above is a strict UI related configuration. Removing a toolbar item don’t remove the feature from the editor internals. If you goal with the toolbar configuration is removing features, the right solution is removing their relative plugins. Check [Enabling features](#Enabling-features) above for more information.
</side-box>

<!-- TODO Add section about other configuration options. -->
