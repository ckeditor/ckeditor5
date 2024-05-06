/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { isDropdownMenuObjectDefinition } from '../../../../src/dropdown/menu/definition/dropdownmenudefinitionguards.js';
import { createMockMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'isDropdownMenuObjectDefinition', () => {
	it( 'returns false if null or undefined is passed', () => {
		expect( isDropdownMenuObjectDefinition( null ) ).to.be.false;
		expect( isDropdownMenuObjectDefinition( undefined ) ).to.be.false;
	} );

	it( 'returns false if non-object is passed', () => {
		expect( isDropdownMenuObjectDefinition( 1 ) ).to.be.false;
		expect( isDropdownMenuObjectDefinition( 'foo' ) ).to.be.false;
		expect( isDropdownMenuObjectDefinition( true ) ).to.be.false;
	} );

	it( 'returns false if empty object is passed', () => {
		expect( isDropdownMenuObjectDefinition( {} ) ).to.be.false;
	} );

	it( 'returns true if valid definition is passed', () => {
		const mockDefinition = createMockMenuDefinition();

		expect( isDropdownMenuObjectDefinition( mockDefinition ) ).to.be.true;
	} );
} );
