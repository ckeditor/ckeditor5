/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import BalloonEditorUI from '../src/ballooneditorui';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import BalloonEditorUIView from '../src/ballooneditoruiview';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import utils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'BalloonEditorUI', () => {
	let editor, view, ui;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualBalloonTestEditor
			.create( {
				plugins: [ BalloonToolbar ]
			} )
			.then( newEditor => {
				editor = newEditor;
				ui = editor.ui;
				view = ui.view;
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
		it( 'initializes the #view', () => {
			expect( view.isRendered ).to.be.true;
		} );

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			const toolbar = editor.plugins.get( 'BalloonToolbar' );
			const toolbarFocusSpy = testUtils.sinon.stub( toolbar.toolbarView, 'focus' ).returns( {} );
			const toolbarShowSpy = testUtils.sinon.stub( toolbar, 'show' ).returns( {} );
			const toolbarHideSpy = testUtils.sinon.stub( toolbar, 'hide' ).returns( {} );
			const editingFocusSpy = testUtils.sinon.stub( editor.editing.view, 'focus' ).returns( {} );

			ui.focusTracker.isFocused = true;

			// #show and #hide are mocked so mocking the focus as well.
			toolbar.toolbarView.focusTracker.isFocused = false;

			editor.keystrokes.press( {
				keyCode: keyCodes.f10,
				altKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.callOrder( toolbarShowSpy, toolbarFocusSpy );
			sinon.assert.notCalled( toolbarHideSpy );
			sinon.assert.notCalled( editingFocusSpy );

			// #show and #hide are mocked so mocking the focus as well.
			toolbar.toolbarView.focusTracker.isFocused = true;

			toolbar.toolbarView.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.callOrder( editingFocusSpy, toolbarHideSpy );
		} );

		describe( 'editable', () => {
			let editable;

			beforeEach( () => {
				editable = editor.editing.view.document.getRoot();
			} );

			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editable#name', () => {
				expect( view.editable.name ).to.equal( editable.rootName );
			} );

			it( 'binds view.editable#isFocused', () => {
				utils.assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ ui.focusTracker, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );

			it( 'binds view.editable#isReadOnly', () => {
				utils.assertBinding(
					view.editable,
					{ isReadOnly: false },
					[
						[ editable, { isReadOnly: true } ]
					],
					{ isReadOnly: true }
				);
			} );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'returns editable element (default)', () => {
			expect( ui.getEditableElement() ).to.equal( view.editable );
		} );

		it( 'returns editable element (root name passed)', () => {
			expect( ui.getEditableElement( 'main' ) ).to.equal( view.editable );
		} );

		it( 'returns null if editable with the given name is absent', () => {
			expect( ui.getEditableElement( 'absent' ) ).to.null;
		} );
	} );
} );

class VirtualBalloonTestEditor extends VirtualTestEditor {
	constructor( config ) {
		super( config );

		const view = new BalloonEditorUIView( this.locale );
		this.ui = new BalloonEditorUI( this, view );
	}

	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	static create( config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();
						editor.ui.ready();
						editor.fire( 'uiReady' );
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
