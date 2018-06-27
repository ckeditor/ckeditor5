/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import TableToolbar from '../src/tabletoolbar';
import Table from '../src/table';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'TableToolbar', () => {
	let editor, model, doc, editingView, plugin, toolbar, balloon, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, Table, TableToolbar, FakeButton ],
				table: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				doc = model.document;
				plugin = editor.plugins.get( TableToolbar );
				toolbar = plugin._toolbar;
				editingView = editor.editing.view;
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

		return ClassicEditor.create( editorElement, {
			plugins: [ TableToolbar ]
		} )
			.then( editor => {
				expect( editor.plugins.get( TableToolbar )._toolbar ).to.be.undefined;

				editorElement.remove();
				return editor.destroy();
			} );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.table.toolbar to create items', () => {
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

	describe( 'integration with the editor selection (#change event)', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should not show the toolbar on render when the table is selected', () => {
			setData( model, '<paragraph>foo</paragraph>[<table><tableRow><tableCell></tableCell></tableRow></table>]' );

			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should show the toolbar on render when the table content is selected', () => {
			setData( model, '<paragraph>[foo]</paragraph><table><tableRow><tableCell>bar</tableCell></tableRow></table>' );

			expect( balloon.visibleView ).to.be.null;

			editingView.change( () => {} );
			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the <tableCell>[foo]</tableCell>
				writer.setSelection(
					Range.createOn( doc.getRoot().getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editingView.change( () => {} );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( model, '<table><tableRow><tableCell>x[y]z</tableCell></tableRow></table>' );
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

			editingView.change( () => {} );
			expect( balloon.visibleView ).to.equal( lastView );
		} );

		it( 'should hide the toolbar on render if the table is de–selected', () => {
			setData( model, '<paragraph>foo</paragraph><table><tableRow><tableCell>[]</tableCell></tableRow></table>' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection(
					Range.createIn( doc.getRoot().getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editingView.change( () => {} );
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
