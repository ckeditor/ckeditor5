/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DeleteCommand from '../src/deletecommand';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'DeleteCommand', () => {
	let editor, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.add( 'delete', command );

				doc.schema.registerItem( 'p', '$block' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'has direction', () => {
		const command = new DeleteCommand( editor, 'forward' );

		expect( command ).to.have.property( 'direction', 'forward' );
	} );

	describe( 'execute()', () => {
		it( 'uses enqueueChanges', () => {
			setData( doc, '<p>foo[]bar</p>' );

			const spy = testUtils.sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'delete' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'locks buffer when executing', () => {
			setData( doc, '<p>foo[]bar</p>' );

			const buffer = editor.commands.get( 'delete' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			editor.execute( 'delete' );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
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

			editor.data.on( 'deleteContent', spy );
			setData( doc, '<p>[]foo</p>' );

			editor.execute( 'delete' );

			expect( getData( doc, { selection: true } ) ).to.equal( '<p>[]foo</p>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'passes options to modifySelection', () => {
			const spy = sinon.spy();

			editor.data.on( 'modifySelection', spy );
			setData( doc, '<p>foo[]bar</p>' );

			editor.commands.get( 'delete' ).direction = 'forward';

			editor.execute( 'delete', { unit: 'word' } );

			expect( spy.callCount ).to.equal( 1 );

			const modifyOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( modifyOpts ).to.have.property( 'direction', 'forward' );
			expect( modifyOpts ).to.have.property( 'unit', 'word' );
		} );

		it( 'passes options to deleteContent #1', () => {
			const spy = sinon.spy();

			editor.data.on( 'deleteContent', spy );
			setData( doc, '<p>foo[]bar</p>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			const deleteOpts = spy.args[ 0 ][ 1 ][ 2 ];
			expect( deleteOpts ).to.have.property( 'doNotResetEntireContent', true );
		} );

		it( 'passes options to deleteContent #2', () => {
			const spy = sinon.spy();

			editor.data.on( 'deleteContent', spy );
			setData( doc, '<p>[foobar]</p>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			const deleteOpts = spy.args[ 0 ][ 1 ][ 2 ];
			expect( deleteOpts ).to.have.property( 'doNotResetEntireContent', false );
		} );
	} );
} );
