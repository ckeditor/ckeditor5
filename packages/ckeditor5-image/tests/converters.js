/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { viewToModelImage, modelToViewSelection, createImageAttributeConverter } from '../src/converters';
import ViewConversionDispatcher from '@ckeditor/ckeditor5-engine/src/conversion/viewconversiondispatcher';
import Schema from '@ckeditor/ckeditor5-engine/src/model/schema';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { stringify as stringifyModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe.only( 'Image converters', () => {
	describe( 'viewToModelImage', () => {
		let dispatcher;

		beforeEach( () => {
			const schema = new Schema();
			schema.registerItem( 'image' );
			schema.requireAttributes( 'image', [ 'src' ] );
			schema.allow( { name: 'image', attributes: [ 'alt', 'src' ], inside: '$root' } );
			schema.objects.add( 'image' );

			dispatcher = new ViewConversionDispatcher( { schema } );
			dispatcher.on( 'element:figure', viewToModelImage() );
		} );

		it( 'should convert view figure element', () => {
			test(
				'<figure class="image"><img src="foo.png" alt="bar baz"></img></figure>',
				'<image alt="bar baz" src="foo.png"></image>'
			);
		} );

		it( 'should convert without alt', () => {
			test(
				'<figure class="image"><img src="foo.png"></img></figure>',
				'<image src="foo.png"></image>'
			);
		} );

		it( 'should not convert if figure element is already consumed', () => {
			dispatcher.on( 'element:figure', ( evt, data, consumable ) => {
				consumable.consume( data.input, { name: true, class: 'image' } );

				data.output = new ModelElement( 'not-image' );
			}, { priority: 'high' } );

			test(
				'<figure class="image"><img src="foo.png" alt="bar baz"></img></figure>',
				'<not-image></not-image>'
			);
		} );

		function test( viewString, modelString ) {
			const element = parseView( viewString );
			const model = dispatcher.convert( element );

			expect( stringifyModel( model ) ).to.equal( modelString );
		}
	} );
} );
