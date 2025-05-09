---
menu-title: Vanilla JS
meta-title: Vanilla JS CKEditor 5 installation - quick start from CDN | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using Vanilla JS with CDN.
category: cloud
order: 20
---

# Installing Vanilla JS CKEditor&nbsp;5 from CDN

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web application. This guide will show you the fastest way to start using it.

{@snippet getting-started/use-builder}

## Installing CKEditor&nbsp;5 from CDN

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

CDN is an alternative method of running CKEditor&nbsp;5. You can start using it in just a few steps and with a few tags.

Start by attaching a link to style sheets. They contain all styles for the editor's UI and content. You can also include your styles if you like. Refer to the {@link getting-started/setup/css#styling-the-published-content content styles} guide for more information.

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
```

<info-box>
	If you do not want to use the global variables presented below, you can continue from here and use an alternative, [more advanced setup with import maps](#advanced-setup-with-import-maps).
</info-box>

Then, you need to attach the script with the JavaScript code.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
```

The included script exposes the global variable named `CKEDITOR`. You can use object destructuring shown below to access the editor class and plugins.

```js
const {
	ClassicEditor,
	Essentials,
	Bold,
	Italic,
	Font,
	Paragraph
} = CKEDITOR;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [
			'undo', 'redo', '|', 'bold', 'italic', '|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Lastly, add a tag for the editor to attach to. Ensure the query selector matches the HTML element ID (or class).

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

A simple HTML page with the CKEditor may look like the one below.

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

        <script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>

        <script>
            const {
                ClassicEditor,
                Essentials,
                Bold,
                Italic,
                Font,
                Paragraph
            } = CKEDITOR;

            ClassicEditor
                .create( document.querySelector( '#editor' ), {
                    licenseKey: '<YOUR_LICENSE_KEY>',
                    plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
                    toolbar: [
                        'undo', 'redo', '|', 'bold', 'italic', '|',
                        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
                    ]
                } )
                .then( /* ... */ )
                .catch( /* ... */ );
        </script>
    </body>
</html>
```

## Installing premium features from CDN

Just like with open-source features, start by attaching a link to style sheets. They contain all styles for the editor's UI and content. The styles are in two separate style sheets &ndash; for open-source and premium plugins. You can also include your styles if you like. Refer to the {@link getting-started/setup/css#styling-the-published-content content styles} guide for more information.

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />

<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
```

<info-box>
	If you do not want to use the global variables presented below, you can continue from here and use an alternative, [more advanced setup with import maps](#advanced-setup-with-import-maps).
</info-box>

Then, you need to attach the script tags with the JavaScript code. Similar to style sheets, there are separate scripts for open-source and premium plugins.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>

<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
```

Both included scripts expose global variables named `CKEDITOR` and `CKEDITOR_PREMIUM_FEATURES`. You can use object destructuring shown below to access the editor class and plugins. Open-source and premium features are in the respective global variables.

```html
<script>
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
		.create( document.querySelector( '#editor' ), {
			licenseKey: '<YOUR_LICENSE_KEY>',
			plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
			toolbar: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
				'formatPainter'
			]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

Lastly, add a tag for the editor to attach to. Ensure the query selector matches the HTML element ID (or class).

```html
<div id="editor">
	<p>Hello from CKEditor 5!</p>
</div>
```

A simple HTML page with the CKEditor may look like the one below.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CKEditor 5 - Quick start CDN</title>
        <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
        <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
    </head>
    <body>
        <div id="editor">
            <p>Hello from CKEditor 5!</p>
        </div>

        <script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
        <script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>

        <script>
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
                .create( document.querySelector( '#editor' ), {
                    licenseKey: '<YOUR_LICENSE_KEY>',
                    plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
                    toolbar: [
                        'undo', 'redo', '|', 'bold', 'italic', '|',
                        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                        'formatPainter'
                    ]
                } )
                .then( /* ... */ )
                .catch( /* ... */ );
        </script>
    </body>
</html>
```

### Obtaining a premium features license key

To activate CKEditor&nbsp;5 premium features, you will need a commercial license. The easiest way to get one is to sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free).

You can also [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. To obtain an activation key, please follow the {@link getting-started/licensing/license-key-and-activation License key and activation} guide.

## Advanced setup with import maps

To simplify imports, you can use the feature available in browsers &ndash; the [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). It allows us to map an easy-to-remember specifier (like `ckeditor5` or `ckeditor5-premium-features`) to the full URL of the file from the CDN. We use this browser feature to share an editor engine code between plugins. Open source and premium plugins have their respective specifiers. Add mapping for premium features only if you use them.

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

Once you have added the import map, you can access the editor and its plugins using the defined specifiers. Now, you can use standard imports from the `ckeditor5` and `ckeditor5-premium-features` packages. Please note that to use premium features, you need to activate them with a proper license key, as mentioned in the [Obtaining a license key](#obtaining-a-premium-features-license-key) section.

<info-box warning>
	You must run your code on a local server to use import maps. Opening the HTML file directly in your browser will trigger security rules. These rules (CORS policy) ensure loading modules from the same source. Therefore, set up a local server, like `nginx`, `caddy`, `http-server`, to serve your files over HTTP or HTTPS.
</info-box>

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
			licenseKey: '<YOUR_LICENSE_KEY>',
			plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
			toolbar: [
				'undo', 'redo', '|', 'bold', 'italic', '|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'formatPainter'
			]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
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
					licenseKey: '<YOUR_LICENSE_KEY>',
					plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
					toolbar: [
						'undo', 'redo', '|', 'bold', 'italic', '|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'formatPainter'
					]
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
		</script>
	</body>
</html>
```

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
