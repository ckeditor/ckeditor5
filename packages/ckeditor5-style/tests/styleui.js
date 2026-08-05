/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { DropdownView } from '@ckeditor/ckeditor5-ui';
import { EventInfo } from '@ckeditor/ckeditor5-utils';

import { Style } from '../src/style.js';
import { StyleUI } from '../src/styleui.js';
import { StylePanelView } from '../src/ui/stylepanelview.js';

describe( 'StyleUI', () => {
	let editor, element;

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
		expect( StyleUI.pluginName ).toBe( 'StyleUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StyleUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StyleUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded by the Style plugin', () => {
		expect( editor.plugins.has( 'StyleUI' ) ).toBe( true );
	} );

	describe( 'init', () => {
		describe( 'style dropdown component', () => {
			let dropdown, command;

			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'style' );
				dropdown.render();

				document.body.appendChild( dropdown.element );

				// Trigger lazy init.
				dropdown.isOpen = true;
				dropdown.isOpen = false;

				command = editor.commands.get( 'style' );
			} );

			afterEach( () => {
				dropdown.element.remove();
			} );

			it( 'should be registered in the component factory', () => {
				expect( editor.ui.componentFactory.has( 'style' ) ).toBe( true );
				expect( dropdown ).toBeInstanceOf( DropdownView );
			} );

			it( 'should have #isEnabled bound to the command', () => {
				command.isEnabled = true;

				expect( dropdown.isEnabled ).toBe( true );

				command.isEnabled = false;

				expect( dropdown.isEnabled ).toBe( false );
			} );

			it( 'should have a static CSS class', () => {
				expect( dropdown.element.classList.contains( 'ck-style-dropdown' ) ).toBe( true );
			} );

			it( 'should have a special CSS class when multiple styles are active', () => {
				command.value = [];

				expect( dropdown.class ).toBe( 'ck-style-dropdown' );

				command.value = [ 'foo' ];

				expect( dropdown.class ).toBe( 'ck-style-dropdown' );

				command.value = [ 'foo', 'bar' ];

				expect( dropdown.class ).toBe( 'ck-style-dropdown ck-style-dropdown_multiple-active' );
			} );

			it( 'should close when a style was #executed in the panel', () => {
				const buttonMock = {
					styleDefinition: {
						name: 'foo'
					}
				};

				vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

				dropdown.isOpen = true;

				dropdown.panelView.children.first.fire( new EventInfo( buttonMock, 'execute' ) );

				expect( dropdown.isOpen ).toBe( false );
			} );

			describe( '#buttonView', () => {
				it( 'should display text and no icon', () => {
					expect( dropdown.buttonView.withText ).toBe( true );
					expect( dropdown.buttonView.icon ).toBeUndefined();
				} );

				it( 'should display default label when no styles are active', () => {
					command.value = [];

					expect( dropdown.buttonView.label ).toBe( 'Styles' );
				} );

				it( 'should display style name as a label when a single style is active', () => {
					command.value = [ 'foo' ];

					expect( dropdown.buttonView.label ).toBe( 'foo' );
				} );

				it( 'should display special label when multiple styles are active', () => {
					command.value = [ 'foo', 'bar' ];

					expect( dropdown.buttonView.label ).toBe( 'Multiple styles' );
				} );
			} );

			describe( 'styles panel', () => {
				let panel, commandExecuteStub;

				beforeEach( () => {
					panel = dropdown.panelView.children.first;

					commandExecuteStub = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
				} );

				it( 'should be injected into dropdown panel', () => {
					expect( dropdown.panelView.children.length ).toBe( 1 );
					expect( dropdown.panelView.children.first ).toBeInstanceOf( StylePanelView );
				} );

				it( 'should delegate #execute to the dropdown', () => {
					const spy = vi.fn();
					const buttonMock = {
						styleDefinition: {
							name: 'foo'
						}
					};

					dropdown.on( 'execute', spy );

					panel.fire( new EventInfo( buttonMock, 'execute' ) );

					expect( spy ).toHaveBeenCalledTimes( 1 );
					expect( spy.mock.calls[ 0 ] ).toHaveLength( 1 );
					expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( expect.any( Object ) );
				} );

				it( 'should execute the command on #execute event', () => {
					const buttonMock = {
						styleDefinition: {
							name: 'foo'
						}
					};

					panel.fire( new EventInfo( buttonMock, 'execute' ) );

					expect( commandExecuteStub ).toHaveBeenCalledTimes( 1 );
					expect( commandExecuteStub ).toHaveBeenCalledWith( 'style', { styleName: 'foo' } );
				} );

				it( 'should bind #activeStyles to the command', () => {
					command.value = [ 'foo', 'bar' ];

					expect( panel.activeStyles ).toEqual( [ 'foo', 'bar' ] );

					command.value = [];

					expect( panel.activeStyles ).toEqual( [] );
				} );

				it( 'should bind #enabledStyles to the command', () => {
					command.enabledStyles = [ 'foo', 'bar' ];

					expect( panel.enabledStyles ).toEqual( [ 'foo', 'bar' ] );

					command.enabledStyles = [];

					expect( panel.enabledStyles ).toEqual( [] );
				} );
			} );
		} );
	} );
} );
