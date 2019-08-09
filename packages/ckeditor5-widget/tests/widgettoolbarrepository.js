/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'WidgetToolbarRepository', () => {
	let editor, model, balloon, widgetToolbarRepository, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, FakeButton, WidgetToolbarRepository, FakeWidget, FakeChildWidget ],
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

	it( 'should work if balloon toolbar is not available', () => {
		editorElement.remove();
		editor.destroy();

		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		expect( editor.plugins.has( 'BalloonToolbar' ) ).to.be.false;
		expect( editor.plugins.has( WidgetToolbarRepository ) ).to.be.true;
	} );

	describe( 'register()', () => {
		it( 'should create a widget toolbar and add it to the collection', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: () => null,
			} );

			expect( widgetToolbarRepository._toolbarDefinitions.size ).to.equal( 1 );
			expect( widgetToolbarRepository._toolbarDefinitions.get( 'fake' ) ).to.be.an( 'object' );
		} );

		it( 'should throw when adding two times widget with the same id', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: () => null
			} );

			expectToThrowCKEditorError( () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => null
				} );
			}, /^widget-toolbar-duplicated/, editor );
		} );

		it( 'should create predefined aria-label for toolbar', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: () => null
			} );

			const toolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			toolbarView.render();

			expect( toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'Widget toolbar' );

			toolbarView.destroy();
		} );

		it( 'should create custom aria-label if is provided', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: () => null,
				ariaLabel: 'Custom label'
			} );

			const toolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			toolbarView.render();

			expect( toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );

			toolbarView.destroy();
		} );
	} );

	describe( 'integration tests', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'toolbar should be visible when the `getRelatedElement` callback returns a selected widget element', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'toolbar should be hidden when the `getRelatedElement` callback returns null', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '[<paragraph>foo</paragraph>]<fake-widget></fake-widget>' );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should be hidden when the `getRelatedElement` callback returns null #2', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			model.change( writer => {
				// Select the <paragraph>foo</paragraph>.
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should be removed from not visible balloon stack when the `getRelatedElement` callback returns null', () => {
			balloon.add( {
				view: new View(),
				stackId: 'secondary',
				position: {
					target: {}
				}
			} );

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.hasView( fakeWidgetToolbarView ) );
			expect( balloon.visibleView ).to.not.equal( fakeWidgetToolbarView );

			model.change( writer => {
				// Select the <paragraph>foo</paragraph>.
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.hasView( fakeWidgetToolbarView ) ).to.equal( false );
		} );

		it( 'toolbar should be hidden when the editor ui lost focus', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			editor.ui.focusTracker.isFocused = false;

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'toolbar should do nothing with toolbar when the editor ui lost focus but toolbar is not a visible view', () => {
			balloon.add( {
				view: new View(),
				stackId: 'secondary',
				position: {
					target: {}
				}
			} );

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			editor.ui.focusTracker.isFocused = false;

			expect( balloon.hasView( fakeWidgetToolbarView ) ).to.equal( true );
		} );

		it( 'toolbar should update its position when other widget is selected', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '[<fake-widget></fake-widget>]<fake-widget></fake-widget>' );

			model.change( writer => {
				// Select the second widget.
				writer.setSelection( model.document.getRoot().getChild( 1 ), 'on' );
			} );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'it should be possible to create a widget toolbar for content inside the widget', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidgetContent
			} );

			setData( model, '<fake-widget>[foo]</fake-widget>' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'toolbar should not engage when is in the balloon yet invisible', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

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

		// #60
		it( 'should show up only for the related element which is deepest in the view document', () => {
			// The point of this widget is to provide a getRelatedElement function that
			// returns a super–shallow related element which is ignored but satisfies code coverage.
			widgetToolbarRepository.register( 'dummy', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: () => editor.editing.view.document.getRoot()
			} );

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			widgetToolbarRepository.register( 'fake-child', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeChildWidget
			} );

			setData( model,
				'<paragraph>foo</paragraph>' +
				'<fake-widget>' +
					'<paragraph>foo</paragraph>' +
					'[<fake-child-widget></fake-child-widget>]' +
				'</fake-widget>' );

			const fakeChildWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake-child' ).view;

			expect( balloon.visibleView ).to.equal( fakeChildWidgetToolbarView );
		} );

		// #60
		it( 'should attach to the new related view element upon selecting another widget', () => {
			const view = editor.editing.view;

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			widgetToolbarRepository.register( 'fake-child', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeChildWidget
			} );

			setData( model,
				'<paragraph>foo</paragraph>' +
				'[<fake-widget>' +
					'<paragraph>foo</paragraph>' +
					'<fake-child-widget></fake-child-widget>' +
				'</fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;
			const fakeChildWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake-child' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );

			const fakeChildViewElement = view.document.getRoot().getChild( 1 ).getChild( 1 );
			const updatePositionSpy = sinon.spy( balloon, 'add' );

			view.change( writer => {
				// [<fake-child-widget></fake-child-widget>]
				writer.setSelection( fakeChildViewElement, 'on' );
			} );

			expect( balloon.visibleView ).to.equal( fakeChildWidgetToolbarView );

			expect( updatePositionSpy.firstCall.args[ 0 ].position.target ).to.equal(
				view.domConverter.viewToDom( fakeChildViewElement ) );
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
				editor.ui.focusTracker.isFocused = true;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'balloon toolbar should be hidden when the widget is selected', () => {
		widgetToolbarRepository.register( 'fake', {
			items: editor.config.get( 'fake.toolbar' ),
			getRelatedElement: getSelectedFakeWidget,
		} );

		const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

		editor.editing.view.document.isFocused = true;
		setData( model, '[<fake-widget></fake-widget>]<paragraph>foo</paragraph>' );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
	} );

	it( 'balloon toolbar should be visible when the widget is not selected', () => {
		widgetToolbarRepository.register( 'fake', {
			items: editor.config.get( 'fake.toolbar' ),
			getRelatedElement: getSelectedFakeWidget
		} );

		editor.editing.view.document.isFocused = true;
		setData( model, '<fake-widget></fake-widget><paragraph>[foo]</paragraph>' );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( balloonToolbar.toolbarView );
	} );
} );

function getSelectedFakeWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isWidget( viewElement ) && !!viewElement.getCustomProperty( 'fakeWidget' ) ) {
		return viewElement;
	}

	return null;
}

function getSelectedFakeChildWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isWidget( viewElement ) && !!viewElement.getCustomProperty( 'fakeChildWidget' ) ) {
		return viewElement;
	}

	return null;
}

function getSelectedFakeWidgetContent( selection ) {
	const pos = selection.getFirstPosition();
	let node = pos.parent;

	while ( node ) {
		if ( node.is( 'element' ) && isWidget( node ) && node.getCustomProperty( 'fakeWidget' ) ) {
			return node;
		}

		node = node.parent;
	}

	return null;
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
			allowWhere: '$block'
		} );

		schema.extend( '$text', { allowIn: 'fake-widget' } );
		schema.extend( 'paragraph', { allowIn: 'fake-widget' } );

		const conversion = editor.conversion;

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'fake-widget',
			view: ( modelElement, viewWriter ) => {
				return viewWriter.createContainerElement( 'div' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'fake-widget',
			view: ( modelElement, viewWriter ) => {
				const fakeWidget = viewWriter.createContainerElement( 'div' );
				viewWriter.setCustomProperty( 'fakeWidget', true, fakeWidget );

				return toWidget( fakeWidget, viewWriter, { label: 'fake-widget' } );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div'
			},
			model: ( view, modelWriter ) => {
				return modelWriter.createElement( 'fake-widget' );
			}
		} );
	}
}

// A simple child widget plugin
// It registers `<fake-child-widget>` block in model and represents `div` in the view.
// It allows having text inside self.
class FakeChildWidget extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.register( 'fake-child-widget', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowIn: 'fake-widget'
		} );

		schema.extend( '$text', { allowIn: 'fake-child-widget' } );
		schema.extend( 'paragraph', { allowIn: 'fake-child-widget' } );

		const conversion = editor.conversion;

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'fake-child-widget',
			view: ( modelElement, viewWriter ) => {
				return viewWriter.createContainerElement( 'div' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'fake-child-widget',
			view: ( modelElement, viewWriter ) => {
				const fakeWidget = viewWriter.createContainerElement( 'div' );
				viewWriter.setCustomProperty( 'fakeChildWidget', true, fakeWidget );

				return toWidget( fakeWidget, viewWriter, { label: 'fake-child-widget' } );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div'
			},
			model: ( view, modelWriter ) => {
				return modelWriter.createElement( 'fake-child-widget' );
			}
		} );
	}
}
