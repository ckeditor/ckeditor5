/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, window */

import Model from '../../../src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import createDropdown from '../../../src/dropdown/createdropdown';
import createListDropdown from '../../../src/dropdown/list/createlistdropdown';

import '@ckeditor/ckeditor5-theme-lark/theme/theme.scss';

function renderInto( selector, view ) {
	view.init();
	document.querySelector( selector ).appendChild( view.element );
}

function testEmpty() {
	const dropdownView = createDropdown( new Model( {
		label: 'Dropdown',
		isEnabled: true,
		isOn: false,
		withText: true
	} ) );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';

	renderInto( '#dropdown', dropdownView );
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

	renderInto( '#list-dropdown', dropdownView );

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

	renderInto( '#dropdown-shared', dropdownView1 );
	renderInto( '#dropdown-shared', dropdownView2 );

	dropdownView1.panelView.element.innerHTML = dropdownView2.panelView.element.innerHTML = 'Empty panel.';
}

function testLongLabel() {
	const dropdownView = createDropdown( new Model( {
		label: 'Dropdown with a very long label',
		isEnabled: true,
		isOn: false,
		withText: true
	} ) );

	renderInto( '#dropdown-label', dropdownView );

	dropdownView.panelView.element.innerHTML = 'Empty panel. There is no child view in this DropdownPanelView.';
}

testEmpty();
testList();
testSharedModel();
testLongLabel();
