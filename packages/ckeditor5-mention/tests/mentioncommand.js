/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import MentionCommand from '../src/mentioncommand';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'MentionCommand', () => {
	let editor, command, model, doc, selection;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				selection = doc.selection;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'x', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowAttributes: [ 'mention' ] } );

				command = new MentionCommand( editor );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should return true if characters with the attribute can be placed at caret position', () => {
			setData( model, '<paragraph>f[]oo</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
			model.schema.addAttributeCheck( ( ctx, attributeName ) => {
				// Allow 'bold' on p>$text.
				if ( ctx.endsWith( 'x $text' ) && attributeName == 'mention' ) {
					return false;
				}
			} );

			setData( model, '<x>fo[]o</x>' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'inserts mention object if mention was passed as string', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			command.execute( {
				marker: '@',
				mention: '@John',
				range: model.createRange( selection.focus.getShiftedBy( -3 ), selection.focus )
			} );

			assertMention( doc.getRoot().getChild( 0 ).getChild( 1 ), '@John' );
		} );

		it( 'inserts mention object with data if mention was passed as object', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			command.execute( {
				marker: '@',
				mention: { id: '@John', userId: '123456' },
				range: model.createRange( selection.focus.getShiftedBy( -3 ), selection.focus )
			} );

			const mentionNode = doc.getRoot().getChild( 0 ).getChild( 1 );
			assertMention( mentionNode, '@John' );
			expect( mentionNode.getAttribute( 'mention' ) ).to.have.property( 'userId', '123456' );
		} );

		it( 'inserts options.text as mention text', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			command.execute( {
				marker: '@',
				mention: '@John',
				text: '@John Doe',
				range: model.createRange( selection.focus.getShiftedBy( -3 ), selection.focus )
			} );

			assertMention( doc.getRoot().getChild( 0 ).getChild( 1 ), '@John' );
		} );

		it( 'inserts mention attribute with passed marker for given range', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			const end = model.createPositionAt( selection.focus );
			const start = end.getShiftedBy( -3 );

			command.execute( {
				marker: '#',
				mention: '#John',
				range: model.createRange( start, end )
			} );

			assertMention( doc.getRoot().getChild( 0 ).getChild( 1 ), '#John' );
		} );

		it( 'inserts mention attribute at current selection if no range was passed', () => {
			setData( model, '<paragraph>foo []bar</paragraph>' );

			command.execute( {
				marker: '@',
				mention: '@John'
			} );

			assertMention( doc.getRoot().getChild( 0 ).getChild( 1 ), '@John' );
		} );

		it( 'should set also other styles in inserted text', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );

			setData( model, '<paragraph><$text bold="true">foo@John[]bar</$text></paragraph>' );

			command.execute( {
				marker: '@',
				mention: '@John',
				range: model.createRange( selection.focus.getShiftedBy( -5 ), selection.focus )
			} );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );
			assertMention( textNode, '@John' );
			expect( textNode.hasAttribute( 'bold' ) ).to.be.true;
		} );

		it( 'should throw if marker is not one character', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			const testCases = [
				{ marker: '##', mention: '##foo' },
				{ marker: '', mention: '@foo' }
			];

			for ( const options of testCases ) {
				expectToThrowCKEditorError( () => command.execute( options ), /mentioncommand-incorrect-marker/, editor );
			}
		} );

		it( 'should throw if marker does not match mention id', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			const testCases = [
				{ marker: '@', mention: 'foo' },
				{ marker: '@', mention: { id: 'foo' } },
				{ marker: '@', mention: { id: '#foo' } }
			];

			for ( const options of testCases ) {
				expectToThrowCKEditorError( () => command.execute( options ), /mentioncommand-incorrect-id/, editor );
			}
		} );
	} );

	function assertMention( textNode, id ) {
		expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
		expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_uid' );
		expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_text', textNode.data );
		expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'id', id );
	}
} );
