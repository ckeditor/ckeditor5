---
category: setup
menu-title: Editor types
meta-title: Editor types | CKEditor 5 Documentation
meta-description: Learn more about available CKEditor 5 editor types.
order: 25
modified_at: 2024-06-25
---
# Editor types

The editor's user interface is dependent on the editor types. The editor provides functionality through specialized features accessible via a configurable toolbar or keyboard shortcuts. Some of these features are only available with certain editor types.

<info-box>
	If you are unsure which editor type to choose, try the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs). It lets you quickly view and experiment with different presets.
</info-box>

There are six ready-made editor types (see below) available for CKEditor&nbsp;5. They offer different functional approaches to editing as well as various UI solutions. Editor types are imported from the main `ckeditor5` package, the same way features are imported, as shown in the {@link getting-started/integrations-cdn/quick-start Quick start} guide.

Other custom-tailored editor types can be made using the {@link framework/external-ui CKEditor&nbsp;5 Framework}.

## Classic editor

The classic editor is what most users traditionally learned to associate with a rich-text editor &ndash; a toolbar with an editing area placed in a specific position on the page, usually as a part of a form that you use to submit some content to the server.

{@img assets/img/editor-type-classic.png 800 Classic editor type.}

<snippet-footer>
	See an {@link examples/builds/classic-editor example of the classic editor} in action.
</snippet-footer>

Use the following import to put the classic editor on your page:

<code-switcher>
```js
import { ClassicEditor } from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( editor => {
		console.log( 'The classic editor initialized', editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```
</code-switcher>

## Inline editor

The inline editor comes with a floating toolbar that becomes visible when the editor is focused (for example, by clicking it). A common scenario for using the inline editor is offering users the possibility to edit content (such as headings and other small areas) in its real location on a web page instead of doing it in a separate administration section.

{@img assets/img/editor-type-inline.png 800 Inline editor type.}

<snippet-footer>
	See an {@link examples/builds/inline-editor example of the inline editor} in action.
</snippet-footer>

Use the following import to put the inline editor on your page:

<code-switcher>
```js
import { InlineEditor } from 'ckeditor5';

InlineEditor
	.create( {
		root: {
			element: document.querySelector( '#editor' )
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( editor => {
		console.log( 'The inline editor initialized', editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```
</code-switcher>

## Balloon editor and balloon block editor

T balloon editor is similar to inline editor. The difference between them is that the {@link getting-started/setup/toolbar#block-toolbar toolbar appears in a balloon} next to the selection (when the selection is not empty).

{@img assets/img/editor-type-balloon.png 800 Balloon editor type.}

<snippet-footer>
	See an {@link examples/builds/balloon-editor example of the balloon editor} in action.
</snippet-footer>

Balloon block is essentially the balloon editor with an extra block toolbar, which can be accessed using the button attached to the editable content area and following the selection in the document. The toolbar provides access to additional block-level editing features.

{@img assets/img/editor-type-balloon-block.png 800 Balloon block editor type.}

<snippet-footer>
	See an {@link examples/builds/balloon-block-editor example of the balloon block editor} in action.
</snippet-footer>

Use one of the following imports to put the balloon editor on your page:

<code-switcher>
```js
import { BalloonEditor } from 'ckeditor5';

BalloonEditor
	.create( {
		root: {
			element: document.querySelector( '#editor' )
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [ 'bold', 'italic' ],
		// The optional setting configures the side toolbar.
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
	} )
	.then( editor => {
		console.log( 'The balloon editor initialized', editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```
</code-switcher>

## Decoupled editor (document)

The Decoupled editor is named for its unique structure, where the toolbar and editing area are separate elements. This design allows for greater flexibility and customization, making it suitable for a wide range of applications beyond just classic WYSIWYG editing.

The most popular use case for the Decoupled editor is the “document editor,” similar to large editing packages such as Google Docs or Microsoft Word. It works best for creating documents, which are usually later printed or exported to PDF files.

By separating the toolbar from the editing area, you can integrate the editor into different parts of your application or customize its appearance and functionality to suit various needs. For example, you may want to create an email creator that reflects the setup in which the toolbar is at the bottom of the editing area. We have {@link examples/custom/bottom-toolbar-editor a working example} for this.

{@img assets/img/editor-type-document.png 800 Document editor type.}

<snippet-footer>
	See an {@link examples/builds/document-editor example of the document editor} in action.
</snippet-footer>

Use the following import to put the decoupled editor on your page:

<code-switcher>
```js
import { DecoupledEditor } from 'ckeditor5';

DecoupledEditor
	.create( {
		root: {
			element: document.querySelector( '#editor' )
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [
			'undo', 'redo', '|', 'bold', 'italic', '|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
		]
	} )
	.then( editor => {
		console.log( 'The decoupled editor initialized', editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```
</code-switcher>

## Multi-root editor

The multi-root editor is an editor type that features multiple, separate editable areas. The main difference between using a multi-root editor and using multiple separate editors is the fact that in a multi-root editor, the editors are “connected.” All editable areas of the same editor instance share the same configuration, toolbar, and undo stack. They produce one document.

{@img assets/img/editor-type-multi-root.png 800 Multi-root editor type.}

<snippet-footer>
	See an {@link examples/builds/multi-root-editor example of the multi-root editor} in action.
</snippet-footer>

<info-box>
	At this time, the multi-root editor is not yet available via the [Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs).
</info-box>

<info-box important>
	The multi-root editor requires a more advanced configuration of the roots.
</info-box>

Add all roots you need in the editor to the `.create` command. For example:

<code-switcher>
```js
import {
	MultiRootEditor,
	Essentials,
	Bold,
	Italic,
	Font,
	Paragraph
} from 'ckeditor5';

MultiRootEditor
	.create( {
		roots: {
			header: { element: document.querySelector( '#header' ) },
			content: { element: document.querySelector( '#content' ) },
			leftSide: { element: document.querySelector( '#left-side' ) },
			rightSide: { element: document.querySelector( '#right-side' ) }
		},
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
		toolbar: [
			'undo', 'redo', '|', 'bold', 'italic', '|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

Then, use these roots to place editor windows in the document.

```html
<div class="editor">
	<div id="header">
		Header content.
	</div>
</div>
<div class="editor">
	<div id="content">
		Main content.
	</div>
</div>
<div class="boxes">
	<div class="box box-left editor">
		<div id="left-side">
			Left side content.
		</div>
	</div>
	<div class="box box-right editor">
		<div id="right-side">
			Right side content.
		</div>
	</div>
</div>
```
