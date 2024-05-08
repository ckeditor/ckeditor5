---
category: installation
meta-title: Compatibility with Laravel | CKEditor 5 documentation
order: 70
menu-title: Laravel
---

# Compatibility with Laravel

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom build of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, the PHP-based [Laravel](https://laravel.com/).

## Quick start

The easiest way to use CKEditor&nbsp;5 in your Laravel project is preparing an editor build with [Builder](https://ckeditor.com/builder?redirect=docs) and importing it into your project. Prepare an editor with the desired set of features and download it.

## Setting up the project

For the purpose of this guide, we will use a basic Laravel project created with [Composer](https://getcomposer.org/). You can refer to the [Laravel documentation](https://laravel.com/docs/10.x/installation) to learn how to set up a project in the framework.

Once the project has been prepared, create an `assets/vendor` directory in the existing `public` directory in your app. Your folder structure should resemble this one:

````
├── app
├── bootstrap
├── config
├── database
├── public
│   ├── assets
|      └── vendor
│   ├── .htaccess
│   ├── favicon.ico
│   ├── index.php
│   ├── robots.txt
│   └── webpack.config.js
├── resources
├── routes
└── ...
````

## Integrating the build in your Laravel project

Once you have your custom editor build ready and the Laravel project has been set up, extract the `.zip` folder obtained from the online builder and place it in the `assets/vendor` directory created in the previous step. Your folder structure should now look like this:

````
├── app
├── bootstrap
├── config
├── database
├── public
│   ├── assets
|      ├── vendor
|          └── ckeditor5
│   ├── .htaccess
│   ├── favicon.ico
│   ├── index.php
│   ├── robots.txt
│   └── webpack.config.js
├── resources
├── routes
└── ...
````

<info-box>
    Note that the name of the original `.zip` folder from the online builder has been shortened here to `ckeditor5`.
</info-box>

Then, modify the `welcome.blade.php` file contained in the `resources/views` directory to include the CKEditor&nbsp;5 script. You can use this HTML boilerplate as a starting point:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="assets/vendor/ckeditor5/build/ckeditor.js"></script>
  <title>CKE5 in Laravel</title>
</head>
<body>
    <h1>Welcome to CKEditor&nbsp;5 in Laravel</h1>
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
```

<info-box>
    In the snippet above, `ClassicEditor` is referenced, since that is the editor type that was chosen during the build process. If you are using a different editor type, you will have to alter the snippet accordingly.
</info-box>

Finally, in the root directory of your Laravel project, run `php artisan serve` to see the app in action.
