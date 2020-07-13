---
category: framework-deep-dive-ui
order: 10
---

# Theme customization

The [`@ckeditor/ckeditor5-theme-lark`](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) package contains the default theme of CKEditor 5. Lark is modular, [BEM–friendly](https://en.bem.info/methodology/css/) and built using [PostCSS](http://postcss.org/).

Although it was designed with versatility and the most common editor use cases in mind, some integrations may require adjustments to make it match the style guidelines of the ecosystem. This kind of customization can be done by importing an extra `.css` file and overriding the [native CSS variables](https://www.w3.org/TR/css-variables/).

Below you can see a demo of an editor with the dark theme as a result of customizations described later in this guide:

{@snippet examples/theme-lark}

## Styles processing and bundling

CKEditor 5 is bundled using [webpack](https://webpack.js.org/) and it handles the importing and processing of styles using [loaders](https://webpack.js.org/concepts/loaders/). Its configuration can be found in the `webpack.config.js` file.

<info-box info>
	To learn more about building CKEditor, check out the {@link builds/guides/integration/advanced-setup Advanced setup} guide.
</info-box>

The entire process of building and managing the styles boils down to three steps:

1. **Collecting**: Each JavaScript file in the project can import multiple `.css` files using the ES6 [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) directive. Imported files are handled by [PostCSS Loader](https://www.npmjs.com/package/postcss-loader).

	```js
	import '../theme/styles.css';

	class AnyEditorClass {
		...
	}
	```

	```css
	/* Contents of styles.css. */
	:root {
		--color: red;
	}

	.ck-editor {
		color: var(--color);
	}
	```

2. **Processing**: PostCSS Loader processes `.css` files to the output CSS. Each file is compiled asynchronously, in a separate processor thread using pre–defined plugins.

3. **Loading**: Finally the [style loader](https://www.npmjs.com/package/style-loader) loads the output CSS along with the `ckeditor.js` file into a `<style>` element in the `<head>` section of the web page.

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

Having {@link builds/guides/development/custom-builds#forking-an-existing-build cloned} an existing build of CKEditor for a quick start, let's use the full potential of CSS variables (custom properties). The customization explained in this guide will make the theme dark, with slightly bigger text and more rounded corners.

<info-box hint>
	Check out the [color sheet](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_colors.css) for a full list of customizable colors. You can also browse [other files](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-theme-lark/theme/ckeditor5-ui/globals) to learn about other useful tools.
</info-box>

The file containing custom variables will be named `custom.css` and it will look as below:

```css
:root {
	/* Overrides the border radius setting in the theme. */
	--ck-border-radius: 4px;

	/* Overrides the default font size in the theme. */
	--ck-font-size-base: 14px;

	/* Helper variables to avoid duplication in the colors. */
	--ck-custom-background: hsl(270, 1%, 29%);
	--ck-custom-foreground: hsl(255, 3%, 18%);
	--ck-custom-border: hsl(300, 1%, 22%);
	--ck-custom-white: hsl(0, 0%, 100%);

	/* -- Overrides generic colors. ------------------------------------------------------------- */

	--ck-color-base-foreground: var(--ck-custom-background);
	--ck-color-focus-border: hsl(208, 90%, 62%);
	--ck-color-text: hsl(0, 0%, 98%);
	--ck-color-shadow-drop: hsla(0, 0%, 0%, 0.2);
	--ck-color-shadow-inner: hsla(0, 0%, 0%, 0.1);

	/* -- Overrides the default .ck-button class colors. ---------------------------------------- */

	--ck-color-button-default-background: var(--ck-custom-background);
	--ck-color-button-default-hover-background: hsl(270, 1%, 22%);
	--ck-color-button-default-active-background: hsl(270, 2%, 20%);
	--ck-color-button-default-active-shadow: hsl(270, 2%, 23%);
	--ck-color-button-default-disabled-background: var(--ck-custom-background);

	--ck-color-button-on-background: var(--ck-custom-foreground);
	--ck-color-button-on-hover-background: hsl(255, 4%, 16%);
	--ck-color-button-on-active-background: hsl(255, 4%, 14%);
	--ck-color-button-on-active-shadow: hsl(240, 3%, 19%);
	--ck-color-button-on-disabled-background: var(--ck-custom-foreground);

	--ck-color-button-action-background: hsl(168, 76%, 42%);
	--ck-color-button-action-hover-background: hsl(168, 76%, 38%);
	--ck-color-button-action-active-background: hsl(168, 76%, 36%);
	--ck-color-button-action-active-shadow: hsl(168, 75%, 34%);
	--ck-color-button-action-disabled-background: hsl(168, 76%, 42%);
	--ck-color-button-action-text: var(--ck-custom-white);

	--ck-color-button-save: hsl(120, 100%, 46%);
	--ck-color-button-cancel: hsl(15, 100%, 56%);

	/* -- Overrides the default .ck-dropdown class colors. -------------------------------------- */

	--ck-color-dropdown-panel-background: var(--ck-custom-background);
	--ck-color-dropdown-panel-border: var(--ck-custom-foreground);

	/* -- Overrides the default .ck-splitbutton class colors. ----------------------------------- */

	--ck-color-split-button-hover-background: var(--ck-color-button-default-hover-background);
	--ck-color-split-button-hover-border: var(--ck-custom-foreground);

	/* -- Overrides the default .ck-input class colors. ----------------------------------------- */

	--ck-color-input-background: var(--ck-custom-foreground);
	--ck-color-input-border: hsl(257, 3%, 43%);
	--ck-color-input-text: hsl(0, 0%, 98%);
	--ck-color-input-disabled-background: hsl(255, 4%, 21%);
	--ck-color-input-disabled-border: hsl(250, 3%, 38%);
	--ck-color-input-disabled-text: hsl(0, 0%, 46%);

	/* -- Overrides the default .ck-list class colors. ------------------------------------------ */

	--ck-color-list-background: var(--ck-custom-background);
	--ck-color-list-button-hover-background: var(--ck-color-base-foreground);
	--ck-color-list-button-on-background: var(--ck-color-base-active);
	--ck-color-list-button-on-background-focus: var(--ck-color-base-active-focus);
	--ck-color-list-button-on-text: var(--ck-color-base-background);

	/* -- Overrides the default .ck-balloon-panel class colors. --------------------------------- */

	--ck-color-panel-background: var(--ck-custom-background);
	--ck-color-panel-border: var(--ck-custom-border);

	/* -- Overrides the default .ck-toolbar class colors. --------------------------------------- */

	--ck-color-toolbar-background: var(--ck-custom-background);
	--ck-color-toolbar-border: var(--ck-custom-border);

	/* -- Overrides the default .ck-tooltip class colors. --------------------------------------- */

	--ck-color-tooltip-background: hsl(252, 7%, 14%);
	--ck-color-tooltip-text: hsl(0, 0%, 93%);

	/* -- Overrides the default colors used by the ckeditor5-image package. --------------------- */

	--ck-color-image-caption-background: hsl(0, 0%, 97%);
	--ck-color-image-caption-text: hsl(0, 0%, 20%);

	/* -- Overrides the default colors used by the ckeditor5-widget package. -------------------- */

	--ck-color-widget-blurred-border: hsl(0, 0%, 87%);
	--ck-color-widget-hover-border: hsl(43, 100%, 68%);
	--ck-color-widget-editable-focus-background: var(--ck-custom-white);

	/* -- Overrides the default colors used by the ckeditor5-link package. ---------------------- */

	--ck-color-link-default: hsl(190, 100%, 75%);
}
```

This file can be referenced directly in HTML **after the `<link>` tag injected by the editor** and its content will simply override the default CSS variables. CSS variables are natively [supported](https://caniuse.com/#feat=css-variables) in all major web browsers and just like any other CSS rule, they are prioritized in the order of precedence.

```html
<link rel="stylesheet" href="custom.css" type="text/css">
```

Alternatively, the style sheet can also be imported into a JavaScript file that is processed by webpack and the [loaders](#styles-processing-and-bundling), becoming a part of the build, e.g. an entry point of the application.

<info-box info>
	Learn more about {@link framework/guides/quick-start building the editor using webpack}.
</info-box>

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

It is time to build the editor using `yarn run build-ckeditor` and see the results. From now on, the editor's theme is using customized styles, which are a part of the build.
