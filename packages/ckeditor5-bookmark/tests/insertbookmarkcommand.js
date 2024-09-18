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
import { ImageInline, ImageBlock } from '@ckeditor/ckeditor5-image';
import { Table } from '@ckeditor/ckeditor5-table';

import BookmarkEditing from '../src/bookmarkediting.js';
import InsertBookmarkCommand from '../src/insertbookmarkcommand.js';

describe( 'InsertBookmarkCommand', () => {
	let domElement, editor, model, command;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				ImageInline,
				ImageBlock,
				Table,
				BookmarkEditing,
				Bold,
				Italic
			]
		} );

		model = editor.model;
		command = new InsertBookmarkCommand( editor );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	describe( '#isEnabled()', () => {
		describe( 'should be `true`', () => {
			it( 'when bookmark element is allowed in the selection focus', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected text in `paragraph`', () => {
				setModelData( model, '<paragraph>[foobar]</paragraph>' );

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed in selected text in `heading`', () => {
				setModelData( model, '<heading1>[foobar]</heading1>' );

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected `imageInline`', () => {
				setModelData( model, '<paragraph>[<imageInline src="#"></imageInline>]</paragraph>' );

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected `imageBlock`', () => {
				setModelData( model, '[<imageBlock src="#"></imageBlock>]' );

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected `Table`', () => {
				setModelData( model, '[<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>]' );

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected single `TableCell` (1 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>foo</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected two `TableCell` (2 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected single `TableCell` (4 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'[<tableCell><paragraph>bar</paragraph></tableCell>]' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selected two `TableCell`s (4 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'[<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				expect( command.isEnabled ).to.equal( true );
			} );

			it( 'when bookmark element is allowed on selection in `paragraph` inside single `TableCell` (1 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]foo</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( command.isEnabled ).to.equal( true );
			} );
		} );

		describe( 'should be `false`', () => {
			it( 'when bookmark element is not allowed in the selection focus', () => {
				model.schema.addChildCheck( ( ctx, definition ) => {
					if ( definition.name !== 'bookmark' ) {
						return;
					}

					// Disallow bookmark in paragraph.
					if ( ctx.endsWith( 'paragraph' ) && definition.name == 'bookmark' ) {
						return false;
					}
				} );

				setModelData( model, '<paragraph>fo[]o</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'when bookmark element is not allowed on custom defined elements', () => {
				model.schema.register( 'fooWrapper' );
				model.schema.register( 'fooBlock', { inheritAllFrom: '$block' } );

				model.schema.extend( 'fooWrapper', { allowIn: '$root' } );
				model.schema.extend( 'fooBlock', { allowIn: 'fooWrapper', disallowChildren: [ 'bookmark', 'paragraph' ] } );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'fooWrapper', view: 'foowrapper' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'fooBlock', view: 'fooblock' } );

				setModelData(
					model,
					'<paragraph></paragraph>' +
					'<fooWrapper>[<fooBlock>xx</fooBlock>]</fooWrapper>' +
					'<paragraph></paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( '#execute()', () => {
		describe( 'should do nothing', () => {
			it( 'if bookmarkId was not passed', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'if bookmarkId is an empty string', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				command.execute( '' );

				expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'if bookmarkId is not a string', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				command.execute( { 'id': 'foo' } );

				expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );
		} );

		describe( 'if a bookmarkId was passed', () => {
			it( 'should create bookmark element with the proper id attribute', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>'
				);
			} );

			it( 'should create bookmark element at the beginning of selected text in `paragraph`', () => {
				setModelData( model, '<paragraph>[foobar]</paragraph>' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="foo"></bookmark>foobar</paragraph>'
				);
			} );

			it( 'should create bookmark element at the beginning of selected text in `heading`', () => {
				setModelData( model, '<heading1>[foobar]</heading1>' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<heading1><bookmark bookmarkId="foo"></bookmark>foobar</heading1>'
				);
			} );

			it( 'should create bookmark element before selected `imageInline`', () => {
				setModelData( model, '<paragraph>[<imageInline src="#"></imageInline>]</paragraph>' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'<bookmark bookmarkId="foo"></bookmark>' +
						'<imageInline src="#"></imageInline>' +
					'</paragraph>'
				);
			} );

			it( 'should create bookmark element before selected `imageInline` surrounded by text', () => {
				setModelData( model, '<paragraph>foo [<imageInline src="#"></imageInline>] bar</paragraph>' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'foo ' +
						'<bookmark bookmarkId="foo"></bookmark>' +
						'<imageInline src="#"></imageInline>' +
						' bar' +
					'</paragraph>'
				);
			} );

			it( 'should create paragraph with bookmark element inside before selected `imageBlock`', () => {
				setModelData( model, '[<imageBlock src="#"></imageBlock>]' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' +
					'<imageBlock src="#"></imageBlock>'
				);
			} );

			it( 'should create paragraph (not merged with previous one) with bookmark element inside before selected `imageBlock`', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					'[<imageBlock src="#"></imageBlock>]' );

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' +
					'<imageBlock src="#"></imageBlock>'
				);
			} );

			it( 'should create bookmark element in a paragraph before selected `Table`', () => {
				setModelData(
					model,
					'[<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>]'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should create bookmark element at first allowed place when two `TableCell` are selected (2 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph><bookmark bookmarkId="foo"></bookmark>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should create bookmark element at first allowed place when two `TableCell`s are selected (4 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>1</paragraph></tableCell>' +
							'<tableCell><paragraph>2</paragraph></tableCell>' +
							'[<tableCell><paragraph>3</paragraph></tableCell>' +
							'<tableCell><paragraph>4</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>1</paragraph></tableCell>' +
							'<tableCell><paragraph>2</paragraph></tableCell>' +
							'<tableCell><paragraph><bookmark bookmarkId="foo"></bookmark>3</paragraph></tableCell>' +
							'<tableCell><paragraph>4</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should create bookmark element at first allowed place when all `TableCell`s are selected (4 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'[<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>]' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph><bookmark bookmarkId="foo"></bookmark>foo</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should create bookmark element at first allowed place when two `TableCell`s are selected ' +
				'when first contains a block element (4 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'[<tableCell><imageBlock src="#"></imageBlock></tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>]' +
							'<tableCell><paragraph>baz</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell>' +
								'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' +
								'<imageBlock src="#"></imageBlock>' +
							'</tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>baz</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should create paragraph with bookmark element at first allowed place when two `TableCell`s are selected ' +
				'when first contains a block element and a paragraph after (4 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'[<tableCell>' +
								'<imageBlock src="#"></imageBlock><paragraph>bar</paragraph>' +
							'</tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>]' +
							'<tableCell><paragraph>baz</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell>' +
								'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>' +
								'<imageBlock src="#"></imageBlock>' +
								'<paragraph>bar</paragraph>' +
							'</tableCell>' +
							'<tableCell><paragraph>bar</paragraph></tableCell>' +
							'<tableCell><paragraph>baz</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should create bookmark element at selection in `paragraph` inside single `TableCell` (1 cell table)', () => {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]foo</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph><bookmark bookmarkId="foo"></bookmark>foo</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not retain selection attributes', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				editor.execute( 'bold' );
				editor.execute( 'italic' );
				command.execute( { bookmarkId: 'foo' } );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><bookmark bookmarkId="foo"></bookmark></paragraph>'
				);
			} );
		} );
	} );
} );
