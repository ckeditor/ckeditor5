/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

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

	it( 'should load Notification plugin', () => {
		expect( editor.plugins.get( Notification ) ).to.instanceOf( Notification );
	} );

	it( 'should load ImageEditing plugin', () => {
		expect( editor.plugins.get( ImageEditing ) ).to.instanceOf( ImageEditing );
	} );

	it( 'should load LinkEditing plugin', () => {
		expect( editor.plugins.get( LinkEditing ) ).to.instanceOf( LinkEditing );
	} );

	it( 'should register command', () => {
		const command = editor.commands.get( 'ckfinder' );

		expect( command ).to.be.instanceOf( Command );
	} );
} );
