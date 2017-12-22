/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontSizeCommand from '../../src/fontsize/fontsizecommand';
import FontCommand from '../../src/fontcommand';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

describe( 'FontSizeCommand', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;

				command = new FontSizeCommand( editor );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a FontCommand', () => {
		expect( FontSizeCommand.prototype ).to.be.instanceOf( FontCommand );
		expect( command ).to.be.instanceOf( FontCommand );
	} );

	it( 'opeartes on fontSize attribute', () => {
		expect( command ).to.have.property( 'attribute', 'fontSize' );
	} );
} );
