/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import EmptyBlock from '@ckeditor/ckeditor5-html-support/src/emptyblock.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Table from '../src/table.js';
import TableToolbar from '../src/tabletoolbar.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';

describe( 'TableContentToolbar integration', () => {
	describe( 'with the BalloonToolbar', () => {
		let balloon, balloonToolbar, newEditor, editorElement;

		beforeEach( () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Table, TableToolbar, BalloonToolbar, Paragraph, ClipboardPipeline ]
				} )
				.then( editor => {
					newEditor = editor;
					balloon = newEditor.plugins.get( 'ContextualBalloon' );
					balloonToolbar = newEditor.plugins.get( 'BalloonToolbar' );
					const button = new View();

					button.element = global.document.createElement( 'div' );

					// There must be at least one toolbar items which is not disabled to show it.
					// https://github.com/ckeditor/ckeditor5-ui/issues/269
					balloonToolbar.toolbarView.items.add( button );

					newEditor.editing.view.isFocused = true;
					newEditor.editing.view.getDomRoot().focus();
				} );
		} );

		afterEach( () => {
			editorElement.remove();
			return newEditor.destroy();
		} );

		it( 'should allow the BalloonToolbar to be displayed when a table is selected with surrounding text', () => {
			setModelData( newEditor.model, '<paragraph>fo[o</paragraph><table><tableRow><tableCell></tableCell></tableRow></table>]' );

			balloonToolbar.show();

			expect( balloon.visibleView ).to.equal( balloonToolbar.toolbarView );
		} );

		it( 'should allow the BalloonToolbar to be displayed when a table content is selected', () => {
			setModelData(
				newEditor.model,
				'<paragraph>foo</paragraph><table><tableRow><tableCell><paragraph>x[y]z</paragraph></tableCell></tableRow></table>'
			);

			balloonToolbar.show();

			expect( balloon.visibleView ).to.equal( balloonToolbar.toolbarView );
		} );

		it( 'should prevent the BalloonToolbar from being displayed when a table is selected as whole', () => {
			setModelData(
				newEditor.model,
				'<paragraph>foo</paragraph>[<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>]'
			);

			balloonToolbar.show();

			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should listen to BalloonToolbar#show event with the high priority', () => {
			const highestPrioritySpy = sinon.spy();
			const highPrioritySpy = sinon.spy();
			const normalPrioritySpy = sinon.spy();

			// Select an table
			setModelData(
				newEditor.model,
				'<paragraph>foo</paragraph>[<table><tableRow><tableCell><paragraph>x</paragraph></tableCell></tableRow></table>]'
			);

			newEditor.listenTo( balloonToolbar, 'show', highestPrioritySpy, { priority: 'highest' } );
			newEditor.listenTo( balloonToolbar, 'show', highPrioritySpy, { priority: 'high' } );
			newEditor.listenTo( balloonToolbar, 'show', normalPrioritySpy, { priority: 'normal' } );

			balloonToolbar.show();

			sinon.assert.calledOnce( highestPrioritySpy );
			sinon.assert.notCalled( highPrioritySpy );
			sinon.assert.notCalled( normalPrioritySpy );
		} );
	} );

	describe( 'with the EmptyBlock', () => {
		let editor, editorElement;

		beforeEach( async () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ Table, Paragraph, Heading, EmptyBlock ]
			} );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'plain content in table cell', () => {
			editor.setData(
				'<table>' +
					'<tr>' +
						'<td>x</td>' +
					'</tr>' +
					'<tr>' +
						'<td>&nbsp;</td>' +
					'</tr>' +
					'<tr>' +
						'<td></td>' +
					'</tr>' +
				'</table>'
			);

			expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>x</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell htmlEmptyBlock="true">' +
							'<paragraph htmlEmptyBlock="true"></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>x</td>' +
							'</tr>' +
							'<tr>' +
								'<td>&nbsp;</td>' +
							'</tr>' +
							'<tr>' +
								'<td></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		it( 'content in paragraph in a table cell', () => {
			editor.setData(
				'<table>' +
					'<tr>' +
						'<td><p>x</p></td>' +
					'</tr>' +
					'<tr>' +
						'<td><p>&nbsp;</p></td>' +
					'</tr>' +
					'<tr>' +
						'<td><p></p></td>' +
					'</tr>' +
				'</table>'
			);

			expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>x</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph htmlEmptyBlock="true"></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>x</td>' +
							'</tr>' +
							'<tr>' +
								'<td>&nbsp;</td>' +
							'</tr>' +
							'<tr>' +
								'<td></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		it( 'content in heading in a table cell', () => {
			editor.setData(
				'<table>' +
					'<tr>' +
						'<td><h2>x</h2></td>' +
					'</tr>' +
					'<tr>' +
						'<td><h2>&nbsp;</h2></td>' +
					'</tr>' +
					'<tr>' +
						'<td><h2></h2></td>' +
					'</tr>' +
				'</table>'
			);

			expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<heading1>x</heading1>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<heading1></heading1>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<heading1 htmlEmptyBlock="true"></heading1>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td><h2>x</h2></td>' +
							'</tr>' +
							'<tr>' +
								'<td><h2>&nbsp;</h2></td>' +
							'</tr>' +
							'<tr>' +
								'<td><h2></h2></td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );
	} );
} );
