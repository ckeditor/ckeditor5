/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import buildViewConverter from '../../src/conversion/buildviewconverter';

import Model from '../../src/model/model';
import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelElement from '../../src/model/element';
import ModelTextProxy from '../../src/model/textproxy';
import ModelRange from '../../src/model/range';
import ModelWalker from '../../src/model/treewalker';

import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';
import ViewMatcher from '../../src/view/matcher';

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import { convertToModelFragment, convertText } from '../../src/conversion/view-to-model-converters';
import { stringify } from '../../src/dev-utils/model';

function modelAttributesToString( item ) {
	let result = '';

	for ( const attr of item.getAttributes() ) {
		result += ' ' + attr[ 0 ] + '="' + attr[ 1 ] + '"';
	}

	return result;
}

function modelToString( item ) {
	let result = '';

	if ( item instanceof ModelTextProxy ) {
		const attributes = modelAttributesToString( item );

		result = attributes ? '<$text' + attributes + '>' + item.data + '</$text>' : item.data;
	} else {
		const walker = new ModelWalker( { boundaries: ModelRange.createIn( item ), shallow: true } );

		for ( const value of walker ) {
			result += modelToString( value.item );
		}

		if ( item instanceof ModelElement ) {
			const attributes = modelAttributesToString( item );

			result = '<' + item.name + attributes + '>' + result + '</' + item.name + '>';
		}
	}

	return result;
}

const textAttributes = [ 'linkHref', 'linkTitle', 'bold', 'italic', 'style' ];
const pAttributes = [ 'class', 'important', 'theme', 'decorated', 'size' ];

describe( 'View converter builder', () => {
	let dispatcher, model, schema, additionalData;

	beforeEach( () => {
		model = new Model();

		// `additionalData` parameter for `.convert` calls.
		additionalData = { context: [ '$root' ] };

		schema = model.schema;

		schema.register( 'paragraph', {
			inheritAllFrom: '$block',
			allowAttributes: pAttributes
		} );
		schema.register( 'div', {
			inheritAllFrom: '$block',
			allowAttributes: 'class'
		} );
		schema.register( 'customP', {
			inheritAllFrom: 'paragraph'
		} );
		schema.register( 'image', {
			inheritAllFrom: '$text',
			allowAttributes: 'src'
		} );
		schema.register( 'span', {
			inheritAllFrom: '$text',
			allowAttributes: 'transformer'
		} );
		// Yes, folks, we are building MEGATRON.
		schema.register( 'MEGATRON', {
			inheritAllFrom: '$text'
		} );
		schema.register( 'abcd', {
			inheritAllFrom: '$text'
		} );
		schema.extend( '$text', {
			allowAttributes: textAttributes,
			allowIn: [ '$root', 'span', 'abcd', 'MEGATRON' ]
		} );

		dispatcher = new ViewConversionDispatcher( model, { schema } );
		dispatcher.on( 'text', convertText() );
	} );

	it( 'should convert from view element to model element', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		const conversionResult = dispatcher.convert( new ViewContainerElement( 'p', null, new ViewText( 'foo' ) ), additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	it( 'should convert from view element to model element using creator function', () => {
		buildViewConverter().for( dispatcher )
			.fromElement( 'img' )
			.toElement( viewElement => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ) } ) );

		const conversionResult = dispatcher.convert( new ViewContainerElement( 'img', { src: 'foo.jpg' } ), additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<image src="foo.jpg"></image>' );
	} );

	it( 'should convert from view element to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

		const conversionResult = dispatcher.convert(
			new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
		);

		// Have to check root because result is a ModelText.
		expect( modelToString( conversionResult ) ).to.equal( '<$text bold="true">foo</$text>' );
	} );

	it( 'should convert from view element to model attributes using creator function', () => {
		buildViewConverter().for( dispatcher )
			.fromElement( 'a' )
			.toAttribute( viewElement => ( { key: 'linkHref', value: viewElement.getAttribute( 'href' ) } ) );

		const conversionResult = dispatcher.convert(
			new ViewAttributeElement( 'a', { href: 'foo.html' }, new ViewText( 'foo' ) ), additionalData
		);

		// Have to check root because result is a ModelText.
		expect( modelToString( conversionResult ) ).to.equal( '<$text linkHref="foo.html">foo</$text>' );
	} );

	it( 'should convert from view attribute to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		const conversionResult = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), additionalData
		);

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );
	} );

	it( 'should convert from view attribute and key to model attribute', () => {
		schema.extend( 'paragraph', { allowAttributes: 'type' } );

		dispatcher.on( 'documentFragment', convertToModelFragment() );

		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).fromAttribute( 'class', 'important' ).toAttribute( 'important', true );
		buildViewConverter().for( dispatcher ).fromAttribute( 'class', 'theme-nice' ).toAttribute( 'theme', 'nice' );
		buildViewConverter().for( dispatcher ).fromAttribute( 'data-type' ).toAttribute( 'type' );

		const viewStructure = new ViewDocumentFragment( [
			new ViewContainerElement( 'p', { class: 'important' }, new ViewText( 'foo' ) ),
			new ViewContainerElement( 'p', { class: 'important theme-nice' }, new ViewText( 'bar' ) ),
			new ViewContainerElement( 'p', { 'data-type': 'foo' }, new ViewText( 'xyz' ) )
		] );

		const conversionResult = dispatcher.convert( viewStructure, additionalData );

		expect( modelToString( conversionResult ) ).to.equal(
			'<paragraph important="true">foo</paragraph>' +
			'<paragraph important="true" theme="nice">bar</paragraph>' +
			'<paragraph type="foo">xyz</paragraph>'
		);
	} );

	it( 'should convert from multiple view entities to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		buildViewConverter().for( dispatcher )
			.fromElement( 'strong' )
			.fromElement( 'b' )
			.fromAttribute( 'class', 'bold' )
			.fromAttribute( 'style', { 'font-weight': 'bold' } )
			.toAttribute( 'bold', true );

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewAttributeElement( 'strong', null, new ViewText( 'aaa' ) ),
			new ViewAttributeElement( 'b', null, new ViewText( 'bbb' ) ),
			new ViewContainerElement( 'span', { class: 'bold' }, new ViewText( 'ccc' ) ),
			new ViewContainerElement( 'span', { style: 'font-weight:bold; font-size:20px' }, new ViewText( 'ddd' ) )
		] );

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph><$text bold="true">aaabbbcccddd</$text></paragraph>' );
	} );

	it( 'should convert from pattern to marker', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).from( { attribute: { 'data-name': 'search' } } ).toMarker();

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewText( 'Fo' ),
			new ViewAttributeElement( 'marker', { 'data-name': 'search' } ),
			new ViewText( 'o ba' ),
			new ViewAttributeElement( 'marker', { 'data-name': 'search' } ),
			new ViewText( 'r' )
		] );

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		const markerSearch = conversionResult.markers.get( 'search' );

		expect( conversionResult.markers.size ).to.equal( 1 );
		expect( stringify( conversionResult, markerSearch ) ).to.equal( '<paragraph>Fo[o ba]r</paragraph>' );
	} );

	it( 'should convert from element to marker using creator function', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker( data => {
			return new ModelElement( '$marker', { 'data-name': data.getAttribute( 'class' ) } );
		} );

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewText( 'Fo' ),
			new ViewAttributeElement( 'marker', { 'class': 'search' } ),
			new ViewText( 'o ba' ),
			new ViewAttributeElement( 'marker', { 'class': 'search' } ),
			new ViewText( 'r' )
		] );

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		const markerSearch = conversionResult.markers.get( 'search' );

		expect( conversionResult.markers.size ).to.equal( 1 );
		expect( stringify( conversionResult, markerSearch ) ).to.equal( '<paragraph>Fo[o ba]r</paragraph>' );
	} );

	it( 'should convert from multiple view entities to marker', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher )
			.from( { attribute: { 'foo': 'marker' } } )
			.from( { attribute: { 'bar': 'marker' } } )
			.from( { attribute: { 'foo': 'marker', 'bar': 'marker' } } )
			.toMarker();

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewText( 'Fo' ),
			new ViewAttributeElement( 'span', { 'foo': 'marker', 'data-name': 'marker1' } ),
			new ViewText( 'o b' ),
			new ViewAttributeElement( 'span', { 'bar': 'marker', 'data-name': 'marker2' } ),
			new ViewText( 'a' ),
			new ViewAttributeElement( 'span', { 'foo': 'marker', 'bar': 'marker', 'data-name': 'marker3' } ),
			new ViewText( 'r' )
		] );

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		const marker1 = conversionResult.markers.get( 'marker1' );
		const marker2 = conversionResult.markers.get( 'marker2' );
		const marker3 = conversionResult.markers.get( 'marker3' );

		expect( conversionResult.markers.size ).to.equal( 3 );
		expect( stringify( conversionResult, marker1 ) ).to.equal( '<paragraph>Fo[]o bar</paragraph>' );
		expect( stringify( conversionResult, marker2 ) ).to.equal( '<paragraph>Foo b[]ar</paragraph>' );
		expect( stringify( conversionResult, marker3 ) ).to.equal( '<paragraph>Foo ba[]r</paragraph>' );
	} );

	it( 'should do nothing when there is no element matching to marker pattern', () => {
		buildViewConverter().for( dispatcher ).from( { class: 'color' } ).toMarker();

		const element = new ViewAttributeElement( 'span' );

		const result = dispatcher.convert( element, additionalData );

		expect( result ).to.be.instanceof( ModelDocumentFragment );
		expect( result.childCount ).to.equal( 0 );
	} );

	it( 'should throw an error when view element in not valid to convert to marker', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker();

		const element = new ViewAttributeElement( 'marker', { class: 'search' } );

		expect( () => {
			dispatcher.convert( element, additionalData );
		} ).to.throw( CKEditorError, /^build-view-converter-invalid-marker/ );
	} );

	it( 'should throw an error when model element returned by creator has not valid name', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker( () => {
			return new ModelElement( 'element', { 'data-name': 'search' } );
		} );

		const element = new ViewAttributeElement( 'marker', { 'data-name': 'search' } );

		expect( () => {
			dispatcher.convert( element, additionalData );
		} ).to.throw( CKEditorError, /^build-view-converter-invalid-marker/ );
	} );

	it( 'should throw an error when model element returned by creator has not valid data-name attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker( () => {
			return new ModelElement( '$marker', { 'foo': 'search' } );
		} );

		const element = new ViewAttributeElement( 'marker', { 'data-name': 'search' } );

		expect( () => {
			dispatcher.convert( element, additionalData );
		} ).to.throw( CKEditorError, /^build-view-converter-invalid-marker/ );
	} );

	it( 'should convert from pattern to model element', () => {
		buildViewConverter().for( dispatcher ).from(
			{ name: 'span', class: 'megatron', attribute: { head: 'megatron', body: 'megatron', legs: 'megatron' } }
		).toElement( 'MEGATRON' );

		// Adding callbacks later so they are called later. MEGATRON callback is more important.
		buildViewConverter().for( dispatcher ).fromElement( 'span' ).toElement( 'span' );
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		let result;

		// Not quite megatron.
		result = dispatcher.convert(
			new ViewContainerElement( 'span', { class: 'megatron' }, new ViewText( 'foo' ) ), additionalData
		);

		expect( modelToString( result ) ).to.equal( '<span>foo</span>' );

		// Almost a megatron. Missing a head.
		result = dispatcher.convert(
			new ViewContainerElement( 'span', { class: 'megatron', body: 'megatron', legs: 'megatron' }, new ViewText( 'foo' ) ),
			additionalData
		);

		expect( modelToString( result ) ).to.equal( '<span>foo</span>' );

		// This would be a megatron but is a paragraph.
		result = dispatcher.convert(
			new ViewContainerElement(
				'p',
				{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
				new ViewText( 'foo' )
			),
			additionalData
		);

		expect( modelToString( result ) ).to.equal( '<paragraph>foo</paragraph>' );

		// At last we have a megatron!
		result = dispatcher.convert(
			new ViewContainerElement(
				'span',
				{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
				new ViewText( 'foo' )
			),
			additionalData
		);

		expect( modelToString( result ) ).to.equal( '<MEGATRON>foo</MEGATRON>' );
	} );

	it( 'should convert from pattern to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'span' ).toElement( 'span' );

		// This time without name so default span converter will convert children.
		buildViewConverter().for( dispatcher )
			.from( { class: 'megatron', attribute: { head: 'megatron', body: 'megatron', legs: 'megatron' } } )
			.toAttribute( 'transformer', 'megatron' );

		const viewElement = new ViewContainerElement(
			'span',
			{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
			new ViewText( 'foo' )
		);

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<span transformer="megatron">foo</span>' );
	} );

	it( 'should return model document fragment when converting attributes on text', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

		const viewElement = new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) );

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		expect( conversionResult.is( 'documentFragment' ) ).to.be.true;
	} );

	it( 'should set different priorities for `toElement` and `toAttribute` conversion', () => {
		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		const conversionResult = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), additionalData
		);

		// Element converter was fired first even though attribute converter was added first.
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );
	} );

	it( 'should overwrite default priorities for converters', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		let result;

		result = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), additionalData
		);

		expect( modelToString( result ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );

		buildViewConverter().for( dispatcher )
			.from( { name: 'p', class: 'myClass' } ).withPriority( 'high' )
			.toElement( 'customP' );

		result = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), additionalData
		);

		expect( modelToString( result ) ).to.equal( '<customP>foo</customP>' );
	} );

	it( 'should overwrite default consumed values', () => {
		// Converter (1).
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		// Converter (2).
		buildViewConverter().for( dispatcher )
			.from( { name: 'p', class: 'decorated' } ).consuming( { class: 'decorated' } )
			.toAttribute( 'decorated', true );

		// Converter (3).
		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class', 'small' ).consuming( { class: 'small' } )
			.toAttribute( 'size', 'small' );

		const viewElement = new ViewContainerElement( 'p', { class: 'decorated small' }, new ViewText( 'foo' ) );
		const conversionResult = dispatcher.convert( viewElement, additionalData );

		// P element and it's children got converted by the converter (1) and the converter (1) got fired
		// because P name was not consumed in converter (2). Converter (3) could consume class="small" because
		// only class="decorated" was consumed in converter (2).
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph decorated="true" size="small">foo</paragraph>' );
	} );

	it( 'should convert from matcher instance to model', () => {
		// Universal class converter, synonymous to .fromAttribute( 'class' ).
		buildViewConverter().for( dispatcher )
			.from( new ViewMatcher( { class: /.*/ } ) )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		// Universal element converter.
		buildViewConverter().for( dispatcher )
			.from( new ViewMatcher( { name: /.*/ } ) )
			.toElement( viewElement => new ModelElement( viewElement.name ) );

		const viewStructure = new ViewContainerElement( 'div', { class: 'myClass' }, [
			new ViewContainerElement( 'abcd', null, new ViewText( 'foo' ) )
		] );

		const conversionResult = dispatcher.convert( viewStructure, additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<div class="myClass"><abcd>foo</abcd></div>' );
	} );

	it( 'should filter out structure that is wrong with schema - elements', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'div' ).toElement( 'div' );
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		// Disallow $root>div.
		schema.addChildCheck( ( ctx, childDef ) => {
			if ( childDef.name == 'div' && ctx.endsWith( '$root' ) ) {
				return false;
			}
		} );

		dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );

		const viewElement = new ViewContainerElement( 'div', null,
			new ViewContainerElement( 'p', null,
				new ViewText( 'foo' )
			)
		);

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	// TMP We can't make this test work for now.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/1213#issuecomment-354454906
	//
	// it( 'should filter out structure that is wrong with schema - attributes', () => {
	// 	buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
	// 	buildViewConverter().for( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

	// 	// Disallow bold in paragraph>$text.
	// 	schema.on( 'checkAttribute', ( evt, args ) => {
	// 		const context = args[ 0 ];
	// 		const attributeName = args[ 1 ];

	// 		if ( ctx.endsWith( 'paragraph $text' ) && attributeName == 'bold' ) {
	// 			evt.stop();
	// 			evt.return = false;
	// 		}
	// 	}, { priority: 'high' } );

	// 	dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );

	// 	const viewElement = new ViewContainerElement( 'p', null,
	// 		new ViewAttributeElement( 'strong', null,
	// 			new ViewText( 'foo' )
	// 		)
	// 	);

	// 	const conversionResult = dispatcher.convert( viewElement, additionalData );

	// 	expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	// } );

	it( 'should not set attribute when it is not allowed', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).fromElement( 'u' ).toAttribute( 'underscore', true );

		const viewElement = new ViewContainerElement( 'p', null,
			new ViewAttributeElement( 'u', null,
				new ViewText( 'foo' )
			)
		);

		const conversionResult = dispatcher.convert( viewElement, additionalData );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	it( 'should stop to element conversion if creating function returned null', () => {
		buildViewConverter()
			.for( dispatcher )
			.fromElement( 'p' )
			.toElement( viewElement => {
				return viewElement.hasAttribute( 'stop' ) ? null : new ModelElement( 'paragraph' );
			} );

		const viewElement = new ViewContainerElement( 'p' );
		let conversionResult = dispatcher.convert( viewElement, additionalData );
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph></paragraph>' );

		viewElement.setAttribute( 'stop', true );
		conversionResult = dispatcher.convert( viewElement, additionalData );

		expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
		expect( conversionResult.childCount ).to.equal( 0 );
	} );

	it( 'should stop to attribute conversion if creating function returned null', () => {
		schema.extend( 'paragraph', { allowAttributes: 'type' } );

		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		buildViewConverter().for( dispatcher ).fromAttribute( 'data-type' ).toAttribute( viewElement => {
			const value = viewElement.getAttribute( 'data-type' );

			return value == 'stop' ? null : { key: 'type', value };
		} );

		const viewElement = new ViewContainerElement( 'p', { 'data-type': 'foo' } );
		let conversionResult = dispatcher.convert( viewElement, additionalData );
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph type="foo"></paragraph>' );

		viewElement.setAttribute( 'data-type', 'stop' );
		conversionResult = dispatcher.convert( viewElement, additionalData );
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph></paragraph>' );
	} );
} );
