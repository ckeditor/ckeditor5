/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TableWidgetToolbar from '../src/tablewidgettoolbar';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'TableWidgetToolbar', () => {
	let editor, element, widgetToolbar, balloon, toolbar, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Table, TableWidgetToolbar, FakeButton ],
			table: {
				widgetToolbar: [ 'fake_button' ]
			}
		} ).then( _editor => {
			editor = _editor;
			widgetToolbar = editor.plugins.get( 'WidgetToolbar' );
			toolbar = widgetToolbar._toolbars.get( 'tableWidget' ).view;
			balloon = editor.plugins.get( 'ContextualBalloon' );
			model = editor.model;
		} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => element.remove() );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TableWidgetToolbar ) ).to.be.instanceOf( TableWidgetToolbar );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.table.tableWidget to create items', () => {
			expect( toolbar.items ).to.have.length( 1 );
			expect( toolbar.items.get( 0 ).label ).to.equal( 'fake button' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = sinon.spy( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<table><tableRow><tableCell></tableCell></tableRow></table>]' );

			sinon.assert.calledWithMatch( spy, {
				view: toolbar,
				balloonClassName: 'ck-toolbar-container'
			} );
		} );
	} );

	describe( 'integration with the editor focus', () => {
		it( 'should show the toolbar when the editor gains focus and the table is selected', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<table><tableRow><tableCell></tableCell></tableRow></table>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the table is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( model, '[<table><tableRow><tableCell></tableCell></tableRow></table>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

	describe( 'integration with the editor selection', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should show the toolbar on ui#update when the table widget is selected', () => {
			setData( editor.model, '<paragraph>[foo]</paragraph><table><tableRow><tableCell></tableCell></tableRow></table>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			editor.model.change( writer => {
				// Select the [<table></table>]
				writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' );
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not show the toolbar on ui#update when the selection is inside a table cell', () => {
			setData( editor.model, '<table><tableRow><tableCell>[]</tableCell></tableRow></table>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( model, '<table><tableRow><tableCell></tableCell></tableRow></table>' );

			expect( balloon.visibleView ).to.equal( toolbar );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).to.equal( lastView );

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.equal( lastView );
		} );

		it( 'should hide the toolbar on ui#update if the table is de–selected', () => {
			setData( model, '<paragraph>foo</paragraph>[<table><tableRow><tableCell></tableCell></tableRow></table>]' );
			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

	// Plugin that adds fake_button to editor's component factory.
	class FakeButton extends Plugin {
		init() {
			this.editor.ui.componentFactory.add( 'fake_button', locale => {
				const view = new ButtonView( locale );

				view.set( {
					label: 'fake button'
				} );

				return view;
			} );
		}
	}
} );
