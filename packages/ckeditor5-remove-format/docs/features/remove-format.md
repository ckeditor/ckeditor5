---
title: Removing Text Formatting
menu-title: Remove Format
category: features
---

{@snippet features/build-remove-format-source}

The {@link module:remove-format/removeformat~RemoveFormat Remove Format} feature allows to quickly remove any text formatting applied using inline HTML elements and CSS styles, like {@link features/basic-styles basic text styles} (bold, italic, etc.), {@link features/font font family, size, and color} and similar. Note that block—level formatting ({@link features/headings headings}, {@link features/image images}) and semantic data ({@link features/link links}) will not be removed.

## Demo

Select the content you want to clean up and press the "Remove Format" button in the toolbar:

{@snippet features/remove-format}

## Configuring the remove format feature

The feature has no integration–level configuration. Once enabled, it works out–of–the–box with all {@link features/index core editor features}.

## Integrating with editor features

To make it possible for the remove formatting feature to work with your custom content, you must first mark it in the {@link framework/guides/architecture/editing-engine#schema schema}. All you need to do is set the `isFormatting` property on your custom {@link framework/guides/architecture/editing-engine#text-attributes text attribute}. {@link module:engine/model/schema~Schema#setAttributeProperties Learn more about attribute properties.}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-remove-format`](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format) package:

```bash
npm install --save @ckeditor/ckeditor5-remove-format
```

And add it to your plugin list and the toolbar configuration:

```js
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ RemoveFormat, ... ],
		toolbar: [ 'removeFormat', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:remove-format/removeformat~RemoveFormat} plugin registers the `'removeFormat'` UI button component the command of the same name implemented by {@link module:remove-format/removeformatcommand~RemoveFormatCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Removes all the formatting in the selection.
editor.execute( 'removeFormat' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-remove-format.
