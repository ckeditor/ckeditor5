/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconParagraph } from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '../src/paragraph.js';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ParagraphButtonUI } from '../src/paragraphbuttonui.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'HeadingButtonUI', () => {
	let editorElement, editor;

	describe( 'default config', () => {
		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, ParagraphButtonUI, Heading ],
					toolbar: [ 'paragraph' ]
				} )
				.then( newEditor => {
					editor = newEditor;
					_setModelData( editor.model, '<paragraph>f{}oo</paragraph>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should define default buttons', () => {
			const factory = editor.ui.componentFactory;

			expect( factory.create( 'paragraph' ) ).toBeInstanceOf( ButtonView );
		} );

		it( 'should intialize buttons with correct data', () => {
			const paragraphButton = editor.ui.componentFactory.create( 'paragraph' );

			expect( paragraphButton.label ).toEqual( 'Paragraph' );
			expect( paragraphButton.icon ).toEqual( IconParagraph );
			expect( paragraphButton.tooltip ).toEqual( true );
			expect( paragraphButton.isToggleable ).toEqual( true );
		} );

		it( 'should bind button to command', () => {
			const paragraphButton = editor.ui.componentFactory.create( 'paragraph' );
			const paragraphCommand = editor.commands.get( 'paragraph' );

			expect( paragraphCommand.isEnabled ).toBe( true );
			expect( paragraphButton.isEnabled ).toBe( true );

			paragraphCommand.isEnabled = false;
			expect( paragraphButton.isEnabled ).toBe( false );

			expect( paragraphCommand.value ).toBe( true );
			expect( paragraphButton.isOn ).toBe( true );

			_setModelData( editor.model, '<heading2>f{}oo</heading2>' );

			expect( paragraphCommand.value ).toBe( false );
			expect( paragraphButton.isOn ).toBe( false );
		} );

		it( 'should bind button execute to command execute', () => {
			const pararaphButton = editor.ui.componentFactory.create( 'paragraph' );
			const executeCommandSpy = vi.spyOn( editor, 'execute' );

			pararaphButton.fire( 'execute' );

			expect( executeCommandSpy ).toHaveBeenCalledOnce();
			expect( executeCommandSpy ).toHaveBeenCalledWith( 'paragraph' );
		} );
	} );
} );
