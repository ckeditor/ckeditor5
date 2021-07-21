import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import FindAndReplaceUI from '../src/findandreplaceui';
import FindAndReplace from '../src/findandreplace';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import loupeIcon from '../theme/icons/find-replace.svg';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';

describe( 'FindAndReplaceUI', () => {
	let editorElement;
	let editor;
	let dropdown;
	let findCommand;
	let button;
	let form;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ FindAndReplace ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dropdown = editor.ui.componentFactory.create( 'findAndReplace' );
				form = dropdown.panelView.children.get( 0 );
				button = dropdown.buttonView;
				findCommand = editor.commands.get( 'find' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( FindAndReplaceUI.pluginName ).to.equal( 'FindAndReplaceUI' );
	} );

	it( 'should add the "findAndReplace" component to the factory', () => {
		expect( dropdown ).to.be.instanceOf( DropdownView );
	} );

	it( 'should allow creating two instances', () => {
		let secondInstance;

		expect( function createSecondInstance() {
			secondInstance = editor.ui.componentFactory.create( 'findAndReplace' );
		} ).not.to.throw();
		expect( dropdown ).to.not.equal( secondInstance );
	} );

	describe( 'dropdown', () => {
		it( 'should delegate dropdown:closed event', () => {
			const plugin = editor.plugins.get( 'FindAndReplaceUI' );
			const spy = sinon.spy();

			plugin.on( 'dropdown:closed', spy );

			dropdown.fire( 'change:isOpen', 'isClosed', false );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not delegate dropdown:closed event when the UI is opened', () => {
			const plugin = editor.plugins.get( 'FindAndReplaceUI' );
			const spy = sinon.spy();

			plugin.on( 'dropdown:closed', spy );

			dropdown.fire( 'change:isOpen', 'isClosed', true );

			expect( spy.calledOnce ).to.be.false;
		} );

		it( 'should not enable dropdown when find command is disabled', () => {
			findCommand.isEnabled = true;
			expect( dropdown ).to.have.property( 'isEnabled', true );

			findCommand.isEnabled = false;
			expect( dropdown ).to.have.property( 'isEnabled', false );
		} );

		describe( 'button', () => {
			it( 'should set an #icon of the #buttonView', () => {
				expect( dropdown.buttonView.icon ).to.equal( loupeIcon );
			} );

			it( 'should set a #label of the #buttonView', () => {
				expect( dropdown.buttonView.label ).to.equal( 'Find and replace' );
			} );

			it( 'should set a #tooltip of the #buttonView', () => {
				expect( dropdown.buttonView.tooltip ).to.be.true;
			} );

			it( 'should set a #keystroke of the #buttonView', () => {
				expect( dropdown.buttonView.keystroke ).to.equal( 'CTRL+F' );
			} );

			describe( '#open event', () => {
				it( 'executes the actions with the "low" priority', () => {
					const spy = sinon.spy();
					const selectSpy = sinon.spy( form.findInputView.fieldView, 'select' );

					button.on( 'open', () => {
						spy();
					} );

					button.fire( 'open' );
					sinon.assert.callOrder( spy, selectSpy );
				} );

				it( 'should open the dropdown when CTRL+F was pressed', () => {
					const spy = sinon.spy( form.findInputView.fieldView, 'select' );

					const keyEventData = ( {
						keyCode: keyCodes.f,
						ctrlKey: !env.isMac,
						metaKey: env.isMac,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					} );

					const wasHandled = editor.keystrokes.press( keyEventData );

					expect( wasHandled ).to.be.true;
					expect( keyEventData.preventDefault.calledOnce ).to.be.true;
					sinon.assert.calledOnce( spy );
				} );

				it( 'should select the content of the input', () => {
					const spy = sinon.spy( form.findInputView.fieldView, 'select' );

					button.fire( 'open' );
					sinon.assert.calledOnce( spy );
				} );

				it( 'should focus the form', () => {
					const spy = sinon.spy( form, 'focus' );

					button.fire( 'open' );
					sinon.assert.calledOnce( spy );
				} );

				it( 'should disable CSS transitions to avoid unnecessary animations (and then enable them again)', () => {
					// (#10008)
					const disableCssTransitionsSpy = sinon.spy( form, 'disableCssTransitions' );
					const enableCssTransitionsSpy = sinon.spy( form, 'enableCssTransitions' );
					const selectSpy = sinon.spy( form.findInputView.fieldView, 'select' );

					button.fire( 'open' );

					sinon.assert.callOrder( disableCssTransitionsSpy, selectSpy, enableCssTransitionsSpy );
				} );
			} );
		} );
	} );
} );
