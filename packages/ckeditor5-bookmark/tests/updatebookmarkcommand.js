/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ImageInline, ImageBlock } from '@ckeditor/ckeditor5-image';
import { Link } from '@ckeditor/ckeditor5-link';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import BookmarkEditing from '../src/bookmarkediting.js';
import UpdateBookmarkCommand from '../src/updatebookmarkcommand.js';

describe( 'UpdateBookmarkCommand', () => {
	let domElement, editor, model, command, stub;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );
		stub = sinon.stub( console, 'warn' );

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
		stub.restore();
		domElement.remove();
		return editor.destroy();
	} );

	describe( '#isEnabled()', () => {
		describe( 'should be `true`', () => {
			it( 'when only bookmark element is selected', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				expect( command.isEnabled ).to.equal( true );
			} );
		} );

		describe( 'should be `false`', () => {
			it( 'when selection is collapsed inside paragraph text', () => {
				setModelData( model, '<paragraph>fo[]o</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'when an image is selected', () => {
				setModelData( model, '<paragraph>foo [<imageInline src="#"></imageInline>] bar</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'when a link is selected', () => {
				setModelData( model, '<paragraph>foo [<$text linkHref="foo">link</$text>] bar</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'when selection contains a bookmark and a text', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>bar]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( '#execute()', () => {
		describe( 'should do nothing', () => {
			it( 'if bookmarkId was not passed', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equal( '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'if bookmarkId is an empty string', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( '' );

				expect( getModelData( model ) ).to.equal( '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'if bookmarkId is not a string', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( true );

				expect( getModelData( model ) ).to.equal( '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );
		} );

		describe( 'if a bookmarkId was passed', () => {
			beforeEach( () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			} );

			it( 'should update the bookmarkId of bookmark element with the proper id attribute', () => {
				command.execute( { bookmarkId: 'bar' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="bar"></bookmark></paragraph>'
				);
			} );
		} );

		describe( 'id validation', () => {
			it( 'should warn if the command is executed with invalid id (only spaces)', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( { bookmarkId: '   ' } );

				sinon.assert.calledWithMatch( stub, 'update-bookmark-command-executed-with-invalid-name' );
			} );

			it( 'should warn if the command is executed with invalid id (spaces with bookmark name)', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( { bookmarkId: 'bookmark name' } );

				sinon.assert.calledWithMatch( stub, 'update-bookmark-command-executed-with-invalid-name' );
			} );

			it( 'should warn if the command is executed with invalid id (empty name)', () => {
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				command.execute( { bookmarkId: '' } );

				sinon.assert.calledWithMatch( stub, 'update-bookmark-command-executed-with-invalid-name' );
			} );
		} );
	} );
} );
