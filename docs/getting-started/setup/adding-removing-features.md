---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: setup
menu-title: Managing features
meta-title: Adding and removing features | CKEditor 5 documentation
order: 15
---

# Managing features

## Adding features

All the features of CKEditor 5 all implemented by plugins. {@link framework/plugins/plugins Read more about the plugin concept}. To add more features you can {@link framework/plugins/installing-plugins install plugins} to custom builds and to editors integrated from the source.

## Removing features
<!-- not sure how to handle this for it to make sense still -->
The {@link getting-started/legacy-getting-started/predefined-builds predefined CKEditor 5 builds} come with all the features included in the distribution package enabled by default. They are defined as plugins for CKEditor 5.

In some cases, you may want to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in the editor at runtime.

In the example below, the `Heading` plugin is removed:

```js
// Remove a plugin from the default setup.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading' ],
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' , 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

You might want to delete the `Link` plugin also, as shown below:

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

However, using this snippet with the official classic build of CKEditor 5 will result in an error thrown in the console of the browser:

```
CKEditorError: plugincollection-required {"plugin":"Link","requiredBy":"CKFinder"}`
Read more: [https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required](https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required)
```
This is a good time to remind you that some plugins in CKEditor 5 depend on each other. In this case, the `CKFinder` plugin requires the `Link` plugin to work. To make the above snippet work, the `CKFinder` plugin must also be deleted:

```js
// Remove a few plugins from the default setup.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading', 'Link', 'CKFinder' ],
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<info-box>
	Be careful when removing plugins from CKEditor builds using {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}. If removed plugins were providing toolbar buttons, the default toolbar configuration included in a build will become invalid. In such a case, you need to provide the {@link getting-started/setup/toolbar updated toolbar configuration} as in the example above or by providing only toolbar items that need to be removed using `config.toolbar.removeItems`.
</info-box>
