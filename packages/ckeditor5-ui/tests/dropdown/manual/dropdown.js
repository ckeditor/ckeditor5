/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, console */

import Model from '../../../src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import testUtils from '../../_utils/utils';

import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import alignCenterIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import ButtonView from '../../../src/button/buttonview';
import SplitButtonView from '../../../src/dropdown/button/splitbuttonview';

import { createDropdown, addToolbarToDropdown, addListToDropdown } from '../../../src/dropdown/utils';

const ui = testUtils.createTestUIView( {
	dropdown: '#dropdown',
	listDropdown: '#list-dropdown',
	dropdownLabel: '#dropdown-label',
	toolbarDropdown: '#dropdown-toolbar',
	splitButton: '#dropdown-splitbutton'
} );

function testEmpty() {
	const dropdownView = createDropdown( {} );

	dropdownView.buttonView.set( {
		label: 'Dropdown',
		isEnabled: true,
		isOn: false,
		withText: true
	} );

	ui.dropdown.add( dropdownView );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';
}

function testList() {
	const collection = new Collection( { idProperty: 'label' } );

	[ '0.8em', '1em', '1.2em', '1.5em', '2.0em', '3.0em' ].forEach( font => {
		collection.add( {
			type: 'button',
			model: new Model( {
				label: font,
				labelStyle: `font-size: ${ font }`,
				withText: true
			} )
		} );
	} );

	const dropdownView = createDropdown( {} );

	dropdownView.buttonView.set( {
		label: 'ListDropdown',
		isEnabled: true,
		isOn: false,
		withText: true
	} );

	addListToDropdown( dropdownView, collection );

	dropdownView.on( 'execute', evt => {
		console.log( 'List#execute:', evt.source.label );
	} );

	ui.listDropdown.add( dropdownView );

	window.listDropdownCollection = collection;
	window.Model = Model;
}

function testLongLabel() {
	const dropdownView = createDropdown( {} );

	dropdownView.buttonView.set( {
		label: 'Dropdown with a very long label',
		isEnabled: true,
		isOn: false,
		withText: true
	} );

	ui.dropdownLabel.add( dropdownView );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';
}

function testToolbar() {
	const locale = { t: langString => langString };

	const icons = { left: alignLeftIcon, right: alignRightIcon, center: alignCenterIcon };

	// Buttons to be obtained from factory later on.
	const buttons = Object.keys( icons ).map( icon => new Model( { label: icon, isEnabled: true, isOn: false, icon: icons[ icon ] } ) );

	const buttonViews = buttons
		.map( buttonModel => {
			const buttonView = new ButtonView( locale );

			buttonView.bind( 'isEnabled', 'isOn', 'icon', 'label' ).to( buttonModel );

			buttonView.on( 'execute', () => console.log( `Execute: ${ buttonModel.label }` ) );

			return buttonView;
		} );

	const toolbarDropdown = createDropdown( locale );
	toolbarDropdown.set( 'isVertical', true );

	addToolbarToDropdown( toolbarDropdown, buttonViews );

	// This will change icon to button with `isOn = true`.
	toolbarDropdown.buttonView.bind( 'icon' ).toMany( buttons, 'isOn', ( ...areActive ) => {
		// Get the index of an active button.
		const index = areActive.findIndex( value => value );

		// If none of the commands is active, display either defaultIcon or the first button's icon.
		if ( index < 0 ) {
			return buttons[ 0 ].icon;
		}

		// Return active button's icon.
		return buttons[ index ].icon;
	} );

	// This will disable dropdown button when all buttons have `isEnabled = false`.
	toolbarDropdown.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

	ui.toolbarDropdown.add( toolbarDropdown );

	window.buttons = buttons;
}

function testSplitButton() {
	const dropdownView = createDropdown( {}, SplitButtonView );

	dropdownView.buttonView.set( {
		label: 'Dropdown',
		icon: alignCenterIcon
	} );

	ui.splitButton.add( dropdownView );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';

	dropdownView.buttonView.on( 'execute', () => {
		console.log( 'SplitButton#execute' );
	} );

	dropdownView.buttonView.on( 'open', () => {
		console.log( 'SplitButton#open' );
	} );
}

testEmpty();
testList();
testLongLabel();
testToolbar();
testSplitButton();
