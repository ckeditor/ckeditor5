---
category: setup
menu-title: Root types
meta-title: Root types | CKEditor 5 Documentation
meta-description: Learn how to configure CKEditor 5 root types to control whether a root accepts block content, inline-only content, or a mix of both.
order: 27
modified_at: 2026-05-15
---

# Root types

In CKEditor&nbsp;5, a root is the top-level container element in the document model - every editable area has exactly one. The type of that root element determines what content is allowed in that area. By default, roots use the `$root` model element, which accepts block-level content such as paragraphs, headings, lists, and tables.

You can configure a root to use a different model element via the {@link module:core/editor/editorconfig~RootConfig#modelElement `config.root.modelElement`} option, and set initial root attributes via {@link module:core/editor/editorconfig~RootConfig#modelAttributes `config.root.modelAttributes`}. CKEditor&nbsp;5 ships with a second built-in root type, `$inlineRoot`, which restricts the root to inline content only - text and inline formatting, but no block elements. This turns the root into a paragraph-like editing area, suitable for document titles, form labels, meta descriptions, and similar single-line fields. For the technical background behind this feature, see the [paragraph-like editor RFC](https://github.com/ckeditor/ckeditor5/issues/19921).

## Block root

The default root type is `$root`. It accepts the full range of block-level content: paragraphs, headings, lists, tables, block images, and any other block elements that the enabled plugins support. This is the standard editing experience for most use cases - articles, documents, comments, and similar rich-text areas.

### Configuration

You do not need to set `modelElement` explicitly to get this behavior. The following two configurations are equivalent:

```js
ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		root: {
			initialData: '<p>Start writing here.</p>'
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

```js
ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		root: {
			initialData: '<p>Start writing here.</p>',
			modelElement: '$root'
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Allowed content in a block root

A block root accepts whatever block elements the enabled plugins register: paragraphs, headings, lists, tables, block images, code blocks, and similar. Inline content such as text and formatting must appear inside those block elements - it cannot be placed directly in the root. This reflects the standard document structure enforced by the {@link framework/deep-dive/schema#generic-items schema}: root → blocks → inline content.

## Inline root

A root configured with `$inlineRoot` behaves like a single paragraph: pressing <kbd>Enter</kbd> has no effect, because inserting a new block is not allowed.

### Configuration

To configure any single-root editor type as inline-only, set {@link module:core/editor/editorconfig~RootConfig#modelElement `modelElement`} to `'$inlineRoot'` in the `root` config:

<code-switcher>
```js
import { ClassicEditor, Essentials, Bold, Italic } from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		root: {
			initialData: 'My document title',
			modelElement: '$inlineRoot'
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

The `modelElement` option works with all editor types: `ClassicEditor`, `InlineEditor`, `BalloonEditor`, `BalloonBlockEditor`, `DecoupledEditor`, and `MultiRootEditor`.

For non-classic editors, consider passing a semantically appropriate DOM element as `root.element` instead of relying on the default `div`. For example, if the inline root serves as a document title, an `h1` element is a better fit:

```js
InlineEditor
	.create( {
		root: {
			element: document.querySelector( 'h1#title' ),
			modelElement: '$inlineRoot'
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Allowed content in an inline root

The `$inlineRoot` model element allows the same content as a paragraph: text nodes and inline objects. Block elements are not permitted. Where a block root follows the root → blocks → inline content structure, an inline root skips the block layer entirely: root → inline content. For a deeper look at how CKEditor&nbsp;5 schema controls content rules, see the {@link framework/deep-dive/schema#generic-items Schema deep dive} guide.

| Content type                                              | Allowed |
|-----------------------------------------------------------|---------|
| Plain text                                                | Yes     |
| Inline formatting (bold, italic, underline, and similar)  | Yes     |
| Links                                                     | Yes     |
| Mentions                                                  | Yes     |
| Inline images                                             | Yes     |
| Paragraphs and headings                                   | No      |
| Lists                                                     | No      |
| Tables                                                    | No      |
| Block images                                              | No      |

Plugins that only produce block-level output will have no effect inside an `$inlineRoot` root. You can still include such plugins in your editor setup - they will be inactive when the cursor is inside an inline root, and toolbar items for block-only features will be disabled.

## Mixed root types in multi-root editor

Mixing root types lets different parts of the same document use different content models. In a multi-root editor, you can configure each root independently. For example, a common pattern is to use an inline root for the title and a standard block root for the body:

<code-switcher>
```js
import { MultiRootEditor, Essentials, Bold, Italic, Paragraph, Heading } from 'ckeditor5';

MultiRootEditor
	.create( {
		roots: {
			title: {
				element: document.querySelector( '#title' ),
				initialData: 'My document title',
				modelElement: '$inlineRoot'
			},
			body: {
				element: document.querySelector( '#body' ),
				initialData: '<p>Main content goes here.</p>'
			}
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Paragraph, Heading ],
		toolbar: [ 'heading', '|', 'bold', 'italic' ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

The `title` root only accepts inline content, while the `body` root accepts the full range of block elements. The toolbar and undo stack are shared between both roots. See {@link getting-started/setup/editor-types#multi-root-editor Editor types} for a broader overview of the multi-root editor.

### Adding roots dynamically

In a multi-root editor, you can add roots at runtime using {@link module:editor-multi-root/multirooteditor~MultiRootEditor#addRoot `editor.addRoot()`}. The `modelElement` option sets the root type, the same way as in the static configuration:

```js
editor.on( 'addRoot', ( evt, root ) => {
	const editableElement = editor.createEditable( root );

	document.querySelector( '#editors' ).appendChild( editableElement );
} );

// Add a block root.
editor.addRoot( 'section', {
	initialData: '<p>Section content.</p>'
} );

// Add an inline root.
editor.addRoot( 'sectionTitle', {
	modelElement: '$inlineRoot',
	initialData: 'Section title'
} );
```

The root type is fixed at creation time and cannot be changed afterward.

## Styling the host element

When you mount an inline root on a non-block HTML element such as a `<span>`, the browser may render the editable area with unexpected line breaks or sizing. This happens because block-filler mechanisms used by the editor can interact poorly with inline host elements.

To avoid this, apply the following CSS to the editable element:

```css
.ck-editor__editable {
	display: inline-block;
	max-width: fit-content;
}
```

This ensures the editing area does not collapse or stretch beyond its content. Mounting on a block element like a `<div>` does not require any extra CSS. See the {@link getting-started/setup/css Editor and content styles} guide for broader CSS customization options.

<info-box>
	When using a `<span>` as the host element, also set `display: inline-block` on the `<span>` itself, since block-level children are not valid inside an inline element.
</info-box>
