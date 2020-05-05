/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import TableToolbar from '../src/tabletoolbar';
import Table from '../src/table';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';

describe( 'TableToolbar', () => {
	testUtils.createSinonSandbox();

	describe( 'contentToolbar', () => {
		let editor, model, doc, widgetToolbarRepository, toolbar, balloon, editorElement;

		beforeEach( () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, Image, ImageStyle, ImageToolbar, Table, TableToolbar, FakeButton ],
					image: {
						toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
					},
					table: {
						contentToolbar: [ 'fake_button' ]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = newEditor.model;
					doc = model.document;
					widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
					toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'tableContent' ).view;
					balloon = editor.plugins.get( 'ContextualBalloon' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( TableToolbar ) ).to.be.instanceOf( TableToolbar );
		} );

		it( 'should not initialize if there is no configuration', () => {
			const editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor.create( editorElement, {
				plugins: [ TableToolbar ]
			} )
				.then( editor => {
					const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
					expect( widgetToolbarRepository._toolbarDefinitions.get( 'tableContent' ) ).to.be.undefined;

					editorElement.remove();
					return editor.destroy();
				} );
		} );

		describe( 'toolbar', () => {
			it( 'should use the config.table.contenToolbar to create items', () => {
				expect( toolbar.items ).to.have.length( 1 );
				expect( toolbar.items.get( 0 ).label ).to.equal( 'fake button' );
			} );

			it( 'should set proper CSS classes', () => {
				const spy = sinon.spy( balloon, 'add' );

				editor.ui.focusTracker.isFocused = true;

				setData( model, '<table><tableRow><tableCell>[]</tableCell></tableRow></table>' );

				sinon.assert.calledWithMatch( spy, {
					view: toolbar,
					balloonClassName: 'ck-toolbar-container'
				} );
			} );

			it( 'should set aria-label attribute', () => {
				toolbar.render();

				expect( toolbar.element.getAttribute( 'aria-label' ) ).to.equal( 'Table toolbar' );

				toolbar.destroy();
			} );
		} );

		describe( 'integration with the editor focus', () => {
			it( 'should show the toolbar when the editor gains focus and the table is selected', () => {
				editor.ui.focusTracker.isFocused = true;

				setData( model, '<table><tableRow><tableCell>[]</tableCell></tableRow></table>' );

				editor.ui.focusTracker.isFocused = false;
				expect( balloon.visibleView ).to.be.null;

				editor.ui.focusTracker.isFocused = true;
				expect( balloon.visibleView ).to.equal( toolbar );
			} );

			it( 'should hide the toolbar when the editor loses focus and the table is selected', () => {
				editor.ui.focusTracker.isFocused = false;

				setData( model, '<table><tableRow><tableCell>[]</tableCell></tableRow></table>' );

				editor.ui.focusTracker.isFocused = true;
				expect( balloon.visibleView ).to.equal( toolbar );

				editor.ui.focusTracker.isFocused = false;
				expect( balloon.visibleView ).to.be.null;
			} );
		} );

		describe( 'integration with the editor selection (ui#update event)', () => {
			beforeEach( () => {
				editor.ui.focusTracker.isFocused = true;
			} );

			it( 'should not show the toolbar on ui#update when the table is selected', () => {
				setData( model, '<paragraph>foo</paragraph>[<table><tableRow><tableCell></tableCell></tableRow></table>]' );

				expect( balloon.visibleView ).to.be.null;
			} );

			it( 'should show the toolbar on ui#update when the table content is selected', () => {
				setData(
					model,
					'<paragraph>[foo]</paragraph><table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>'
				);

				expect( balloon.visibleView ).to.be.null;

				editor.ui.fire( 'update' );

				expect( balloon.visibleView ).to.be.null;

				model.change( writer => {
					// Select the <tableCell>[bar]</tableCell>
					writer.setSelection(
						writer.createRangeOn( doc.getRoot().getNodeByPath( [ 1, 0, 0, 0 ] ) )
					);
				} );

				expect( balloon.visibleView ).to.equal( toolbar );

				// Make sure successive change does not throw, e.g. attempting
				// to insert the toolbar twice.
				editor.ui.fire( 'update' );
				expect( balloon.visibleView ).to.equal( toolbar );
			} );

			it( 'should not show the toolbar on ui#update when the image inside table is selected', () => {
				setData(
					model,
					'<paragraph>[foo]</paragraph>' +
					'<table><tableRow><tableCell><paragraph>foo</paragraph><image src=""></image></tableCell></tableRow></table>'
				);

				expect( balloon.visibleView ).to.be.null;

				const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

				model.change( writer => {
					// Select the <tableCell><paragraph></paragraph>[<image></image>]</tableCell>
					const nodeByPath = doc.getRoot().getNodeByPath( [ 1, 0, 0, 1 ] );

					writer.setSelection( nodeByPath, 'on' );
				} );

				expect( balloon.visibleView ).to.equal( imageToolbar );

				model.change( writer => {
					// Select the <tableCell><paragraph>[]</paragraph><image></image></tableCell>
					writer.setSelection(
						writer.createPositionAt( doc.getRoot().getNodeByPath( [ 1, 0, 0, 0 ] ), 0 )
					);
				} );

				expect( balloon.visibleView ).to.equal( toolbar );
			} );

			it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
				setData( model, '<table><tableRow><tableCell><paragraph>x[y]z</paragraph></tableCell></tableRow></table>' );

				expect( balloon.visibleView ).to.equal( toolbar );

				// Put anything on top of the ContextualBalloon stack above the table toolbar.
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

			it( 'should hide the toolbar on render if the table is de–selected', () => {
				setData(
					model,
					'<paragraph>foo</paragraph><table><tableRow><tableCell><paragraph>[]</paragraph></tableCell></tableRow></table>'
				);

				expect( balloon.visibleView ).to.equal( toolbar );

				model.change( writer => {
					// Select the <paragraph>[...]</paragraph>
					writer.setSelection(
						writer.createRangeIn( doc.getRoot().getChild( 0 ) )
					);
				} );

				expect( balloon.visibleView ).to.be.null;

				// Make sure successive change does not throw, e.g. attempting
				// to remove the toolbar twice.
				editor.ui.fire( 'update' );
				expect( balloon.visibleView ).to.be.null;
			} );
		} );
	} );

	describe( 'tableToolbar', () => {
		let editor, element, widgetToolbarRepository, balloon, toolbar, model;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor.create( element, {
				plugins: [ Paragraph, Table, TableToolbar, FakeButton ],
				table: {
					tableToolbar: [ 'fake_button' ]
				}
			} ).then( _editor => {
				editor = _editor;
				widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
				toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'table' ).view;
				balloon = editor.plugins.get( 'ContextualBalloon' );
				model = editor.model;
			} );
		} );

		afterEach( () => {
			return editor.destroy()
				.then( () => element.remove() );
		} );

		describe( 'toolbar', () => {
			it( 'should not initialize if there is no configuration', () => {
				const editorElement = global.document.createElement( 'div' );
				global.document.body.appendChild( editorElement );

				return ClassicTestEditor.create( editorElement, {
					plugins: [ TableToolbar ]
				} )
					.then( editor => {
						const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
						expect( widgetToolbarRepository._toolbarDefinitions.get( 'table' ) ).to.be.undefined;

						editorElement.remove();
						return editor.destroy();
					} );
			} );

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
