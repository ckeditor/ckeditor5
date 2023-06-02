---
category: integrations
order: 80
menu-title: .NET
---

# Compatibility with .NET

As a pure JavaScript/TypeScript application, CKEditor 5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom build of CKE5 in a non-JS framework of your choice, for example, Microsoft's [.NET](https://dotnet.microsoft.com/).

The core of the integration is preparing a build of CKEditor 5 with the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), and then importing it into your .NET project.

## Preparing a build

The easiest way of preparing a custom build of CKEditor 5 is to use our [online builder](https://ckeditor.com/ckeditor-5/online-builder/). It is a powerful tool that lets you efortlessly create a rich text editor that is custom-tailored to your needs. With the online builder, you can choose the desired editor type, plugins, configure the toolbar, and choose the UI language for your editor.

You can learn more about creating custom builds of CKE5 via the online builder in our {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Customized installation guide}.

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

Once you have your custom build of the editor ready, and the .NET project has been set up, extract the `.zip` folder obtained from the online builder and place it in the `assets/vendor` directory created in the previous step. Your folder structure should now look like this:

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

Then, modify the `Index.cshtml` file contained in the `Pages` directory to include the CKEditor 5 script. You can use this HTML boilerplate as a starting point:

````
@page
@model IndexModel
@{
    ViewData["Title"] = "Home page";
}

<div class="text-center">
    <h1>Welcome to CKEditor 5 in .NET</h1>
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
````

Finally, in the root of your .NET project, run `dotnet watch run` to see the app in action.