/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import WidgetToolbar from '../src/widgettoolbar';
import Widget from '../src/widget';
import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import View from '@ckeditor/ckeditor5-ui/src/view';

describe( 'WidgetToolbar', () => {
	let editor, model, balloon, widgetToolbar, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, FakeButton, WidgetToolbar, FakeWidget ],
				fake: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				widgetToolbar = editor.plugins.get( 'WidgetToolbar' );
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( WidgetToolbar ) ).to.be.instanceOf( WidgetToolbar );
	} );

	describe( 'add()', () => {
		it( 'should create a widget toolbar and add it to the collection', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false,
			} );

			expect( widgetToolbar._toolbars.size ).to.equal( 1 );
			expect( widgetToolbar._toolbars.get( 'fake' ) ).to.be.an( 'object' );
		} );

		it( 'should throw when adding two times widget with the same id', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			expect( () => {
				widgetToolbar.add( 'fake', {
					toolbarItems: editor.config.get( 'fake.toolbar' ),
					isVisible: () => false
				} );
			} ).to.throw( /widget-toolbar-duplicated/ );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove given widget toolbar', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			widgetToolbar.remove( 'fake' );

			expect( widgetToolbar._toolbars.size ).to.equal( 0 );
		} );

		it( 'should throw an error if a toolbar does not exist', () => {
			widgetToolbar.add( 'foo', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			expect( () => {
				widgetToolbar.remove( 'bar' );
			} ).to.throw( /widget-toolbar-does-not-exist/ );
		} );
	} );

	describe( 'has', () => {
		it( 'should return `true` when a toolbar with given id was added', () => {
			widgetToolbar.add( 'foo', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			expect( widgetToolbar.has( 'foo' ) ).to.be.true;
		} );

		it( 'should return `false` when a toolbar with given id was not added', () => {
			widgetToolbar.add( 'foo', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			expect( widgetToolbar.has( 'bar' ) ).to.be.false;
		} );
	} );

	describe( 'integration tests', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'toolbar should be visible when the `isVisible` callback returns true', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: isWidgetSelected
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbar._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'toolbar should be hidden when the `isVisible` callback returns false', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: isWidgetSelected
			} );

			setData( model, '[<paragraph>foo</paragraph>]<fake-widget></fake-widget>' );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should be hidden when the `isVisible` callback returns false #2', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: isWidgetSelected
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			model.change( writer => {
				// Select the <paragraph>foo</paragraph>.
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should update its position when other widget is selected', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: isWidgetSelected
			} );

			setData( model, '[<fake-widget></fake-widget>]<fake-widget></fake-widget>' );

			model.change( writer => {
				// Select the second widget.
				writer.setSelection( model.document.getRoot().getChild( 1 ), 'on' );
			} );

			const fakeWidgetToolbarView = widgetToolbar._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'it should be possible to create a widget toolbar for content inside the widget', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: doesWidgetContainSelection
			} );

			setData( model, '<fake-widget>[foo]</fake-widget>' );

			const fakeWidgetToolbarView = widgetToolbar._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'toolbar should not engage when is in the balloon yet invisible', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: isWidgetSelected
			} );

			const fakeWidgetToolbarView = widgetToolbar._toolbars.get( 'fake' ).view;

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

describe( 'WidgetToolbar - integration with the BalloonToolbar', () => {
	let clock, editor, model, balloon, balloonToolbar, widgetToolbar, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
		clock = testUtils.sinon.useFakeTimers();

		return BalloonEditor
			.create( editorElement, {
				plugins: [ Paragraph, FakeButton, WidgetToolbar, FakeWidget, Bold ],
				balloonToolbar: [ 'bold' ],
				fake: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				widgetToolbar = editor.plugins.get( 'WidgetToolbar' );
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
		widgetToolbar.add( 'fake', {
			toolbarItems: editor.config.get( 'fake.toolbar' ),
			isVisible: isWidgetSelected,
		} );

		const fakeWidgetToolbarView = widgetToolbar._toolbars.get( 'fake' ).view;

		setData( model, '[<fake-widget></fake-widget>]<paragraph>foo</paragraph>' );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
	} );

	it( 'balloon toolbar should be visible when the widget is not selected', () => {
		widgetToolbar.add( 'fake', {
			toolbarItems: editor.config.get( 'fake.toolbar' ),
			isVisible: isWidgetSelected
		} );

		setData( model, '<fake-widget></fake-widget><paragraph>[foo]</paragraph>' );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( balloonToolbar.toolbarView );
	} );
} );

function isWidgetSelected( selection ) {
	const viewElement = selection.getSelectedElement();

	return !!( viewElement && isWidget( viewElement ) );
}

function doesWidgetContainSelection( selection ) {
	const pos = selection.getFirstPosition();
	let node = pos.parent;

	while ( node ) {
		if ( node.is( 'element' ) && isWidget( node ) ) {
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
