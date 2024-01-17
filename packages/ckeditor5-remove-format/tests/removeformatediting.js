/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

	it( 'should register removeFormat command', () => {
		expect( editor.commands.get( 'removeFormat' ) ).to.instanceof( RemoveFormatCommand );
	} );
} );
