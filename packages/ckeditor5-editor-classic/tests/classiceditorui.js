/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, Event, console */

import View from '@ckeditor/ckeditor5-ui/src/view.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ClassicEditor from '../src/classiceditor.js';
import ClassicEditorUI from '../src/classiceditorui.js';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditorUIView from '../src/classiceditoruiview.js';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { isElement } from 'lodash-es';
import { Dialog, DialogViewPosition } from '@ckeditor/ckeditor5-ui';

describe( 'ClassicEditorUI', () => {
	let editor, view, ui, viewElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualClassicTestEditor
			.create( '', {
				toolbar: [ 'foo', 'bar' ]
			} )
			.then( newEditor => {
				editor = newEditor;

				ui = editor.ui;
				view = ui.view;
				viewElement = view.element;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'extends EditorUI', () => {
			expect( ui ).to.instanceof( EditorUI );
		} );
	} );

	describe( 'init()', () => {
		it( 'renders the #view', () => {
			expect( view.isRendered ).to.be.true;
		} );

		describe( 'stickyPanel', () => {
			it( 'binds view.stickyToolbar#isActive to editor.focusTracker#isFocused', () => {
				ui.focusTracker.isFocused = false;
				expect( view.stickyPanel.isActive ).to.be.false;

				ui.focusTracker.isFocused = true;
				expect( view.stickyPanel.isActive ).to.be.true;
			} );

			it( 'sets view.stickyToolbar#limiterElement', () => {
				expect( view.stickyPanel.limiterElement ).to.equal( view.element );
			} );

			it( 'doesn\'t set view.stickyToolbar#viewportTopOffset, if not specified in the config', () => {
				expect( view.stickyPanel.viewportTopOffset ).to.equal( 0 );
			} );

			it( 'sets view.stickyPanel#viewportTopOffset, when specified in the config', () => {
				return VirtualClassicTestEditor
					.create( '', {
						ui: {
							viewportOffset: {
								top: 100
							}
						}
					} )
					.then( editor => {
						expect( editor.ui.viewportOffset.top ).to.equal( 100 );
						expect( editor.ui.view.stickyPanel.viewportTopOffset ).to.equal( 100 );

						return editor.destroy();
					} );
			} );

			it( 'sets view.stickyPanel#viewportTopOffset if legacy toolbar.vierportTopOffset specified', () => {
				sinon.stub( console, 'warn' );

				return VirtualClassicTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						expect( editor.ui.viewportOffset.top ).to.equal( 100 );
						expect( editor.ui.view.stickyPanel.viewportTopOffset ).to.equal( 100 );

						return editor.destroy();
					} );
			} );

			it( 'warns if legacy toolbar.vierportTopOffset specified', () => {
				const spy = sinon.stub( console, 'warn' );

				return VirtualClassicTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						sinon.assert.calledWithMatch( spy, 'editor-ui-deprecated-viewport-offset-config' );

						return editor.destroy();
					} );
			} );
		} );

		describe( 'editable', () => {
			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'binds view.editable#isFocused', () => {
				assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ ui.focusTracker, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );

			it( 'set view.editable#name', () => {
				const editable = editor.editing.view.document.getRoot();

				expect( view.editable.name ).to.equal( editable.rootName );
			} );
		} );

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.placeholder - string', () => {
				return VirtualClassicTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: 'placeholder-text'
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from editor.config.placeholder - object', () => {
				return VirtualClassicTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: { main: 'placeholder-text' }
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'sets placeholder from the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualClassicTestEditor
					.create( element, {
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return newEditor.destroy();
					} );
			} );

			it( 'uses editor.config.placeholder rather than the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualClassicTestEditor
					.create( element, {
						placeholder: 'config takes precedence',
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						const firstChild = newEditor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'config takes precedence' );

						return newEditor.destroy();
					} );
			} );
		} );

		describe( 'view.toolbar', () => {
			describe( '#items', () => {
				it( 'are filled with the config.toolbar (specified as an Array)', () => {
					return VirtualClassicTestEditor
						.create( '', {
							toolbar: [ 'foo', 'bar' ]
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.get( 1 ).name ).to.equal( 'bar' );

							return editor.destroy();
						} );
				} );

				it( 'are filled with the config.toolbar (specified as an Object)', () => {
					return VirtualClassicTestEditor
						.create( '', {
							toolbar: {
								items: [ 'foo', 'bar' ]
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.get( 1 ).name ).to.equal( 'bar' );

							return editor.destroy();
						} );
				} );

				it( 'can be removed using config.toolbar.removeItems', () => {
					return VirtualClassicTestEditor
						.create( '', {
							toolbar: {
								items: [ 'foo', 'bar' ],
								removeItems: [ 'bar' ]
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.length ).to.equal( 1 );

							return editor.destroy();
						} );
				} );
			} );
		} );

		describe( 'integration with the Dialog plugin and sticky panel (toolbar)', () => {
			let editorWithUi, editorElement, dialogPlugin, dialogContentView;

			beforeEach( async () => {
				editorElement = document.createElement( 'div' );

				document.body.appendChild( editorElement );

				editorWithUi = await ClassicEditor.create( editorElement, {
					plugins: [
						Dialog
					]
				} );

				dialogPlugin = editorWithUi.plugins.get( Dialog );

				dialogContentView = new View();

				dialogContentView.setTemplate( {
					tag: 'div',
					attributes: {
						style: {
							width: '100px',
							height: '50px'
						}
					}
				} );

				sinon.stub( editorWithUi.ui.view.stickyPanel.contentPanelElement, 'getBoundingClientRect' ).returns( {
					height: 50,
					bottom: 50
				} );

				sinon.stub( editorWithUi.ui.view.editable.element, 'getBoundingClientRect' ).returns( {
					top: 0,
					right: 300,
					bottom: 100,
					left: 0,
					width: 300,
					height: 100
				} );
			} );

			afterEach( async () => {
				await editorWithUi.destroy();
				editorElement.remove();
			} );

			it( 'should move the dialog away from the sticky toolbar if there is a risk they will overlap', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				sinon.stub( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).returns( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).to.equal( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).to.equal( '65px' );
			} );

			it( 'should not move the dialog if the panel is not currently sticky', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = false;

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				sinon.stub( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).returns( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).to.equal( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).to.equal( '15px' );
			} );

			it( 'should not move the dialog away from the sticky toolbar if the user has already moved the dialog', async () => {
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				dialogPlugin.show( {
					label: 'Foo',
					content: dialogContentView,
					position: DialogViewPosition.EDITOR_TOP_SIDE
				} );

				sinon.stub( dialogPlugin.view.element.firstChild, 'getBoundingClientRect' ).returns( {
					top: 0,
					right: 100,
					bottom: 50,
					left: 0,
					width: 100,
					height: 50
				} );

				// Automatic positioning of the dialog on first show takes a while.
				await wait( 20 );

				expect( dialogPlugin.view.element.firstChild.style.left ).to.equal( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).to.equal( '65px' );

				// Sticky panel could've unstuck in the meantime (document scroll). Let's make sure it stays sticky.
				editorWithUi.ui.view.stickyPanel.isSticky = true;

				// Simulate a user moving the dialog.
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );
				dialogPlugin.view.fire( 'drag', { deltaX: 0, deltaY: -10 } );

				expect( dialogPlugin.view.element.firstChild.style.left ).to.equal( '185px' );
				expect( dialogPlugin.view.element.firstChild.style.top ).to.equal( '5px' );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches the DOM root then destroys the UI view', () => {
			return VirtualClassicTestEditor.create( '' )
				.then( newEditor => {
					const destroySpy = sinon.spy( newEditor.ui.view, 'destroy' );
					const detachSpy = sinon.spy( newEditor.editing.view, 'detachDomRoot' );

					return newEditor.destroy()
						.then( () => {
							sinon.assert.callOrder( detachSpy, destroySpy );
						} );
				} );
		} );

		it( 'restores the editor element back to its original state', () => {
			const domElement = document.createElement( 'div' );

			domElement.setAttribute( 'foo', 'bar' );
			domElement.setAttribute( 'data-baz', 'qux' );
			domElement.classList.add( 'foo-class' );

			return VirtualClassicTestEditor.create( domElement )
				.then( newEditor => {
					return newEditor.destroy()
						.then( () => {
							const attributes = {};

							for ( const attribute of Array.from( domElement.attributes ) ) {
								attributes[ attribute.name ] = attribute.value;
							}

							expect( attributes ).to.deep.equal( {
								foo: 'bar',
								'data-baz': 'qux',
								class: 'foo-class'
							} );
						} );
				} );
		} );

		it( 'should call parent EditorUI#destroy() first before destroying the view', async () => {
			const newEditor = await VirtualClassicTestEditor.create( '' );
			const parentEditorUIPrototype = Object.getPrototypeOf( newEditor.ui.constructor.prototype );

			const parentDestroySpy = testUtils.sinon.spy( parentEditorUIPrototype, 'destroy' );
			const viewDestroySpy = testUtils.sinon.spy( newEditor.ui.view, 'destroy' );

			await newEditor.destroy();

			sinon.assert.callOrder( parentDestroySpy, viewDestroySpy );
		} );
	} );

	describe( 'view()', () => {
		it( 'returns view instance', () => {
			expect( ui.view ).to.equal( view );
		} );
	} );

	describe( 'element()', () => {
		it( 'returns correct element instance', () => {
			expect( ui.element ).to.equal( viewElement );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'returns editable element (default)', () => {
			expect( ui.getEditableElement() ).to.equal( view.editable.element );
		} );

		it( 'returns editable element (root name passed)', () => {
			expect( ui.getEditableElement( 'main' ) ).to.equal( view.editable.element );
		} );

		it( 'returns undefined if editable with the given name is absent', () => {
			expect( ui.getEditableElement( 'absent' ) ).to.be.undefined;
		} );
	} );

	describe( 'View#scrollToTheSelection integration', () => {
		it( 'should listen to View#scrollToTheSelection and inject the height of the panel into `viewportOffset` when sticky', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.ui.view.stickyPanel.isSticky = true;
			sinon.stub( editor.ui.view.stickyPanel.element, 'getBoundingClientRect' ).returns( {
				height: 50
			} );

			editor.editing.view.once( 'scrollToTheSelection', ( evt, data ) => {
				const range = editor.editing.view.document.selection.getFirstRange();

				expect( data ).to.deep.equal( {
					target: editor.editing.view.domConverter.viewRangeToDom( range ),
					viewportOffset: {
						top: 160,
						bottom: 120,
						left: 130,
						right: 140
					},
					ancestorOffset: 20,
					alignToTop: undefined,
					forceScroll: undefined
				} );
			} );

			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should listen to View#scrollToTheSelection and re-scroll if the panel was not sticky at the moment of execution' +
			'but becomes sticky after a short while', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.ui.view.stickyPanel.isSticky = false;
			sinon.stub( editor.ui.view.stickyPanel.element, 'getBoundingClientRect' ).returns( {
				height: 50
			} );

			const spy = sinon.spy();

			editor.editing.view.on( 'scrollToTheSelection', spy );
			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			const range = editor.editing.view.document.selection.getFirstRange();

			// The first call will trigger another one shortly once the panel becomes sticky.
			sinon.assert.calledWith( spy.firstCall, sinon.match.object, {
				target: editor.editing.view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 110, bottom: 120, left: 130, right: 140 },
				ancestorOffset: 20
			} );

			await wait( 10 );
			editor.ui.view.stickyPanel.isSticky = true;

			// This is the second and final scroll that considers the geometry of a now-sticky panel.
			sinon.assert.calledWith( spy.secondCall, sinon.match.object, {
				target: editor.editing.view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 160, bottom: 120, left: 130, right: 140 },
				ancestorOffset: 20
			} );

			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should listen to View#scrollToTheSelection and refuse re-scrolling if the panel was not sticky at the moment of execution' +
			'and its state it didn\'t change', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicEditor.create( editorElement, {
				ui: {
					viewportOffset: {
						top: 10,
						bottom: 20,
						left: 30,
						right: 40
					}
				}
			} );

			editor.ui.view.stickyPanel.isSticky = false;
			sinon.stub( editor.ui.view.stickyPanel.element, 'getBoundingClientRect' ).returns( {
				height: 50
			} );

			const spy = sinon.spy();

			editor.editing.view.on( 'scrollToTheSelection', spy );
			editor.editing.view.scrollToTheSelection( { viewportOffset: 100 } );

			const range = editor.editing.view.document.selection.getFirstRange();

			// The first call can trigger another one shortly once the panel becomes sticky.
			sinon.assert.calledWith( spy.firstCall, sinon.match.object, {
				target: editor.editing.view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 110, bottom: 120, left: 130, right: 140 },
				ancestorOffset: 20
			} );

			// This timeout exceeds the time slot for scrollToTheSelection() affecting the stickiness of the panel.
			// If the panel hasn't become sticky yet as a result of window getting scrolled chances are this will never happen.
			await wait( 30 );

			sinon.assert.calledOnce( spy );

			editor.ui.view.stickyPanel.isSticky = true;

			// There was no second scroll even though the panel became sticky. Too much time has passed and the change of its state
			// cannot be attributed to doings of scrollToTheSelection() anymore.
			sinon.assert.calledOnce( spy );

			editorElement.remove();
			await editor.destroy();
		} );
	} );
} );

describe( 'Focus handling and navigation between editing root and editor toolbar', () => {
	let editorElement, editor, ui, toolbarView, domRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Paragraph, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'imageTextAlternative' ],
			menuBar: { isVisible: true },
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		domRoot = editor.editing.view.domRoots.get( 'main' );

		ui = editor.ui;
		toolbarView = ui.view.toolbar;
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'Focusing toolbars on Alt+F10 key press', () => {
		beforeEach( () => {
			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;
		} );

		it( 'should focus the main toolbar when the focus is in the editing root', () => {
			const spy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;

			pressAltF10( editor );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should do nothing if the toolbar is already focused', () => {
			const domRootFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10( editor );
			ui.focusTracker.focusedElement = toolbarView.element;

			// Try Alt+F10 again.
			pressAltF10( editor );

			sinon.assert.calledOnce( toolbarFocusSpy );
			sinon.assert.notCalled( domRootFocusSpy );
		} );

		it( 'should prioritize widget toolbar over the global toolbar', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( toolbarView, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			// Focus the image balloon toolbar.
			pressAltF10( editor );
			ui.focusTracker.focusedElement = imageToolbar.element;

			sinon.assert.calledOnce( imageToolbarSpy );
			sinon.assert.notCalled( toolbarSpy );
		} );
	} );

	describe( 'Restoring focus on Esc key press', () => {
		beforeEach( () => {
			ui.focusTracker.isFocused = true;
			ui.focusTracker.focusedElement = domRoot;
		} );

		it( 'should move the focus back from the main toolbar to the editing root', () => {
			const domRootFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Focus the toolbar.
			pressAltF10( editor );
			ui.focusTracker.focusedElement = toolbarView.element;

			pressEsc( editor );

			sinon.assert.callOrder( toolbarFocusSpy, domRootFocusSpy );
		} );

		it( 'should do nothing if it was pressed when no toolbar was focused', () => {
			const domRootFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			pressEsc( editor );

			sinon.assert.notCalled( domRootFocusSpy );
			sinon.assert.notCalled( toolbarFocusSpy );
		} );
	} );
} );

function pressAltF10( editor ) {
	editor.keystrokes.press( {
		keyCode: keyCodes.f10,
		altKey: true,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	} );
}

function pressEsc( editor ) {
	editor.keystrokes.press( {
		keyCode: keyCodes.esc,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	} );
}

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}

class VirtualClassicTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new ClassicEditorUIView( this.locale, this.editing.view );
		this.ui = new ClassicEditorUI( this, view );

		this.ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
		this.ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
	}

	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	static create( sourceElementOrData, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();

						const initialData = isElement( sourceElementOrData ) ?
							sourceElementOrData.innerHTML :
							sourceElementOrData;

						editor.data.init( initialData );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}
