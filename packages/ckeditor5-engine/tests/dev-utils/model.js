/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { _stringifyModel, _parseModel, _getModelData, _setModelData } from '../../src/dev-utils/model.js';
import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelPosition } from '../../src/model/position.js';
import { count } from '@ckeditor/ckeditor5-utils';

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
		vi.restoreAllMocks();
	} );

	describe( 'getData', () => {
		it( 'should use stringify method', () => {
			const stringifySpy = vi.spyOn( _getModelData, '_stringify' );
			root._appendChild( new ModelElement( 'b', null, new ModelText( 'btext' ) ) );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<b>btext</b>' );
			expect( stringifySpy ).toHaveBeenCalledOnce();
			expect( stringifySpy ).toHaveBeenCalledWith( root, null, null );
		} );

		it( 'should use stringify method with selection', () => {
			const stringifySpy = vi.spyOn( _getModelData, '_stringify' );
			root._appendChild( new ModelElement( 'b', null, new ModelText( 'btext' ) ) );
			model.change( writer => {
				writer.setSelection( new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) ) );
			} );
			expect( _getModelData( model ) ).toBe( '[<b>btext</b>]' );
			expect( stringifySpy ).toHaveBeenCalledOnce();
			expect( stringifySpy ).toHaveBeenCalledWith( root, document.selection, null );
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				_getModelData( { invalid: 'document' } );
			} ).toThrow( TypeError, 'Model needs to be an instance of module:engine/model/model~Model.' );
		} );

		describe( 'markers', () => {
			it( 'should stringify collapsed marker', () => {
				_setModelData( model, '<paragraph>bar</paragraph>' );

				model.markers._set( 'foo', new ModelRange( ModelPosition._createAt( document.getRoot(), 0 ) ) );

				expect( _getModelData( model, { convertMarkers: true, withoutSelection: true } ) )
					.toBe( '<foo:start></foo:start><paragraph>bar</paragraph>' );
			} );

			it( 'should stringify non-collapsed marker', () => {
				_setModelData( model, '<paragraph>bar</paragraph>' );

				const markerRange = new ModelRange(
					ModelPosition._createAt( document.getRoot(), 0 ),
					ModelPosition._createAt( document.getRoot(), 1 )
				);

				model.markers._set( 'foo', markerRange );

				expect( _getModelData( model, { convertMarkers: true, withoutSelection: true } ) )
					.toBe( '<foo:start></foo:start><paragraph>bar</paragraph><foo:end></foo:end>' );
			} );
		} );
	} );

	describe( 'setData', () => {
		it( 'should use parse method', () => {
			const parseSpy = vi.spyOn( _setModelData, '_parse' );
			const options = {};
			const data = '<b>btext</b>text';

			_setModelData( model, data, options );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe( data );
			expect( parseSpy ).toHaveBeenCalledOnce();
			const args = parseSpy.mock.calls[ 0 ];
			expect( args[ 0 ] ).toBe( data );
		} );

		it( 'should use parse method with selection', () => {
			const parseSpy = vi.spyOn( _setModelData, '_parse' );
			const options = {};
			const data = '[<b>btext</b>]';

			_setModelData( model, data, options );

			expect( _getModelData( model ) ).toBe( data );
			expect( parseSpy ).toHaveBeenCalledOnce();
			const args = parseSpy.mock.calls[ 0 ];
			expect( args[ 0 ] ).toBe( data );
		} );

		it( 'should use model#enqueueChange method if the batchType option was provided', () => {
			const changeSpy = vi.spyOn( model, 'enqueueChange' );
			const batchType = { isUndoable: true };
			_setModelData( model, 'text', { batchType } );

			expect( changeSpy ).toHaveBeenCalledTimes( 2 );
			expect( changeSpy ).toHaveBeenCalledWith( batchType, expect.any( Function ) );
		} );

		it( 'should use model#change method if no batchType option was provided', () => {
			const changeSpy = vi.spyOn( model, 'change' );
			_setModelData( model, 'text', {} );

			expect( changeSpy ).toHaveBeenCalledOnce();
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

			expect( _getModelData( model ) ).toBe( '<b>[foo bar</b>]' );
			expect( document.selection.isBackward ).toBe( true );
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				_setModelData( { invalid: 'document' } );
			} ).toThrow( TypeError, 'Model needs to be an instance of module:engine/model/model~Model.' );
		} );

		it( 'should set attributes to the selection', () => {
			_setModelData( model, '<b>[foo bar]</b>', { selectionAttributes: { foo: 'bar' } } );

			expect( document.selection.getAttribute( 'foo' ) ).toBe( 'bar' );
		} );

		// #815.
		it( 'should work in a special root', () => {
			const model = new Model();

			model.schema.register( 'textOnly', { allowChildren: '$text' } );
			model.document.createRoot( 'textOnly', 'textOnly' );

			_setModelData( model, 'a[b]c', { rootName: 'textOnly' } );
			expect( _getModelData( model, { rootName: 'textOnly' } ) ).toBe( 'a[b]c' );
		} );

		function testUtils( data, expected ) {
			expected = expected || data;

			_setModelData( model, data );
			expect( _getModelData( model ) ).toBe( expected );
		}
	} );

	describe( 'stringify', () => {
		it( 'should stringify text', () => {
			const text = new ModelText( 'text', { underline: true, bold: true } );

			expect( _stringifyModel( text ) ).toBe( '<$text bold="true" underline="true">text</$text>' );
		} );

		it( 'should stringify element', () => {
			const element = new ModelElement( 'a', null, [
				new ModelElement( 'b', null, new ModelText( 'btext' ) ),
				new ModelText( 'atext' )
			] );

			expect( _stringifyModel( element ) ).toBe( '<a><b>btext</b>atext</a>' );
		} );

		it( 'should stringify document fragment', () => {
			const fragment = new ModelDocumentFragment( [
				new ModelElement( 'b', null, new ModelText( 'btext' ) ),
				new ModelText( 'atext' )
			] );

			expect( _stringifyModel( fragment ) ).toBe( '<b>btext</b>atext' );
		} );

		it( 'writes elements and texts', () => {
			root._appendChild( [
				new ModelElement( 'a', null, new ModelText( 'atext' ) ),
				new ModelElement( 'b', null, [
					new ModelElement( 'c1' ),
					new ModelText( 'ctext' ),
					new ModelElement( 'c2' )
				] ),
				new ModelElement( 'd' )
			] );

			expect( _stringifyModel( root ) ).toBe( '<a>atext</a><b><c1></c1>ctext<c2></c2></b><d></d>'
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
			expect( _stringifyModel( root ) ).toBe( '<a bar="1" car="false" foo="true"><b barFoo="{"x":1,"y":2}" fooBar="x y"></b></a>'
			);
		} );

		it( 'writes text attributes', () => {
			root._appendChild( [
				new ModelText( 'foo', { bold: true } ),
				new ModelText( 'bar' ),
				new ModelText( 'bom', { bold: true, italic: true } ),
				new ModelElement( 'a', null, [
					new ModelText( 'pom', { underline: true, bold: true } )
				] )
			] );

			expect( _stringifyModel( root ) ).toBe( '<$text bold="true">foo</$text>bar<$text bold="true" italic="true">bom</$text>' +
				'<a><$text bold="true" underline="true">pom</$text></a>'
			);
		} );

		it( 'writes unicode text', () => {
			root._appendChild( new ModelText( 'நிலைக்கு' ) );

			expect( _stringifyModel( root ) ).toBe( 'நிலைக்கு' );
		} );

		describe( 'selection', () => {
			let elA, elB;

			beforeEach( () => {
				elA = new ModelElement( 'a' );
				elB = new ModelElement( 'b' );

				root._appendChild( [
					elA,
					new ModelText( 'foo' ),
					new ModelText( 'bar', { bold: true } ),
					elB
				] );
			} );

			it( 'writes selection in an empty root', () => {
				const root = document.createRoot( '$root', 'empty' );
				model.change( writer => {
					writer.setSelection( root, 0 );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '[]'
				);
			} );

			it( 'writes selection collapsed in an element', () => {
				model.change( writer => {
					writer.setSelection( root, 0 );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '[]<a></a>foo<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed in a text', () => {
				model.change( writer => {
					writer.setSelection( root, 3 );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a></a>fo[]o<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text left boundary', () => {
				model.change( writer => {
					writer.setSelection( elA, 'after' );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a></a>[]foo<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text right boundary', () => {
				model.change( writer => {
					writer.setSelection( elB, 'before' );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a></a>foo<$text bold="true">bar[]</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the end of the root', () => {
				model.change( writer => {
					writer.setSelection( root, 'end' );

					// Needed due to https://github.com/ckeditor/ckeditor5-engine/issues/320.
					writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a></a>foo<$text bold="true">bar</$text><b></b>[]'
				);
			} );

			it( 'writes selection collapsed selection in a text with attributes', () => {
				model.change( writer => {
					writer.setSelection( root, 5 );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a></a>foo<$text bold="true">b[]ar</$text><b></b>'
				);
			} );

			it( 'writes flat selection containing couple of nodes', () => {
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 4 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '[<a></a>foo]<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes flat selection within text', () => {
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 3 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a></a>f[o]o<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes multi-level selection', () => {
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( elA, 0 ), ModelPosition._createAt( elB, 0 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'writes selection when is backward', () => {
				model.change( writer => {
					writer.setSelection(
						new ModelRange( ModelPosition._createAt( elA, 0 ), ModelPosition._createAt( elB, 0 ) ), { backward: true }
					);
				} );

				expect( _stringifyModel( root, selection ) ).toBe( '<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'writes selection in unicode text', () => {
				const root = document.createRoot( '$root', 'empty' );

				root._appendChild( new ModelText( 'நிலைக்கு' ) );
				model.change( writer => {
					writer.setSelection( new ModelRange( ModelPosition._createAt( root, 2 ), ModelPosition._createAt( root, 6 ) ) );
				} );

				expect( _stringifyModel( root, selection ) ).toBe( 'நி[லைக்]கு' );
			} );

			it( 'uses range and coverts it to selection', () => {
				const range = new ModelRange( ModelPosition._createAt( elA, 0 ), ModelPosition._createAt( elB, 0 ) );

				expect( _stringifyModel( root, range ) ).toBe( '<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'uses position and converts it to collapsed selection', () => {
				const position = new ModelPosition( root, [ 0 ] );

				expect( _stringifyModel( root, position ) ).toBe( '[]<a></a>foo<$text bold="true">bar</$text><b></b>'
				);
			} );
		} );
	} );

	describe( 'parse', () => {
		test( 'creates empty ModelDocumentFragment from empty string', {
			data: '',
			check( fragment ) {
				expect( fragment ).toBeInstanceOf( ModelDocumentFragment );
			}
		} );

		test( 'creates empty ModelDocumentFragment with selection', {
			data: '[]'
		} );

		test( 'returns Element if range is around single element', {
			data: '[<a></a>]',
			check( el, selection ) {
				const fragment = el.parent;
				expect( el ).toBeInstanceOf( ModelElement );
				expect( fragment ).toBeInstanceOf( ModelDocumentFragment );
				expect( selection.rangeCount ).toBe( 1 );

				const range = new ModelRange( ModelPosition._createAt( fragment, 0 ), ModelPosition._createAt( fragment, 1 ) );
				expect( selection.getFirstRange().isEqual( range ) ).toBe( true );
			}
		} );

		test( 'returns ModelDocumentFragment when multiple elements on root', {
			data: '<a></a><b></b>',
			check( fragment ) {
				expect( fragment ).toBeInstanceOf( ModelDocumentFragment );
				expect( fragment.childCount ).toBe( 2 );
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
				expect( root.getChild( 0 ).getAttribute( 'bar' ) ).toBe( true );
				expect( root.getChild( 0 ).getAttribute( 'car' ) ).toBe( 'x y' );
				expect( root.getChild( 0 ).getAttribute( 'foo' ) ).toBe( 1 );
				expect( root.getChild( 1 ).getAttribute( 'x' ) ).toBe( 'y' );
			}
		} );

		test( 'sets text attributes', {
			data: '<$text bar="true" car="x y" foo="1">foo</$text><$text x="y">bar</$text>bom',
			check( root ) {
				expect( root.childCount ).toBe( 3 );
				expect( root.maxOffset ).toBe( 9 );
				expect( root.getChild( 0 ).getAttribute( 'bar' ) ).toBe( true );
				expect( root.getChild( 0 ).getAttribute( 'car' ) ).toBe( 'x y' );
				expect( root.getChild( 0 ).getAttribute( 'foo' ) ).toBe( 1 );
				expect( root.getChild( 1 ).getAttribute( 'x' ) ).toBe( 'y' );
				expect( count( root.getChild( 2 ).getAttributes() ) ).toBe( 0 );
			}
		} );

		test( 'creates element with complex attributes', {
			data: '<a foo=\'{"x":1,"y":2}\'></a>',
			output: '<a foo="{"x":1,"y":2}"></a>',
			check( a ) {
				expect( count( a.getAttributes() ) ).toBe( 1 );
				expect( a.getAttribute( 'foo' ) ).toHaveProperty( 'x', 1 );
				expect( a.getAttribute( 'foo' ) ).toHaveProperty( 'y', 2 );
			}
		} );

		test( 'returns single parsed element', {
			data: '<paragraph></paragraph>',
			check( p ) {
				expect( p instanceof ModelElement ).toBe( true );
			}
		} );

		test( 'returns ModelDocumentFragment for multiple parsed elements', {
			data: '<paragraph></paragraph><paragraph></paragraph>',
			check( fragment ) {
				expect( fragment instanceof ModelDocumentFragment ).toBe( true );
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

			expect( parsed.getChild( 0 ).data ).toBe( 'Foo ' );
			expect( parsed.getChild( 2 ).data ).toBe( ' bar' );
		} );

		it( 'throws when invalid XML', () => {
			expect( () => {
				_parseModel( '<a><b></a></b>', model.schema );
			} ).toThrow( Error, /Parse error/ );
		} );

		it( 'throws when try to set element not registered in schema', () => {
			expect( () => {
				_parseModel( '<xyz></xyz>', model.schema );
			} ).toThrow( Error, 'Element \'xyz\' was not allowed in given position.' );
		} );

		it( 'throws when try to set text directly to $root without registering it', () => {
			const model = new Model();

			expect( () => {
				_parseModel( 'text', model.schema );
			} ).toThrow( Error, 'Text was not allowed in given position.' );
		} );

		it( 'converts data in the specified context', () => {
			const model = new Model();
			model.schema.register( 'foo', { allowChildren: '$text' } );

			expect( () => {
				_parseModel( 'text', model.schema, { context: [ 'foo' ] } );
			} ).not.toThrow();
		} );

		describe( 'selection', () => {
			test( 'sets collapsed selection in an element', {
				data: '<a>[]</a>',
				check( root, selection ) {
					expect( selection.getFirstPosition().parent ).toHaveProperty( 'name', 'a' );
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
					expect( text.offsetSize ).toBe( 6 );
					expect( text.getPath() ).toEqual( [ 0 ] );
					expect( selection.getFirstRange().start.path ).toEqual( [ 3 ] );
					expect( selection.getFirstRange().end.path ).toEqual( [ 3 ] );
				}
			} );

			it( 'sets selection attributes', () => {
				const result = _parseModel( 'foo[]bar', model.schema, {
					selectionAttributes: {
						bold: true,
						italic: true
					}
				} );

				expect( _stringifyModel( result.model, result.selection ) ).toBe( 'foo<$text bold="true" italic="true">[]</$text>bar' );
			} );

			test( 'sets collapsed selection between text and text with attributes', {
				data: 'foo[]<$text bold="true">bar</$text>',
				check( root, selection ) {
					expect( root.maxOffset ).toBe( 6 );
					expect( selection.getAttribute( 'bold' ) ).toBeUndefined();
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

				expect( _stringifyModel( result.model, result.selection ) ).toBe( 'x[<a></a>]' );
				expect( result.selection.getAttribute( 'bold' ) ).toBe( true );
			} );

			it( 'sets a backward selection containing an element', () => {
				const result = _parseModel( 'x[<a></a>]', model.schema, {
					lastRangeBackward: true
				} );

				expect( _stringifyModel( result.model, result.selection ) ).toBe( 'x[<a></a>]' );
				expect( result.selection.isBackward ).toBe( true );
			} );

			test( 'sets selection within a text', {
				data: 'x[y]z'
			} );

			it( 'sets selection within a text with different attributes', () => {
				const result = _parseModel( '<$text bold="true">fo[o</$text>ba]r', model.schema, {
					selectionAttributes: { bold: true }
				} );

				expect( _stringifyModel( result.model, result.selection ) ).toBe( '<$text bold="true">fo[o</$text>ba]r' );
				expect( result.selection.getAttribute( 'bold' ) ).toBe( true );
			} );

			it( 'throws when missing selection start', () => {
				expect( () => {
					_parseModel( 'foo]', model.schema );
				} ).toThrow( Error, /^Parse error/ );
			} );

			it( 'throws when missing selection end', () => {
				expect( () => {
					_parseModel( '[foo', model.schema );
				} ).toThrow( Error, /^Parse error/ );
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

				expect( _stringifyModel( converted, selection ) ).toBe( output );

				if ( options.check ) {
					options.check( converted, selection );
				}
			} );
		}
	} );
} );
