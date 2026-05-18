/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedStyleEditing } from '../../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleCommand } from '../../src/mediaembedstyle/mediaembedstylecommand.js';

const URL = 'https://youtu.be/foo';

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
		expect( command ).to.be.instanceOf( MediaEmbedStyleCommand );
	} );

	describe( '#isEnabled', () => {
		it( 'is true when a media element is selected', () => {
			_setModelData( model, `<paragraph>x</paragraph>[<media url="${ URL }"></media>]` );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'is false when no media is selected', () => {
			_setModelData( model, `<paragraph>x[]</paragraph><media url="${ URL }"></media>` );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'is false when selection is inside a paragraph', () => {
			_setModelData( model, '<paragraph>x[]y</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( '#value', () => {
		it( 'is false when no media is selected', () => {
			_setModelData( model, `<paragraph>x[]</paragraph><media url="${ URL }"></media>` );

			expect( command.value ).to.be.false;
		} );

		it( 'falls back to "alignCenter" when the selected media has no mediaStyle attribute', () => {
			_setModelData( model, `[<media url="${ URL }"></media>]` );

			expect( command.value ).to.equal( 'alignCenter' );
		} );

		for ( const value of [ 'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight' ] ) {
			it( `reflects mediaStyle="${ value }" when set on the selected media`, () => {
				_setModelData( model, `[<media mediaStyle="${ value }" url="${ URL }"></media>]` );

				expect( command.value ).to.equal( value );
			} );
		}
	} );

	describe( 'execute()', () => {
		for ( const value of [ 'alignLeft', 'alignBlockLeft', 'alignBlockRight', 'alignRight' ] ) {
			it( `sets mediaStyle="${ value }" on the selected media`, () => {
				_setModelData( model, `[<media url="${ URL }"></media>]` );

				command.execute( { value } );

				expect( _getModelData( model ) ).to.equal(
					`[<media mediaStyle="${ value }" url="${ URL }"></media>]`
				);
			} );
		}

		it( 'removes the attribute when value is the default style ("alignCenter")', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: 'alignCenter' } );

			expect( _getModelData( model ) ).to.equal(
				`[<media url="${ URL }"></media>]`
			);
		} );

		it( 'removes the attribute when value is null', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: null } );

			expect( _getModelData( model ) ).to.equal(
				`[<media url="${ URL }"></media>]`
			);
		} );

		it( 'replaces an existing mediaStyle attribute', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: 'alignBlockRight' } );

			expect( _getModelData( model ) ).to.equal(
				`[<media mediaStyle="alignBlockRight" url="${ URL }"></media>]`
			);
		} );

		it( 'is a no-op when called twice with the same non-default value', () => {
			_setModelData( model, `[<media url="${ URL }"></media>]` );

			command.execute( { value: 'alignBlockLeft' } );
			command.execute( { value: 'alignBlockLeft' } );

			expect( _getModelData( model ) ).to.equal(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );

		it( 'does nothing when no media is selected', () => {
			_setModelData( model, `<paragraph>x[]</paragraph><media url="${ URL }"></media>` );

			command.execute( { value: 'alignBlockLeft' } );

			expect( _getModelData( model ) ).to.equal(
				`<paragraph>x[]</paragraph><media url="${ URL }"></media>`
			);
		} );

		it( 'is undoable in a single step', () => {
			_setModelData( model, `[<media url="${ URL }"></media>]` );

			command.execute( { value: 'alignBlockLeft' } );
			editor.execute( 'undo' );

			expect( _getModelData( model ) ).to.equal(
				`[<media url="${ URL }"></media>]`
			);
		} );

		it( 'is undoable when clearing the attribute', () => {
			_setModelData( model, `[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]` );

			command.execute( { value: null } );
			editor.execute( 'undo' );

			expect( _getModelData( model ) ).to.equal(
				`[<media mediaStyle="alignBlockLeft" url="${ URL }"></media>]`
			);
		} );
	} );
} );
