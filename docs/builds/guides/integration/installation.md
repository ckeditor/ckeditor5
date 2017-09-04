---
# Scope:
# - Guidance on all possible installation options.

title: Installation
category: builds-integration
order: 10
---

## Download options

The goal of installing any of the CKEditor 5 builds is to enable you to use its API when integrating it inside your application. For that purpose, several options are available:

* [Zip download](#Zip-download)
* [CDN](#CDN)
* [npm](#npm)

Each of the builds has independent release packages. Check the {@link builds/guides/overview#Builds Overview} page for the list of available builds.

### Zip download

Go to https://ckeditor.com/ckeditor5-builds/download and download your preferred build. For example, you may download the `ckeditor5-build-classic-1.0.0.zip` file for the Classic editor build.

Extract the above `.zip` file into a dedicated directory inside your website or application.

The main entry point script will then be available at `<your-path>/ckeditor/build/ckeditor.js`.

### CDN

Builds can be loaded inside pages directly from our CDN, which is optimized for worldwide super fast download.

Check out the {@linkTODO CKEditor 5 Builds CDN website} for a list of URL entry points for the builds API.

### npm

All builds are released on npm. [Use this search link](https://www.npmjs.com/search?q=keywords:ckeditor5-build&page=1&ranking=optimal) to view all build packages available in npm.

Installing a classic build with npm is as simple as calling the following inside your website or application:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

The script entry point for the build class will then be found at `node_modules/ckeditor5-build-classic/build/ckeditor.js`.

## Included files

The following are the main files available in all build distributions:

* `build/ckeditor.js` &ndash; The main UMD distribution script, containing the editor and all plugins.
* `ckeditor.js` &ndash; The source entry point of the build. It can be used for complex bundling and development. Based on it the `build/ckeditor.js` is created (by webpack).
* `build-config.js` &ndash; The build configuration, based on which the `ckeditor.js` file is created.

## Loading the API

Once downloaded and installed in your application, it is time to make the API available in your pages. For that purpose, it is enough to load the API entry point script:

```html
<script src="/ckeditor/build/ckeditor.js"></script>
```

<info-box>
	The `build/ckeditor.js` file is generated in the [UMD format](https://github.com/umdjs/umd) so you can also import it to your application if you use CommonJS modules (like in Node.js) or AMD modules (like in Require.js). Read more in the {@link builds/guides/integration/basic-api Basic API guide}.

	Also, for a more advanced setup, you may wish to bundle the CKEditor script with other scripts used by your application. See {@linkTODO Bundling} for more information about it.
</info-box>

Once the CKEditor script is loaded, you can {@link builds/guides/integration/basic-api use the API} to create editors in your page.

