/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';

import ViewElement from '../../src/view/element';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';

import { convertText } from '../../src/conversion/view-to-model-converters';

import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute,
	modelElementToViewContainerElement,
	viewToModelElement
} from '../../src/conversion/definition-based-converters';

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';
import ModelWalker from '../../src/model/treewalker';
import ModelTextProxy from '../../src/model/textproxy';
import Model from '../../src/model/model';
import ModelPosition from '../../src/model/position';
import EditingController from '../../src/controller/editingcontroller';

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

describe( 'definition-based-converters', () => {
	let model, dispatcher, modelDoc, modelRoot, viewRoot, controller, additionalData, schema;

	beforeEach( () => {
		model = new Model();
	} );

	function setupViewToModelTests() {
		additionalData = { context: [ '$root' ] };
		schema = model.schema;
		dispatcher = new ViewConversionDispatcher( model, { schema } );
	}

	function setupModelToViewTests() {
		modelDoc = model.document;
		modelRoot = modelDoc.createRoot();

		controller = new EditingController( model );

		// Set name of view root the same as dom root.
		// This is a mock of attaching view root to dom root.
		controller.view.document.getRoot()._name = 'div';

		viewRoot = controller.view.document.getRoot();
		dispatcher = controller.modelToView;
	}

	describe( 'Attribute converters', () => {
		function testModelConversion( definition, expectedConversion ) {
			modelAttributeToViewAttributeElement( 'foo', [ definition ], [ dispatcher ] );

			const modelElement = new ModelText( 'foo', { foo: 'bar' } );

			model.change( writer => {
				writer.insert( modelElement, ModelPosition.createAt( modelRoot, 0 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( expectedConversion );

			model.change( writer => {
				writer.removeAttribute( 'foo', modelElement );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		}

		describe( 'model to view conversion', () => {
			beforeEach( () => {
				setupModelToViewTests();
			} );

			it( 'using passed view element name', () => {
				testModelConversion( { model: 'bar', view: 'strong' }, '<div><strong>foo</strong></div>' );
			} );

			it( 'using passed view element object', () => {
				testModelConversion( { model: 'bar', view: { name: 'strong' } }, '<div><strong>foo</strong></div>' );
			} );

			it( 'using passed view element object with style object', () => {
				testModelConversion( {
					model: 'bar',
					view: { name: 'span', style: { 'font-weight': 'bold' } }
				}, '<div><span style="font-weight:bold;">foo</span></div>' );
			} );

			it( 'using passed view element object with class string', () => {
				testModelConversion( { model: 'bar', view: { name: 'span', class: 'foo' } }, '<div><span class="foo">foo</span></div>' );
			} );

			it( 'using passed view element object with class array', () => {
				testModelConversion( {
					model: 'bar',
					view: { name: 'span', class: [ 'foo', 'foo-bar' ] }
				}, '<div><span class="foo foo-bar">foo</span></div>' );
			} );

			it( 'using passed view element object with attributes', () => {
				testModelConversion( {
					model: 'bar',
					view: { name: 'span', attribute: { 'data-foo': 'bar' } }
				}, '<div><span data-foo="bar">foo</span></div>' );
			} );

			it( 'should convert when changing attribute', () => {
				const definition1 = { model: 'bar', view: { name: 'span', class: 'bar' } };
				const definition2 = { model: 'baz', view: { name: 'span', class: 'baz' } };

				modelAttributeToViewAttributeElement( 'foo', [ definition1, definition2 ], [ dispatcher ] );

				const modelElement = new ModelText( 'foo', { foo: 'bar' } );

				model.change( writer => {
					writer.insert( modelElement, ModelPosition.createAt( modelRoot, 0 ) );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><span class="bar">foo</span></div>' );

				model.change( writer => {
					writer.setAttribute( 'foo', 'baz', modelElement );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div><span class="baz">foo</span></div>' );
			} );

			it( 'should do nothing for undefined value', () => {
				modelAttributeToViewAttributeElement( 'foo', [ { model: 'bar', view: 'strong' } ], [ dispatcher ] );

				const modelElement = new ModelText( 'foo', { foo: 'baz' } );

				model.change( writer => {
					writer.insert( modelElement, ModelPosition.createAt( modelRoot, 0 ) );
				} );

				expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
			} );
		} );

		describe( 'view to model conversion', () => {
			beforeEach( () => {
				setupViewToModelTests();

				schema.register( 'div', { inheritAllFrom: '$block' } );
				schema.extend( '$text', {
					allowIn: '$root',
					allowAttributes: 'foo'
				} );

				dispatcher.on( 'text', convertText() );
			} );

			it( 'should convert using element name', () => {
				viewToModelAttribute( 'foo', { model: 'bar', view: 'strong' }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using object', () => {
				viewToModelAttribute( 'foo', { model: 'bar', view: { name: 'strong' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using class string', () => {
				viewToModelAttribute( 'foo', { model: 'bar', view: { name: 'span', class: 'foo' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { class: 'foo' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using class array', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: { name: 'span', class: [ 'foo', 'bar' ] }
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { class: 'foo bar' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using style object', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: { name: 'span', style: { 'font-weight': 'bold' } }
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { style: 'font-weight:bold' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using attributes object', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: { name: 'span', attribute: { 'data-foo': 'bar' } }
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using acceptAlso array', () => {
				viewToModelAttribute( 'foo', {
					model: 'bar',
					view: 'strong',
					acceptsAlso: [
						{ name: 'span', class: [ 'foo', 'bar' ] },
						{ name: 'span', attribute: { 'data-foo': 'bar' } }
					]
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );

			it( 'should convert using priority', () => {
				viewToModelAttribute( 'foo', { model: 'baz', view: 'strong' }, [ dispatcher ] );
				viewToModelAttribute( 'foo', { model: 'bar', view: { name: 'strong', priority: 'high' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<$text foo="bar">foo</$text>' );
			} );
		} );
	} );

	describe( 'Element converters', () => {
		function testModelConversion( definition, expectedResult ) {
			modelElementToViewContainerElement( definition, [ dispatcher ] );

			const modelElement = new ModelElement( 'foo', null, new ModelText( 'bar' ) );

			model.change( writer => {
				writer.insert( modelElement, ModelPosition.createAt( modelRoot, 0 ) );
			} );

			expect( viewToString( viewRoot ) ).to.equal( '<div>' + expectedResult + '</div>' );
		}

		describe( 'model to view conversion', () => {
			beforeEach( () => {
				setupModelToViewTests();
			} );

			it( 'using passed view element name', () => {
				testModelConversion( { model: 'foo', view: 'code' }, '<code>bar</code>' );
			} );

			it( 'using passed view element object', () => {
				testModelConversion( { model: 'foo', view: { name: 'code' } }, '<code>bar</code>' );
			} );

			it( 'using passed view element object with style object', () => {
				testModelConversion( {
					model: 'foo',
					view: { name: 'span', style: { 'font-weight': 'bold' } }
				}, '<span style="font-weight:bold;">bar</span>' );
			} );

			it( 'using passed view element object with class string', () => {
				testModelConversion( { model: 'foo', view: { name: 'span', class: 'foo' } }, '<span class="foo">bar</span>' );
			} );

			it( 'using passed view element object with class array', () => {
				testModelConversion( {
					model: 'foo',
					view: { name: 'span', class: [ 'foo', 'foo-bar' ] }
				}, '<span class="foo foo-bar">bar</span>' );
			} );

			it( 'using passed view element object with attributes', () => {
				testModelConversion( {
					model: 'foo',
					view: { name: 'span', attribute: { 'data-foo': 'bar' } }
				}, '<span data-foo="bar">bar</span>' );
			} );
		} );

		describe( 'view to model conversion', () => {
			beforeEach( () => {
				setupViewToModelTests();

				schema.register( 'div', { inheritAllFrom: '$block' } );
				schema.register( 'bar', { inheritAllFrom: '$block' } );
				schema.register( 'baz', { inheritAllFrom: '$block' } );

				schema.extend( '$text', {
					allowIn: '$root',
					allowAttributes: 'foo'
				} );

				dispatcher.on( 'text', convertText() );
			} );

			it( 'should convert using element name', () => {
				viewToModelElement( { model: 'bar', view: 'strong' }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using object', () => {
				viewToModelElement( { model: 'bar', view: { name: 'strong' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using class string', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', class: 'foo' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { class: 'foo' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using class array', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', class: [ 'foo', 'bar' ] } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { class: 'foo bar' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using style object', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', style: { 'font-weight': 'bold' } } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { style: 'font-weight:bold' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using attributes object', () => {
				viewToModelElement( { model: 'bar', view: { name: 'span', attribute: { 'data-foo': 'bar' } } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using acceptAlso array', () => {
				viewToModelElement( {
					model: 'bar',
					view: 'strong',
					acceptsAlso: [
						{ name: 'span', class: [ 'foo', 'bar' ] },
						{ name: 'span', attribute: { 'data-foo': 'bar' } }
					]
				}, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'span', { 'data-foo': 'bar' }, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );

			it( 'should convert using priority', () => {
				viewToModelElement( { model: 'baz', view: 'strong' }, [ dispatcher ] );
				viewToModelElement( { model: 'bar', view: { name: 'strong', priority: 'high' } }, [ dispatcher ] );

				const conversionResult = dispatcher.convert(
					new ViewElement( 'strong', null, new ViewText( 'foo' ) ), additionalData
				);

				expect( modelToString( conversionResult ) ).to.equal( '<bar>foo</bar>' );
			} );
		} );
	} );
} );
