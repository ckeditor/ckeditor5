
---
category: setup
menu-title: Root types
meta-title: Root types | CKEditor 5 Documentation
meta-description: Learn how to configure CKEditor 5 root types to control whether a root accepts block content, inline-only content, or a mix of both.
order: 27
modified_at: 2026-05-13
---

# Root types

Each editing area in CKEditor&nbsp;5 is backed by a model root element. The type of that model element determines what content is allowed in that area. By default, roots use the `$root` model element, which accepts block-level content such as paragraphs, headings, lists, and tables.

You can configure a root to use a different model element. CKEditor&nbsp;5 ships with a second built-in root type, `$inlineRoot`, which restricts the root to inline content only — text and inline formatting, but no block elements. This turns the root into a paragraph-like editing area, suitable for document titles, form labels, meta descriptions, and similar single-line fields.

## Block root

The default root type is `$root`. It accepts the full range of block-level content: paragraphs, headings, lists, tables, block images, and any other block elements that the enabled plugins support. This is the standard editing experience for most use cases — articles, documents, comments, and similar rich-text areas.

### Configuration

You do not need to set `modelElement` explicitly to get this behavior. The following two configurations are equivalent:

<code-switcher>
```js
ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		root: {
			initialData: '<p>Start writing here.</p>'
		},
		licenseKey: '<YOUR_LICENSE_KEY>'
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<code-switcher>
```js
ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		root: {
			initialData: '<p>Start writing here.</p>',
			modelElement: '$root'
		},
		licenseKey: '<YOUR_LICENSE_KEY>'
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

### Allowed content in a block root

A block root accepts the full range of content that the enabled plugins register in the schema: paragraphs, headings, lists, tables, block images, code blocks, and similar block elements. It also allows all inline content within those blocks — text, formatting, links, mentions, and inline objects.

## Inline root

A root configured with `$inlineRoot` behaves like a single paragraph: pressing <kbd>Enter</kbd> has no effect, because inserting a new block is not allowed.

### Configuration

To configure any single-root editor type as inline-only, set `modelElement: '$inlineRoot'` in the `root` config:

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

The `modelElement` option works with all single-root editor types: `ClassicEditor`, `InlineEditor`, `BalloonEditor`, `BalloonBlockEditor`, and `DecoupledEditor`.

### Allowed content in an inline root

The `$inlineRoot` model element allows the same content as a paragraph: text nodes and inline objects. Block elements are not permitted.

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

Plugins that only produce block-level output will have no effect inside an `$inlineRoot` root. You can still include such plugins in your editor setup — they will be inactive when the cursor is inside an inline root, and toolbar items for block-only features will be disabled.

## Mixed root types in multi-root editor

In a multi-root editor, you can configure each root independently. A common pattern is to use an inline root for the title and a standard block root for the body:

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

The `title` root only accepts inline content, while the `body` root accepts the full range of block elements. The toolbar and undo stack are shared between both roots.

## Styling the host element

When you mount an inline root on a non-block HTML element such as a `<span>`, the browser may render the editable area with unexpected line breaks or sizing. This happens because block-filler mechanisms used by the editor can interact poorly with inline host elements.

To avoid this, apply the following CSS to the editable element:

```css
.ck-editor__editable {
	display: inline-block;
	max-width: fit-content;
}
```

This ensures the editing area does not collapse or stretch beyond its content. Mounting on a block element like a `<div>` does not require any extra CSS.

<info-box>
	When using a `<span>` as the host element, also set `display: inline-block` on the `<span>` itself, since block-level children are not valid inside an inline element.
</info-box>
