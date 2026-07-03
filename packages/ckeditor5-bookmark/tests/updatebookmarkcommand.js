/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ImageInline, ImageBlock } from '@ckeditor/ckeditor5-image';
import { Link } from '@ckeditor/ckeditor5-link';

import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

import { BookmarkEditing } from '../src/bookmarkediting.js';
import { UpdateBookmarkCommand } from '../src/updatebookmarkcommand.js';

describe( 'UpdateBookmarkCommand', () => {
	let domElement, editor, model, command, stub;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );
		stub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				BookmarkEditing,
				Bold,
				Italic,
				ImageInline,
				ImageBlock,
				Link
			]
		} );

		model = editor.model;
		command = new UpdateBookmarkCommand( editor );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	describe( '#isEnabled()', () => {
		describe( 'should be `true`', () => {
			it( 'when only bookmark element is selected', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				expect( command.isEnabled ).toBe( true );
			} );
		} );

		describe( 'should be `false`', () => {
			it( 'when selection is collapsed inside paragraph text', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				expect( command.isEnabled ).toBe( false );
			} );

			it( 'when an image is selected', () => {
				_setModelData( model, '<paragraph>foo [<imageInline src="#"></imageInline>] bar</paragraph>' );

				expect( command.isEnabled ).toBe( false );
			} );

			it( 'when a link is selected', () => {
				_setModelData( model, '<paragraph>foo [<$text linkHref="foo">link</$text>] bar</paragraph>' );

				expect( command.isEnabled ).toBe( false );
			} );

			it( 'when selection contains a bookmark and a text', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>bar]</paragraph>' );

				expect( command.isEnabled ).toBe( false );
			} );
		} );
	} );

	describe( '#execute()', () => {
		describe( 'should do nothing', () => {
			it( 'if bookmarkId was not passed', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute();

				expect( _getModelData( model ) ).toEqual( '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'if bookmarkId is an empty string', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( '' );

				expect( _getModelData( model ) ).toEqual( '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'if bookmarkId is not a string', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( true );

				expect( _getModelData( model ) ).toEqual( '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'if there is no selected bookmark', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command.isEnabled = true;
				command.execute( { bookmarkId: 'bar' } );

				expect( _getModelData( model ) ).toEqual( '<paragraph>fo[]o</paragraph>' );
			} );
		} );

		describe( 'if a bookmarkId was passed', () => {
			beforeEach( () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'should update the bookmarkId of bookmark element with the proper id attribute', () => {
				command.execute( { bookmarkId: 'bar' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<paragraph><bookmark bookmarkId="bar"></bookmark></paragraph>'
				);
			} );
		} );

		describe( 'id validation', () => {
			it( 'should warn if the command is executed with invalid id (only spaces)', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( { bookmarkId: '   ' } );

				expect( stub ).toHaveBeenCalledWith(
					expect.stringContaining( 'update-bookmark-command-executed-with-invalid-name' ),
					expect.anything()
				);
			} );

			it( 'should warn if the command is executed with invalid id (spaces with bookmark name)', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( { bookmarkId: 'bookmark name' } );

				expect( stub ).toHaveBeenCalledWith(
					expect.stringContaining( 'update-bookmark-command-executed-with-invalid-name' ),
					expect.anything()
				);
			} );

			it( 'should warn if the command is executed with invalid id (empty name)', () => {
				_setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( { bookmarkId: '' } );

				expect( stub ).toHaveBeenCalledWith(
					expect.stringContaining( 'update-bookmark-command-executed-with-invalid-name' ),
					expect.anything()
				);
			} );
		} );
	} );
} );
