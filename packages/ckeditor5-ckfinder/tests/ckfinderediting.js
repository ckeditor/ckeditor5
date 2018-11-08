/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Command from '@ckeditor/ckeditor5-core/src/command';

import CKFinder from '../src/ckfinder';
import CKFinderEditing from '../src/ckfinderediting';

describe( 'CKFinderEditing', () => {
	let editorElement, editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CKFinder ]

			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinderEditing ) ).to.be.instanceOf( CKFinderEditing );
	} );

	it( 'should register command', () => {
		const command = editor.commands.get( 'ckfinder' );

		expect( command ).to.be.instanceOf( Command );
	} );
} );
