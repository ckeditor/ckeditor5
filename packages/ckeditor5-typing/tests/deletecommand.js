/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
import DeleteCommand from '/ckeditor5/typing/deletecommand.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

describe( 'DeleteCommand', () => {
	let editor, doc;

	beforeEach( () => {
		return ModelTestEditor.create( )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const command = new DeleteCommand( editor, 'BACKWARD' );
				editor.commands.set( 'delete', command );

				doc.schema.registerItem( 'p', '$block' );
			} );
	} );

	it( 'has direction', () => {
		const command = new DeleteCommand( editor, 'FORWARD' );

		expect( command ).to.have.property( 'direction', 'FORWARD' );
	} );

	describe( 'execute', () => {
		it( 'uses enqueueChanges', () => {
			const spy = sinon.spy( doc, 'enqueueChanges' );

			setData( doc, '<p>foo<selection />bar</p>' );

			editor.execute( 'delete' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'deletes previous character when selection is collapsed', () => {
			setData( doc, '<p>foo<selection />bar</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>fo<selection />bar</p>' );
		} );

		it( 'deletes selection contents', () => {
			setData( doc, '<p>fo<selection>ob</selection>ar</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>fo<selection />ar</p>' );
		} );

		it( 'merges elements', () => {
			setData( doc, '<p>foo</p><p><selection />bar</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>foo<selection />bar</p>' );
		} );

		it( 'does not try to delete when selection is at the boundary', () => {
			const spy = sinon.spy();

			doc.composer.on( 'deleteContents', spy );
			setData( doc, '<p><selection />foo</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p><selection />foo</p>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'passes options to modifySelection', () => {
			const spy = sinon.spy();

			doc.composer.on( 'modifySelection', spy );
			setData( doc, '<p>foo<selection />bar</p>' );

			editor.commands.get( 'delete' ).direction = 'FORWARD';

			editor.execute( 'delete', { unit: 'WORD' } );

			expect( spy.callCount ).to.equal( 1 );

			const modifyOpts = spy.args[ 0 ][ 1 ].options;
			expect( modifyOpts ).to.have.property( 'direction', 'FORWARD' );
			expect( modifyOpts ).to.have.property( 'unit', 'WORD' );
		} );
	} );
} );
