---
category: setup
menu-title: Editor types
meta-title: Editor types | CKEditor 5 documentation
meta-description: Learn about available editor types.
order: 25
modified_at: 2024-06-25
---
# Editor types

The editor's user interface is dependent on the editor types. The editor provides functionality through specialized features accessible via a configurable toolbar or keyboard shortcuts. Some of these features are only available with certain editor types.

<info-box>
	All of these elements can most easily be configured with [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs).
</info-box>

There are six ready-made editor types (see below) available for CKEditor&nbsp;5. They offer different functional approaches to editing as well as various UI solutions. Editor types are imported from the main `ckeditor5` package, the same way features are imported, as shown in the {@link getting-started/quick-start Quick start} guide.

Other custom-tailored editor types can be made using the {@link framework/external-ui CKEditor&nbsp;5 Framework}.

For example, this code will import the classic editor type and some essential text formatting plugins. It also provides the configuration of the {@link getting-started/setup/toolbar main editor toolbar}.

```js
import { ClassicEditor, Bold, Italic, Link } from 'ckeditor5'; // Imports.

ClassicEditor // Editor type declaration.
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, Italic, Link ], // Plugins import.
		toolbar: [ 'bold', 'italic', 'link' ] // Toolbar configuration.
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Classic editor

Classic editor is what most users traditionally learned to associate with a rich-text editor &ndash; a toolbar with an editing area placed in a specific position on the page, usually as a part of a form that you use to submit some content to the server.

{@img assets/img/editor-type-classic.png 800 Classic editor type.}

See an {@link examples/builds/classic-editor example of the classic editor} in action.

## Inline editor

The inline editor comes with a floating toolbar that becomes visible when the editor is focused (for example, by clicking it). A common scenario for using the inline editor is offering users the possibility to edit content (such as headings and other small areas) in its real location on a web page instead of doing it in a separate administration section.

{@img assets/img/editor-type-inline.png 800 Inline editor type.}

See an {@link examples/builds/inline-editor example of the inline editor} in action.

## Balloon editor and balloon block editor

Balloon editor is similar to inline editor. The difference between them is that the {@link getting-started/setup/toolbar#block-toolbar toolbar appears in a balloon} next to the selection (when the selection is not empty).

{@img assets/img/editor-type-balloon.png 800 Balloon editor type.}

See an {@link examples/builds/balloon-editor example of the balloon editor} in action.

Balloon block is essentially the balloon editor with an extra block toolbar, which can be accessed using the button attached to the editable content area and following the selection in the document. The toolbar gives access to additional block–level editing features.

{@img assets/img/editor-type-balloon-block.png 800 Balloon block editor type.}

See an {@link examples/builds/balloon-block-editor example of the balloon block editor} in action.

## Decoupled editor (document)

The document editor focuses on a rich-text editing experience similar to large editing packages such as Google Docs or Microsoft Word. It works best for creating documents, which are usually later printed or exported to PDF files.

{@img assets/img/editor-type-document.png 800 Document editor type.}

See an {@link examples/builds/document-editor example of the document editor} in action.

## Multi-root editor

The multi-root editor is an editor type that features multiple, separate editable areas. The main difference between using a multi-root editor and using multiple separate editors is the fact that in a multi-root editor, the editors are "connected." All editable areas of the same editor instance share the same configuration, toolbar, undo stack, and produce one document.

{@img assets/img/editor-type-multi-root.png 800 Multi-root editor type.}

See an {@link examples/builds/multi-root-editor example of the multi-root editor} in action.

<info-box>
	At this time, the multi-root editor is not yet available via the Builder.
</info-box>
