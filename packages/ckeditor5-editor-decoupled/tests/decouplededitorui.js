/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import View from '@ckeditor/ckeditor5-ui/src/view';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DecoupledEditorUI from '../src/decouplededitorui';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DecoupledEditorUIView from '../src/decouplededitoruiview';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { isElement } from 'lodash-es';

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
								items: [ 'foo', 'bar' ],
								viewportTopOffset: 100
							}
						} )
						.then( editor => {
							const items = editor.ui.view.toolbar.items;

							expect( items.get( 0 ).name ).to.equal( 'foo' );
							expect( items.get( 1 ).name ).to.equal( 'bar' );

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
