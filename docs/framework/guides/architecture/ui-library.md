---
category: framework-architecture
order: 40
---

# UI library

The standard UI library of CKEditor 5 is [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui). It provides base classes and helpers that allow building a modular UI that seamlessly integrates with other components of the ecosystem.

## Views

Views use [templates](#Templates) to build the UI. They also provide observable interfaces that other features (e.g. [plugins](#Plugins), [commands](#Commands), etc.) can use to change the DOM without any actual interaction with the native API.

### Definition

A simple input view class can be defined as follows:

```js
class SampleInputView extends View {
	constructor( locale ) {
		super( locale );

		// An entry point to binding observables with DOM attributes,
		// events and text nodes.
		const bind = this.bindTemplate;

		// Views define their interface (state) using observable properties.
		this.set( {
			isEnabled: false,
			placeholder: ''
		} );

		this.setTemplate( {
			tag: 'input',
			attributes: {
				class: [
					'foo',
					// The value of view#isEnabled will control the presence
					// of the class.
					bind.if( 'isEnabled', 'ck-enabled' ),
				],

				// The HTML "placeholder" attribute is also controlled by the observable.
				placeholder: bind.to( 'placeholder' ),
				type: 'text'
			},
			on: {
				// DOM keydown events will fire the view#input event.
				keydown: bind.to( 'input' )
			}
		} );
	}

	setValue( newValue ) {
		this.element.value = newValue;
	}
}
```

Note that views encapsulate the DOM they render. Because the UI is organized according to the *view-per-tree* rule, it is clear which view is responsible for which part of the UI so it is unlikely that a collision occurs between two features writing to the same DOM node.

More often than not, views become children of other views (collections), nodes in the [UI view tree](#View-collections-and-the-UI-tree):

```js
class ParentView extends View {
	constructor( locale ) {
		super( locale );

		const childA = new SampleInputView( locale );
		const childB = new SampleInputView( locale );

		this.setTemplate( {
			tag: 'div',
			children: [
				childA
				childB
			]
		} );
	}
}

const parent = new ParentView( locale );

parent.render();

// Will insert <div><input .. /><input .. /></div>.
document.body.appendChild( parent.element );
```

It is also possible to create standalone views that do not belong to any collection. They must be {@link module:ui/view~View#render rendered} before injection into the DOM:

```js
const view = new SampleInputView( locale );

view.render();

// Will insert <input class="foo" type="text" placeholder="" />
document.body.appendChild( view.element );
```

### Interaction

Features can interact with the state of the DOM via the observable properties of the view, so the following:

```js
view.isEnabled = true;
view.placeholder = 'Type some text';
```

will result in:

```html
<input class="foo ck-enabled" type="text" placeholder="Type some text" />
```

Alternatively, they can [bind](#Event-system-and-observables) them directly to their own observable properties:

```js
view.bind( 'placeholder', 'isEnabled' ).to( observable, 'placeholderText', 'isEnabled' );

// The following will be automatically reflected in the view#placeholder and
// view.element#placeholder HTML attribute in the DOM.
observable.placeholderText = 'Some placeholder';
```

Also, since views propagate the DOM events, features can now react to the user actions:

```js
// Each "keydown" event in the input will execute a command.
view.on( 'input', () => {
	editor.execute( 'myCommand' );
} );
```

### Best practices

A complete view should provide an interface for the features, encapsulating DOM nodes and attributes. Features should not touch the DOM of the view using the native API. Any kind of interaction must be handled by the view that owns an {@link module:ui/view~View#element} to avoid collisions:

```js
// Will change the value of the input.
view.setValue( 'A new value of the input.' );

// WRONG! This is **NOT** the right way to interact with DOM because it collides
// with an observable binding to the #placeholderText. The value will be
// permanently overridden when the state of the observable changes.
view.element.placeholder = 'A new placeholder';
```

## Templates

{@link module:ui/template~Template Templates} render DOM elements and text nodes in the UI library. Used primarily by [views](#Views), they are the lowest layer of the UI connecting the application to the web page.

<info-box>
	Check out the {@link module:ui/template~TemplateDefinition} to learn more about the template syntax and other advanced concepts.
</info-box>

Templates support [observable properties](#Event-system-and-observables) bindings and handle native DOM events. A very simple template can look like this:

```js
new Template( {
	tag: 'p',
	attributes: {
		class: [
			'foo',
			bind.to( 'className' )
		],
		style: {
			backgroundColor: 'yellow'
		}
	},
	on: {
		click: bind.to( 'clicked' )
	}
	children: [
		'A paragraph.'
	]
} ).render();
```

and renders to an HTML element:

```html
<p class="foo bar" style="background-color: yellow;">A paragraph.</p>
```

where `observable#className` is `"bar"`. The `observable` in the example above can be a [view](#Views) or any object which is {@link module:utils/observablemixin~Observable observable}. When the value of the `className` attribute changes, the template updates the `class` attribute in the DOM. From now on the element is permanently bound to the state of an application.

Similarly, when rendered, the template also takes care of DOM events. A binding to the `click` event in the definition makes the `observable` always fire the `clicked` event upon an action in DOM. This way the `observable` provides an event interface of the DOM element and all the communication should pass through it.

## View collections and the UI tree

Views are organized into {@link module:ui/viewcollection~ViewCollection collections} which manage their elements and propagate DOM events even further. Adding or removing a view in a collection moves the {@link module:ui/view~View#element view's element} in the DOM to reflect the position.

Each editor UI has a {@link module:core/editor/editorui~EditorUI#view root view}, which can be found under `editor.ui.view`. Such view usually defines the container element of the editor and undermost view collections that other features can populate.

For instance, the `BoxedEditorUiView` class defines two collections:
* {@link module:ui/editorui/boxed/boxededitoruiview~BoxedEditorUIView#top} &ndash; A collection that hosts the toolbar.
* {@link module:ui/editorui/boxed/boxededitoruiview~BoxedEditorUIView#main} &ndash; A collection that contains the editable area of the editor.

It also inherits the {@link module:ui/editorui/editoruiview~EditorUIView#body} collection which resides directly in the `<body>` of the web page and stores floating elements like {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon panels}.

Plugins can populate the root view collections with their children. Such child views become a part of the UI tree and will be managed by the editor, e.g. they will be initialized and destroyed along with the editor.

```js
class MyPlugin extends Plugin {
	init() {
		const editor = this.editor;
		const view = new MyPluginView();

		editor.ui.top.add( view );
	}
}
```

`MyPluginView` can {@link module:ui/view~View#createCollection create own view collections} and populate them during the life cycle of the editor. There is no limit to the depth of the UI tree, which usually looks like this:

```
EditorUIView
	├── "top" collection
	│	└── ToolbarView
	│		└── "items" collection
	│			├── DropdownView
	│			│	├── ButtonView
	│			│	└── PanelView
	│			├── ButtonViewA
	│			├── ButtonViewB
	│			└── ...
	├── "main" collection
	│	└── InlineEditableUIView
	└── "body" collection
		 ├── BalloonPanelView
		 │	└── "content" collection
		 │		└── ToolbarView
		 ├── BalloonPanelView
		 │	└── "content" collection
		 │		└── ...
		 └── ...
```

## Using the existing components

The framework provides a number of common {@link api/ui components} like {@link module:ui/button/buttonview~ButtonView `ButtonView`} or {@link module:ui/toolbar/toolbarview~ToolbarView `ToolbarView`} that can be helpful when developing a new user interface.

For example, to create a toolbar with a few buttons inside, `ToolbarView` and `ButtonView` classes need to be imported first:

```js
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
```

Create the toolbar and a couple of buttons with labels first. Then append the buttons to the toolbar:

```js
const toolbar = new ToolbarView();
const buttonFoo = new ButtonView();
const buttonBar = new ButtonView();

buttonFoo.set( {
	label: 'Foo',
	withText: true
} );

buttonBar.set( {
	label: 'Bar',
	withText: true
} );

toolbar.items.add( buttonFoo );
toolbar.items.add( buttonBar );
```

The toolbar can now join the [UI tree](##View-collections-and-the-UI-tree) or it can be injected straight into the DOM. To keep the example simple, proceed with the latter scenario:

```js
toolbar.render();

document.body.appendChild( toolbar.element );
```

The result should look like this:

{@img assets/img/framework-architecture-toolbar.png 442 A simple toolbar created using existing components.}

The toolbar renders correctly but it does not do much. To execute an action when the button is clicked, a listener must be defined. To shorten the code and instead of two listeners define just one, the buttons can {@link module:utils/emittermixin~EmitterMixin#delegate delegate} the {@link module:ui/button/buttonview~ButtonView#execute `execute`} event to their parent:

```js
buttonFoo.delegate( 'execute' ).to( toolbar );
buttonBar.delegate( 'execute' ).to( toolbar );

toolbar.on( 'execute', evt => {
	console.log( `The "${ evt.source.label }" button was clicked!` );
} );
```

### Dropdowns

#### Creating ListView dropdown with standard button

```js
import Model from '@ckeditor/ckeditor5-ui/src/model';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

const items = [
	new Model( {
		label: 'Do Foo',
		commandName: 'foo'
	} ),
	new Model( {
		label: 'Do Bar',
		commandName: 'bar'
	} ),
];

const dropdownView = createDropdown( locale );

addListToDropdown( dropdownView, items );

// Execute command when an item from the dropdown is selected.
dropdownView.on( 'execute', evt => {
	editor.execute( evt.source.commandName );
	editor.editing.view.focus();
} );
```

#### Creating Toolbar dropdown with SplitButton

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import bindOneToMany from '@ckeditor/ckeditor5-ui/src/bindings/bindonetomany';
import { addToolbarToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';

buttons.push( new ButtonView() );
buttons.push( componentFactory.create( 'someExistingButton' ) );

const dropdownView = createDropdown( locale, SplitButtonView );

dropdownView.buttonView.set( {
	icon: 'some SVG',
	tooltip: 'My dropdown'
} );


// This will enable toolbar button when any of button in dropdown is enabled.
bindOneToMany( dropdownView, 'isEnabled', buttons, 'isEnabled',
	( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
);

// Make this a dropdown with toolbar inside dropdown panel.
addToolbarToDropdown( dropdownView, buttons );

// Execute current action from dropdown's split button action button.
dropdownView.buttonView.on( 'execute', () => {
	editor.execute( 'command', { value: model.commandValue } );
	editor.editing.view.focus();
} );
```

## Keystrokes and focus management

_Coming soon..._

The framework offers built–in classes that help manage keystrokes and focus in the UI. They are particularly useful when it comes to bringing accessibility features to the application.

### Focus tracker

The {@link module:utils/focustracker~FocusTracker `FocusTracker`} class can observe a number of HTML elements and determine if one of them is focused either by the user (clicking, typing) or using the `HTMLElement.focus()` DOM method.

```js
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

// ...

const focusTracker = new FocusTracker();
```

To register elements in the tracker, use the {@link module:utils/focustracker~FocusTracker#add `add()`} method:

```js
focusTracker.add( document.querySelector( '.some-element' ) );
focusTracker.add( viewInstance.element );
```

Observing focus tracker's {@link module:utils/focustracker~FocusTracker#isFocused `isFocused`} observable property allows to determine whether one of the registered elements is currently focused:

```js
focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
	if ( isFocused ) {
		console.log( 'The', focusTracker.focusedElement, 'is focused now.' );
	} else {
		console.log( 'The elements are blurred.' );
	}
} );
```

This information is useful when implementing a certain type of UI whose behavior depends on the focus, for example, contextual panels and floating balloons containing forms should hide when the user decides to abandon them.

### Keystroke handler

The {@link module:utils/keystrokehandler~KeystrokeHandler `KeystrokeHandler`} listens to the keystroke events fired by an HTML element or any of its descendants and executes pre–defined actions when the keystroke is pressed. Usually, each [view](#Views) creates its own keystroke handler instance which takes care of the keystrokes fired by the elements the view has rendered.

```js
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

// ...

const keystrokeHandler = new KeystrokeHandler();
```

To define the scope of the keystroke handler in the DOM, use the {@link module:utils/keystrokehandler~KeystrokeHandler#listenTo `listenTo()`} method:

```js
keystrokeHandler.listenTo( document.querySelector( '.some-element' ) );
keystrokeHandler.listenTo( viewInstance.element );
```

<info-box>
	Check out the list of {@link module:utils/keyboard#keyCodes known key names} supported by the keystroke handler.
</info-box>

Keystroke action callbacks are functions. To prevent the default action of the keystroke and stop further propagation, use the `cancel()` function provided in the callback.

```js
keystrokeHandler.set( 'Tab', ( keyEvtData, cancel ) => {
	console.log( 'Tab was pressed!' );

	// This keystroke has been handled and can be canceled.
	cancel();
} );
```

<info-box>
	There is also an {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler `EditingKeystrokeHandler`} class which has the same API as `KeystrokeHandler` but it offers direct keystroke bindings to editor commands.

	The editor provides such keystroke handler under the {@link module:core/editor/editor~Editor#keystrokes `editor.keystrokes`} property so any plugin can register keystrokes associated with editor commands. For example, the {@link module:undo/undo~Undo Undo} plugin registers `editor.keystrokes.set( 'Ctrl+Z', 'undo' );` to execute its `undo` command.
</info-box>

When multiple callbacks are assigned to the same keystroke, priorities can be used to decide which one should be handled first and whether other callbacks should be executed at all:

```js
keystrokeHandler.set( 'Ctrl+A', ( keyEvtData ) => {
	console.log( 'A normal priority listener.' );
} );

keystrokeHandler.set( 'Ctrl+A', ( keyEvtData ) => {
	console.log( 'A high priority listener.' );

	// The normal priority listener will not be executed.
	cancel();
}, { priority: 'high' } );
```

Pressing <kbd>Ctrl</kbd>+<kbd>A</kbd> will only log:

```
"A high priority listener."
```
