/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Link from '../src/link';
import LinkEngine from '../src/linkengine';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/contextualballoon';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';

testUtils.createSinonSandbox();

describe( 'Link', () => {
	let editor, linkFeature, linkButton, unlinkButton, balloon, formView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Link ]
		} )
		.then( newEditor => {
			newEditor.editing.view.attachDomRoot( editorElement );

			editor = newEditor;

			linkFeature = editor.plugins.get( Link );
			linkButton = editor.ui.componentFactory.create( 'link' );
			unlinkButton = editor.ui.componentFactory.create( 'unlink' );
			balloon = editor.plugins.get( ContextualBalloon );
			formView = linkFeature.formView;

			// There is no point to execute `BalloonPanelView#attachTo` so override it.
			testUtils.sinon.stub( balloon.view, 'attachTo', () => {} );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( linkFeature ).to.instanceOf( Link );
	} );

	it( 'should load LinkEngine', () => {
		expect( editor.plugins.get( LinkEngine ) ).to.instanceOf( LinkEngine );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).to.instanceOf( ContextualBalloon );
	} );

	it( 'should register click observer', () => {
		expect( editor.editing.view.getObserver( ClickObserver ) ).to.instanceOf( ClickObserver );
	} );

	describe( 'link toolbar button', () => {
		it( 'should register link button', () => {
			expect( linkButton ).to.instanceOf( ButtonView );
		} );

		it( 'should bind linkButtonView to link command', () => {
			const command = editor.commands.get( 'link' );

			command.isEnabled = true;
			expect( linkButton.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( linkButton.isEnabled ).to.be.false;
		} );

		it( 'should add link form to the ContextualBalloon on execute event', () => {
			linkButton.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should add link form to the ContextualBalloon and attach balloon to the link element ' +
			'when collapsed selection is inside link element',
		() => {
			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			setModelData( editor.document, '<$text linkHref="url">some[] url</$text>' );
			editor.editing.view.isFocused = true;

			linkButton.fire( 'execute' );

			const linkElement = editorElement.querySelector( 'a' );

			sinon.assert.calledWithExactly( balloon.view.attachTo, sinon.match( {
				target: linkElement,
				limiter: editorElement
			} ) );
		} );

		it( 'should add link form to the ContextualBalloon and attach balloon to the selection, when selection is non-collapsed', () => {
			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			setModelData( editor.document, 'so[me ur]l' );
			editor.editing.view.isFocused = true;

			linkButton.fire( 'execute' );

			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			sinon.assert.calledWithExactly( balloon.view.attachTo, sinon.match( {
				target: selectedRange,
				limiter: editorElement
			} ) );
		} );

		it( 'should select link input value when link balloon is opened', () => {
			const selectUrlInputSpy = testUtils.sinon.spy( linkFeature.formView.urlInputView, 'select' );

			editor.editing.view.isFocused = true;

			linkButton.fire( 'execute' );

			expect( selectUrlInputSpy.calledOnce ).to.true;
		} );
	} );

	describe( 'unlink toolbar button', () => {
		it( 'should register unlink button', () => {
			expect( unlinkButton ).to.instanceOf( ButtonView );
		} );

		it( 'should bind unlinkButtonView to unlink command', () => {
			const command = editor.commands.get( 'unlink' );

			command.isEnabled = true;
			expect( unlinkButton.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( unlinkButton.isEnabled ).to.be.false;
		} );

		it( 'should execute unlink command on unlinkButtonView execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			unlinkButton.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.true;
			expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
		} );
	} );

	describe( 'ContextualBalloon', () => {
		let focusEditableSpy;

		beforeEach( () => {
			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should not be added to ContextualBalloon at default', () => {
			expect( balloon.visibleView ).to.null;
		} );

		it( 'should be added to ContextualBalloon and form should be selected on `CTRL+K` keystroke', () => {
			const selectUrlInputSpy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			editor.keystrokes.press( { keyCode: keyCodes.k, ctrlKey: true } );

			expect( balloon.visibleView ).to.equal( formView );
			expect( selectUrlInputSpy.calledOnce ).to.true;
		} );

		it( 'should not add panel to ContextualBalloon more than once', () => {
			// Add panel to balloon by pressing toolbar button.
			linkButton.fire( 'execute' );

			// Press button once again.
			expect( () => {
				linkButton.fire( 'execute' );
			} ).to.not.throw();
		} );

		it( 'should focus the link form on Tab key press', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is invisible, form not focused.
			formView.focusTracker.isFocused = false;

			const spy = sinon.spy( formView, 'focus' );

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );

			// Balloon is visible, form focused.
			balloon.add( { view: formView } );
			formView.focusTracker.isFocused = true;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );

			// Balloon is still visible, form not focused.
			formView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should keep editor ui focused when link form has focus', () => {
			editor.ui.focusTracker.isFocused = false;

			// Open balloon panel with link inside.
			linkButton.fire( 'execute' );

			// Be sure that form view is focused.
			formView.element.dispatchEvent( new Event( 'focus' ) );

			// Check if editor ui is focused.
			expect( editor.ui.focusTracker.isFocused ).to.true;
		} );

		describe( 'close listeners', () => {
			describe( 'keyboard', () => {
				it( 'should close after Esc key press (from editor) and not focus editable', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Balloon is visible.
					balloon.add( { view: formView } );

					editor.keystrokes.press( keyEvtData );

					expect( balloon.visibleView ).to.null;
					sinon.assert.notCalled( focusEditableSpy );
				} );

				it( 'should not close after Esc key press (from editor) when panel is in stack but not visible', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					const viewMock = {
						destroy: () => {}
					};

					balloon.add( { view: formView } );
					balloon.add( { view: viewMock } );

					editor.keystrokes.press( keyEvtData );

					expect( balloon.visibleView ).to.equal( viewMock );
					expect( balloon.hasView( formView ) ).to.true;
					sinon.assert.notCalled( focusEditableSpy );
				} );

				it( 'should close after Esc key press (from the form) and focus editable', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					balloon.add( { view: formView } );

					formView.keystrokes.press( keyEvtData );

					expect( balloon.visibleView ).to.null;
					sinon.assert.calledOnce( focusEditableSpy );
				} );
			} );

			describe( 'mouse', () => {
				it( 'should close and not focus editable on click outside the panel', () => {
					balloon.add( { view: formView } );
					document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

					expect( balloon.visibleView ).to.null;
					expect( focusEditableSpy.notCalled ).to.true;
				} );

				it( 'should not close on click inside the panel', () => {
					balloon.add( { view: formView } );
					balloon.view.element.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

					expect( balloon.visibleView ).to.equal( formView );
				} );
			} );
		} );

		describe( 'click on editable', () => {
			it( 'should open with not selected url input when collapsed selection is inside link element', () => {
				const selectUrlInputSpy = testUtils.sinon.spy( formView.urlInputView, 'select' );
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">fo[]o</$text>' );

				observer.fire( 'click', { target: document.body } );

				expect( balloon.visibleView ).to.equal( formView );
				expect( selectUrlInputSpy.notCalled ).to.true;
			} );

			it( 'should keep open and update position until collapsed selection stay inside the same link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				expect( balloon.visibleView ).to.equal( formView );

				// Reset attachTo call counter.
				balloon.view.attachTo.reset();

				// Move selection.
				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				// Check if balloon is still open and position was updated.
				expect( balloon.visibleView ).to.equal( formView );
				expect( balloon.view.attachTo.calledOnce ).to.true;
			} );

			it( 'should not duplicate `render` listener on `ViewDocument`', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );
				const updatePositionSpy = testUtils.sinon.spy( balloon, 'updatePosition' );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">b[]ar</$text>' );

				// Click at the same link more than once.
				observer.fire( 'click', { target: document.body } );
				observer.fire( 'click', { target: document.body } );
				observer.fire( 'click', { target: document.body } );

				sinon.assert.notCalled( updatePositionSpy );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				// Move selection.
				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				// Position should be updated only once.
				sinon.assert.calledOnce( updatePositionSpy );
			} );

			it( 'should close when selection goes outside the link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, 'foo <$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				expect( balloon.visibleView ).to.equal( formView );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 3, text, 3 ) ], true );
				editor.editing.view.render();

				expect( balloon.visibleView ).to.null;
			} );

			it( 'should close when selection goes to the other link element with the same href', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[]oo</$text> bar <$text linkHref="url">biz</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 2 ).getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				expect( balloon.visibleView ).to.equal( formView );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				expect( balloon.visibleView ).to.null;
			} );

			it( 'should close when selection becomes non-collapsed', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[]oo</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: {} } );

				expect( balloon.visibleView ).to.equal( formView );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 2 ) ] );
				editor.editing.view.render();

				expect( balloon.visibleView ).to.null;
			} );

			it( 'should stop updating position after close', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: {} } );

				expect( balloon.visibleView ).to.equal( formView );

				// Close balloon by dispatching `cancel` event on formView.
				formView.fire( 'cancel' );

				// Reset attachTo call counter.
				balloon.view.attachTo.reset();

				// Move selection inside link element.
				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 2, text, 2 ) ], true );
				editor.editing.view.render();

				expect( balloon.view.attachTo.notCalled ).to.true;
			} );

			it( 'should not open when selection is not inside link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				setModelData( editor.document, '[]' );

				observer.fire( 'click', { target: {} } );

				expect( balloon.visibleView ).to.null;
			} );

			it( 'should not open when selection is non-collapsed', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[o]o</$text>' );

				observer.fire( 'click', { target: document.body } );

				expect( balloon.visibleView ).to.null;
			} );
		} );
	} );

	describe( 'link form', () => {
		let focusEditableSpy;

		beforeEach( () => {
			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		describe( 'binding', () => {
			it( 'should bind formView.urlInputView#value to link command value', () => {
				const command = editor.commands.get( 'link' );

				expect( formView.urlInputView.value ).to.undefined;

				command.value = 'http://cksource.com';
				expect( formView.urlInputView.value ).to.equal( 'http://cksource.com' );
			} );

			it( 'should execute link command on formView#submit event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				formView.urlInputView.value = 'http://ckeditor.com';
				expect( formView.urlInputView.inputView.element.value ).to.equal( 'http://ckeditor.com' );

				formView.urlInputView.inputView.element.value = 'http://cksource.com';
				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'link', 'http://cksource.com' ) ).to.true;
			} );

			it( 'should hide and focus editable on formView#submit event', () => {
				balloon.add( { view: formView } );

				formView.fire( 'submit' );

				expect( balloon.visibleView ).to.null;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should execute unlink command on formView#unlink event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				formView.fire( 'unlink' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
			} );

			it( 'should hide and focus editable on formView#unlink event', () => {
				balloon.add( { view: formView } );

				formView.fire( 'unlink' );

				expect( balloon.visibleView ).to.null;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should hide and focus editable on formView#cancel event', () => {
				balloon.add( { view: formView } );

				formView.fire( 'cancel' );

				expect( balloon.visibleView ).to.null;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );
		} );
	} );
} );
