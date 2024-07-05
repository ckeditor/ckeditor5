---
category: nim-migration
order: 30
menu-title: Migrating from legacy Online Builder
meta-title: Migrating from the legacy Online Builder to new installation methods | CKEditor 5 documentation
meta-description: Learn how to upgrade build from the legacy Online Builder to new installation methods.
modified_at: 2024-06-25
---

# Migrating from legacy Online Builder

There are three installation methods you can migrate to from the legacy Online Builder. The best option for you depends on whether you just want an out-of-the-box browser build, or if you want a customized and optimized build.

The npm package is the most flexible and powerful way to install CKEditor&nbsp;5. It allows you to create a custom build of the editor with only the features you need, thus significantly reducing the final size of the build. However, you will need a JavaScript bundler or meta-framework to create such a build.

If you do not want a build process, you can either use our CDN build or download the ZIP archive. Both of these include the editor and all plugins, so you can use all the features of CKEditor&nbsp;5 without setting up a build process.

## CDN build

The CDN build is a good option to quickly add CKEditor&nbsp;5 to your website without installing any dependencies or setting up a build process. We recommend using our new interactive [Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs) to customize the build to your needs. Then, in the `Installation` section of the Builder, you can select the `Cloud (CDN)` option to learn how to add the editor to your website.

## ZIP archive

If you do not want to have a build process or use our CDN build, you can download the ZIP archive from the [CKEditor&nbsp;5 download page](https://ckeditor.com/ckeditor-5/download/#zip). This archive contains the editor build with all its plugins, which you can extract and include on your website.

## npm package

If you decide to use the npm package, you can either use our new interactive [Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs) to create a new build, or you can update your existing project from the legacy Online Builder. **We recommend using the new interactive Builder**, but if you want to keep your existing build, you can follow the steps below.

1. Follow the steps in the {@link updating/nim-migration/customized-builds Migrating from customized builds} guide.

2. Once this is done, remove the old `build` folder and run the following command to create a new build of CKEditor&nbsp;5.

```bash
npm run build
```

3. There should be three files in the new `build` folder:

   * `ckeditor.d.ts`,
   * `ckeditor.js`,
   * `ckeditor.js.map`.

	Now you can start to remove some unused webpack plugins and update the `webpack.config.js` file.

4. Uninstall the following `devDependencies`:

```bash
npm uninstall \
@ckeditor/ckeditor5-dev-translations \
@ckeditor/ckeditor5-dev-utils \
@ckeditor/ckeditor5-theme-lark\
css-loader \
postcss \
postcss-loader \
raw-loader \
style-loader \
terser-webpack-plugin
```

5. Install the following packages:

```bash
npm install --save-dev \
css-loader \
css-minimizer-webpack-plugin \
mini-css-extract-plugin \
terser-webpack-plugin
```

6. Update the `webpack.config.js` file:

```js
'use strict';

/* eslint-env node */

const path = require( 'path' );
const TerserWebpackPlugin = require( 'terser-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const CssMinimizerPlugin = require( 'css-minimizer-webpack-plugin' );

module.exports = {
devtool: 'source-map',
performance: { hints: false },

entry: path.resolve( __dirname, 'src', 'ckeditor.ts' ),

output: {
	// The name under which the editor will be exported.
	library: 'ClassicEditor',

	path: path.resolve( __dirname, 'build' ),
	filename: 'ckeditor.js',
	libraryTarget: 'umd',
	libraryExport: 'default'
},

optimization: {
	minimize: true,
	minimizer: [
		new CssMinimizerPlugin(),
		new TerserWebpackPlugin( {
			terserOptions: {
				output: {
					// Preserve CKEditor&nbsp;5 license comments.
					comments: /^!/
				}
			},
			extractComments: false
		} )
	]
},

plugins: [
	new MiniCssExtractPlugin( {
		filename: 'ckeditor.css'
	} ),
],

resolve: {
	extensions: [ '.ts', '.js', '.json' ]
},

module: {
	rules: [
		{
			test: /\.ts$/,
			use: 'ts-loader'
		},
		{
			test: /\.css$/i,
			use: [ MiniCssExtractPlugin.loader, 'css-loader' ]
		}
	]
}
};
```

7. Add the following line to the `sample/index.html` file before other CSS files:

```html
<link rel="stylesheet" type="text/css" href="../build/ckeditor.css">
```

8. Delete the old `build` folder and run the following command to create a new build of CKEditor&nbsp;5.

```bash
npm run build
```

9. There should be five files in the new `build` folder:

   * `ckeditor.css`,
   * `ckeditor.css.map`,
   * `ckeditor.d.ts`,
   * `ckeditor.js`,
   * `ckeditor.js.map`.

The new build has two more files because the CSS is now separated from the JavaScript file, which should improve performance compared to the old approach. When updating your project that uses the `build` folder, remember to import this new CSS file as well.

Additionally, both the JavaScript and CSS files are now minified, potentially improving performance.

If you want to optimize the build further, follow the steps from the {@link getting-started/setup/optimizing-build-size Optimizing build size} guide.
