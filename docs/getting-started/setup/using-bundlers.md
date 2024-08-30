---
category: setup
meta-title: Using bundlers | CKEditor 5 documentation
order: 130
modified_at: 2024-08-30
---

# Using bundlers to bundle CKEditor&nbsp;5

This guide will show you how to configure popular bundlers like **Vite**, **esbuild**, **Rollup**, and **webpack** to build applications using CKEditor&nbsp;5. Showing how to set up or use these bundlers is not the goal of this guide.

Note that CKEditor&nbsp;5 ships plain ES2022 JavaScript modules and CSS files. Therefore, with recent enough bundlers, you should be able to use CKEditor&nbsp;5 without any additional configuration. Or &ndash; in the case of Rollup and webpack &ndash; only with a standard set of plugins.

## Bundling CKEditor&nbsp;5 with Vite

There is no need for any special configuration to bundle CKEditor&nbsp;5 with recent versions of Vite. Follow the {@link getting-started/quick-start#installing-ckeditor-5-using-npm npm installation guide} to learn more.

## Bundling CKEditor&nbsp;5 with esbuild

Similarly, you need no special configuration to bundle CKEditor&nbsp;5 with recent versions of esbuild. Follow the {@link getting-started/quick-start#installing-ckeditor-5-using-npm npm installation guide} to learn more.

## Bundling CKEditor&nbsp;5 with Rollup

To bundle CKEditor&nbsp;5 with Rollup, you need to install the following plugins:

1. `@rollup/plugin-node-resolve` &ndash; to allow Rollup to resolve dependencies.
2. `@rollup/plugin-commonjs` &ndash; to convert CommonJS modules to ES6.
3. `rollup-plugin-import-css` or `rollup-plugin-styles` &ndash; to allow Rollup to handle CSS files.
4. `@rollup/plugin-json` &ndash; to allow Rollup to handle JSON files.
5. `@rollup/plugin-terser` &ndash; to minify the output.

Here is an example `rollup.config.js` file:

```js
// rollup.config.js
import { defineConfig } from 'rollup';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-import-css';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const sourceMap = true; // Change depending on your needs.
const minify = true; // Change depending on your needs.

export default defineConfig( {
	// Other options are omitted for better readability.
	plugins: [
		commonjs( {
			sourceMap,
			defaultIsModuleExports: true
		} ),
		nodeResolve( {
			browser: true,
			preferBuiltins: false
		} ),
		json(),
		css( {
			minify
		} ),
		minify && terser( {
			sourceMap
		} )
	]
} );
```

## Bundling CKEditor&nbsp;5 with webpack

To bundle CKEditor&nbsp;5 with webpack, you need to install the following plugins:

1. `mini-css-extract-plugin` &ndash; to extract CSS to a separate file.
2. `css-minimizer-webpack-plugin` &ndash; to minify CSS.
3. `terser-webpack-plugin` &ndash; to minify JavaScript.

Here is an example `webpack.config.js` file:

```js
// webpack.config.js
const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const CssMinimizerPlugin = require( 'css-minimizer-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );

const sourceMap = true; // Change depending on your needs.
const minify = true; // Change depending on your needs.

module.exports = {
	// Other options are omitted for better readability.
	optimization: {
		minimize: minify,
		minimizer: [
			new TerserPlugin(),
			new CssMinimizerPlugin()
		]
	},
	plugins: [
		new MiniCssExtractPlugin()
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			}
		]
	}
};
```

Some setups and meta-frameworks based on webpack (such as Next.js), may use `babel-loader` to transpile JavaScript to a lower version. If the version of `babel-loader`, `@babel/core`, and `@babel/preset-env` are recent enough, you should be able to use CKEditor&nbsp;5 without any additional configuration. However, projects using older versions of these packages may encounter the `Module parse failed: Unexpected token` error. It is caused by some ES2022 features that CKEditor&nbsp;5 uses, such as native class properties. To address this issue, you need to add the [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/babel-plugin-transform-class-properties) plugin to your Babel configuration.

However, to avoid similar issues when CKEditor&nbsp;5 starts using other modern features in the future, we recommend updating `babel-loader`, `@babel/core`, and `@babel/preset-env` to the latest possible versions.
