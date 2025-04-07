---
title: Removing text formatting
menu-title: Remove formatting
meta-title: Removing text formatting | CKEditor 5 Documentation
category: features
---

The remove format feature lets you quickly remove any text formatting applied using inline HTML elements and CSS styles, like {@link features/basic-styles basic text styles} (bold, italic) or {@link features/font font family, size, and color}. This feature does not remove block-level formatting ({@link features/headings headings}, {@link features/images-overview images}) or semantic data ({@link features/link links}).

## Demo

Select the content you want to clean up and press the remove format button {@icon @ckeditor/ckeditor5-icons/theme/icons/remove-format.svg remove format} in the toolbar.

{@snippet features/remove-format}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, RemoveFormat } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ RemoveFormat, /* ... */ ],
		toolbar: [ 'removeFormat', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuring the remove format feature

This feature has no integration–level configuration. Once enabled, it works out–of–the–box with all {@link features/index core editor features}.

## A short note about content types in the editor

The remove format feature is intended to help users tidy up chunks of content from unnecessary formatting. Each editor feature brings its own content types to the WYSIWYG editor. If you do not want the unnecessary formatting to be enabled in the first place, you may want to consider reducing the number of features enabled in the editor.

Doing that will spare the users the pain of manually removing formatting every time they paste content from other programs and make the editing experience smoother. The narrower set of editor features also gives you more control over the content saved to the database and prevents the accidental use of the types of content you would rather not store in your application.

## Integrating with editor features

In order for the remove formatting feature to work with custom content, you need to update the {@link framework/architecture/editing-engine#schema schema} by setting the `isFormatting` property on the custom {@link framework/architecture/editing-engine#text-attributes text attribute}.

This is already done for most inline elements supported by the {@link features/general-html-support General HTML Support} plugin and its derivatives such as the {@link features/style Style} plugin.

By default, formatting is not removed from the {@link features/link link} elements. To remove formatting from them as well, you need to create a {@link getting-started/legacy-getting-started/extending-features plugin} that extends the schema and tells the editor that the `linkHref` text attribute produced by the link feature is a formatting attribute:

```js
// A simple plugin that extends the remove format feature to consider links.
function RemoveFormatLinks( editor ) {
	// Extend the editor schema and mark the "linkHref" model attribute as formatting.
	editor.model.schema.setAttributeProperties( 'linkHref', {
		isFormatting: true
	} );
}
```

Enable the `RemoveFormatLinks` plugin in the {@link getting-started/setup/configuration#adding-features configuration} and run the editor:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

From now on, the remove format button should also remove links in the content. {@link module:engine/model/schema~Schema#setAttributeProperties Learn more about attribute properties.}

## Related features

CKEditor&nbsp;5 has more features that can help you format your content:

* {@link features/basic-styles Basic text styles} &ndash; The essentials, like **bold**, *italic*, and others.
* {@link features/font Font styles} &ndash; Easily and efficiently control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/format-painter Format painter} &ndash; Easily copy text formatting and apply it in a different place in the edited document.
* {@link features/text-alignment Text alignment} &ndash; Align your content left, align it right, center it, or justify.

## Common API

The {@link module:remove-format/removeformat~RemoveFormat} plugin registers the `'removeFormat'` UI button component and a command of the same name implemented by {@link module:remove-format/removeformatcommand~RemoveFormatCommand}.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Removes all the formatting in the selection.
editor.execute( 'removeFormat' );
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-remove-format](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-remove-format).
