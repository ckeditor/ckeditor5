---
category: cloud
meta-title: Using CKEditor 5 with .NET from CDN | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with .NET using CDN.
order: 90
menu-title: .NET
---

# Integrating CKEditor&nbsp;5 with .NET from CDN

As a pure JavaScript/TypeScript library, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, Microsoft's [.NET](https://dotnet.microsoft.com/).

{@snippet getting-started/use-builder}

## Setting up the project

For the purpose of this guide, we will use a basic ASP.NET Core project created with `dotnet new webapp`. You can refer to the [ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-7.0) to learn how to set up a project in the framework.

## Using from CDN

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

The folder structure of the created project should resemble the one below:

```plain
├── bin
├── obj
├── Pages
│   ├── Index.cshtml
│   └── ...
├── Properties
├── wwwroot
│   ├── css
│   ├── js
│   ├── lib
│   └── favicon.ico
├── appsettings.Development.json
├── appsettings.json
└── ...
```

First, modify the `Index.cshtml` file in the `Pages` directory to include the CKEditor&nbsp;5 scripts and styles. All necessary scripts and links are in the HTML snippet below. You can copy and paste them into your template. Open-source and premium features are in separate files, so there are different tags for both types of plugins. Add tags for premium features only if you use them.

```html
@page
@model IndexModel
@{
	ViewData["Title"] = "Home page";
}

<div class="text-center">
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

	<div class="main-container">
		<div id="editor">
			<p>Hello from CKEditor 5!</p>
		</div>
    </div>
</div>
```

Both attached earlier scripts expose global variables named `CKEDITOR` and `CKEDITOR_PREMIUM_FEATURES`. You can use them to access the editor class and plugins. In our example, we use object destructuring (JavaScript feature) to access the editor class from the open-source global variable with a basic set of plugins. You can access premium plugins from the other variable the same way. Then, we pass the whole configuration to the `create()` method. Be aware that you need a proper {@link getting-started/licensing/license-key-and-activation license key} to use premium features.

```js
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
```

Now, we need to put our script in the previous template. We put it under the `<div>` element, so the editor can attach to it. Your final template should look like this:

```html
@page
@model IndexModel
@{
	ViewData["Title"] = "Home page";
}

<div class="text-center">
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
</div>
```

Finally, in the root directory of your .NET project, run `dotnet watch run` to see the app in action.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
