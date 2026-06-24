/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconHeading2 } from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { HeadingEditing } from '../src/headingediting.js';
import { HeadingButtonsUI } from '../src/headingbuttonsui.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { getLocalizedOptions } from '../src/utils.js';

describe( 'HeadingButtonUI', () => {
	let editorElement, editor;

	describe( 'default config', () => {
		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ HeadingButtonsUI, HeadingEditing ],
					toolbar: [ 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ],
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
							{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
							{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' },
							{ model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4' },
							{ model: 'heading5', view: 'h6', title: 'Heading 5', class: 'ck-heading_heading5' },
							{ model: 'heading6', view: 'p', title: 'Heading 6', class: 'ck-heading_heading6' }
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					// Set data so the commands will be enabled.
					_setModelData( editor.model, '<heading1>f{}oo</heading1>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should define default buttons', () => {
			const factory = editor.ui.componentFactory;

			expect( factory.create( 'heading1' ) ).toBeInstanceOf( ButtonView );
			expect( factory.create( 'heading2' ) ).toBeInstanceOf( ButtonView );
			expect( factory.create( 'heading3' ) ).toBeInstanceOf( ButtonView );
			expect( factory.create( 'heading4' ) ).toBeInstanceOf( ButtonView );
			expect( factory.create( 'heading5' ) ).toBeInstanceOf( ButtonView );
			expect( factory.create( 'heading6' ) ).toBeInstanceOf( ButtonView );
		} );

		it( 'should initialize buttons with correct localized data', () => {
			const localizedOptions = getLocalizedOptions( editor ).filter( option => option.model == 'heading2' )[ 0 ];
			const heading2Button = editor.ui.componentFactory.create( 'heading2' );

			expect( heading2Button.label ).toEqual( localizedOptions.title );
			expect( heading2Button.icon ).toEqual( IconHeading2 );
			expect( heading2Button.tooltip ).toEqual( true );
		} );

		it( 'should bind buttons to correct commands', () => {
			const headingButton = editor.ui.componentFactory.create( 'heading1' );
			const headingCommand = editor.commands.get( 'heading' );

			expect( headingCommand.isEnabled ).toBe( true );
			expect( headingButton.isEnabled ).toBe( true );

			headingCommand.isEnabled = false;
			expect( headingButton.isEnabled ).toBe( false );

			expect( headingCommand.value ).toEqual( 'heading1' );
			expect( headingButton.isOn ).toBe( true );

			_setModelData( editor.model, '<heading2>f{}oo</heading2>' );

			expect( headingCommand.value ).toEqual( 'heading2' );
			expect( headingButton.isOn ).toBe( false );
		} );

		it( 'should bind button execute to command execute', () => {
			const headingButton = editor.ui.componentFactory.create( 'heading1' );
			const executeCommandSpy = vi.spyOn( editor, 'execute' );

			headingButton.fire( 'execute' );

			expect( executeCommandSpy ).toHaveBeenCalledOnce();
			expect( executeCommandSpy ).toHaveBeenCalledWith( 'heading', { value: 'heading1' } );
		} );

		it( 'should be initialized as toggleable button', () => {
			const factory = editor.ui.componentFactory;

			expect( factory.create( 'heading1' ).isToggleable ).toBe( true );
			expect( factory.create( 'heading2' ).isToggleable ).toBe( true );
			expect( factory.create( 'heading3' ).isToggleable ).toBe( true );
			expect( factory.create( 'heading4' ).isToggleable ).toBe( true );
			expect( factory.create( 'heading5' ).isToggleable ).toBe( true );
			expect( factory.create( 'heading6' ).isToggleable ).toBe( true );
		} );
	} );

	describe( 'custom config', () => {
		const customIcon = '<svg></svg>';

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					heading: {
						options: [
							{ model: 'paragraph' },
							{ model: 'heading1', view: 'h2', icon: customIcon }
						]
					},
					plugins: [ HeadingButtonsUI, HeadingEditing ],
					toolbar: [ 'heading1', 'heading2', 'heading3' ]
				} )
				.then( newEditor => {
					editor = newEditor;

					// Set data so the commands will be enabled.
					_setModelData( editor.model, '<heading1>f{}oo</heading1>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should allow to pass custom image to the configuration', () => {
			const headingButton = editor.ui.componentFactory.create( 'heading1' );

			expect( headingButton.icon ).toEqual( customIcon );
		} );
	} );
} );
