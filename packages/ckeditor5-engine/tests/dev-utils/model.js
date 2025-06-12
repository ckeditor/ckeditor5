/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { _stringifyModel, _parseModel, _getModelData, _setModelData } from '../../src/dev-utils/model.js';
import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { Text } from '../../src/model/text.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelPosition } from '../../src/model/position.js';
import { count } from '@ckeditor/ckeditor5-utils/src/count.js';

describe( 'model test utils', () => {
	let model, document, root, selection;

	beforeEach( () => {
		model = new Model();
		document = model.document;
		root = document.createRoot();
		selection = document.selection;

		model.change( writer => {
			writer.setSelection( null );
		} );

		model.schema.register( 'a', {
			allowWhere: '$text',
			allowIn: '$root',
			allowAttributes: [ 'bar', 'car', 'foo' ]
		} );

		model.schema.register( 'b', {
			allowWhere: '$text',
			allowIn: '$root',
			allowAttributes: [ 'barFoo', 'fooBar', 'x' ]
		} );

		model.schema.register( 'c', {
			allowWhere: '$text',
			allowIn: [ '$root', 'b' ]
		} );

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

		model.schema.extend( '$text', {
			allowIn: [ '$root', 'a', 'b' ]
		} );
	} );

	afterEach( () => {
		sinon.restore();
	} );

	describe( 'getData', () => {
		it( 'should use stringify method', () => {
			const stringifySpy = sinon.spy( _getModelData, '_stringify' );
			root._appendChild( new ModelElement( 'b', null, new Text( 'btext' ) ) );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal( '<b>btext</b>' );
			sinon.assert.calledOnce( stringifySpy );
			sinon.assert.calledWithExactly( stringifySpy, root, null, null );
		} );

		it( 'should use stringify method with selection', () => {
			const stringifySpy = sinon.spy( _getModelData, '_stringify' );
			root._appendChild( new ModelElement( 'b', null, new Text( 'btext' ) ) );
			model.change( writer => {
				writer.setSelection( new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) ) );
			} );
			expect( _getModelData( model ) ).to.equal( '[<b>btext</b>]' );
			sinon.assert.calledOnce( stringifySpy );
			sinon.assert.calledWithExactly( stringifySpy, root, document.selection, null );
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				_getModelData( { invalid: 'document' } );
			} ).to.throw( TypeError, 'Model needs to be an instance of module:engine/model/model~Model.' );
		} );

		describe( 'markers', () => {
			it( 'should stringify collapsed marker', () => {
				_setModelData( model, '<paragraph>bar</paragraph>' );

				model.markers._set( 'foo', new ModelRange( ModelPosition._createAt( document.getRoot(), 0 ) ) );

				expect( _getModelData( model, { convertMarkers: true, withoutSelection: true } ) )
					.to.equal( '<foo:start></foo:start><paragraph>bar</paragraph>' );
			} );

			it( 'should stringify non-collapsed marker', () => {
				_setModelData( model, '<paragraph>bar</paragraph>' );

				const markerRange = new ModelRange(
					ModelPosition._createAt( document.getRoot(), 0 ),
					ModelPosition._createAt( document.getRoot(), 1 )
				);

				model.markers._set( 'foo', markerRange );

				expect( _getModelData( model, { convertMarkers: true, withoutSelection: true } ) )
					.to.equal( '<foo:start></foo:start><paragraph>bar</paragraph><foo:end></foo:end>' );
			} );
		} );
	} );

	describe( 'setData', () => {
		it( 'should use parse method', () => {
			const parseSpy = sinon.spy( _setModelData, '_parse' );
			const options = {};
			const data = '<b>btext</b>text';

			_setModelData( model, data, options );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal( data );
			sinon.assert.calledOnce( parseSpy );
			const args = parseSpy.firstCall.args;
			expect( args[ 0 ] ).to.equal( data );
		} );

		it( 'should use parse method with selection', () => {
			const parseSpy = sinon.spy( _setModelData, '_parse' );
			const options = {};
			const data = '[<b>btext</b>]';

			_setModelData( model, data, options );

			expect( _getModelData( model ) ).to.equal( data );
			sinon.assert.calledOnce( parseSpy );
			const args = parseSpy.firstCall.args;
			expect( args[ 0 ] ).to.equal( data );
		} );

		it( 'should use model#enqueueChange method if the batchType option was provided', () => {
			const changeSpy = sinon.spy( model, 'enqueueChange' );
			const batchType = { isUndoable: true };
			_setModelData( model, 'text', { batchType } );

			sinon.assert.calledTwice( changeSpy );
			sinon.assert.calledWith( changeSpy, batchType );
		} );

		it( 'should use model#change method if no batchType option was provided', () => {
			const changeSpy = sinon.spy( model, 'change' );
			_setModelData( model, 'text', {} );

			sinon.assert.calledOnce( changeSpy );
		} );

		it( 'should insert text', () => {
			testUtils( 'this is test text', '[]this is test text' );
		} );

		it( 'should insert text with selection around', () => {
			testUtils( '[this is test text]' );
		} );

		it( 'should insert text with selection inside #1', () => {
			testUtils( 'this [is test] text' );
		} );

		it( 'should insert text with selection inside #2', () => {
			testUtils( '[this is test] text' );
		} );

		it( 'should insert text with selection inside #3', () => {
			testUtils( 'this is [test text]' );
		} );

		it( 'should insert unicode text with selection', () => {
			testUtils( 'நி[லைக்]கு' );
		} );

		it( 'should insert element', () => {
			testUtils( '<b>foo bar</b>', '[]<b>foo bar</b>' );
		} );

		it( 'should insert element with selection inside #1', () => {
			testUtils( '<b>[foo ]bar</b>' );
		} );

		it( 'should insert element with selection inside #2', () => {
			testUtils( '[<b>foo ]bar</b>' );
		} );

		it( 'should insert element with selection inside #3', () => {
			testUtils( '<b>[foo bar</b>]' );
		} );

		it( 'should insert backward selection', () => {
			_setModelData( model, '<b>[foo bar</b>]', { lastRangeBackward: true } );

			expect( _getModelData( model ) ).to.equal( '<b>[foo bar</b>]' );
			expect( document.selection.isBackward ).to.true;
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				_setModelData( { invalid: 'document' } );
			} ).to.throw( TypeError, 'Model needs to be an instance of module:engine/model/model~Model.' );
		} );

		it( 'should set attributes to the selection', () => {
			_setModelData( model, '<b>[foo bar]</b>', { selectionAttributes: { foo: 'bar' } } );

			expect( document.selection.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		// #815.
		it( 'should work in a special root', () => {
			const model = new Model();

			model.schema.register( 'textOnly', { allowChildren: '$text' } );
			model.document.createRoot( 'textOnly', 'textOnly' );

			_setModelData( model, 'a[b]c', { rootName: 'textOnly' } );
			expect( _getModelData( model, { rootName: 'textOnly' } ) ).to.equal( 'a[b]c' );
		} );

		function testUtils( data, expected ) {
			expected = expected || data;

			_setModelData( model, data );
			expect( _getModelData( model ) ).to.equal( expected );
		}
	} );

	describe( 'stringify', () => {
		it( 'should stringify text', () => {
			const text = new Text( 'text', { underline: true, bold: true } );

			expect( _stringifyModel( text ) ).to.equal( '<$text bold="true" underline="true">text</$text>' );
		} );

		it( 'should stringify element', () => {
			const element = new ModelElement( 'a', null, [
				new ModelElement( 'b', null, new Text( 'btext' ) ),
				new Text( 'atext' )
			] );

			expect( _stringifyModel( element ) ).to.equal( '<a><b>btext</b>atext</a>' );
		} );

		it( 'should stringify document fragment', () => {
			const fragment = new ModelDocumentFragment( [
				new ModelElement( 'b', null, new Text( 'btext' ) ),
				new Text( 'atext' )
			] );

			expect( _stringifyModel( fragment ) ).to.equal( '<b>btext</b>atext' );
		} );

		it( 'writes elements and texts', () => {
			root._appendChild( [
				new ModelElement( 'a', null, new Text( 'atext' ) ),
				new ModelElement( 'b', null, [
					new ModelElement( 'c1' ),
					new Text( 'ctext' ),
					new ModelElement( 'c2' )
				] ),
				new ModelElement( 'd' )
			] );

			expect( _stringifyModel( root ) ).to.equal(
				'<a>atext</a><b><c1></c1>ctext<c2></c2></b><d></d>'
			);
		} );

		it( 'writes element attributes', () => {
			root._appendChild(
				new ModelElement( 'a', { foo: true, bar: 1, car: false }, [
					new ModelElement( 'b', { fooBar: 'x y', barFoo: { x: 1, y: 2 } } )
				] )
			);

			// Note: attributes are written in a very simplistic way, because they are not to be parsed. They are just
			// to be compared in the tests with some patterns.
			expect( _stringifyModel( root ) ).to.equal(
				'<a bar="1" car="false" foo="true"><b barFoo="{"x":1,"y":2}" fooBar="x y"></b></a>'
			);
		} );

		it( 'writes text attributes', () => {
			root._appendChild( [
				new Text( 'foo', { bold: true } ),
				new Text( 'bar' ),
				new Text( 'bom', { bold: true, italic: true } ),
				new ModelElement( 'a', null, [
					new Text( 'pom', { underline: true, bold: true } )
				] )
			] );

			expect( _stringifyModel( root ) ).to.equal(
				'<$text bold="true">foo</$text>bar<$text bold="true" italic="true">bom</$text>' +
				'<a><$text bold="true" underline="true">pom</$text></a>'
			);
		} );

		it( 'writes unicode text', () => {
			root._appendChild( new Text( 'நிலைக்கு' ) );

			expect( _stringifyModel( root ) ).to.equal( 'நிலைக்கு' );
		} );

		describe( 'selection', () => {
			let elA, elB;

			beforeEach( () => {
				elA = new ModelElement( 'a' );
				elB = new ModelElement( 'b' );

				root._appendChild( [
					elA,
					new Text( 'foo' ),
					new Text( 'bar', { bold: true } ),
					elB
				] );
			} );

			it( 'writes selection in an empty root', () => {
				const root = document.createRoot( '$root', 'empty' );
				model.change( writer => {
					writer.setSelection( root, 0 );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'[]'
				);
			} );

			it( 'writes selection collapsed in an element', () => {
				model.change( writer => {
					writer.setSelection( root, 0 );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'[]<a></a>foo<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed in a text', () => {
				model.change( writer => {
					writer.setSelection( root, 3 );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a></a>fo[]o<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text left boundary', () => {
				model.change( writer => {
					writer.setSelection( elA, 'after' );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a></a>[]foo<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text right boundary', () => {
				model.change( writer => {
					writer.setSelection( elB, 'before' );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a></a>foo<$text bold="true">bar[]</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the end of the root', () => {
				model.change( writer => {
					writer.setSelection( root, 'end' );

					// Needed due to https://github.com/ckeditor/ckeditor5-engine/issues/320.
					writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a></a>foo<$text bold="true">bar</$text><b></b>[]'
				);
			} );

			it( 'writes selection collapsed selection in a text with attributes', () => {
				model.change( writer => {
					writer.setSelection( root, 5 );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a></a>foo<$text bold="true">b[]ar</$text><b></b>'
				);
			} );

			it( 'writes flat selection containing couple of nodes', () => {
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 4 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'[<a></a>foo]<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes flat selection within text', () => {
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 3 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a></a>f[o]o<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes multi-level selection', () => {
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( elA, 0 ), ModelPosition._createAt( elB, 0 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'writes selection when is backward', () => {
				model.change( writer => {
					writer.setSelection(
						new ModelRange( ModelPosition._createAt( elA, 0 ), ModelPosition._createAt( elB, 0 ) ), { backward: true }
					);
				} );

				expect( _stringifyModel( root, selection ) ).to.equal(
					'<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'writes selection in unicode text', () => {
				const root = document.createRoot( '$root', 'empty' );

				root._appendChild( new Text( 'நிலைக்கு' ) );
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 6 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).to.equal( 'நி[லைக்]கு' );
			} );

			it( 'uses range and coverts it to selection', () => {
				const range = new ModelRange( ModelPosition._createAt( elA, 0 ), ModelPosition._createAt( elB, 0 ) );

				expect( _stringifyModel( root, range ) ).to.equal(
					'<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'uses position and converts it to collapsed selection', () => {
				const position = new ModelPosition( root, [ 0 ] );

				expect( _stringifyModel( root, position ) ).to.equal(
					'[]<a></a>foo<$text bold="true">bar</$text><b></b>'
				);
			} );
		} );
	} );

	describe( 'parse', () => {
		test( 'creates empty ModelDocumentFragment from empty string', {
			data: '',
			check( fragment ) {
				expect( fragment ).to.be.instanceOf( ModelDocumentFragment );
			}
		} );

		test( 'creates empty ModelDocumentFragment with selection', {
			data: '[]'
		} );

		test( 'returns Element if range is around single element', {
			data: '[<a></a>]',
			check( el, selection ) {
				const fragment = el.parent;
				expect( el ).to.be.instanceOf( ModelElement );
				expect( fragment ).to.be.instanceOf( ModelDocumentFragment );
				expect( selection.rangeCount ).to.equal( 1 );

				const range = new ModelRange( ModelPosition._createAt( fragment, 0 ), ModelPosition._createAt( fragment, 1 ) );
				expect( selection.getFirstRange().isEqual( range ) ).to.be.true;
			}
		} );

		test( 'returns ModelDocumentFragment when multiple elements on root', {
			data: '<a></a><b></b>',
			check( fragment ) {
				expect( fragment ).to.be.instanceOf( ModelDocumentFragment );
				expect( fragment.childCount ).to.equal( 2 );
			}
		} );

		test( 'creates elements', {
			data: '<a></a><b><c></c></b>'
		} );

		test( 'creates text nodes', {
			data: 'foo<a>bar</a>bom'
		} );

		test( 'creates text nodes with unicode text', {
			data: 'நிலைக்கு'
		} );

		test( 'sets elements attributes', {
			data: '<a bar="true" car="x y" foo="1"></a><b x="y"></b>',
			output: '<a bar="true" car="x y" foo="1"></a><b x="y"></b>',
			check( root ) {
				expect( root.getChild( 0 ).getAttribute( 'bar' ) ).to.equal( true );
				expect( root.getChild( 0 ).getAttribute( 'car' ) ).to.equal( 'x y' );
				expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.equal( 1 );
				expect( root.getChild( 1 ).getAttribute( 'x' ) ).to.equal( 'y' );
			}
		} );

		test( 'sets text attributes', {
			data: '<$text bar="true" car="x y" foo="1">foo</$text><$text x="y">bar</$text>bom',
			check( root ) {
				expect( root.childCount ).to.equal( 3 );
				expect( root.maxOffset ).to.equal( 9 );
				expect( root.getChild( 0 ).getAttribute( 'bar' ) ).to.equal( true );
				expect( root.getChild( 0 ).getAttribute( 'car' ) ).to.equal( 'x y' );
				expect( root.getChild( 0 ).getAttribute( 'foo' ) ).to.equal( 1 );
				expect( root.getChild( 1 ).getAttribute( 'x' ) ).to.equal( 'y' );
				expect( count( root.getChild( 2 ).getAttributes() ) ).to.equal( 0 );
			}
		} );

		test( 'creates element with complex attributes', {
			data: '<a foo=\'{"x":1,"y":2}\'></a>',
			output: '<a foo="{"x":1,"y":2}"></a>',
			check( a ) {
				expect( count( a.getAttributes() ) ).to.equal( 1 );
				expect( a.getAttribute( 'foo' ) ).to.have.property( 'x', 1 );
				expect( a.getAttribute( 'foo' ) ).to.have.property( 'y', 2 );
			}
		} );

		test( 'returns single parsed element', {
			data: '<paragraph></paragraph>',
			check( p ) {
				expect( p instanceof ModelElement ).to.be.true;
			}
		} );

		test( 'returns ModelDocumentFragment for multiple parsed elements', {
			data: '<paragraph></paragraph><paragraph></paragraph>',
			check( fragment ) {
				expect( fragment instanceof ModelDocumentFragment ).to.be.true;
			}
		} );

		it( 'should correctly parse whitespaces around custom inline object elements', () => {
			model.schema.register( 'inlineObj', {
				inheritAllFrom: '$inlineObject'
			} );

			const parsed = _parseModel(
				'<paragraph>Foo <inlineObj></inlineObj> bar</paragraph>',
				model.schema,
				{ inlineObjectElements: [ 'inlineObj' ] }
			);

			expect( parsed.getChild( 0 ).data ).to.equal( 'Foo ' );
			expect( parsed.getChild( 2 ).data ).to.equal( ' bar' );
		} );

		it( 'throws when invalid XML', () => {
			expect( () => {
				_parseModel( '<a><b></a></b>', model.schema );
			} ).to.throw( Error, /Parse error/ );
		} );

		it( 'throws when try to set element not registered in schema', () => {
			expect( () => {
				_parseModel( '<xyz></xyz>', model.schema );
			} ).to.throw( Error, 'Element \'xyz\' was not allowed in given position.' );
		} );

		it( 'throws when try to set text directly to $root without registering it', () => {
			const model = new Model();

			expect( () => {
				_parseModel( 'text', model.schema );
			} ).to.throw( Error, 'Text was not allowed in given position.' );
		} );

		it( 'converts data in the specified context', () => {
			const model = new Model();
			model.schema.register( 'foo', { allowChildren: '$text' } );

			expect( () => {
				_parseModel( 'text', model.schema, { context: [ 'foo' ] } );
			} ).to.not.throw();
		} );

		describe( 'selection', () => {
			test( 'sets collapsed selection in an element', {
				data: '<a>[]</a>',
				check( root, selection ) {
					expect( selection.getFirstPosition().parent ).to.have.property( 'name', 'a' );
				}
			} );

			test( 'sets collapsed selection between elements', {
				data: '<a></a>[]<b></b>'
			} );

			test( 'sets collapsed selection before a text', {
				data: '<a></a>[]foo'
			} );

			test( 'sets collapsed selection after a text', {
				data: 'foo[]'
			} );

			test( 'sets collapsed selection within a text', {
				data: 'foo[]bar',
				check( text, selection ) {
					expect( text.offsetSize ).to.equal( 6 );
					expect( text.getPath() ).to.deep.equal( [ 0 ] );
					expect( selection.getFirstRange().start.path ).to.deep.equal( [ 3 ] );
					expect( selection.getFirstRange().end.path ).to.deep.equal( [ 3 ] );
				}
			} );

			it( 'sets selection attributes', () => {
				const result = _parseModel( 'foo[]bar', model.schema, {
					selectionAttributes: {
						bold: true,
						italic: true
					}
				} );

				expect( _stringifyModel( result.model, result.selection ) ).to.equal( 'foo<$text bold="true" italic="true">[]</$text>bar' );
			} );

			test( 'sets collapsed selection between text and text with attributes', {
				data: 'foo[]<$text bold="true">bar</$text>',
				check( root, selection ) {
					expect( root.maxOffset ).to.equal( 6 );
					expect( selection.getAttribute( 'bold' ) ).to.be.undefined;
				}
			} );

			test( 'sets selection containing an element', {
				data: 'x[<a></a>]'
			} );

			it( 'sets selection with attribute containing an element', () => {
				const result = _parseModel( 'x[<a></a>]', model.schema, {
					selectionAttributes: {
						bold: true
					}
				} );

				expect( _stringifyModel( result.model, result.selection ) ).to.equal( 'x[<a></a>]' );
				expect( result.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			it( 'sets a backward selection containing an element', () => {
				const result = _parseModel( 'x[<a></a>]', model.schema, {
					lastRangeBackward: true
				} );

				expect( _stringifyModel( result.model, result.selection ) ).to.equal( 'x[<a></a>]' );
				expect( result.selection.isBackward ).to.true;
			} );

			test( 'sets selection within a text', {
				data: 'x[y]z'
			} );

			it( 'sets selection within a text with different attributes', () => {
				const result = _parseModel( '<$text bold="true">fo[o</$text>ba]r', model.schema, {
					selectionAttributes: { bold: true }
				} );

				expect( _stringifyModel( result.model, result.selection ) ).to.equal( '<$text bold="true">fo[o</$text>ba]r' );
				expect( result.selection.getAttribute( 'bold' ) ).to.true;
			} );

			it( 'throws when missing selection start', () => {
				expect( () => {
					_parseModel( 'foo]', model.schema );
				} ).to.throw( Error, /^Parse error/ );
			} );

			it( 'throws when missing selection end', () => {
				expect( () => {
					_parseModel( '[foo', model.schema );
				} ).to.throw( Error, /^Parse error/ );
			} );
		} );

		function test( title, options ) {
			it( title, () => {
				const output = options.output || options.data;

				const data = _parseModel( options.data, model.schema );
				let converted, selection;

				if ( data.selection && data.model ) {
					converted = data.model;
					selection = data.selection;
				} else {
					converted = data;
				}

				expect( _stringifyModel( converted, selection ) ).to.equal( output );

				if ( options.check ) {
					options.check( converted, selection );
				}
			} );
		}
	} );
} );
