/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import RestrictedEditingEditing from './../src/restrictededitingediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'RestrictedEditingEditing', () => {
	let editor;

	testUtils.createSinonSandbox();

	describe( 'plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ RestrictedEditingEditing ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should be named', () => {
			expect( RestrictedEditingEditing.pluginName ).to.equal( 'RestrictedEditingEditing' );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditingEditing ) ).to.be.instanceOf( RestrictedEditingEditing );
		} );
	} );

	describe( 'conversion', () => {
		let model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, RestrictedEditingEditing ] } );
			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'upcast', () => {
			it( 'should convert <span class="ck-restricted-editing-exception"> to marker', () => {
				editor.setData( '<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>' );

				expect( model.markers.has( 'restricted-editing-exception:1' ) ).to.be.true;

				const marker = model.markers.get( 'restricted-editing-exception:1' );

				expect( marker.getStart().path ).to.deep.equal( [ 0, 4 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 7 ] );
			} );

			it( 'should convert multiple <span class="ck-restricted-editing-exception">', () => {
				editor.setData(
					'<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>' +
					'<p>ABCDEF<span class="ck-restricted-editing-exception">GHIJK</span>LMNOPQRST</p>'
				);

				expect( model.markers.has( 'restricted-editing-exception:1' ) ).to.be.true;
				expect( model.markers.has( 'restricted-editing-exception:2' ) ).to.be.true;

				// Data for the first marker is the same as in previous tests so no need to test it again.
				const secondMarker = model.markers.get( 'restricted-editing-exception:2' );

				expect( secondMarker.getStart().path ).to.deep.equal( [ 1, 6 ] );
				expect( secondMarker.getEnd().path ).to.deep.equal( [ 1, 11 ] );
			} );

			it( 'should not convert other <span> elements', () => {
				editor.setData( '<p>foo <span class="foo bar">bar</span> baz</p>' );

				expect( model.markers.has( 'restricted-editing-exception:1' ) ).to.be.false;
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert model marker to <span>', () => {
				setModelData( model, '<paragraph>foo bar baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restricted-editing-exception:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const expectedView = '<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>';
				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'converted <span> should be the outermost attribute element', () => {
				editor.conversion.for( 'downcast' ).attributeToElement( { model: 'bold', view: 'b' } );
				setModelData( model, '<paragraph><$text bold="true">foo bar baz</$text></paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restricted-editing-exception:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 0 ), writer.createPositionAt( paragraph, 'end' ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const expectedView = '<p><span class="ck-restricted-editing-exception"><b>foo bar baz</b></span></p>';
				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );
	} );

	describe( 'editing behavior', () => {
		let model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingEditing ] } );
			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should keep markers in the view when editable region is edited', () => {
			setModelData( model,
				'<paragraph>foo bar baz</paragraph>' +
				'<paragraph>xxx y[]yy zzz</paragraph>'
			);

			const firstParagraph = model.document.getRoot().getChild( 0 );
			const secondParagraph = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.addMarker( 'restricted-editing-exception:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
				writer.addMarker( 'restricted-editing-exception:2', {
					range: writer.createRange(
						writer.createPositionAt( secondParagraph, 4 ),
						writer.createPositionAt( secondParagraph, 7 )
					),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				model.insertContent( writer.createText( 'R', model.document.selection.getAttributes() ) );
			} );

			const expectedView = '<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>' +
				'<p>xxx <span class="ck-restricted-editing-exception">yRyy</span> zzz</p>';

			expect( editor.getData() ).to.equal( expectedView );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
		} );

		it( 'should block user typing outside exception markers', () => {
			setModelData( model, '<paragraph>foo []bar baz</paragraph>' );

			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo []bar baz</paragraph>' );
		} );

		it( 'should not block user typing inside exception marker', () => {
			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			const firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restricted-editing-exception:1', {
					range: writer.createRange( writer.createPositionAt( firstParagraph, 4 ), writer.createPositionAt( firstParagraph, 7 ) ),
					usingOperation: true,
					affectsData: true
				} );
			} );

			model.change( writer => {
				writer.setSelection( firstParagraph, 5 );
			} );
			editor.execute( 'input', { text: 'X' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foo bX[]ar baz</paragraph>' );
		} );
	} );

	describe( 'commands behavior', () => {
		let model, firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, RestrictedEditingEditing ] } );
			model = editor.model;

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restricted-editing-exception:1', {
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

		const commandsEnabledOnWholeRange = [
			'input', 'bold', 'link', 'italic'
		];

		for ( const commandName of commandsEnabledOnWholeRange ) {
			describe( commandName, () => {
				beforeEach( () => {
					editor.commands.add( commandName, buildFakeCommand( editor ) );

					model.change( writer => {
						writer.setSelection( firstParagraph, 'end' );
					} );
				} );

				it( 'should be disabled when caret is outside exception marker', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 1 );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled when caret is inside exception marker (not touching boundaries)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 5 );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled when caret is inside exception marker (start boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 4 );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled when caret is inside exception marker (end boundary)', () => {
					model.change( writer => {
						writer.setSelection( firstParagraph, 7 );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
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

					expect( editor.commands.get( commandName ).isEnabled ).to.be.false;
				} );

				it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 0 ),
							writer.createPositionAt( firstParagraph, 5 )
						) );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.false;
				} );

				it( 'should be enabled for non-collapsed selection that is fully contained inside exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 6 )
						) );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 5 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
				} );

				it( 'should be enabled for non-collapsed selection is equal to exception marker', () => {
					model.change( writer => {
						writer.setSelection( writer.createRange(
							writer.createPositionAt( firstParagraph, 4 ),
							writer.createPositionAt( firstParagraph, 7 )
						) );
					} );

					expect( editor.commands.get( commandName ).isEnabled ).to.be.true;
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

					expect( editor.commands.get( commandName ).isEnabled ).to.be.false;
				} );
			} );
		}

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

		describe( 'forwardDelete', () => {
			beforeEach( () => {
				editor.commands.add( 'forwardDelete', buildFakeCommand( editor ) );

				model.change( writer => {
					writer.setSelection( firstParagraph, 'end' );
				} );
			} );

			it( 'should be disabled when caret is outside exception marker', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 1 );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.false;
			} );

			it( 'should be enabled when caret is inside exception marker (not touching boundaries)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 5 );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.true;
			} );

			it( 'should be enabled when caret is inside exception marker (start boundary)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 4 );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.true;
			} );

			it( 'should be disabled when caret is inside exception marker (end boundary)', () => {
				model.change( writer => {
					writer.setSelection( firstParagraph, 7 );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.false;
			} );

			it( 'should be disabled for non-collapsed selection that expands over exception marker', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 0 ),
						writer.createPositionAt( firstParagraph, 5 )
					) );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.false;
			} );

			it( 'should be enabled for non-collapsed selection that is fully contained inside exception marker', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 5 ),
						writer.createPositionAt( firstParagraph, 6 )
					) );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.true;
			} );

			it( 'should be enabled for non-collapsed selection inside exception marker (start position on marker boundary)', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 6 )
					) );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.true;
			} );

			it( 'should be enabled for non-collapsed selection inside exception marker (end position on marker boundary)', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 5 ),
						writer.createPositionAt( firstParagraph, 7 )
					) );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.true;
			} );

			it( 'should be enabled for non-collapsed selection is equal to exception marker', () => {
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( firstParagraph, 4 ),
						writer.createPositionAt( firstParagraph, 7 )
					) );
				} );

				expect( editor.commands.get( 'forwardDelete' ).isEnabled ).to.be.true;
			} );
		} );

		describe( 'other', () => {
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

	describe( 'commands integration', () => {
		let model, firstParagraph;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, Typing, UndoEditing, RestrictedEditingEditing ] } );
			model = editor.model;

			setModelData( model, '<paragraph>[]foo bar baz</paragraph>' );
			firstParagraph = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.addMarker( 'restricted-editing-exception:1', {
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
