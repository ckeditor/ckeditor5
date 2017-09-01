---
title: Theme customization
category: framework-guides-ui
order: 10
---

The [`@ckeditor/ckeditor5-theme-lark`](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) is the default theme of CKEditor 5. Lark is modular, [BEM–friendly](https://en.bem.info/methodology/css/) and built in [SASS](http://sass-lang.com).

Although it has been designed with versatility and the most common editor use–cases in mind, some integrations may require adjustments to make it match the style guidelines of the ecosystem. This kind of customization can be done in two different ways, which can also be used together if needed:
 * by building the editor with a set of custom SASS variables and overriding [defaults](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#Variable_Defaults___default), which does not change the size of the build,
 * by importing an extra `.scss` file and overriding the CSS rules, which increases the size of the build.

You can see the demo of an editor with the dark theme as a result of customizations described later in this guide:

{@snippet examples/theme-lark}

## Styles processing and bundling

CKEditor 5 is bundled using [webpack](https://webpack.js.org/) and it handles the importing and processing of the styles using the [loaders](https://webpack.js.org/concepts/loaders/). Its configuration can be found in the `webpack.config.js` file.

<info-box info>
	To learn more about building CKEditor, check out the {@link builds/guides/development/custom-builds official guide}.
</info-box>

The entire process of building and managing the styles boils down to three steps:

1. **Collecting**: Each JavaScript file in the project can import multiple `.scss` files using the ES6 [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) directive. Imported files are handled by the [CSS Loader](https://www.npmjs.com/package/css-loader).

   ```js
   import '../theme/theme.scss';

   class AnyEditorClass {
   	...
   }
   ```

   ```scss
   // Contents of theme.scss.
   $color: red;

   .ck-editor {
   	color: $color;
   }
   ```

2. **Compiling**: The [SASS Loader](https://www.npmjs.com/package/sass-loader) compiles `.scss` files from SASS to CSS. Each file is compiled asynchronously, in a separate SASS thread.

   ```scss
   .ck-editor {
   	color: $color; --> color: red;
   }
   ```

3. **Loading**: Finally the [Style loader](https://www.npmjs.com/package/style-loader) loads the output CSS along with the `ckeditor.js` file into a `<style>` element in the `<head>` section of the web page.
   ```html
   <head>
   	<style type="text/css">
   		.ck-editor {
   			color: red;
   		}
   	</style>
   </head>
   ```

## Customization with SASS variables

Having {@link builds/guides/development/custom-builds#Forking-an-existing-build cloned} an existing build of CKEditor for a quick start, let's take a look on the specific definitions in the `webpack.config.js`.

```js
module: {
	rules: [
		...
		{
			test: /\.scss$/,
			use: [
				'style-loader',
				'css-loader',
				'sass-loader'
			]
		}
	]
}
```

Each single SASS file is compiled in a separate thread, so to override default variables (defined with `!default`) across the theme, new values must be imported/declared at the very beginning of **each single** SASS file's compilation process. SASS Loader offers the [`data`](https://www.npmjs.com/package/sass-loader#environment-variables) option to do this.


Let's [`@import`](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#_import__import) a `custom.scss` file located in the root of the repository containing all custom variables.

```js
use: [
	'style-loader',
	'css-loader',
	{
		loader: 'sass-loader',
		options: {
			data: `@import 'custom.scss';`
		}
	}
]
```

Using the full potential of the SASS variables, the customization will make the theme dark, with slightly bigger text and more rounded corners.

<info-box hint>
	Check out the [colors helper](https://github.com/ckeditor/ckeditor5-theme-lark/blob/master/theme/helpers/_colors.scss) for the full list of customizable colors. You can also browse [other helpers](https://github.com/ckeditor/ckeditor5-theme-lark/tree/master/theme/helpers) to learn about other useful SASS variables.
</info-box>

The contents of `custom.scss` could look as below:

```scss
// Overrides the border-radius setting in the theme.
$ck-border-radius: 4px;

// Overrides the default font size in the theme.
$ck-font-size-base: 14px;

// Helper variables to avoid duplication in $ck-colors.
$custom-background: #4A494B;
$custom-foreground: #3a393d;
$custom-border: #383738;
$custom-white: #fff;

// Colors used by the ck-color() mixin across the theme.
$ck-colors: (
	// Overrides the default focus color used by the ck-focus-ring() mixin.
	'border-focus': #48a3f5,

	// Overrides the default text color in the theme.
	'text': #fafafa,

	// Overrides the default shadow colors in the theme.
	'shadow-drop': rgba( 0, 0, 0, .2 ),
	'shadow-inner': rgba( 0, 0, 0, .1 ),

	// Overrides the default .ck-button class colors.
	'button-default-background': $custom-background,
	'button-default-border': $custom-border,
	'button-on-background': $custom-foreground,
	'button-on-border': $custom-border,
	'button-action-background': #1ABC9C,
	'button-action-border': #49d2b7,
	'button-action-text': $custom-white,

	// Overrides the default .ck-dropdown class colors.
	'dropdown-panel-background': $custom-background,
	'dropdown-panel-border': $custom-foreground,
	'dropdown-symbol': #f1f1f1,

	// Overrides the default .ck-input class colors.
	'input-background': $custom-foreground,
	'input-border': #6b6970,
	'input-text': #fafafa,

	// Overrides the default .ck-list class colors.
	'list-background': $custom-background,
	'list-item-background-hover': $custom-foreground,
	'list-item-background-active': #1A8BF1,
	'list-item-text-active': $custom-white,

	// Overrides the default .ck-balloon-panel class colors.
	'panel-background': $custom-background,
	'panel-border': $custom-border,

	// Overrides the default .ck-toolbar class colors.
	'toolbar-background': $custom-foreground,
	'toolbar-border': $custom-border,

	// Overrides the default .ck-tooltip class colors.
	'tooltip-background': #212025,
	'tooltip-text': #eee,

	// Overrides the default colors used by the editor.
	'editor-border': $custom-background,
	'editor-toolbar-background': $custom-background,
	'editor-toolbar-button-background': $custom-background,
	'editor-dropdown-background': #535254,

	// Overrides the default colors used by ckeditor5-image package.
	'image-caption-background': #f7f7f7,
	'image-caption-text': #333,

	// Overrides the default colors used by ckeditor5-widget package.
	'widget-border-blurred': #ddd,
	'widget-border-hover': #FFD25C,
	'widget-editable-focused-background': $custom-white
);
```

Now let's build the editor using `npm run build-ckeditor` and see the results. From now on, the editor's theme is using customized styles.

## Adding extra styles to the build

Not every element of the theme can be customized using SASS variables and some visual tweaking may require more complex CSS rules.

In the editor demo presented and the very beginning of this guide, the drop down button in the toolbar has a complex inner [`box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow?v=b) that makes it more appealing. By default, the [Lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) theme does not support such shadow and that is why it must be defined separately.

```css
.ck-editor-toolbar .ck-button.ck-dropdown__button {
	box-shadow: 0 0 0 1px #5c5b5d inset, 0 0 5px #5c5b5d inset;
}
```

The above rule could be added directly to any styles sheet in the web page and most certainly would work as expected.

But what if the color set customized in the [previous part](#Customization-with-SASS-variables) of this guide has changed? Static CSS rules will not update along with the SASS variables and neither they can benefit from the mixins and functions provided by the theme. To add an extra styles and keep it within the ecosystem, a separate SASS file should be created (let's call it `extras.scss`):

```scss
// Allow using Lark's ck-box-shadow() mixin.
@import '~@ckeditor/ckeditor5-theme-lark/theme/helpers/_shadow.scss';

// Allow using colors defined in Lark and the ck-color() mixin.
@import '~@ckeditor/ckeditor5-theme-lark/theme/helpers/_colors.scss';

// The shadow should be 10% brighter than the toolbar background.
$shadow-color: ck-color( 'editor-toolbar-background', 10 );

.ck-editor-toolbar {
	.ck-button.ck-dropdown__button {
		// Apply a dedicated inner box-shadow to the dropdown button.
		@include ck-box-shadow(
			0 0 0 1px $shadow-color inset,
			0 0 5px $shadow-color inset
		);
	}
}
```

and then imported into a JavaScript file that is processed by webpack and the [loaders](#Styles-processing-and-bundling), like an e.g. an entry–point of the application.

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import 'extras.scss';

ClassicEditor
	.create( ... )
	.then( editor => {
		console.log( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

```

This way, the additional styles will stay up–to–date as the application develops and changes over the time.
