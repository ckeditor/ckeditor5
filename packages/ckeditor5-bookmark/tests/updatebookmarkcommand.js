/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

import BookmarkEditing from '../src/bookmarkediting.js';
import UpdateBookmarkCommand from '../src/updatebookmarkcommand.js';

describe( 'UpdateBookmarkCommand', () => {
	let domElement, editor, model, command;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				BookmarkEditing,
				Bold,
				Italic
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
				setModelData( model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				expect( command.isEnabled ).to.equal( true );
			} );
		} );

		describe( 'should be `false`', () => {
			it( 'when selection is collapsed inside paragraph text', () => {
				setModelData( model, '<paragraph>fo[]o</paragraph>' );

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
	} );
} );
