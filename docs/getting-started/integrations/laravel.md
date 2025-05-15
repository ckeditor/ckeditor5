---
category: self-hosted
meta-title: Using CKEditor 5 with Laravelfrom ZIP archive | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Laravel using a ZIP archive.
order: 80
menu-title: Laravel
---

# Integrating CKEditor&nbsp;5 with Laravel from ZIP

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, the PHP-based [Laravel](https://laravel.com/).

{@snippet getting-started/use-builder}

## Setting up the project

This guide assume you have a Laravel project. You can create a basic Laravel project using [Composer](https://getcomposer.org/). Refer to the [Laravel documentation](https://laravel.com/docs/10.x/installation) to learn how to set up a project in the framework.

## Integrating using ZIP

After downloading and unpacking the ZIP archive, copy the `ckeditor5.js` and `ckeditor5.css` files in the `public/assets/vendor/` directory. The folder structure of your app should resemble this one.

```plain
├── app
├── bootstrap
├── config
├── database
├── public
│   ├── assets
|      ├── vendor
|          ├── ckeditor5.js
|          └── ckeditor5.css
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

Having all the dependencies of CKEditor&nbsp;5, modify the `welcome.blade.php` file in the `resources/views` directory to import them. All the necessary markup is in the `index.html` file from the ZIP archive. You can copy and paste it into your template. Pay attention to the paths of the import map and CSS link &ndash; they should reflect your folder structure. The template should look similar to the one below:

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from ZIP:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>CKEditor 5 - Quick start ZIP</title>
		<link rel="stylesheet" href="../../assets/vendor/ckeditor5.css">
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
		<script type="importmap">
			{
				"imports": {
					"ckeditor5": "../../assets/vendor/ckeditor5.js",
					"ckeditor5/": "../../assets/vendor/"
				}
			}
		</script>
		<script type="module">
			import {
				ClassicEditor,
				Essentials,
				Paragraph,
				Bold,
				Italic,
				Font
			} from 'ckeditor5';

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
					plugins: [ Essentials, Paragraph, Bold, Italic, Font ],
					toolbar: [
						'undo', 'redo', '|', 'bold', 'italic', '|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
					]
				} )
				.then( editor => {
					window.editor = editor;
				} )
				.catch( error => {
					console.error( error );
				} );
		</script>
	</body>
</html>
```

Finally, in the root directory of your Laravel project, run `php artisan serve` to see the app in action.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
