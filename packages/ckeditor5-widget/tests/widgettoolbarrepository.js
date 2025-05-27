/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor.js';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Widget from '../src/widget.js';
import WidgetToolbarRepository from '../src/widgettoolbarrepository.js';
import { isWidget, toWidget } from '../src/utils.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'WidgetToolbarRepository', () => {
	let editor, model, balloon, widgetToolbarRepository, editorElement, addToolbarSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		addToolbarSpy = sinon.spy( EditorUI.prototype, 'addToolbar' );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, FakeButton, WidgetToolbarRepository, FakeWidget, FakeChildWidget, BlockQuote ],
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( WidgetToolbarRepository.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( WidgetToolbarRepository.isPremiumPlugin ).to.be.false;
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
				getRelatedElement: () => null
			} );

			expect( widgetToolbarRepository._toolbarDefinitions.size ).to.equal( 1 );
			expect( widgetToolbarRepository._toolbarDefinitions.get( 'fake' ) ).to.be.an( 'object' );
		} );

		describe( 'Focus handling and navigation across toolbars using keyboard', () => {
			it( 'should register the toolbar as focusable toolbar in EditorUI with proper configuration', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => null
				} );

				sinon.assert.calledWithExactly(
					addToolbarSpy.lastCall,
					widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view,
					sinon.match( {
						isContextual: true,
						beforeFocus: sinon.match.func
					} )
				);
			} );

			it( 'should show the toolbar when Alt+F10 is pressed if there is an element to attach to', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => editor.editing.view.document.getRoot()
				} );

				addToolbarSpy.lastCall.args[ 1 ].beforeFocus();

				expect( balloon.visibleView ).to.equal( widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view );
			} );

			it( 'should not show the toolbar when Alt+F10 is pressed if not possible because there is no element to attach to', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => null
				} );

				addToolbarSpy.lastCall.args[ 1 ].beforeFocus();

				expect( balloon.visibleView ).to.be.null;
			} );

			it( 'should provide the logic to hide the toolbar', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => editor.editing.view.document.getRoot()
				} );

				addToolbarSpy.lastCall.args[ 1 ].beforeFocus();

				expect( balloon.visibleView ).to.equal( widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view );

				addToolbarSpy.lastCall.args[ 1 ].afterBlur();

				expect( balloon.visibleView ).to.be.null;
			} );
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

		it( 'should use a pre–defined aria-label for the toolbar', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: () => null
			} );

			const toolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			toolbarView.render();

			expect( toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'Widget toolbar' );

			toolbarView.destroy();
		} );

		it( 'should use a custom aria-label when provided', () => {
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

		it( 'should not register a toolbar when passed an empty collection of the items', () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );

			widgetToolbarRepository.register( 'fake', {
				items: [],
				getRelatedElement: () => null
			} );

			expect( widgetToolbarRepository._toolbarDefinitions.get( 'fake' ) ).to.be.undefined;

			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /^widget-toolbar-no-items/ );
		} );

		describe( 'lazy init', () => {
			it( 'should not fill toolbar items immediately', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => null
				} );

				const toolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

				toolbarView.render();

				expect( toolbarView.items.length ).to.equal( 0 );

				toolbarView.destroy();
			} );

			it( 'should fill toolbar items on first show', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => editor.editing.view.document.getRoot()
				} );

				const toolbarDefinition = widgetToolbarRepository._toolbarDefinitions.get( 'fake' );

				widgetToolbarRepository._showToolbar( toolbarDefinition, editor.editing.view.document.getRoot() );

				expect( balloon.visibleView ).to.equal( toolbarDefinition.view );
				expect( toolbarDefinition.view.items.length ).to.equal( 1 );
			} );

			it( 'should fill toolbar items on first show (and only on the first)', () => {
				widgetToolbarRepository.register( 'fake', {
					items: editor.config.get( 'fake.toolbar' ),
					getRelatedElement: () => editor.editing.view.document.getRoot()
				} );

				const toolbarDefinition = widgetToolbarRepository._toolbarDefinitions.get( 'fake' );

				widgetToolbarRepository._showToolbar( toolbarDefinition, editor.editing.view.document.getRoot() );

				expect( balloon.visibleView ).to.equal( toolbarDefinition.view );
				expect( toolbarDefinition.view.items.length ).to.equal( 1 );

				widgetToolbarRepository._hideToolbar( toolbarDefinition );

				expect( balloon.visibleView ).to.equal( null );

				widgetToolbarRepository._showToolbar( toolbarDefinition, editor.editing.view.document.getRoot() );

				expect( balloon.visibleView ).to.equal( toolbarDefinition.view );
				expect( toolbarDefinition.view.items.length ).to.equal( 1 );
			} );
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

		it( 'toolbar should be hidden when the plugin gets disabled', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			widgetToolbarRepository.isEnabled = false;

			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'toolbar should be hidden when the plugin was disabled prior changing selection', () => {
			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			widgetToolbarRepository.isEnabled = false;

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			expect( balloon.visibleView ).to.be.null;
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
				view.domConverter.mapViewToDom( fakeChildViewElement ) );
		} );

		it( 'should not update balloon position when toolbar is in not visible stack', () => {
			const customView = new View();

			sinon.spy( balloon.view, 'pin' );

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model,
				'<paragraph>foo</paragraph>' +
				'[<fake-widget></fake-widget>]'
			);

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( fakeWidgetToolbarView ) ).to.equal( true );

			const spy = testUtils.sinon.spy( balloon, 'updatePosition' );

			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should update balloon position when stack with toolbar is switched in rotator to visible', () => {
			const view = editor.editing.view;
			const customView = new View();

			sinon.spy( balloon.view, 'pin' );

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model,
				'<paragraph>foo</paragraph>' +
				'[<fake-widget></fake-widget>]'
			);

			const fakeViewElement = view.document.getRoot().getChild( 1 );
			const fakeDomElement = editor.editing.view.domConverter.mapViewToDom( fakeViewElement );
			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.equal( fakeDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( fakeWidgetToolbarView ) ).to.equal( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
			expect( balloon.hasView( customView ) ).to.equal( true );
			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.not.equal( fakeDomElement );

			const newFakeViewElement = view.document.getRoot().getChild( 1 ).getChild( 0 );
			const newFakeDomElement = editor.editing.view.domConverter.mapViewToDom( newFakeViewElement );

			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.equal( newFakeDomElement );
		} );

		it( 'toolbar should use one of pre-defined positions when attaching to a widget', () => {
			const editingView = editor.editing.view;
			const balloonAddSpy = sinon.spy( balloon, 'add' );
			const defaultPositions = BalloonPanelView.defaultPositions;

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;
			const widgetViewElement = editingView.document.getRoot().getChild( 1 );

			sinon.assert.calledOnce( balloonAddSpy );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: fakeWidgetToolbarView,
				position: {
					target: editingView.domConverter.mapViewToDom( widgetViewElement ),
					positions: [
						defaultPositions.northArrowSouth,
						defaultPositions.northArrowSouthWest,
						defaultPositions.northArrowSouthEast,
						defaultPositions.southArrowNorth,
						defaultPositions.southArrowNorthWest,
						defaultPositions.southArrowNorthEast,
						defaultPositions.viewportStickyNorth
					]
				},
				balloonClassName: 'ck-toolbar-container'
			} );
		} );

		it( 'should use a custom positions if provided', () => {
			const editingView = editor.editing.view;
			const balloonAddSpy = sinon.spy( balloon, 'add' );
			const balloonUpdatePositionSpy = sinon.spy( balloon, 'updatePosition' );
			const defaultPositions = BalloonPanelView.defaultPositions;

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget,
				positions: [
					defaultPositions.southArrowNorth,
					defaultPositions.northArrowSouth
				]
			} );

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;
			const widgetViewElement = editingView.document.getRoot().getChild( 1 );

			sinon.assert.calledOnce( balloonAddSpy );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: fakeWidgetToolbarView,
				position: {
					target: editingView.domConverter.mapViewToDom( widgetViewElement ),
					positions: [
						defaultPositions.southArrowNorth,
						defaultPositions.northArrowSouth
					]
				},
				balloonClassName: 'ck-toolbar-container'
			} );

			// Reposition check.
			sinon.assert.notCalled( balloonUpdatePositionSpy );

			editor.ui.update();

			sinon.assert.calledOnce( balloonUpdatePositionSpy );
			sinon.assert.calledWithExactly( balloonUpdatePositionSpy, {
				target: editingView.domConverter.mapViewToDom( widgetViewElement ),
				positions: [
					defaultPositions.southArrowNorth,
					defaultPositions.northArrowSouth
				]
			} );
		} );

		it( 'should update balloon custom position when stack with toolbar is switched in rotator to visible', () => {
			const view = editor.editing.view;
			const customView = new View();
			const defaultPositions = BalloonPanelView.defaultPositions;

			sinon.spy( balloon.view, 'pin' );

			widgetToolbarRepository.register( 'fake', {
				items: editor.config.get( 'fake.toolbar' ),
				getRelatedElement: getSelectedFakeWidget,
				positions: [
					defaultPositions.southArrowNorth,
					defaultPositions.northArrowSouth
				]
			} );

			setData( model,
				'<paragraph>foo</paragraph>' +
				'[<fake-widget></fake-widget>]'
			);

			const fakeViewElement = view.document.getRoot().getChild( 1 );
			const fakeDomElement = editor.editing.view.domConverter.mapViewToDom( fakeViewElement );
			const fakeWidgetToolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'fake' ).view;

			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.equal( fakeDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( fakeWidgetToolbarView ) ).to.equal( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
			expect( balloon.hasView( customView ) ).to.equal( true );
			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.not.equal( fakeDomElement );
			expect( balloon.view.pin.lastCall.args[ 0 ].positions ).to.deep.equal( [
				defaultPositions.southArrowNorth,
				defaultPositions.northArrowSouth
			] );

			const newFakeViewElement = view.document.getRoot().getChild( 1 ).getChild( 0 );
			const newFakeDomElement = editor.editing.view.domConverter.mapViewToDom( newFakeViewElement );

			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.equal( newFakeDomElement );
			expect( balloon.view.pin.lastCall.args[ 0 ].positions ).to.deep.equal( [
				defaultPositions.southArrowNorth,
				defaultPositions.northArrowSouth
			] );
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
			getRelatedElement: getSelectedFakeWidget
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

	describe( 'disableable', () => {
		describe( 'isEnabled', () => {
			it( 'is enabled by default', () => {
				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'fires change event', () => {
				const spy = sinon.spy();

				widgetToolbarRepository.on( 'change:isEnabled', spy );

				widgetToolbarRepository.isEnabled = false;

				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		describe( 'forceDisabled() / clearForceDisabled()', () => {
			it( 'forceDisabled() should disable the plugin', () => {
				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.isEnabled = true;

				expect( widgetToolbarRepository.isEnabled ).to.be.false;
			} );

			it( 'clearForceDisabled() should enable the plugin', () => {
				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.clearForceDisabled( 'foo' );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'clearForceDisabled() used with wrong identifier should not enable the plugin', () => {
				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.clearForceDisabled( 'bar' );
				widgetToolbarRepository.isEnabled = true;

				expect( widgetToolbarRepository.isEnabled ).to.be.false;
			} );

			it( 'using forceDisabled() twice with the same identifier should not have any effect', () => {
				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.clearForceDisabled( 'foo' );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'plugin is enabled only after all disables were cleared', () => {
				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.forceDisabled( 'bar' );
				widgetToolbarRepository.clearForceDisabled( 'foo' );
				widgetToolbarRepository.isEnabled = true;

				expect( widgetToolbarRepository.isEnabled ).to.be.false;

				widgetToolbarRepository.clearForceDisabled( 'bar' );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'plugin should remain disabled if isEnabled has a callback disabling it', () => {
				widgetToolbarRepository.on( 'set:isEnabled', evt => {
					evt.return = false;
					evt.stop();
				} );

				widgetToolbarRepository.forceDisabled( 'foo' );
				widgetToolbarRepository.clearForceDisabled( 'foo' );
				widgetToolbarRepository.isEnabled = true;

				expect( widgetToolbarRepository.isEnabled ).to.be.false;
			} );
		} );
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
			allowWhere: '$block',
			allowChildren: [ '$text', 'paragraph' ]
		} );

		const conversion = editor.conversion;

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'fake-widget',
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement( 'div' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'fake-widget',
			view: ( modelElement, { writer } ) => {
				const fakeWidget = writer.createContainerElement( 'div' );
				writer.setCustomProperty( 'fakeWidget', true, fakeWidget );

				return toWidget( fakeWidget, writer, { label: 'fake-widget' } );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div'
			},
			model: ( view, { writer } ) => {
				return writer.createElement( 'fake-widget' );
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
			view: ( modelElement, { writer } ) => {
				return writer.createContainerElement( 'div' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'fake-child-widget',
			view: ( modelElement, { writer } ) => {
				const fakeWidget = writer.createContainerElement( 'div' );
				writer.setCustomProperty( 'fakeChildWidget', true, fakeWidget );

				return toWidget( fakeWidget, writer, { label: 'fake-child-widget' } );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div'
			},
			model: ( view, { writer } ) => {
				return writer.createElement( 'fake-child-widget' );
			}
		} );
	}
}
