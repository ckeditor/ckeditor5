/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import RemoveFormatCommand from '../src/removeformatcommand.js';
import RemoveFormatEditing from '../src/removeformatediting.js';

describe( 'RemoveFormat', () => {
	let editor;

	beforeEach( () => {
		return ModelTestEditor.create( {
			plugins: [ RemoveFormatEditing ]
		} ).then( newEditor => {
			editor = newEditor;
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( RemoveFormatEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( RemoveFormatEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register removeFormat command', () => {
		expect( editor.commands.get( 'removeFormat' ) ).to.instanceof( RemoveFormatCommand );
	} );
} );
