/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import MultiCommand from '@ckeditor/ckeditor5-core/src/multicommand.js';

import IndentEditing from '../src/indentediting.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( IndentEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( IndentEditing.isPremiumPlugin ).to.be.false;
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
