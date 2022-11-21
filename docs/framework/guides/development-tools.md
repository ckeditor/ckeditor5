---
category: framework-guides
order: 40
---

# Development tools

In this guide you will learn about developer tools that will help you develop and debug CKEditor 5 plugins and features.

## CKEditor 5 inspector

The official [CKEditor 5 inspector](https://github.com/ckeditor/ckeditor5-inspector) provides a set of rich debugging tools for editor internals like {@link framework/guides/architecture/editing-engine#model model}, {@link framework/guides/architecture/editing-engine#view view}, and {@link framework/guides/architecture/core-editor-architecture#commands commands}.

It allows you to observe changes to the data structures and the selection live in the editor, which is particularly helpful when developing new rich-text editor features or getting to understand the existing ones.

{@img assets/img/framework-development-tools-inspector.jpg Screenshot of the CKEditor 5 inspector attached to a WYSIWYG editor instance.}

### Importing the inspector

You can import the inspector as an [`@ckeditor/ckeditor5-inspector`](https://www.npmjs.com/package/@ckeditor/ckeditor5-inspector) package into your project:

```bash
npm install --save-dev @ckeditor/ckeditor5-inspector
```

and then either import it as a module:

```js
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
```

or as a plain `<script>` tag in the HTML of your application:

```html
<script src="../node_modules/@ckeditor/ckeditor5-inspector/build/inspector.js"></script>
```

### Inspector as a bookmarklet

If you do not wish to import the inspector, you can create a bookmarklet in your browser instead that will allow you to open it on any page without interference with its source code.

**Important note: this method will not work if the page has Content Security Policy enabled.**

To create such a bookmarklet, paste the following code as the URL of a new bookmark in the browser of your choice:

```js
javascript:(function(){let script=document.createElement('script');script.src='https://unpkg.com/@ckeditor/ckeditor5-inspector/build/inspector.js';script.onload=()=>CKEditorInspector.attachToAll();document.head.appendChild(script);})()
```

Now you can load CKEditor 5 inspector by using the newly created bookmark.

### Enabling the inspector

Attach the inspector to the editor instance when {@link installation/getting-started/basic-api#creating-an-editor-with-create created} using the `CKEditorInspector.attach()` method:

```js
ClassicEditor
	.create( ... )
	.then( editor => {
		CKEditorInspector.attach( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

The inspector will show up at the bottom of the screen.

### Inspecting multiple editors

You can inspect multiple CKEditor 5 instances at a time by calling `CKEditorInspector.attach()` for each one of them. Then you can switch the inspector context to inspect different editor instances.

You can specify the name of the editor when attaching to make working with multiple instances easier:

```js
// Inspecting two editor instances at the same time.
CKEditorInspector.attach( 'header-editor', editor );
CKEditorInspector.attach( 'body-editor', editor );
```

The editor switcher is in the upper–right corner of the inspector panel.

### Demo

Click the <b>"Inspect editor"</b> button below to attach the inspector to the editor:

{@snippet framework/development-tools/inspector}

### Compatibility

The inspector works with CKEditor 5 [v12.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v12.0.0)+.

### Contributing to the inspector

The source code of CKEditor 5 inspector and its issue tracker is available on GitHub in https://github.com/ckeditor/ckeditor5-inspector.

## Testing helpers

The `getData()` and `setData()` functions exposed by {@link module:engine/dev-utils/model model developer utilities} and {@link module:engine/dev-utils/view view developer utilities} are useful development helpers.

They allow for "stringifying" the {@link framework/guides/architecture/editing-engine#model model} and {@link framework/guides/architecture/editing-engine#view view} structures, selections, ranges, and positions as well as for loading them from a string. They are often used when writing tests.

<info-box>
	Both tools are designed for prototyping, debugging, and testing purposes. Do not use them in production-grade code.
</info-box>

For instance, to take a peek at the editor model, you could use the {@link module:engine/dev-utils/model~getData `getData()`} helper:

```js
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

// ...

ClassicEditor
	.create( '<p>Hello <b>world</b>!</p>' )
	.then( editor => {
		console.log( getData( editor.model ) );

		// -> '<paragraph>[]Hello <$text bold="true">world</$text>!</paragraph>'
	} );
```

See the helper documentation to learn more about useful options.

## Usage of local version of dependencies

If you'd like to use a local version of a dependency such as `@ckeditor/ckeditor5-dev-utils`, you can use the `switch-to-dev` script. This script requires a configuration file located in the root of the `ckeditor5` repository called `switch-to-dev.json`. It should have defined `repositoriesToLink` field that is an array of relative paths from the `ckeditor5` repository root to the repositories to be linked.

```json
{
	"repositoriesToLink": [
		"../ckeditor5-dev",
		"../ckeditor5-inspector",
		"../ckeditor5-linters-config"
	]
}
```

After calling the script with valid configuration file present, it will search for all packages from the requested repositories (including the root package) and link them in every `package.json` file present inside the `ckeditor5` directory, and then update the dependencies. From that moment `ckeditor5` project will be using local versions of the dependencies, and any changes made to them will be immediately reflected inside the project.

Calling `yarn install` will break the links, and return the project to using the npm versions of the dependencies. If you want to call `yarn install` without breaking the links, you can simply call `yarn switch-to-dev` again, as it performs `yarn install` as one of its steps.

## Package generator

For a quick jump start on development of a plugin, use the [CKEditor5 Package Generator](https://www.npmjs.com/package/ckeditor5-package-generator).

See the {@link framework/guides/package-generator/using-package-generator documentation} to learn more.
