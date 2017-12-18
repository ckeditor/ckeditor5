/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import Model from '../../../src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import createDropdown from '../../../src/dropdown/createdropdown';
import createListDropdown from '../../../src/dropdown/list/createlistdropdown';

import testUtils from '../../_utils/utils';

import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import alignCenterIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import ButtonView from '../../../src/button/buttonview';

import createButtonDropdown from '../../../src/dropdown/button/createbuttondropdown';

const ui = testUtils.createTestUIView( {
	dropdown: '#dropdown',
	listDropdown: '#list-dropdown',
	dropdownShared: '#dropdown-shared',
	dropdownLabel: '#dropdown-label',
	buttonDropdown: '#button-dropown'
} );

function testEmpty() {
	const dropdownView = createDropdown( new Model( {
		label: 'Dropdown',
		isEnabled: true,
		isOn: false,
		withText: true
	} ) );

	ui.dropdown.add( dropdownView );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';
}

function testList() {
	const collection = new Collection( { idProperty: 'label' } );

	[ '0.8em', '1em', '1.2em', '1.5em', '2.0em', '3.0em' ].forEach( font => {
		collection.add( new Model( {
			label: font,
			style: `font-size: ${ font }`
		} ) );
	} );

	const model = new Model( {
		label: 'ListDropdown',
		isEnabled: true,
		isOn: false,
		withText: true,
		items: collection
	} );

	const dropdownView = createListDropdown( model );

	dropdownView.on( 'execute', evt => {
		/* global console */
		console.log( 'List#execute:', evt.source.label );
	} );

	ui.listDropdown.add( dropdownView );

	window.listDropdownModel = model;
	window.listDropdownCollection = collection;
	window.Model = Model;
}

function testSharedModel() {
	const model = new Model( {
		label: 'Shared Model',
		isEnabled: true,
		isOn: false,
		withText: true
	} );

	const dropdownView1 = createDropdown( model );
	const dropdownView2 = createDropdown( model );

	ui.dropdownShared.add( dropdownView1 );
	ui.dropdownShared.add( dropdownView2 );

	dropdownView1.panelView.element.innerHTML = dropdownView2.panelView.element.innerHTML = 'Empty panel.';
}

function testLongLabel() {
	const dropdownView = createDropdown( new Model( {
		label: 'Dropdown with a very long label',
		isEnabled: true,
		isOn: false,
		withText: true
	} ) );

	ui.dropdownLabel.add( dropdownView );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';
}

function testButton() {
	const locale = {};

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

	const buttonDropdownModel = new Model( {
		isVertical: true,
		buttons: buttonViews
	} );

	const buttonDropdown = createButtonDropdown( buttonDropdownModel, {} );

	ui.buttonDropdown.add( buttonDropdown );

	window.buttons = buttons;
	window.buttonDropdownModel = buttonDropdownModel;
}

testEmpty();
testList();
testSharedModel();
testLongLabel();
testButton();
