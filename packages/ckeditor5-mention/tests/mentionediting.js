/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import MentionEditing from '../src/mentionediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import MentionCommand from '../src/mentioncommand';

describe( 'MentionEditing', () => {
	testUtils.createSinonSandbox();
	let editor, model, doc;

	testUtils.createSinonSandbox();

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( MentionEditing.pluginName ).to.equal( 'MentionEditing' );
	} );

	it( 'should be loaded', () => {
		return createTestEditor()
			.then( newEditor => {
				expect( newEditor.plugins.get( MentionEditing ) ).to.be.instanceOf( MentionEditing );
			} );
	} );

	it( 'should set proper schema rules', () => {
		return createTestEditor()
			.then( newEditor => {
				model = newEditor.model;

				expect( model.schema.checkAttribute( [ '$root', '$text' ], 'mention' ) ).to.be.true;

				expect( model.schema.checkAttribute( [ '$block', '$text' ], 'mention' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'mention' ) ).to.be.true;

				expect( model.schema.checkAttribute( [ '$block' ], 'mention' ) ).to.be.false;
			} );
	} );

	it( 'should register mention command', () => {
		return createTestEditor()
			.then( newEditor => {
				const command = newEditor.commands.get( 'mention' );

				expect( command ).to.be.instanceof( MentionCommand );
			} );
	} );

	describe( 'conversion in the data pipeline', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should convert <span class="mention" data-mention="John"> to mention attribute', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_id' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'name', 'John' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
		} );

		it( 'should convert consecutive mentions spans as two text nodes and two spans in the view', () => {
			editor.setData(
				'<p>' +
					'<span class="mention" data-mention="John">@John</span>' +
					'<span class="mention" data-mention="John">@John</span>' +
				'</p>'
			);

			// getModelData() merges text blocks with "same" attributes:
			// So expected: <$text mention="{"name":"John"}">@John</$text><$text mention="{"name":"John"}">@John</$text>'
			// Is returned as: <$text mention="{"name":"John"}">@John@John</$text>'
			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.childCount ).to.equal( 2 );

			assertTextNode( paragraph.getChild( 0 ) );
			assertTextNode( paragraph.getChild( 1 ) );

			const firstMentionId = paragraph.getChild( 0 ).getAttribute( 'mention' )._id;
			const secondMentionId = paragraph.getChild( 1 ).getAttribute( 'mention' )._id;

			expect( firstMentionId ).to.not.equal( secondMentionId );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span class="mention" data-mention="John">@John</span>' +
					'<span class="mention" data-mention="John">@John</span>' +
				'</p>'
			);

			function assertTextNode( textNode ) {
				expect( textNode ).to.not.be.null;
				expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
				expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_id' );
				expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'name', 'John' );
			}
		} );

		it( 'should not convert partial mentions', () => {
			editor.setData( '<p><span class="mention" data-mention="John">@Jo</span></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>@Jo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>@Jo</p>' );
		} );
	} );

	describe( 'selection post fixer', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should remove mention attribute from a selection if selection is on right side of a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span>bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 9 );
			} );

			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should allow to type after a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span>bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 9 );

				writer.insertText( ' ', paragraph, 9 );
			} );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
		} );
	} );

	describe( 'removing partial mention post fixer', () => {
		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should remove mention on adding a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			const textNode = doc.getRoot().getChild( 0 ).getChild( 1 );

			expect( textNode ).to.not.be.null;
			expect( textNode.hasAttribute( 'mention' ) ).to.be.true;
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( '_id' );
			expect( textNode.getAttribute( 'mention' ) ).to.have.property( 'name', 'John' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 6 );

				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
			} );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo @Jaohn bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo @Jaohn bar</p>' );
		} );

		it( 'should remove mention on removing a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setSelection( paragraph, 6 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @ohn bar</p>' );
		} );

		it( 'should remove mention on removing a text at the and of a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			// Set selection at the end of a John.
			model.change( writer => {
				writer.setSelection( paragraph, 9 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Joh bar</p>' );
		} );

		it( 'should not remove mention on removing a text just after a mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			// Set selection before bar.
			model.change( writer => {
				writer.setSelection( paragraph, 10 );
			} );

			model.enqueueChange( () => {
				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span>bar</p>' );
		} );
	} );

	describe( 'integration', () => {
		describe( 'undo', () => {
			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, MentionEditing, UndoEditing ]
					} ).then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
					} );
			} );

			// Failing test. See ckeditor/ckeditor5#1645.
			it( 'should restore removed mention on adding a text inside mention', () => {
				editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

				expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

				model.change( writer => {
					const paragraph = doc.getRoot().getChild( 0 );

					writer.setSelection( paragraph, 6 );

					writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
				} );

				expect( editor.getData() ).to.equal( '<p>foo @Jaohn bar</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo @Jaohn bar</p>' );

				editor.execute( 'undo' );

				expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
				expect( getViewData( editor.editing.view ) )
					.to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
			} );

			// Failing test. See ckeditor/ckeditor5#1645.
			it( 'should restore removed mention on removing a text inside mention', () => {
				editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

				expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

				model.change( writer => {
					const paragraph = doc.getRoot().getChild( 0 );

					writer.setSelection( paragraph, 7 );

					model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
					model.deleteContent( doc.selection );
				} );

				expect( editor.getData() ).to.equal( '<p>foo @Jhn bar</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo @Jhn bar</p>' );

				editor.execute( 'undo' );

				expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
				expect( getViewData( editor.editing.view ) )
					.to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
			} );
		} );
	} );

	function createTestEditor( mentionConfig ) {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, MentionEditing ],
				mention: mentionConfig
			} );
	}
} );
