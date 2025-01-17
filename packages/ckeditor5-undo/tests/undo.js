/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Undo from '../src/undo.js';
import UndoEditing from '../src/undoediting.js';
import UndoUI from '../src/undoui.js';

describe( 'Undo', () => {
	it( 'should be named', () => {
		expect( Undo.pluginName ).to.equal( 'Undo' );
	} );

	it( 'should require UndoEditing and UndoUI', () => {
		expect( Undo.requires ).to.deep.equal( [ UndoEditing, UndoUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Undo.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Undo.isPremiumPlugin ).to.be.false;
	} );
} );
