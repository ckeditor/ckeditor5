---
category: cloud
meta-title: Using CKEditor 5 with Laravel from CDN | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Laravel using CDN.
order: 80
menu-title: Laravel
---

# Integrating CKEditor&nbsp;5 with Laravel from CDN

As a pure JavaScript/TypeScript library, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, the PHP-based [Laravel](https://laravel.com/).

{@snippet getting-started/use-builder}

## Setting up the project

This guide assume you have a Laravel project. You can create a basic Laravel project using [Composer](https://getcomposer.org/). Refer to the [Laravel documentation](https://laravel.com/docs/10.x/installation) to learn how to set up a project in the framework.

## Using from CDN

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

The folder structure of the created project should resemble the one below:

```plain
├── app
├── bootstrap
├── config
├── database
├── public
│   ├── .htaccess
│   ├── favicon.ico
│   ├── index.php
│   └── robots.txt
├── resources
│   ├── views
|      ├── welcome.blade.php
|      └── ...
├── routes
└── ...
```

First, modify the `welcome.blade.php` file in the `resources/views` directory to include the CKEditor&nbsp;5 scripts and styles. All necessary scripts and links are in the HTML snippet below. You can copy and paste them into your template. Open-source and premium features are in separate files, so there are different tags for both types of plugins. Add tags for premium features only if you use them.

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CKEditor 5 - Quick start CDN</title>
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
	<!-- Add if you use premium features. -->
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
	<!--  -->
	<style>
	.main-container {
		width: 795px;
		margin-left: auto;
		margin-right: auto;
	}
    </style>
</head>
<body>
	<div class="main-container">
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>
    </div>
</body>
</html>
```

Both previously attached scripts expose global variables named `CKEDITOR` and `CKEDITOR_PREMIUM_FEATURES`. You can use them to access the editor class and plugins. In our example, we use object destructuring (JavaScript feature) to access the editor class from the open-source global variable with a basic set of plugins. You can access premium plugins from the other variable the same way. Then, we pass the whole configuration to the `create()` method. Be aware that you need a proper {@link getting-started/licensing/license-key-and-activation license key} to use premium features.

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

Now, we need to put our script in the previous template. We need to put the script under the `<div>` element, so the editor can attach to it. Your final template should look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CKEditor 5 - Quick start CDN</title>
    <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.css" />
    <script src="https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.umd.js"></script>
    <!-- Add if you use premium features. -->
    <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/43.0.0/ckeditor5-premium-features.css" />
    <script src="https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5-premium-features.umd.js"></script>
	<!--  -->
	<style>
		.main-container {
			width: 795px;
			margin-left: auto;
			margin-right: auto;
		}
    </style>
</head>
<body>
    <div class="main-container">
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>
    </div>
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

Finally, in the root directory of your Laravel project, run `php artisan serve` to see the editor in action.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
