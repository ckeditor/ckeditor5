/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import MentionEditing from '../src/mentionediting';

describe( 'MentionEditing - integration', () => {
	let div, editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return ClassicTestEditor.create( div, { plugins: [ Paragraph, MentionEditing, UndoEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		div.remove();

		return editor.destroy();
	} );

	describe( 'undo', () => {
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
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
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
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
		} );
	} );
} );
