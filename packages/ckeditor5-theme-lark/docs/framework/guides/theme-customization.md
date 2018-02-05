---
category: framework-ui
order: 10
---

# Theme customization

The [`@ckeditor/ckeditor5-theme-lark`](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) is the default theme of CKEditor 5. Lark is modular, [BEM–friendly](https://en.bem.info/methodology/css/) and built in [PostCSS](http://postcss.org/).

Although it was designed with versatility and the most common editor use cases in mind, some integrations may require adjustments to make it match the style guidelines of the ecosystem. This kind of customization can be done by importing an extra `.css` file and overriding the [native CSS variables](https://www.w3.org/TR/css-variables/).

You can see the demo of an editor with the dark theme as a result of customizations described later in this guide:

{@snippet examples/theme-lark}

## Styles processing and bundling

CKEditor 5 is bundled using [webpack](https://webpack.js.org/) and it handles the importing and processing of the styles using the [loaders](https://webpack.js.org/concepts/loaders/). Its configuration can be found in the `webpack.config.js` file.

<info-box info>
	To learn more about building CKEditor, check out the {@link builds/guides/development/custom-builds Creating custom builds} guide.
</info-box>

The entire process of building and managing the styles boils down to three steps:

1. **Collecting**: Each JavaScript file in the project can import multiple `.css` files using the ES6 [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) directive. Imported files are handled by the [PostCSS Loader](https://www.npmjs.com/package/postcss-loader).

	```js
	import '../theme/theme.css';

	class AnyEditorClass {
		...
	}
	```

	```css
	/* Contents of theme.css. */
	:root {
		--color: red;
	}

	.ck-editor {
		color: var(--color);
	}
	```

2. **Processing**: The PostCSS Loader processes `.css` files to the output CSS. Each file is compiled asynchronously, in a separate processor thread using pre–defined plugins.

3. **Loading**: Finally the [Style loader](https://www.npmjs.com/package/style-loader) loads the output CSS along with the `ckeditor.js` file into a `<style>` element in the `<head>` section of the web page.

	```html
	<head>
		<style type="text/css">
			.ck-editor {
				color: var(--color);
			}
		</style>
	</head>
	```

## Customization with CSS variables

Having {@link builds/guides/development/custom-builds#Forking-an-existing-build cloned} an existing build of CKEditor for a quick start, let's use the full potential of CSS variables. The customization in this guide will make the theme dark, with slightly bigger text and more rounded corners.

<info-box hint>
	Check out the [colors helper](https://github.com/ckeditor/ckeditor5-theme-lark/blob/master/theme/ckeditor5-ui/globals/_colors.css) for the full list of customizable colors. You can also browse [other helpers](https://github.com/ckeditor/ckeditor5-theme-lark/tree/master/theme/mixins) to learn about other useful tools.
</info-box>

The file containing custom variables will be named `custom.css` and it will look as below:

```css

:root {
	/* Overrides the border-radius setting in the theme. */
	--ck-border-radius: 4px;

	/* Overrides the default font size in the theme. */
	--ck-font-size-base: 14px;

	/* Helper variables to avoid duplication in the colors. */
	--ck-custom-background: hsl(270, 1%, 29%);
	--ck-custom-foreground: hsl(255, 3%, 23%);
	--ck-custom-border: hsl(300, 1%, 22%);
	--ck-custom-white: hsl(0, 0%, 100%);

	/* -- Overrides generic colors -------------------------------------------------------------- */

	--ck-color-focus-border: hsl(208, 90%, 62%);
	--ck-color-text: hsl(0, 0%, 98%);
	--ck-color-shadow-drop: hsla(0, 0%, 0%, 0.2);
	--ck-color-shadow-inner: hsla(0, 0%, 0%, 0.1);

	/* -- Overrides the default .ck-button class colors ----------------------------------------- */

	--ck-color-button-default-background: var(--ck-custom-background);
	--ck-color-button-default-border: var(--ck-custom-border);
	--ck-color-button-default-focus-background: hsl(270, 1%, 26%);
	--ck-color-button-default-focus-border: hsl(0, 0%, 20%);
	--ck-color-button-default-active-background: hsl(270, 2%, 25%);
	--ck-color-button-default-active-border: hsl(300, 1%, 19%);
	--ck-color-button-default-active-shadow: hsl(270, 2%, 23%);
	--ck-color-button-default-disabled-background: var(--ck-custom-background);
	--ck-color-button-default-disabled-border: var(--ck-custom-border);

	--ck-color-button-on-background: var(--ck-custom-foreground);
	--ck-color-button-on-border: var(--ck-custom-border);
	--ck-color-button-on-focus-background: hsl(255, 4%, 21%);
	--ck-color-button-on-focus-border: hsl(0, 0%, 20%);
	--ck-color-button-on-active-background: hsl(255, 4%, 20%);
	--ck-color-button-on-active-border: hsl(300, 1%, 19%);
	--ck-color-button-on-active-shadow: hsl(240, 3%, 19%);
	--ck-color-button-on-disabled-background: var(--ck-custom-foreground);
	--ck-color-button-on-disabled-border: var(--ck-custom-border);

	--ck-color-button-action-background: hsl(168, 76%, 42%);
	--ck-color-button-action-border: hsl(168, 60%, 55%);
	--ck-color-button-action-focus-background: hsl(168, 76%, 38%);
	--ck-color-button-action-focus-border: hsl(168, 48%, 50%);
	--ck-color-button-action-active-background: hsl(168, 76%, 36%);
	--ck-color-button-action-active-border: hsl(168, 49%, 47%);
	--ck-color-button-action-active-shadow: hsl(168, 75%, 34%);
	--ck-color-button-action-disabled-background: hsl(168, 76%, 42%);
	--ck-color-button-action-disabled-border: hsl(168, 60%, 55%);
	--ck-color-button-action-text: var(--ck-custom-white);

	/* -- Overrides the default .ck-dropdown class colors --------------------------------------- */

	--ck-color-dropdown-panel-background: var(--ck-custom-background);
	--ck-color-dropdown-panel-border: var(--ck-custom-foreground);
	--ck-color-dropdown-symbol: hsl(0, 0%, 95%);

	/* -- Overrides the default .ck-input class colors ------------------------------------------ */

	--ck-color-input-background: var(--ck-custom-foreground);
	--ck-color-input-border: hsl(257, 3%, 43%);
	--ck-color-input-text: hsl(0, 0%, 98%);
	--ck-color-input-disabled-background: hsl(255, 4%, 21%);
	--ck-color-input-disabled-border: hsl(250, 3%, 38%);
	--ck-color-input-disabled-text: hsl(0, 0%, 46%);

	/* -- Overrides the default .ck-list class colors ------------------------------------------- */

	--ck-color-list-background: var(--ck-custom-background);
	--ck-color-list-item-background-hover: var(--ck-custom-foreground);
	--ck-color-list-item-background-active: hsl(208, 88%, 52%);
	--ck-color-list-item-text-active: var(--ck-custom-white);

	/* -- Overrides the default .ck-balloon-panel class colors ---------------------------------- */

	--ck-color-panel-background: var(--ck-custom-background);
	--ck-color-panel-border: var(--ck-custom-border);

	/* -- Overrides the default .ck-toolbar class colors ---------------------------------------- */

	--ck-color-toolbar-background: var(--ck-custom-foreground);
	--ck-color-toolbar-border: var(--ck-custom-border);

	/* -- Overrides the default .ck-tooltip class colors ---------------------------------------- */

	--ck-color-tooltip-background: hsl(252, 7%, 14%);
	--ck-color-tooltip-text: hsl(0, 0%, 93%);

	/* -- Overrides the default colors used by the editor --------------------------------------- */

	--ck-color-editor-border: var(--ck-custom-background);
	--ck-color-editor-toolbar-background: var(--ck-custom-background);

	--ck-color-editor-toolbar-button-on-background: hsl(0, 0%, 24%);
	--ck-color-editor-toolbar-button-on-border: transparent;
	--ck-color-editor-toolbar-button-on-focus-background: hsl(0, 0%, 21%);
	--ck-color-editor-toolbar-button-on-focus-border: transparent;
	--ck-color-editor-toolbar-button-on-active-background: hsl(0, 0%, 15%);
	--ck-color-editor-toolbar-button-on-active-border: transparent;
	--ck-color-editor-toolbar-button-on-active-shadow: hsl(0, 0%, 18%);
	--ck-color-editor-toolbar-button-on-disabled-background: transparent;
	--ck-color-editor-toolbar-button-on-disabled-border: transparent;

	--ck-color-editor-dropdown-background: hsl(270, 1%, 33%);

	/* -- Overrides the default colors used by ckeditor5-image package -------------------------- */

	--ck-color-image-caption-background: hsl(0, 0%, 97%);
	--ck-color-image-caption-text: hsl(0, 0%, 20%);

	/* -- Overrides the default colors used by ckeditor5-widget package ------------------------- */

	--ck-color-widget-border-blurred: hsl(0, 0%, 87%);
	--ck-color-widget-border-hover: hsl(43, 100%, 68%);
	--ck-color-widget-editable-focused-background: var(--ck-custom-white);
}
```

This file can be referenced directly in HTML **after the `<link>` tag injected by the editor** and its content will simply override the default CSS variables. CSS variables are natively [supported](https://caniuse.com/#feat=css-variables) in all major web browsers and just like like any other CSS rule, they are prioritized in the order of precedence.

```html
<link rel="stylesheet" href="custom.css" type="text/css">
```

Alternatively, the style sheet can also be imported into a JavaScript file that is processed by webpack and the [loaders](#Styles-processing-and-bundling) becoming part of the build, e.g. an entry point of the application.

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// To override the default styles, this file must be imported after ClassicEditor.
import 'custom.css';

ClassicEditor
	.create( ... )
	.then( editor => {
		console.log( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

```

## Further customization

In the editor demo presented and the very beginning of this guide, the drop down button in the toolbar has a complex inner [`box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow?v=b) that makes it more appealing. By default, the [Lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) theme does not support such shadow and that is why it must be defined separately.

```css
:root {
	--ck-shadow-color: #646265;
}

.ck-editor-toolbar .ck-button.ck-dropdown__button {
	box-shadow: 0 0 0 1px var(--ck-shadow-color) inset, 0 0 5px var(--ck-shadow-color) inset;
}
```

Again, the rule above could be added directly to any stylesheet in the web page and it would work as expected. But to use a pre–defined helper mixin (`@mixin ck-box-shadow`), clean up the code with some nesting just like below, and finally make it the part of the editor build, the code must be processed by webpack and PostCSS too.

```css
/* Allow using Lark's ck-box-shadow() mixin. */
@import '@ckeditor/ckeditor5-theme-lark/theme/mixins/_shadow.css';

/* The shadow should be 10% brighter than the toolbar background. */
:root {
	--ck-shadow-color: #646265;
}

.ck-editor-toolbar {
	& .ck-button.ck-dropdown__button {
		/* Apply a dedicated inner box-shadow to the dropdown button. */
		@mixin ck-box-shadow
			0 0 0 1px var(--ck-shadow-color) inset,
			0 0 5px var(--ck-shadow-color) inset;
	}
}

```

Let's put the content of the file in the `extras.css` and import it just like the custom variables sheet:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// To override default styles, these files must be imported after ClassicEditor.
import 'custom.css';
import 'extras.css';
```

It is time to build the editor using `npm run build-ckeditor` and see the results. From now on, the editor's theme is using customized styles, which are part of the build.
