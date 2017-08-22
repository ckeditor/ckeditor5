/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import InputCommand from '../src/inputcommand';
import ChangeBuffer from '../src/changebuffer';
import Input from '../src/input';

describe( 'InputCommand', () => {
	let editor, doc, buffer;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const inputCommand = new InputCommand( editor, 20 );
				editor.commands.add( 'input', inputCommand );

				buffer = inputCommand.buffer;
				buffer.size = 0;

				doc.schema.registerItem( 'p', '$block' );
				doc.schema.registerItem( 'h1', '$block' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'buffer', () => {
		it( 'has buffer getter', () => {
			expect( editor.commands.get( 'input' ).buffer ).to.be.an.instanceof( ChangeBuffer );
		} );

		it( 'has a buffer limit configured to default value of 20', () => {
			expect( editor.commands.get( 'input' )._buffer ).to.have.property( 'limit', 20 );
		} );

		it( 'has a buffer configured to config.typing.undoStep', () => {
			return VirtualTestEditor
				.create( {
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

	describe( 'execute()', () => {
		it( 'uses enqueueChanges', () => {
			setData( doc, '<p>foo[]bar</p>' );

			doc.enqueueChanges( () => {
				editor.execute( 'input', { text: 'x' } );

				// We expect that command is executed in enqueue changes block. Since we are already in
				// an enqueued block, the command execution will be postponed. Hence, no changes.
				expect( getData( doc ) ).to.be.equal( '<p>foo[]bar</p>' );
			} );

			// After all enqueued changes are done, the command execution is reflected.
			expect( getData( doc ) ).to.be.equal( '<p>foox[]bar</p>' );
		} );

		it( 'should lock and unlock buffer', () => {
			setData( doc, '<p>foo[]bar</p>' );

			const spyLock = testUtils.sinon.spy( buffer, 'lock' );
			const spyUnlock = testUtils.sinon.spy( buffer, 'unlock' );

			editor.execute( 'input', {
				text: ''
			} );

			expect( spyLock.calledOnce ).to.be.true;
			expect( spyUnlock.calledOnce ).to.be.true;
		} );

		it( 'inserts text for collapsed range', () => {
			setData( doc, '<p>foo[]</p>' );

			editor.execute( 'input', {
				text: 'bar',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobar[]</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within single element on the beginning', () => {
			setData( doc, '<p>[fooba]r</p>' );

			editor.execute( 'input', {
				text: 'rab',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>rab[]r</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within single element in the middle', () => {
			setData( doc, '<p>fo[oba]r</p>' );

			editor.execute( 'input', {
				text: 'bazz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>fobazz[]r</p>' );
			expect( buffer.size ).to.be.equal( 4 );
		} );

		it( 'replaces text for range within single element on the end', () => {
			setData( doc, '<p>fooba[r]</p>' );

			editor.execute( 'input', {
				text: 'zzz',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobazzz[]</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'replaces text for range within multiple elements', () => {
			setData( doc, '<h1>F[OO</h1><p>b]ar</p>' );

			editor.execute( 'input', {
				text: 'unny c',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<h1>Funny c[</h1><p>]ar</p>' );
			expect( buffer.size ).to.be.equal( 6 );
		} );

		it( 'uses current selection when range is not given', () => {
			setData( doc, '<p>foob[ar]</p>' );

			editor.execute( 'input', {
				text: 'az'
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>foobaz[]</p>' );
			expect( buffer.size ).to.be.equal( 2 );
		} );

		it( 'only removes content when empty text given', () => {
			setData( doc, '<p>[fo]obar</p>' );

			editor.execute( 'input', {
				text: '',
				range: editor.document.selection.getFirstRange()
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );

		it( 'should set selection according to passed resultRange (collapsed)', () => {
			setData( doc, '<p>[foo]bar</p>' );

			editor.execute( 'input', {
				text: 'new',
				resultRange: new Range( new Position( doc.getRoot(), [ 0, 5 ] ) )
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>newba[]r</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'should set selection according to passed resultRange (non-collapsed)', () => {
			setData( doc, '<p>[foo]bar</p>' );

			editor.execute( 'input', {
				text: 'new',
				resultRange: new Range( new Position( doc.getRoot(), [ 0, 3 ] ), new Position( doc.getRoot(), [ 0, 6 ] ) )
			} );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>new[bar]</p>' );
			expect( buffer.size ).to.be.equal( 3 );
		} );

		it( 'only removes content when no text given (with default non-collapsed range)', () => {
			setData( doc, '<p>[fo]obar</p>' );

			editor.execute( 'input' );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>[]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );

		it( 'does not change selection and content when no text given (with default collapsed range)', () => {
			setData( doc, '<p>fo[]obar</p>' );

			editor.execute( 'input' );

			expect( getData( doc, { selection: true } ) ).to.be.equal( '<p>fo[]obar</p>' );
			expect( buffer.size ).to.be.equal( 0 );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should destroy change buffer', () => {
			const command = editor.commands.get( 'input' );
			const destroy = command._buffer.destroy = testUtils.sinon.spy();

			command.destroy();

			expect( destroy.calledOnce ).to.be.true;
		} );
	} );
} );
