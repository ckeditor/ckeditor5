---
category: setup
menu-title: Native HTML dialog
meta-title: Running CKEditor 5 inside a native dialog | CKEditor 5 Documentation
meta-description: Run CKEditor 5 in a modal dialog element. Mount its balloons, tooltips, and dialogs in a fixed element inside the dialog so they stay visible.
order: 105
modified_at: 2026-11-13
---

# Running CKEditor&nbsp;5 inside a native dialog

To run CKEditor&nbsp;5 inside a modal `<dialog>` element, add an empty, fixed-position element to the dialog and pass it to the editor as {@link module:core/editor/editorconfig~UiConfig#overlayContainer `config.ui.overlayContainer`}. The editor then renders its balloons, tooltips, and dialogs in that element, above the dialog content.

Without this setting, the editor renders them at the end of `document.body`. A dialog opened with `showModal()` covers the whole page and makes everything outside it inert. The link balloon, the toolbar tooltips, and the rest of the floating user interface stay hidden behind the dialog and do not react to clicks. A dialog opened with `show()` is not modal and does not make the page inert, so the editor works in it without this setting.

## Demo

Open the dialog and use the editor inside it. Click the link, type `@` to mention someone, open a comment in the {@link features/annotations-display-mode#narrow-sidebar narrow sidebar}, insert an image with the {@link features/ckbox CKBox file manager}, or click a table cell and change the cell properties. Every balloon, tooltip, and editor dialog appears above the dialog content.

The demo creates the editor when the page loads, inside the closed dialog, and keeps it when you close the dialog. Your changes and comments are still there when you open the dialog again. The comment balloons of the narrow sidebar use the same overlay container as the rest of the editor user interface.

<br />
<ck:button id="snippet-native-dialog-open">Open the editor in a dialog</ck:button>

{@snippet installation/setup/native-dialog}

## Setting up the overlay container

Add an empty element inside the dialog, next to the editor element:

```html
<dialog id="editor-dialog">
	<div id="editor"></div>
	<div class="editor-overlay"></div>
</dialog>
```

Style the element with fixed positioning:

```css
.editor-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 0;
	z-index: var(--ck-layer-dialog);
}
```

Each declaration has its own job:

* `position: fixed` places the element relative to the viewport. The `overflow: auto` style of a modal dialog does not clip it, and it still renders above the page together with the dialog.
* `width: 100%` gives balloons the full viewport width to lay out in. With no width, a balloon shrinks to its narrowest size, and a toolbar in a balloon wraps into a single column.
* `height: 0` makes sure the element never covers the dialog content, so clicks always reach the editor. Balloons, tooltips, and dialogs are positioned, so they do not give the element any height, and the explicit value keeps it that way.
* `z-index` puts the balloons above the editor content. A fixed element starts a stacking context of its own, so the `z-index` of the balloons counts only inside it. Without a `z-index` on the element itself, widgets such as images paint over the balloons. The example uses `--ck-layer-dialog`, the layer of the editor dialogs. A lower value works too, as long as it is higher than `--ck-layer-panel-above`, the layer of the toolbar dropdowns. Otherwise, balloons and tooltips show behind an open toolbar dropdown.

<info-box warning>
	The fixed positioning works only while neither the dialog nor any element between the dialog and the overlay container has a style that makes it the reference for fixed elements. Such styles include `transform` (also `translate`, `rotate`, and `scale`), `perspective`, `filter`, `backdrop-filter`, a `contain` value that includes `layout` or `paint`, `content-visibility: auto`, and a `will-change` that names one of these properties. Any of them, even `transform: translateY(0)`, makes the dialog clip the floating user interface again. Elements outside the dialog do not matter, because a modal dialog renders in the top layer of the page. To animate the dialog, animate its `opacity`, or apply the transform to a wrapper inside the dialog and keep the overlay container outside that wrapper.
</info-box>

Pass the element to the editor as the overlay container. You can create the editor before or after you open the dialog:

<code-switcher>
```js
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Link } from 'ckeditor5';

const dialog = document.querySelector( '#editor-dialog' );

dialog.showModal();

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, Link, /* ... */ ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link', /* ... */ ],
		ui: {
			overlayContainer: dialog.querySelector( '.editor-overlay' )
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

Add the overlay container to the document before you create the editor. A closed `<dialog>` element is still part of the document, so an element inside it is already connected. If the container is not in the document yet, the editor logs the `ui-overlay-container-not-connected` warning, and the floating user interface stays hidden until you insert the container.

The {@link getting-started/setup/shadow-dom Running CKEditor&nbsp;5 inside a shadow DOM} guide explains how the overlay layer works in more detail.

## Using the dialog element as the overlay container

Passing the `<dialog>` element itself as the overlay container needs no extra element and no CSS. However, a modal dialog has the `overflow: auto` style by default, so it cuts off the floating user interface at its edges. Use the fixed-position element from the [Setting up the overlay container](#setting-up-the-overlay-container) section instead.

For example, with the dialog as the container, the {@link getting-started/setup/toolbar#block-toolbar block toolbar} button sits just outside the editing area, at the left edge of the dialog, and only half of it shows.

## Closing the dialog

Closing the dialog hides the editor but does not destroy it. You can keep the editor for the next opening, as the demo does.

To release the editor instead, create a new editor every time you open the dialog and destroy it in the `close` event listener of the dialog. The event fires for every way of closing the dialog, including the <kbd>Esc</kbd> key and a `<form method="dialog">` button, so one listener covers them all. Register the listener once per opening, so every editor is destroyed exactly once. Wait for the promise that `create()` returns, so the listener also works when the dialog closes before the editor is ready. The destroyed editor leaves its element empty, so pass the saved data to the next editor as its initial data:

```js
let savedData = '<p>Initial content.</p>';

function openEditorDialog() {
	dialog.showModal();

	const editorPromise = ClassicEditor
		.create( {
			attachTo: document.querySelector( '#editor' ),
			root: {
				initialData: savedData
			},
			// ...
		} );

	dialog.addEventListener( 'close', () => {
		editorPromise
			.then( editor => {
				savedData = editor.getData();

				return editor.destroy();
			} )
			.catch( err => {
				console.error( err );
			} );
	}, { once: true } );
}
```

While the focus is in a balloon, <kbd>Esc</kbd> acts on the balloon, and the dialog stays open. In a balloon with a text field, such as a comment thread, the first press leaves the field and the second one closes the balloon. When the editing area has the focus, some features handle <kbd>Esc</kbd> first: it closes the link balloon, the mention list, or a comment balloon of the narrow sidebar, and inside a table cell or an image caption it selects the whole widget. Otherwise, also when only a contextual toolbar such as the image, table, or balloon toolbar is shown, <kbd>Esc</kbd> closes the dialog.
