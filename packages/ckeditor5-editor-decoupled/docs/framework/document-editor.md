---
category: framework-deep-dive-ui
order: 30
---

# Document editor

The {@link examples/builds/document-editor document editor example} showcases the document editor designed for document editing with a customized UI representing the layout of a sheet of paper. It was created on top of the {@link module:editor-decoupled/decouplededitor~DecoupledEditor `DecoupledEditor`} class and makes the best of what it offers: the freedom to choose the location of the crucial UI elements in the application.

In this tutorial, you will learn how to create your own document editor with a customized user interface, step–by–step.

{@snippet examples/document-editor}

## The editor

Document editor can be created using the existing data container in the DOM. It can also accept a raw data string and create the editable by itself. To get the output data, use the {@link module:core/editor/editor~Editor#getData `getData()`} method.

<info-box>
	See the {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method to learn about different approaches to the initialization of the editor.
</info-box>

<code-switcher>
```js
import { DecoupledEditor } from 'ckeditor5';

DecoupledEditor.create( document.querySelector( '.document-editor__editable' ), {
	cloudServices: {
		// A configuration of CKEditor Cloud Services.
		// ...
	}
} )
.then( editor => {
	const toolbarContainer = document.querySelector( '.document-editor__toolbar' );

	toolbarContainer.appendChild( editor.ui.view.toolbar.element );

	window.editor = editor;
} )
.catch( err => {
	console.error( err );
} );
```
</code-switcher>

You may have noticed that you have to make sure the editor UI is injected into your application after it fires the {@link module:ui/editorui/editorui~EditorUI#event:ready `EditorUI#ready`} event. The toolbar element can be found under `editor.ui.view.toolbar.element`.

## The user interface

The code you have just created will run the editor but the user interface is still missing. Start off with a basic HTML structure to host the editor components (the toolbar and the editable).

### HTML

The following structure has two containers that correspond to the configuration you have just used. The editor will inject the toolbar and the editable into respective containers as it starts.

```html
<div class="document-editor">
	<div class="document-editor__toolbar"></div>
	<div class="document-editor__editable-container">
		<div class="document-editor__editable">
			<p>The initial editor data.</p>
		</div>
	</div>
</div>
```

The `<div class="document-editor">...</<div>` element is the outermost container of the document editor and, although not mandatory, it is recommended to use it to keep things together.

<info-box warning>
	Make sure the HTML structure is available in the DOM when the editor is created. To do so, put the editor bootstrap code somewhere later in HTML or use the [`DOMContentLoaded`](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded) event to defer your JavaScript execution until the DOM is ready.
</info-box>

### Styles

Styles are what the document editor needs to materialize. Begin with the styles of the main container:

```css
.document-editor {
	border: 1px solid var(--ck-color-base-border);
	border-radius: var(--ck-border-radius);

	/* Set vertical boundaries for the document editor. */
	max-height: 700px;

	/* This element is a flex container for easier rendering. */
	display: flex;
	flex-flow: column nowrap;
}
```

Then, make the toolbar look like it floats over the "page":

```css
.document-editor__toolbar {
	/* Make sure the toolbar container is always above the editable. */
	z-index: 1;

	/* Create the illusion of the toolbar floating over the editable. */
	box-shadow: 0 0 5px hsla( 0,0%,0%,.2 );

	/* Use the CKEditor CSS variables to keep the UI consistent. */
	border-bottom: 1px solid var(--ck-color-toolbar-border);
}

/* Adjust the look of the toolbar inside the container. */
.document-editor__toolbar .ck-toolbar {
	border: 0;
	border-radius: 0;
}
```

The editable should look like a sheet of paper, centered in its scrollable container:

```css
/* Make the editable container look like the inside of a native word processor application. */
.document-editor__editable-container {
	padding: calc( 2 * var(--ck-spacing-large) );
	background: var(--ck-color-base-foreground);

	/* Make it possible to scroll the "page" of the edited content. */
	overflow-y: scroll;
}

.document-editor__editable-container .ck-editor__editable {
	/* Set the dimensions of the "page". */
	width: 15.8cm;
	min-height: 21cm;

	/* Keep the "page" off the boundaries of the container. */
	padding: 1cm 2cm 2cm;

	border: 1px hsl( 0,0%,82.7% ) solid;
	border-radius: var(--ck-border-radius);
	background: white;

	/* The "page" should cast a slight shadow (3D illusion). */
	box-shadow: 0 0 5px hsla( 0,0%,0%,.1 );

	/* Center the "page". */
	margin: 0 auto;
}
```

All you need to do now is style the actual content of the editor. Start with defining some basic font styles:

```css
/* Set the default font for the "page" of the content. */
.document-editor .ck-content,
.document-editor .ck-heading-dropdown .ck-list .ck-button__label {
	font: 16px/1.6 "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

Then focus on headings and paragraphs. Note that what the users see in the headings dropdown should correspond to the actual edited content for the best user experience.

<info-box>
	It is recommended to use the `.ck-content` CSS class to visually style the content of the editor (headings, paragraphs, lists, etc.).
</info-box>

```css
/* Adjust the headings dropdown to host some larger heading styles. */
.document-editor .ck-heading-dropdown .ck-list .ck-button__label {
	line-height: calc( 1.7 * var(--ck-line-height-base) * var(--ck-font-size-base) );
	min-width: 6em;
}

/* Scale down all heading previews because they are way too big to be presented in the UI.
Preserve the relative scale, though. */
.document-editor .ck-heading-dropdown .ck-list .ck-button:not(.ck-heading_paragraph) .ck-button__label {
	transform: scale(0.8);
	transform-origin: left;
}

/* Set the styles for "Heading 1". */
.document-editor .ck-content h2,
.document-editor .ck-heading-dropdown .ck-heading_heading1 .ck-button__label {
	font-size: 2.18em;
	font-weight: normal;
}

.document-editor .ck-content h2 {
	line-height: 1.37em;
	padding-top: .342em;
	margin-bottom: .142em;
}

/* Set the styles for "Heading 2". */
.document-editor .ck-content h3,
.document-editor .ck-heading-dropdown .ck-heading_heading2 .ck-button__label {
	font-size: 1.75em;
	font-weight: normal;
	color: hsl( 203, 100%, 50% );
}

.document-editor .ck-heading-dropdown .ck-heading_heading2.ck-on .ck-button__label {
	color: var(--ck-color-list-button-on-text);
}

/* Set the styles for "Heading 2". */
.document-editor .ck-content h3 {
	line-height: 1.86em;
	padding-top: .171em;
	margin-bottom: .357em;
}

/* Set the styles for "Heading 3". */
.document-editor .ck-content h4,
.document-editor .ck-heading-dropdown .ck-heading_heading3 .ck-button__label {
	font-size: 1.31em;
	font-weight: bold;
}

.document-editor .ck-content h4 {
	line-height: 1.24em;
	padding-top: .286em;
	margin-bottom: .952em;
}

/* Set the styles for "Paragraph". */
.document-editor .ck-content p {
	font-size: 1em;
	line-height: 1.63em;
	padding-top: .5em;
	margin-bottom: 1.13em;
}
```

A finishing touch that makes the block quotes more sophisticated and the styling is complete.

```css
/* Make the block quoted text serif with some additional spacing. */
.document-editor .ck-content blockquote {
	font-family: Georgia, serif;
	margin-left: calc( 2 * var(--ck-spacing-large) );
	margin-right: calc( 2 * var(--ck-spacing-large) );
}
```

## Summary

The document editor is ready to use. Still, you may want to configure some features like {@link module:highlight/highlightconfig~HighlightConfig highlight}, {@link module:font/fontconfig~FontSizeConfig font size} or {@link module:font/fontconfig~FontFamilyConfig font family} for the best editing experience.

Thanks to the {@link module:editor-decoupled/decouplededitor~DecoupledEditor `DecoupledEditor`} used as a foundation, you can experiment and create custom user interface layouts quickly while preserving the feature set, accessibility support (for example, {@link features/accessibility#keyboard-shortcuts keyboard navigation} in the toolbar), and more.
