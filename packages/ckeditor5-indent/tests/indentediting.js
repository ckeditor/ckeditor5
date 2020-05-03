/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import MultiCommand from '@ckeditor/ckeditor5-core/src/multicommand';

import IndentEditing from '../src/indentediting';

describe( 'IndentEditing', () => {
	let editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( { plugins: [ IndentEditing ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( IndentEditing.pluginName ).to.equal( 'IndentEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( IndentEditing ) ).to.be.instanceOf( IndentEditing );
	} );

	it( 'should register indent command', () => {
		const command = editor.commands.get( 'indent' );

		expect( command ).to.be.instanceof( MultiCommand );
	} );

	it( 'should register outdent command', () => {
		const command = editor.commands.get( 'outdent' );

		expect( command ).to.be.instanceof( MultiCommand );
	} );
} );
