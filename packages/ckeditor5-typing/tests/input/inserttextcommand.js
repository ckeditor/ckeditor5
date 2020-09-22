/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import InsertTextCommand from '../../src/inserttextcommand';
import ChangeBuffer from '../../src/utils/changebuffer';
import Input from '../../src/input';

describe( 'Input', () => {
	describe( 'InsertTextCommand', () => {
		let editor, model, doc, buffer, insertTextCommand;

		testUtils.createSinonSandbox();

		beforeEach( async () => {
			editor = await ModelTestEditor.create();

			model = editor.model;
			doc = model.document;

			insertTextCommand = new InsertTextCommand( editor, 20 );
			editor.commands.add( 'insertText', insertTextCommand );

			buffer = insertTextCommand.buffer;
			buffer.size = 0;

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'buffer', () => {
			it( 'should have a buffer getter', () => {
				expect( editor.commands.get( 'insertText' ).buffer ).to.be.an.instanceof( ChangeBuffer );
			} );

			it( 'should have a buffer limit configured to default value of 20', () => {
				expect( editor.commands.get( 'insertText' )._buffer ).to.have.property( 'limit', 20 );
			} );

			it( 'should have a buffer configured to config.typing.undoStep', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ Input ],
					typing: {
						undoStep: 5
					}
				} );

				expect( editor.commands.get( 'insertText' )._buffer ).to.have.property( 'limit', 5 );

				await editor.destroy();
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use enqueueChange()', () => {
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

			it( 'should use current document selection when selection was not passed', () => {
				setData( model, '<paragraph>f[oo]bar</paragraph>' );

				editor.execute( 'insertText', {
					text: 'ABC'
				} );

				expect( getData( model ) ).to.equal( '<paragraph>fABC[]bar</paragraph>' );
				expect( buffer.size ).to.equal( 3 );
			} );

			it( 'should only remove content when empty text given', () => {
				setData( model, '<paragraph>foobar</paragraph>' );

				editor.execute( 'insertText', {
					text: '',
					selection: model.createSelection(
						model.createRange(
							// <paragraph>[fo]obar</paragraph>
							model.createPositionAt( doc.getRoot().getChild( 0 ), 0 ),
							model.createPositionAt( doc.getRoot().getChild( 0 ), 2 )
						)
					)
				} );

				expect( getData( model ) ).to.equal( '<paragraph>[]obar</paragraph>' );
				expect( buffer.size ).to.equal( 0 );
			} );

			it( 'should set selection according to passed resultRange (collapsed)', () => {
				setData( model, '<paragraph>foobar</paragraph>' );

				editor.execute( 'insertText', {
					text: 'new',
					selection: model.createSelection(
						model.createRange(
							// <paragraph>[foo]bar</paragraph>
							model.createPositionAt( doc.getRoot().getChild( 0 ), 0 ),
							model.createPositionAt( doc.getRoot().getChild( 0 ), 3 )
						)
					),
					resultRange: editor.model.createRange( editor.model.createPositionFromPath( doc.getRoot(), [ 0, 5 ] ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>newba[]r</paragraph>' );
				expect( buffer.size ).to.equal( 3 );
			} );

			it( 'should set selection according to passed resultRange (non-collapsed)', () => {
				setData( model, '<paragraph>foobar</paragraph>' );

				editor.execute( 'insertText', {
					text: 'new',
					selection: model.createSelection(
						model.createRange(
							// <paragraph>[foo]bar</paragraph>
							model.createPositionAt( doc.getRoot().getChild( 0 ), 0 ),
							model.createPositionAt( doc.getRoot().getChild( 0 ), 3 )
						)
					),
					resultRange: editor.model.createRange(
						editor.model.createPositionFromPath( doc.getRoot(), [ 0, 3 ] ),
						editor.model.createPositionFromPath( doc.getRoot(), [ 0, 6 ] )
					)
				} );

				expect( getData( model ) ).to.equal( '<paragraph>new[bar]</paragraph>' );
				expect( buffer.size ).to.equal( 3 );
			} );

			it( 'should only remove content when no text given (with default non-collapsed range)', () => {
				setData( model, '<paragraph>[fo]obar</paragraph>' );

				editor.execute( 'insertText' );

				expect( getData( model ) ).to.equal( '<paragraph>[]obar</paragraph>' );
				expect( buffer.size ).to.equal( 0 );
			} );

			it( 'should not change selection and content when no text given (with default collapsed range)', () => {
				setData( model, '<paragraph>fo[]obar</paragraph>' );

				editor.execute( 'insertText' );

				expect( getData( model ) ).to.equal( '<paragraph>fo[]obar</paragraph>' );
				expect( buffer.size ).to.equal( 0 );
			} );

			it( 'should not create insert delta when no text given', () => {
				setData( model, '<paragraph>foo[]bar</paragraph>' );

				const version = doc.version;

				editor.execute( 'insertText' );

				expect( doc.version ).to.equal( version );
			} );

			it( 'should handle multi-range selection', () => {
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

			it( 'should use typing batch while removing and inserting the content', () => {
				expect( insertTextCommand._batches.has( getCurrentBatch() ), 'batch before typing' ).to.equal( false );

				model.on( 'deleteContent', () => {
					expect( insertTextCommand._batches.has( getCurrentBatch() ), 'batch when deleting content' ).to.equal( true );
				}, { priority: 'highest' } );

				model.on( 'insertContent', () => {
					expect( insertTextCommand._batches.has( getCurrentBatch() ), 'batch when inserting content' ).to.equal( true );
				}, { priority: 'lowest' } );

				setData( model, '<paragraph>[foo]</paragraph>' );

				editor.execute( 'insertText', { text: 'bar' } );

				expect( getData( model ) ).to.equal( '<paragraph>bar[]</paragraph>' );

				function getCurrentBatch() {
					return editor.model.change( writer => writer.batch );
				}
			} );
		} );

		describe( 'destroy()', () => {
			it( 'should destroy the change buffer', () => {
				const command = editor.commands.get( 'insertText' );
				const destroy = command._buffer.destroy = testUtils.sinon.spy();

				command.destroy();

				expect( destroy.calledOnce ).to.be.true;
			} );
		} );
	} );
} );
