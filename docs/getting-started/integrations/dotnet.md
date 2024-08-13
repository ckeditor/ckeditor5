---
category: self-hosted
meta-title: Compatibility with .NET | CKEditor 5 documentation
meta-description: Install, integrate and configure CKEditor 5 using .NET with npm or ZIP.
order: 80
menu-title: .NET
---

# Compatibility with .NET

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, Microsoft's [.NET](https://dotnet.microsoft.com/).

## Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor&nbsp;5 in your .NET project is preparing an editor preset with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and including it into your project. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:

* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

## Setting up the project

For the purpose of this guide, we will use a basic ASP.NET Core project created with `dotnet new webapp`. You can refer to the [ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-7.0) to learn how to set up a project in the framework.

## Integrating using ZIP

<info-box>
	Our new CKEditor&nbsp;5 Builder does not provide ZIP output yet &ndash; but it will in the future. In the meantime, you can use one of the generic ZIP packages provided [on the download page](https://ckeditor.com/ckeditor-5/download/#zip).
</info-box>

After downloading and unpacking the ZIP archive, copy the `ckeditor5.js` and `ckeditor5.css` files in the `wwwroot/assets/vendor/` directory. The folder structure of your app should resemble this one.

```plain
├── bin
├── obj
├── Pages
│   ├── Index.cshtml
│   └── ...
├── Properties
├── wwwroot
│   ├── assets
|      ├── vendor
|          ├── ckeditor5.js
|          └── ckeditor5.css
│   ├── css
│   ├── js
│   ├── lib
│   └── favicon.ico
├── appsettings.Development.json
├── appsettings.json
└── ...
```

Having all the dependencies of CKEditor&nbsp;5, modify the `Index.cshtml` file in the `Pages` directory to import them. All the necessary markup is in the `index.html` file from the ZIP archive. You can copy and paste it into your page. Pay attention to the paths of the import map and CSS link - they should reflect your folder structure. The template should look similar to the one below:

```html
@page
@model IndexModel
@{
	ViewData["Title"] = "Home page";
}

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

Finally, in the root directory of your .NET project, run `dotnet watch run` to see the app in action.
