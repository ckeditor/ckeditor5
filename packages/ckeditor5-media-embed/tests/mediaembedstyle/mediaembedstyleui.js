/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Async factory used inside `beforeEach` to build a ClassicTestEditor with a `mediaEmbed.styles` config.
// Optionally accepts a `mediaEmbed.toolbar` config — used by the custom-dropdown tests below.
// Returns { editor, editorElement } — destroy the editor and remove the element in `afterEach`.
async function createConfiguredEditor( styleOptions, toolbarConfig ) {
	const editorElement = global.document.createElement( 'div' );
	global.document.body.appendChild( editorElement );

	const mediaEmbed = { styles: { options: styleOptions } };

	if ( toolbarConfig ) {
		mediaEmbed.toolbar = toolbarConfig;
	}

	const editor = await ClassicTestEditor.create( {
		attachTo: editorElement,
		plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, MediaEmbedStyleUI ],
		mediaEmbed
	} );

	return { editor, editorElement };
}

describe( 'MediaEmbedStyleUI', () => {
	let editor, editorElement, factory, command;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( {
			attachTo: editorElement,
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, MediaEmbedStyleUI ]
		} );

		factory = editor.ui.componentFactory;
		command = editor.commands.get( 'mediaStyle' );
	} );

	afterEach( async () => {
		vi.restoreAllMocks();
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedStyleUI.pluginName ).toBe( 'MediaEmbedStyleUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedStyleUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedStyleUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require MediaEmbedStyleEditing', () => {
		expect( MediaEmbedStyleUI.requires ).toContain( MediaEmbedStyleEditing );
	} );

	describe( 'init()', () => {
		it( 'should register all five alignment buttons', () => {
			for ( const name of BUTTON_NAMES ) {
				expect( factory.has( name ), name ).toBe( true );
			}
		} );

		it( 'should register the wrapText and breakText dropdowns', () => {
			for ( const name of DROPDOWN_NAMES ) {
				expect( factory.has( name ), name ).toBe( true );
			}
		} );
	} );

	describe( 'buttons', () => {
		it( 'is a ButtonView instance', () => {
			for ( const name of BUTTON_NAMES ) {
				const button = factory.create( name );
				expect( button, name ).toBeInstanceOf( ButtonView );
				button.destroy();
			}
		} );

		it( 'has tooltip, isToggleable, label and icon', () => {
			for ( const name of BUTTON_NAMES ) {
				const button = factory.create( name );
				expect( button.tooltip, `${ name } tooltip` ).toBe( true );
				expect( button.isToggleable, `${ name } isToggleable` ).toBe( true );
				expect( typeof button.label, `${ name } label` ).toBe( 'string' );
				expect( button.label, `${ name } label not empty` ).toBeTruthy();
				expect( typeof button.icon, `${ name } icon` ).toBe( 'string' );
				expect( button.icon, `${ name } icon not empty` ).toBeTruthy();
				button.destroy();
			}
		} );

		it( 'binds isEnabled to the command', () => {
			for ( const name of BUTTON_NAMES ) {
				const button = factory.create( name );

				_setModelData( editor.model, `[<media url="${ URL }"></media>]` );
				expect( button.isEnabled, `${ name } enabled on media selection` ).toBe( true );

				_setModelData( editor.model, '<paragraph>x[]</paragraph>' );
				expect( button.isEnabled, `${ name } disabled outside media` ).toBe( false );

				button.destroy();
			}
		} );

		it( 'mediaEmbed:alignLeft is on when the command value is "alignLeft"', () => {
			const button = factory.create( 'mediaEmbed:alignLeft' );

			_setModelData( editor.model, `[<media mediaStyle="alignLeft" url="${ URL }"></media>]` );
			expect( button.isOn ).toBe( true );

			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );
			expect( button.isOn ).toBe( false );

			button.destroy();
		} );

		it( 'mediaEmbed:alignCenter is on by default for an unaligned media (default-state lighting)', () => {
			const button = factory.create( 'mediaEmbed:alignCenter' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			expect( button.isOn ).toBe( true );

			button.destroy();
		} );

		it( 'fires the command with the right value when executed', () => {
			const button = factory.create( 'mediaEmbed:alignBlockLeft' );
			const executeSpy = vi.spyOn( command, 'execute' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { value: 'alignBlockLeft' } );

			button.destroy();
		} );

		it( 'refocuses the editing view after click', () => {
			const button = factory.create( 'mediaEmbed:alignBlockLeft' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			button.fire( 'execute' );

			expect( focusSpy ).toHaveBeenCalledOnce();

			button.destroy();
		} );
	} );

	describe( 'dropdowns', () => {
		it( 'is a DropdownView instance with a SplitButtonView and an enabled tooltip', () => {
			for ( const name of DROPDOWN_NAMES ) {
				const dropdown = factory.create( name );
				expect( dropdown, name ).toBeInstanceOf( DropdownView );
				expect( dropdown.buttonView, `${ name } buttonView` ).toBeInstanceOf( SplitButtonView );
				expect( dropdown.buttonView.tooltip, `${ name } tooltip` ).toBe( true );
				dropdown.destroy();
			}
		} );

		it( 'is enabled when a media is selected and disabled otherwise', () => {
			for ( const name of DROPDOWN_NAMES ) {
				const dropdown = factory.create( name );

				_setModelData( editor.model, `[<media url="${ URL }"></media>]` );
				expect( dropdown.isEnabled, `${ name } enabled on media selection` ).toBe( true );

				_setModelData( editor.model, '<paragraph>x[]</paragraph>' );
				expect( dropdown.isEnabled, `${ name } disabled outside media` ).toBe( false );

				dropdown.destroy();
			}
		} );

		it( 'breakText action button reflects the active alignment (alignBlockLeft)', () => {
			const dropdown = factory.create( 'mediaEmbed:breakText' );
			// Force lazy initialization of bindings.
			dropdown.render();

			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			expect( dropdown.buttonView.isOn ).toBe( true );

			dropdown.destroy();
		} );

		it( 'wrapText action button reflects no active state when no wrap alignment is set', () => {
			const dropdown = factory.create( 'mediaEmbed:wrapText' );
			dropdown.render();

			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			expect( dropdown.buttonView.isOn ).toBe( false );

			dropdown.destroy();
		} );

		it( 'breakText action button click executes the default item (alignCenter) when no child is active', () => {
			// Use a wrap alignment so none of breakText's children
			// (alignBlockLeft, alignCenter, alignBlockRight) is active.
			_setModelData( editor.model, `[<media mediaStyle="alignLeft" url="${ URL }"></media>]` );

			const dropdown = factory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			const executeSpy = vi.spyOn( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { value: 'alignCenter' } );

			dropdown.destroy();
		} );

		it( 'breakText action button click toggles the dropdown when a child is active', () => {
			const dropdown = factory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			// alignBlockLeft is one of breakText's children, so the dropdown's "any child on" state is true.
			_setModelData( editor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			const executeSpy = vi.spyOn( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy, 'command should not be executed' ).not.toHaveBeenCalled();
			expect( dropdown.isOpen, 'dropdown should be open' ).toBe( true );

			dropdown.destroy();
		} );

		it( 'refocuses the editing view after a dropdown action', () => {
			const dropdown = factory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			_setModelData( editor.model, `[<media url="${ URL }"></media>]` );

			dropdown.fire( 'execute' );

			expect( focusSpy ).toHaveBeenCalledOnce();

			dropdown.destroy();
		} );
	} );

	describe( 'with a subset config (alignLeft and alignRight dropped)', () => {
		let configuredEditor, configuredEditorElement, warnStub;

		beforeEach( async () => {
			warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor( [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ] ) );
		} );

		afterEach( async () => {
			vi.restoreAllMocks();
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'registers only the configured buttons', () => {
			const factory = configuredEditor.ui.componentFactory;

			expect( factory.has( 'mediaEmbed:alignBlockLeft' ) ).toBe( true );
			expect( factory.has( 'mediaEmbed:alignCenter' ) ).toBe( true );
			expect( factory.has( 'mediaEmbed:alignBlockRight' ) ).toBe( true );
		} );

		it( 'does not register buttons for filtered-out styles', () => {
			const factory = configuredEditor.ui.componentFactory;

			expect( factory.has( 'mediaEmbed:alignLeft' ) ).toBe( false );
			expect( factory.has( 'mediaEmbed:alignRight' ) ).toBe( false );
		} );

		it( 'skips wrapText (both items filtered out)', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:wrapText' ) ).toBe( false );
		} );

		it( 'keeps breakText (all three items present)', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:breakText' ) ).toBe( true );
		} );

		it( 'does not warn about filtered built-in dropdowns (they auto-skip silently)', () => {
			// `wrapText` lost both items here, but the integrator did not define `wrapText` —
			// it is an auto-included built-in, so filtering it must not produce a warning.
			expect( warnStub ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'with a filter that drops the dropdown defaultItem but keeps two items', () => {
		// breakText defaultItem is `alignCenter`. Drop it but keep alignBlockLeft + alignBlockRight,
		// so the dropdown stays registered and falls back to the first remaining item.
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor( [ 'alignBlockLeft', 'alignBlockRight' ] ) );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'still registers breakText (two items survived)', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:breakText' ) ).toBe( true );
		} );

		it( 'split-button action mirrors the first surviving item (defaultItem was filtered out)', () => {
			const dropdown = configuredEditor.ui.componentFactory.create( 'mediaEmbed:breakText' );
			dropdown.render();

			// Select a media so the buttons resolve labels/icons via the command value binding.
			_setModelData( configuredEditor.model, `[<media url="${ URL }"></media>]` );

			// Click the action button. With no child currently `isOn`, it should fire the
			// fallback defaultItem (alignBlockLeft — first surviving).
			const command = configuredEditor.commands.get( 'mediaStyle' );
			const executeSpy = vi.spyOn( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { value: 'alignBlockLeft' } );

			dropdown.destroy();
		} );
	} );

	describe( 'with a single-item breakText filter', () => {
		// Drop everything except alignBlockLeft — breakText ends up with one surviving item.
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor( [ 'alignBlockLeft' ] ) );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'skips the single-item breakText dropdown', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:breakText' ) ).toBe( false );
		} );

		it( 'still registers the lone flat button', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:alignBlockLeft' ) ).toBe( true );
		} );
	} );

	describe( 'with an override config (alignCenter relabeled)', () => {
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor( [
					'alignBlockLeft',
					{ name: 'alignCenter', title: 'Centerrrrred' },
					'alignBlockRight'
				] ) );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'renders the overridden label on the button', () => {
			const button = configuredEditor.ui.componentFactory.create( 'mediaEmbed:alignCenter' );

			expect( button.label ).toBe( 'Centerrrrred' );

			button.destroy();
		} );

		it( 'inherits the icon from the built-in', () => {
			const button = configuredEditor.ui.componentFactory.create( 'mediaEmbed:alignCenter' );

			expect( typeof button.icon ).toBe( 'string' );
			expect( button.icon ).toBeTruthy();

			button.destroy();
		} );
	} );

	describe( 'with a custom semantical style', () => {
		const sideSvg = '<svg id="side"/>';
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor( [
					'alignCenter',
					{ name: 'side', title: 'Side media', icon: sideSvg, className: 'media-style-side' }
				] ) );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'registers the custom button under the configured name', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:side' ) ).toBe( true );
		} );

		it( 'renders the custom label and icon', () => {
			const button = configuredEditor.ui.componentFactory.create( 'mediaEmbed:side' );

			expect( button.label ).toBe( 'Side media' );
			expect( button.icon ).toBe( sideSvg );

			button.destroy();
		} );

		it( 'fires the command with the custom style name on click', () => {
			const button = configuredEditor.ui.componentFactory.create( 'mediaEmbed:side' );
			const command = configuredEditor.commands.get( 'mediaStyle' );
			const executeSpy = vi.spyOn( command, 'execute' );

			_setModelData( configuredEditor.model, `[<media url="${ URL }"></media>]` );

			button.fire( 'execute' );

			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { value: 'side' } );

			button.destroy();
		} );
	} );

	describe( 'with a custom isDefault style', () => {
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor( [
					'alignBlockLeft',
					{ name: 'natural', title: 'Natural', icon: 'center', isDefault: true }
				] ) );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'lights up the custom default button when no attribute is set', () => {
			const button = configuredEditor.ui.componentFactory.create( 'mediaEmbed:natural' );

			_setModelData( configuredEditor.model, `[<media url="${ URL }"></media>]` );

			expect( button.isOn ).toBe( true );

			button.destroy();
		} );
	} );

	describe( 'with a custom dropdown definition in config.mediaEmbed.toolbar', () => {
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor(
					[ 'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight' ],
					[
						'mediaEmbed:alignCenter',
						{
							name: 'mediaEmbed:myAlignments',
							title: 'Alignment',
							items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignBlockRight' ],
							defaultItem: 'mediaEmbed:alignBlockLeft'
						}
					]
				) );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'registers the custom dropdown under its declared name', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:myAlignments' ) ).toBe( true );
		} );

		it( 'still registers the built-in dropdowns alongside the custom one', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:wrapText' ) ).toBe( true );
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:breakText' ) ).toBe( true );
		} );

		it( 'creates a DropdownView whose split-button mirrors the active child', () => {
			const dropdown = configuredEditor.ui.componentFactory.create( 'mediaEmbed:myAlignments' );
			dropdown.render();

			_setModelData( configuredEditor.model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			expect( dropdown.buttonView.isOn ).toBe( true );

			dropdown.destroy();
		} );

		it( 'split-button action fires the defaultItem when no child is active', () => {
			_setModelData( configuredEditor.model, `[<media mediaStyle="alignLeft" url="${ URL }"></media>]` );

			const dropdown = configuredEditor.ui.componentFactory.create( 'mediaEmbed:myAlignments' );
			dropdown.render();

			const command = configuredEditor.commands.get( 'mediaStyle' );
			const executeSpy = vi.spyOn( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { value: 'alignBlockLeft' } );

			dropdown.destroy();
		} );
	} );

	describe( 'with a custom dropdown whose items reference filtered-out styles', () => {
		// Items reference styles dropped from `config.mediaEmbed.styles.options`.
		// They must be filtered out; the dropdown survives if at least two items remain,
		// and falls back to the first surviving item when the configured defaultItem is gone.
		let configuredEditor, configuredEditorElement, warnStub;

		beforeEach( async () => {
			warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			( { editor: configuredEditor, editorElement: configuredEditorElement } =
				await createConfiguredEditor(
					[ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ],
					[ {
						name: 'mediaEmbed:mixedAlignments',
						title: 'Alignment',
						// alignLeft is filtered out (not in styles.options).
						items: [ 'mediaEmbed:alignLeft', 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignBlockRight' ],
						defaultItem: 'mediaEmbed:alignLeft'
					} ]
				) );
		} );

		afterEach( async () => {
			vi.restoreAllMocks();
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'warns that the custom dropdown was not fully honored', () => {
			expect( warnStub ).toHaveBeenCalled();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^media-style-configuration-definition-invalid/ );
		} );

		it( 'registers the dropdown with only the surviving items', () => {
			expect( configuredEditor.ui.componentFactory.has( 'mediaEmbed:mixedAlignments' ) ).toBe( true );
		} );

		it( 'falls back to the first surviving item when the configured defaultItem is filtered out', () => {
			_setModelData( configuredEditor.model, `[<media url="${ URL }"></media>]` );

			const dropdown = configuredEditor.ui.componentFactory.create( 'mediaEmbed:mixedAlignments' );
			dropdown.render();

			const command = configuredEditor.commands.get( 'mediaStyle' );
			const executeSpy = vi.spyOn( command, 'execute' );

			dropdown.buttonView.fire( 'execute' );

			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { value: 'alignBlockLeft' } );

			dropdown.destroy();
		} );
	} );

	describe( 'with an invalid custom dropdown definition', () => {
		let warnStub;

		beforeEach( () => {
			warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		afterEach( () => {
			vi.restoreAllMocks();
		} );

		// Each entry is a malformed dropdown definition that should be warned + skipped at
		// registration time. The `scenario` describes the validation rule the entry breaks.
		for ( const [ scenario, badEntry ] of [
			[ 'name lacks the mediaEmbed: prefix', {
				name: 'myAlignments',
				title: 'Alignment',
				items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignLeft' ],
				defaultItem: 'mediaEmbed:alignBlockLeft'
			} ],
			[ 'defaultItem is not in items', {
				name: 'mediaEmbed:myAlignments',
				title: 'Alignment',
				items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignLeft' ],
				defaultItem: 'mediaEmbed:alignCenter'
			} ],
			[ 'items array is empty', {
				name: 'mediaEmbed:empty',
				title: 'Empty',
				items: [],
				defaultItem: ''
			} ]
		] ) {
			it( `warns and skips a dropdown whose ${ scenario }`, async () => {
				const { editor, editorElement } = await createConfiguredEditor(
					[ 'alignLeft', 'alignBlockLeft', 'alignCenter' ],
					[ badEntry ]
				);

				expect( editor.ui.componentFactory.has( badEntry.name ) ).toBe( false );
				expect( warnStub ).toHaveBeenCalled();
				expect( warnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^media-style-configuration-definition-invalid/ );

				editorElement.remove();
				await editor.destroy();
			} );
		}

		it( 'ignores plain string toolbar entries (does not warn)', async () => {
			const editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( {
				attachTo: editorElement,
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, MediaEmbedStyleUI ],
				mediaEmbed: {
					styles: { options: [ 'alignLeft', 'alignCenter' ] },
					toolbar: [ 'mediaEmbed:alignLeft', 'mediaEmbed:alignCenter' ]
				}
			} );

			expect( warnStub ).not.toHaveBeenCalled();

			editorElement.remove();
			await editor.destroy();
		} );

		it( 'ignores generic toolbar groupings (items but no defaultItem) without warning', async () => {
			// A regular grouped toolbar item ({ items, label } shape) is the CKEditor toolbar's
			// generic dropdown grouping. Our dropdown detection uses `defaultItem` as the
			// discriminator, so this must pass through untouched.
			const editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( {
				attachTo: editorElement,
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, MediaEmbedStyleUI ],
				mediaEmbed: {
					styles: { options: [ 'alignLeft', 'alignCenter' ] },
					toolbar: [
						{ label: 'More', items: [ 'mediaEmbed:alignLeft', 'mediaEmbed:alignCenter' ] }
					]
				}
			} );

			expect( warnStub ).not.toHaveBeenCalled();

			editorElement.remove();
			await editor.destroy();
		} );
	} );
} );
