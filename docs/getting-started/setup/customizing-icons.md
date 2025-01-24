---
category: setup
menu-title: Customizing icons
meta-title: Customizing icons | CKEditor 5 Documentation
meta-description: Learn how to customize editor icons.
order: 95
modified_at: 2025-01-24
---

# Customizing icons

CKEditor&nbsp;5 comes with a set of icons that are used in the editor UI. If you are using self-hosted installation method like npm or ZIP, you can customize the icons by overriding the default npm package that contains them.

To do so, start by preparing a package with your custom icons.

## Prepare custom icons package

Inside your project, create a new directory outside the rest of the code (usually the `src` folder) for the custom icons package. In it, create a `package.json` file with the following content:

```json
{
  "name": "my-custom-icons",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js"
}
```

Then, open the `node_modules` directory and look for the `@ckeditor/ckeditor5-icons` package. Inside of it, you will find the `dist/index.js` file. Copy the content of this file.

Now, create a new directory inside the custom icons package directory and name it `dist`. Inside it, create an `index.js` file and paste the content you copied from the `@ckeditor/ckeditor5-icons` package. What you should have is a directory structure like this:

```plaintext
my-custom-icons/
├── dist/
│   └── index.js
└── package.json
```

Now, you can modify the JavaScript strings containing SVG icons in the `index.js` file to customize the icons. Remember to keep the same structure and naming conventions as in the original file.

## Override the icons package

Now that you have custom icons package ready, you can override the default `@ckeditor/ckeditor5-icons` package in your project. This step depends on the package manager you are using. Below you will find examples for npm, Yarn Classic, Yarn Berry, and pnpm.

### npm

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

Please note that the value in the `overrides` object starts with a dollar sign (`$`). This is the npm way to say "use the package from the `dependencies` section".

You can read more about the `overrides` field in the [npm documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides).

<info-box warning>
	The `file:` protocol used in the `dependencies` section may not create a symlink. In that case, you may need to remove the `node_modules` directory and run `npm install` to see the changes you made in the custom icons package.
</info-box>

### Yarn Classic

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

### Yarn Berry

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

### pnpm

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
