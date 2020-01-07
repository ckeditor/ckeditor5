/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Table from '../src/table';
import TableToolbar from '../src/tabletoolbar';
import View from '@ckeditor/ckeditor5-ui/src/view';

describe( 'TableContentToolbar integration', () => {
	describe( 'with the BalloonToolbar', () => {
		let balloon, balloonToolbar, newEditor, editorElement;

		beforeEach( () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Table, TableToolbar, BalloonToolbar, Paragraph ]
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
} );
