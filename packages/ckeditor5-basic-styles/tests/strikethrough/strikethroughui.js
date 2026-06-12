/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { StrikethroughEditing } from '../../src/strikethrough/strikethroughediting.js';
import { StrikethroughUI } from '../../src/strikethrough/strikethroughui.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { env, keyCodes } from '@ckeditor/ckeditor5-utils';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'StrikethroughUI', () => {
	let editor, strikeView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, StrikethroughEditing, StrikethroughUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		vi.restoreAllMocks();

		return editor.destroy();
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			strikeView = editor.ui.componentFactory.create( 'strikethrough' );
		} );

		testButton();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StrikethroughUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StrikethroughUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			strikeView = editor.ui.componentFactory.create( 'menuBar:strikethrough' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( strikeView.role ).to.equal( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			strikeView.render();

			strikeView.isOn = true;
			expect( strikeView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );

			strikeView.isOn = false;
			expect( strikeView.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register strikethrough feature component', () => {
			expect( strikeView ).to.be.instanceOf( ButtonView );
			expect( strikeView.isOn ).to.be.false;
			expect( strikeView.label ).to.equal( 'Strikethrough' );
			expect( strikeView.icon ).to.match( /<svg / );
			expect( strikeView.keystroke ).to.equal( 'CTRL+SHIFT+X' );
			expect( strikeView.isToggleable ).to.be.true;
		} );

		it( 'should execute strikethrough command on model execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			strikeView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'strikethrough' );
		} );

		it( 'should bind model to strikethrough command', () => {
			const command = editor.commands.get( 'strikethrough' );

			expect( strikeView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( strikeView.isEnabled ).to.be.false;
		} );

		it( 'should set keystroke in the model', () => {
			expect( strikeView.keystroke ).to.equal( 'CTRL+SHIFT+X' );
		} );

		it( 'should set editor keystroke', () => {
			const spy = vi.spyOn( editor, 'execute' );
			const keyEventData = {
				keyCode: keyCodes.x,
				shiftKey: true,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			const wasHandled = editor.keystrokes.press( keyEventData );

			expect( wasHandled ).to.be.true;
			expect( spy ).toHaveBeenCalledOnce();
			expect( keyEventData.preventDefault ).toHaveBeenCalledOnce();
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'strikethrough' );

			command.value = true;

			expect( strikeView.isOn ).to.be.true;

			command.value = false;

			expect( strikeView.isOn ).to.be.false;
		} );
	}
} );
