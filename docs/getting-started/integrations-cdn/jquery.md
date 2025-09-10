---
category: cloud
meta-title: Using the CKEditor 5 WYSIWYG editor with jQuery from CDN | CKEditor 5 Documentation
meta-description: Integrate the CKEditor 5 rich-text editor with jQuery using CDN. Follow step-by-step instructions for fast installation and setup.
order: 140
menu-title: jQuery
modified_at: 2025-09-08
---

# Integrating CKEditor&nbsp;5 with jQuery from CDN

This guide will walk you through the process of integrating CKEditor&nbsp;5 with jQuery using the CDN approach. jQuery is a fast, small, and feature-rich JavaScript library that simplifies HTML document traversal and manipulation, event handling, and animation. By combining it with CKEditor&nbsp;5, you can leverage jQuery's powerful DOM manipulation capabilities while enjoying the rich editing experience that CKEditor&nbsp;5 provides.

{@snippet getting-started/use-builder}

## Setting up a jQuery page

To begin integrating CKEditor&nbsp;5 with jQuery, you first need to create an HTML page that includes jQuery from the CDN. Start by creating a basic HTML structure and include jQuery using a CDN link. The jQuery library should be loaded before any custom scripts that depend on it. This ensures that it is available when your custom code executes. Once it is loaded, you can start using its methods and selectors in your JavaScript code.

Here is a complete HTML page setup with jQuery integrated from CDN:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CKEditor&nbsp;5 with jQuery Integration</title>

	<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
	<div id="editor">
		<p>Hello from CKEditor&nbsp;5 with jQuery!</p>
	</div>

	<script>
		$( document ).ready( () => {
			// jQuery code will go here
			console.log( 'jQuery is loaded and ready!' );
		} );
	</script>
</body>
</html>
```

## Installing CKEditor&nbsp;5 from CDN

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

After setting up your jQuery page, the next step is to integrate CKEditor&nbsp;5 from CDN. You need to include both the CSS style sheets and JavaScript files for CKEditor&nbsp;5. The CSS files contain all the necessary styles for the editor's user interface and content display. The JavaScript files contain the editor engine and all the plugins you want to use.

First, add the CKEditor&nbsp;5 style sheet to ensure proper styling of the editor interface. The style sheet should be included in the head section of your HTML document. Then, include the CKEditor&nbsp;5 JavaScript file that contains the editor engine and core functionality. This script should be loaded after jQuery but before your custom initialization code.

Here are the required CDN links for CKEditor&nbsp;5:

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
```

Now, modify your existing jQuery integration to include CKEditor&nbsp;5 initialization. You can use jQuery's document ready function to ensure the DOM is fully loaded before initializing the editor. The CKEditor&nbsp;5 initialization code should be placed within the jQuery ready function to ensure proper timing and availability of all required resources.

Here is the complete integration code combining jQuery and CKEditor&nbsp;5:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CKEditor&nbsp;5 with jQuery Integration</title>

	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />

	<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
</head>
<body>
	<div id="editor">
		<p>Hello from CKEditor&nbsp;5 with jQuery!</p>
	</div>

	<script>
		$( document ).ready( () => {
			const {
				ClassicEditor,
				Essentials,
				Bold,
				Italic,
				Font,
				Paragraph
			} = CKEDITOR;

			ClassicEditor
				.create( $( '#editor' )[ 0 ], {
					licenseKey: '<YOUR_LICENSE_KEY>',
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
	</script>
</body>
</html>
```

## Installing CKEditor&nbsp;5 Premium Features from CDN

To extend your CKEditor&nbsp;5 and jQuery integration with premium features, you need to include additional resources from the CKEditor&nbsp;5 Premium Features CDN. Just like with the non-premium features, you need to include both CSS and JavaScript files for the premium features.

Start by adding the premium features style sheet to your HTML head section. This style sheet should be loaded after the main CKEditor&nbsp;5 style sheet to ensure proper cascading and override of styles when necessary. The premium features style sheet contains all the additional styles needed for premium UI components and features.

Here is the premium features style sheet link:

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
```

Next, include the premium features JavaScript file. This script should be loaded after the main CKEditor&nbsp;5 script but before your custom initialization code. The premium features script provides access to premium plugins and functionality that you can then use in your editor configuration.

Here is the premium features script tag:

```html
<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
```

Update your jQuery integration code to include premium features. You can import premium plugins from the `CKEDITOR_PREMIUM_FEATURES` object and add them to your editor configuration. For example, you can add the Format Painter feature which allows users to copy formatting from one text selection and apply it to another.

Here is the complete integration with premium features:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CKEditor&nbsp;5 with jQuery and Premium Features</title>

	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />

	<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
	<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
</head>
<body>
	<div id="editor">
		<p>Hello from CKEditor&nbsp;5 with jQuery and Premium Features!</p>
	</div>

	<script>
		$( document ).ready( () => {
			const {
				ClassicEditor,
				Essentials,
				Bold,
				Italic,
				Font,
				Paragraph
			} = CKEDITOR;
			const { FormatPainter } = CKEDITOR_PREMIUM_FEATURES;

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
	</script>
</body>
</html>
```

### Obtaining a premium features license key

To activate CKEditor&nbsp;5 premium features, you will need a commercial license. The easiest way to get one is to sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free).

You can also [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. To obtain an activation key, please follow the {@link getting-started/licensing/license-key-and-activation License key and activation} guide.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
