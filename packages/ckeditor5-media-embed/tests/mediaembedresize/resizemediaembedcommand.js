/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { ResizeMediaEmbedCommand } from '../../src/mediaembedresize/resizemediaembedcommand.js';

describe( 'ResizeMediaEmbedCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, UndoEditing ]
		} );

		model = editor.model;
		command = editor.commands.get( 'resizeMediaEmbed' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is an instance of ResizeMediaEmbedCommand', () => {
		expect( command ).to.be.instanceOf( ResizeMediaEmbedCommand );
	} );

	describe( '#isEnabled', () => {
		it( 'is true when a media element is selected', () => {
			_setModelData( model, '<paragraph>x</paragraph>[<media url="https://youtu.be/foo"></media>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'is false when no media is selected', () => {
			_setModelData( model, '<paragraph>x[]</paragraph><media url="https://youtu.be/foo"></media>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'is false when selection is inside a paragraph', () => {
			_setModelData( model, '<paragraph>x[]y</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( '#value', () => {
		it( 'is null when no media is selected', () => {
			_setModelData( model, '<paragraph>x[]</paragraph><media url="https://youtu.be/foo"></media>' );

			expect( command.value ).to.be.null;
		} );

		it( 'is null when the selected media has no resizedWidth', () => {
			_setModelData( model, '[<media url="https://youtu.be/foo"></media>]' );

			expect( command.value ).to.be.null;
		} );

		it( 'is the resizedWidth value when the selected media is resized', () => {
			_setModelData( model, '[<media resizedWidth="50%" url="https://youtu.be/foo"></media>]' );

			expect( command.value ).to.equal( '50%' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'sets the resizedWidth attribute on the selected media', () => {
			_setModelData( model, '[<media url="https://youtu.be/foo"></media>]' );

			command.execute( { width: '60%' } );

			expect( _getModelData( model ) ).to.equal(
				'[<media resizedWidth="60%" url="https://youtu.be/foo"></media>]'
			);
		} );

		it( 'replaces an existing resizedWidth attribute', () => {
			_setModelData( model, '[<media resizedWidth="30%" url="https://youtu.be/foo"></media>]' );

			command.execute( { width: '75%' } );

			expect( _getModelData( model ) ).to.equal(
				'[<media resizedWidth="75%" url="https://youtu.be/foo"></media>]'
			);
		} );

		it( 'removes the resizedWidth attribute when width is null', () => {
			_setModelData( model, '[<media resizedWidth="50%" url="https://youtu.be/foo"></media>]' );

			command.execute( { width: null } );

			expect( _getModelData( model ) ).to.equal(
				'[<media url="https://youtu.be/foo"></media>]'
			);
		} );

		it( 'does nothing when no media is selected', () => {
			_setModelData( model, '<paragraph>x[]</paragraph><media url="https://youtu.be/foo"></media>' );

			command.execute( { width: '50%' } );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>x[]</paragraph><media url="https://youtu.be/foo"></media>'
			);
		} );

		it( 'is undoable in a single step', () => {
			_setModelData( model, '[<media url="https://youtu.be/foo"></media>]' );

			command.execute( { width: '50%' } );
			editor.execute( 'undo' );

			expect( _getModelData( model ) ).to.equal(
				'[<media url="https://youtu.be/foo"></media>]'
			);
		} );
	} );
} );
