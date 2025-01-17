/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontColorCommand from '../../src/fontcolor/fontcolorcommand.js';
import FontCommand from '../../src/fontcommand.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

describe( 'FontColorCommand', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;

				command = new FontColorCommand( editor );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a FontCommand', () => {
		expect( FontColorCommand.prototype ).to.be.instanceOf( FontCommand );
		expect( command ).to.be.instanceOf( FontCommand );
	} );

	it( 'operates on fontColor attribute', () => {
		expect( command ).to.have.property( 'attributeKey', 'fontColor' );
	} );
} );
