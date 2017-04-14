/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '../src/link';
import LinkEngine from '../src/linkengine';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
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
			plugins: [ Link, Paragraph ]
		} )
		.then( newEditor => {
			newEditor.editing.view.attachDomRoot( editorElement );

			editor = newEditor;

			linkFeature = editor.plugins.get( Link );
			linkButton = editor.ui.componentFactory.create( 'link' );
			unlinkButton = editor.ui.componentFactory.create( 'unlink' );
			balloon = editor.plugins.get( ContextualBalloon );
			formView = linkFeature.formView;

			// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
			testUtils.sinon.stub( balloon.view, 'attachTo', () => {} );
			testUtils.sinon.stub( balloon.view, 'pin', () => {} );

			return formView.init();
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

	describe( '_showPanel()', () => {
		let balloonAddSpy;

		beforeEach( () => {
			balloonAddSpy = testUtils.sinon.spy( balloon, 'add' );
			editor.editing.view.isFocused = true;
		} );

		it( 'should return promise', () => {
			const returned = linkFeature._showPanel();

			expect( returned ).to.instanceof( Promise );

			return returned;
		} );

		it( 'should add #formView to the #_balloon and attach the #_balloon to the selection when text fragment is selected', () => {
			setModelData( editor.document, '<paragraph>f[o]o</paragraph>' );
			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			return linkFeature._showPanel()
				.then( () => {
					expect( balloon.visibleView ).to.equal( formView );

					sinon.assert.calledWithExactly( balloonAddSpy, {
						view: formView,
						position: {
							target: selectedRange,
							limiter: editorElement
						}
					} );
				} );
		} );

		it( 'should add #formView to the #_balloon and attach the #_balloon to the selection when selection is collapsed', () => {
			setModelData( editor.document, '<paragraph>f[]oo</paragraph>' );
			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			return linkFeature._showPanel()
				.then( () => {
					expect( balloon.visibleView ).to.equal( formView );

					sinon.assert.calledWithExactly( balloonAddSpy, {
						view: formView,
						position: {
							target: selectedRange,
							limiter: editorElement
						}
					} );
				} );
		} );

		it( 'should add #formView to the #_balloon and attach the #_balloon to the link element when collapsed selection is inside ' +
			'that link',
		() => {
			setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );
			const linkElement = editorElement.querySelector( 'a' );

			return linkFeature._showPanel()
				.then( () => {
					expect( balloon.visibleView ).to.equal( formView );

					sinon.assert.calledWithExactly( balloonAddSpy, {
						view: formView,
						position: {
							target: linkElement,
							limiter: editorElement
						}
					} );
				} );
		} );

		it( 'should not focus the #formView at default', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			return linkFeature._showPanel()
				.then( () => {
					sinon.assert.notCalled( spy );
				} );
		} );

		it( 'should not focus the #formView when called with a `false` parameter', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			return linkFeature._showPanel( false )
				.then( () => {
					sinon.assert.notCalled( spy );
				} );
		} );

		it( 'should not focus the #formView when called with a `true` parameter while the balloon is opened but link form is not visible', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );
			const viewMock = {
				ready: true,
				init: () => {},
				destroy: () => {}
			};

			return linkFeature._showPanel( false )
				.then( () => balloon.add( { view: viewMock } ) )
				.then( () => linkFeature._showPanel( true ) )
				.then( () => {
					sinon.assert.notCalled( spy );
				} );
		} );

		it( 'should focus the #formView when called with a `true` parameter', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			return linkFeature._showPanel( true )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should focus the #formView when called with a `true` parameter while the balloon is open and the #formView is visible', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			return linkFeature._showPanel( false )
				.then( () => linkFeature._showPanel( true ) )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should keep the editor ui focused when the #_balloon is shown with the selected form', () => {
			editor.ui.focusTracker.isFocused = false;

			// Open the #_balloon with the link inside.
			return linkFeature._showPanel( true )
				.then( () => {
					// Check if editor ui is focused.
					expect( editor.ui.focusTracker.isFocused ).to.true;
				} );
		} );
	} );

	describe( '_hidePanel()', () => {
		beforeEach( () => {
			return balloon.add( { view: formView } );
		} );

		it( 'should remove #formView from the #_balloon', () => {
			linkFeature._hidePanel();
			expect( balloon.hasView( formView ) ).to.false;
		} );

		it( 'should not focus the `editable` by default', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			linkFeature._hidePanel();
			sinon.assert.notCalled( spy );
		} );

		it( 'should not focus the `editable` when called with a `false` parameter', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			linkFeature._hidePanel( false );
			sinon.assert.notCalled( spy );
		} );

		it( 'should focus the `editable` when called with a `true` parameter', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			linkFeature._hidePanel( true );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not throw an error when #formView is not added to the `balloon`', () => {
			linkFeature._hidePanel( true );

			expect( () => {
				linkFeature._hidePanel( true );
			} ).to.not.throw();
		} );

		it( 'should clear `render` listener from ViewDocument', () => {
			const spy = sinon.spy();

			linkFeature.listenTo( editor.editing.view, 'render', spy );

			linkFeature._hidePanel();

			editor.editing.view.render();

			sinon.assert.notCalled( spy );
		} );
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

		it( 'should show the #_balloon on execute event with the selected #formView', () => {
			// Method is stubbed because it returns internal promise which can't be returned in test.
			const spy = testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

			linkButton.fire( 'execute' );

			sinon.assert.calledWithExactly( spy, true );
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

	describe( 'keyboard support', () => {
		it( 'should show the #_balloon with selected #formView on `CTRL+K` keystroke', () => {
			// Method is stubbed because it returns internal promise which can't be returned in test.
			const spy = testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

			editor.keystrokes.press( { keyCode: keyCodes.k, ctrlKey: true } );

			sinon.assert.calledWithExactly( spy, true );
		} );

		it( 'should focus the the #formView on `Tab` key press when the #_balloon is open', () => {
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
			return linkFeature._showPanel( true )
				.then( () => {
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
		} );

		it( 'should hide the #_balloon after Esc key press (from editor) and not focus the editable', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is visible.
			return linkFeature._showPanel( false ).then( () => {
				editor.keystrokes.press( keyEvtData );

				sinon.assert.calledWithExactly( spy );
			} );
		} );

		it( 'should not hide #_balloon after Esc key press (from editor) when #_balloon is open but is not visible', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			const viewMock = {
				ready: true,
				init: () => {},
				destroy: () => {}
			};

			return linkFeature._showPanel( false )
				.then( () => balloon.add( { view: viewMock } ) )
				.then( () => {
					editor.keystrokes.press( keyEvtData );

					sinon.assert.notCalled( spy );
				} );
		} );

		it( 'should hide the #_balloon after Esc key press (from the form) and focus the editable', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			return linkFeature._showPanel( true )
				.then( () => {
					formView.keystrokes.press( keyEvtData );

					sinon.assert.calledWithExactly( spy, true );
				} );
		} );
	} );

	describe( 'mouse support', () => {
		it( 'should hide #_balloon and not focus editable on click outside the #_balloon', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );

			return linkFeature._showPanel( true )
				.then( () => {
					document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

					sinon.assert.calledWithExactly( spy );
				} );
		} );

		it( 'should not hide #_balloon on click inside the #_balloon', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );

			return linkFeature._showPanel( true )
				.then( () => {
					balloon.view.element.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

					sinon.assert.notCalled( spy );
				} );
		} );

		describe( 'clicking on editable', () => {
			let observer;

			beforeEach( () => {
				observer = editor.editing.view.getObserver( ClickObserver );
			} );

			it( 'should open with not selected formView when collapsed selection is inside link element', () => {
				// Method is stubbed because it returns internal promise which can't be returned in test.
				const spy = testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">fo[]o</$text>' );

				observer.fire( 'click', { target: document.body } );

				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should keep open and update position until collapsed selection stay inside the same link element', () => {
				// Method is stubbed because it returns internal promise which can't be returned in test.
				const showSpy = testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );
				const hideSpy = testUtils.sinon.stub( linkFeature, '_hidePanel' );
				const updatePositionSpy = testUtils.sinon.stub( balloon, 'updatePosition', () => {} );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				// Panel is shown.
				sinon.assert.calledOnce( showSpy );

				// Move selection.
				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				// Check if balloon is still opened (wasn't hide).
				sinon.assert.notCalled( hideSpy );
				// And position was updated
				sinon.assert.calledOnce( updatePositionSpy );
			} );

			it( 'should not duplicate `render` listener on `ViewDocument`', () => {
				const updatePositionSpy = testUtils.sinon.stub( balloon, 'updatePosition', () => {} );

				// Method is stubbed because it returns internal promise which can't be returned in test.
				testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

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
				const hideSpy = testUtils.sinon.stub( linkFeature, '_hidePanel' );

				// Method is stubbed because it returns internal promise which can't be returned in test.
				testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, 'foo <$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				sinon.assert.notCalled( hideSpy );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 3, text, 3 ) ], true );
				editor.editing.view.render();

				sinon.assert.calledOnce( hideSpy );
			} );

			it( 'should close when selection goes to the other link element with the same href', () => {
				const hideSpy = testUtils.sinon.stub( linkFeature, '_hidePanel' );

				// Method is stubbed because it returns internal promise which can't be returned in test.
				testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[]oo</$text> bar <$text linkHref="url">biz</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 2 ).getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				sinon.assert.notCalled( hideSpy );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				sinon.assert.calledOnce( hideSpy );
			} );

			it( 'should close when selection becomes non-collapsed', () => {
				const hideSpy = testUtils.sinon.stub( linkFeature, '_hidePanel' );

				// Method is stubbed because it returns internal promise which can't be returned in test.
				testUtils.sinon.stub( linkFeature, '_showPanel', () => {} );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[]oo</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: {} } );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 2 ) ] );
				editor.editing.view.render();

				sinon.assert.calledOnce( hideSpy );
			} );

			it( 'should not open when selection is not inside link element', () => {
				const showSpy = testUtils.sinon.stub( linkFeature, '_showPanel' );

				setModelData( editor.document, '[]' );

				observer.fire( 'click', { target: {} } );

				sinon.assert.notCalled( showSpy );
			} );

			it( 'should not open when selection is non-collapsed', () => {
				const showSpy = testUtils.sinon.stub( linkFeature, '_showPanel' );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[o]o</$text>' );

				observer.fire( 'click', { target: {} } );

				sinon.assert.notCalled( showSpy );
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
				return linkFeature._showPanel()
					.then( () => {
						formView.fire( 'submit' );

						expect( balloon.visibleView ).to.null;
						expect( focusEditableSpy.calledOnce ).to.true;
					} );
			} );

			it( 'should execute unlink command on formView#unlink event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				formView.fire( 'unlink' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
			} );

			it( 'should hide and focus editable on formView#unlink event', () => {
				return linkFeature._showPanel()
					.then( () => {
						formView.fire( 'unlink' );

						expect( balloon.visibleView ).to.null;
						expect( focusEditableSpy.calledOnce ).to.true;
					} );
			} );

			it( 'should hide and focus editable on formView#cancel event', () => {
				return linkFeature._showPanel()
					.then( () => {
						formView.fire( 'cancel' );

						expect( balloon.visibleView ).to.null;
						expect( focusEditableSpy.calledOnce ).to.true;
					} );
			} );
		} );
	} );
} );
