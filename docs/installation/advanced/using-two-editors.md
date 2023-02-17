---
category: advanced
order: 10
---
# Using two different editors

The ability to use two or more types of rich text editors on one page is a common requirement. For instance, you may want to use the {@link installation/getting-started/predefined-builds#classic-editor classic editor} next to a couple of {@link installation/getting-started/predefined-builds#inline-editor inline editors}.

**Do not load two builds on one page.** This is a mistake which leads to:

* Code duplication. Both builds share up to 99% of the code, including CSS and SVGs. By loading them twice you make your page unnecessarily heavy.
* Duplicated CSS may lead to conflicts and, thus, broken UI of the editors.
* Translation repository gets duplicated entries which may cause loading incorrect strings with translations.

## Solutions

If you want to load two different editors on one page you need to make sure that they are built together (once). This can be achieved in at least two ways:

* {@link installation/advanced/integrating-from-source-webpack Integrating CKEditor 5 from source} directly into your application. Since you build you application once, the editors that you use will be built together, too.
* [Creating a "super build" of CKEditor 5](#creating-super-builds). Instead of creating a build which exports just one editor, you can create a build which exports two or more at the same time.

## Creating "super builds"

There is no limit for how many editor classes a single build can export. By default, the official builds export a single editor class only. However, they can easily import more.

You can start from forking (or copying) an existing build like in the {@link installation/getting-started/quick-start-other#building-the-editor-from-source "Creating custom builds"} guide. Let's say you forked and cloned the [`ckeditor5`](http://github.com/ckeditor/ckeditor5) repository and want to add {@link module:editor-inline/inlineeditor~InlineEditor} to the classic build:

```bash
git clone -b stable git@github.com:<your-username>/ckeditor5.git
cd ckeditor5/packages/ckeditor5-build-classic
npm install
```

Now it is time to add the missing editor package and install it:

```
npm install --save-dev @ckeditor/ckeditor5-editor-inline
```

Once all the dependencies are installed, modify the webpack's entry point which is the `src/ckeditor.js` file. For now it was exporting just a single class:

```js
// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// ...

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	// ...
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	// ...
};
```

Let's make it export an object with two classes: `ClassicEditor` and `InlineEditor`. To make both constructors work in the same way (load the same plugins and default configuration) you also need to assign `builtinPlugins` and `defaultConfig` static properties to both of them:

```js
// The editor creators to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

// ...

class ClassicEditor extends ClassicEditorBase {}
class InlineEditor extends InlineEditorBase {}

// Plugins to include in the build.
const plugins = [
	// ...
];

ClassicEditor.builtinPlugins = plugins;
InlineEditor.builtinPlugins = plugins;

// Editor configuration.
const config = {
	// ...
};

ClassicEditor.defaultConfig = config;
InlineEditor.defaultConfig = config;

export default {
	ClassicEditor, InlineEditor
};
```

Since you now export an object with two properties (`ClassicEditor` and `InlineEditor`), it is also reasonable to rename the global variable to which webpack will assign this object. So far it was called `ClassicEditor`. A more adequate name now would be for example `CKEDITOR`. This variable is defined in `webpack.config.js` in the `output.library` setting:

```diff
diff --git a/webpack.config.js b/webpack.config.js
index c57e371..04fc9fe 100644
--- a/webpack.config.js
+++ b/webpack.config.js
@@ -21,7 +21,7 @@ module.exports = {

     output: {
         // The name under which the editor will be exported.
-        library: 'ClassicEditor',
+        library: 'CKEDITOR',

         path: path.resolve( __dirname, 'build' ),
         filename: 'ckeditor.js',
```

Once you changed the `src/ckeditor.js` and `webpack.config.js` files it is time to rebuild the build:

```bash
npm run build
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

<h1>CKEditor 5 – super build</h1>

<div id="classic-editor">
	<h2>Sample</h2>

	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#classic-editor">classic editor build</a>.</p>
</div>

<div id="inline-editor">
	<h2>Sample</h2>

	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#inline-editor">inline editor build</a>.</p>
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
