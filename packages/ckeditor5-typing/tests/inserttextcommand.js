/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import InsertTextCommand from '../src/inserttextcommand.js';
import ChangeBuffer from '../src/utils/changebuffer.js';
import Input from '../src/input.js';

describe( 'InsertTextCommand', () => {
	let editor, model, doc, buffer, inputCommand;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				inputCommand = new InsertTextCommand( editor, 20 );
				editor.commands.add( 'insertText', inputCommand );

				buffer = inputCommand.buffer;
				buffer._size = 0;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowAttributes: 'bold' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'buffer', () => {
		it( 'has buffer getter', () => {
			expect( editor.commands.get( 'insertText' ).buffer ).to.be.an.instanceof( ChangeBuffer );
		} );

		it( 'has a buffer limit configured to default value of 20', () => {
			expect( editor.commands.get( 'insertText' )._buffer ).to.have.property( 'limit', 20 );
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
					expect( editor.commands.get( 'insertText' )._buffer ).to.have.property( 'limit', 5 );
				} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'uses enqueueChange', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			model.enqueueChange( () => {
				editor.execute( 'insertText', { text: 'x' } );

				// We expect that command is executed in enqueue changes block. Since we are already in
				// an enqueued block, the command execution will be postponed. Hence, no changes.
				expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			// After all enqueued changes are done, the command execution is reflected.
			expect( getData( model ) ).to.equal( '<paragraph>foox[]bar</paragraph>' );
		} );

		it( 'should lock and unlock buffer', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			const spyLock = testUtils.sinon.spy( buffer, 'lock' );
			const spyUnlock = testUtils.sinon.spy( buffer, 'unlock' );

			editor.execute( 'insertText', {
				text: ''
			} );

			expect( spyLock.calledOnce ).to.be.true;
			expect( spyUnlock.calledOnce ).to.be.true;
		} );

		it( 'inserts text for collapsed range', () => {
			setData( model, '<paragraph>foo</paragraph>' );

			editor.execute( 'insertText', {
				text: 'bar',
				range: model.createRange(
					// <paragraph>foo[]</paragraph>
					model.createPositionAt( doc.getRoot().getChild( 0 ), 3 ),
					model.createPositionAt( doc.getRoot().getChild( 0 ), 3 )
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobar[]</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'should not execute when selection is in non-editable place', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			model.document.isReadOnly = true;

			editor.execute( 'insertText', {	text: 'bar'	} );

			expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'should insert text for a collapsed selection', () => {
			setData( model, '<paragraph>foo</paragraph>' );

			editor.execute( 'insertText', {
				text: 'bar',
				selection: model.createSelection(
					model.createRange(
						// <paragraph>foo[]</paragraph>
						model.createPositionAt( doc.getRoot().getChild( 0 ), 3 ),
						model.createPositionAt( doc.getRoot().getChild( 0 ), 3 )
					)
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobar[]</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'replaces text for range within single element on the beginning', () => {
			setData( model, '<paragraph>foobar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'rab',
				range: model.createRange(
					// <paragraph>[fooba]r</paragraph>
					model.createPositionAt( doc.getRoot().getChild( 0 ), 0 ),
					model.createPositionAt( doc.getRoot().getChild( 0 ), 5 )
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>rab[]r</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'should replace text for range within single element on the beginning', () => {
			setData( model, '<paragraph>foobar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'rab',
				selection: model.createSelection(
					model.createRange(
						// <paragraph>[fooba]r</paragraph>
						model.createPositionAt( doc.getRoot().getChild( 0 ), 0 ),
						model.createPositionAt( doc.getRoot().getChild( 0 ), 5 )
					)
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>rab[]r</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'replaces text for range within single element in the middle', () => {
			setData( model, '<paragraph>foobar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'bazz',
				range: model.createRange(
					// <paragraph>fo[oba]r</paragraph>
					model.createPositionAt( doc.getRoot().getChild( 0 ), 2 ),
					model.createPositionAt( doc.getRoot().getChild( 0 ), 5 )
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>fobazz[]r</paragraph>' );
			expect( buffer.size ).to.equal( 4 );
		} );

		it( 'should replace text for range within single element in the middle', () => {
			setData( model, '<paragraph>foobar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'bazz',
				selection: model.createSelection(
					model.createRange(
						// <paragraph>fo[oba]r</paragraph>
						model.createPositionAt( doc.getRoot().getChild( 0 ), 2 ),
						model.createPositionAt( doc.getRoot().getChild( 0 ), 5 )
					)
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>fobazz[]r</paragraph>' );
			expect( buffer.size ).to.equal( 4 );
		} );

		it( 'replaces text for range within single element on the end', () => {
			setData( model, '<paragraph>foobar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'zzz',
				range: model.createRange(
					// <paragraph>fooba[r]</paragraph>
					model.createPositionAt( doc.getRoot().getChild( 0 ), 5 ),
					model.createPositionAt( doc.getRoot().getChild( 0 ), 6 )
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobazzz[]</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'should replace text for range within single element on the end', () => {
			setData( model, '<paragraph>foobar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'zzz',
				selection: model.createSelection(
					model.createRange(
						// <paragraph>fooba[r]</paragraph>
						model.createPositionAt( doc.getRoot().getChild( 0 ), 5 ),
						model.createPositionAt( doc.getRoot().getChild( 0 ), 6 )
					)
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobazzz[]</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'replaces text for range within multiple elements', () => {
			setData( model, '<heading1>FOO</heading1><paragraph>bar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'unny c',
				range: model.createRange(
					// <heading1>F[OO</heading1><paragraph>b]ar</paragraph>
					model.createPositionAt( doc.getRoot().getChild( 0 ), 1 ),
					model.createPositionAt( doc.getRoot().getChild( 1 ), 1 )
				)
			} );

			expect( getData( model ) ).to.equal( '<heading1>Funny c[]ar</heading1>' );
			expect( buffer.size ).to.equal( 6 );
		} );

		it( 'should replace text for range within multiple elements', () => {
			setData( model, '<heading1>FOO</heading1><paragraph>bar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'unny c',
				selection: model.createSelection(
					model.createRange(
						// <heading1>F[OO</heading1><paragraph>b]ar</paragraph>
						model.createPositionAt( doc.getRoot().getChild( 0 ), 1 ),
						model.createPositionAt( doc.getRoot().getChild( 1 ), 1 )
					)
				)
			} );

			expect( getData( model ) ).to.equal( '<heading1>Funny c[]ar</heading1>' );
			expect( buffer.size ).to.equal( 6 );
		} );

		it( 'uses current selection when range is not given', () => {
			setData( model, '<paragraph>foob[ar]</paragraph>' );

			editor.execute( 'insertText', {
				text: 'az'
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobaz[]</paragraph>' );
			expect( buffer.size ).to.equal( 2 );
		} );

		it( 'only removes content when empty text given', () => {
			setData( model, '<paragraph>[fo]obar</paragraph>' );

			editor.execute( 'insertText', {
				text: '',
				range: doc.selection.getFirstRange()
			} );

			expect( getData( model ) ).to.equal( '<paragraph>[]obar</paragraph>' );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'should set selection according to passed resultRange (collapsed)', () => {
			setData( model, '<paragraph>[foo]bar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'new',
				resultRange: editor.model.createRange( editor.model.createPositionFromPath( doc.getRoot(), [ 0, 5 ] ) )
			} );

			expect( getData( model ) ).to.equal( '<paragraph>newba[]r</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'should set selection according to passed resultRange (non-collapsed)', () => {
			setData( model, '<paragraph>[foo]bar</paragraph>' );

			editor.execute( 'insertText', {
				text: 'new',
				resultRange: editor.model.createRange(
					editor.model.createPositionFromPath( doc.getRoot(), [ 0, 3 ] ),
					editor.model.createPositionFromPath( doc.getRoot(), [ 0, 6 ] )
				)
			} );

			expect( getData( model ) ).to.equal( '<paragraph>new[bar]</paragraph>' );
			expect( buffer.size ).to.equal( 3 );
		} );

		it( 'only removes content when no text given (with default non-collapsed range)', () => {
			setData( model, '<paragraph>[fo]obar</paragraph>' );

			editor.execute( 'insertText' );

			expect( getData( model ) ).to.equal( '<paragraph>[]obar</paragraph>' );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'does not change selection and content when no text given (with default collapsed range)', () => {
			setData( model, '<paragraph>fo[]obar</paragraph>' );

			editor.execute( 'insertText' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[]obar</paragraph>' );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'does not create insert delta when no text given', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			const version = doc.version;

			editor.execute( 'insertText' );

			expect( doc.version ).to.equal( version );
		} );

		it( 'handles multi-range selection', () => {
			model.schema.register( 'object', {
				allowWhere: '$block',
				allowContentOf: '$block',
				isObject: true
			} );

			setData(
				model,
				'<paragraph>x</paragraph>' +
				'[<object>y</object>]' +
				'<paragraph>y</paragraph>' +
				'[<object>y</object>]' +
				'<paragraph>z</paragraph>'
			);

			// deleteContent() does not support multi-range selections yet, so we need to mock it here.
			// See https://github.com/ckeditor/ckeditor5/issues/6328.
			model.on( 'deleteContent', ( evt, args ) => {
				const [ selection ] = args;

				if ( selection.rangeCount != 2 ) {
					return;
				}

				evt.stop();

				model.change( writer => {
					let rangeSelection;

					for ( const range of Array.from( selection.getRanges() ) ) {
						rangeSelection = writer.createSelection( range );

						model.deleteContent( rangeSelection );
					}

					writer.setSelection( rangeSelection );
				} );
			}, { priority: 'high' } );

			editor.execute( 'insertText', {
				text: 'foo'
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>y</paragraph>' +
				'<paragraph>foo[]</paragraph>' +
				'<paragraph>z</paragraph>'
			);
		} );

		it( 'uses typing batch while removing and inserting the content', () => {
			let currentBatch = getCurrentBatch();

			expect( currentBatch.isTyping, 'batch before typing' ).to.equal( false );

			model.on( 'deleteContent', () => {
				currentBatch = getCurrentBatch();

				expect( currentBatch.isTyping, 'batch when deleting content' ).to.equal( true );
			}, { priority: 'highest' } );

			model.on( 'insertContent', () => {
				currentBatch = getCurrentBatch();

				expect( currentBatch.isTyping, 'batch when inserting content' ).to.equal( true );
			}, { priority: 'lowest' } );

			setData( model, '<paragraph>[foo]</paragraph>' );

			editor.execute( 'insertText', { text: 'bar' } );

			expect( getData( model ) ).to.equal( '<paragraph>bar[]</paragraph>' );

			function getCurrentBatch() {
				return editor.model.change( writer => writer.batch );
			}
		} );

		describe( 'applies document selection attributes', () => {
			it( 'insert using the DocumentSelection as insertText target', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'bold', true );
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo<$text bold="true">[]</$text></paragraph>' );

				editor.execute( 'insertText', {
					text: 'bar'
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo<$text bold="true">bar[]</$text></paragraph>' );
			} );

			it( 'insert using a static selection as insertText target', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'bold', true );
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo<$text bold="true">[]</$text></paragraph>' );

				editor.execute( 'insertText', {
					text: 'bar',
					selection: model.createSelection( doc.getRoot().getChild( 0 ), 0 )
				} );

				expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">bar[]</$text>foo</paragraph>' );
			} );

			it( 'replace using the DocumentSelection as insertText target', () => {
				setData( model, '<paragraph>foo<$text bold="true">[bar]</$text></paragraph>' );

				editor.execute( 'insertText', {
					text: 'abc'
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo<$text bold="true">abc[]</$text></paragraph>' );
			} );

			it( 'replace using a static selection as insertText target', () => {
				setData( model, '<paragraph>foo<$text bold="true">[bar]</$text></paragraph>' );

				editor.execute( 'insertText', {
					text: 'abc',
					selection: model.createSelection( doc.selection )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo<$text bold="true">abc[]</$text></paragraph>' );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy change buffer', () => {
			const command = editor.commands.get( 'insertText' );
			const destroy = command._buffer.destroy = testUtils.sinon.spy();

			command.destroy();

			expect( destroy.calledOnce ).to.be.true;
		} );
	} );
} );
