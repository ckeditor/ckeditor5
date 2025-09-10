---
category: self-hosted
meta-title: Using the CKEditor 5 WYSIWYG editor with jQuery from npm | CKEditor 5 Documentation
meta-description: Integrate the CKEditor 5 rich-text editor with jQuery using npm. Follow step-by-step instructions for fast installation and setup.
order: 140
menu-title: jQuery
modified_at: 2025-09-08
---

# Integrating CKEditor&nbsp;5 with jQuery using npm

This guide will walk you through the process of integrating CKEditor&nbsp;5 with jQuery using npm packages. jQuery is a fast, small, and feature-rich JavaScript library that simplifies HTML document traversal and manipulation, event handling, and animation. By combining it with CKEditor&nbsp;5 using npm packages, you can leverage jQuery's powerful DOM manipulation capabilities while enjoying the rich editing experience that CKEditor&nbsp;5 provides.

{@snippet getting-started/use-builder}

## Installing CKEditor&nbsp;5 using npm

<info-box>
	To set up the editor from npm, you need a bundler to build the JavaScript files correctly. CKEditor&nbsp;5 is compatible with all modern JavaScript bundlers. For a quick project setup, we recommend using [Vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).
</info-box>

To begin integrating CKEditor&nbsp;5 with jQuery, you first need to install the required packages using npm. This approach provides access to all the necessary files including the editor engine, plugins, and style sheets that you can import directly into your application.

Install CKEditor&nbsp;5 using npm by running the following command in your project directory:

```bash
npm install ckeditor5
```

You also need to install jQuery if you have not done so already:

```bash
npm install jquery
```

Once the packages are installed, you can import the necessary modules and style sheets directly into your JavaScript code. Create a JavaScript file for your application logic, then import CKEditor&nbsp;5 and jQuery.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

Here is the complete integration code combining jQuery and CKEditor&nbsp;5:

```javascript
import $ from 'jquery';

import { ClassicEditor, Essentials, Bold, Italic, Font, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

$( document ).ready( () => {
	ClassicEditor
		.create( $( '#editor' )[ 0 ], {
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
			toolbar: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
			]
		} )
		.then( editor => {
			// Editor initialized successfully.
			console.log( 'CKEditor&nbsp;5 initialized with jQuery!' );
		} )
		.catch( error => {
			console.error( 'Error initializing CKEditor&nbsp;5:', error );
		} );
} );
```

Pass the imported plugins inside the configuration to the `create()` method and add toolbar items where applicable.

The first argument in the `create()` function is a DOM element for the editor placement, so you need to add it to your HTML page.

```html
<div id="editor">
	<p>Hello from CKEditor&nbsp;5 with jQuery!</p>
</div>
```

That is all the code you need to see a bare-bone editor running in your web browser.

## Installing CKEditor&nbsp;5 Premium Features using npm

To extend your CKEditor&nbsp;5 and jQuery integration with premium features, you need to install the premium features package separately.

Install the CKEditor&nbsp;5 Premium Features package using npm by running the following command in your project directory:

```bash
npm install ckeditor5-premium-features
```

Now, you can import all the modules from both the `ckeditor5` and `ckeditor5-premium-features` packages. Additionally, you have to import CSS styles separately.

```javascript
import $ from 'jquery';

import { ClassicEditor, Essentials, Bold, Italic, Font, Paragraph } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

$( document ).ready( () => {
	ClassicEditor
		.create( $( '#editor' )[ 0 ], {
			licenseKey: '<YOUR_LICENSE_KEY>',
			plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
			toolbar: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
				'formatPainter'
			]
		} )
		.then( editor => {
			// Editor initialized successfully with premium features.
			console.log( 'CKEditor&nbsp;5 with premium features initialized using jQuery!' );
		} )
		.catch( error => {
			console.error( 'Error initializing CKEditor&nbsp;5 with premium features:', error );
		} );
} );
```

### Obtaining a premium features license key

To activate CKEditor&nbsp;5 premium features, you will need a commercial license. The easiest way to get one is to sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free).

You can also [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. To obtain an activation key, please follow the {@link getting-started/licensing/license-key-and-activation License key and activation} guide.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
