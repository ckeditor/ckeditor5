---
menu-title: Testing helpers
meta-title: Testing helpers | CKEditor 5 Framework Documentation
meta-description: Discover CKEditor 5 testing helpers to simplify writing, managing, and running unit tests for editor features and plugins.
category: development-tools
order: 2
modified_at: 2022-08-16
---

# Testing helpers

The `_getModelData()` and `_setModelData()` functions exposed by {@link module:engine/dev-utils/model model developer utilities} and {@link module:engine/dev-utils/view view developer utilities} are useful development helpers.

They allow for "stringifying" the {@link framework/architecture/editing-engine#model model} and {@link framework/architecture/editing-engine#view view} structures, selections, ranges, and positions as well as for loading them from a string. They are often used when writing tests.

<info-box>
	Both tools are designed for prototyping, debugging, and testing purposes. Do not use them in production-grade code.
</info-box>

For instance, to take a peek at the editor model, you could use the {@link module:engine/dev-utils/model~_getModelData `_getModelData()`} helper:

<code-switcher>
```js
import { _getModelData } from 'ckeditor5';

// More imports.
// ...

ClassicEditor
	.create( '<p>Hello <b>world</b>!</p>' )
	.then( editor => {
		console.log( _getModelData( editor.model ) );
		// -> '<paragraph>[]Hello <$text bold="true">world</$text>!</paragraph>'
	} );
```
</code-switcher>

See the {@link module:engine/dev-utils/model~_getModelData helper documentation} to learn more about useful options.
