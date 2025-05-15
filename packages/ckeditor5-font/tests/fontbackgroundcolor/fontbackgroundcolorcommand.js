/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontBackgroundColorCommand from '../../src/fontbackgroundcolor/fontbackgroundcolorcommand.js';
import FontCommand from '../../src/fontcommand.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

describe( 'FontBackgroundColorCommand', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;

				command = new FontBackgroundColorCommand( editor );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a FontCommand', () => {
		expect( FontBackgroundColorCommand.prototype ).to.be.instanceOf( FontCommand );
		expect( command ).to.be.instanceOf( FontCommand );
	} );

	it( 'operates on fontBackgroundColor attribute', () => {
		expect( command ).to.have.property( 'attributeKey', 'fontBackgroundColor' );
	} );
} );
