/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import Model from '../../../src/model';

import { createDropdown } from '../../../src/dropdown/utils';
import closeDropdownOnBlur from '../../../src/dropdown/helpers/closedropdownonblur';

describe( 'closeDropdownOnBlur()', () => {
	let dropdownView;

	beforeEach( () => {
		dropdownView = createDropdown( new Model(), {} );

		closeDropdownOnBlur( dropdownView );

		dropdownView.render();
		document.body.appendChild( dropdownView.element );
	} );

	afterEach( () => {
		if ( dropdownView.element ) {
			dropdownView.element.remove();
		}
	} );

	it( 'listens to view#isOpen and reacts to DOM events (valid target)', () => {
		// Open the dropdown.
		dropdownView.isOpen = true;

		// Fire event from outside of the dropdown.
		document.body.dispatchEvent( new Event( 'mousedown', {
			bubbles: true
		} ) );

		// Closed the dropdown.
		expect( dropdownView.isOpen ).to.be.false;

		// Fire event from outside of the dropdown.
		document.body.dispatchEvent( new Event( 'mousedown', {
			bubbles: true
		} ) );

		// Dropdown is still closed.
		expect( dropdownView.isOpen ).to.be.false;
	} );

	it( 'listens to view#isOpen and reacts to DOM events (invalid target)', () => {
		// Open the dropdown.
		dropdownView.isOpen = true;

		// Event from view.element should be discarded.
		dropdownView.element.dispatchEvent( new Event( 'mousedown', {
			bubbles: true
		} ) );

		// Dropdown is still open.
		expect( dropdownView.isOpen ).to.be.true;

		// Event from within view.element should be discarded.
		const child = document.createElement( 'div' );
		dropdownView.element.appendChild( child );

		child.dispatchEvent( new Event( 'mousedown', {
			bubbles: true
		} ) );

		// Dropdown is still open.
		expect( dropdownView.isOpen ).to.be.true;
	} );
} );
