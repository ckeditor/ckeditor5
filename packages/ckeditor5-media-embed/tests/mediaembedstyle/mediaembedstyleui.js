/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { ButtonView, DropdownView, SplitButtonView } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedStyleEditing } from '../../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleUI } from '../../src/mediaembedstyle/mediaembedstyleui.js';

const URL = 'https://youtu.be/foo';

const BUTTON_NAMES = [
	'mediaEmbed:alignLeft',
	'mediaEmbed:alignBlockLeft',
	'mediaEmbed:alignCenter',
	'mediaEmbed:alignBlockRight',
	'mediaEmbed:alignRight'
];

const DROPDOWN_NAMES = [
	'mediaEmbed:wrapText',
	'mediaEmbed:breakText'
];

describe( 'MediaEmbedStyleUI', () => {
	let editor, editorElement, factory, command;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, MediaEmbedStyleUI ]
		} );

		factory = editor.ui.componentFactory;
		command = editor.commands.get( 'mediaStyle' );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedStyleUI.pluginName ).to.equal( 'MediaEmbedStyleUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedStyleUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedStyleUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require MediaEmbedStyleEditing', () => {
		expect( MediaEmbedStyleUI.requires ).to.include( MediaEmbedStyleEditing );
	} );

	describe( 'init()', () => {
		it( 'should register all five alignment buttons', () => {
			for ( const name of BUTTON_NAMES ) {
				expect( factory.has( name ), name ).to.be.true;
			}
		} );

		it( 'should register the wrapText and breakText dropdowns', () => {
			for ( const name of DROPDOWN_NAMES ) {
				expect( factory.has( name ), name ).to.be.true;
			}
		} );
	} );

	describe( 'buttons', () => {
		it( 'is a ButtonView instance', () => {
			for ( const name of BUTTON_NAMES ) {
				const button = factory.create( name );
				expect( button, name ).to.be.instanceOf( ButtonView );
				button.destroy();
			}
		} );

		it( 'has tooltip, isToggleable, label and icon', () => {
			for ( const name of BUTTON_NAMES ) {
				const button = factory.create( name );
				expect( button.tooltip, `${ name } tooltip` ).to.be.true;
				expect( button.isToggleable, `${ name } isToggleable` ).to.be.true;
				expect( button.label, `${ name } label` ).to.be.a( 'string' ).and.not.empty;
				expect( button.icon, `${ name } icon` ).to.be.a( 'string' ).and.not.empty;
				button.destroy();
			}
		} );

		it( 'binds isEnabled to the command', () => {
			for ( const name of BUTTON_NAMES ) {
				const button = factory.create( name );

				_setModelData( editor.model, `[<media url="${ URL }"></media>]` );
				expect( button.isEnabled, `${ name } enabled on media selection` ).to.be.true;

				_setModelData( editor.model, '<paragraph>x[]</paragraph>' );
				expect( button.isEnabled, `${ name } disabled outside media` ).to.be.false;

				button.destroy();
			}
		} );

		it( 'mediaEmbed:alignLeft is on when the command value is "alignLeft"', () => {
			const button = factory.create( 'mediaEmbed:alignLeft' );

			_setModelData( editor.model, `[<media mediaStyle="alignLeft" url="${ URL }"></media>]` );
			expect( button.isOn ).to.be.true;

			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );
			expect( button.isOn ).to.be.false;

			button.destroy();
		} );

		it( 'mediaEmbed:alignCenter is on by default for an unaligned media (default-state lighting)', () => {
			const button = factory.create( 'mediaEmbed:alignCenter' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			expect( button.isOn ).to.be.true;

			button.destroy();
		} );

		it( 'fires the command with the right value when executed', () => {
			const button = factory.create( 'mediaEmbed:alignBlockLeft' );
			const executeSpy = sinon.spy( command, 'execute' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			button.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.be.true;
			expect( executeSpy.firstCall.args[ 0 ] ).to.deep.equal( { value: 'alignBlockLeft' } );

			button.destroy();
		} );

		it( 'refocuses the editing view after click', () => {
			const button = factory.create( 'mediaEmbed:alignBlockLeft' );
			const focusSpy = sinon.spy( editor.editing.view, 'focus' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			button.fire( 'execute' );

			expect( focusSpy.calledOnce ).to.be.true;

			button.destroy();
		} );
	} );

	describe( 'dropdowns', () => {
		it( 'is a DropdownView instance with a SplitButtonView and an enabled tooltip', () => {
			for ( const name of DROPDOWN_NAMES ) {
				const dropdown = factory.create( name );
				expect( dropdown, name ).to.be.instanceOf( DropdownView );
				expect( dropdown.buttonView, `${ name } buttonView` ).to.be.instanceOf( SplitButtonView );
				expect( dropdown.buttonView.tooltip, `${ name } tooltip` ).to.be.true;
				dropdown.destroy();
			}
		} );

		it( 'is enabled when a media is selected and disabled otherwise', () => {
			for ( const name of DROPDOWN_NAMES ) {
				const dropdown = factory.create( name );

				_setModelData( editor.model, `[<media url="${ URL }"></media>]` );
				expect( dropdown.isEnabled, `${ name } enabled on media selection` ).to.be.true;

				_setModelData( editor.model, '<paragraph>x[]</paragraph>' );
				expect( dropdown.isEnabled, `${ name } disabled outside media` ).to.be.false;

				dropdown.destroy();
			}
		} );

		it( 'breakText action button reflects the active alignment (alignBlockLeft)', () => {
			const dropdown = factory.create( 'mediaEmbed:breakText' );
			// Force lazy initialization of bindings.
			dropdown.render();

			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			expect( dropdown.buttonView.isOn ).to.be.true;

			dropdown.destroy();
		} );

		it( 'wrapText action button reflects no active state when no wrap alignment is set', () => {
			const dropdown = factory.create( 'mediaEmbed:wrapText' );
			dropdown.render();

			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			expect( dropdown.buttonView.isOn ).to.be.false;

			dropdown.destroy();
		} );

		it( 'breakText action button click executes the default item (alignCenter) when no child is active', () => {
			// Use a wrap alignment so none of breakText's children
			// (alignBlockLeft, alignCenter, alignBlockRight) is active.
			_setModelData( editor.model, `[<media mediaStyle="alignLeft" url="${ URL }"></media>]` );

			const dropdown = factory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			const executeSpy = sinon.spy( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.be.true;
			expect( executeSpy.firstCall.args[ 0 ] ).to.deep.equal( { value: 'alignCenter' } );

			dropdown.destroy();
		} );

		it( 'breakText action button click toggles the dropdown when a child is active', () => {
			const dropdown = factory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			// alignBlockLeft is one of breakText's children, so the dropdown's "any child on" state is true.
			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			const executeSpy = sinon.spy( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy.called, 'command should not be executed' ).to.be.false;
			expect( dropdown.isOpen, 'dropdown should be open' ).to.be.true;

			dropdown.destroy();
		} );

		it( 'refocuses the editing view after a dropdown action', () => {
			const dropdown = factory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			const focusSpy = sinon.spy( editor.editing.view, 'focus' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			dropdown.fire( 'execute' );

			expect( focusSpy.calledOnce ).to.be.true;

			dropdown.destroy();
		} );
	} );
} );
