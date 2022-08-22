---
category: framework-architecture
order: 46
---

# UI components

All UI classes come with `set()` method, which sets the properties of the components, such as labels, icons, placeholders, etc.

### Buttons

There are two basic buttons in CKEditor 5 UI library - a button and a switch button.

{@snippet framework/ui/ui-buttons}

Button is implemented with the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class.

```js
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

const button = new ButtonView();
button.set( {
	label: 'A button',
	withText: true
} );

button.render();

document.getElementById( 'ui-button' ).appendChild( button.element );
```
Switch button is implemented with the {@link module:ui/button/switchbuttonview~SwitchButtonView `SwitchButtonView`} class.

```js
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

const switchButton = new SwitchButtonView();
switchButton.set( {
	label: 'A switch button',
	withText: true
} );

switchButton.render();

document.getElementById( 'ui-switchButton' ).append( switchButton.element );
```

### Button options

{@snippet framework/ui/ui-buttons-options}

Action button is implemented by adding the `ck-button-action` class.

```js
button.class = 'ck-button-action';
```
### Icons and keystrokes

{@snippet framework/ui/ui-buttons-icons}

### Tooltips

{@snippet framework/ui/ui-buttons-tooltip}

## Dropdowns

{@snippet framework/ui/ui-dropdowns}

## Input

{@snippet framework/ui/ui-input}

### Input options

{@snippet framework/ui/ui-input-options}

## Toolbars

{@snippet framework/ui/ui-toolbar}

### Toolbar options

{@snippet framework/ui/ui-toolbars-options}


## Balloon panel

{@snippet framework/ui/ui-balloon}

