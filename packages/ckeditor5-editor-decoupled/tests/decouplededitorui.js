/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import View from '@ckeditor/ckeditor5-ui/src/view';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DecoupledEditorUI from '../src/decouplededitorui';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DecoupledEditorUIView from '../src/decouplededitoruiview';
import DecoupledEditor from '../src/decouplededitor';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { isElement } from 'lodash-es';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { Image, ImageCaption, ImageToolbar } from '@ckeditor/ckeditor5-image';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

describe( 'DecoupledEditorUI', () => {
	let editor, view, ui, viewElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualDecoupledTestEditor
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

		describe( 'editable', () => {
			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editable#name', () => {
				const editable = editor.editing.view.document.getRoot();

				expect( view.editable.name ).to.equal( editable.rootName );
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

			it( 'attaches editable UI as view\'s DOM root', () => {
				expect( editor.editing.view.getDomRoot() ).to.equal( view.editable.element );
			} );
		} );

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.placeholder', () => {
				return VirtualDecoupledTestEditor
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

			it( 'sets placeholder from the "placeholder" attribute of a passed <textarea>', () => {
				const element = document.createElement( 'textarea' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualDecoupledTestEditor
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

				return VirtualDecoupledTestEditor
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
					return VirtualDecoupledTestEditor
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
					return VirtualDecoupledTestEditor
						.create( '', {
							toolbar: {
								items: [ 'foo', 'bar' ]
							},
							ui: {
								viewportOffset: {
									top: 100
								}
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
					return VirtualDecoupledTestEditor
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

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			return VirtualDecoupledTestEditor.create( '' )
				.then( editor => {
					const ui = editor.ui;
					const view = ui.view;
					const spy = testUtils.sinon.spy( view.toolbar, 'focus' );

					ui.focusTracker.isFocused = true;
					ui.view.toolbar.focusTracker.isFocused = false;

					editor.keystrokes.press( {
						keyCode: keyCodes.f10,
						altKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					} );

					sinon.assert.calledOnce( spy );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches the DOM root then destroys the UI view', () => {
			return VirtualDecoupledTestEditor.create( '' )
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

			return VirtualDecoupledTestEditor.create( domElement )
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
} );

describe( 'toolbar focus cycling', () => {
	let editorElement, editor, ui, view, toolbar, keyEventData, toolbarContainer;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await DecoupledEditor.create( editorElement, {
			plugins: [ Paragraph, Heading, Image, ImageToolbar, ImageCaption ],
			toolbar: [ 'heading' ],
			image: {
				toolbar: [ 'toggleImageCaption' ]
			}
		} );

		ui = editor.ui;
		view = ui.view;
		toolbar = view.toolbar;

		toolbarContainer = document.createElement( 'div' );
		toolbarContainer.classList.add( 'toolbar-container' );
		document.body.appendChild( toolbarContainer );
		document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );

		keyEventData = {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( '`alt+f10` keystroke should', () => {
		it( 'focus the main toolbar', () => {
			const spy = testUtils.sinon.spy( toolbar, 'focus' );
			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			ui.view.toolbar.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( spy );
		} );

		describe( 'do nothing', () => {
			it( 'if nothing has been focused yet', () => {
				const spy = testUtils.sinon.spy( toolbar, 'focus' );

				setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				editor.keystrokes.press( keyEventData );

				sinon.assert.notCalled( spy );
			} );

			it( 'if toolbar was already focused', () => {
				const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );
				const spy = testUtils.sinon.spy( toolbar, 'focus' );

				setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				ui.focusTracker.isFocused = true;
				ui.view.toolbar.focusTracker.isFocused = false;

				editor.keystrokes.press( keyEventData );

				editor.keystrokes.press( keyEventData );

				sinon.assert.calledTwice( spy );
				sinon.assert.notCalled( editorSpy );
			} );
		} );

		it( 'prioritize widget toolbar over global toolbar', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( toolbar, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			view.toolbar.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );

			ui.focusTracker.focusedElement = document.activeElement;

			sinon.assert.calledOnce( imageToolbarSpy );
			sinon.assert.notCalled( toolbarSpy );
		} );
	} );

	describe( '`esc` keystroke should', () => {
		it( 'do nothing if it was pressed when no toolbar was focused', () => {
			const spy = testUtils.sinon.spy( toolbar, 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'advanced scenarios', () => {
		it( 'focus toolbar, focus editor back when `esc` was pressed', () => {
			const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );

			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			ui.focusTracker.isFocused = true;
			view.toolbar.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEventData );
			ui.focusTracker.focusedElement = document.activeElement;

			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.calledOnce( editorSpy );
		} );

		it( 'switch focus between image/toolbar/image and go back to editor after `esc` was pressed', () => {
			const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			const imageToolbar = widgetToolbarRepository._toolbarDefinitions.get( 'image' ).view;

			const toolbarSpy = testUtils.sinon.spy( toolbar, 'focus' );
			const imageToolbarSpy = testUtils.sinon.spy( imageToolbar, 'focus' );
			const editorSpy = testUtils.sinon.spy( editor.editing.view.domRoots.get( 'main' ), 'focus' );

			setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/warsaw.jpg"><caption>bar</caption></imageBlock>]' +
				'<paragraph>baz</paragraph>'
			);

			ui.focusTracker.isFocused = true;
			view.toolbar.focusTracker.isFocused = false;

			// select image baloon toolbar
			editor.keystrokes.press( keyEventData );

			ui.focusTracker.focusedElement = document.activeElement;
			sinon.assert.calledOnce( imageToolbarSpy );

			// switch to regular toolbar
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledOnce( toolbarSpy );

			// switch back to the image baloon toolbar
			ui.focusTracker.focusedElement = document.activeElement;
			editor.keystrokes.press( keyEventData );

			sinon.assert.calledTwice( imageToolbarSpy );

			// move selection back inside the editor
			editor.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );
			sinon.assert.calledOnce( editorSpy );
		} );
	} );
} );

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}

class VirtualDecoupledTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new DecoupledEditorUIView( this.locale, this.editing.view );
		this.ui = new DecoupledEditorUI( this, view );

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
