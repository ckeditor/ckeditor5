---
menu-title: Non-JS frameworks
category: frameworks
order: 70
---

# Compatibility with non-JavaScript frameworks

As a pure JavaScript/TypeScript application, CKEditor 5 will work inside any environment that supports such components. While we don't offer official integrations for any non-JS frameworks, you can include a build of CKEditor 5 created via the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) in a framework of your choice.

## Compatibility with Laravel

CKEditor 5 is compatible with the PHP-based [Laravel](https://laravel.com/). Once you have your custom build of the editor ready, extract the `.zip` folder obtained from the online builder and place it in the `public` directory in your app. Your folder structure should resemble this one:

````
├── app
├── bootstrap
├── config
├── database
├── public
│   ├── ckeditor5
│   ├── .htaccess
│   ├── favicon.ico
│   ├── index.php
│   ├── robots.txt
│   └── webpack.config.js
├── resources
├── routes
└── ...
````

Then, modify the `welcome.blade.php` file contained in `resources` > `views` to include the CKEditor 5 script. You can use this HTML boilerplate as a starting point:

````
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="/ckeditor5/build/ckeditor.js"></script>
  <title>CKE5 in Laravel</title>
</head>
<body>
    <h1>Welcome to CKEditor 5 in Laravel</h1>
    <div id="editor"></div>
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

Finally, in the root of your Laravel project, run `php artisan serve` to see the app in action.

## Compatibility with .NET

You can also use CKEditor 5 in Microsoft's [.NET](https://dotnet.microsoft.com/). The code samples below are from a .NET [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) app. To see CKEditor 5 running in .NET, extract the `.zip` containing your custom editor and place it into the `wwwroot` directory in your app. Your folder structure should resemble this one:

````
├── bin
├── Data
├── obj
├── Pages
├── Properties
├── Shared
├── wwwroot
│   ├── ckeditor5
│   ├── css
│   ├── favicon.ico
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

    <script src="/ckeditor5/build/ckeditor.js"></script>
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