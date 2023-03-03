---
title: Removing text formatting
menu-title: Remove formatting
category: features
---

{@snippet features/build-remove-format-source}

The remove format feature lets you quickly remove any text formatting applied using inline HTML elements and CSS styles, like {@link features/basic-styles basic text styles} (bold, italic) or {@link features/font font family, size, and color}. This feature does not remove block-level formatting ({@link features/headings headings}, {@link features/images-overview images}) or semantic data ({@link features/link links}).

## Demo

Select the content you want to clean up and press the remove format button {@icon @ckeditor/ckeditor5-remove-format/theme/icons/remove-format.svg remove format} in the toolbar:

{@snippet features/remove-format}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Configuring the remove format feature

This feature has no integration–level configuration. Once enabled, it works out–of–the–box with all {@link features/index core editor features}.

## A short note about content types in the editor

The remove format feature is intended to help users tidy up chunks of content from unnecessary formatting. Each editor feature brings its own content types to the WYSIWYG editor. If you do not want the unnecessary formatting to be enabled in the first place, you may want to consider {@link installation/getting-started/configuration#removing-features reducing the number of features} enabled in the editor.

Doing that will spare the users the pain of manually removing formatting every time they paste content from other programs and make the editing experience smoother. The narrower set of editor features also gives you more control over the content saved to the database and prevents the accidental use of the types of content you would rather not store in your application.

## Integrating with editor features

To make it possible for the remove formatting feature to work with your custom content, you must first mark it in the {@link framework/architecture/editing-engine#schema schema}. All you need to do is set the `isFormatting` property on your custom {@link framework/architecture/editing-engine#text-attributes text attribute}.

For instance, if you want the feature to remove {@link features/link links} as well (not supported by default), you need to create a {@link installation/getting-started/configuration#adding-simple-standalone-features simple plugin} that will extend the schema and tell the editor that the `linkHref` text attribute produced by the link feature is a formatting attribute:

```js
// A simple plugin that extends the remove format feature to consider links.
function RemoveFormatLinks( editor ) {
	// Extend the editor schema and mark the "linkHref" model attribute as formatting.
	editor.model.schema.setAttributeProperties( 'linkHref', {
		isFormatting: true
	} );
}
```

Enable the `RemoveFormatLinks` plugin in the {@link installation/getting-started/configuration#adding-features configuration} and run the editor:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			RemoveFormat,
			RemoveFormatLinks,
			// More plugins.
			// ...
		],
		toolbar: [
			'removeFormat',
			// More toolbar items.
			// ...
		]
	} )
```

From now on, the remove format button should also remove links in the content. {@link module:engine/model/schema~Schema#setAttributeProperties Learn more about attribute properties.}

## Installation

<info-box info>
	The remove format feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-remove-format`](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format) package:

```bash
npm install --save @ckeditor/ckeditor5-remove-format
```

And add it to your plugin list and the toolbar configuration:

```js
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ RemoveFormat, /* ... */ ],
		toolbar: [ 'removeFormat', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

CKEditor 5 has more features that can help you format your content:
* {@link features/basic-styles Basic text styles} &ndash; The essentials, like **bold**, *italic*, and others.
* {@link features/font Font styles} &ndash; Easily and efficiently control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/text-alignment Text alignment} &ndash; Align your content left, align it right, center it, or justify.

## Common API

The {@link module:remove-format/removeformat~RemoveFormat} plugin registers the `'removeFormat'` UI button component and a command of the same name implemented by {@link module:remove-format/removeformatcommand~RemoveFormatCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Removes all the formatting in the selection.
editor.execute( 'removeFormat' );
```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-remove-format](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-remove-format).
