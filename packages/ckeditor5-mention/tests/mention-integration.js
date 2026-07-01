/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { Link } from '@ckeditor/ckeditor5-link';
import { Delete } from '@ckeditor/ckeditor5-typing';
import { ViewDocumentDomEventData, _parseView, _getViewData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { MentionEditing } from '../src/mentionediting.js';
import { Mention } from '../src/mention.js';
import { MentionUI } from '../src/mentionui.js';

describe( 'Mention feature - integration', () => {
	let div, editor, model, doc;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

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

		// Failing test. See https://github.com/ckeditor/ckeditor5/issues/1645.
		it( 'should restore removed mention on adding a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>' );

			expect( editor.getData() ).toBe(
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>'
			);

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 6 );

				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
			} );

			expect( editor.getData() ).toBe( '<p>foo @Jaohn bar</p>' );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe( '<p>foo @Jaohn bar</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).toBe(
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>'
			);
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.toBe( '<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>' );
		} );

		// Failing test. See https://github.com/ckeditor/ckeditor5/issues/1645.
		it( 'should restore removed mention on removing a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>' );

			expect( editor.getData() ).toBe(
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>'
			);

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 7 );

				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).toBe( '<p>foo @Jhn bar</p>' );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe( '<p>foo @Jhn bar</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).toBe(
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>'
			);
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.toBe( '<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>' );
		} );

		it( 'should work with attribute post-fixer (beginning formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>',
				'<p><strong>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span></strong> bar</p>',
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
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>',
				'<p>foo <strong><span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> ba</strong>r</p>',
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
				'<p>foo <span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> bar</p>',
				'<p>foo <strong><span class="mention" data-mention="@John" data-mention-uid="u1">@John</span></strong> bar</p>',
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

			expect( editor.getData() ).toBe( initialData );

			testCallback();

			expect( editor.getData() )
				.toBe( expectedData );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.toBe( expectedData );

			editor.execute( 'undo' );

			expect( editor.getData() ).toBe( initialData );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.toBe( initialData );

			editor.execute( 'redo' );

			expect( editor.getData() )
				.toBe( expectedData );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.toBe( expectedData );
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

		it( 'should generate new uid when pasting mention copied from the editor', () => {
			editor.setData( '<p><span class="mention" data-mention="@John" data-mention-uid="u1">@John</span> foobar</p>' );

			const originalUid = doc.getRoot().getChild( 0 ).getChild( 0 ).getAttribute( 'mention' ).uid;

			expect( originalUid ).toBe( 'u1' );

			// Select the mention and copy it.
			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( writer.createRange(
					writer.createPositionAt( paragraph, 0 ),
					writer.createPositionAt( paragraph, 5 )
				) );
			} );

			const dataTransferMock = { setData: vi.fn(), getData: vi.fn() };

			editor.editing.view.document.fire( 'copy', {
				dataTransfer: dataTransferMock,
				preventDefault: vi.fn()
			} );

			// The clipboard HTML should not contain data-mention-uid.
			const clipboardHtml = dataTransferMock.setData.mock.calls[ 0 ][ 1 ];

			expect( clipboardHtml ).not.toContain( 'data-mention-uid' );

			// Now paste at the end.
			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
			} );

			dataTransferMock.getData.mockImplementation( format => format === 'text/html' ? clipboardHtml : undefined );

			clipboard.fire( 'inputTransformation', {
				content: _parseView( clipboardHtml )
			} );

			// Find the pasted mention (last text node with mention attribute).
			const paragraph = doc.getRoot().getChild( 0 );
			let pastedMentionNode;

			for ( const child of paragraph.getChildren() ) {
				if ( child.hasAttribute && child.hasAttribute( 'mention' ) ) {
					pastedMentionNode = child;
				}
			}

			expect( pastedMentionNode ).not.toBeUndefined();
			expect( pastedMentionNode.getAttribute( 'mention' ) ).toHaveProperty( 'id', '@John' );
			expect( pastedMentionNode.getAttribute( 'mention' ).uid ).not.toBe( 'u1' );
		} );

		it( 'should not fix broken mention inside pasted content', () => {
			editor.setData( '<p>foobar</p>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 3 );
			} );

			clipboard.fire( 'inputTransformation', {
				content: _parseView(
					'<blockquote><p>xxx<span class="mention" data-mention="@John" data-mention-uid="u1">@Joh</span></p></blockquote>'
				)
			} );

			const expectedData = '<p>foo</p>' +
				'<blockquote><p>xxx<span class="mention" data-mention="@John" data-mention-uid="u1">@Joh</span></p></blockquote>' +
				'<p>bar</p>';

			expect( editor.getData() )
				.toBe( expectedData );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.toBe( expectedData );
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

			_setModelData( model, '<table><tableRow><tableCell><paragraph>foo []</paragraph></tableCell></tableRow></table>' );

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
					expect( panelView.isVisible ).toBe( true );
					expect( balloon.visibleView === mentionsView ).toBe( true );

					model.change( writer => {
						writer.setSelection( doc.getRoot().getNodeByPath( [ 0, 0, 0, 0 ] ), '1' );
					} );

					expect( panelView.isVisible ).toBe( true );
					expect( balloon.visibleView === mentionsView ).toBe( false );
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

			_setModelData( model, '<paragraph>[]</paragraph>' );

			const balloon = editor.plugins.get( 'ContextualBalloon' );
			const panelView = balloon.view;
			const mentionUI = editor.plugins.get( MentionUI );
			const mentionsView = mentionUI._mentionsView;

			return new Promise( resolve => setTimeout( resolve, 200 ) )
				.then( () => {
					const model = editor.model;

					// Show link UI
					editor.execute( 'link', '@' );
					// The link is not being selected after inserting it. We need to put the selection manually.
					// See https://github.com/ckeditor/ckeditor5/issues/1016.
					model.change( writer => {
						writer.setSelection( writer.createRangeOn( model.document.getRoot().getChild( 0 ).getChild( 0 ) ) );
					} );

					editor.editing.view.document.fire( 'click', { domEvent: {} } );

					expect( panelView.isVisible ).toBe( true );
					expect( balloon.visibleView === mentionsView ).toBe( false ); // LinkUI

					model.change( writer => {
						writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
					} );
				} )
				.then( () => new Promise( resolve => setTimeout( resolve, 200 ) ) )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( balloon.visibleView === mentionsView ).toBe( true );

					editor.execute( 'delete' );

					expect( panelView.isVisible ).toBe( false );
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
						'<span class="mention" data-mention="@Barney" data-mention-uid="u1">@Barney</span> ' +
						'<span class="mention" data-mention="@Barney" data-mention-uid="u2">@Barney</span>' +
					'</td></tr></tbody></table></figure><p>&nbsp;</p>' );
			} ).not.toThrow();

			// Set selection after the table
			editor.model.change( writer => {
				const paragraph = editor.model.document.getRoot().getChild( 1 );

				writer.setSelection( paragraph, 0 );
			} );

			const deleteEvent = new ViewDocumentDomEventData(
				viewDocument,
				{ preventDefault: vi.fn() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			expect( () => {
				viewDocument.fire( 'delete', deleteEvent );
			} ).not.toThrow();

			expect( editor.getData() ).toBe(
				'<figure class="table"><table><tbody><tr><td>' +
					'<span class="mention" data-mention="@Barney" data-mention-uid="u1">@Barney</span> ' +
					'<span class="mention" data-mention="@Barney" data-mention-uid="u2">@Barney</span>' +
				'</td></tr></tbody></table></figure>'
			);
		} );
	} );
} );
