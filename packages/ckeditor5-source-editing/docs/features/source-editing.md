---
category: features
menu-title: Source editing
meta-title: Source editing | CKEditor 5 Documentation
modified_at: 2024-02-06
---

# Source editing
{@snippet features/source-editing-imports}

The source editing feature lets you view and edit the source of your document.

## Demo

Use the editor below to see the source editing plugin in action. Toggle the source editing mode {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing} and make some changes in the HTML code (for example, add a new paragraph or an ordered list). Then leave the source editing mode and see that the changes are present in the document content.

You can also use one of the many CKEditor&nbsp;5 features available in the toolbar and check how they render in the HTML source. Notice the collapsible table of contents, available thanks to the {@link features/general-html-support general HTML support} feature. The feature introduces HTML elements not yet covered by the official plugins.

{@snippet features/source-editing}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box>
	Currently, the source editing mode is supported in the {@link examples/builds/classic-editor classic editor}. The source editing feature can be used with {@link features/collaboration CKEditor&nbsp;5 collaboration features} except for {@link features/real-time-collaboration CKEditor&nbsp;5 real-time collaboration}. If you would like to use the real-time collaboration mode and, for some reason, you would like to also enable source editing, please [contact us](https://ckeditor.com/contact/).
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-source-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing) package:

```bash
npm install --save @ckeditor/ckeditor5-source-editing
```

And add it to your plugin list configuration:

```js
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SourceEditing, /* ... */ ],
		toolbar: [ 'sourceEditing', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

To utilize the Markdown source editing mode just add the {@link features/markdown Markdown output} plugin to the editor.

```js
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SourceEditing, Markdown, /* ... */ ],
		toolbar: [ 'sourceEditing', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Limitations and incompatibilities

<info-box error>
	The source editing plugin is a low-level document editing method, which allows you to directly alter the document data source. This presents incompatibilities with some editor features which highly rely on the editor mechanisms and architecture.

	**Please read this section carefully, and check if these problems may apply to your editor configuration.**
</info-box>

### Real-time collaboration

Source editing used during real-time collaboration brings a severe risk of data loss in a way that may be difficult for a user to notice and understand.

After you switch to source editing, incoming changes performed by remote users are not reflected in the source code. When you switch back (saving the source code), **all changes done in the meantime by other users will be overwritten**.

Due to this risk, these features are not allowed to be used together by default. When both are added to the editor, it will throw an error. **You have to explicitly enable source editing mode for real-time collaboration, acknowledging this risk.**

To enable the features, set the {@link module:source-editing/sourceeditingconfig~SourceEditingConfig#allowCollaborationFeatures `sourceEditing.allowCollaborationFeatures`} configuration flag to `true`.

### Comments and track changes

The comments and track changes features use markers to mark affected parts of the document.

In the source editing mode, it is possible for a user to modify these markers' boundaries. The user can change the range of a comment or tracked change, or remove them. This presents a potential problem related to users permissions.

The editor will show a warning in the browser's console when these plugins and source editing plugin are used together.

To turn off the warning, set the {@link module:source-editing/sourceeditingconfig~SourceEditingConfig#allowCollaborationFeatures `sourceEditing.allowCollaborationFeatures`} configuration flag to `true`.

### Support for various HTML elements

The editor will save changes made to the document data source only if it "understands" them. It means only when one of the loaded plugins recognizes the given syntax (HTML or Markdown). All syntax unsupported by the editor will be filtered out.

For example, if the editor does not have the {@link features/horizontal-line horizontal line} plugin loaded, the `<hr>` tag added in the document source will be removed upon exit from the source editing mode.

To avoid that, make sure that your editor configuration has all the necessary plugins that handle various HTML tags.

In many cases, to enable advanced modifications through the source editing, you might need to enable the {@link features/html-embed HTML embed} feature and the {@link features/general-html-support General HTML support} feature, or write a plugin that will enable a given HTML tag or attribute support.

### HTML normalization

When the editor reads the source data, it converts the data to a normalized, high-level abstract data model structure, on which it operates. This structure differs from the HTML or Markdown code.

Note, that the same document "state" may be described using HTML in various ways.

For example, `<strong><em>Foo</em></strong>` and `<i><b>Foo</b></i>` both produce the "Foo" text with bold and italic styling. Both will be represented the same when loaded to the internal editor data model.

When the editor data model is later converted back to the document source data, it will be normalized regardless of what the original input was. In effect, `<i><b>Foo</b></i>` will eventually become `<strong><em>Foo</em></strong>`.

This limitation is a direct consequence of the core editor architecture and cannot be worked around. Although it is possible to change the editor final output, the input data will always be normalized to that output format.

### Impact on the editor UI

Editor features rely on high-level editor API which cannot be used when the source editing is active. Due to that, when you switch to the source editing mode, all toolbar buttons become disabled and all dialog windows are closed.

### Revision history

Saving the modified document source is internally executed through replacing the old data with the new one. As a consequence, it will be represented in revision history as a total replace change (insertion + deletion).

The editor will show a warning in the browser's console when revision history and source editing are loaded together.

To turn the warning off, set the {@link module:source-editing/sourceeditingconfig~SourceEditingConfig#allowCollaborationFeatures `sourceEditing.allowCollaborationFeatures`} configuration flag to `true`.

### Restricted editing

Restricted editing is not enforced in the source editing mode. The user will be able to edit any part of the document, as well as remove the markers that mark the boundaries of restricted areas.

The editor will show a warning in the browser's console when restricted editing and source editing are loaded together.

## Markdown source view

The source editing plugin also works well with the {@link features/markdown Markdown output} plugin. You do not need any special configuration: just add the plugin to the editor, and the source editing mode will display Markdown instead of HTML.

<info-box>
	Remember that Markdown syntax is simple and does not cover all the rich-text features. This means that some features provided by CKEditor&nbsp;5 &ndash; either native or introduced by the GHS feature &ndash; can only be presented as native HTML as they have no Markdown equivalent. Such features will be stripped in the source view below.
</info-box>

{@snippet features/source-editing-with-markdown}

## Related features

There are other source-related CKEditor&nbsp;5 features you may want to check:

* {@link features/general-html-support General HTML support} &ndash; Allows you to enable HTML features (elements, attributes, classes, styles) that are not supported by other dedicated CKEditor&nbsp;5 plugins.
* {@link features/full-page-html Full page HTML} &ndash; Allows using CKEditor&nbsp;5 to edit entire HTML pages, from `<html>` to `</html>`, including the page metadata.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.
* {@link features/markdown Markdown output} &ndash; Allows for Markdown output instead of HTML output.

## Common API

The {@link module:source-editing/sourceediting~SourceEditing} plugin registers:

* The `'sourceEditing'` UI button component.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing).
