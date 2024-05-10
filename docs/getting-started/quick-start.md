---
category: installation
order: 10
menu-title: Quick Start
meta-title: Quick Start | CKEditor 5 documentation
meta-description: Learn the fastest way to install and use CKEditor 5 - the powerful, rich text WYSIWYG editor in your web application using npm or CDN.
modified_at: 2024-05-06
---

# Quick Start

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web application. This guide will show you the fastest way to start using it.

## Try CKEditor&nbsp;5 Builder

Check out our [interactive Builder](https://ckeditor.com/builder?redirect=docs) to quickly get a taste of CKEditor&nbsp;5. It offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs.

## Installing CKEditor&nbsp;5 using npm

First, install the necessary package. The command below will install the main CKEditor&nbsp;5 package containing all open-source plugins.

```bash
npm install ckeditor5
```

Now you can import all the modules from the `ckeditor5` package. Additionally, you have to import CSS styles separately.

**Importing and registering UI translations is optional for American English.** To use the editor in any other language, use imported translations, as shown in the {@link getting-started/setup/ui-language setup section}.

```js
import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';

import 'ckeditor5/dist/styles.css';

await ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph ],
		toolbar: {
			items: [ 'undo', 'redo', '|', 'bold', 'italic' ]
		}
	} )
```

Pass the imported plugins inside the configuration to the {@link module:editor-classic/classiceditor~ClassicEditor#create `create()`} method. The first argument in this function is a DOM element for the editor placement, so you need to add it to your HTML page.

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

That is all the code you need to see a bare-bone editor running in your web browser.

### Adding CKEditor&nbsp;5 premium features

All premium features are available as a separate package. You can install it the same as the open-source one.

```bash
npm install ckeditor5-premium-features
```

Importing and registering these plugins is also analogous to the open-source ones. However, to use premium features, you need to activate them with a proper license key. Refer to the {@link getting-started/setup/license-key-and-activation License key and activation} guide for details.

```js
import { ClassicEditor, Essentials } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/dist/styles.css';

await ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, FormatPainter, SlashCommand ],
		toolbar: [ 'formatPainter' ],
		licenseKey: 'your-license-key'
	} )
```

## Using CKEditor&nbsp;5 from CDN

CDN is an alternative method of running CKEditor 5. You can start using it in just a few steps and with a few tags.

### Obtain a license key

To activate CKEditor&nbsp;5 premium features, you will need a commercial license. If you wish to purchase a commercial CKEditor&nbsp;5 license or a license to one of the premium features, [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. To obtain an activation key, please follow the {@link getting-started/setup/license-key-and-activation License key and activation} guide.

<!-- Not sure we should duplicate this in QS: TODO: Describe the steps to obtain a license key, attaching some screenshots. -->

### CDN setup

Start by attaching a link to the style sheet. It contains all styles for the editor's UI and content. You can also include your styles if you like. Refer to the content styles guide for more information.

```html
<link rel="stylesheet" href="<CDN_LINK>/ckeditor5/dist/styles.css" />
```

Then, you need to attach the script with the JavaScript code. To simplify imports, you can use the feature available in browsers &ndash; the [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). It allows us to map an easy-to-remember specifier (like `ckeditor5`) to the full URL of the file from the CDN. We use this browser feature to share an editor engine code between plugins.

```html
<script type="importmap">
	{
		"imports": {
			"ckeditor5": "<CDN_LINK>/ckeditor5/index.min.js",
			"ckeditor5/": "<CDN_LINK>/ckeditor5/"
		}
	}
</script>
```

Once you have added the import map, you can access the editor and its plugins using the `ckeditor5` specifier. In the following script tag, import the desired plugins and add them to the `plugins` array. Note that both script tags (this and previous) have the appropriate `type` values.

```html
<script type="module">
	import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';

	await ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ Essentials, Bold, Italic, Paragraph ],
			toolbar: {
				items: [ 'undo', 'redo', '|', 'bold', 'italic' ]
			}
		} )
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
		<link rel="stylesheet" href="<CDN_LINK>/ckeditor5/dist/styles.css" />
	</head>
	<body>
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>

		<script type="importmap">
			{
				"imports": {
					"ckeditor5": "<CDN_LINK>/ckeditor5/dist/index.min.js",
					"ckeditor5/": "<CDN_LINK>/ckeditor5/"
				}
			}
		</script>
		
		<script type="module">
			import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';
		
			await ClassicEditor
				.create( document.querySelector( '#editor' ), {
					plugins: [ Essentials, Bold, Italic, Paragraph ],
					toolbar: {
						items: [ 'undo', 'redo', '|', 'bold', 'italic' ]
					}
				} )
		</script>
	</body>
</html>
```

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/getting-and-setting-data Getting and setting data} guide.
* Refer to the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
