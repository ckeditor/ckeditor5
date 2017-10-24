---
category: framework-ui
order: 20
---

# Third–party UI

CKEditor 5 is a modular editing framework that allows for various flexible configurations. That includes the usage of a third–party user interface on top of the basic editor classes.

In this guide, a [classic–like](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic) editor will be bound to a completely separate UI created in [Bootstrap](http://getbootstrap.com/), providing the basic structure and toolbar items necessary to start editing.

{@snippet examples/bootstrap-ui}

## Readying the editor side

The ready–to–use builds of CKEditor like {@link examples/builds/classic-editor Classic} or {@link examples/builds/inline-editor Inline} come with a dedicated default user interface and theme. However, to create an editor instance bound to a Bootstrap UI, only a limited subset of features is required. You need to import them first:


```js
// Basic classes to create an editor.
import StandardEditor from '@ckeditor/ckeditor5-core/src/editor/standardeditor';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';

// Basic features that every editor should enable.
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEngine from '@ckeditor/ckeditor5-undo/src/undoengine';

// Basic features to be associated with the edited content.
import BoldEngine from '@ckeditor/ckeditor5-basic-styles/src/boldengine';
import ItalicEngine from '@ckeditor/ckeditor5-basic-styles/src/italicengine';
import UnderlineEngine from '@ckeditor/ckeditor5-basic-styles/src/underlineengine';
import HeadingEngine from '@ckeditor/ckeditor5-heading/src/headingengine';
```

<info-box info>
	Note that instead of {@link module:basic-styles/bold~Bold}, which is required for any editor with the default UI to work, just the {@link module:basic-styles/boldengine~BoldEngine} is imported. It provides the [engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) features associated with editing any bold text but does not come with the actual UI.

	Respectively, `ItalicEngine`, `UnderlineEngine`, `HeadingEngine` and `UndoEngine` are also imported.

	This split between the engine and the UI part of features is not perfect yet. At the current stage, the UI part introduces some vital functionality, such as keystroke definitions (e.g. <kbd>Ctrl</kbd>+<kbd>B</kbd> to "bold"). This means that by dropping the UI part of features you also lose keystrokes. We [plan to improve](https://github.com/ckeditor/ckeditor5/issues/488) this situation.
</info-box>

Having imported the very basic editor components, you can define the custom `BootstrapEditor` class that extends the {@link module:core/editor/standardeditor~StandardEditor `StandardEditor`}:

```js
// Extending the StandardEditor that brings lots of essential API.
export default class BootstrapEditor extends StandardEditor {
	constructor( element, config ) {
		super( element, config );

		// Create the ("main") root element of the model tree.
		this.document.createRoot();

		// Use the HTML data processor in this editor.
		this.data.processor = new HtmlDataProcessor();

		// This editor uses a single editable view in DOM.
		this.editable = new InlineEditableUIView( this.locale );

		// A helper to easily replace the editor#element with editor.editable#element.
		this._elementReplacer = new ElementReplacer();
	}

	destroy() {
		// When destroyed, editor sets the output of editor#getData() into editor#element...
		this.updateEditorElement();

		// ...and restores editor#element.
		this._elementReplacer.restore();

		return super.destroy();
	}

	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );
			const editable = editor.editable;

			resolve(
				editor.initPlugins()
					// Render the editable view in DOM first.
					.then( () => editable.render() )
					// Replace the editor#element with editor.editable#element.
					.then( () => editor._elementReplacer.replace( element, editable.element ) )
					// Handle the UI of the editor.
					.then( () => {
						// Create an editing root in the editing layer. It will correspond to the
						// document root created in the constructor().
						const editingRoot = editor.editing.createRoot( 'div' );

						// Bind the basic attributes of the editable in DOM with the editing layer.
						editable.bind( 'isReadOnly' ).to( editingRoot );
						editable.bind( 'isFocused' ).to( editor.editing.view );
						editable.name = editingRoot.rootName;

						// Setup the external Bootstrap UI so it works with the editor. Check out the code samples below to learn more.
						setupButtons( editor );
						setupHeadingDropdown( editor );

						// Tell the world that the UI of the editor is ready to use.
						editor.fire( 'uiReady' );
					} )
					// Bind the editor editing layer to the editable in DOM.
					.then( () => editor.editing.view.attachDomRoot( editable.element ) )
					.then( () => editor.loadDataFromEditorElement() )
					// Fire the events that announce that the editor is complete and ready to use.
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
```

## Creating the Bootstrap UI

Although the editor is ready to use, it is just a bare editable area &mdash; which is not much use to the users. You need to give it an actual interface with the toolbar and buttons.

<info-box hint>
	Refer to the Bootstrap [quick start guide](https://getbootstrap.com/docs/4.0/getting-started/introduction/) to learn how to include Bootstrap in your web page.
</info-box>

With the Bootstrap framework loaded in the web page, you can define the actual UI of the editor in HTML:

```html
<!-- The outermost cotainer of the editor. -->
<div class="ck-editor">
	<!-- The toolbar of the editor. -->
	<div class="btn-toolbar" role="toolbar" aria-label="Editor toolbar">
		<!-- The headings drop-down. -->
		<div class="btn-group mr-2" role="group" aria-label="Headings">
			<div class="dropdown" id="heading">
			  <button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Headings</span></button>
			  <div class="dropdown-menu" aria-labelledby="heading-button"></div>
			</div>
		</div>

		<!-- Basic styles buttons. -->
		<div class="btn-group mr-2" role="group" aria-label="Basic styles">
			<button type="button" class="btn btn-primary btn-sm" id="bold">B</button>
			<button type="button" class="btn btn-primary btn-sm" id="italic">I</button>
			<button type="button" class="btn btn-primary btn-sm" id="underline">U</button>
		</div>

		<!-- Undo and redo buttons. -->
		<div class="btn-group mr-2" role="group" aria-label="Undo">
			<button type="button" class="btn btn-primary btn-sm" id="undo">&larr;</button>
			<button type="button" class="btn btn-primary btn-sm" id="redo">&rarr;</button>
		</div>
	</div>

	<!-- The container with the data of the editor. -->
	<div id="editor">
		<p>Hello world!</p>
	</div>
</div>
```

Although Bootstrap provides most of the CSS, it does not come with styles dedicated for [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) text editors and some tweaking is needed:

```css
/* Give the editor some space and limits using a border. */
.ck-editor {
	margin: 1em 0;
	border: 1px solid rgba( 0, 0, 0, .1 );
	border-radius: 4px;
}

/* Adding internal spacing, border and background to the toolbar.  */
.ck-editor .btn-toolbar {
	padding: .5rem;
	background: #f7f7f9;
	border-bottom: 1px solid rgba( 0, 0, 0, .1 );
}

/* Tweaking the editable area for better readability. */
.ck-editor .ck-editor__editable {
	padding: 2em 2em 1em;
	overflow: auto;
}

/* When in read–only mode, the editable should fade out. */
.ck-editor .ck-editor__editable:not([contenteditable]) {
	background: #fafafa;
	color: #777;
}

/* Make sure the headings drop-down button does not change its size
as different headings are selected. */
.ck-editor .dropdown-toggle span {
	display: inline-block;
	width: 100px;
	text-align: left;
	overflow: hidden;
	text-overflow: ellipsis;
	vertical-align: bottom;
}

/* Make the headings drop-down items visually distinctive. */
.ck-editor .heading-item_heading1 { font-size: 1.5em; }
.ck-editor .heading-item_heading2 { font-size: 1.3em; }
.ck-editor .heading-item_heading3 { font-size: 1.1em; }

.ck-editor [class*="heading-item_"] {
	line-height: 22px;
	padding: 10px;
}

.ck-editor [class*="heading-item_heading"] {
  font-weight: bold;
}

/* Give the basic styles buttons the icon–like look and feel. */
.ck-editor #bold { font-weight: bold; }
.ck-editor #italic { font-style: italic; }
.ck-editor #underline { text-decoration: underline; }
```

## Binding the UI with the editor

At this stage, you are about to bind the editor created at the very beginning of this guide with the Bootstrap UI defined in HTML. Almost every feature in the editor defines some command, e.g. {@link module:heading/headingcommand~HeadingCommand} or {@link module:undo/undocommand~UndoCommand}. Commands can be executed:

```js
editor.exectute( 'undo' );
```

But they also come with default observable attributes like `value` and `isEnabled`. These are the entry points when it comes to creating a custom user interface because their values represent the actual state of the editor and can be followed in simple event listeners:

```js
const command = editor.commands.get( 'undo' );

command.on( 'change:isEnabled', ( evt, name, isEnabled ) => {
	if ( isEnabled ) {
		console.log( 'Whoa, you can undo some stuff now.' );
	} else {
		console.log( 'There is nothing to undo in the editor.' );
	}
} );
```

<info-box hint>
	To learn more about editor commands, check out the {@link module:core/command~Command} API. You can also `console.log` the {@link module:core/editor/editor~Editor#commands `editor.commands`} collection of a live editor to learn which commands it offers.
</info-box>

Now take a closer look at these two mysterious lines in the `BootstrapEditor#create()` method:

```js
setupButtons( editor );
setupHeadingDropdown( editor );
```

`setupButtons()` is a function that binds Bootstrap toolbar buttons with the editor features. It activates the related editor commands upon clicking and makes the buttons listen to the state of the commands to update their CSS classes:

```js
// This function activates Bold, Italic, Underline, Undo and Redo buttons in the toolbar.
function setupButtons( editor ) {
	[ 'bold', 'italic', 'underline', 'undo', 'redo' ].forEach( commandName => {
		// Retrieve the editor command corresponding with the ID of the button in DOM.
		const command = editor.commands.get( commandName );

		// Retrieve the jQuery object corresponding with the button in DOM.
		const button = $( `#${ commandName }` );

		// Clicking the buttons should execute the editor command...
		button.click( () => editor.execute( commandName ) );

		// ...but it should not steal the focus so the editing is uninterrupted.
		button.mousedown( evt => evt.preventDefault() );

		// Commands can become disabled, e.g. when the editor is read-only.
		// Make sure the buttons reflect this state change.
		command.on( 'change:isEnabled', onIsEnabledChange );
		onIsEnabledChange();

		// Bold, Italic and Underline commands have a value that changes
		// when the selection starts in an element that the command creates.
		// The button should indicate that the user is editing a text which
		// is already bold.
		if ( !new Set( [ 'undo', 'redo' ] ).has( commandName ) ) {
			command.on( 'change:value', onValueChange );
			onValueChange();
		}

		function onValueChange() {
			button.toggleClass( 'active', command.value );
		}

		function onIsEnabledChange() {
			button.attr( 'disabled', () => !command.isEnabled );
		}
	} );
}
```

The drop-down in the toolbar is a more complex case because first it must be populated with heading options for the users to select from. Then, clicking each option must execute a related heading command in the editor. Finally, the drop-down button and the drop-down menu items must reflect the state of the editor, for example, when the selection lands in a heading, a proper menu item should become active and the button should show the name of the heading level.

```js
// This function activates the headings drop-down in the toolbar.
function setupHeadingDropdown( editor ) {
	const menu = $( '.ck-editor .dropdown-menu' );
	const button = $( '.ck-editor .dropdown-toggle' );

	// Create a drop-down menu entry for each heading configuration option.
	editor.config.get( 'heading.options' ).map( option => {
		// Retrieve the editor command corresponding with the configuration option.
		const command = editor.commands.get( option.modelElement );
		// Create the menu item DOM element.

		const menuItem = $(
			`<a href="#" class="dropdown-item heading-item_${ option.modelElement }">` +
				`${ option.title }` +
			'</a>' );

		// Upon clicking, the drop-down menu item should execute the command and focus
		// the editing view to keep the editing process uninterrupted.
		menuItem.click( () => {
			editor.execute( option.modelElement );
			editor.editing.view.focus();
		} );

		menu.append( menuItem );

		// Make sure the drop-down and its items reflect the state of the
		// currently active command.
		command.on( 'change:value', onValueChange );
		onValueChange();

		// Heading commands can become disabled, e.g. when the editor is read-only.
		// Make sure the UI reflects this state change.
		command.on( 'change:isEnabled', onIsEnabledChange );
		onIsEnabledChange();

		function onValueChange() {
			if ( command.value ) {
				button.children( ':first' ).text( option.title );
			}

			menuItem.toggleClass( 'active', command.value );
		}

		function onIsEnabledChange() {
			button.attr( 'disabled', () => !command.isEnabled );
		}
	} );
}
```

## Running the editor

When the editor class and the user interface are ready, it is time to run the editor. Just make sure all the plugins are loaded and the right DOM element is passed to `BootstrapEditor#create`:

```js
BootstrapEditor
	.create( $( '#editor' ).get( 0 ), {
		plugins: [
			Clipboard, Enter, Typing, Paragraph,
			BoldEngine, ItalicEngine, UnderlineEngine, HeadingEngine, UndoEngine
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Once everything is working as expected, you may want to create a custom build of your editor to ship it across the applications. To learn more check out the {@link builds/guides/development/custom-builds Creating custom builds} guide.
