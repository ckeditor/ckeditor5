/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontFamilyCommand from '../../src/fontfamily/fontfamilycommand';
import FontCommand from '../../src/fontcommand';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

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
