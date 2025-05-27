/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { parse as parseView, getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import MentionEditing from '../src/mentionediting.js';
import Mention from '../src/mention.js';
import MentionUI from '../src/mentionui.js';

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
				.create( div, { plugins: [ ClipboardPipeline, Paragraph, BlockQuote, MentionEditing, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;

					clipboard = editor.plugins.get( 'ClipboardPipeline' );
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
					plugins: [ Paragraph, Table, TableToolbar, Mention, ClipboardPipeline ],
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
					const model = editor.model;

					// Show link UI
					editor.execute( 'link', '@' );
					// The link is not being selected after inserting it. We need to put the selection manually. See #1016.
					model.change( writer => {
						writer.setSelection( writer.createRangeOn( model.document.getRoot().getChild( 0 ).getChild( 0 ) ) );
					} );

					editor.editing.view.document.fire( 'click', { domEvent: {} } );

					expect( panelView.isVisible ).to.be.true;
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

	describe( 'with table', () => {
		beforeEach( () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [ Paragraph, Table, Mention, ClipboardPipeline ],
					mention: {
						feeds: [
							{
								marker: '@',
								feed: [ '@Barney' ]
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'should not throw on backspace: selection after table containing 2 mentions in the last cell', () => {
			const viewDocument = editor.editing.view.document;

			// Insert table with 2 mentions in the last cell
			expect( () => {
				editor.setData(
					'<figure class="table"><table><tbody><tr><td>' +
						'<span class="mention" data-mention="@Barney">@Barney</span> ' +
						'<span class="mention" data-mention="@Barney">@Barney</span>' +
					'</td></tr></tbody></table></figure><p>&nbsp;</p>' );
			} ).not.to.throw();

			// Set selection after the table
			editor.model.change( writer => {
				const paragraph = editor.model.document.getRoot().getChild( 1 );

				writer.setSelection( paragraph, 0 );
			} );

			const deleteEvent = new DomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			expect( () => {
				viewDocument.fire( 'delete', deleteEvent );
			} ).not.to.throw();

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td>' +
					'<span class="mention" data-mention="@Barney">@Barney</span> ' +
					'<span class="mention" data-mention="@Barney">@Barney</span>' +
				'</td></tr></tbody></table></figure>'
			);
		} );
	} );
} );
