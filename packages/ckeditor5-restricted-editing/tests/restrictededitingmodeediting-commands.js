/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Command from '@ckeditor/ckeditor5-core/src/command.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';

describe( 'RestrictedEditingEditing - commands', () => {
	let editor;

	testUtils.createSinonSandbox();

	describe( 'commands toggling', () => {
		let model, firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ] } );
			model = editor.model;

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'always enabled commands', () => {
			describe( 'undo', () => {
				beforeEach( () => {
					editor.commands.add( 'undo', buildFakeCommand( editor ) );
				} );

				it( 'should be enabled outside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( 'undo' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled inside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'undo' ).isEnabled ).to.be.true;
				} );
			} );

			describe( 'redo', () => {
				beforeEach( () => {
					editor.commands.add( 'redo', buildFakeCommand( editor ) );
				} );

				it( 'should be enabled outside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( 'redo' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled inside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'redo' ).isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'commands enabled in exception marker', () => {
			describe( 'input', () => {
				beforeEach( () => {
					editor.commands.add( 'input', buildFakeCommand( editor ) );

					model.change( writer => {
						writer.setSelection( firstParagraph, 'end' );
					} );
				} );

				it( 'should be disabled when caret is outside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled when caret is inside exception marker (not touching boundaries)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be disabled when caret is inside other marker', () => {
					model.change( writer => {
						writer.addMarker( 'foo-bar:1', {
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 0 ),
								writer.createPositionAt( firstParagraph, 3 ) ),
							usingOperation: true,
							affectsData: true
						} );

						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled when caret is inside exception marker (start boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 4 );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled when caret is inside exception marker (end boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 7 );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be disabled for multi-range selection (collapsed ranges)', () => {
					model.change( writer => {
						writer.setSelection( [
							writer.createRange(
								writer.createPositionAt( firstParagraph, 5 )
							),
							writer.createRange(
								writer.createPositionAt( firstParagraph, 9 )
							)
						] );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.false;
				} );

				it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 0 ),
							writer.createPositionAt( firstParagraph, 5 )
						) );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled for non-collapsed selection that is fully contained inside exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection is equal to exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.true;
				} );

				it( 'should be disabled for non-collapsed selection with more then one range', () => {
					model.change( writer => {
						writer.setSelection( [
							writer.createRange(
								writer.createPositionAt( firstParagraph, 5 ),
								writer.createPositionAt( firstParagraph, 6 )
							),
							writer.createRange(
								writer.createPositionAt( firstParagraph, 8 ),
								writer.createPositionAt( firstParagraph, 9 )
							)
						] );
					} );

					expect( editor.commands.get( 'input' ).isEnabled ).to.be.false;
				} );
			} );

			describe( 'delete', () => {
				beforeEach( () => {
					editor.commands.add( 'delete', buildFakeCommand( editor ) );

					model.change( writer => {
						writer.setSelection( firstParagraph, 'end' );
					} );
				} );

				it( 'should be disabled when caret is outside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled when caret is inside exception marker (not touching boundaries)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
				} );

				it( 'should be disabled when caret is inside exception marker (start boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 4 );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.false;
				} );

				it( 'should be disabled when caret moves to start boundary and it was enabled previously', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;

					model.change( writer => {
						writer.setSelection( firstParagraph, 4 );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled when caret is inside exception marker (end boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 7 );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
				} );

				it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 0 ),
							writer.createPositionAt( firstParagraph, 5 )
						) );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled for non-collapsed selection that is fully contained inside exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection is equal to exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
				} );
			} );

			describe( 'deleteForward', () => {
				beforeEach( () => {
					editor.commands.add( 'deleteForward', buildFakeCommand( editor ) );

					model.change( writer => {
						writer.setSelection( firstParagraph, 'end' );
					} );
				} );

				it( 'should be disabled when caret is outside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled when caret is inside exception marker (not touching boundaries)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled when caret is inside exception marker (start boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 4 );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;
				} );

				it( 'should be disabled when caret is inside exception marker (end boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 7 );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.false;
				} );

				it( 'should be disabled when caret moves to end boundary and it was enabled previously', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;

					model.change( writer => {
						writer.setSelection( firstParagraph, 7 );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.false;
				} );

				it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 0 ),
							writer.createPositionAt( firstParagraph, 5 )
						) );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled for non-collapsed selection that is fully contained inside exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection is equal to exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( 'deleteForward' ).isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'non-enabled commands', () => {
			beforeEach( () => {
				editor.commands.add( 'other', buildFakeCommand( editor ) );

				model.change( writer => {
					writer.setSelection( firstParagraph, 'end' );
				} );
			} );

			it( 'should be disabled outside exception marker', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 1 );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled inside exception marker', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 1 );
				} );
				model.change( writer => {
					writer.setSelection( firstParagraph, 5 );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled when caret is inside exception marker (not touching boundaries)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 5 );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled when caret is inside exception marker (start boundary)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 4 );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled when caret is inside exception marker (end boundary)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 7 );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 0 ),
						writer.createPositionAt( firstParagraph, 5 )
					) );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled for non-collapsed selection that is fully contained inside exception marker', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 5 ),
						writer.createPositionAt( firstParagraph, 6 )
					) );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 6 )
					) );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 5 ),
						writer.createPositionAt( firstParagraph, 7 )
					) );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled for non-collapsed selection is equal to exception marker', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 7 )
					) );
				} );

				expect( editor.commands.get( 'other' ).isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'commands enabled in exception marker by configuration', () => {
		let model, firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, Typing, RestrictedEditingModeEditing, ClipboardPipeline ],
				restrictedEditing: {
					allowedCommands: [ 'allowed' ]
				}
			} );
			model = editor.model;
			editor.commands.add( 'allowed', buildFakeCommand( editor ) );

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );

				writer.setSelection( firstParagraph, 'end' );
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should be disabled when caret is outside exception marker', () => {
			model.change( writer => {
				writer.setSelection( firstParagraph, 1 );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.false;
		} );

		it( 'should be enabled when caret is inside exception marker (not touching boundaries)', () => {
			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be disabled when caret is inside other marker', () => {
			model.change( writer => {
				writer.addMarker( 'foo-bar:1', {
					range: writer.createRange(
						writer.createPositionAt( firstParagraph, 0 ),
						writer.createPositionAt( firstParagraph, 3 ) ),
					usingOperation: true,
					affectsData: true
				} );

				writer.setSelection( firstParagraph, 1 );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.false;
		} );

		it( 'should be enabled when caret is inside exception marker (start boundary)', () => {
			model.change( writer => {
				writer.setSelection( firstParagraph, 4 );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be enabled when caret is inside exception marker (end boundary)', () => {
			model.change( writer => {
				writer.setSelection( firstParagraph, 7 );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be disabled for multi-range selection (collapsed ranges)', () => {
			model.change( writer => {
				writer.setSelection( [
					writer.createRange(
						writer.createPositionAt( firstParagraph, 5 )
					),
					writer.createRange(
						writer.createPositionAt( firstParagraph, 9 )
					)
				] );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.false;
		} );

		it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 0 ),
					writer.createPositionAt( firstParagraph, 5 )
				) );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.false;
		} );

		it( 'should be enabled for non-collapsed selection that is fully contained inside exception marker', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 5 ),
					writer.createPositionAt( firstParagraph, 6 )
				) );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be enabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 4 ),
					writer.createPositionAt( firstParagraph, 6 )
				) );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be enabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 5 ),
					writer.createPositionAt( firstParagraph, 7 )
				) );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be enabled for non-collapsed selection is equal to exception marker', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 4 ),
					writer.createPositionAt( firstParagraph, 7 )
				) );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.true;
		} );

		it( 'should be disabled for non-collapsed selection with more then one range', () => {
			model.change( writer => {
				writer.setSelection( [
					writer.createRange(
						writer.createPositionAt( firstParagraph, 5 ),
						writer.createPositionAt( firstParagraph, 6 )
					),
					writer.createRange(
						writer.createPositionAt( firstParagraph, 8 ),
						writer.createPositionAt( firstParagraph, 9 )
					)
				] );
			} );

			expect( editor.commands.get( 'allowed' ).isEnabled ).to.be.false;
		} );
	} );

	describe( 'integration', () => {
		let model, firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, Typing, UndoEditing, RestrictedEditingModeEditing, ClipboardPipeline ]
			} );
			model = editor.model;

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restrictedEditingException:1', {
					range: writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'delete + undo', () => {
			it( 'should be enabled after data change (no selection change event on undo)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 7 );
				} );

				editor.execute( 'delete' );
				editor.execute( 'undo' );

				expect( editor.commands.get( 'delete' ).isEnabled ).to.be.true;
			} );
		} );
	} );

	class FakeCommand extends Command {
		refresh() {
			this.isEnabled = true;
		}
	}

	function buildFakeCommand( editor ) {
		return new FakeCommand( editor );
	}
} );
