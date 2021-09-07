/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView, stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import Table from '@ckeditor/ckeditor5-table/src/table';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Image from '../../src/image';
import ImageEditing from '../../src/image/imageediting';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';
import ImageUtils from '../../src/imageutils';

import {
	getImgViewElementMatcher,
	createImageViewElement,
	determineImageTypeForInsertionAtSelection
} from '../../src/image/utils';

describe( 'image utils', () => {
	let editor, imageUtils, element, image, writer, viewDocument;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ImageUtils ]
		} );

		imageUtils = editor.plugins.get( 'ImageUtils' );

		viewDocument = new ViewDocument( new StylesProcessor() );
		writer = new ViewDowncastWriter( viewDocument );
		image = writer.createContainerElement( 'img' );
		element = writer.createContainerElement( 'figure' );
		writer.insert( writer.createPositionAt( element, 0 ), image );
		imageUtils.toImageWidget( element, writer, 'image widget' );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	describe( 'determineImageTypeForInsertionAtSelection()', () => {
		let editor, model, schema;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageBlockEditing, ImageInlineEditing, Paragraph ]
			} );

			imageUtils = editor.plugins.get( 'ImageUtils' );
			model = editor.model;
			schema = model.schema;
			schema.register( 'block', {
				inheritAllFrom: '$block'
			} );
			schema.register( 'blockWidget', {
				isObject: true,
				allowIn: '$root'
			} );
			schema.register( 'inlineWidget', {
				isObject: true,
				allowIn: [ '$block' ]
			} );
			schema.register( 'listItem', {
				inheritAllFrom: '$block'
			} );

			schema.extend( '$text', { allowIn: [ 'block', '$root' ] } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'listItem', view: 'li' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'blockWidget', view: 'blockWidget' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'inlineWidget', view: 'inlineWidget' } );
		} );

		afterEach( async () => {
			return editor.destroy();
		} );

		it( 'should return "image" when there is no selected block in the selection', () => {
			setModelData( model, 'f[]oo' );

			expect( determineImageTypeForInsertionAtSelection( schema, model.document.selection ) ).to.equal( 'imageBlock' );
		} );

		it( 'should return "image" when the selected block in the selection is empty', () => {
			setModelData( model, '<block>[]</block>' );

			expect( determineImageTypeForInsertionAtSelection( schema, model.document.selection ) ).to.equal( 'imageBlock' );
		} );

		it( 'should return "imageInline" when the selected listItem in the selection is empty', () => {
			setModelData( model, '<listItem>[]</listItem>' );

			expect( determineImageTypeForInsertionAtSelection( schema, model.document.selection ) ).to.equal( 'imageInline' );
		} );

		it( 'should return "image" when the selected block is an object (a widget)', () => {
			setModelData( model, '[<blockWidget></blockWidget>]' );

			expect( determineImageTypeForInsertionAtSelection( schema, model.document.selection ) ).to.equal( 'imageBlock' );
		} );

		it( 'should return "imageInline" when selected block in the selection has some content', () => {
			setModelData( model, '<block>[]a</block>' );

			expect( determineImageTypeForInsertionAtSelection( schema, model.document.selection ) ).to.equal( 'imageInline' );
		} );

		it( 'should return "imageInline" when an inline widget is selected', () => {
			setModelData( model, '<block>[<inlineWidget></inlineWidget>]</block>' );

			expect( determineImageTypeForInsertionAtSelection( schema, model.document.selection ) ).to.equal( 'imageInline' );
		} );
	} );

	describe( 'getImgViewElementMatcher()', () => {
		let editor;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageEditing ]
			} );

			imageUtils = editor.plugins.get( 'ImageUtils' );
		} );

		afterEach( async () => {
			editor.destroy();
		} );

		describe( 'when one of the image editing plugins is not loaded', () => {
			const returnValue = {
				name: 'img'
			};

			it( 'should return a matcher pattern for an img element if ImageBlockEditing plugin is not loaded', () => {
				sinon.stub( editor.plugins, 'has' ).callsFake( pluginName => pluginName !== 'ImageBlockEditing' );

				expect( getImgViewElementMatcher( editor, 'imageBlock' ) ).to.eql( returnValue );
				expect( getImgViewElementMatcher( editor, 'imageInline' ) ).to.eql( returnValue );
			} );

			it( 'should return a matcher patter for an img element if ImageInlineEditing plugin is not loaded', () => {
				sinon.stub( editor.plugins, 'has' ).callsFake( pluginName => pluginName !== 'ImageInlineEditing' );

				expect( getImgViewElementMatcher( editor, 'imageBlock', editor ) ).to.eql( returnValue );
				expect( getImgViewElementMatcher( editor, 'imageInline' ) ).to.eql( returnValue );
			} );
		} );

		describe( 'when both image editing plugins are loaded', () => {
			let matcherPattern, editorElement;

			beforeEach( async () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ImageUtils, Image, Paragraph, Table ]
				} );

				imageUtils = editor.plugins.get( 'ImageUtils' );

				writer = new UpcastWriter( editor.editing.view.document );
			} );

			afterEach( async () => {
				editorElement.remove();
				await editor.destroy();
			} );

			describe( 'the returned matcherPattern function', () => {
				describe( 'for the "image" type requested', () => {
					beforeEach( () => {
						matcherPattern = getImgViewElementMatcher( editor, 'imageBlock' );
					} );

					it( 'should return a function', () => {
						expect( matcherPattern ).to.be.a( 'function' );
					} );

					it( 'should return null if the element is not an image', () => {
						element = writer.createElement( 'media', { src: 'sample.jpg' } );

						expect( matcherPattern( element ) ).to.be.null;
					} );

					it( 'should return null if the element has no src property', () => {
						element = writer.createElement( 'img' );

						expect( matcherPattern( element ) ).to.be.null;
					} );

					it( 'should return null if the element is an "imageInline"', () => {
						element = writer.createElement( 'img', { src: 'sample.jpg' } );

						expect( matcherPattern( element ) ).to.be.null;
					} );

					it( 'should return null if the element is an "imageInline" in a table', () => {
						const fragment = parseView(
							'<figure><table><tbody><tr><td>' +
								'[<img src="sample.jpg"></img>]' +
							'</td></tr></tbody></table></figure>'
						);

						expect( matcherPattern( fragment.selection.getSelectedElement() ) ).to.be.null;
					} );

					it( 'should return a matcherPattern object if the element is an "image"', () => {
						element = writer.createElement( 'img', { src: 'sample.jpg' } );
						writer.appendChild( element, writer.createElement( 'figure', { class: 'image' } ) );

						expect( matcherPattern( element ) ).to.deep.equal( {
							name: true
						} );
					} );
				} );

				describe( 'for the "imageInline" type requested', () => {
					beforeEach( () => {
						matcherPattern = getImgViewElementMatcher( editor, 'imageInline' );
					} );

					it( 'should return a function', () => {
						expect( matcherPattern ).to.be.a( 'function' );
					} );

					it( 'should return null if the element is not an "image"', () => {
						expect( matcherPattern( element ) ).to.be.null;
					} );

					it( 'should return null if the element has no src property', () => {
						element = writer.createElement( 'media', { src: 'sample.jpg' } );

						expect( matcherPattern( element ) ).to.be.null;
					} );

					it( 'should return null if the element is an "image"', () => {
						element = writer.createElement( 'img', { src: 'sample.jpg' } );
						writer.appendChild( element, writer.createElement( 'figure', { class: 'image' } ) );

						expect( matcherPattern( element ) ).to.be.null;
					} );

					it( 'should return a matcherPattern object if the element is an "imageInline"', () => {
						element = writer.createElement( 'img', { src: 'sample.jpg' } );

						expect( matcherPattern( element ) ).to.deep.equal( {
							name: true
						} );
					} );

					it( 'should return a matcherPattern object if the element is an "imageInline" in a table', () => {
						const fragment = parseView(
							'<figure><table><tbody><tr><td>' +
								'[<img src="sample.jpg"></img>]' +
							'</td></tr></tbody></table></figure>'
						);

						expect( matcherPattern( fragment.selection.getSelectedElement() ) ).to.deep.equal( {
							name: true
						} );
					} );
				} );
			} );
		} );
	} );

	describe( 'createImageViewElement()', () => {
		let writer;

		beforeEach( () => {
			const document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should create a figure element for "image" type', () => {
			const element = createImageViewElement( writer, 'imageBlock' );

			expect( element.is( 'element', 'figure' ) ).to.be.true;
			expect( element.hasClass( 'image' ) ).to.be.true;
			expect( element.childCount ).to.equal( 1 );
			expect( element.getChild( 0 ).is( 'emptyElement', 'img' ) ).to.be.true;
		} );

		it( 'should create a span element for "imageInline" type', () => {
			const element = createImageViewElement( writer, 'imageInline' );

			expect( element.is( 'element', 'span' ) ).to.be.true;
			expect( element.hasClass( 'image-inline' ) ).to.be.true;
			expect( element.childCount ).to.equal( 1 );
			expect( element.getChild( 0 ).is( 'emptyElement', 'img' ) ).to.be.true;
		} );

		it( 'should create a span element for "imageInline" type that does not break the parent attribute element', () => {
			const paragraph = writer.createContainerElement( 'p' );
			const imageElement = createImageViewElement( writer, 'imageInline' );
			const attributeElement = writer.createAttributeElement( 'a', { foo: 'bar' } );

			writer.insert( writer.createPositionAt( paragraph, 0 ), imageElement );
			writer.insert( writer.createPositionAt( paragraph, 0 ), writer.createText( 'foo' ) );
			writer.wrap( writer.createRangeIn( paragraph ), attributeElement );

			expect( stringifyView( paragraph ) ).to.equal(
				'<p><a foo="bar">foo<span class="image-inline"><img></img></span></a></p>'
			);
		} );
	} );
} );
