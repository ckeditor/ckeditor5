---
category: examples-builds
meta-title: Multi-root editor example | CKEditor 5 Documentation
order: 60
toc: false
classes: main__content--no-toc
---

# Multi-root editor

The multi-root editor type is an editor type that features multiple, separate editable areas.

The main difference between using a multi-root editor and using multiple separate editors (like in the {@link examples/builds/inline-editor inline editor demo}) is the fact that in a multi-root editor all editable areas belong to the same editor instance share the same configuration, toolbar and the undo stack, and produce one document.

{@snippet examples/multi-root-editor}

## Editor example configuration

Check out the {@link getting-started/quick-start Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js
import {
	MultiRootEditor,
	Essentials,
	Bold,
	Italic,
	Heading,
	Link,
	Table,
	MediaEmbed,
	List,
	Indent
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

MultiRootEditor
	.create(
		// Define roots / editable areas:
		{
			header: document.querySelector( '#header' ),
			content: document.querySelector( '#content' ),
			leftSide: document.querySelector( '#left-side' ),
			rightSide: document.querySelector( '#right-side' )
		},
		// Editor configration:
		{
			plugins: [
				Essentials,
				Heading,
				Bold,
				Italic,
				Link,
				Table,
				MediaEmbed,
				List,
				Indent
			],
			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'insertTable', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
				]
			}
		}
	)
	.then( editor => {
		window.editor = editor;

		// Append toolbar to a proper container.
		const toolbarContainer = document.querySelector( '#toolbar' );
		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		// Make toolbar sticky when the editor is focused.
		editor.ui.focusTracker.on( 'change:isFocused', () => {
			if ( editor.ui.focusTracker.isFocused ) {
				toolbarContainer.classList.add( 'sticky' );
			} else {
				toolbarContainer.classList.remove( 'sticky' );
			}
		} );
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
```

</details>

<details>
<summary>View editor content listing</summary>

```html
<div id="toolbar"></div>
<!--
	Wrapping the structure inside a pair of
	contenteditable="true" + contenteditable="false" elements
	is required to provide proper caret handling when
	using arrow keys at the start and end of an editable area.

	You can skip them if you don't want to move the
	caret between editable areas using arrow keys.
!-->
<div contenteditable="true">
	<div contenteditable="false">
		<div class="editor">
			<div id="header">
				Header content is inserted here.
			</div>
		</div>
		<div class="editor">
			<div id="content">
				Main content is inserted here.
			</div>
		</div>
		<div class="boxes">
			<div class="box box-left editor">
				<div id="left-side">
					Left-side box content is inserted here.
				</div>
			</div>
			<div class="box box-right editor">
				<div id="right-side">
					Right-side box content is inserted here.
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.editor {
		border: #ccced1 1px solid;
		margin-top: 10px;
	}

	.boxes {
		margin-top: 10px;
		display: flex;
	}

	.box {
		margin-top: 0px;
		width: 50%;
	}

	/*
		Make the editable "fill" the whole box.
		The box will grow if the other box grows too.
		This makes the whole box "clickable".
	*/
	.box .ck-editor__editable {
		height: 100%;
	}

	.box-left {
		margin-right: 10px;
	}

	/*
		When toolbar receives this class, it becomes sticky.
		If the toolbar would be scrolled outside of the visible area,
		instead it is kept at the top edge of the window.
	*/
	#toolbar.sticky {
		position: sticky;
		top: 0px;
		z-index: 10;
	}
</style>
```

</details>

## Setting and reading editor data

Please note that setting and reading the editor data is different for multi-root editor.

<details>
<summary>Pass an object when setting the editor data</summary>

Setting the data using `editor.setData()`:
```js
	editor.setData( {
		header: '<p>Content for header part.</p>',
		content: '<p>Content for main part.</p>',
		leftSide: '<p>Content for left-side box.</p>',
		rightSide: '<p>Content for right-side box.</p>'
	} );
```

Setting the data through `config.initialData`:
```js
	MultiRootEditor.create(
		{
			header: document.querySelector( '#header' ),
			content: document.querySelector( '#content' ),
			leftSide: document.querySelector( '#left-side' ),
			rightSide: document.querySelector( '#right-side' )
		},
		{
			initialData: {
				header: '<p>Content for header part.</p>',
				content: '<p>Content for main part.</p>',
				leftSide: '<p>Content for left-side box.</p>',
				rightSide: '<p>Content for right-side box.</p>'
			}
		}
	);
```
</details>

<details>
<summary>Specify root name when obtaining the data</summary>

```js
	editor.getData( { rootName: 'leftSide' } ); // -> '<p>Content for left-side box.</p>'
```
</details>

Learn more about using the multi-root editor in its {@link module:editor-multi-root/multirooteditor~MultiRootEditor API documentation}.
