/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Undo from '../src/undo';
import UndoEditing from '../src/undoediting';
import UndoUI from '../src/undoui';

describe( 'Undo', () => {
	it( 'should be named', () => {
		expect( Undo.pluginName ).to.equal( 'Undo' );
	} );

	it( 'should require UndoEditing and UndoUI', () => {
		expect( Undo.requires ).to.deep.equal( [ UndoEditing, UndoUI ] );
	} );
} );
