---
category: installation
order: 10
menu-title: Quick start
meta-title: Quick start | CKEditor 5 documentation
meta-description: Learn the fastest way to install and use CKEditor 5 - the powerful, rich text WYSIWYG editor in your web application using npm or CDN.
modified_at: 2024-06-25
---

# Quick start

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web application. This guide will show you the fastest way to start using it.

You have a few methods to choose from:

* [Using CKEditor&nbsp;5 Builder](#using-ckeditor-5-builder) for the smoothest setup with live preview and multiple integration options.
* [Using npm](#installing-ckeditor-5-using-npm), where you use a JavaScript package and build the editor with a bundler.
* [Using CDN](#installing-ckeditor-5-from-cdn), where you use our cloud-distributed CDN in a no-build setup.
* [Using a ZIP file](#installing-ckeditor-5-from-a-zip-file), where you download the ready-to-run files and copy them to your project.
* Choosing one of the pre-made integrations with popular frameworks (see table of contents for details).

## Using CKEditor&nbsp;5 Builder

Check out our [interactive Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs) to quickly get a taste of CKEditor&nbsp;5. It offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:

* editor type,
* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

## Installing CKEditor&nbsp;5 using npm

First, install the necessary package. The command below will install the main CKEditor&nbsp;5 package containing all open-source plugins.

```bash
npm install ckeditor5
```

Now, you can import all the modules from the `ckeditor5` package. Additionally, you have to import CSS styles separately. Please note the {@link module:essentials/essentials~Essentials `Essentials`} plugin, including all essential editing features.

**Importing and registering UI translations is optional for American English.** To use the editor in any other language, use imported translations, as shown in the {@link getting-started/setup/ui-language setup section}.

```js
import { ClassicEditor, Essentials, Bold, Italic, Font, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
			]
		}
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

## Installing CKEditor&nbsp;5 from CDN

CDN is an alternative method of running CKEditor&nbsp;5. You can start using it in just a few steps and with a few tags.

Start by attaching a link to style sheets. They contain all styles for the editor's UI and content. You can also include your styles if you like. Refer to the {@link getting-started/setup/css#styling-the-published-content content styles} guide for more information.

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
```

Then, you need to attach the script with the JavaScript code. To simplify imports, you can use the feature available in browsers &ndash; the [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). It allows us to map an easy-to-remember specifier (like `ckeditor5`) to the full URL of the file from the CDN. We use this browser feature to share an editor engine code between plugins.

```html
<script type="importmap">
	{
		"imports": {
			"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
			"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/"
		}
	}
</script>
```

Once you have added the import map, you can access the editor and its plugins using the `ckeditor5` specifier.

<info-box warning>
	You must run your code on a local server to use import maps. Opening the HTML file directly in your browser will trigger security rules. These rules (CORS policy) ensure loading modules from the same source. Therefore, set up a local server, like `nginx`, `caddy`, `http-server`, to serve your files over HTTP or HTTPS.
</info-box>

In the following script tag, import the desired plugins, add them to the `plugins` array, and add toolbar items where applicable. Note that both script tags (this and previous) have the appropriate `type` values.

```html
<script type="module">
	import {
		ClassicEditor,
		Essentials,
		Bold,
		Italic,
		Font,
		Paragraph
	} from 'ckeditor5';

	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
			toolbar: {
				items: [
					'undo', 'redo', '|', 'bold', 'italic', '|',
					'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
				]
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

Lastly, add a tag for the editor to attach to.

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

Your final page should look similar to the one below.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>CKEditor 5 - Quick start CDN</title>
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	</head>
	<body>
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>

		<script type="importmap">
			{
				"imports": {
					"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
					"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/"
				}
			}
		</script>

		<script type="module">
			import {
				ClassicEditor,
				Essentials,
				Bold,
				Italic,
				Font,
				Paragraph
			} from 'ckeditor5';

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
					toolbar: {
						items: [
							'undo', 'redo', '|', 'bold', 'italic', '|',
							'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
						]
					}
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
		</script>
	</body>
</html>
```

## Installing CKEditor&nbsp;5 from a ZIP file

If you do not want to build your project using npm and cannot rely on the CDN delivery, you can download ready-to-run files with CKEditor&nbsp;5 and all its plugins.

1. <a href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/zip/ckeditor5-{@var ckeditor5-version}.zip">Download the ZIP archive with the latest CKEditor&nbsp;5 distribution.</a>
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

All three installation methods &ndash; npm, CDN, ZIP &ndash; work similarly. So, you can also use the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/) with a ZIP archive. Create a custom preset with the Builder and combine it with the editor loaded from ZIP files.

## Installing premium features

### Installing premium features using npm

All premium features are available as a separate package. You can install it the same as the open-source one.

```bash
npm install ckeditor5-premium-features
```

Now, you can import all the modules from both the `ckeditor5` and `ckeditor5-premium-features` packages. Additionally, you have to import CSS styles separately.

```js
import { ClassicEditor, Essentials, Bold, Italic, Paragraph, Font } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph, Font, FormatPainter ],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
				'formatPainter'
			]
		},
		licenseKey: '<YOUR_LICENSE_KEY>'
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Pass the imported plugins inside the configuration to the {@link module:editor-classic/classiceditor~ClassicEditor#create `create()`} method and add toolbar items where applicable. Please note, that to use premium features, you need to activate them with a proper license key, mentioned in the final section of this guide.

The first argument in the `create()` function is a DOM element for the editor placement, so you need to add it to your HTML page.

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

That is all the code you need to see a bare-bone editor running in your web browser.

### Installing premium features from CDN

Just like with open-source features, start by attaching a link to style sheets. They contain all styles for the editor's UI and content. The styles are in two separate style sheets &ndash; for open-source and premium plugins. You can also include your styles if you like. Refer to the content styles guide for more information.

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />

<!-- If you are using premium features: -->
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
```

Then, you need to attach the script with the JavaScript code. To simplify imports, you can use the feature available in browsers &ndash; the [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). It allows us to map an easy-to-remember specifier (like `ckeditor5`) to the full URL of the file from the CDN. We use this browser feature to share an editor engine code between plugins.

```html
<script type="importmap">
	{
		"imports": {
			"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
			"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/",
			"ckeditor5-premium-features": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.js",
			"ckeditor5-premium-features/": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/"
		}
	}
</script>
```

Once you have added the import map, you can access the editor and its plugins using the `ckeditor5` specifier. Import them from the `ckeditor5-premium-features` package. Please note that to use premium features, you need to activate them with a proper license key, as mentioned in the final section of this guide.

In the following script tag, import the desired plugins and add them to the `plugins` array and add toolbar items where applicable. Note that both script tags (this and previous) have the appropriate `type` values.

```html
<script type="module">
	import {
		ClassicEditor,
		Essentials,
		Bold,
		Italic,
		Font,
		Paragraph
	} from 'ckeditor5';
	import { FormatPainter } from 'ckeditor5-premium-features';

	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
			toolbar: {
				items: [
					'undo', 'redo', '|', 'bold', 'italic', '|',
					'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
					'formatPainter'
				]
			},
			licenseKey: '<YOUR_LICENSE_KEY>'
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

Lastly, add a tag for the editor to attach to.

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

Your final page should look similar to the one below.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>CKEditor 5 - Quick start CDN</title>
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
		<!-- If you are using premium features: -->
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
	</head>
	<body>
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>

		<script type="importmap">
			{
				"imports": {
					"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
					"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/",
					"ckeditor5-premium-features": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.js",
					"ckeditor5-premium-features/": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/"
				}
			}
		</script>

		<script type="module">
			import {
				ClassicEditor,
				Essentials,
				Bold,
				Italic,
				Font,
				Paragraph
			} from 'ckeditor5';
			import { FormatPainter } from 'ckeditor5-premium-features';

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
					toolbar: {
						items: [
							'undo', 'redo', '|', 'bold', 'italic', '|',
							'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'formatPainter'
						]
					},
					licenseKey: '<YOUR_LICENSE_KEY>'
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
		</script>
	</body>
</html>
```

### Installing premium features from a ZIP file

1. <a href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/zip/ckeditor5-premium-features-{@var ckeditor5-version}.zip">Download the ZIP archive with the latest CKEditor&nbsp;5 distribution and premium features.</a>
2. Extract the ZIP archive into a dedicated directory inside your project (for example, `vendor/`). Include the editor version in the directory name to ensure proper cache invalidation whenever you install a new version of CKEditor&nbsp;5.

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
* The `README.md` and `LICENSE.md` files.

The easiest way to see the editor in action is to serve the `index.html` file via an HTTP server.

<info-box warning>
	You must run your code on a local server to use import maps. Opening the HTML file directly in your browser will trigger security rules. These rules (CORS policy) ensure loading modules from the same source. Therefore, set up a local server, like `nginx`, `caddy`, `http-server`, to serve your files over HTTP or HTTPS.
</info-box>

All three installation methods &ndash; npm, CDN, ZIP &ndash; work similarly. So, you can also use the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/) with a ZIP archive. Create a custom preset with the Builder and combine it with the editor loaded from ZIP files.

### Obtaining a license key

To activate CKEditor&nbsp;5 premium features, you will need a commercial license. The easiest way to get one is to sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the premium features.

You can also [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. To obtain an activation key, please follow the {@link getting-started/setup/license-key-and-activation License key and activation} guide.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
