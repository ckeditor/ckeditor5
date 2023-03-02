---
category: abbreviation-plugin
menu-title: Getting user input with a custom UI
order: 25
modified_at: 2022-07-15
---

# Getting user input with a custom UI

In this part of the tutorial we will focus on creating a dialog box, which will get the user's input.

We will pick up where we left off in the first part, so make sure you {@link framework/abbreviation-plugin-tutorial/abbreviation-plugin-level-1 start there}, or grab our [starter files for this part](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/abbreviation-plugin/part-1).

<info-box>
	As we will mostly work on the UI, we recommend reading about our {@link framework/architecture/ui-library UI library} before you start coding.
</info-box>

If you want to see the final product of this tutorial before you plunge in, check out the [live demo](#demo).

## Creating a view

The most important part of the UI for this plugin is a dialog box with a form, which will get us the user's input.

### Creating a form view template

Let's start by creating a view with a form. It will include two input fields (for the abbreviation and the title), and the `submit` and `cancel` buttons. We will do it in a separate view. First, we create a new file `abbreviationview.js` in the `abbreviation/` directory.

Our new `FormView` class will extend the {@link framework/architecture/ui-library#views View} class, so let's start by importing it from the UI library.

In the `FormView` constructor we define a template for our abbreviation form. We need to set the tag of the HTML element, and a couple of its attributes. To make sure our view is focusable, let's add {@link framework/deep-dive/focus-tracking#implementing-focusable-ui-components `tabindex="-1"`}.

```js
// abbreviation/abbreviationview.js

import View from '@ckeditor/ckeditor5-ui';

export default class FormView extends View {
	constructor( locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-abbr-form' ],
				tabindex: '-1'
			}
		} );
	}

}
```

Notice that we added two classes. All UI elements of the editor need to have the `ck` class (unless you want to create your own UI and not use CKEditor 5's built-in library). We also created a new class for our form, which we will use later on to style it.

### Creating input fields

As we have two similar input fields to create and we don't want to repeat ourselves, let's define a method `_createInput()`, which will produce them for us. It will accept the label of our input field.

We will use {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView `LabeledFieldView`} class and we will pass it the {@link module:ui/labeledfield/utils~createLabeledInputText `createLabeledInputText()`} function as the second argument. It is a helper coming from the CKEditor UI library that will take care of creating the input.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,				// ADDED
	createLabeledInputText			// ADDED
	} from '@ckeditor/ckeditor5-ui';

export default class FormView extends View {
	constructor( locale ) {

		this.abbrInputView = this._createInput( 'Add abbreviation' );
		this.titleInputView = this._createInput( 'Add title' );
		
		// Previously set template.
		// ...
	}

	_createInput( label ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}
}
```

### Creating form buttons

Now, we add the `submit` and `cancel` buttons to our form. You can start by importing `ButtonView` from our UI library together with the icons, which we will use for labels.

We will use the `check` and `cancel` icons from the core package's [icons library](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/theme/icons). After importing the icons, we will use them for creating the buttons.

Let's write a `_createButton` function, which will take three arguments &ndash; `label`, `icon` and `className`. We then set the button attributes, using the properties we passed into the function before, and adding a tooltip option.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView										// ADDED
	} from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';	// ADDED

export default class FormView extends View {
	constructor( locale ) {
		// Previously created inputs.
		// ...

		// Create the save and cancel buttons.
		this.saveButtonView = this._createButton(
			'Save', icons.check, 'ck-button-save'
		);
		// Set the type to 'submit', which will trigger
		// the submit event on entire form when clicked.
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton(
			'Cancel', icons.cancel, 'ck-button-cancel'
		);

		// Previously set template.
		// ...
	}

	_createInput( label ) {
		// Input initialization.
		// ...
	}

	_createButton( label, icon, className ) {
		const button = new ButtonView();

		button.set( {
			label,
			icon,
			tooltip: true,
			class: className
		} );

		return button;
	}
}
```

When the user clicks one of these buttons, we want to either submit or cancel the form view. These events should be fired off from the form view, so we need to delegate them from the buttons to the form view.

<info-box>
	Event delegation allows selected events of one emitter to be fired off by another emitter. Read about it in our {@link framework/architecture/core-editor-architecture#event-system-and-observables introduction to the event system} and more on {@link framework/deep-dive/event-system#delegating-events delegating events}.
</info-box>

For now, we delegate `cancelButtonView#execute` to the FormView, so pressing the `cancel` button will fire off `FormView#cancel`. We will handle delegating the submit event in a couple of steps.

```js
// abbreviation/abbreviationview.js

// Previously imported packages.
// ...

export default class FormView extends View {
	constructor( locale ) {
		// Previously created inputs.
		// ...

		this.saveButtonView = this._createButton(
			'Save', icons.check, 'ck-button-save'
		);
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton(
			'Cancel', icons.cancel, 'ck-button-cancel'
		);
		// Delegate ButtonView#execute to FormView#cancel.
		this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		// Previously set template.
		// ...
	}

	_createInput( label ) {
		// Input initialization.
		// ...
	}

	_createButton( label, icon, className ) {
		// Button initialization.
		// ...
	}
}
```
### Adding styles

We use `styles.css` to style the new UI elements. Let's add some padding to our form and use the [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/grid) to nicely display all four elements of the form.

We will use our set spacing variables to keep things uniform.

```css
/* style.css */

.ck.ck-abbr-form {
	padding: var(--ck-spacing-large);
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat(3, 1fr);
	grid-column-gap: 0px;
	grid-row-gap: var(--ck-spacing-standard);
}

.ck.ck-abbr-form .ck.ck-labeled-field-view:nth-of-type(1) {
	grid-area: 1 / 1 / 2 / 3;
}

.ck.ck-abbr-form .ck.ck-labeled-field-view:nth-of-type(2) {
	grid-area: 2 / 1 / 3 / 3;
}

.ck.ck-abbr-form .ck-button:nth-of-type(1) {
	grid-area: 3 / 1 / 4 / 2;
}

.ck.ck-abbr-form .ck-button:nth-of-type(2) {
	grid-area: 3 / 2 / 4 / 3;
}

```
Import it into `AbbreviationUI`:

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import './styles.css';											// ADDED

export default class AbbreviationUI extends Plugin {
	// Definition of Abbreviation UI class.
	// ...
}
```

### Wrapping up the form view

We are almost done with the form view, we just need to add a couple of finishing touches.

In the `constructor`, we create a {@link module:ui/viewcollection~ViewCollection} with the `createCollection()` method. We put all our input and button views in the collection, and use it to update the `FormView` template with its newly created children.

Let's also add `render()` method to our `FormView`.  We will use a helper `submitHandler()` function there, which intercepts a native DOM submit event, prevents the default web browser behavior (navigation and page reload) and fires the `submit` event on a view instead.

We also need a `focus()` method, which will focus on the first child of our `abbreviation` input view each time the form is added to the editor. This is just a taste of what {@link framework/deep-dive/focus-tracking focus tracking} can do in CKEditor 5. We will get into it more in next part of this tutorial.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler									// ADDED
	} from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {
		// Previously created elements.
		// ...

		this.childViews = this.createCollection( [
			this.abbrInputView,
			this.titleInputView,
			this.saveButtonView,
			this.cancelButtonView
		] );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				// Attributes of a form template.
				// ...
			},
			children: this.childViews				// ADDED
		} );
	}

	render() {
		super.render();

		// Submit the form when the user clicked the save button
		// or pressed enter in the input.
		submitHandler( {
			view: this
		} );
	}

	focus() {
		this.childViews.first.focus();
	}

	_createInput( label ) {
		// Input initialization.
		// ...
	}

	_createButton( label, icon, className ) {
		// Button initialization.
		// ...
	}
}
```

Our `FormView` is done! However, we cannot see it just yet, so let's add it to our `AbbreviationUI` class.

## Adding the Contextual Balloon

Our form needs to appear in a balloon, and we will use the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon `ContextualBalloon`} class from the CKEditor 5 UI library to make one.

This is where we ended up with our UI in the first part of the tutorial.

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'abbreviation', () => {
			const button = new ButtonView();

			button.label = 'Abbreviation';
			button.tooltip = true;
			button.withText = true;

			this.listenTo( button, 'execute', () => {
				const title = 'What You See Is What You Get';
				const abbr = 'WYSIWYG';

				editor.model.change( writer => {
					editor.model.insertContent(
						writer.createText( abbr ),
						{ 'abbreviation': title }
					);

				} );
			} );

			return button;
		} );
	}
}
```

We will need to change it quite a bit and add `ContextualBalloon` and `FormView`. We need to make sure Contextual Balloon is required when making an instance of our `AbbreviationUI`, so we will start with that.

Let's write a basic `_createFormView()` function, just to create an instance of our `FormView` class (we will expand it later).

We also need to create a function, which will give us the target position for our balloon from user's selection. We need to convert the selected view range into DOM range. We can use the `viewRangeToDom()` method to do so.

Finally, we add our balloon and the form view to the `init()` method.

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui';				// ADDED
import FormView from './abbreviationview';							// ADDED

export default class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		const editor = this.editor;

		// Create the balloon and the form view.
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();

		editor.ui.componentFactory.add( 'abbreviation', () => {
			// A component factory callback that creates a button.
			// ...
		} );
	}

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		return formView;
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		// Set a target position by converting view selection range to DOM.
		target = () => view.domConverter.viewRangeToDom(
			viewDocument.selection.getFirstRange()
		);

		return {
			target
		};
	}
}
```

We can now change what happens when the user clicks the toolbar button. We will replace inserting the hard-coded abbreviation with one defined by the user.

Let's write a `_showUI()` method which will show our UI elements by adding the form view to our balloon and setting its position. The last thing is to focus the form view, so the user can immediately start typing in the first input field.

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

export default class AbbreviationUI extends Plugin {
	// More methods.
	// ...

	init() {
		// The balloon and the view initialization.
		// ...

		editor.ui.componentFactory.add( 'abbreviation', () => {
			// Button initialization.
			// ...

			// Show the UI on button click.
			this.listenTo( button, 'execute', () => {
				this._showUI();
			} );

			return button;
		} );
	}

	_createFormView() {
		// The form view initialization.
		// ...
	}

	_getBalloonPositionData() {
		// Getting position data for the balloon.
		// ...
	}

	_showUI() {
		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		this.formView.focus();
	}
}
```

You should be able to see your balloon and form now! Check and see your balloon pop up (we will get to hiding it soon). It should look like this:

{@img assets/img/abbreviation-part2.png Screenshot of the balloon with the form view.}

## Getting user input

Now is the time to replace the hard-coded "WYSIWYG" abbreviation with the user input. We will be getting values from the form and listening to the `submit` event on the form view, which we delegated from the save button (with the help of `submitHandler`).

We use the same callback function we had in the toolbar button in the first part of the tutorial. We just need to replace the "WYSIWYG" abbreviation with values from our input views.

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

export default class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		// The balloon and the view initialization.
		// ...
	}

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		this.listenTo( formView, 'submit', () => {
			const title = formView.titleInputView.fieldView.element.value;
			const abbr = formView.abbrInputView.fieldView.element.value;

			editor.model.change( writer => {
				editor.model.insertContent(
					writer.createText( abbr, { abbreviation: title } )
				);
			} );

		} );

		return formView;
	}

	_getBalloonPositionData() {
		// Getting position data for the balloon.
		// ...
	}

	_showUI() {
		// Displaying balloon for the user.
		// ...
	}
}
```

Our plugin is finally doing what it is supposed to. The last thing is to hide it from our editor when we do not need it.

## Hiding the form view

We will need to hide the form view in these three situations:
* after the user submits the form;
* when the user clicks the "Cancel" button;
* when the user clicks outside of the balloon.

We will write a simple `_hideUI()` function, which will clear the input field values and remove the view from our balloon.

Additionally, we will import the `clickOutsideHandler()` method, which will take our `_hideUI()` function as a callback. It will be emitted from our form view, and activated when the form view is visible. We also need to set `contextElements` for the handler to determine its scope. Clicking on HTML elements listed there will not fire the callback.

```js
// abbreviation/abbreviationui.js

// Previously imported packages.
// ...

import { ContextualBalloon, clickOutsideHandler } from '@ckeditor/ckeditor5-ui'; // ADDED

export default class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		// The balloon and the view initialization.
		// ...
	}

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		this.listenTo( formView, 'submit', () => {
			// Setting texts: title and abbreviation.
			// ...

			// Hide the form view after submit.
			this._hideUI();
		} );

		// Hide the form view after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideUI();
		} );

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );

		return formView;
	}

	_hideUI() {
		this.formView.abbrInputView.fieldView.value = '';
		this.formView.titleInputView.fieldView.value = '';
		this.formView.element.reset();

		this._balloon.remove( this.formView );

		// Focus the editing view after closing the form view.
		this.editor.editing.view.focus();
	}

	_getBalloonPositionData() {
		// Getting position data for the balloon.
		// ...
	}

	_showUI() {
		// Displaying balloon for the user.
		// ...
	}
}
```

## Demo

{@snippet framework/abbreviation-level-2}

## Final code

If you got lost at any point, this is [the final implementation of the plugin](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/abbreviation-plugin/part-2). You can paste the code from different files into your project, or clone and install the whole thing, and it will run out-of-the-box.

<info-box>
	**What's next?**

	That's it for the second part of the tutorial! We have a working UI, and our plugin does what we want it to do. We can improve it according to our best practices, adding a {@link framework/architecture/core-editor-architecture#commands command}, focus tracking, and more. We will do it in the {@link framework/abbreviation-plugin-tutorial/abbreviation-plugin-level-3 third part of the tutorial}, so head over there.
</info-box>
