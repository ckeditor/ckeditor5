/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import Mention from '../src/mention';
import MentionEditing from '../src/mentionediting';
import MentionUI from '../src/mentionui';

describe( 'Mention', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Mention ]
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
		expect( editor.plugins.get( Mention ) ).to.instanceOf( Mention );
	} );

	it( 'has proper name', () => {
		expect( Mention.pluginName ).to.equal( 'Mention' );
	} );

	it( 'should load MentionEditing plugin', () => {
		expect( editor.plugins.get( MentionEditing ) ).to.instanceOf( MentionEditing );
	} );

	it( 'should load MentionUI plugin', () => {
		expect( editor.plugins.get( MentionUI ) ).to.instanceOf( MentionUI );
	} );
} );
