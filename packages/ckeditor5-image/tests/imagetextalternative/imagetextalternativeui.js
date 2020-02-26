/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event, document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../../src/image';
import ImageTextAlternativeEditing from '../../src/imagetextalternative/imagetextalternativeediting';
import ImageTextAlternativeUI from '../../src/imagetextalternative/imagetextalternativeui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'ImageTextAlternativeUI', () => {
	let editor, model, doc, plugin, command, form, balloon, editorElement, button;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageTextAlternativeEditing, ImageTextAlternativeUI, Image, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				newEditor.editing.view.attachDomRoot( editorElement );
				plugin = editor.plugins.get( ImageTextAlternativeUI );
				command = editor.commands.get( 'imageTextAlternative' );
				form = plugin._form;
				balloon = editor.plugins.get( 'ContextualBalloon' );
				button = editor.ui.componentFactory.create( 'imageTextAlternative' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ImageTextAlternativeUI.pluginName ).to.equal( 'ImageTextAlternativeUI' );
	} );

	describe( 'toolbar button', () => {
		it( 'should be registered in component factory', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have isEnabled property bind to command\'s isEnabled property', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should show balloon panel on execute', () => {
			expect( balloon.visibleView ).to.be.null;

			setData( model, '[<image src="" alt="foo bar"></image>]' );

			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );

			// Make sure successive execute does not throw, e.g. attempting
			// to display the form twice.
			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );
		} );

		it( 'should set alt attribute value to textarea and select it', () => {
			const spy = sinon.spy( form.labeledInput, 'select' );

			setData( model, '[<image src="" alt="foo bar"></image>]' );

			button.fire( 'execute' );
			sinon.assert.calledOnce( spy );
			expect( form.labeledInput.value ).equals( 'foo bar' );
		} );

		it( 'should set empty text to textarea and select it when there is no alt attribute', () => {
			const spy = sinon.spy( form.labeledInput, 'select' );

			setData( model, '[<image src=""></image>]' );

			button.fire( 'execute' );
			sinon.assert.calledOnce( spy );
			expect( form.labeledInput.value ).equals( '' );
		} );
	} );

	describe( 'balloon panel form', () => {
		// https://github.com/ckeditor/ckeditor5-image/issues/114
		it( 'should make sure the input always stays in sync with the value of the command', () => {
			const button = editor.ui.componentFactory.create( 'imageTextAlternative' );

			// Mock the value of the input after some past editing.
			form.labeledInput.value = 'foo';

			// Mock the user using the form, changing the value but clicking "Cancel".
			// so the command's value is not updated.
			form.labeledInput.inputView.element.value = 'This value was canceled.';

			// Mock the user editing the same image once again.
			setData( model, '[<image src="" alt="foo"></image>]' );

			button.fire( 'execute' );
			expect( form.labeledInput.inputView.element.value ).to.equal( 'foo' );
		} );

		it( 'should execute command on submit', () => {
			const spy = sinon.spy( editor, 'execute' );
			form.fire( 'submit' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'imageTextAlternative', {
				newValue: form.labeledInput.inputView.element.value
			} );
		} );

		it( 'should hide the panel on cancel and focus the editing view', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );

			setData( model, '[<image src="" alt="foo bar"></image>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );

			form.fire( 'cancel' );
			expect( balloon.visibleView ).to.be.null;
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not engage when the form is in the balloon yet invisible', () => {
			setData( model, '[<image src=""></image>]' );
			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).to.equal( lastView );

			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( lastView );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1501
		it( 'should blur url input element before hiding the view', () => {
			setData( model, '[<image src="" alt="foo bar"></image>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );

			const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );
			const buttonFocusSpy = sinon.spy( form.saveButtonView, 'focus' );

			form.focusTracker.isFocused = true;

			form.fire( 'submit' );

			expect( buttonFocusSpy.calledBefore( editableFocusSpy ) ).to.equal( true );
		} );

		// https://github.com/ckeditor/ckeditor5-image/issues/299
		it( 'should not blur url input element before hiding the view when view was not focused', () => {
			setData( model, '[<image src="" alt="foo bar"></image>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );

			const buttonFocusSpy = sinon.spy( form.saveButtonView, 'focus' );

			form.focusTracker.isFocused = false;

			form.fire( 'cancel' );

			sinon.assert.notCalled( buttonFocusSpy );
		} );

		it( 'should be removed from balloon when is in not visible stack', () => {
			setData( model, '<paragraph>foo</paragraph>[<image src="" alt="foo bar"></image>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );

			const customView = new View();

			balloon.add( {
				view: customView,
				position: { target: {} },
				stackId: 'custom'
			} );

			balloon.showStack( 'custom' );

			model.change( writer => {
				const root = model.document.getRoot();

				writer.setSelection( root.getChild( 0 ), 0 );
			} );

			expect( balloon.hasView( form ) ).to.equal( false );
		} );

		describe( 'integration with the editor selection (ui#update event)', () => {
			it( 'should re-position the form', () => {
				setData( model, '[<image src=""></image>]' );
				button.fire( 'execute' );

				const spy = sinon.spy( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should hide the form and focus editable when image widget has been removed by external change', () => {
				setData( model, '[<image src=""></image>]' );
				button.fire( 'execute' );

				const removeSpy = sinon.spy( balloon, 'remove' );
				const focusSpy = sinon.spy( editor.editing.view, 'focus' );

				model.enqueueChange( 'transparent', writer => {
					writer.remove( doc.selection.getFirstRange() );
				} );

				sinon.assert.calledWithExactly( removeSpy, form );
				sinon.assert.calledOnce( focusSpy );
			} );
		} );

		describe( 'close listeners', () => {
			describe( 'keyboard', () => {
				it( 'should close upon Esc key press and focus the editing view', () => {
					const hideSpy = sinon.spy( plugin, '_hideForm' );
					const focusSpy = sinon.spy( editor.editing.view, 'focus' );

					setData( model, '[<image src=""></image>]' );
					button.fire( 'execute' );

					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					form.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( hideSpy );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( focusSpy );
				} );
			} );

			describe( 'mouse', () => {
				it( 'should close and not focus editable on click outside the panel', () => {
					const hideSpy = sinon.spy( plugin, '_hideForm' );
					const focusSpy = sinon.spy( editor.editing.view, 'focus' );

					setData( model, '[<image src=""></image>]' );
					button.fire( 'execute' );

					global.document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					sinon.assert.called( hideSpy );
					sinon.assert.notCalled( focusSpy );
				} );

				it( 'should not close on click inside the panel', () => {
					const spy = sinon.spy( plugin, '_hideForm' );

					setData( model, '[<image src=""></image>]' );
					button.fire( 'execute' );

					form.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					sinon.assert.notCalled( spy );
				} );
			} );
		} );
	} );
} );
