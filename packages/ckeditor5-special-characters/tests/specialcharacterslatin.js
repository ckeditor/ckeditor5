/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import SpecialCharacters from '../src/specialcharacters';
import SpecialCharactersLatin from '../src/specialcharacterslatin';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'SpecialCharactersLatin', () => {
	testUtils.createSinonSandbox();

	let editor, editorElement, addItemsSpy, addItemsFirstCallArgs;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );

		addItemsSpy = sinon.spy( SpecialCharacters.prototype, 'addItems' );

		document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ SpecialCharacters, SpecialCharactersLatin ]
			} )
			.then( newEditor => {
				editor = newEditor;
				addItemsFirstCallArgs = addItemsSpy.args[ 0 ];
			} );
	} );

	afterEach( () => {
		addItemsSpy.restore();

		editorElement.remove();
		return editor.destroy();
	} );

	it( 'adds new items', () => {
		expect( addItemsSpy.callCount ).to.equal( 1 );
	} );

	it( 'properly names the category', () => {
		expect( addItemsFirstCallArgs[ 0 ] ).to.equal( 'Latin' );
	} );

	it( 'adds proper characters', () => {
		expect( addItemsFirstCallArgs[ 1 ] ).to.deep.include( {
			character: 'Ō',
			title: 'Latin capital letter o with macron'
		} );

		expect( addItemsFirstCallArgs[ 1 ] ).to.deep.include( {
			character: 'Ō',
			title: 'Latin capital letter o with macron'
		} );
	} );
} );
