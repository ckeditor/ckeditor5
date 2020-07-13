---
category: builds-integration
order: 50
---

# Installing plugins

---

## TODO

* Change the README in packaged downloaded from online builder. IT MUST BE PROOF-READ.
* Review installation.md, advanced-setup.md, overview.md, plugins.md, quick-start.md
* Link to this guide at the end of installation.md
* Add redirect from the old custom-builds.md to this guide.
* Remove custom-builds.md.
* Create a bootstrap task that could create all these files via `npx ckeditor5-bootstrap-build`.
* Make official builds and ones built with the online builder resemble each other as closely as possible.
* Check the READMEs of the official builds and the online builder.

---

While {@link builds/guides/integration/installation installing one of the existing builds} is a convenient way to start using CKEditor 5, soon you may want to do one of the following:

* installing additional plugins (official, 3rd party, or your custom ones) to add missing functionalities,
* removing unnecessary plugins in order to optimize the build size,
* {@link buiids/guides/integration/advanced-setup#option-using-two-different-editors creating a "super build"} containing more than one editor type,
* customizing any other aspect of the build ({@link features/ui-language#building-the-editor-using-a-specific-language changing the built-in UI language}, {@link builds/guides/integration/advanced-setup#option-extracting-css extracting styles to a separate file}).

To achieve any of this, you need to customize a build by changing its configuration and performing the build step.

This guide covers the simplest way to customize a build:

* [Using the online builder](#online-builder) &mdash; The online builder allows choosing the editor type, installing and removing plugins (only official plugins are available) as well as changing the built-in language. This option is recommended if you are new to the JavaScript build stack (npm, webpack) or JavaScript itself.
* [Customizing a build](#customizing-a-build) &mdash; The package created with the online builder can be further customized locally. This way, you can add 3rd party and custom plugins or change webpack configuration to tune various aspects of the build process (minification, CSS extraction, etc.).

<info-box>
	If you do not use existing builds because you {@link builds/guides/integration/advanced-setup#scenario-2-integrating-from-source integrated the editor from source}, in your case, installing plugins boils down to following the "Installation" section covered in each feature guide.

	You can also see the {@link builds/guides/integration/advanced-setup Advanced setup} guide that covers the build process in greater detail.
</info-box>

## Online builder

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

For security reasons, the online builder offers only the official plugins. Its UI does not allow creating "super builds" or customize webpack configuration. However, you can do that after downloading one of the builds.

The downloaded ZIP package contains:

* `build/` &mdash; a directory with a ready-to-use build (`build/ckeditor.js`) and translations.
* `sample/index.html` &mdash; a sample on which you can test the build.
* `src/ckeditor.js` &mdash; a source of the build that defines which editor and plugins should be included.
* `package.json` &mdash; definition of this build's dependencies (CKEditor 5 packages to install as well as build tools).
* `webpack.config.js` &mdash; webpack configuration.
* `README.md` and `LICENSE.md` with additional information.

A build created with the online builder is ready-to-use (the `build/` directory is populated). You can open the `sample/index.html` file in your browser to check its demo.

Changes like changing toolbar configuration or customizing plugin configurations can be done without rebuilding the editor. Open the `sample/index.html` file and edit the script that initializes the editor. Save the file and refresh the browser. Remember to clear browser cache.

If you want to make bigger changes to the build, read on to learn how to do that.

## Customizing a build

Installing plugins, implementing custom ones, changing webpack configuration require rebuilding the editor. Let's see how to do that.

We will start from rebuilding the editor without changing the configuration to see the process. Then, we will add a missing plugin and rebuild the editor again.

### Requirements

In order to start customizing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 8.0.0+
* npm 5.0.0+

### Step 1. Setting up

First, install dependencies (specified in `package.json`):

```
npm install
```

Now, you can rebuild the editor (located in `build/`):

```
npm run build
```

If no errors appeared, open the browser and refresh the sample (remember about clearing the browser cache). If everything works fine, you are ready to customize the editor build.

### Step 2. Installing a plugin

Let's assume that you want to install the {@link features/horizontal-line Horizontal line} feature. You can find the installation instructions for that feature in the {@link features/horizontal-line#installation "Installation"} section of its guide. It consists important information (package, plugin and toolbar button names) that you need to install this feature.

First, you need to install the [`@ckeditor/ckeditor5-horizontal-line`](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line):

```
npm install --save-dev @ckeditor/ckeditor5-horizontal-line
```

Now, you can change the build's configuration located in `src/ckeditor.js`. You need to import the plugin and add it to `Editor.builtinPlugins` array:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
// ...other plugins...
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';       // ADDED

class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	Autoformat,
	// ...other plugins...
	TextTransformation,
	HorizontalLine                                                                         // ADDED
];

export default Editor;
```

After saving the file, you need to rebuild the editor:

```
npm run build
```

The build is updated, however, you still have to add the button to the toolbar to see any changes.

To do that, edit `samples/index.html`:

```js
ClassicEditor
	.create( document.querySelector( '.editor' ), {
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
				'horizontalLine',          // ADDED
				'imageUpload',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			]
		},
		// ...
```

Save the file and refresh the sample in your browser. You should now see the horizontal line button in the toolbar.

Congratulations 🎉 You successfully created your first custom build.

## What's next?

Adding a plugin is just one of many possible customizations. Moreover, in many cases, you do not need to create a build at all to integrate the editor into your application.

To learn more, follow to the {@link builds/guides/integration/advanced-setup Advanced setup} guide that covers, among many others:

* {@link builds/guides/integration/advanced-setup#creating-a-custom-build Creating a fully custom build} and incorporating it into your project.
* {@link builds/guides/integration/advanced-setup#scenario-2-integrating-from-source Integrating the editor directly from source} without creating a custom build.
