---
# Scope:
# - Guidance on all possible installation options.

category: builds-integration
order: 10
---

# Installation

## Download options

There are several options to download CKEditor 5 builds:

* [CDN](#cdn)
* [npm](#npm)
* [Online builder](#online-builder)
* [Zip download](#zip-download)

For the list of available builds check the {@link builds/guides/overview#available-builds Overview} page.

After downloading the editor jump to the {@link builds/guides/integration/basic-api Basic API guide} to see how to create editors.

### CDN

Builds can be loaded inside pages directly from [CKEditor CDN](https://cdn.ckeditor.com/#ckeditor5), which is optimized for worldwide super fast content delivery. When using CDN no download is actually needed.

### npm

All builds are released on npm. [Use this search link](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor) to view all official build packages available in npm.

Installing a build with npm is as simple as calling one of the following commands in your project:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
# Or:
npm install --save @ckeditor/ckeditor5-build-inline
# Or:
npm install --save @ckeditor/ckeditor5-build-balloon
# Or:
npm install --save @ckeditor/ckeditor5-build-balloon-block
# Or:
npm install --save @ckeditor/ckeditor5-build-decoupled-document
```

CKEditor will then be available at `node_modules/@ckeditor/ckeditor5-build-[name]/build/ckeditor.js`. It can also be imported directly to your code by `require( '@ckeditor/ckeditor5-build-[name]' )`.

### Online builder

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

### Zip download

Go to the [CKEditor 5 builds download page](https://ckeditor.com/ckeditor-5-builds/download/) and download your preferred build. For example, you may download the `ckeditor5-build-classic-1.0.0.zip` file for the Classic editor build.

Extract the `.zip` file into a dedicated directory inside your project. It is recommended to include the editor version in the directory name to ensure proper cache invalidation once a new version of CKEditor is installed.

#### Included files

* `ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `ckeditor.js.map` &ndash; The source map for the editor bundle.
* `translations/` &ndash; The editor UI translations (see {@link features/ui-language Setting the UI language}).
* `README.md` and `LICENSE.md`

## Loading the API

After downloading and installing a CKEditor 5 build in your application, it is time to make the editor API available in your pages. For that purpose, it is enough to load the API entry point script:

```html
<script src="[ckeditor-build-path]/ckeditor.js"></script>
```

Once the CKEditor script is loaded, you can {@link builds/guides/integration/basic-api use the API} to create editors in your page.

<info-box>
	The `build/ckeditor.js` file is generated in the [UMD format](https://github.com/umdjs/umd) so you can also import it into your application if you use ES6 modules, CommonJS modules (like in Node.js) or AMD modules (like in Require.js). Read more in the {@link builds/guides/integration/basic-api#umd-support Basic API guide}.

	Also, for a more advanced setup, you may wish to bundle the CKEditor script with other scripts used by your application. See {@link builds/guides/integration/advanced-setup Advanced setup} for more information about it.
</info-box>

