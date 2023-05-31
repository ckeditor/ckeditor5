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

For the purpose of this guide, we will use a basic .NET [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) project. You can refer to the [Blazor documentation](https://dotnet.microsoft.com/en-us/learn/aspnet/blazor-tutorial/intro) to learn how to set up a project in the framework.

Once the project has been prepared, create an `assets/vendor` directory in the existing `wwwroot` directory in your app. Your folder structure should resemble this one:

````
├── bin
├── Data
├── obj
├── Pages
├── Properties
├── Shared
├── wwwroot
│   ├── assets
|      └── vendor
│   ├── css
│   └── favicon.ico
├── _Imports.razor
├── App.razor
└── ...
````

## Integrating the build in your .NET project

Once you have your custom build of the editor ready, and the .NET project has been set up, extract the `.zip` folder obtained from the online builder and place it in the `assets/vendor` directory created in the previous step. Your folder structure should now look like this:

````
├── bin
├── Data
├── obj
├── Pages
├── Properties
├── Shared
├── wwwroot
│   ├── assets
|      ├── vendor
|          └── ckeditor5
│   ├── css
│   └── favicon.ico
├── _Imports.razor
├── App.razor
└── ...
````

Then, modify the `_Host.cshtml` file contained in the `Pages` directory to include the CKEditor 5 script. You can use this HTML boilerplate as a starting point:

````
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <base href="~/" />
    <link rel="stylesheet" href="css/bootstrap/bootstrap.min.css" />
    <link href="css/site.css" rel="stylesheet" />
    <link href="dotnet-ckeditor.styles.css" rel="stylesheet" />
    <link rel="icon" type="image/png" href="favicon.png"/>
    <component type="typeof(HeadOutlet)" render-mode="ServerPrerendered" />
</head>
<body>
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
</body>
</html>
````

Finally, in the root of your .NET Blazor project, run `dotnet watch` to see the app in action.