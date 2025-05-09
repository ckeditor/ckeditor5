---
category: self-hosted
meta-title: Using CKEditor 5 with .NETfrom ZIP archive | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with .NET using a ZIP archive.
order: 90
menu-title: .NET
---

# Integrating CKEditor&nbsp;5 with .NET from ZIP

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, Microsoft's [.NET](https://dotnet.microsoft.com/).

{@snippet getting-started/use-builder}

## Setting up the project

For the purpose of this guide, we will use a basic ASP.NET Core project created with `dotnet new webapp`. You can refer to the [ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-7.0) to learn how to set up a project in the framework.

## Integrating using ZIP

After downloading and unpacking the ZIP archive, copy the `ckeditor5.js` and `ckeditor5.css` files in the `wwwroot/lib/ckeditor5/` directory. The folder structure of your app should resemble this one.

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
|      ├── bootstrap
|      ├── ckeditor5
|          ├── ckeditor5.js
|          └── ckeditor5.css
|      ├── jquery
|      ├── jquery-validation
|      ├── jquery-validation-unobtrusive
│   └── favicon.ico
├── appsettings.Development.json
├── appsettings.json
└── ...
```

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from ZIP:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

Once you have all the dependencies of CKEditor&nbsp;5, modify the `Index.cshtml` file in the `Pages` directory to import them. All the necessary markup is in the `index.html` file from the ZIP archive. You can copy and paste it into the `<script>` tag of your page. Pay attention to the paths of the import map and CSS link &ndash; they should reflect your folder structure. The template should look similar to the one below:

```html
@page
@using Microsoft.AspNetCore.Components
@{
    ViewData["Title"] = "Home Page";
    var data = new ImportMapDefinition(
    new Dictionary<string, string>
    {
        { "ckeditor5", "/lib/ckeditor5/ckeditor5.js" },
        { "ckeditor5/", "/lib/ckeditor5/" },
    }, null, null);
}
<link href="~/lib/ckeditor5/ckeditor5.css" rel="stylesheet" />
<div class="main-container">
    <div id="editor">
        <p>Hello from CKEditor 5!</p>
    </div>
</div>
<script type="importmap" asp-importmap="@data"></script>
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
```
<info-box warning>
Due to a [bug](https://issues.chromium.org/issues/40611854), Chromium does not support multiple import maps yet. The .NET web app in the current version may already have an import map defined in the shared layout. If that is your case, remove the `<script type="importmap"></script>` tag from the `/Pages/Shared/__Layout.cshtml` file and you will be ready to run your application.
</info-box>

Finally, in the root directory of your .NET project, run `dotnet watch run` to see the app in action.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
