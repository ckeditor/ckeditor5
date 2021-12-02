---
category: framework-deep-dive-ui
menu-title: Focus tracking
classes: focus-tracking
---

# Deep dive into focus tracking

**Focus is where all the keyboard interactions (events) take place.** It is an essential concept for any piece of a web page operated with a keyboard, be it a physical keyboard of your laptop or a software keyboard of your smartphone. And CKEditor 5 being a rich text editor is no exception here.

## What is focus and why it matters for CKEditor?

### What is focus?

Every time you click a text field or an editor, it automatically prepares to accept your text. It is no longer just a static container for letters but something you can interact with using your keyboard. And you know it because you can see the familiar blinking caret somewhere inside of it. This subtle action called a **focus change** takes place hundreds of times every day as you navigate web pages, type your search queries, chat with your friends and fill in checkout forms when online shopping.

{@img assets/img/framework-deep-dive-focus-form-example.gif 578 The animation showing the focus moving from one field to another when filling in the form.}

Focusing text fields feels so natural we usually do not give it much thought. But if it wasn't for that simple action... there would be no way to type text. Where would it go if there was no focused field? Focus informs the software about your intentions and it is synonymous with the **context**.

### Focus in CKEditor

But CKEditor is more than a simple text field. Yes, it has the main space where you type your text but other places also allow you to type, for instance, a link URL field or a form with plenty of inputs allowing you to configure the look of a table.

{@img assets/img/framework-deep-dive-focus-link-blinking-caret.gif 606 The animation showing the focused link URL input in CKEditor 5 with a blinking caret.}

And when many places accept focus, there must be some systems out there to discover and manage it. These systems work, for instance, so you will not find yourself in a situation where CKEditor 5 loses focus (or gets **blurred**) and you cannot type your text. Or they make sure you can see and use the editor toolbar as long as you keep editing. These are just a few examples of why focus management systems are necessary. Now it should also be clear that they are essential for the editing experience.

In the following chapters of this guide, we will explain how these systems work, what makes CKEditor "focusable", and how to develop new editor features so they fit into the existing focus management systems and patterns:

- [**The first section**](#focus-in-the-editor-engine) explains how the editor {@link framework/guides/architecture/editing-engine engine} manages focus and what tools exist there to help you out when developing new features.
- In [**the second section**](#focus-in-the-editor-ui), we will show you how the {@link framework/guides/architecture/ui-library user interface} of the editor tracks focus and how various UI components take advantage of that, for instance, to provide accessibility.
- In [**the last part**](#focus-state-analysis), we will use the knowledge from previous sections in a real–life scenario and analyze how all these tools and systems work together.

## Focus in the editor engine

<info-box>
	Keep in mind that information in this chapter concerns the editor **engine layer only**. To learn about focus in the user interface, check out the [next section](#focus-in-the-editor-ui) of this guide.
</info-box>

The main editable area of CKEditor 5 WYSIWYG editor can be focused thanks to the [`contenteditable`](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content) DOM attribute. This attribute tells the web browser that a web page element can be edited like any other text field, which also means it must be able to receive focus.

Each root of the editing view has the `contenteditable` attribute. The editing view uses the {@link module:engine/view/observer/focusobserver~FocusObserver `FocusObserver`} (learn more about {@link framework/guides/architecture/editing-engine#observers view observers}) to track focus in editables by listening to native DOM `focus` and `blur` events coming from them.

<info-box>
	Already confused? Take a look at our {@link framework/guides/architecture/editing-engine#observers editing engine guide} that explains what the editing view, editables and other building blocks of CKEditor 5 are.
</info-box>

### Checking if the view document is focused

You can check if the view document is focused using its {@link framework/guides/deep-dive/observables observable} {@link module:engine/view/document~Document#isFocused} property. Create an editor instance and execute the following code:

```js
console.log( editor.editing.view.document.isFocused );
```

If you run this snippet from the web browser's developer console, it should return `false` unless you managed to keep the editor focused (e.g. by running a debugger and freezing the DOM). This happens because the editor loses focus the moment you switch to developer tools to execute the snippet.

So how do I know `isFocused` actually works? Since it is observable you can see how it changes live:

```js
editor.editing.view.document.on( 'change:isFocused', ( evt, data, isFocused ) => {
	console.log( `View document is focused: ${ isFocused }.` );
} );
```

Click the editable area of the editor and then click somewhere else &mdash; the `isFocused` property will change its value when you do that. The same will also happen if you run an editor with {@link framework/guides/custom-editor-creator **multiple editing roots**} and navigate across them.

To spice things up even more, you should also know `isFocused` will change when you focus any {@link framework/guides/tutorials/implementing-a-block-widget **nested editable**} in the content (take, for example, a {@link features/images-captions caption of an image}). Sounds weird, right? This is because every nested editable in the content has the `contenteditable` attribute, too, and for the web browser moving your caret inside it means the main editable element is blurred and the nested one is focused.

### How to focus the editor?

The simplest way to focus the editor is to call the {@link module:core/editor/editor~Editor#focus `editor.focus()`} method.

However, you may wish to explicitly focus the editable area of CKEditor 5 when a certain action is executed (e.g. a button is clicked). To do that, use the {@link module:engine/view/view~View#focus `focus()`} method of the editing view:

```js
editor.editing.view.focus();
```

This snippet focuses the editable that has the selection. If the editor has not been focused yet, this will focus the very first editable. If an editor has multiple editing roots and the user was editing content, focus will be brought back where the user left off.

<info-box>
	Focusing the editor does not change its selection. If you want to focus the editor and move the caret to a specific position, you should call `editor.editing.view.focus()` first and then use the {@link module:engine/model/writer~Writer#setSelection `setSelection()`} method of the {@link framework/guides/architecture/editing-engine#model model writer} to change the selection.
</info-box>

## Focus in the editor UI

If you read the [previous section](#focus-in-the-editor-engine) of this guide you should know that there is already a layer responsible for tracking focus implemented in the {@link framework/guides/architecture/editing-engine editor engine}. But because the {@link framework/guides/architecture/intro editor framework is modular}, this layer is only concerned by the focus in editable roots of the editor and it knows nothing of the user interface. This granularity makes it possible, for instance, to create a fully–functioning editor without the UI.

As for the user interface of CKEditor 5, it is a composition of multiple components {@link framework/guides/architecture/ui-library#view-collections-and-the-ui-tree organized as a tree}. This tree determines not only the logical structure of the UI (a toolbar has a dropdown, a dropdown has a button, a button has an icon, etc.) but also its behavior, and that includes tracking and maintaining focus as the user navigates and interacts with various pieces of the interface.

<info-box>
	Feeling overwhelmed? Take a look at the {@link framework/guides/architecture/ui-library UI library guide} and learn some basics about how the UI of CKEditor 5 works and what its main building blocks are.
</info-box>

To sum up, there are two main reasons why focus is being tracked separately on the UI level:

- **To make sure the editor (as a whole) never loses focus unless the user wants it to.**
For instance, take a look at the {@link examples/builds/inline-editor inline editor}. As long as the user edits text in the main editable area or configures its properties in any popup, dropdown, or panel, the main editor toolbar must remain visible (because the focus is somewhere in the UI). Only when the user finishes editing and moves somewhere else on a web page, the toolbar can disappear.
- **To make the UI accessible to users who navigate it using screen readers and other assistive technologies.**
These users not only write text using the keyboard but also use it to navigate across toolbar buttons, panels, dropdowns, etc. The UI of the editor must constantly keep track of which component is currently focused, for example, to allow navigation using <kbd>Tab</kbd>, <kbd>Esc</kbd> and arrow keys.

### Tools and architecture

Focus management lives next to the {@link framework/guides/architecture/ui-library#view-collections-and-the-ui-tree user interface element tree} and its architecture is also based on components that respond to user actions within its boundaries and their children. Take a look at a common keyboard navigation scenario in a {@link examples/builds/classic-editor classic editor} instance:

{@img assets/img/framework-deep-dive-focus-toolbar-nav.gif 950 The animation showing the focus moving as the user navigates to the heading drop–down in the toolbar.}

Here are the focus layers that play a role in the navigation and a brief overview of what happens at each layer:

{@img assets/img/framework-deep-dive-focus-toolbar-nav-layers.png 1019 The image showing the focus layers used during navigation.}

1. The root of the focus tree is the {@link module:editor-classic/classiceditorui~ClassicEditorUI} class. It creates a [global focus tracker](#a-note-about-the-global-focus-tracker) for the entire editor (you can access it via {@link module:core/editor/editorui~EditorUI#focusTracker `editor.ui.focusTracker`}).
2. When editing text, you can hit the <kbd>Alt</kbd>+<kbd>F10</kbd> keystroke to focus the main editor toolbar, which is the second focus layer.
	* The {@link module:ui/toolbar/toolbarview~ToolbarView} component brings a focus tracker that keeps an eye on its children so that when a user navigates across the toolbar using the keyboard arrows, it is clear which item is focused.
	* Toolbars also use a [focus cycler](#using-the-focuscycler-class) to provide continuous navigation. For instance, navigating to the next item when the last one is focused brings the focus back to the beginning of the toolbar.
3. When a user selects a toolbar item, its `focus()` method is executed. That brings us to the third layer.
	* Some components of the toolbar are simple (like {@link module:ui/button/buttonview~ButtonView}) and their DOM elements are leaves of the focus tree. But some components, for instance, the {@link module:ui/dropdown/dropdownview~DropdownView}, are containers and allow the focus to go deeper. Each dropdown has a focusable button and can host one child view in its {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView}. It does not need a focus tracker because there are only two ways a user can navigate it: down its panel or away from it.
4. When a user enters the dropdown's panel, they visit another (fourth) layer of focus. This time it is the {@link module:ui/list/listview~ListView} that, like the `ToolbarView`, also needs a focus tracker and a focus cycler to allow smooth keyboard navigation across its items.
5. The outermost leaf of the focus tree in this example is a {@link module:ui/list/listitemview~ListItemView}. It has the {@link module:ui/list/listitemview~ListItemView#focus `focus()`} method that focuses its element in the DOM.

And here is the summary of the tools used by each focus layer (UI component):

<figure class="table">
	<table>
		<thead>
			<tr>
				<th colspan="2">Focus layer</th>
				<th>Needs <a href="#using-the-focustracker-class">focus tracker</a>?</th>
				<th>Needs <a href="#using-the-keystrokehandler-class">keystroke handler</a>?</th>
				<th>Needs <a href="#using-the-focuscycler-class">focus cycler</a>?</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>1</td>
				<td>{@link module:editor-classic/classiceditorui~ClassicEditorUI}</td>
				<td>✅</td>
				<td>✅</td>
				<td>❌</td>
			</tr>
			<tr>
				<td>2</td>
				<td>{@link module:ui/toolbar/toolbarview~ToolbarView}</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<td>3</td>
				<td>{@link module:ui/dropdown/dropdownview~DropdownView}</td>
				<td>❌</td>
				<td>✅</td>
				<td>❌</td>
			</tr>
			<tr>
				<td>4</td>
				<td>{@link module:ui/list/listview~ListView}</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<td>5</td>
				<td>{@link module:ui/list/listitemview~ListItemView}</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
			</tr>
		</tbody>
	</table>
</figure>

Most components have [focus trackers](#using-the-focustracker-class) to keep up with the focus inside of them. Some components that host more children also use [focus cyclers](#using-the-focuscycler-class) and [keystroke handlers](#using-the-keystrokehandler-class) to help the user navigate across them. You can learn how to use them in the later sections of this guide:

- [Implementing focusable UI components](#implementing-focusable-ui-components),
- [Using the `FocusTracker` class](#using-the-focustracker-class),
- [Using the `KeystrokeHandler` class](#using-the-keystrokehandler-class),
- [Using the `FocusCycler` class](#using-the-focuscycler-class).

### Implementing focusable UI components

Any UI {@link framework/guides/architecture/ui-library#views view} can be focusable. To become one, a view must implement the `focus()` method that focuses the DOM {@link module:ui/view~View#element  element} and the `tabindex="-1"` attribute set on the element that prevents the native navigation using the keyboard (which should be handled by the [focus cycler](#using-the-focuscycler-class) on the parent–level):

<info-box>
	The [`tabindex="-1"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex) is a native DOM attribute that controls whether a DOM element can be focused (and in which order). Setting its value to `"-1"` tells the web browser that it should exclude it from the native keyboard navigation and allow it only to be focused using JavaScript. Because your component will belong to the editor focus management system, you should do that if you want to avoid collisions with the web browser.
</info-box>

```js
import View from '@ckeditor/ckeditor5-ui/src/view';

class MyListItemView extends View {
	constructor( locale, text ) {
		super( locale );

		// ...

		this.setTemplate( {
			tag: 'li',
			attributes: {
				tabindex: -1
			},
			children: [ text ]
		} );
	}

	// ...

	focus() {
		this.element.focus();
	}
}
```

If a view has many focusable children (e.g. a list), the `focus()` method should focus the first child:

```js
import View from '@ckeditor/ckeditor5-ui/src/view';

class MyListView extends View {
	constructor( locale ) {
		super( locale );

		// ...

		this.items = this.createCollection();

		this.setTemplate( {
			tag: 'ul',
			children: this.items
		} );
	}

	// ...

	focus() {
		if ( this.items.length ) {
			// This will call MyListItemView#focus().
			this.items.first.focus();
		}
	}
}
```

Focusable views are what make it possible to navigate the interface of CKEditor using the keyboard. In the [next section](#using-the-focustracker-class), you will learn how parent views keep track of focus among their children using the `FocusTracker` class.

### Using the `FocusTracker` class

One of the key focus management helpers in the CKEditor 5 UI is the {@link module:utils/focustracker~FocusTracker `FocusTracker`} class and its instances. They work at the DOM level and offer a fairly simple API:

- Methods to {@link module:utils/focustracker~FocusTracker#add `add()`} and {@link module:utils/focustracker~FocusTracker#remove `remove()`} tracked DOM elements.
- An observable {@link module:utils/focustracker~FocusTracker#isFocused `isFocused`} property telling the world that one of the tracked elements has focus in the DOM.
- An observable {@link module:utils/focustracker~FocusTracker#focusedElement `focusedElement`} property that precisely says which DOM element is focused.

Focus trackers listen to DOM `focus` and `blur` events coming from elements they track and they determine if any is currently focused. As a rule of thumb, a {@link framework/guides/architecture/ui-library#view-collections-and-the-ui-tree parent} to more than one focusable element should have a focus tracker.

<info-box>
	Keep in mind that simple components that have no focusable children or just a single focusable child may not need a focus tracker.
</info-box>

#### A note about the global focus tracker

Each editor instance has a **global focus tracker** that can be accessed via {@link module:core/editor/editorui~EditorUI#focusTracker `editor.ui.focusTracker`}. It is a special instance that glues all the pieces of the user interface together (including the editing root) and stores the focus state of the **entire editor instance**.

You can **always** listen to the global focus tracker and tell if the user is using the UI:

```js
editor.ui.focusTracker.on( 'change:isFocused', ( evt, data, isFocused ) => {
	console.log( `The editor is focused: ${ isFocused }.` );
} );
```

The class responsible for the UI of the editor ({@link module:editor-classic/classiceditorui~ClassicEditorUI}, {@link module:editor-inline/inlineeditorui~InlineEditorUI}, etc.) **must** inform the global focus tracker about the focusable building blocks of the interface, for instance, editable roots of the editor (where the editing takes place) or toolbars.

The same applies to plugins bringing any focusable UI. For instance, the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} plugin that offers a shared floating balloon used by many features across the project (link editing, image tools, widget toolbars, etc.) also registers the balloon in the global focus tracker. Please keep this in mind when developing your custom editor plugins.

The continuity of editor focus is maintained **only** when the global focus tracker is aware of **all** focusable blocks of the UI. Their location in DOM is irrelevant: next to the editable root, in the {@link module:ui/editorui/bodycollection~BodyCollection "body" collection} or even somewhere else. To the global focus tracker they are all pieces of the same editor.

<info-box>
	Check out the [Focus state analysis section ](#focus-state-analysis) to see the global focus tracker working in a real–life scenario.
</info-box>

#### A practical example

Take a look at the following example of a list that has multiple items, a classic use case for a focus tracker:

```js
import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

class MyListView extends View {
	constructor( locale ) {
		super( locale );

		// ...

		// A view collection containing items of the list.
		this.items = this.createCollection();

		// ...

		// The instance of the focus tracker that tracks focus in #items.
		this.focusTracker = new FocusTracker();
	}

	// ...
}
```

To make sure your focus tracker instance and the `items` view collection stay synchronized, create  listeners that will update the tracker when a new child view is added or some are removed ({@link module:ui/viewcollection~ViewCollection view collections fire events}). The best way to do that is inside the {@link module:ui/view~View#render `render()`} method:

```js
// ...

class MyListView extends View {
	constructor( locale ) {
		// ...
	}

	// ...

	render() {
		super.render();

		// Children added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		// Make sure items added to the collection are recognized by the #focusTracker.
		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		// Make sure items removed from the collection are ignored by the #focusTracker.
		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );
	}

	// ...
}
```

The `MyListView` can now track focused children, and it is time to help the user navigate them using the keyboard. In the next section, you will create a [keystroke handler](#using-the-keystrokehandler-class) that will bring you closer to the goal.

### Using the `KeystrokeHandler` class

The {@link module:utils/keystrokehandler~KeystrokeHandler} helper class allows registering callbacks for the keystrokes. It is used in many views across the UI of the editor for many purposes. For instance, it is responsible for focusing the toolbar on the <kbd>Alt</kbd>+<kbd>F10</kbd> keypress or it opens the link popup form when you hit <kbd>Ctrl</kbd>+<kbd>L</kbd> on a selected text.

But in the context of focus management, it is used by the [focus cycler](#using-the-focuscycler-class) you will get familiar with in the next section. You can learn more about the {@link module:utils/keystrokehandler~KeystrokeHandler} class in the API documentation but for now, you should only know how to create and initialize it before moving forward:

```js
import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

export default class MyListView extends View {
	constructor( locale ) {
		super( locale );

		// ...

		// The keystroke handler that will help the focus cycler respond to the keystrokes.
		this.keystrokes = new KeystrokeHandler();
	}

	render() {
		super.render();

		// ...

		// Start listening for the keystrokes coming from #element, which will allow
		// the focus cycler to handle the keyboard navigation.
		this.keystrokes.listenTo( this.element );
	}

	destroy() {
		// Stop listening to all keystrokes when the view is destroyed.
		this.keystrokes.destroy();
	}

	// ...
}
```

### Using the `FocusCycler` class

{@link module:ui/focuscycler~FocusCycler} helps the user navigate the user interface using the keystrokes (arrow keys, <kbd>Tab</kbd>, <kbd>Return</kbd>, <kbd>Esc</kbd>, etc.). This helper class was created with components hosting multiple children in mind, for instance, lists, toolbars or forms. It *cycles* over their children so, for instance, if the last child is focused and the user wants to move forward, the focus is moved back to the first child. It also supports components that have a variable (dynamic) number of focusable children.

Each focus cycler instance works together with a [focus tracker](#using-the-focustracker-class) and a [keystroke handler](#using-the-keystrokehandler-class). The former delivers the current state of the focus, while the latter helps the cycler integrate with keystrokes, for instance, to focus the next item in the list on the down arrow key press.

Take a look at the example list class using focus cycler, keystroke handler and focus tracker instances together to enable the keyboard navigation. First, all the helpers must be created:

```js
import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

class MyListView extends View {
	constructor( locale ) {
		super( locale );

		// ...

		// The view collection containing items of the list.
		this.items = this.createCollection();

		// The instance of the focus tracker that tracks focus in #items.
		this.focusTracker = new FocusTracker();

		// The keystroke handler that will help the focus cycler respond to the keystrokes.
		this.keystrokes = new KeystrokeHandler();

		// The focus cycler that glues it all together.
		this.focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backward using the arrow up key.
				focusPrevious: 'arrowup',

				// Navigate toolbar items forward using the arrow down key.
				focusNext: 'arrowdown'
			}
		} );
	}

	// ...
}
```

Similarly to the previous sections of this guide, feed the focus tracker and synchronize it with the list items collection in the `render()` method. Since the {@link module:ui/view~View#element `MyListView#element`} has already been rendered at that stage, this is also the right moment to start listening to the keyboard events:

```js
// ...

class MyListView extends View {
	constructor( locale ) {
		// ...
	}

	render() {
		super.render();

		// ...

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		// Make sure items added to the collection are recognized by the #focusTracker.
		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		// Make sure items removed from the collection are ignored by the #focusTracker.
		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );

		// Start listening for the keystrokes coming from #element, which will allow
		// the #focusCycler to handle the keyboard navigation.
		this.keystrokes.listenTo( this.element );
	}

	focus() {
		if ( this.items.length ) {
			// This will call MyListItemView#focus().
			this.items.first.focus();
		}
	}

	destroy() {
		// Stop listening to all keystrokes when the view is destroyed.
		this.keystrokes.destroy();
	}

	// ...
}
```

### Using all focus helpers together

The complete code of a list class that hosts multiple item views and supports the keyboard navigation across them (when it gets focused) looks as follows:

```js
import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

class MyListView extends View {
	constructor( locale ) {
		super( locale );

		// The view collection containing items of the list.
		this.items = this.createCollection();

		// The instance of the focus tracker that tracks focus in #items.
		this.focusTracker = new FocusTracker();

		// The keystroke handler that will help the focus cycler respond to the keystrokes.
		this.keystrokes = new KeystrokeHandler();

		// The focus cycler that glues it all together.
		this.focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backward using the arrow up key.
				focusPrevious: 'arrowup',

				// Navigate toolbar items forward using the arrow down key.
				focusNext: 'arrowdown'
			}
		} );

		// ...

		this.setTemplate( {
				tag: 'ul',
				children: this.items
		} );
	}

	render() {
		super.render();

		// ...

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		// Make sure items added to the collection are recognized by the #focusTracker.
		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		// Make sure items removed from the collection are ignored by the #focusTracker.
		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );

		// Start listening for the keystrokes coming from #element, which will allow
		// the #focusCycler to handle the keyboard navigation.
		this.keystrokes.listenTo( this.element );
	}

	focus() {
		if ( this.items.length ) {
			// This will call MyListItemView#focus().
			this.items.first.focus();
		}
	}

	destroy() {
		// Stop listening to all keystrokes when the view is destroyed.
		this.keystrokes.destroy();
	}
}

class MyListItemView extends View {
	constructor( locale, text ) {
		super( locale );

		// ...

		this.setTemplate( {
			tag: 'li',
			attributes: {
				tabindex: -1
			},
			children: [ text ]
		} );
	}

	// ...

	focus() {
		this.element.focus();
	}
}
```

You can quickly run it in the context of an existing editor in the following way:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
	} )
	.then( editor => {
		const list = new MyListView( editor.locale );

		// Create two example children.
		const firstChild = new MyListItemView( editor.locale, 'First child' );
		const secondChild = new MyListItemView( editor.locale, 'Second child' );

		// Add children to the list.
		list.items.add( firstChild );
		list.items.add( secondChild );

		// Render the list and put it in the DOM.
		list.render();
		editor.ui.view.body.add( list );

		// Focus the list. This should focus the first child.
		// Use up and down keyboard arrows to cycle across the list items.
		list.focus();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Now you can use the keyboard arrows to cycle the focused list items:

{@img assets/img/framework-deep-dive-focus-focus-cycling.gif 950 The animation showing the focus cycling across the list items.}

## Focus state analysis

This section contains an analysis of a common focus navigation scenario in an {@link examples/builds/inline-editor inline editor}. While the [previous section](#focus-in-the-editor-ui) was focused on tools that make up the focus management system, this time we will focus on their state. This should help you better understand how all little pieces work in a bigger picture.

### Scenario

Take a look at the following scenario where both mouse and keyboard are used to navigate the interface of the editor:

{@img assets/img/framework-deep-dive-focus-inline-scenario.gif 758 The animation showing the focus navigation across the inline editor UI.}

And here are the steps of the scenario:

1. The editor is not focused (the focus is somewhere else on the web page).
2. The {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView editable area} gets focused using the mouse. The main toolbar shows up and because the link was clicked, the {@link module:link/ui/linkactionsview~LinkActionsView link actions view} also pops up.
3. The <kbd>Tab</kbd> key is used to focus the {@link module:link/ui/linkactionsview~LinkActionsView#previewButtonView link preview} in the balloon (a child of {@link module:link/ui/linkactionsview~LinkActionsView}).
4. The <kbd>Tab</kbd> key is used to focus the {@link module:link/ui/linkactionsview~LinkActionsView#editButtonView "Edit link" button}.
5. The <kbd>Space</kbd> key is used to execute the "Edit link" button. The focus moves to the {@link module:link/ui/linkformview~LinkFormView#urlInputView input} in the {@link module:link/ui/linkformview~LinkFormView}.
6. The <kbd>Tab</kbd> key is used to move from the link URL field to the {@link module:link/ui/linkformview~LinkFormView#saveButtonView "Save" button}.
7. The <kbd>Tab</kbd> key is used to move from the "Save" button to the {@link module:link/ui/linkformview~LinkFormView#cancelButtonView "Cancel" button}.
8. The <kbd>Space</kbd> key is used to execute the "Cancel" button and close the editing form.
9. The <kbd>Esc</kbd> key is used to close the link balloon and go back to the editable.

There are 3 focus tracker instances at play in the scenario:

1. The {@link module:core/editor/editorui~EditorUI#focusTracker `EditorUI#focusTracker`} (the ["global" focus tracker](#a-note-about-the-global-focus-tracker)),
2. The {@link module:link/ui/linkactionsview~LinkActionsView#focusTracker `LinkActionsView#focusTracker`},
3. The {@link module:link/ui/linkformview~LinkFormView#focusTracker `LinkFormView#focusTracker`}.

Let's see how they react to the user actions (states were recorded **after** each step):

<table>
	<thead>
		<tr>
			<th rowspan="2">Step</th>
			<th colspan="2">{@link module:core/editor/editorui~EditorUI#focusTracker  `EditorUI#focusTracker`}</th>
			<th colspan="2">{@link module:link/ui/linkactionsview~LinkActionsView#focusTracker  `LinkActionsView#focusTracker`}</th>
			<th colspan="2">{@link module:link/ui/linkformview~LinkFormView#focusTracker `LinkFormView#focusTracker`}</th>
		</tr>
		<tr>
			<th><code>isFocused</code></th>
			<th><code>focusedElement</code></th>
			<th><code>isFocused</code></th>
			<th><code>focusedElement</code></th>
			<th><code>isFocused</code></th>
			<th><code>focusedElement</code></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>1</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>❌</td>
			<td> <code>null</code></td>
		</tr>
		<tr>
			<td>2</td>
			<td>✅</td>
			<td>editable</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>❌</td>
			<td> <code>null</code></td>
		</tr>
		<tr>
			<td>3</td>
			<td>✅</td>
			<td>balloon panel</td>
			<td rowspan="2">
				<p>✅</p>
				<p>✅</p>
			</td>
			<td>URL preview</td>
			<td>❌</td>
			<td><code>null</code></td>
		</tr>
		<tr>
			<td>4</td>
			<td>✅</td>
			<td>balloon panel</td>
			<td>"Edit link" button</td>
			<td>❌</td>
			<td><code>null</code></td>
		</tr>
		<tr>
			<td>5</td>
			<td>✅</td>
			<td>balloon panel</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>✅</td>
			<td>URL input</td>
		</tr>
		<tr>
			<td>6</td>
			<td>✅</td>
			<td>balloon panel</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>✅</td>
			<td>"Save" button</td>
		</tr>
		<tr>
			<td>7</td>
			<td>✅</td>
			<td>balloon panel</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>✅</td>
			<td>"Cancel" button</td>
		</tr>
		<tr>
			<td>8</td>
			<td>✅</td>
			<td>editable</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>❌</td>
			<td><code>null</code></td>
		</tr>
		<tr>
			<td>9</td>
			<td>✅</td>
			<td>editable</td>
			<td>❌</td>
			<td><code>null</code></td>
			<td>❌</td>
			<td><code>null</code></td>
		</tr>
	</tbody>
</table>

### Conclusions

* The [global focus tracker](#a-note-about-the-global-focus-tracker) (the one you can access via `editor.ui.focusTracker`) is always aware of the focus state, even when the focus is in the farthest regions of the UI.
	* It does not know which element is focused on deeper layers (for instance the "Edit link" button), though. All it knows is where the focus went (e.g. from the editable to the balloon panel).
	* It lacks precise information about the focus in the link UI because this is the responsibility of the focus tracker of the link UI layer.
	* All editor features **can always depend on the global focus tracker** when necessary. For instance, the main editor toolbar is displayed as long as the global focus tracker knows the focus is somewhere in the editor.
* You can see that the focus management is modular: `LinkActionsView` and `LinkFormView` only know about the focus as long as one of their children has it.
* Focus trackers belonging to `LinkActionsView` and `LinkFormView` know precisely which element has focus. This is their region of interest and, unlike the global focus tracker of the editor, they need that information to allow navigation using the keyboard.

<style>
.focus-tracking table {
	text-align: center;
}

.focus-tracking table thead th code {
	white-space: nowrap;
}
</style>
