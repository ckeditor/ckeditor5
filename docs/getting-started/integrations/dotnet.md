---
category: installation
meta-title: Compatibility with .NET | CKEditor 5 documentation
order: 80
menu-title: .NET
---

# Compatibility with .NET

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom build of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, Microsoft's [.NET](https://dotnet.microsoft.com/).

## Quick start

The easiest way to use CKEditor&nbsp;5 in your .NET project is preparing an editor build with [Builder](https://ckeditor.com/builder?redirect=docs) and importing it into your project. Prepare an editor with the desired set of features and download it.

## Setting up the project

For the purpose of this guide, we will use a basic ASP.NET Core project created with `dotnet new webapp`. You can refer to the [ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/getting-started/?view=aspnetcore-7.0) to learn how to set up a project in the framework.

Once the project has been prepared, create an `assets/vendor` directory in the existing `wwwroot` directory in your app. Your folder structure should resemble this one:

````
├── bin
├── obj
├── Pages
├── Properties
├── wwwroot
│   ├── assets
|      └── vendor
│   ├── css
│   ├── js
│   ├── lib
│   └── favicon.ico
├── appsettings.Development.json
├── appsettings.json
└── ...
````

## Integrating the build in your .NET project

Once you have your custom editor build ready and the .NET project has been set up, extract the `.zip` folder obtained from the online builder and place it in the `assets/vendor` directory created in the previous step. Your folder structure should now look like this:

````
├── bin
├── obj
├── Pages
├── Properties
├── wwwroot
│   ├── assets
|      ├── vendor
|          └── ckeditor5
│   ├── css
│   ├── js
│   ├── lib
│   └── favicon.ico
├── appsettings.Development.json
├── appsettings.json
└── ...
````

<info-box>
    Note that the name of the original `.zip` folder from the online builder has been shortened here to `ckeditor5`.
</info-box>

Then, modify the `Index.cshtml` file contained in the `Pages` directory to include the CKEditor&nbsp;5 script. You can use this HTML boilerplate as a starting point:

```html
@page
@model IndexModel
@{
    ViewData["Title"] = "Home page";
}

<div class="text-center">
    <h1>Welcome to CKEditor&nbsp;5 in .NET</h1>
    <div id="editor"></div>
    <script src="assets/vendor/ckeditor5/build/ckeditor.js"></script>
    <script>
        ClassicEditor
            .create( document.querySelector( '#editor' ) )
            .catch( error => {
                console.error( error );
            } );
    </script>
</div>
```

<info-box>
    In the snippet above, `ClassicEditor` is referenced, since that is the editor type that was chosen during the build process. If you are using a different editor type, you will have to alter the snippet accordingly.
</info-box>

Finally, in the root directory of your .NET project, run `dotnet watch run` to see the app in action.
