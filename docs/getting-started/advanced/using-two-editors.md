---
category: advanced
menu-title: (Legacy) Using two different editors
meta-title: Using two different editors | Legacy CKEditor 5 documentation
order: 10
---
# (Legacy) Using two different editors

<info-box warning>
	⚠️ We changed installation methods and kept this legacy guide for users’ convenience. As of April 2025, integrations based on predefined builds are **no longer supported**. Please refer to the {@link getting-started/index#ckeditor-5-framework-integrations Quick Start} guide to choose one of the modern installation and integration methods available and {@link updating/nim-migration/migration-to-new-installation-methods migrate to new installation methods}.
</info-box>

The ability to use two or more types of rich text editors on one page is a common requirement. For instance, you may want to use the classic editor next to a couple of inline editors.

**Do not load two builds on one page.** This is a mistake that leads to:

* Code duplication. Both builds share up to 99% of the code, including CSS and SVGs. By loading them twice you make your page unnecessarily heavy.
* Duplicated CSS may lead to conflicts and, thus, a broken UI of the editors.
* The translation repository gets duplicated entries which may cause the loading of incorrect strings with translations.

## Solutions

If you want to load two different editors on one page you need to make sure that they are built together (once). This can be achieved in at least two ways:

* {@link getting-started/advanced/integrating-from-source-webpack Integrating CKEditor&nbsp;5 from source} directly into your application. Since you build you application once, the editors that you use will be built together, too.
* [Creating a "super build" of CKEditor&nbsp;5](#creating-super-builds). Instead of creating a build that exports just one editor, you can create a build that exports two or more at the same time.

## Creating "super builds"

There is no limit to how many editor classes a single build can export. By default, the official builds export a single editor class only. However, they can easily import more.

You can start by forking (or copying) an existing build like in the {@link getting-started/legacy-getting-started/quick-start-other#building-the-editor-from-source "Creating custom builds"} guide. Let's say you forked and cloned the [`ckeditor5`](http://github.com/ckeditor/ckeditor5) repository and want to add {@link module:editor-inline/inlineeditor~InlineEditor} to the classic build:

```bash
git clone -b stable git@github.com:<your-username>/ckeditor5.git
cd ckeditor5/packages/ckeditor5-build-classic
yarn install
```

Now it is time to add the missing editor package and install it:

```bash
yarn add -D @ckeditor/ckeditor5-editor-inline
```

Once all the dependencies are installed, you will need to modify the `src/ckeditor.ts` file, which currently only exports a single class. The first step is to move all plugins and configuration to variables so they can be reused by both editors:

```js
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';

// Other imports

class ClassicEditor extends ClassicEditorBase {}

const plugins = [
  // ...
]

const config = {
  // ...
}

ClassicEditor.builtinPlugins = plugins;
ClassicEditor.defaultConfig = config;

export {
  ClassicEditor
};
```

Now you can add the `InlineEditor` class to the file, add the same plugins and configuration to it and export it:

```diff
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
+ import { InlineEditor as InlineEditorBase } from '@ckeditor/ckeditor5-editor-inline';

// Other imports

class ClassicEditor extends ClassicEditorBase {}
+ class InlineEditor extends InlineEditorBase {}

const plugins = [
  // ...
];

// Editor configuration.
const config = {
  // ...
};

ClassicEditor.builtinPlugins = plugins;
ClassicEditor.defaultConfig = config;

+ InlineEditor.builtinPlugins = plugins;
+ InlineEditor.defaultConfig = config;

export default {
  ClassicEditor,
+  InlineEditor
};
```

Since you now export an object with two editor types (`ClassicEditor` and `InlineEditor`), it is also reasonable to rename the global variable `ClassicEditor`. An appropriate name now might be `CKEDITOR`. This variable is defined in `webpack.config.js` in the `output.library` setting:

```diff
// webpack.config.js

module.exports = {
  output: {
-    library: 'ClassicEditor',
+    library: 'CKEDITOR',
		// ...
```

Once you changed the `src/ckeditor.ts` and `webpack.config.js` files, it is time to rebuild the build:

```bash
yarn build
```

Finally, when webpack finishes compiling your super build, you can change the `samples/index.html` file to test both editors:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – super build</title>
	<style>
		body {
			max-width: 800px;
			margin: 20px auto;
		}
	</style>
</head>
<body>

<h1>CKEditor&nbsp;5 – super build</h1>

<div id="classic-editor">
	<h2>Sample</h2>

	<p>This is an instance of the classic editor build.</p>
</div>

<div id="inline-editor">
	<h2>Sample</h2>

	<p>This is an instance of the inline editor build.</p>
</div>

<script src="../build/ckeditor.js"></script>
<script>
	CKEDITOR.ClassicEditor
		.create( document.querySelector( '#classic-editor' ) )
		.catch( err => {
			console.error( err.stack );
		} );

	CKEDITOR.InlineEditor
		.create( document.querySelector( '#inline-editor' ) )
		.catch( err => {
			console.error( err.stack );
		} );
</script>

</body>
</html>
```
