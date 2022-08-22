/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ButtonView, SwitchButtonView, createDropdown, addToolbarToDropdown,
addListToDropdown, checkIcon, Collection, Model, Locale */
const locale = new Locale();

const buttons = [];

const toolbarButton = new ButtonView();
toolbarButton.set( {
	label: 'A button',
	withText: true
} );
const toolbarSwitchButton = new SwitchButtonView();
toolbarSwitchButton.set( {
	label: 'A switch button ',
	withText: true
} );
const toolbarIconButton = new ButtonView();
toolbarIconButton.set( {
	label: 'An icon button',
	icon: checkIcon,
	tooltip: true
} );
buttons.push( toolbarButton, toolbarSwitchButton, toolbarIconButton );

const dropdown = createDropdown( locale );

dropdown.buttonView.set( {
	label: 'Open toolbar',
	withText: true
} );

addToolbarToDropdown( dropdown, buttons );

dropdown.render();
document.getElementById( 'ui-dropdown-toolbar' ).appendChild( dropdown.element );

toolbarSwitchButton.on( 'execute', () => {
	toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
} );

// --- Dropdown list ------------------------------------------------------------

const items = new Collection();

items.add( {
	type: 'button',
	model: new Model( {
		withText: true,
		label: 'First item',
		labelStyle: 'color: red'
	} )
} );

items.add( {
	type: 'button',
	model: new Model( {
		withText: true,
		label: 'Second item',
		labelStyle: 'color: green',
		class: 'foo'
	} )
} );

const dropdownList = createDropdown( locale );

dropdownList.buttonView.set( {
	label: 'A dropdown',
	withText: true
} );
addListToDropdown( dropdownList, items );

dropdownList.render();
document.getElementById( 'ui-dropdown-list' ).appendChild( dropdownList.element );
