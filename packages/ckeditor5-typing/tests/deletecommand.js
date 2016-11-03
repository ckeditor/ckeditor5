/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from 'tests/core/_utils/modeltesteditor.js';
import DeleteCommand from 'ckeditor5/typing/deletecommand.js';
import { getData, setData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'DeleteCommand', () => {
	let editor, doc;

	beforeEach( () => {
		return ModelTestEditor.create( )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.set( 'delete', command );

				doc.schema.registerItem( 'p', '$block' );
			} );
	} );

	it( 'has direction', () => {
		const command = new DeleteCommand( editor, 'forward' );

		expect( command ).to.have.property( 'direction', 'forward' );
	} );

	describe( 'execute', () => {
		it( 'uses enqueueChanges', () => {
			setData( doc, '<p>foo[]bar</p>' );

			const spy = sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'delete' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'deletes previous character when selection is collapsed', () => {
			setData( doc, '<p>foo[]bar</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>fo[]bar</p>' );
		} );

		it( 'deletes selection contents', () => {
			setData( doc, '<p>fo[ob]ar</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>fo[]ar</p>' );
		} );

		it( 'merges elements', () => {
			setData( doc, '<p>foo</p><p>[]bar</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>foo[]bar</p>' );
		} );

		it( 'does not try to delete when selection is at the boundary', () => {
			const spy = sinon.spy();

			doc.composer.on( 'deleteContents', spy );
			setData( doc, '<p>[]foo</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>[]foo</p>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'passes options to modifySelection', () => {
			const spy = sinon.spy();

			doc.composer.on( 'modifySelection', spy );
			setData( doc, '<p>foo[]bar</p>' );

			editor.commands.get( 'delete' ).direction = 'forward';

			editor.execute( 'delete', { unit: 'word' } );

			expect( spy.callCount ).to.equal( 1 );

			const modifyOpts = spy.args[ 0 ][ 1 ].options;
			expect( modifyOpts ).to.have.property( 'direction', 'forward' );
			expect( modifyOpts ).to.have.property( 'unit', 'word' );
		} );
	} );
} );
