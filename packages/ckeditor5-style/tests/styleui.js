/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

import Style from '../src/style';
import StyleUI from '../src/styleui';
import StylePanelView from '../src/ui/stylepanelview';

describe( 'StyleUI', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ GeneralHtmlSupport, Style, Paragraph ]
		} );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StyleUI.pluginName ).to.equal( 'StyleUI' );
	} );

	it( 'should be loaded by the Style plugin', () => {
		expect( editor.plugins.has( 'StyleUI' ) ).to.be.true;
	} );

	describe( 'init', () => {
		describe( 'style dropdown component', () => {
			let dropdown, command;

			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'style' );
				command = editor.commands.get( 'style' );
			} );

			it( 'should be registered in the component factory', () => {
				expect( editor.ui.componentFactory.has( 'style' ) ).to.be.true;
				expect( dropdown ).to.be.instanceOf( DropdownView );
			} );

			it( 'should have #isEnabled bound to the command', () => {
				command.isEnabled = true;

				expect( dropdown.isEnabled ).to.be.true;

				command.isEnabled = false;

				expect( dropdown.isEnabled ).to.be.false;
			} );

			it( 'should have a static CSS class', () => {
				dropdown.render();

				expect( dropdown.element.classList.contains( 'ck-style-dropdown' ) ).to.be.true;
			} );

			it( 'should have a special CSS class when multiple styles are active', () => {
				command.value = [];

				expect( dropdown.class ).to.equal( 'ck-style-dropdown' );

				command.value = [ 'foo' ];

				expect( dropdown.class ).to.equal( 'ck-style-dropdown' );

				command.value = [ 'foo', 'bar' ];

				expect( dropdown.class ).to.equal( 'ck-style-dropdown ck-style-dropdown_multiple-active' );
			} );

			it( 'should close when a style was #executed in the panel', () => {
				const buttonMock = {
					styleDefinition: {
						name: 'foo'
					}
				};

				testUtils.sinon.stub( editor, 'execute' );

				dropdown.isOpen = true;

				dropdown.panelView.children.first.fire( new EventInfo( buttonMock, 'execute' ) );

				expect( dropdown.isOpen ).to.be.false;
			} );

			describe( '#buttonView', () => {
				it( 'should display text and no icon', () => {
					expect( dropdown.buttonView.withText ).to.be.true;
					expect( dropdown.buttonView.icon ).to.be.undefined;
				} );

				it( 'should display default label when no styles are active', () => {
					command.value = [];

					expect( dropdown.buttonView.label ).to.equal( 'Styles' );
				} );

				it( 'should display style name as a label when a single style is active', () => {
					command.value = [ 'foo' ];

					expect( dropdown.buttonView.label ).to.equal( 'foo' );
				} );

				it( 'should display special label when multiple styles are active', () => {
					command.value = [ 'foo', 'bar' ];

					expect( dropdown.buttonView.label ).to.equal( 'Multiple styles' );
				} );
			} );

			describe( 'styles panel', () => {
				let panel, commandExecuteStub;

				beforeEach( () => {
					panel = dropdown.panelView.children.first;

					commandExecuteStub = testUtils.sinon.stub( editor, 'execute' );
				} );

				it( 'should be injected into dropdown panel', () => {
					expect( dropdown.panelView.children.length ).to.equal( 1 );
					expect( dropdown.panelView.children.first ).to.be.instanceOf( StylePanelView );
				} );

				it( 'should delegate #execute to the dropdown', () => {
					const spy = sinon.spy();
					const buttonMock = {
						styleDefinition: {
							name: 'foo'
						}
					};

					dropdown.on( 'execute', spy );

					panel.fire( new EventInfo( buttonMock, 'execute' ) );

					sinon.assert.calledOnceWithExactly( spy, sinon.match.object );
				} );

				it( 'should execute the command on #execute event', () => {
					const buttonMock = {
						styleDefinition: {
							name: 'foo'
						}
					};

					panel.fire( new EventInfo( buttonMock, 'execute' ) );

					sinon.assert.calledOnceWithExactly( commandExecuteStub, 'style', 'foo' );
				} );

				it( 'should bind #activeStyles to the command', () => {
					command.value = [ 'foo', 'bar' ];

					expect( panel.activeStyles ).to.deep.equal( [ 'foo', 'bar' ] );

					command.value = [];

					expect( panel.activeStyles ).to.deep.equal( [] );
				} );

				it( 'should bind #enabledStyles to the command', () => {
					command.enabledStyles = [ 'foo', 'bar' ];

					expect( panel.enabledStyles ).to.deep.equal( [ 'foo', 'bar' ] );

					command.enabledStyles = [];

					expect( panel.enabledStyles ).to.deep.equal( [] );
				} );
			} );
		} );
	} );
} );
