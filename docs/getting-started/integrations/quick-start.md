---
menu-title: Vanilla JS
meta-title: Vanilla JS CKEditor 5 installation - quick start with npm or ZIP | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using npm or ZIP.
category: self-hosted
order: 20
---

# Installing Vanilla JS CKEditor&nbsp;5 from npm or ZIP

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web application. This guide will show you the fastest way to use it with npm or a ZIP package.

{@snippet getting-started/use-builder}

## Installing CKEditor&nbsp;5 using npm

<info-box>
	To set up the editor from npm, you need a bundler to build the JavaScript files correctly. CKEditor 5 is compatible with all modern JavaScript bundlers. For a quick project setup, we recommend using [Vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).
</info-box>

First, install the necessary package. The command below will install the main CKEditor&nbsp;5 package containing all open-source plugins.

```bash
npm install ckeditor5
```

Now, you can import all the modules from the `ckeditor5` package. Additionally, you have to import CSS styles separately. Please note the {@link module:essentials/essentials~Essentials `Essentials`} plugin, including all essential editing features.

**Importing and registering UI translations is optional for American English.** To use the editor in any other language, use imported translations, as shown in the {@link getting-started/setup/ui-language setup section}.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>


```js
import { ClassicEditor, Essentials, Bold, Italic, Font, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [
			'undo', 'redo', '|', 'bold', 'italic', '|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Pass the imported plugins inside the configuration to the {@link module:editor-classic/classiceditor~ClassicEditor#create `create()`} method and add toolbar items where applicable.

The first argument in the `create()` function is a DOM element for the editor placement, so you need to add it to your HTML page.

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

That is all the code you need to see a bare-bone editor running in your web browser.

## Installing CKEditor&nbsp;5 from a ZIP file

If you do not want to build your project using npm and cannot rely on the CDN delivery, you can download ready-to-run files with CKEditor&nbsp;5 and all its plugins.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from ZIP:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

1. <a href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/zip/ckeditor5-{@var ckeditor5-version}.zip">Download the ZIP archive</a> with the latest CKEditor&nbsp;5 distribution.
2. Extract the ZIP archive into a dedicated directory inside your project (for example, `vendor/`). Include the editor version in the directory name to ensure proper cache invalidation whenever you install a new version of CKEditor&nbsp;5.

Files included in the ZIP archive:

* `index.html` &ndash; A sample with a working editor.
* `ckeditor5/ckeditor5.js` &ndash; The ready-to-use editor ESM bundle contains the editor and all plugins. [Recommended build]
* `ckeditor5/ckeditor.js.map` &ndash; The source map for the editor ESM bundle.
* `ckeditor5/ckeditor5.umd.js` &ndash; The ready-to-use editor UMD bundle contains the editor and all plugins. [Secondary build]
* `ckeditor5/ckeditor5.umd.js.map` &ndash; The source map for the editor UMD bundle.
* `ckeditor5/*.css` &ndash; The style sheets for the editor. You will use `ckeditor5.css` in most cases. Read about other files in the {@link getting-started/setup/css Editor and content styles} guide.
* `translations/` &ndash; The editor UI translations (see the {@link getting-started/setup/ui-language Setting the UI language} guide).
* The `README.md` and `LICENSE.md` files.

The easiest way to see the editor in action is to serve the `index.html` file via an HTTP server.

<info-box warning>
	You must run your code on a local server to use import maps. Opening the HTML file directly in your browser will trigger security rules. These rules (CORS policy) ensure loading modules from the same source. Therefore, set up a local server, like `nginx`, `caddy`, `http-server`, to serve your files over HTTP or HTTPS.
</info-box>

## Installing premium features

### Installing premium features using npm

All premium features are available as a separate package. You can install it the same as the open-source one.

```bash
npm install ckeditor5-premium-features
```

Now, you can import all the modules from both the `ckeditor5` and `ckeditor5-premium-features` packages. Additionally, you have to import CSS styles separately.

<info-box>
	If you use a self-hosted editor from npm, obtain a license for {@link getting-started/licensing/license-key-and-activation premium features}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and all of its features.
</info-box>

```js
import { ClassicEditor, Essentials, Bold, Italic, Paragraph, Font } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Paragraph, Font, FormatPainter ],
		toolbar: [
			'undo', 'redo', '|', 'bold', 'italic', '|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
			'formatPainter'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Pass the imported plugins inside the configuration to the {@link module:editor-classic/classiceditor~ClassicEditor#create `create()`} method and add toolbar items where applicable. Please note that to use premium features, you need to activate them with a proper license key. See the [Obtaining a license key](#obtaining-a-premium-features-license-key) section.

The first argument in the `create()` function is a DOM element for the editor placement, so you need to add it to your HTML page.

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

That is all the code you need to see a bare-bone editor running in your web browser.

### Installing premium features from a ZIP file

1. <a href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/zip/ckeditor5-premium-features-{@var ckeditor5-version}.zip">Download the ZIP archive</a> with the latest CKEditor&nbsp;5 distribution and premium features.
2. Extract the ZIP archive into a dedicated directory inside your project (for example, `vendor/`). Include the editor version in the directory name to ensure proper cache invalidation whenever you install a new version of CKEditor&nbsp;5.

<info-box>
	If you use a self-hosted editor from ZIP, obtain a license for {@link getting-started/licensing/license-key-and-activation premium features}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and all of its features.
</info-box>

Files in the ZIP archive:

* `index.html` &ndash; A sample with a working editor.
* The `ckeditor5/` directory:
  * `ckeditor5.js` &ndash; The ready-to-use editor ESM bundle contains the editor and all plugins. [Recommended build]
  * `ckeditor.js.map` &ndash; The source map for the editor ESM bundle.
  * `ckeditor5.umd.js` &ndash; The ready-to-use editor UMD bundle contains the editor and all plugins. [Secondary build]
  * `ckeditor5.umd.js.map` &ndash; The source map for the editor UMD bundle.
  * `*.css` &ndash; The style sheets for the editor, use `ckeditor5.css` in most cases. Read about other files in the {@link getting-started/setup/css Editor and content styles} guide.
  * `translations/` &ndash; The editor UI translations (see the {@link getting-started/setup/ui-language Setting the UI language} guide).
  * The `ckeditor5-premium-features/` directory:
    * `ckeditor5-premium-features.js` &ndash; ESM bundle of premium features.  [Recommended build]
    * `ckeditor5-premium-features.umd.js` &ndash; UMD bundle of premium features contains the editor and all plugins. [Secondary build]
    * `*.css` &ndash; The style sheets for the premium features. You will use `ckeditor5-premium-features.css` in most cases.
    * `translations/` &ndash; The premium features UI translations.
* The `ckeditor5-premium-features` directory is structured similarly to the `ckeditor5` directory. It contains equivalent files for premium features.
* The `README.md` and `LICENSE.md` files.

The easiest way to see the editor in action is to serve the `index.html` file via an HTTP server.

<info-box warning>
	You must run your code on a local server to use import maps. Opening the HTML file directly in your browser will trigger security rules. These rules (CORS policy) ensure loading modules from the same source. Therefore, set up a local server, like `nginx`, `caddy`, `http-server`, to serve your files over HTTP or HTTPS.
</info-box>

### Obtaining a premium features license key

To activate CKEditor&nbsp;5 premium features, you will need a commercial license. The easiest way to get one is to sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free) to test the premium features.

You can also [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. To obtain an activation key, please follow the {@link getting-started/licensing/license-key-and-activation License key and activation} guide.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
