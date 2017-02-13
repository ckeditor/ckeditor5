/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import InputCommand from '../src/inputcommand';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ChangeBuffer from '../src/changebuffer';
import Input from '../src/input';

describe( 'InputCommand', () => {
	let editor, doc;

	testUtils.createSinonSandbox();

	before( () => {
		return ModelTestEditor.create( )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const command = new InputCommand( editor );
				editor.commands.set( 'input', command );

				doc.schema.registerItem( 'p', '$block' );
				doc.schema.registerItem( 'h1', '$block' );
			} );
	} );

	beforeEach( () => {
		editor.commands.get( 'input' )._buffer.size = 0;
	} );

	describe( 'buffer', () => {
		it( 'has buffer getter', () => {
			expect( editor.commands.get( 'input' ).buffer ).to.be.an.instanceof( ChangeBuffer );
		} );

		it( 'has a buffer configured to default value of config.typing.undoStep', () => {
			expect( editor.commands.get( 'input' )._buffer ).to.have.property( 'limit', 20 );
		} );

		it( 'has a buffer configured to config.typing.undoStep', () => {
			return VirtualTestEditor.create( {
				plugins: [ Input ],
				typing: {
					undoStep: 5
				}
			} )
				.then( editor => {
					expect( editor.commands.get( 'input' )._buffer ).to.have.property( 'limit', 5 );
				} );
		} );
	} );

	describe( 'execute', () => {
		it( 'uses enqueueChanges', () => {
			setData( doc, '<p>foo[]bar</p>' );

			const spy = testUtils.sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'input' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'inserts text for collapsed range', () => {
			setData( doc, '<p>foo[]</p>' );

			editor.execute( 'input', {
				text: 'bar',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobar[]</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within single element on the beginning', () => {
			setData( doc, '<p>[fooba]r</p>' );

			editor.execute( 'input', {
				text: 'rab',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>rab[]r</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 0 );
		} );

		it( 'replaces text for range within single element in the middle', () => {
			setData( doc, '<p>fo[oba]r</p>' );

			editor.execute( 'input', {
				text: 'bazz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>fobazz[]r</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 1 );
		} );

		it( 'replaces text for range within single element on the end', () => {
			setData( doc, '<p>fooba[r]</p>' );

			editor.execute( 'input', {
				text: 'zzz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobazzz[]</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 2 );
		} );

		it( 'replaces text for range within multiple elements', () => {
			setData( doc, '<h1>F[OO</h1><p>b]ar</p>' );

			editor.execute( 'input', {
				text: 'unny c',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<h1>Funny c[</h1><p>]ar</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 3 );
		} );

		it( 'uses current selection when range is not given', () => {
			setData( doc, '<p>foob[ar]</p>' );

			editor.execute( 'input', {
				text: 'az'
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobaz[]</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 0 );
		} );

		it( 'only removes content when text is not given', () => {
			setData( doc, '<p>[fo]obar</p>' );

			editor.execute( 'input', {
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[]obar</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 0 );
		} );

		it( 'does nothing when there is no range', () => {
			setData( doc, '<p>[fo]obar</p>' );

			testUtils.sinon.stub( editor.document.selection, 'getFirstRange' ).returns( null );

			editor.execute( 'input', {
				text: 'baz'
			} );

			const data = getData( doc, { selection: true } );

			editor.document.selection.getFirstRange.restore();

			expect( data ).to.be.equal( '<p>[fo]obar</p>' );
			expect( editor.commands.get( 'input' ).buffer.size ).to.be.equal( 0 );
		} );
	} );

	describe( '_getTextWithinRange', () => {
		it( 'returns empty text for collapsed selection', () => {
			setData( doc, '<p>[]foo</p>' );
			expect( editor.commands.get( 'input' )._getTextWithinRange( editor.document.selection.getFirstRange() ) ).to.be.empty;
		} );

		it( 'returns valid text for selection within single element', () => {
			setData( doc, '<p>[fooBA]R</p>' );
			expect( editor.commands.get( 'input' )._getTextWithinRange( editor.document.selection.getFirstRange() ) ).to.be.equal( 'fooBA' );
		} );

		it( 'returns valid text for selection within mulitple elements', () => {
			setData( doc, '<h1>fo[o</h1><p>BARb]az</p>' );
			expect( editor.commands.get( 'input' )._getTextWithinRange( editor.document.selection.getFirstRange() ) ).to.be.equal( 'oBARb' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should destroy change buffer', () => {
			const command = editor.commands.get( 'input' );
			const destroy = command._buffer.destroy = testUtils.sinon.spy();

			command.destroy();

			expect( destroy.calledOnce ).to.be.true;
			expect( command._buffer ).to.be.null;
		} );
	} );
} );
