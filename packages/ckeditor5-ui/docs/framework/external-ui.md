---
category: framework-deep-dive-ui
meta-title: Third party UI | CKEditor 5 Framework Documentation
order: 20
---

# Third-party UI

CKEditor&nbsp;5 is a modular editing framework that allows various flexible configurations. This includes the usage of a third–party user interface on top of the base editor classes.

In this guide, a [classic–like](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic) editor will be bound to a completely separate, existing UI created in [Bootstrap](http://getbootstrap.com/), providing the basic structure and toolbar items necessary to start editing.

{@snippet examples/bootstrap-ui}

## Readying the editor side

The editor types, such as the {@link getting-started/setup/editor-types#classic-editor classic} or {@link getting-started/setup/editor-types#inline-editor inline editor}, have a dedicated default user interface and a theme. However, only a limited subset of features is required to create an editor instance bound to a Bootstrap UI. You need to import them first:

```js
// Basic classes to create an editor.
import {
	Editor,
	ComponentFactory,
	EditorUI,
	EditorUIView,
	InlineEditableUIView,
	ElementReplacer,
	FocusTracker,
	// Interfaces to extend the basic Editor API.
	ElementApiMixin,
	// Helper function for adding interfaces to the Editor class.
	mix,
	// Helper function that gets the data from an HTML element that the Editor is attached to.
	getDataFromElement,
	// Helper function that binds the editor with an HTMLForm element.
	attachToForm,
	// Basic features that every editor should enable.
	Clipboard,
	Enter,
	Paragraph,
	Typing,
	UndoEditing,
	// Basic features associated with the edited content.
	BoldEditing,
	ItalicEditing,
	UnderlineEditing,
	HeadingEditing
} from 'ckeditor5';
```

<info-box info>
	Note that instead of {@link module:basic-styles/bold~Bold}, which loads the default bold UI and bold editing feature, just the {@link module:basic-styles/bold/boldediting~BoldEditing} is imported. It provides the [engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine) features associated with editing any bold text but does not come with the actual UI.

	Respectively, `ItalicEditing`, `UnderlineEditing`, `HeadingEditing`, and `UndoEditing` are also imported.
</info-box>

After importing the basic editor components, you can define the custom `BootstrapEditor` class that extends the {@link module:core/editor/editor~Editor `Editor`}:

```js
// Extending the Editor class, which brings the base editor API.
export default class BootstrapEditor extends ElementApiMixin( Editor ) {
	constructor( element, config ) {
		super( config );

		// Remember the element the editor is created with.
		this.sourceElement = element;

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();

		// The UI layer of the editor.
		this.ui = new BootstrapEditorUI( this );

		// When editor#element is a textarea inside a form element,
		// the content of this textarea will be updated on form submit.
		attachToForm( this );
	}

	destroy() {
		// When destroyed, the editor sets the output of editor#getData() into editor#element...
		this.updateSourceElement();

		// ...and destroys the UI.
		this.ui.destroy();

		return super.destroy();
	}

	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					// Initialize the UI first. See the BootstrapEditorUI class to learn more.
					.then( () => editor.ui.init( element ) )
					// Fill the editable with the initial data.
					.then( () => editor.data.init( getDataFromElement( element ) ) )
					// Fire the `editor#ready` event that announce the editor is complete and ready to use.
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}
```

## Creating the Bootstrap UI

Although the editor is ready to use, it is just a bare editable area &ndash; that is not of much use to the users. You need to give it an actual interface with the toolbar and buttons.

<info-box hint>
	Refer to the Bootstrap [Getting started](https://getbootstrap.com/docs/4.0/getting-started/introduction/) guide to learn how to include Bootstrap in your web page.
</info-box>

With the Bootstrap framework loaded in the web page, you can define the actual UI of the editor in HTML:

```html
<!-- The outermost container of the editor. -->
<div class="ck-editor">
	<!-- The toolbar of the editor. -->
	<div class="btn-toolbar" role="toolbar" aria-label="Editor toolbar">
		<!-- The headings dropdown. -->
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
	border: 1px solid hsla(0, 0%, 0%, 0.1);
	border-radius: 4px;
}

/* Adding internal spacing, border and background to the toolbar.  */
.ck-editor .btn-toolbar {
	padding: .5rem;
	background: hsl(240, 14%, 97%);
	border-bottom: 1px solid hsla(0, 0%, 0%, 0.1);
}

/* Tweaking the editable area for better readability. */
.ck-editor .ck-editor__editable {
	padding: 2em 2em 1em;
	overflow: auto;
}

/* When in read–only mode, the editable should fade out. */
.ck-editor .ck-editor__editable.ck-read-only {
	background: hsl(0, 0%, 98%);
	color: hsl(0, 0%, 47%);
}

/* Make sure the headings dropdown button does not change its size
as different headings are selected. */
.ck-editor .dropdown-toggle span {
	display: inline-block;
	width: 100px;
	text-align: left;
	overflow: hidden;
	text-overflow: ellipsis;
	vertical-align: bottom;
}

/* Make the headings dropdown items visually distinctive. */
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

At this stage, you should bind the editor created at the beginning of this guide with the Bootstrap UI defined in HTML. All the UI logic will be wrapped into a separate class matching the `EditorUI` {@link module:ui/editorui/editorui~EditorUI interface}. You may have noticed this line in the constructor of the `BootstrapEditor`:

```js
this.ui = new BootstrapEditorUI( this );
```

Define the `BootstrapEditorUI` and then have a closer look at the content of the class:

```js
// The class organizing the UI of the editor, binding it with existing Bootstrap elements in the DOM.
class BootstrapEditorUI extends EditorUI {
	constructor( editor ) {
		super( editor );

		// A helper to easily replace the editor#element with editor.editable#element.
		this._elementReplacer = new ElementReplacer();

		// The global UI view of the editor. It aggregates various Bootstrap DOM elements.
		const view = this._view = new EditorUIView( editor.locale );

		// This is the main editor element in the DOM.
		view.element = $( '.ck-editor' );

		// This is the editable view in the DOM. It will replace the data container in the DOM.
		view.editable = new InlineEditableUIView( editor.locale, editor.editing.view );

		// References to the dropdown elements for further usage. See #_setupBootstrapHeadingDropdown.
		view.dropdownMenu = view.element.find( '.dropdown-menu' );
		view.dropdownToggle = view.element.find( '.dropdown-toggle' );

		// References to the toolbar buttons for further usage. See #_setupBootstrapToolbarButtons.
		view.toolbarButtons = {};

		[ 'bold', 'italic', 'underline', 'undo', 'redo' ].forEach( name => {
			// Retrieve the jQuery object corresponding with the button in the DOM.
			view.toolbarButtons[ name ] = view.element.find( `#${ name }` );
		} );
	}

	// All EditorUI subclasses should expose their view instance
	// so other UI classes can access it if necessary.
	get view() {
		return this._view;
	}

	init( replacementElement ) {
		const editor = this.editor;
		const view = this.view;
		const editingView = editor.editing.view;

		// Make sure the EditorUIView is rendered. This will, for instance, create a place for UI elements
		// like floating panels detached from the main editor UI in DOM.
		this._view.render();

		// Create an editing root in the editing layer. It will correspond with the
		// document root created in the constructor().
		const editingRoot = editingView.document.getRoot();

		// The editable UI and editing root should share the same name.
		view.editable.name = editingRoot.rootName;

		// Render the editable component in the DOM first.
		view.editable.render();

		const editableElement = view.editable.element;

		// Register editable element so it is available via getEditableElement() method.
		this.setEditableElement( view.editable.name, editableElement );

		// Let the editable UI element respond to the changes in the global editor focus tracker
		// and let the focus tracker know about the editable element.
		this.focusTracker.add( editableElement );
		view.editable.bind( 'isFocused' ).to( this.focusTracker );

		// Bind the editable UI element to the editing view, making it an end– and entry–point
		// of the editor's engine. This is where the engine meets the UI.
		editingView.attachDomRoot( editableElement );

		// Setup the existing, external Bootstrap UI so it works with the rest of the editor.
		this._setupBootstrapToolbarButtons();
		this._setupBootstrapHeadingDropdown();

		// Replace the editor#element with editor.editable#element.
		this._elementReplacer.replace( replacementElement, editableElement );

		// Tell the world that the UI of the editor is ready to use.
		this.fire( 'ready' );
	}

	destroy() {
		super.destroy();

		// Restore the original editor#element.
		this._elementReplacer.restore();

		// Destroy the view.
		this._view.editable.destroy();
		this._view.destroy();
	}

	// This method activates Bold, Italic, Underline, Undo and Redo buttons in the toolbar.
	_setupBootstrapToolbarButtons() {
		// Implementation details are in the following snippets.
		// ...
	}

	// This method activates the headings dropdown in the toolbar.
	_setupBootstrapHeadingDropdown() {
		// Implementation details are in the following snippets.
		// ...
	}
}
```

Almost every feature in the editor defines some command, for example, {@link module:heading/headingcommand~HeadingCommand} or {@link module:undo/undocommand~UndoCommand}. Commands can be executed:

```js
editor.execute( 'undo' );
```

They also come with default observable properties like `value` and `isEnabled`. These are the entry points when it comes to creating a custom user interface because their values represent the actual state of the editor. You can follow them in simple event listeners:

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

Knowing that, fill out the missing methods of the `BootstrapEditorUI`.

### Binding the buttons to editor commands

`_setupBootstrapToolbarButtons()` is a method that binds Bootstrap toolbar buttons to the editor features (commands). It activates the corresponding editor commands upon clicking and makes the buttons listen to the state of the commands to update their CSS classes:

```js
// This method activates Bold, Italic, Underline, Undo and Redo buttons in the toolbar.
_setupBootstrapToolbarButtons() {
	const editor = this.editor;

	for ( const name in this.view.toolbarButtons ) {
		// Retrieve the editor command corresponding with the ID of the button in the DOM.
		const command = editor.commands.get( name );
		const button = this.view.toolbarButtons[ name ];

		// Clicking the buttons should execute the editor command...
		button.click( () => editor.execute( name ) );

		// ...but it should not steal the focus so the editing is uninterrupted.
		button.mousedown( evt => evt.preventDefault() );

		const onValueChange = () => {
			button.toggleClass( 'active', command.value );
		};

		const onIsEnabledChange = () => {
			button.attr( 'disabled', () => !command.isEnabled );
		};

		// Commands can become disabled, e.g. when the editor is read-only.
		// Make sure the buttons reflect this state change.
		command.on( 'change:isEnabled', onIsEnabledChange );
		onIsEnabledChange();

		// Bold, Italic and Underline commands have a value that changes
		// when the selection starts in an element the command creates.
		// The button should indicate that e.g. you are editing text which is already bold.
		if ( !new Set( [ 'undo', 'redo' ] ).has( name ) ) {
			command.on( 'change:value', onValueChange );
			onValueChange();
		}
	}
}
```

### Binding the dropdown to the heading commands

The dropdown in the toolbar is a more complex case.

First, it must be populated with heading options for the users to select from. Then, clicking each option must execute a related heading command in the editor. Finally, the dropdown button and the dropdown menu items must reflect the state of the editor, for example, when the selection lands in a heading, a proper menu item should become active and the button should show the name of the heading level.

```js
// This method activates the headings dropdown in the toolbar.
_setupBootstrapHeadingDropdown() {
	const editor = this.editor;
	const dropdownMenu = this.view.dropdownMenu;
	const dropdownToggle = this.view.dropdownToggle;

	// Retrieve the editor commands for heading and paragraph.
	const headingCommand = editor.commands.get( 'heading' );
	const paragraphCommand = editor.commands.get( 'paragraph' );

	// Create a dropdown menu entry for each heading configuration option.
	editor.config.get( 'heading.options' ).map( option => {
		// Check if options is a paragraph or a heading as their commands differ slightly.
		const isParagraph = option.model === 'paragraph';

		// Create the menu item DOM element.
		const menuItem = $(
			`<a href="#" class="dropdown-item heading-item_${ option.model }">` +
				`${ option.title }` +
			'</a>'
		);

		// Upon click, the dropdown menu item should execute the command and focus
		// the editing view to keep the editing process uninterrupted.
		menuItem.click( () => {
			const commandName = isParagraph ? 'paragraph' : 'heading';
			const commandValue = isParagraph ? undefined : { value: option.model };

			editor.execute( commandName, commandValue );
			editor.editing.view.focus();
		} );

		dropdownMenu.append( menuItem );

		const command = isParagraph ? paragraphCommand : headingCommand;

		// Make sure the dropdown and its items reflect the state of the
		// currently active command.
		const onValueChange = isParagraph ? onValueChangeParagraph : onValueChangeHeading;
		command.on( 'change:value', onValueChange );
		onValueChange();

		// Heading commands can become disabled, e.g. when the editor is read-only.
		// Make sure the UI reflects this state change.
		command.on( 'change:isEnabled', onIsEnabledChange );

		onIsEnabledChange();

		function onValueChangeHeading() {
			const isActive = !isParagraph && command.value === option.model;

			if ( isActive ) {
				dropdownToggle.children( ':first' ).text( option.title );
			}

			menuItem.toggleClass( 'active', isActive );
		}

		function onValueChangeParagraph() {
			if ( command.value ) {
				dropdownToggle.children( ':first' ).text( option.title );
			}

			menuItem.toggleClass( 'active', command.value );
		}

		function onIsEnabledChange() {
			dropdownToggle.attr( 'disabled', () => !command.isEnabled );
		}
	} );
}
```

## Running the editor

When the editor classes and the user interface are ready, it is time to run the editor. Just make sure all the plugins are loaded and the right DOM element is passed to `BootstrapEditor#create`:

```js
BootstrapEditor.create( $( '#editor' ).get( 0 ), {
	plugins: [
		Clipboard, Enter, Typing, Paragraph,
		BoldEditing, ItalicEditing, UnderlineEditing, HeadingEditing, UndoEditing
	]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
```

Once everything works as expected, you may want to create a custom preset of your editor to ship it across the applications. To learn more check out the {@link getting-started/legacy-getting-started/quick-start-other#building-the-editor-from-source Creating custom builds guide}.
