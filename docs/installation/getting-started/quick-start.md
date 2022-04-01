---
# Scope:
# - Guidance on all possible installation options.

category: getting-started
order: 10
modified_at: 2022-03-15
---

# Quick start

## Introduction

CKEditor 5 can provide any WYSIWYG editor type. From online editors similar to Google Docs and Medium, to Slack or Twitter like applications, the CKEditor 5 editing framework provides solutions for every user, both customized and out-of-the-box. This modern JavaScript rich text editor with MVC architecture, custom data model and virtual DOM was written from scratch in ES6 with excellent webpack support.

In this guide, you will learn how to run your own CKEditor 5 instance. Below you can find two unique paths describing the installation process. Choose one (or both!) and start your CKEditor 5 journey!

Available paths:
* [Online builder path](#creating-custom-builds-with-online-builder) &ndash; The most beginners-friendly and quickest path.
* [Building from the source path](#building-the-editor-from-source) &ndash; An advanced path including using `npm` and webpack.

## Creating custom builds with online builder

Although the CKEditor 5 WYSIWYG editor comes with handy {@link installation/advanced/predefined-builds predefined builds}, sometimes these predefined bundled versions are not enough and a need for more customized  builds arises. Some of the reasons for creating custom builds are:

* Adding {@link installation/advanced/plugins plugin-driven features} which are not included in the existing builds.
* Removing unnecessary features present in a build.
* Designing a {@link installation/getting-started/configuration#toolbar-setup customized toolbar experience}.
* Changing the {@link installation/advanced/predefined-builds#available-builds editor type build}.
* Changing the {@link features/ui-language localization language} of the editor.

This is where the online builder comes to help you.

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) is an application that lets you design and download custom CKEditor 5 builds. It allows you to create your own bundles with your desired editor type, toolbar and set of plugins in a few easy steps, through a simple and intuitive UI.

### Choosing the editor type

The following editor types are currently available to choose from:

 * {@link installation/advanced/predefined-builds#classic-editor Classic editor}
 * {@link installation/advanced/predefined-builds#inline-editor Inline editor}
 * {@link installation/advanced/predefined-builds#balloon-editor Balloon editor}
 * {@link installation/advanced/predefined-builds#balloon-block-editor Balloon block editor}
 * {@link installation/advanced/predefined-builds#document-editor Document editor}

 Refer to the predefined builds documentation and {@link examples/index examples} to check what kind of WYSIWYG editor suits your needs best. Once you choose the desired editor type, select it to move to the next step.

 For the sake of clarity, this guide will use the classic build as an example.

 {@img assets/img/online-builder-01-editor-type-choice.png 778 Editor type selection.}

### Choosing plugins

The basic build comes with a predefined set of plugins grouped in a bar at the top of the page. Take a moment to check these options out. You can freely remove the ones that will not be used in your build.

{@img assets/img/online-builder-02-predefined-plugins.png 778 Predefined plugins. Feel free to remove unneeded ones.}

Below the top bar with preselected plugins you will find a large collection of features that can be added to the custom build. Choose the ones that best suit your needs.

{@img assets/img/online-builder-03-plugin-choice.png 778 Predefined plugins. Some of the plugins to choose from.}

<info-box hint>
	Note that some of the plugins require other plugins to work. These dependencies are mentioned in the **Requires plugins** section of the description box for each plugin. If this section is not present, the plugin does not need any other plugin to work.

	Some of these plugins are **premium features** which require an additional license to run. They are marked with an appropriate <span class="tree__item__badge tree__item__badge_premium"><span class="tree__item__badge__text">Premium feature</span></span> badge.
</info-box>

Once you have chosen all the desired plugins, press the **Next step** button on the top right.

### Toolbar composition

Next step allows you to compose the toolbar. A simple drag-and-drop workspace allows for adding buttons (representing the plugins chosen in the previous step) to the toolbar. You may also change the order of the buttons and dropdowns and group them accordingly. Note that online builder allows you to create a multiline toolbar layout, too &mdash; just drag any button below the already placed ones to create a new toolbar line.

{@img assets/img/online-builder-04-toolbar-configurator.gif 753 The toolbar drag-and-drop configurator.}

Some of the buttons are pre-placed on the layout and thus grayed out in the workspace with available toolbar items. If you want to remove any buttons from your toolbar setup, drag them back to the upper workspace.

Once you finish designing the toolbar, press the **Next step** button on the top right.

### Choosing the default language

Scroll the list of available languages and check the one you want to be the main language of your editor build.

{@img assets/img/online-builder-05-language-selection.png 367 Language selector list.}

<info-box hint>
	All other languages will still be available in the `translations` folder.
</info-box>

### Download the customized build

This is as simple as it gets: just press the **Start** button to download your customized package.

Refer to the *What's next?* note at the end of this page for further steps in your CKEditor 5 journey!

## Building the editor from source

This scenario allows you to fully control the building process of CKEditor 5. This means that you will not actually use the builds introduced in the previous path, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

This is an advanced path that assumes that you are familiar with npm and your project uses npm already. If not, see the [npm documentation](https://docs.npmjs.com/getting-started/what-is-npm) or call `npm init` in an empty directory and check the result.

### Setting up the environment

Before moving to the integration, you need to prepare three files that will be filled with code presented in this guide. Create the `webpack.config.js`, `app.js` and `index.html` files.

Then, install packages needed to build CKEditor 5:

```bash
npm install --save \
	css-loader@5 \
	postcss-loader@4 \
	raw-loader@4 \
	style-loader@2 \
	webpack@5 \
	webpack-cli@4
```

The minimal webpack configuration needed to enable building CKEditor 5 is:

```js
// webpack.config.js

'use strict';

const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	// https://webpack.js.org/configuration/entry-context/
	entry: './app.js',

	// https://webpack.js.org/configuration/output/
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},

	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,

				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,

				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	},

	// Useful for debugging.
	devtool: 'source-map',

	// By default webpack logs warnings if the bundle is bigger than 200kb.
	performance: { hints: false }
};
```

<info-box>
    If you cannot use the latest webpack (at the moment of writing this guide, it is 5), the provided configuration will also work with webpack 4.
</info-box>

### Creating an editor

You can now install some of the CKEditor 5 Framework packages which will allow you to initialize a simple rich-text editor. Keep in mind, however, that all packages (excluding `@ckeditor/ckeditor5-dev-*`) {@link installation/getting-started/installing-plugins#requirements must have the same version as the base editor package}.

You can start with the {@link examples/builds/classic-editor classic editor} with a small set of features.

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-theme-lark
```

Based on these packages you can create a simple application.

<info-box>
	This guide is using the ES6 modules syntax. If you are not familiar with it, check out [this article](http://exploringjs.com/es6/ch_modules.html).
</info-box>

<info-box warning>
	Note that in this guide, the editor class is used directly (i.e. you use `@ckeditor/ckeditor5-editor-classic` instead of `@ckeditor/ckeditor5-build-classic`).

	No {@link installation/advanced/predefined-builds predefined editor builds} are used, because adding new plugins to these requires rebuilding them anyway. This can be done by {@link installation/getting-started/installing-plugins customizing a build} or by including the CKEditor 5 source into your application (like in this guide).
</info-box>

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

You can now run webpack to build the application. To do that, call the `webpack` executable:

```bash
./node_modules/.bin/webpack --mode development
```

You can also install `webpack-cli` globally (using `npm install -g`) and run it via a globally available `webpack`.

Alternatively, you can add it as an [npm script](https://docs.npmjs.com/misc/scripts):

```js
"scripts": {
	"build": "webpack --mode development"
}
```

And use it with:

```bash
yarn run build
```

npm adds `./node_modules/.bin/` to the `PATH` automatically, so in this case you do not need to install `webpack-cli` globally.

<info-box>
	Use `webpack --mode production` if you want to build a minified and optimized application. Learn more about it in the [webpack documentation](https://webpack.js.org/concepts/mode/).

	**Note:** Prior to version 1.2.7, `uglifyjs-webpack-plugin` (the default minifier used by webpack) had a bug which caused webpack to crash with the following error: `TypeError: Assignment to constant variable`. If you experienced this error, make sure that your `node_modules` contain an up-to-date version of this package (and that webpack uses this version).

	**Note:** CKEditor 5 builds use [`Terser`](https://github.com/terser/terser) instead of `uglifyjs-webpack-plugin` because [the latter one seems to no longer be supported](https://github.com/ckeditor/ckeditor5/issues/1353).
</info-box>

If everything worked correctly, you should see:

```
p@m /workspace/quick-start> ./node_modules/.bin/webpack --mode development
Hash: c96beab038124d61568f
Version: webpack 5.58.1
Time: 3023ms
Built at: 2022-03-02 17:37:38
        Asset      Size  Chunks             Chunk Names
    bundle.js  2.45 MiB    main  [emitted]  main
bundle.js.map  2.39 MiB    main  [emitted]  main
[./app.js] 638 bytes {main} [built]
[./node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 489 bytes {main} [built]
[./node_modules/webpack/buildin/harmony-module.js] (webpack)/buildin/harmony-module.js 573 bytes {main} [built]
    + 491 hidden modules
```

### Running the editor

Finally, it is time to create an HTML page:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Quick start guide</title>
	</head>
	<body>
		<div id="editor">
			<p>The editor content goes here.</p>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```

Open this page in your browser and you should see the simple WYSIWYG editor up and running. Make sure to check the browser console in case anything seems wrong.

{@img assets/img/framework-quick-start-classic-editor.png 976 Screenshot of CKEditor 5 classic editor with bold and italic features.}

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

<info-box hint>
**What's next?**

Congratulations, you have just run your first CKEditor 5 instance! Now it is time to learn more about customization, so jump in straight to the {@link installation/getting-started/configuration Configuration guide}.

P.S. If you use Angular, React or Vue.js and want to integrate CKEditor 5 in your application, refer to the {@link installation/frameworks/overview Frameworks section}.
</info-box>
