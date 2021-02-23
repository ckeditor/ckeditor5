/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import MediaEmbedEditing from '../src/mediaembedediting';
import MediaEmbedCommand from '../src/mediaembedcommand';
import { Widget } from '@ckeditor/ckeditor5-widget';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';

describe( 'MediaEmbedCommand', () => {
	let element, editor, model, command;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Widget, MediaEmbedEditing, TableEditing ],
				mediaEmbed: {
					providers: [
						{
							name: 'ckeditor',
							url: /^ckeditor.com/,
							html: () => {
								return '<div></div>';
							}
						},
						{
							name: 'cksource',
							url: /^cksource.com/,
							html: () => {
								return '<div></div>';
							}
						}
					]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new MediaEmbedCommand( editor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				editor.conversion.elementToElement( { model: 'p', view: 'p' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				element.remove();
			} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if in a root', () => {
			setData( model, '[]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if in a paragraph (collapsed)', () => {
			setData( model, '<p>foo[]</p>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if in a paragraph (not collapsed)', () => {
			setData( model, '<p>[foo]</p>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if a media is selected', () => {
			setData( model, '[<media url="http://ckeditor.com"></media>]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if a media is selected in a table cell', () => {
			model.schema.extend( 'media', { allowIn: 'tableCell' } );

			setData( model, '<table><tableRow><tableCell>[<media></media>]</tableCell></tableRow></table>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if in a table cell', () => {
			model.schema.extend( '$block', { allowIn: 'tableCell' } );

			setData( model, '<table><tableRow><tableCell><p>foo[]</p></tableCell></tableRow></table>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );

			editor.conversion.elementToElement( { model: 'block', view: 'div' } );

			setData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection in a limit element', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.register( 'limit', { allowIn: 'block', isLimit: true } );
			model.schema.extend( '$text', { allowIn: 'limit' } );

			editor.conversion.elementToElement( { model: 'block', view: 'div' } );
			editor.conversion.elementToElement( { model: 'limit', view: 'span' } );

			setData( model, '<block><limit>foo[]</limit></block>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if a non-object element is selected', () => {
			model.schema.register( 'element', { allowIn: '$root', isSelectable: true } );

			editor.conversion.elementToElement( { model: 'element', view: 'span' } );

			setData( model, '[<element></element>]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if a non-media object is selected', () => {
			model.schema.register( 'image', { isObject: true, isBlock: true, allowWhere: '$block' } );

			editor.conversion.elementToElement( { model: 'image', view: 'img' } );

			setData( model, '[<image src="http://ckeditor.com"></image>]' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'value', () => {
		it( 'should be null when no media is selected (paragraph)', () => {
			setData( model, '<p>foo[]</p>' );
			expect( command.value ).to.be.null;
		} );

		it( 'should equal the url of the selected media', () => {
			setData( model, '[<media url="http://ckeditor.com"></media>]' );
			expect( command.value ).to.equal( 'http://ckeditor.com' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setData( model, '<p>foo[]</p>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( 'http://ckeditor.com' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should insert a media in an empty root and select it', () => {
			setData( model, '[]' );

			command.execute( 'http://ckeditor.com' );

			expect( getData( model ) ).to.equal( '[<media url="http://ckeditor.com"></media>]' );
		} );

		it( 'should update media url', () => {
			setData( model, '[<media url="http://ckeditor.com"></media>]' );

			command.execute( 'http://cksource.com' );

			expect( getData( model ) ).to.equal( '[<media url="http://cksource.com"></media>]' );
		} );
	} );
} );
