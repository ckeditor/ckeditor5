/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import InputCommand from '../src/inputcommand';
import ChangeBuffer from '../src/changebuffer';

describe( 'InputCommand', () => {
	let editor, doc, buffer;

	testUtils.createSinonSandbox();

	before( () => {
		return ModelTestEditor.create( )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				buffer = new ChangeBuffer( doc, 20 );

				editor.commands.set( 'input', new InputCommand( editor ) );

				doc.schema.registerItem( 'p', '$block' );
				doc.schema.registerItem( 'h1', '$block' );
			} );
	} );

	beforeEach( () => {
		buffer.size = 0;
	} );

	describe( 'execute', () => {
		it( 'uses enqueueChanges', () => {
			setData( doc, '<p>foo[]bar</p>' );

			const spy = testUtils.sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'input', {
				buffer: buffer
			} );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'inserts text for collapsed range', () => {
			setData( doc, '<p>foo[]</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'bar',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobar[]</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within single element on the beginning', () => {
			setData( doc, '<p>[fooba]r</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'rab',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>rab[]r</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within single element in the middle', () => {
			setData( doc, '<p>fo[oba]r</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'bazz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>fobazz[]r</p>' );
			expect( buffer.size ).to.be.equal( 4 );
		} );

		it( 'replaces text for range within single element on the end', () => {
			setData( doc, '<p>fooba[r]</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'zzz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobazzz[]</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within multiple elements', () => {
			setData( doc, '<h1>F[OO</h1><p>b]ar</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'unny c',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<h1>Funny c[</h1><p>]ar</p>' );
			expect( buffer.size ).to.be.equal( 6 );
		} );

		it( 'uses current selection when range is not given', () => {
			setData( doc, '<p>foob[ar]</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'az'
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobaz[]</p>' );
			expect( buffer.size ).to.be.equal( 2 );
		} );

		it( 'only removes content when text is not given', () => {
			setData( doc, '<p>[fo]obar</p>' );

			editor.execute( 'input', {
				buffer: buffer,
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );

		it( 'does nothing when there is no range', () => {
			setData( doc, '<p>[fo]obar</p>' );

			testUtils.sinon.stub( editor.document.selection, 'getFirstRange' ).returns( null );

			editor.execute( 'input', {
				buffer: buffer,
				text: 'baz'
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[fo]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );

		it( 'does nothing when there is no buffer', () => {
			setData( doc, '<p>[fo]obar</p>' );

			editor.execute( 'input', {
				text: 'baz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[fo]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );

		it( 'does nothing when there is no options object provided', () => {
			setData( doc, '<p>[fo]obar</p>' );

			const spy = testUtils.sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'input' );

			expect( spy.callCount ).to.be.equal( 0 );
			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[fo]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );
	} );
} );
