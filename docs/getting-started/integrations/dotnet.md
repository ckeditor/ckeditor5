---
category: installation
meta-title: Compatibility with .NET | CKEditor 5 documentation
order: 80
menu-title: .NET
---

# Compatibility with .NET

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom build of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, Microsoft's [.NET](https://dotnet.microsoft.com/).

## Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor&nbsp;5 in your .NET project is preparing an editor preset with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and including it into your project. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:
* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

## Setting up the project

For the purpose of this guide, we will use a basic ASP.NET Core project created with `dotnet new webapp`. You can refer to the [ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-7.0) to learn how to set up a project in the framework.

## Integrating from CDN

Once the project has been prepared, create an `assets/vendor/ckeditor5.js` file in the existing `wwwroot` directory in your app. Your folder structure should resemble this one:

````plain
├── bin
├── obj
├── Pages
├── Properties
├── wwwroot
│   ├── assets
|      ├── vendor
|          └── ckeditor.js
│   ├── css
│   ├── js
│   ├── lib
│   └── favicon.ico
├── appsettings.Development.json
├── appsettings.json
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

Then, modify the `Index.cshtml` file in the `Pages` directory to include the CKEditor 5 scripts. All necessary scripts and links are in the HTML snippet from CKEditor&nbsp;5 Builder. You can copy and paste them into your template. It should look similar to the one below:

```html
@page
@model IndexModel
@{
	ViewData["Title"] = "Home page";
}

<div class="text-center">
	<div id="editor"></div>
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
	<script type="module" src="assets/vendor/ckeditor.js"></script>
</div>
```

Finally, in the root directory of your .NET project, run `dotnet watch run` to see the app in action.
