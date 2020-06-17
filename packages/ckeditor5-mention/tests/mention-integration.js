/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, setTimeout */

import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { parse as parseView, getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import MentionEditing from '../src/mentionediting';
import Mention from '../src/mention';
import MentionUI from '../src/mentionui';

describe( 'Mention feature - integration', () => {
	let div, editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );
	} );

	afterEach( () => {
		div.remove();

		return editor.destroy();
	} );

	describe( 'with undo', () => {
		beforeEach( () => {
			return ClassicTestEditor.create( div, { plugins: [ Paragraph, MentionEditing, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;

					model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
					editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );
				} );
		} );

		// Failing test. See ckeditor/ckeditor5#1645.
		it( 'should restore removed mention on adding a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 6 );

				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jaohn bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo @Jaohn bar</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );
		} );

		// Failing test. See ckeditor/ckeditor5#1645.
		it( 'should restore removed mention on removing a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 7 );

				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jhn bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo @Jhn bar</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>' );
		} );

		it( 'should work with attribute post-fixer (beginning formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>',
				'<p><strong>foo <span class="mention" data-mention="@John">@John</span></strong> bar</p>',
				() => {
					model.change( writer => {
						const paragraph = doc.getRoot().getChild( 0 );
						const start = writer.createPositionAt( paragraph, 0 );
						const range = writer.createRange( start, start.getShiftedBy( 6 ) );

						writer.setSelection( range );

						writer.setAttribute( 'bold', true, range );
					} );
				} );
		} );

		it( 'should work with attribute post-fixer (end formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>',
				'<p>foo <strong><span class="mention" data-mention="@John">@John</span> ba</strong>r</p>',
				() => {
					model.change( writer => {
						const paragraph = doc.getRoot().getChild( 0 );
						const start = writer.createPositionAt( paragraph, 6 );
						const range = writer.createRange( start, start.getShiftedBy( 6 ) );

						writer.setSelection( range );

						writer.setAttribute( 'bold', true, range );
					} );
				} );
		} );

		it( 'should work with attribute post-fixer (middle formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="@John">@John</span> bar</p>',
				'<p>foo <strong><span class="mention" data-mention="@John">@John</span></strong> bar</p>',
				() => {
					model.change( writer => {
						const paragraph = doc.getRoot().getChild( 0 );
						const start = writer.createPositionAt( paragraph, 6 );
						const range = writer.createRange( start, start.getShiftedBy( 1 ) );

						writer.setSelection( range );

						writer.setAttribute( 'bold', true, range );
					} );
				} );
		} );

		function testAttributePostFixer( initialData, expectedData, testCallback ) {
			editor.setData( initialData );

			expect( editor.getData() ).to.equal( initialData );

			testCallback();

			expect( editor.getData() )
				.to.equal( expectedData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( expectedData );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( initialData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( initialData );

			editor.execute( 'redo' );

			expect( editor.getData() )
				.to.equal( expectedData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( expectedData );
		}
	} );

	describe( 'with clipboard', () => {
		let clipboard;

		beforeEach( () => {
			return ClassicTestEditor
				.create( div, { plugins: [ Clipboard, Paragraph, BlockQuote, MentionEditing, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;

					clipboard = editor.plugins.get( 'Clipboard' );
				} );
		} );

		it( 'should not fix broken mention inside pasted content', () => {
			editor.setData( '<p>foobar</p>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 3 );
			} );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<blockquote><p>xxx<span class="mention" data-mention="@John">@Joh</span></p></blockquote>' )
			} );

			const expectedData = '<p>foo</p>' +
				'<blockquote><p>xxx<span class="mention" data-mention="@John">@Joh</span></p></blockquote>' +
				'<p>bar</p>';

			expect( editor.getData() )
				.to.equal( expectedData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( expectedData );
		} );
	} );

	describe( 'with table toolbar', () => {
		beforeEach( () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [ Paragraph, Table, TableToolbar, Mention ],
					table: {
						contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
					},
					mention: {
						feeds: [
							{
								marker: '@',
								feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should work with table toolbar', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '<table><tableRow><tableCell><paragraph>foo []</paragraph></tableCell></tableRow></table>' );

			const balloon = editor.plugins.get( 'ContextualBalloon' );
			const panelView = balloon.view;
			const mentionUI = editor.plugins.get( MentionUI );
			const mentionsView = mentionUI._mentionsView;

			return new Promise( resolve => setTimeout( resolve, 200 ) )
				.then( () => {
					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( () => new Promise( resolve => setTimeout( resolve, 200 ) ) )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( balloon.visibleView === mentionsView ).to.be.true;

					model.change( writer => {
						writer.setSelection( doc.getRoot().getNodeByPath( [ 0, 0, 0, 0 ] ), '1' );
					} );

					expect( panelView.isVisible ).to.be.true;
					expect( balloon.visibleView === mentionsView ).to.be.false;
				} );
		} );
	} );

	describe( 'with link toolbar', () => {
		beforeEach( () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [ Paragraph, Link, Delete, Mention ],
					mention: {
						feeds: [
							{
								marker: '@',
								feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should work with link toolbar', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '<paragraph>[]</paragraph>' );

			const balloon = editor.plugins.get( 'ContextualBalloon' );
			const panelView = balloon.view;
			const mentionUI = editor.plugins.get( MentionUI );
			const mentionsView = mentionUI._mentionsView;

			return new Promise( resolve => setTimeout( resolve, 200 ) )
				.then( () => {
					// Show link UI
					editor.execute( 'link', '@' );
					editor.editing.view.document.fire( 'click' );

					// The selection is after the link node.
					expect( panelView.isVisible ).to.be.false;
					expect( balloon.visibleView === mentionsView ).to.be.false; // LinkUI

					model.change( writer => {
						writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
					} );
				} )
				.then( () => new Promise( resolve => setTimeout( resolve, 200 ) ) )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( balloon.visibleView === mentionsView ).to.be.true;

					editor.execute( 'delete' );

					expect( panelView.isVisible ).to.be.false;
				} );
		} );
	} );
} );
