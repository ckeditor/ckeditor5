---
category: framework-ui
order: 30
---

# Dropdowns

## Creating Toolbar dropdown with SplitButton

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import addToolbarToDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/addtoolbartodropdown';
import closeDropdownOnBlur from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/closedropdownonblur';
import closeDropdownOnExecute from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/closedropdownonexecute';
import createDropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/createdropdownview';
import createSplitButtonForDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/createsplitbuttonfordropdown';
import enableModelIfOneIsEnabled from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/enablemodelifoneisenabled';
import focusDropdownContentsOnArrows from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/focusdropdowncontentsonarrows';

const model = new Model( {
	icon: 'some SVG',
	tooltip: 'My dropdown'
} );

buttons.push( new ButtonView() );
buttons.push( componentFactory.create( 'someExistingButton' ) );

model.set( 'buttons', buttons );

const splitButtonView = createSplitButtonForDropdown( model, locale );
const dropdownView = createDropdownView( model, splitButtonView, locale );

// Customize dropdown

// This will enable toolbar button when any of button in dropdown is enabled.
enableModelIfOneIsEnabled( model, buttons );

// Make this a dropdown with toolbar inside dropdown panel.
addToolbarToDropdown( dropdownView, model );

// Add default behavior of dropdown
closeDropdownOnBlur( dropdownView );
closeDropdownOnExecute( dropdownView );
focusDropdownContentsOnArrows( dropdownView );

// Execute current action from dropdown's split button action button.
dropdownView.buttonView.on( 'execute', () => {
	editor.execute( 'command', { value: model.commandValue } );
	editor.editing.view.focus();
} );
```

## Creating ListView dropdown with standard button

```js
import Model from '@ckeditor/ckeditor5-ui/src/model';

import addListViewToDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/addlistviewtodropdown';
import closeDropdownOnBlur from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/closedropdownonblur';
import closeDropdownOnExecute from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/closedropdownonexecute';
import createDropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/createdropdownview';
import createButtonForDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/createbuttonfordropdown';
import focusDropdownContentsOnArrows from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/focusdropdowncontentsonarrows';

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

// Create dropdown model.
const model = new Model( {
	icon: 'some icon SVG',
	items
} );

const buttonView = createButtonForDropdown( model, locale );
const dropdownView = createDropdownView( model, buttonView, locale );

// Customize dropdown

// This will enable toolbar button when any of button in dropdown is enabled.

addListViewToDropdown( dropdownView, model, locale );

// Add default behavior of dropdown
closeDropdownOnBlur( dropdownView );
closeDropdownOnExecute( dropdownView );
focusDropdownContentsOnArrows( dropdownView );

// Execute command when an item from the dropdown is selected.
this.listenTo( dropdownView, 'execute', evt => {
	editor.execute( evt.source.commandName );
	editor.editing.view.focus();
} );
```
