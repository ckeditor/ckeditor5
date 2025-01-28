/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontSizeCommand from '../../src/fontsize/fontsizecommand.js';
import FontCommand from '../../src/fontcommand.js';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

describe( 'FontSizeCommand', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;

				command = new FontSizeCommand( editor );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a FontCommand', () => {
		expect( FontSizeCommand.prototype ).to.be.instanceOf( FontCommand );
		expect( command ).to.be.instanceOf( FontCommand );
	} );

	it( 'operates on fontSize attribute', () => {
		expect( command ).to.have.property( 'attributeKey', 'fontSize' );
	} );
} );
