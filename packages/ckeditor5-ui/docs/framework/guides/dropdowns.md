---
category: framework-ui
order: 30
---

# Dropdowns

## Creating Toolbar dropdown with SplitButton

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import bindOneToMany from '@ckeditor/ckeditor5-ui/src/bindings/bindonetomany';
import { addToolbarToDropdown, createSplitButtonDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

buttons.push( new ButtonView() );
buttons.push( componentFactory.create( 'someExistingButton' ) );

const dropdownView = createSplitButtonDropdown( locale );

dropdownView.set( {
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
dropdownView.on( 'execute', () => {
	editor.execute( 'command', { value: model.commandValue } );
	editor.editing.view.focus();
} );
```

## Creating ListView dropdown with standard button

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
