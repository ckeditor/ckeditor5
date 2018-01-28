/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Model from '../../../src/model';
import closeDropdownOnExecute from '../../../src/dropdown/helpers/closedropdownonexecute';
import { createDropdown } from '../../../src/dropdown/utils';

describe( 'closeDropdownOnExecute()', () => {
	let dropdownView;

	beforeEach( () => {
		dropdownView = createDropdown( new Model(), {} );

		closeDropdownOnExecute( dropdownView );

		dropdownView.render();
		document.body.appendChild( dropdownView.element );
	} );

	afterEach( () => {
		dropdownView.element.remove();
	} );

	it( 'changes view#isOpen on view#execute', () => {
		dropdownView.isOpen = true;

		dropdownView.fire( 'execute' );
		expect( dropdownView.isOpen ).to.be.false;

		dropdownView.fire( 'execute' );
		expect( dropdownView.isOpen ).to.be.false;
	} );
} );
