/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpecialCharactersEditing from '../src/specialcharactersediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import InsertSpecialCharacterCommand from '../src/insertspecialcharactercommand';

describe( 'SpecialCharactersEditing', () => {
	let editor;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ SpecialCharactersEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have proper pluginName', () => {
		expect( SpecialCharactersEditing.pluginName ).to.equal( 'SpecialCharactersEditing' );
	} );

	it( 'adds a command', () => {
		expect( editor.commands.get( 'specialCharacters' ) ).to.be.instanceOf( InsertSpecialCharacterCommand );
	} );
} );
