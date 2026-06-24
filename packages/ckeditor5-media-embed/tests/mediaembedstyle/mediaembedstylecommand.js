/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedStyleEditing } from '../../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleCommand } from '../../src/mediaembedstyle/mediaembedstylecommand.js';

const URL = 'https://youtu.be/foo';

// Async factory used inside `beforeEach` to build a VirtualTestEditor with a `mediaEmbed.styles` config.
function createConfiguredEditor( styleOptions ) {
	return VirtualTestEditor.create( {
		plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, UndoEditing ],
		mediaEmbed: { styles: { options: styleOptions } }
	} );
}

describe( 'MediaEmbedStyleCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, UndoEditing ]
		} );

		model = editor.model;
		command = editor.commands.get( 'mediaStyle' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is an instance of MediaEmbedStyleCommand', () => {
		expect( command ).toBeInstanceOf( MediaEmbedStyleCommand );
	} );

	describe( '#isEnabled', () => {
		it( 'is true when a media element is selected', () => {
			_setModelData( model, `<paragraph>x</paragraph>[<media url="${ URL }"></media>]` );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'is false when no media is selected', () => {
			_setModelData( model, `<paragraph>x[]</paragraph><media url="${ URL }"></media>` );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'is false when selection is inside a paragraph', () => {
			_setModelData( model, '<paragraph>x[]y</paragraph>' );

			expect( command.isEnabled ).toBe( false );
		} );
	} );

	describe( '#value', () => {
		it( 'is false when no media is selected', () => {
			_setModelData( model, `<paragraph>x[]</paragraph><media url="${ URL }"></media>` );

			expect( command.value ).toBe( false );
		} );

		it( 'falls back to "alignCenter" when the selected media has no mediaStyle attribute', () => {
			_setModelData( model, `[<media url="${ URL }"></media>]` );

			expect( command.value ).toBe( 'alignCenter' );
		} );

		for ( const value of [ 'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight' ] ) {
			it( `reflects mediaStyle="${ value }" when set on the selected media`, () => {
				_setModelData( model, `[<media mediaStyle="${ value }" url="${ URL }"></media>]` );

				expect( command.value ).toBe( value );
			} );
		}
	} );

	describe( 'execute()', () => {
		for ( const value of [ 'alignLeft', 'alignBlockLeft', 'alignBlockRight', 'alignRight' ] ) {
			it( `sets mediaStyle="${ value }" on the selected media`, () => {
				_setModelData( model, `[<media url="${ URL }"></media>]` );

				command.execute( { value } );

				expect( _getModelData( model ) ).toBe(
					`[<media mediaStyle="${ value }" url="${ URL }"></media>]`
				);
			} );
		}

		it( 'removes the attribute when value is the default style ("alignCenter")', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: 'alignCenter' } );

			expect( _getModelData( model ) ).toBe(
				`[<media url="${ URL }"></media>]`
			);
		} );

		it( 'removes the attribute when value is null', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: null } );

			expect( _getModelData( model ) ).toBe(
				`[<media url="${ URL }"></media>]`
			);
		} );

		it( 'replaces an existing mediaStyle attribute', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: 'alignBlockRight' } );

			expect( _getModelData( model ) ).toBe(
				`[<media mediaStyle="alignBlockRight" url="${ URL }"></media>]`
			);
		} );

		it( 'is a no-op when called twice with the same non-default value', () => {
			_setModelData( model, `[<media url="${ URL }"></media>]` );

			command.execute( { value: 'alignBlockLeft' } );
			command.execute( { value: 'alignBlockLeft' } );

			expect( _getModelData( model ) ).toBe(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );

		it( 'does nothing when no media is selected', () => {
			_setModelData( model, `<paragraph>x[]</paragraph><media url="${ URL }"></media>` );

			command.execute( { value: 'alignBlockLeft' } );

			expect( _getModelData( model ) ).toBe(
				`<paragraph>x[]</paragraph><media url="${ URL }"></media>`
			);
		} );

		it( 'is undoable in a single step', () => {
			_setModelData( model, `[<media url="${ URL }"></media>]` );

			command.execute( { value: 'alignBlockLeft' } );
			editor.execute( 'undo' );

			expect( _getModelData( model ) ).toBe(
				`[<media url="${ URL }"></media>]`
			);
		} );

		it( 'is undoable when clearing the attribute', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: null } );
			editor.execute( 'undo' );

			expect( _getModelData( model ) ).toBe(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );
	} );

	describe( 'with a subset config (alignLeft dropped)', () => {
		let configuredEditor, configuredModel, configuredCommand;

		beforeEach( async () => {
			configuredEditor = await createConfiguredEditor(
				[ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ]
			);
			configuredModel = configuredEditor.model;
			configuredCommand = configuredEditor.commands.get( 'mediaStyle' );
		} );

		afterEach( async () => {
			await configuredEditor.destroy();
		} );

		it( 'rejects execute() with a value not in the resolved options', () => {
			_setModelData( configuredModel, `[<media url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'alignLeft' } );

			expect( _getModelData( configuredModel ) ).toBe( `[<media url="${ URL }"></media>]` );
		} );

		it( 'preserves previous state when execute() is rejected', () => {
			_setModelData( configuredModel, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'alignRight' } );

			expect( _getModelData( configuredModel ) ).toBe(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );

		it( 'refresh() falls back to the default when the model attribute is no longer in the resolved list', () => {
			// The attribute survives in the data (engine doesn't strip unknown attrs). The command
			// reports the effective default so the default-state button can light up.
			_setModelData( configuredModel, `[<media mediaStyle="alignLeft" url="${ URL }"></media>]` );

			expect( configuredCommand.value ).toBe( 'alignCenter' );
		} );
	} );

	describe( 'with a custom isDefault style ("natural" replaces alignCenter as the default)', () => {
		let configuredEditor, configuredModel, configuredCommand;

		beforeEach( async () => {
			configuredEditor = await createConfiguredEditor( [
				{ name: 'natural', title: 'Natural', icon: 'center', isDefault: true },
				'alignBlockLeft'
			] );
			configuredModel = configuredEditor.model;
			configuredCommand = configuredEditor.commands.get( 'mediaStyle' );
		} );

		afterEach( async () => {
			await configuredEditor.destroy();
		} );

		it( 'refresh() reports the custom default name when no attribute is set', () => {
			_setModelData( configuredModel, `[<media url="${ URL }"></media>]` );

			expect( configuredCommand.value ).toBe( 'natural' );
		} );

		it( 'execute() with the custom default name clears the attribute', () => {
			_setModelData( configuredModel, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'natural' } );

			expect( _getModelData( configuredModel ) ).toBe( `[<media url="${ URL }"></media>]` );
		} );

		it( 'execute() with alignCenter (no longer the resolved default) is rejected — alignCenter was filtered out', () => {
			_setModelData( configuredModel, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'alignCenter' } );

			expect( _getModelData( configuredModel ) ).toBe(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );
	} );

	describe( 'with no resolved isDefault style', () => {
		let configuredEditor, configuredModel, configuredCommand;

		beforeEach( async () => {
			configuredEditor = await createConfiguredEditor( [ 'alignBlockLeft' ] );
			configuredModel = configuredEditor.model;
			configuredCommand = configuredEditor.commands.get( 'mediaStyle' );
		} );

		afterEach( async () => {
			await configuredEditor.destroy();
		} );

		it( 'refresh() value is false when the selected media has no mediaStyle attribute', () => {
			_setModelData( configuredModel, `[<media url="${ URL }"></media>]` );

			expect( configuredCommand.value ).toBe( false );
		} );

		it( 'refresh() value is false when the attribute references an unknown style', () => {
			_setModelData( configuredModel, `[<media mediaStyle="unknown" url="${ URL }"></media>]` );

			expect( configuredCommand.value ).toBe( false );
		} );

		it( 'execute({ value: "alignCenter" }) is rejected — alignCenter is not in the resolved list', () => {
			_setModelData( configuredModel, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'alignCenter' } );

			expect( _getModelData( configuredModel ) ).toBe(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );

		it( 'execute({ value: null }) still clears the attribute', () => {
			_setModelData( configuredModel, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			configuredCommand.execute( { value: null } );

			expect( _getModelData( configuredModel ) ).toBe( `[<media url="${ URL }"></media>]` );
		} );
	} );

	describe( 'with alignCenter demoted (isDefault: false + className)', () => {
		// The normalizer accepts this shape — see utils.js. The command must respect the demotion:
		// execute({ value: 'alignCenter' }) writes the attribute (not clear), so the configured
		// className reaches the downcast.
		let configuredEditor, configuredModel, configuredCommand;

		beforeEach( async () => {
			configuredEditor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, UndoEditing ],
				mediaEmbed: {
					styles: {
						options: [
							{ name: 'alignCenter', isDefault: false, className: 'media-style-explicit-center' },
							'alignBlockLeft'
						]
					}
				}
			} );
			configuredModel = configuredEditor.model;
			configuredCommand = configuredEditor.commands.get( 'mediaStyle' );
		} );

		afterEach( async () => {
			await configuredEditor.destroy();
		} );

		it( 'execute({ value: "alignCenter" }) writes the attribute (does not clear)', () => {
			_setModelData( configuredModel, `[<media url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'alignCenter' } );

			expect( _getModelData( configuredModel ) ).toBe(
				`[<media mediaStyle="alignCenter" url="${ URL }"></media>]`
			);
		} );

		it( 'refresh() value is false when no attribute and no isDefault style', () => {
			_setModelData( configuredModel, `[<media url="${ URL }"></media>]` );

			expect( configuredCommand.value ).toBe( false );
		} );

		it( 'refresh() reflects the demoted alignCenter when the attribute is applied', () => {
			_setModelData( configuredModel, `[<media mediaStyle="alignCenter" url="${ URL }"></media>]` );

			expect( configuredCommand.value ).toBe( 'alignCenter' );
		} );
	} );

	describe( 'with multiple isDefault styles', () => {
		// Both `alignCenter` (built-in default) and `natural` (custom) are marked isDefault.
		// Any isDefault style must clear the attribute — they all map to attribute-absence.
		let configuredEditor, configuredModel, configuredCommand;

		beforeEach( async () => {
			configuredEditor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing, UndoEditing ],
				mediaEmbed: {
					styles: {
						options: [
							'alignCenter',
							{ name: 'natural', title: 'Natural', icon: 'center', isDefault: true }
						]
					}
				}
			} );
			configuredModel = configuredEditor.model;
			configuredCommand = configuredEditor.commands.get( 'mediaStyle' );
		} );

		afterEach( async () => {
			await configuredEditor.destroy();
		} );

		it( 'execute({ value: "alignCenter" }) clears the attribute', () => {
			_setModelData( configuredModel, `[<media mediaStyle="natural" url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'alignCenter' } );

			expect( _getModelData( configuredModel ) ).toBe( `[<media url="${ URL }"></media>]` );
		} );

		it( 'execute({ value: "natural" }) also clears the attribute (the second isDefault)', () => {
			_setModelData( configuredModel, `[<media url="${ URL }"></media>]` );

			configuredCommand.execute( { value: 'natural' } );

			expect( _getModelData( configuredModel ) ).toBe( `[<media url="${ URL }"></media>]` );
		} );
	} );
} );
