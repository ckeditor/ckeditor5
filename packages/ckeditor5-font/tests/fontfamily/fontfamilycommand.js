/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontFamilyCommand from '../../src/fontfamily/fontfamilycommand.js';
import FontCommand from '../../src/fontcommand.js';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

describe( 'FontFamilyCommand', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;

				command = new FontFamilyCommand( editor );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a FontCommand', () => {
		expect( FontFamilyCommand.prototype ).to.be.instanceOf( FontCommand );
		expect( command ).to.be.instanceOf( FontCommand );
	} );

	it( 'operates on fontFamily attribute', () => {
		expect( command ).to.have.property( 'attributeKey', 'fontFamily' );
	} );
} );
