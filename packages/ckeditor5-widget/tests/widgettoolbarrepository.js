/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Widget from '../src/widget';
import WidgetToolbarRepository from '../src/widgettoolbarrepository';
import { isWidget, toWidget } from '../src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'WidgetToolbar', () => {
	let editor, model, balloon, widgetToolbarRepository, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, FakeButton, WidgetToolbarRepository, FakeWidget ],
				fake: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( WidgetToolbarRepository ) ).to.be.instanceOf( WidgetToolbarRepository );
	} );

	describe( 'register()', () => {
		it( 'should create a widget toolbar and add it to the collection', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: () => false,
			} );

			expect( widgetToolbarRepository._toolbars.size ).to.equal( 1 );
			expect( widgetToolbarRepository._toolbars.get( 'fake' ) ).to.be.an( 'object' );
		} );

		it( 'should throw when adding two times widget with the same id', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: () => false
			} );

			expect( () => {
				widgetToolbarRepository.register( 'fake', {
					toolbarItems: editor.config.get( 'fake.toolbar' ),
					visibleWhen: () => false
				} );
			} ).to.throw( CKEditorError, /^widget-toolbar-duplicated/ );
		} );
	} );

	describe( 'integration tests', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'toolbar should be visible when the `visibleWhen` callback returns true', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: isFakeWidgetSelected
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'toolbar should be hidden when the `visibleWhen` callback returns false', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: isFakeWidgetSelected
			} );

			setData( model, '[<paragraph>foo</paragraph>]<fake-widget></fake-widget>' );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should be hidden when the `visibleWhen` callback returns false #2', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: isFakeWidgetSelected
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			model.change( writer => {
				// Select the <paragraph>foo</paragraph>.
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should update its position when other widget is selected', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: isFakeWidgetSelected
			} );

			setData( model, '[<fake-widget></fake-widget>]<fake-widget></fake-widget>' );

			model.change( writer => {
				// Select the second widget.
				writer.setSelection( model.document.getRoot().getChild( 1 ), 'on' );
			} );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'it should be possible to create a widget toolbar for content inside the widget', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: isFakeWidgetContentSelected
			} );

			setData( model, '<fake-widget>[foo]</fake-widget>' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'toolbar should not engage when is in the balloon yet invisible', () => {
			widgetToolbarRepository.register( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				visibleWhen: isFakeWidgetSelected
			} );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbars.get( 'fake' ).view;

			setData( model, '[<fake-widget></fake-widget>]' );

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );

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
	} );
} );

describe( 'WidgetToolbarRepository - integration with the BalloonToolbar', () => {
	let clock, editor, model, balloon, balloonToolbar, widgetToolbarRepository, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
		clock = testUtils.sinon.useFakeTimers();

		return BalloonEditor
			.create( editorElement, {
				plugins: [ Paragraph, FakeButton, WidgetToolbarRepository, FakeWidget, Bold ],
				balloonToolbar: [ 'bold' ],
				fake: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
				balloon = editor.plugins.get( 'ContextualBalloon' );
				balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

				editor.editing.view.document.isFocused = true;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'balloon toolbar should be hidden when the widget is selected', () => {
		widgetToolbarRepository.register( 'fake', {
			toolbarItems: editor.config.get( 'fake.toolbar' ),
			visibleWhen: isFakeWidgetSelected,
		} );

		const fakeWidgetToolbarView = widgetToolbarRepository._toolbars.get( 'fake' ).view;

		setData( model, '[<fake-widget></fake-widget>]<paragraph>foo</paragraph>' );
		editor.ui.fire( 'update' );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
	} );

	it( 'balloon toolbar should be visible when the widget is not selected', () => {
		widgetToolbarRepository.register( 'fake', {
			toolbarItems: editor.config.get( 'fake.toolbar' ),
			visibleWhen: isFakeWidgetSelected
		} );

		setData( model, '<fake-widget></fake-widget><paragraph>[foo]</paragraph>' );
		editor.ui.fire( 'update' );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( balloonToolbar.toolbarView );
	} );
} );

const fakeWidgetSymbol = Symbol( 'fakeWidget' );

function isFakeWidgetSelected( selection ) {
	const viewElement = selection.getSelectedElement();

	return !!viewElement && isWidget( viewElement ) && !!viewElement.getCustomProperty( fakeWidgetSymbol );
}

function isFakeWidgetContentSelected( selection ) {
	const pos = selection.getFirstPosition();
	let node = pos.parent;

	while ( node ) {
		if ( node.is( 'element' ) && isWidget( node ) && node.getCustomProperty( fakeWidgetSymbol ) ) {
			return true;
		}

		node = node.parent;
	}

	return false;
}

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

// Simple widget plugin
// It registers `<fake-widget>` block in model and represents `div` in the view.
// It allows having text inside self.
class FakeWidget extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.register( 'fake-widget', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
		} );

		schema.extend( '$text', { allowIn: 'fake-widget' } );

		const conversion = editor.conversion;

		conversion.for( 'dataDowncast' ).add( downcastElementToElement( {
			model: 'fake-widget',
			view: ( modelElement, viewWriter ) => {
				return viewWriter.createContainerElement( 'div' );
			}
		} ) );

		conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'fake-widget',
			view: ( modelElement, viewWriter ) => {
				const fakeWidget = viewWriter.createContainerElement( 'div' );
				viewWriter.setCustomProperty( fakeWidgetSymbol, true, fakeWidget );

				return toWidget( fakeWidget, viewWriter, { label: 'fake-widget' } );
			}
		} ) );

		conversion.for( 'upcast' ).add( upcastElementToElement( {
			view: {
				name: 'div'
			},
			model: ( view, modelWriter ) => {
				return modelWriter.createElement( 'fake-widget' );
			}
		} ) );
	}
}
