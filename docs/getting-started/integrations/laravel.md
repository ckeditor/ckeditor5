---
category: installation
meta-title: Compatibility with Laravel | CKEditor 5 documentation
order: 70
menu-title: Laravel
---

# Compatibility with Laravel

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom build of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, the PHP-based [Laravel](https://laravel.com/).

## Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor&nbsp;5 in your Laravel project is preparing an editor preset with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=preset) and including it into your project. It offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:
* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

## Setting up the project

This guide assumes you have a Laravel project. You can create a basic Laravel project using [Composer](https://getcomposer.org/). Refer to the [Laravel documentation](https://laravel.com/docs/10.x/installation) to learn how to set up a project in the framework.

## Integrating from CDN

Once the project has been prepared, create an `assets/vendor/ckeditor5.js` file in the existing `public` directory in your app. Your folder structure should resemble this one:

````plain
├── app
├── bootstrap
├── config
├── database
├── public
│   ├── assets
|      ├── vendor
|          └── ckeditor.js
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
````

Inside the file, paste the JavaScript code from CKEditor&nbsp;5 Builder. The code will differ depending on your chosen preset and features. But it should look similar to this:

```js
import {
	ClassicEditor,
	AccessibilityHelp,
	Autosave,
	Bold,
	Essentials,
	Italic,
	Mention,
	Paragraph,
	SelectAll,
	Undo
} from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

const editorConfig = {
	toolbar: {
		items: ['undo', 'redo', '|', 'selectAll', '|', 'bold', 'italic', '|', 'accessibilityHelp'],
		shouldNotGroupWhenFull: false
	},
	placeholder: 'Type or paste your content here!',
	plugins: [AccessibilityHelp, Autosave, Bold, Essentials, Italic, Mention, Paragraph, SelectAll, SlashCommand, Undo],
	licenseKey: '<YOUR_LICENSE_KEY>',
	mention: {
		feeds: [
			{
				marker: '@',
				feed: [
					/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
				]
			}
		]
	},
	initialData: "<h2>Congratulations on setting up CKEditor 5! 🎉</h2>"
};

ClassicEditor
	.create( document.querySelector( '#editor' ), editorConfig )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

Then, modify the `welcome.blade.php` file in the `resources/views` directory to include the CKEditor&nbsp;5 scripts. All necessary scripts and links are in the HTML snippet from CKEditor&nbsp;5 Builder. You can copy and paste them into your template. It should look similar to the one below:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>CKE5 in Laravel</title>
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
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
	<script type="module" src="{{ URL::asset('assets/vendor/ckeditor.js') }}"></script>
</head>
<body>
    <div id="editor"></div>
</body>
</html>
```

Finally, in the root directory of your Laravel project, run `php artisan serve` to see the app in action.
