---
category: abbreviation-plugin
order: 25
---

# Abbreviation plugin tutorial - part 2

In this part of the tutorial we will focus on creating a dialog box, which will get user's input.

We will pick up where we left off in the first part, so make sure you {@link tutorials/abbreviation-plugin-tutorial/abbreviation-plugin-level-1 start there}, or grab our starter files for this part.

<info-box>
As we will mostly work on the UI, we recommend reading up on our {@link framework/architecture/ui-library UI library} before you start coding.
</info-box>

If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).

## Creating a view

The most important part of the UI for this plugin is a dialog box with a form, which will get us user's input.

### Creating a form view template

Let's start by creating a view with a form. It will include two input fields (for the abbreviation and the title), and the 'submit' and 'cancel' buttons. We will do it in a separate view. Create a new file `abbreviationview.js` in the `abbreviation/` directory.

Our new `FormView` class will extend the {@link framework/architecture/ui-library#views View} class, so start by importing it from the UI library.

In the `FormView` constructor we will define a template for our abbreviation form. We need to set a tag of the HTML element, and a couple of its attributes. To make sure our view is focusable, let's add {@link framework/deep-dive/focus-tracking#implementing-focusable-ui-components `tabindex="-1"`}.

We will also pass the editor's {@link module:utils/locale~Locale} instance to the constructor, so we can localize all our UI components with the help of the {@link module:utils/locale~Locale#t `t()` function}.

```js
// abbreviation/abbreviationview.js

import { View } from '@ckeditor/ckeditor5-ui';

export default class FormView extends View {
	constructor( locale ) {
		super( locale );
		const t = locale.t;

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
Notice that we added two classes. All UI elements of the editor need to have the `ck` class (unless you want to create your own UI and not use our library). We also created a new class for our form, which we will use later on to style it.

### Creating input fields

As we have two similar input fields to create and we don't want to repeat ourselves, let's define a method `_createInput()`, which will produce them for us. It will accept the label of our input field.

We will use {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView `LabeledFieldView`} class, and we will pass it the `createLabeledInputText()` function as the second argument.

```js
// abbreviation/abbreviationview.js

import {
    View,
    LabeledFieldView,               // ADDED
    createLabeledInputText          // ADDED
    } from '@ckeditor/ckeditor5-ui';

export default class FormView extends View {
	constructor( locale ) {
        // ...

        this.abbrInputView = this._createInput( t( 'Add abbreviation' ) );
		this.titleInputView = this._createInput( t( 'Add title' ) );
	}

    _createInput( label ) {
        const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

        labeledInput.label = label;

        return labeledInput;
    }
}
```

### Creating form buttons

Now, we can add a `submit` and a `cancel` buttons to our form. You can start by importing `ButtonView` from our UI library and icons, which we will use for labels.

Let's write a `_createButton` function, which will take three arguments - `label`, `icon` and `className`.

We will then set the button attributes, using the properties we passed into the function, and adding a tooltip option.

Last thing is to delegate `cancelButtonView#execute` to the FormView, so pressing it will fire off `FormView#cancel`.

```js
// abbreviation/abbreviationview.js

import {
    View,
    LabeledFieldView,
    createLabeledInputText,
    ButtonView                                      // ADDED
} from '@ckeditor/ckeditor5-ui';
import {
    IconCheck,
		IconCancel
} from '@ckeditor/ckeditor5-icons';					 // ADDED

export default class FormView extends View {
	constructor( locale ) {
        // ...

        // Create the save and cancel buttons.
        this.saveButtonView = this._createButton(
            t( 'Save' ), IconCheck, 'ck-button-save'
        );
		// Set the type to 'submit', which will trigger
		// the submit event on entire form when clicked.
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton(
            t( 'Cancel' ), IconCancel, 'ck-button-cancel'
        );
		// Delegate ButtonView#execute to FormView#cancel.
		this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

	}

    _createInput( label ) {
        // ...
    }

    _createButton( label, icon, className ) {
		const button = new ButtonView( this.locale );

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
### Adding styles

You can now open `styles.css` and style the new UI elements.

Let's add some padding to our form, and a margin at the bottom of our input fields. We can 'grab' them using `ck-labeled-field-view` class. We will use our set spacing variables to keep things uniform.

We will use the [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/grid) to nicely display our four elements of the form.

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

import { Plugin } from 'ckeditor5';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import './styles.css';													// ADDED

class AbbreviationUI extends Plugin {
	// ...
}
```
### Wrapping up the form view

We're almost done with our form view, we just need to add a couple of finishing touches.

In the `constructor`, create a {@link module:ui/viewcollection~ViewCollection} with {@link module:ui/view~View#createCollection `createCollection()`} method. We will put all our input and button views in the collection, and use it to update the `FormView` template with its newly created children.

Let's also add `render()` method to our `FormView`.  We will use there a helper {@link module:ui/bindings/submithandler~submitHandler `submitHandler()`} function, which intercepts a native DOM submit event, prevents the default web browser behavior (navigation and page reload) and fires the submit event on a view instead.

We also need a `focus()` method, which will focus on the first child, so our `abbreviation` input view each time the form is added to the editor. This is just a taste of what {@link framework/deep-dive/focus-tracking focus tracking} can do in CKEditor&nbsp;5, we will go into it more in next part of this tutorial.

```js
// abbreviation/abbreviationview.js

import {
    View,
    LabeledFieldView,
    createLabeledInputText,
    ButtonView,
    submitHandler                                   // ADDED
    } from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {

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
                // ...
			},
			children: this.childViews               // ADDED
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
        // ...
    }

    _createButton( label, icon, className ) {
        // ...
    }
}
```

Our `FormView` is done! We can't see it just yet, so let's add it to our `AbbreviationUI` class.

## Adding the Contextual Balloon

Our form needs to appear in a balloon, and we will use the `ContextualBalloon` class from the CKEditor&nbsp;5 UI library to make one.

This is where we ended up with our UI in the first part of the tutorial.

```js
// abbreviation/abbreviationui.js

import { Plugin } from 'ckeditor5';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;
		const { t } = editor.locale;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

			button.label = t( 'Abbreviation' );
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
We will need to change it quite a bit and add our `ContextualBalloon` and `FormView`. We will need to make sure Contextual Balloon is required when making an instance of our `AbbreviationUI`, so let's start with that.

Let's write a basic `_createFormView()` function, just to create an instance of our `FormView` class (we will expand it later).

We also need to create a function, which will give us the target position for our balloon from user's selection. We need to convert selected view range into DOM range. We can use {@link module:engine/view/domconverter~DomConverter#viewRangeToDom `viewRangeToDom()` method} to do so.

Finally, let's add our balloon and form view to the `init()` method.

```js
// abbreviation/abbreviationui.js

import { Plugin } from 'ckeditor5';
import { ButtonView, ContextualBalloon } from '@ckeditor/ckeditor5-ui'; // ADDED
import FormView from './abbreviationview';                          	// ADDED

class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
        const editor = this.editor;
		const { t } = editor.locale;

        // Create the balloon and the form view.
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();

		editor.ui.componentFactory.add( 'abbreviation', locale => {
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

        // Set a target position by converting view selection range to DOM
		target = () => view.domConverter.viewRangeToDom(
			viewDocument.selection.getFirstRange()
		);

		return {
			target
		};
	}
}
```
We can now change what happens when we the user pushes the toolbar button. We will replace inserting the hard-coded abbreviation.

Let's write a function which will show our UI elements, adding the form view to our balloon and setting its position. Last thing is to focus the form view, so the user can immediately start typing in the first input field.

```js
// abbreviation/abbreviationui.js
// ...

class AbbreviationUI extends Plugin {
	// ...

	init() {
		// ...

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			this._showUI();
		} );
	}

	_createFormView() {
		// ...
	}

	_getBalloonPositionData() {
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

You should be able to see your balloon and form now! Check and see your balloon pop up (we will get to hiding it in a couple of steps). It should look like this:
SCREENSHOT

## Getting user input

It's time to get the user input for the abbreviation and the title. We will use the same callback function we had in the toolbar button in the first part of the tutorial. We just need to replace the hard-coded "WYSIWYG" abbreviation with values from our input views.

```js
// abbreviation/abbreviationui.js
// ...

class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
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
        // ...
	}

	_showUI() {
		// ...
	}
}
```
Our plugin is finally doing what it's supposed to. The last thing is to hide it from our editor when we don't need it.

## Hiding the form view

We will need to hide the form view on three occasions:
* after the user submits the form;
* when the user clicks the "Cancel" button; and
* when the user clicks outside of the balloon.

So, let's write a simple `_hideUI()` function, which will clear the input field values and remove the view from our balloon.

Additionally, we will import {@link module:ui/bindings/clickoutsidehandler~clickOutsideHandler `clickOutsideHandler()`} method, which take our `_hideUI()` function as a callback. It will be emitted from our form view, and activated when the form view is visible. We also need to set `contextElements` for the handler to determine its scope. Clicking on listed there HTML elements will not fire the callback.

```js
// abbreviation/abbreviationui.js

// ...
import { ContextualBalloon, clickOutsideHandler } from '@ckeditor/ckeditor5-ui'; // ADDED

class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
        // ...
	}

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

        this.listenTo( formView, 'submit', () => {
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
        // ...
	}

	_showUI() {
	// ...
	}
}
```
That's it for this part of the tutorial! We have a working UI, and our plugin does what we want it to do. We can improve it according to our best practices, adding {@link framework/architecture/core-editor-architecture#commands a command}, focus tracking, and more. We will do it in {@link tutorials/abbreviation-plugin-tutorial/abbreviation-plugin-level-3 the third part of the tutorial}, so head there.

## Demo

{@snippet framework/abbreviation-level-2}

## Final code

If you got lost at any point, this is the final implementation of the plugin.

