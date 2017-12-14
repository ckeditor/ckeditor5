/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocument from '../../src/model/document';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';

import ViewDocument from '../../src/view/document';
import ViewElement from '../../src/view/element';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';

import Mapper from '../../src/conversion/mapper';
import ModelConversionDispatcher from '../../src/conversion/modelconversiondispatcher';

import { insertText, remove } from '../../src/conversion/model-to-view-converters';
import { convertText } from '../../src/conversion/view-to-model-converters';

import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute,
	modelElementToViewContainerElement,
	viewToModelElement
} from '../../src/conversion/configurationdefinedconverters';

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';
import ModelSchema from '../../src/model/schema';
import ModelWalker from '../../src/model/treewalker';
import ModelTextProxy from '../../src/model/textproxy';

function viewAttributesToString( item ) {
	let result = '';

	for ( const key of item.getAttributeKeys() ) {
		const value = item.getAttribute( key );

		if ( value ) {
			result += ' ' + key + '="' + value + '"';
		}
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

function modelAttributesToString( item ) {
	let result = '';

	for ( const attr of item.getAttributes() ) {
		result += ' ' + attr[ 0 ] + '="' + attr[ 1 ] + '"';
	}

	return result;
}

function viewToString( item ) {
	let result = '';

	if ( item instanceof ViewText ) {
		result = item.data;
	} else {
		// ViewElement or ViewDocumentFragment.
		for ( const child of item.getChildren() ) {
			result += viewToString( child );
		}

		if ( item instanceof ViewElement ) {
			result = '<' + item.name + viewAttributesToString( item ) + '>' + result + '</' + item.name + '>';
		}
	}

	return result;
}

describe( 'Configuration defined converters', () => {
	let dispatcher, mapper, modelDoc, modelRoot, viewDoc, viewRoot, viewSelection, batch;

	beforeEach( () => {
		modelDoc = new ModelDocument();
		modelRoot = modelDoc.createRoot( 'root', 'root' );

		batch = modelDoc.batch();

		viewDoc = new ViewDocument();
		viewRoot = viewDoc.createRoot( 'div' );
		viewSelection = viewDoc.selection;

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );

		dispatcher = new ModelConversionDispatcher( modelDoc, { mapper, viewSelection } );

		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'remove', remove() );
	} );

	afterEach( () => {
		viewDoc.destroy();
	} );

	describe( 'Attribute converters', () => {
		function testConversion( definition, expectedConversion ) {
			modelAttributeToViewAttributeElement( 'foo', definition, [ dispatcher ] );

			const modelElement = new ModelText( 'foo', { foo: 'bar' } );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( expectedConversion );

			batch.removeAttribute( 'bold', modelRoot );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelRoot ), 'foo', 'bar', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		}

		describe( 'model to view conversion', () => {
			it( 'using passed view element name', () => {
				testConversion( { model: 'bar', view: 'strong' }, '<div><strong>foo</strong></div>' );
			} );

			it( 'using passed view element object', () => {
				testConversion( { model: 'bar', view: { name: 'strong' } }, '<div><strong>foo</strong></div>' );
			} );

			it( 'using passed view element object with styles object', () => {
				testConversion( {
					model: 'bar',
					view: { name: 'span', styles: { 'font-weight': 'bold' } }
				}, '<div><span style="font-weight:bold;">foo</span></div>' );
			} );

			it( 'using passed view element object with class string', () => {
				testConversion( { model: 'bar', view: { name: 'span', classes: 'foo' } }, '<div><span class="foo">foo</span></div>' );
			} );

			it( 'using passed view element object with class array', () => {
				testConversion( {
					model: 'bar',
					view: { name: 'span', classes: [ 'foo', 'foo-bar' ] }
				}, '<div><span class="foo foo-bar">foo</span></div>' );
			} );

			it( 'using passed view element object with attributes', () => {
				testConversion( {
					model: 'bar',
					view: { name: 'span', attributes: { 'data-foo': 'bar' } }
				}, '<div><span data-foo="bar">foo</span></div>' );
			} );

			it( 'should do nothing for undefined value', () => {
				modelAttributeToViewAttributeElement( 'foo', { model: 'bar', view: 'strong' }, [ dispatcher ] );

				const modelElement = new ModelText( 'foo', { foo: 'baz' } );
				modelRoot.appendChildren( modelElement );

				dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

				expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
			} );
		} );

		describe( 'view to model conversion', () => {
			let dispatcher, schema, additionalData, batch;

			const modelDocument = new ModelDocument();

			beforeEach( () => {
				batch = modelDocument.batch();

				// `additionalData` parameter for `.convert` calls.
				additionalData = { context: [ '$root' ] };

				schema = new ModelSchema();

				schema.registerItem( 'div', '$block' );

				schema.allow( { name: '$inline', attributes: [ 'foo' ], inside: '$root' } );
				schema.allow( { name: '$text', inside: '$root' } );

				dispatcher = new ViewConversionDispatcher( { schema } );
				dispatcher.on( 'text', convertText() );
			} );

			it( 'should convert using element name', () => {
				viewToModelAttribute( 'foo', { model: 'bar', view: 'strong' }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using object', () => {
				viewToModelAttribute( 'foo', { model: 'bar', view: { name: 'strong' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using class string', () => {
				viewToModelAttribute( 'foo', { model: 'bar', view: { name: 'span', classes: 'foo' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { class: 'foo' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using classes array', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: { name: 'span', classes: [ 'foo', 'bar' ] }
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { class: 'foo bar' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using styles object', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: { name: 'span', styles: { 'font-weight': 'bold' } }
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { style: 'font-weight:bold' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using attributes object', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: { name: 'span', attributes: { 'data-foo': 'bar' } }
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using acceptAlso array', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: 'strong',
					acceptsAlso: [
						{ name: 'span', classes: [ 'foo', 'bar' ] },
						{ name: 'span', attributes: { 'data-foo': 'bar' } }
					]
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using priority', () => {
				viewToModelAttribute( 'foo', { model: 'baz', view: 'strong' }, [ dispatcher ] );
				viewToModelAttribute( 'foo', { model: 'bar', view: { name: 'strong', priority: 'high' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );
		} );
	} );

	describe( 'Element converters', () => {
		function testModelConversion( definition, expectedResult ) {
			modelElementToViewContainerElement( definition, [ dispatcher ] );

			const modelElement = new ModelElement( 'foo', null, new ModelText( 'bar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div>' + expectedResult + '</div>' );
		}

		describe( 'model to view conversion', () => {
			it( 'using passed view element name', () => {
				testModelConversion( { model: 'foo', view: 'strong' }, '<strong>bar</strong>' );
			} );

			it( 'using passed view element object', () => {
				testModelConversion( { model: 'foo', view: { name: 'strong' } }, '<strong>bar</strong>' );
			} );

			it( 'using passed view element object with styles object', () => {
				testModelConversion( {
					model: 'foo',
					view: { name: 'span', styles: { 'font-weight': 'bold' } }
				}, '<span style="font-weight:bold;">bar</span>' );
			} );

			it( 'using passed view element object with class string', () => {
				testModelConversion( { model: 'foo', view: { name: 'span', classes: 'foo' } }, '<span class="foo">bar</span>' );
			} );

			it( 'using passed view element object with class array', () => {
				testModelConversion( {
					model: 'foo',
					view: { name: 'span', classes: [ 'foo', 'foo-bar' ] }
				}, '<span class="foo foo-bar">bar</span>' );
			} );

			it( 'using passed view element object with attributes', () => {
				testModelConversion( {
					model: 'foo',
					view: { name: 'span', attributes: { 'data-foo': 'bar' } }
				}, '<span data-foo="bar">bar</span>' );
			} );
		} );

		describe( 'view to model conversion', () => {
			let dispatcher, schema, additionalData, batch;

			const modelDocument = new ModelDocument();

			beforeEach( () => {
				batch = modelDocument.batch();

				// `additionalData` parameter for `.convert` calls.
				additionalData = { context: [ '$root' ] };

				schema = new ModelSchema();

				schema.registerItem( 'div', '$block' );
				schema.registerItem( 'bar', '$block' );
				schema.registerItem( 'baz', '$block' );

				schema.allow( { name: '$inline', attributes: [ 'foo' ], inside: '$root' } );
				schema.allow( { name: '$text', inside: '$inline' } );

				dispatcher = new ViewConversionDispatcher( { schema } );
				dispatcher.on( 'text', convertText() );
			} );

			it( 'should convert using element name', () => {
				viewToModelElement( { model: 'bar', view: 'strong' }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'strong', null, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using object', () => {
				viewToModelElement( { model: 'bar', view: { name: 'strong' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'strong', null, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using class string', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', classes: 'foo' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { class: 'foo' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using classes array', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', classes: [ 'foo', 'bar' ] } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { class: 'foo bar' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using styles object', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', styles: { 'font-weight': 'bold' } } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { style: 'font-weight:bold' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using attributes object', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', attributes: { 'data-foo': 'bar' } } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using acceptAlso array', () => {
				viewToModelElement( {
					model: 'bar',
					view: 'strong',
					acceptsAlso: [
						{ name: 'span', classes: [ 'foo', 'bar' ] },
						{ name: 'span', attributes: { 'data-foo': 'bar' } }
					]
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using priority', () => {
				viewToModelElement( { model: 'baz', view: 'strong' }, [ dispatcher ] );
				viewToModelElement( { model: 'bar', view: { name: 'strong', priority: 'high' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'strong', null, new ViewText( 'foo' ) ), batch, additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );
		} );
	} );
} );
