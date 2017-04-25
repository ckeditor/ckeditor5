/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';
import ViewContainerElement from '../../src/view/containerelement';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewText from '../../src/view/text';

import ModelSchema from '../../src/model/schema';
import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';

import { convertToModelFragment, convertText } from '../../src/conversion/view-to-model-converters';

describe( 'view-to-model-converters', () => {
	let dispatcher, schema, objWithContext;

	beforeEach( () => {
		schema = new ModelSchema();
		schema.registerItem( 'paragraph', '$block' );
		schema.allow( { name: '$text', inside: '$root' } );
		objWithContext = { context: [ '$root' ] };
		dispatcher = new ViewConversionDispatcher( { schema } );
	} );

	describe( 'convertText', () => {
		it( 'should return converter converting ViewText to ModelText', () => {
			const viewText = new ViewText( 'foobar' );

			dispatcher.on( 'text', convertText() );

			const conversionResult = dispatcher.convert( viewText, objWithContext );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should not convert already consumed texts', () => {
			const viewText = new ViewText( 'foofuckbafuckr' );

			// Default converter for elements. Returns just converted children. Added with lowest priority.
			dispatcher.on( 'text', convertText(), { priority: 'lowest' } );
			// Added with normal priority. Should make the above converter not fire.
			dispatcher.on( 'text', ( evt, data, consumable ) => {
				if ( consumable.consume( data.input ) ) {
					data.output = new ModelText( data.input.data.replace( /fuck/gi, '****' ) );
				}
			} );

			const conversionResult = dispatcher.convert( viewText, objWithContext );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foo****ba****r' );
		} );

		it( 'should not convert text if it is wrong with schema', () => {
			schema.disallow( { name: '$text', inside: '$root' } );

			const viewText = new ViewText( 'foobar' );
			dispatcher.on( 'text', convertText() );

			let conversionResult = dispatcher.convert( viewText, objWithContext );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 0 );

			conversionResult = dispatcher.convert( viewText, { context: [ '$block' ] } );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 1 );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should support unicode', () => {
			const viewText = new ViewText( 'நிலைக்கு' );

			dispatcher.on( 'text', convertText() );

			const conversionResult = dispatcher.convert( viewText, objWithContext );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'நிலைக்கு' );
		} );
	} );

	describe( 'convertToModelFragment', () => {
		it( 'should return converter converting whole ViewDocumentFragment to ModelDocumentFragment', () => {
			const viewFragment = new ViewDocumentFragment( [
				new ViewContainerElement( 'p', null, new ViewText( 'foo' ) ),
				new ViewText( 'bar' )
			] );

			// To get any meaningful results we have to actually convert something.
			dispatcher.on( 'text', convertText() );
			// This way P element won't be converted per-se but will fire converting it's children.
			dispatcher.on( 'element', convertToModelFragment() );
			dispatcher.on( 'documentFragment', convertToModelFragment() );

			const conversionResult = dispatcher.convert( viewFragment, objWithContext );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.maxOffset ).to.equal( 6 );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should not convert already consumed (converted) changes', () => {
			const viewP = new ViewContainerElement( 'p', null, new ViewText( 'foo' ) );

			// To get any meaningful results we have to actually convert something.
			dispatcher.on( 'text', convertText() );
			// Default converter for elements. Returns just converted children. Added with lowest priority.
			dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
			// Added with normal priority. Should make the above converter not fire.
			dispatcher.on( 'element:p', ( evt, data, consumable, conversionApi ) => {
				if ( consumable.consume( data.input, { name: true } ) ) {
					data.output = new ModelElement( 'paragraph' );

					data.context.push( data.output );
					data.output.appendChildren( conversionApi.convertChildren( data.input, consumable, data ) );
					data.context.pop();
				}
			} );

			const conversionResult = dispatcher.convert( viewP, objWithContext );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelElement );
			expect( conversionResult.getChild( 0 ).name ).to.equal( 'paragraph' );
			expect( conversionResult.getChild( 0 ).maxOffset ).to.equal( 3 );
			expect( conversionResult.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
		} );
	} );
} );
