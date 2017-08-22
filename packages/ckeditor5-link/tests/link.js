/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

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
	let editor, linkFeature, linkButton, balloon, formView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Link, Paragraph ]
			} )
			.then( newEditor => {
				newEditor.editing.view.attachDomRoot( editorElement );

				editor = newEditor;

				linkFeature = editor.plugins.get( Link );
				linkButton = editor.ui.componentFactory.create( 'link' );
				balloon = editor.plugins.get( ContextualBalloon );
				formView = linkFeature.formView;

				// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
				testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
				testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );

				formView.init();
			} );
	} );

	afterEach( () => {
		editorElement.remove();

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

		it( 'should add #formView to the #_balloon and attach the #_balloon to the selection when text fragment is selected', () => {
			setModelData( editor.document, '<paragraph>f[o]o</paragraph>' );
			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			linkFeature._showPanel();

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: selectedRange
				}
			} );
		} );

		it( 'should add #formView to the #_balloon and attach the #_balloon to the selection when selection is collapsed', () => {
			setModelData( editor.document, '<paragraph>f[]oo</paragraph>' );
			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			linkFeature._showPanel();

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: selectedRange
				}
			} );
		} );

		it( 'should add #formView to the #_balloon and attach the #_balloon to the link element when collapsed selection is inside ' +
			'that link',
		() => {
			setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );
			const linkElement = editorElement.querySelector( 'a' );

			linkFeature._showPanel();

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: linkElement
				}
			} );
		} );

		it( 'should not focus the #formView at default', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			linkFeature._showPanel();
			sinon.assert.notCalled( spy );
		} );

		it( 'should not focus the #formView when called with a `false` parameter', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			linkFeature._showPanel( false );
			sinon.assert.notCalled( spy );
		} );

		it( 'should not focus the #formView when called with a `true` parameter while the balloon is opened but link ' +
			'form is not visible', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );
			const viewMock = {
				ready: true,
				init: () => {},
				destroy: () => {}
			};

			linkFeature._showPanel( false );
			balloon.add( { view: viewMock } );
			linkFeature._showPanel( true );

			sinon.assert.notCalled( spy );
		} );

		it( 'should focus the #formView when called with a `true` parameter', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			linkFeature._showPanel( true );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the #formView when called with a `true` parameter while the balloon is open and the #formView is visible', () => {
			const spy = testUtils.sinon.spy( formView.urlInputView, 'select' );

			linkFeature._showPanel( false );
			linkFeature._showPanel( true );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should disable #formView elements when link and unlink commands are disabled', () => {
			setModelData( editor.document, '<paragraph>f[o]o</paragraph>' );

			linkFeature._showPanel();

			editor.commands.get( 'link' ).isEnabled = true;
			editor.commands.get( 'unlink' ).isEnabled = true;

			expect( formView.urlInputView.isReadOnly ).to.false;
			expect( formView.saveButtonView.isEnabled ).to.true;
			expect( formView.unlinkButtonView.isEnabled ).to.true;
			expect( formView.cancelButtonView.isEnabled ).to.true;

			editor.commands.get( 'link' ).isEnabled = false;
			editor.commands.get( 'unlink' ).isEnabled = false;

			expect( formView.urlInputView.isReadOnly ).to.true;
			expect( formView.saveButtonView.isEnabled ).to.false;
			expect( formView.unlinkButtonView.isEnabled ).to.false;
			expect( formView.cancelButtonView.isEnabled ).to.true;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/53
		it( 'should set formView.unlinkButtonView#isVisible depending on the selection in a link or not', () => {
			setModelData( editor.document, '<paragraph>f[]oo</paragraph>' );

			linkFeature._showPanel();
			expect( formView.unlinkButtonView.isVisible ).to.be.false;

			setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

			linkFeature._showPanel();
			expect( formView.unlinkButtonView.isVisible ).to.be.true;

			setModelData( editor.document, '<paragraph><$text linkHref="url">[fo]o</$text></paragraph>' );

			linkFeature._showPanel();
			expect( formView.unlinkButtonView.isVisible ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/78
		it( 'should make sure the URL input in the #formView always stays in sync with the value of the command (selected link)', () => {
			setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

			// Mock some leftover value **in DOM**, e.g. after previous editing.
			formView.urlInputView.inputView.element.value = 'leftover';

			linkFeature._showPanel();
			expect( formView.urlInputView.inputView.element.value ).to.equal( 'url' );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/123
		it( 'should make sure the URL input in the #formView always stays in sync with the value of the command (no link selected)', () => {
			setModelData( editor.document, '<paragraph>f[]oo</paragraph>' );

			linkFeature._showPanel();
			expect( formView.urlInputView.inputView.element.value ).to.equal( '' );
		} );

		describe( 'when the document is rendering', () => {
			it( 'should not duplicate #render listeners', () => {
				const viewDocument = editor.editing.view;

				setModelData( editor.document, '<paragraph>f[]oo</paragraph>' );

				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				linkFeature._showPanel();
				viewDocument.render();
				linkFeature._hidePanel();

				linkFeature._showPanel();
				viewDocument.render();
				sinon.assert.calledTwice( spy );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'updates the position of the panel – editing a link, then the selection remains in the link upon #render', () => {
				const viewDocument = editor.editing.view;

				setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkFeature._showPanel();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 0 ).getChild( 0 );

				// Move selection to foo[].
				viewDocument.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 3, text, 3 ) ], true );
				viewDocument.render();

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: viewDocument.domConverter.mapViewToDom( root.getChild( 0 ).getChild( 0 ) )
				} );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'updates the position of the panel – creating a new link, then the selection moved upon #render', () => {
				const viewDocument = editor.editing.view;

				setModelData( editor.document, '<paragraph>f[]oo</paragraph>' );

				linkFeature._showPanel();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				// Fires #render.
				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				viewDocument.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 3, text, 3 ) ], true );
				viewDocument.render();

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: editorElement.ownerDocument.getSelection().getRangeAt( 0 )
				} );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides of the panel – editing a link, then the selection moved out of the link upon #render', () => {
				const viewDocument = editor.editing.view;

				setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text>bar</paragraph>' );

				linkFeature._showPanel();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkFeature, '_hidePanel' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 1 );

				// Move selection to b[]ar.
				viewDocument.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				viewDocument.render();

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides of the panel – editing a link, then the selection moved to another link upon #render', () => {
				const viewDocument = editor.editing.view;

				setModelData(
					editor.document,
					'<paragraph><$text linkHref="url">f[]oo</$text>bar<$text linkHref="url">b[]az</$text></paragraph>'
				);

				linkFeature._showPanel();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkFeature, '_hidePanel' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 2 ).getChild( 0 );

				// Move selection to b[]az.
				viewDocument.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				viewDocument.render();

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides the panel – editing a link, then the selection expands upon #render', () => {
				const viewDocument = editor.editing.view;

				setModelData( editor.document, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkFeature._showPanel();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkFeature, '_hidePanel' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 0 ).getChild( 0 );

				// Move selection to f[o]o.
				viewDocument.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 2 ) ], true );
				viewDocument.render();

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
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
			const spy = testUtils.sinon.stub( linkFeature, '_showPanel' ).returns( {} );

			linkButton.fire( 'execute' );
			sinon.assert.calledWithExactly( spy, true );
		} );
	} );

	describe( 'keyboard support', () => {
		it( 'should show the #_balloon with selected #formView on Ctrl+K keystroke', () => {
			const spy = testUtils.sinon.stub( linkFeature, '_showPanel' ).returns( {} );
			const command = editor.commands.get( 'link' );

			command.isEnabled = false;
			editor.keystrokes.press( { keyCode: keyCodes.k, ctrlKey: true } );
			sinon.assert.notCalled( spy );

			command.isEnabled = true;
			editor.keystrokes.press( { keyCode: keyCodes.k, ctrlKey: true } );
			sinon.assert.calledWithExactly( spy, true );
		} );

		it( 'should focus the the #formView on `Tab` key press when the #_balloon is open', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const normalPriorityTabCallbackSpy = sinon.spy();
			const highestPriorityTabCallbackSpy = sinon.spy();
			editor.keystrokes.set( 'Tab', normalPriorityTabCallbackSpy );
			editor.keystrokes.set( 'Tab', highestPriorityTabCallbackSpy, { priority: 'highest' } );

			// Balloon is invisible, form not focused.
			formView.focusTracker.isFocused = false;

			const spy = sinon.spy( formView, 'focus' );

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledOnce( normalPriorityTabCallbackSpy );
			sinon.assert.calledOnce( highestPriorityTabCallbackSpy );

			// Balloon is visible, form focused.
			linkFeature._showPanel( true );
			formView.focusTracker.isFocused = true;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledTwice( highestPriorityTabCallbackSpy );

			// Balloon is still visible, form not focused.
			formView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledThrice( highestPriorityTabCallbackSpy );
		} );

		it( 'should hide the #_balloon after Esc key press (from editor) and not focus the editable', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is visible.
			linkFeature._showPanel( false );
			editor.keystrokes.press( keyEvtData );

			sinon.assert.calledWithExactly( spy );
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

			linkFeature._showPanel( false );
			balloon.add( { view: viewMock } );
			editor.keystrokes.press( keyEvtData );

			sinon.assert.notCalled( spy );
		} );

		it( 'should hide the #_balloon after Esc key press (from the form) and focus the editable', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			linkFeature._showPanel( true );

			formView.keystrokes.press( keyEvtData );
			sinon.assert.calledWithExactly( spy, true );
		} );
	} );

	describe( 'mouse support', () => {
		it( 'should hide #_balloon and not focus editable on click outside the #_balloon', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );

			linkFeature._showPanel( true );
			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should not hide #_balloon on click inside the #_balloon', () => {
			const spy = testUtils.sinon.spy( linkFeature, '_hidePanel' );

			linkFeature._showPanel( true );
			balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
		} );

		describe( 'clicking on editable', () => {
			let observer, spy;

			beforeEach( () => {
				observer = editor.editing.view.getObserver( ClickObserver );
				editor.document.schema.allow( { name: '$text', inside: '$root' } );

				spy = testUtils.sinon.stub( linkFeature, '_showPanel' ).returns( {} );
			} );

			it( 'should open with not selected formView when collapsed selection is inside link element', () => {
				setModelData( editor.document, '<$text linkHref="url">fo[]o</$text>' );

				observer.fire( 'click', { target: document.body } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should open when selection exclusively encloses a LinkElement (#1)', () => {
				setModelData( editor.document, '[<$text linkHref="url">foo</$text>]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should open when selection exclusively encloses a LinkElement (#2)', () => {
				setModelData( editor.document, '<$text linkHref="url">[foo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should not open when selection is not inside link element', () => {
				setModelData( editor.document, '[]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not open when selection is non-collapsed and doesn\'t enclose a LinkElement (#1)', () => {
				setModelData( editor.document, '<$text linkHref="url">f[o]o</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not open when selection is non-collapsed and doesn\'t enclose a LinkElement (#2)', () => {
				setModelData( editor.document, '<$text linkHref="url">[fo]o</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not open when selection is non-collapsed and doesn\'t enclose a LinkElement (#3)', () => {
				setModelData( editor.document, '<$text linkHref="url">f[oo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not open when selection is non-collapsed and doesn\'t enclose a LinkElement (#4)', () => {
				setModelData( editor.document, 'ba[r<$text linkHref="url">foo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not open when selection is non-collapsed and doesn\'t enclose a LinkElement (#5)', () => {
				setModelData( editor.document, 'ba[r<$text linkHref="url">foo</$text>]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );
		} );
	} );

	describe( 'link form', () => {
		let focusEditableSpy;

		beforeEach( () => {
			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should mark the editor ui as focused when the #formView is focused', () => {
			linkFeature._showPanel();
			editor.ui.focusTracker.isFocused = false;
			formView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.true;
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
				linkFeature._showPanel();
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
				linkFeature._showPanel();
				formView.fire( 'unlink' );

				expect( balloon.visibleView ).to.null;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should hide and focus editable on formView#cancel event', () => {
				linkFeature._showPanel();
				formView.fire( 'cancel' );

				expect( balloon.visibleView ).to.null;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );
		} );
	} );
} );
