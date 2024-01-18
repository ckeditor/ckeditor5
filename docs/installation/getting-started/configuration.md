---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: getting-started
meta-title: Configuration | CKEditor 5 documentation
order: 40
---

# Configuration

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/quick-start-other previous guide} you have learned about various ways to set up CKEditor&nbsp;5 in the project. Now, you know how to use the online builder or create the editor from the source. It is time to play a bit with the configuration!
</info-box>

When creating an editor on your page, it is possible to set up {@link module:core/editor/editorconfig~EditorConfig configurations} that change many of its aspects. For example:

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

As you can see, the configuration is set by a simple JavaScript object passed to the `create()` method.

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options.

Some of the options may require loading plugins that are not available in the build you use. Return to the {@link installation/getting-started/quick-start-other Customized installation} guide for instructions on creating a custom build.

## Toolbar setup

In the builds that contain toolbars, an optimal default configuration is defined for it. You may need a different toolbar arrangement, though, and this can be achieved through configuration. Check the detailed {@link features/toolbar toolbar feature guide} for the available options.

When you create a {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder custom build using CKEditor 5 online builder}, setting up your toolbar configuration is one of the steps in the build creation process that uses an intuitive drag and drop interface.

## Adding features

All the features of CKEditor 5 all implemented by plugins. {@link installation/plugins/plugins Read more about the plugin concept.}

### List of plugins

Each build has some plugins available. You can easily list all plugins available in your build:

```js
ClassicEditor.builtinPlugins.map( plugin => plugin.pluginName );
```

### Installing plugins

Predefined CKEditor 5 builds do not include all possible features. To add more features you can {@link installation/plugins/installing-plugins install plugins} to custom builds and to editors integrated from the source.

## Removing features

The {@link installation/getting-started/predefined-builds predefined CKEditor 5 builds} come with all the features included in the distribution package enabled by default. They are defined as plugins for CKEditor 5.

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
	Be careful when removing plugins from CKEditor builds using {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}. If removed plugins were providing toolbar buttons, the default toolbar configuration included in a build will become invalid. In such a case, you need to provide the {@link features/toolbar updated toolbar configuration} as in the example above or by providing only toolbar items that need to be removed using `config.toolbar.removeItems`.
</info-box>

<info-box hint>
**What's next**

You have learned how to configure your own CKEditor 5 instance. Awesome! Learn more about CKEditor 5 by moving on to {@link installation/getting-started/editor-lifecycle the editor's lifecycle guide}!

If you would like to integrate your CKEditor 5 installation with the Angular, React, and Vue.js JavaScript frameworks, {@link installation/integrations/overview we have dedicated guides for that}.
</info-box>
