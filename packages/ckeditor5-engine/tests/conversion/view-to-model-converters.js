/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';
import ViewContainerElement from '../../src/view/containerelement';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewText from '../../src/view/text';

import Model from '../../src/model/model';
import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';

import { convertToModelFragment, convertText } from '../../src/conversion/view-to-model-converters';

describe( 'view-to-model-converters', () => {
	let dispatcher, schema, context, model;

	beforeEach( () => {
		model = new Model();
		schema = model.schema;

		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		schema.extend( '$text', { allowIn: '$root' } );

		context = [ '$root' ];

		dispatcher = new ViewConversionDispatcher( model, { schema } );
	} );

	describe( 'convertText()', () => {
		it( 'should return converter converting ViewText to ModelText', () => {
			const viewText = new ViewText( 'foobar' );

			dispatcher.on( 'text', convertText() );

			const conversionResult = dispatcher.convert( viewText );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should not convert already consumed texts', () => {
			const viewText = new ViewText( 'foofuckbafuckr' );

			// Default converter for elements. Returns just converted children. Added with lowest priority.
			dispatcher.on( 'text', convertText(), { priority: 'lowest' } );
			// Added with normal priority. Should make the above converter not fire.
			dispatcher.on( 'text', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.consume( data.viewItem ) ) {
					const text = conversionApi.writer.createText( data.viewItem.data.replace( /fuck/gi, '****' ) );
					conversionApi.writer.insert( text, data.cursorPosition );
					data.modelRange = ModelRange.createFromPositionAndShift( data.cursorPosition, text.offsetSize );
					data.cursorPosition = data.modelRange.end;
				}
			} );

			const conversionResult = dispatcher.convert( viewText, context );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foo****ba****r' );
		} );

		it( 'should not convert text if it is wrong with schema', () => {
			schema.addChildCheck( ( ctx, childDef ) => {
				if ( childDef.name == '$text' && ctx.endsWith( '$root' ) ) {
					return false;
				}
			} );

			const viewText = new ViewText( 'foobar' );
			dispatcher.on( 'text', convertText() );

			let conversionResult = dispatcher.convert( viewText, context );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 0 );

			conversionResult = dispatcher.convert( viewText, [ '$block' ] );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.childCount ).to.equal( 1 );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should support unicode', () => {
			const viewText = new ViewText( 'நிலைக்கு' );

			dispatcher.on( 'text', convertText() );

			const conversionResult = dispatcher.convert( viewText, context );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelText );
			expect( conversionResult.getChild( 0 ).data ).to.equal( 'நிலைக்கு' );
		} );
	} );

	describe( 'convertToModelFragment()', () => {
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

			const conversionResult = dispatcher.convert( viewFragment, context );

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
			dispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
				if ( conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
					const paragraph = conversionApi.writer.createElement( 'paragraph' );

					conversionApi.writer.insert( paragraph, data.cursorPosition );
					conversionApi.convertChildren( data.viewItem, ModelPosition.createAt( paragraph ) );

					data.modelRange = ModelRange.createOn( paragraph );
					data.cursorPosition = data.modelRange.end;
				}
			} );

			const conversionResult = dispatcher.convert( viewP, context );

			expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
			expect( conversionResult.getChild( 0 ) ).to.be.instanceof( ModelElement );
			expect( conversionResult.getChild( 0 ).name ).to.equal( 'paragraph' );
			expect( conversionResult.getChild( 0 ).maxOffset ).to.equal( 3 );
			expect( conversionResult.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
		} );
	} );
} );
