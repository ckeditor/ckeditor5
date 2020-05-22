/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Element from '@ckeditor/ckeditor5-engine/src/view/element';
import Text from '@ckeditor/ckeditor5-engine/src/view/text';

import Mention from '../src/mention';
import MentionEditing from '../src/mentionediting';
import MentionUI from '../src/mentionui';

describe( 'Mention', () => {
	let editorElement, editor, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Mention ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
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

	describe( 'toMentionAttribute()', () => {
		it( 'should create mention attribute with default properties', () => {
			const text = new Text( viewDocument, 'John Doe' );

			const viewElement = new Element( viewDocument, 'span', {
				'data-mention': '@John'
			}, text );

			const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement );

			expect( mentionAttribute ).to.have.property( 'id', '@John' );
			expect( mentionAttribute ).to.have.property( 'uid' );
			expect( mentionAttribute ).to.have.property( '_text', 'John Doe' );
		} );

		it( 'should create mention attribute with provided attributes', () => {
			const text = new Text( viewDocument, 'John Doe' );

			const viewElement = new Element( viewDocument, 'span', {
				'data-mention': '@John'
			}, text );

			const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement, { foo: 'bar' } );

			expect( mentionAttribute ).to.have.property( 'id', '@John' );
			expect( mentionAttribute ).to.have.property( 'foo', 'bar' );
			expect( mentionAttribute ).to.have.property( 'uid' );
			expect( mentionAttribute ).to.have.property( '_text', 'John Doe' );
		} );

		it( 'should return undefined if Element has no text node', () => {
			const viewElement = new Element( viewDocument, 'span', {
				'data-mention': '@John'
			} );

			const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement );

			expect( mentionAttribute ).to.be.undefined;
		} );
	} );
} );
