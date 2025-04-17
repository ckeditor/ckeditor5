---
category: setup
menu-title: Customizing icons
meta-title: Customizing icons | CKEditor 5 Documentation
meta-description: Learn how to customize editor icons.
order: 95
modified_at: 2025-04-07
---

# Customizing icons

CKEditor&nbsp;5 comes with a set of icons that are used in the editor UI. If you are using self-hosted installation method like npm or ZIP, you can customize the icons by overriding the default npm package that contains them.

There are two ways to do this, and both require overriding the `@ckeditor/ckeditor5-icons` package. One way is to create a custom icons package and override the default icons package in your project using a package manager. The other is to use resolve aliases to replace the icons during the build process.

Let's start with the first method.

## Overriding icons using package manager

### Prepare custom icons package

Inside your project, create a new directory outside the rest of the code (usually the `src` folder) for the custom icons package. Create a `package.json` file with the following content inside it:

```json
{
	"name": "my-custom-icons",
	"private": true,
	"version": "0.0.1",
	"type": "module",
	"main": "./dist/index.js"
}
```

Open the `node_modules` directory and look for the `@ckeditor/ckeditor5-icons` package. Inside, you will find the `dist/index.js` file. Copy the content of this file.

Now, create a new directory in the custom icons package directory and name it `dist`. Inside it, create an `index.js` file and paste the content you copied from the `@ckeditor/ckeditor5-icons` package. What you should have is a directory structure looking like this:

```plaintext
my-custom-icons/
├── dist/
│   └── index.js
└── package.json
```

Now you can modify the JavaScript strings containing SVG icons in the `index.js` file to customize the icons. Remember to keep the same structure and naming conventions as in the original file.

### Override the icons package

Now that you have custom icons package ready, you can override the default `@ckeditor/ckeditor5-icons` package in your project. This step depends on the package manager you are using. Below you will find examples for npm, Yarn Classic, Yarn Berry, and pnpm.

#### npm

If you are using npm, you need to add the following items to your `package.json` file:

```json
{
	"dependencies": {
		"@ckeditor/ckeditor5-icons": "file:./icons"
	},
	"overrides": {
		"@ckeditor/ckeditor5-icons": "$@ckeditor/ckeditor5-icons"
	}
}
```

Then, run `npm install` to install the custom icons package.

Please note that the value in the `overrides` object starts with a dollar sign (`$`). This is the npm suggestion to use the package from the `dependencies` section.

You can read more about the `overrides` field in the [npm documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides).

<info-box warning>
	The `file:` protocol used in the `dependencies` section may not create a symlink. In that case, you may need to remove the `node_modules` directory and run `npm install` to see the changes you made in the custom icons package.
</info-box>

#### Yarn Classic

If you are using Yarn Classic (v1), you need to add the following items to your `package.json` file:

```json
{
	"resolutions": {
		"@ckeditor/ckeditor5-icons": "link:./icons"
	}
}
```

Then, run `yarn install` to install the custom icons package.

You can read more about the `resolutions` field in the [Yarn documentation](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/).

#### Yarn Berry

If you are using Yarn Berry (v2+), you need to add the following items to your `package.json` file:

```json
{
	"resolutions": {
		"@ckeditor/ckeditor5-icons": "link:./icons"
	}
}
```

Then, run `yarn install` to install the custom icons package.

You can read more about the `resolutions` field in the [Yarn documentation](https://yarnpkg.com/configuration/manifest#resolutions).

#### pnpm

If you are using pnpm, you need to add the following items to your `package.json` file:

```json
{
	"pnpm": {
		"overrides": {
			"@ckeditor/ckeditor5-icons": "link:./icons"
		}
	}
}
```

Then, run `pnpm install` to install the custom icons package.

You can read more about the `resolutions` field in the [pnpm documentation](https://pnpm.io/package_json#pnpmoverrides).

## Override icons using resolve aliases

If you are using a bundler, you can use resolve aliases to replace the default `@ckeditor/ckeditor5-icons` package with your custom icon file. This method is similar to the one described above, but does not require creating a custom package.

This section only shows selected bundlers as examples, but other bundlers support similar functionality out of the box or with first-party plugins.

### Prepare custom icon file

Open the `node_modules` directory and look for the `@ckeditor/ckeditor5-icons` package. Inside you will find the `dist/index.js` file. Make a copy of this file, move it to your project and rename it if necessary. Then remove the `//# sourceMappingURL=index.js.map` comment at the bottom.

You can modify the JavaScript strings containing SVG icons in this file to customize the icons.

### Add resolve alias

Now that you have a custom icon file, you can add a resolve alias to your bundler configuration. This will cause all imports from the `@ckeditor/ckeditor5-icons` package to resolve to your custom icon file.

Follow the instruction below depending on the bundler you are using.

<info-box>
	The examples below assume that the custom icons are located in the `src/icons.js` file and that the bundler configuration file is in ES Modules format. If the configuration file is in CommonJS format instead, you may need to replace `import.meta.dirname` with `__dirname`.
</info-box>

#### Vite

Open the `vite.config.js` file and add the following code:

```js
import { resolve } from 'path';

export default {
	resolve: {
		alias: {
			'@ckeditor/ckeditor5-icons/dist/index.js': resolve( import.meta.dirname, './src/icons.js' )
		}
	}
};
```

#### Webpack

Open the `webpack.config.js` file and add the following code:

```js
import { resolve } from 'path';

export default {
	resolve: {
		alias: {
			'@ckeditor/ckeditor5-icons/dist/index.js': resolve( import.meta.dirname, './src/icons.js' )
		}
	}
};
```

#### esbuild

Open the esbuild configuration file and add the following code:

```js
import { resolve } from 'path';

build( {
	alias: {
		'@ckeditor/ckeditor5-icons/dist/index.js': resolve( import.meta.dirname, './src/icons.js' )
	}
} );
```

#### Rollup

Rollup does not support aliases by default, so you need to install the first-party `@rollup/plugin-alias` plugin if you do not already have it. Then add the following code to the `rollup.config.js` file:

```js
import { resolve } from 'path';
import alias from '@rollup/plugin-alias';

export default {
	plugins: [
		alias( {
			entries: {
				'@ckeditor/ckeditor5-icons/dist/index.js': resolve( import.meta.dirname, './src/icons.js' )
			}
		} )
	]
};
```

#### Rolldown

Open the `rolldown.config.js` file and add the following code:

```js
import { resolve } from 'path';

export default {
	resolve: {
		alias: {
			'@ckeditor/ckeditor5-icons/dist/index.js': resolve( import.meta.dirname, './src/icons.js' )
		}
	}
};
```
