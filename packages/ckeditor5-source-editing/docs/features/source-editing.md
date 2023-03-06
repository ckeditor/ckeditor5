---
category: features
menu-title: Source editing
modified_at: 2021-06-28
---
# Source editing
{@snippet features/source-editing-imports}

The source editing feature lets you view and edit the source of your document.

## Demo

Use the editor below to see the source editing plugin in action. Toggle the source editing mode {@icon @ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg Source editing}, make some changes in the HTML code (i.e. add new paragraphs or an ordered list), and go back to see that they are present in the document content. You can also use one of the numerous CKEditor 5 features available via the toolbar and observe how they render in the HTML source. Notice the collapsible table of contents, available thanks to the {@link features/general-html-support General HTML support} feature and introducing HTML elements not yet covered by official plugins.

{@snippet features/source-editing}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

The source editing plugin is a low-level document editing interface, while all the buttons and dropdowns located in the toolbar are high-level ones.

Changes made to the document source will be applied to the editor's {@link framework/architecture/editing-engine data model} only if the editor understands (via loaded plugins) the given syntax. You will lose all changes that the editor features cannot understand. For example, if the editor does not have a {@link features/horizontal-line horizontal line} plugin loaded, the `<hr>` tag added in the document source will be removed upon exit from the source editing mode.

## Markdown source view

The source editing plugin also works well with the {@link features/markdown Markdown output} plugin. No special configuration is needed, it is enough to add the plugin to the editor to change the source editing mode to display Markdown instead. Please remember that Markdown syntax is very simple and it does not cover all the rich-text features. This means that some features provided by CKEditor 5 &ndash; either native or introduced via the GHS feature &ndash; can only be presented as native HTML as they have no Markdown equivalent. Such features will be stripped in the source view below.

{@snippet features/source-editing-with-markdown}

## Installation

<info-box>
	Currently, the source editing mode is supported in the {@link examples/builds/classic-editor classic editor}. The source editing feature is not compatible with {@link features/collaboration CKEditor 5 collaboration features}. If you would like to use collaboration features, but for some reason you would like to also enable source editing, please [contact us](https://ckeditor.com/contact/).
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-source-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing) package:

```bash
npm install --save @ckeditor/ckeditor5-source-editing
```

And add it to your plugin list configuration:

```js
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

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
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

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

## Related features

There are other source-related CKEditor 5 features you may want to check:

* {@link features/general-html-support General HTML support} &ndash; Allows enabling a generic support for additional HTML features not yet covered by official plugins.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.
* {@link features/autoformat Autoformatting} &ndash; Allows using Markdown-like shortcodes to format the content on the go.
* {@link features/markdown Markdown output} &ndash; Allows for Markdown output instead of HTML output.

## Common API

The {@link module:source-editing/sourceediting~SourceEditing} plugin registers:

* The `'sourceEditing'` UI button component.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing).
