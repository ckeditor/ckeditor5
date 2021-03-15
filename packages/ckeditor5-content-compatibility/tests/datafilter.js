/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import DataSchema from '../src/dataschema';
import DataFilter from '../src/datafilter';

describe( 'DataFilter', () => {
	let editor, model, dataFilter, dataSchema;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataSchema = new DataSchema();
				dataFilter = new DataFilter( editor, dataSchema );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'block', () => {
		it( 'should allow element', () => {
			dataFilter.allowElement( { name: 'article' } );

			editor.setData( '<article>' +
				'<section><paragraph>section1</paragraph></section>' +
				'<section><paragraph>section2</paragraph></section></article>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlArticle><paragraph>section1section2</paragraph></htmlArticle>'
			);

			expect( editor.getData() ).to.equal(
				'<article><p>section1section2</p></article>'
			);

			dataFilter.allowElement( { name: 'section' } );

			editor.setData( '<article>' +
				'<section><paragraph>section1</paragraph></section>' +
				'<section><paragraph>section2</paragraph></section></article>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlArticle>' +
				'<htmlSection><paragraph>section1</paragraph></htmlSection>' +
				'<htmlSection><paragraph>section2</paragraph></htmlSection></htmlArticle>'
			);

			expect( editor.getData() ).to.equal(
				'<article>' +
				'<section><p>section1</p></section>' +
				'<section><p>section2</p></section></article>'
			);
		} );

		it( 'should allow deeply nested structure', () => {
			dataFilter.allowElement( { name: 'section' } );

			editor.setData(
				'<section><p>1</p>' +
				'<section><p>2</p>' +
				'<section><p>3</p>' +
				'</section></section></section>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlSection><paragraph>1</paragraph>' +
				'<htmlSection><paragraph>2</paragraph>' +
				'<htmlSection><paragraph>3</paragraph>' +
				'</htmlSection></htmlSection></htmlSection>'
			);

			expect( editor.getData() ).to.equal(
				'<section><p>1</p>' +
				'<section><p>2</p>' +
				'<section><p>3</p>' +
				'</section></section></section>'
			);
		} );

		it( 'should allow attributes', () => {
			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( {
				name: 'section',
				attributes: {
					'data-foo': 'foobar'
				}
			} );

			editor.setData( '<section data-foo="foobar"><p>foobar</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foobar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section data-foo="foobar"><p>foobar</p></section>'
			);
		} );

		it( 'should allow attributes (styles)', () => {
			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( {
				name: 'section',
				styles: {
					'color': 'red',
					'background-color': 'blue'
				}
			} );

			editor.setData( '<section style="background-color:blue;color:red;"><p>foobar</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
				attributes: {
					1: {
						styles: {
							'background-color': 'blue',
							color: 'red'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section style="background-color:blue;color:red;"><p>foobar</p></section>'
			);
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );

			editor.setData( '<section class="foo bar"><p>foobar</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlSection>',
				attributes: {
					1: { classes: [ 'foo', 'bar' ] }
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section class="foo bar"><p>foobar</p></section>'
			);
		} );

		it( 'should allow nested attributes', () => {
			dataFilter.allowElement( { name: /article|section/ } );
			dataFilter.allowAttributes( { name: /[\s\S]+/, attributes: { 'data-foo': /foo|bar/ } } );

			editor.setData( '<article data-foo="foo">' +
				'<section data-foo="bar"><p>section1</p></section>' +
				'<section data-foo="foo"><p>section2</p></section>' +
				'</article>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlArticle htmlAttributes="(1)">' +
					'<htmlSection htmlAttributes="(2)"><paragraph>section1</paragraph></htmlSection>' +
					'<htmlSection htmlAttributes="(3)"><paragraph>section2</paragraph></htmlSection>' +
					'</htmlArticle>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					2: {
						attributes: {
							'data-foo': 'bar'
						}
					},
					3: {
						attributes: {
							'data-foo': 'foo'
						}
					}
				}
			} );
		} );

		it( 'should allow attributes for all allowed definitions', () => {
			dataFilter.allowElement( { name: /section|article/ } );

			dataFilter.allowAttributes( { name: /section|article/, attributes: { 'data-foo': 'foo' } } );
			dataFilter.allowAttributes( { name: /section|article/, attributes: { 'data-bar': 'bar' } } );

			editor.setData(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<article data-bar="bar"><p>bar</p></article>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlArticle htmlAttributes="(2)"><paragraph>bar</paragraph></htmlArticle>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					2: {
						attributes: {
							'data-bar': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<article data-bar="bar"><p>bar</p></article>'
			);
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'section', attributes: { 'data-foo': 'bar' } } );

			editor.setData(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<section data-foo="bar"><p>bar</p></section>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>bar</paragraph></htmlSection>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section data-foo="foo"><p>foo</p></section>' +
				'<section><p>bar</p></section>'
			);
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( { name: 'section', styles: { color: /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'section', styles: { color: 'red' } } );

			editor.setData(
				'<section style="color:blue;"><p>foo</p></section>' +
				'<section style="color:red"><p>bar</p></section>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>bar</paragraph></htmlSection>',
				attributes: {
					1: {
						styles: {
							color: 'blue'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<section style="color:blue;"><p>foo</p></section>' +
				'<section><p>bar</p></section>'
			);
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );
			dataFilter.disallowAttributes( { name: 'section', classes: [ 'bar' ] } );

			editor.setData(
				'<section class="foo bar"><p>foo</p></section>' +
				'<section class="bar"><p>bar</p></section>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection><paragraph>foo</paragraph></htmlSection>' +
					'<htmlSection><paragraph>bar</paragraph></htmlSection>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<section><p>foo</p></section>' +
				'<section><p>bar</p></section>'
			);
		} );

		it( 'should extend allowed children only if specified model schema exists', () => {
			dataSchema.register( {
				view: 'xyz',
				model: 'htmlXyz',
				allowChildren: 'not-exists',
				schema: {
					inheritAllFrom: '$htmlBlock'
				}
			} );

			expect( () => {
				dataFilter.allowElement( { name: 'xyz' } );
			} ).to.not.throw();
		} );

		it( 'should not consume attribute already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:section', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-foo' ] } );
				} );
			} );

			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': true } } );

			editor.setData( '<section data-foo><p>foo</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection><paragraph>foo</paragraph></htmlSection>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal( '<section><p>foo</p></section>' );
		} );

		it( 'should not consume attribute already consumed (downcast)', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( 'attribute:htmlAttributes:htmlSection', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );

			dataFilter.allowElement( { name: 'section' } );
			dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': true } } );

			editor.setData( '<section data-foo><p>foo</p></section>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<htmlSection htmlAttributes="(1)"><paragraph>foo</paragraph></htmlSection>',
				// At this point, attribute should still be in the model, as we are testing downcast conversion.
				attributes: {
					1: {
						attributes: {
							'data-foo': ''
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<section><p>foo</p></section>' );
		} );
	} );

	describe( 'inline', () => {
		it( 'should allow element', () => {
			dataFilter.allowElement( { name: 'cite' } );

			editor.setData( '<p><cite>foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foobar</cite></p>' );
		} );

		it( 'should allow deeply nested structure', () => {
			dataFilter.allowElement( { name: 'cite' } );

			editor.setData( '<p><cite>foo<cite>bar<cite>baz</cite></cite></cite>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobarbaz</$text></paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foobarbaz</cite></p>' );
		} );

		it( 'should allow attributes', () => {
			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( {
				name: 'cite',
				attributes: {
					'data-foo': 'foobar'
				}
			} );

			editor.setData( '<p><cite data-foo="foobar">foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foobar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite data-foo="foobar">foobar</cite></p>' );
		} );

		it( 'should allow attributes (styles)', () => {
			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( {
				name: 'cite',
				styles: {
					'color': 'red',
					'background-color': 'blue'
				}
			} );

			editor.setData( '<p><cite style="background-color:blue;color:red;">foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {
						styles: {
							'background-color': 'blue',
							color: 'red'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><cite style="background-color:blue;color:red;">foobar</cite></p>'
			);
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( { name: 'cite', classes: [ 'foo', 'bar' ] } );

			editor.setData( '<p><cite class="foo bar">foobar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: { classes: [ 'foo', 'bar' ] }
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite class="foo bar">foobar</cite></p>' );
		} );

		it( 'should allow nested attributes', () => {
			dataFilter.allowElement( { name: /span|cite/ } );
			dataFilter.allowAttributes( { name: /span|cite/, attributes: { 'data-foo': 'foo' } } );
			dataFilter.allowAttributes( { name: /span|cite/, attributes: { 'data-bar': 'bar' } } );

			editor.setData( '<p><cite data-foo="foo">' +
					'<cite data-bar="bar">cite</cite>' +
					'<span data-bar="bar">span</span>' +
				'</cite></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph>' +
					'<$text htmlCite="(1)">cite</$text>' +
					'<$text htmlCite="(2)" htmlSpan="(3)">span</$text>' +
				'</paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo',
							'data-bar': 'bar'
						}
					},
					2: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					3: {
						attributes: {
							'data-bar': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p>' +
				'<cite data-bar="bar" data-foo="foo">cite</cite>' +
				'<cite data-foo="foo"><span data-bar="bar">span</span></cite>' +
				'</p>' );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( { name: 'cite', attributes: { 'data-foo': /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'cite', attributes: { 'data-foo': 'bar' } } );

			editor.setData( '<p><cite data-foo="foo">foo</cite><cite data-bar="bar">bar</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text><$text htmlCite="(2)">bar</$text></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo'
						}
					},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite data-foo="foo">foo</cite><cite>bar</cite></p>' );
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( { name: 'cite', styles: { color: /[\s\S]+/ } } );
			dataFilter.disallowAttributes( { name: 'cite', styles: { color: 'red' } } );

			editor.setData(
				'<p>' +
				'<cite style="color:blue;">foo</cite>' +
				'<cite style="color:red;">bar</cite>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text><$text htmlCite="(2)">bar</$text></paragraph>',
				attributes: {
					1: {
						styles: {
							color: 'blue'
						}
					},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><cite style="color:blue;">foo</cite><cite>bar</cite></p>'
			);
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( { name: 'cite', classes: [ 'foo', 'bar' ] } );
			dataFilter.disallowAttributes( { name: 'cite', classes: [ 'bar' ] } );

			editor.setData(
				'<p>' +
				'<cite class="foo bar">foo</cite>' +
				'<cite class="bar">bar</cite>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foobar</$text></paragraph>',
				attributes: {
					1: {},
					2: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foobar</cite></p>' );
		} );

		it( 'should not consume attribute already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:cite', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-foo' ] } );
				} );
			} );

			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( { name: 'cite', attributes: { 'data-foo': true } } );

			editor.setData( '<p><cite data-foo>foo</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal( '<p><cite>foo</cite></p>' );
		} );

		it( 'should not consume attribute already consumed (downcast)', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( 'attribute:htmlCite:$text', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );

			dataFilter.allowElement( { name: 'cite' } );
			dataFilter.allowAttributes( { name: 'cite', attributes: { 'data-foo': true } } );

			editor.setData( '<p><cite data-foo>foo</cite></p>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><$text htmlCite="(1)">foo</$text></paragraph>',
				// At this point, attribute should still be in the model, as we are testing downcast conversion.
				attributes: {
					1: {
						attributes: {
							'data-foo': ''
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );
	} );

	function getModelDataWithAttributes( model, options ) {
		// Simplify GHS attributes as they are not very readable at this point due to object structure.
		let counter = 1;
		const data = getModelData( model, options ).replace( /(html.*?)="{.*?}"/g, ( fullMatch, attributeName ) => {
			return `${ attributeName }="(${ counter++ })"`;
		} );

		const range = model.createRangeIn( model.document.getRoot() );

		let attributes = [];
		for ( const item of range.getItems() ) {
			for ( const [ key, value ] of sortAttributes( item.getAttributes() ) ) {
				if ( key.startsWith( 'html' ) ) {
					attributes.push( value );
				}
			}
		}

		attributes = attributes.reduce( ( prev, cur, index ) => {
			prev[ index + 1 ] = cur;
			return prev;
		}, {} );

		return { data, attributes };
	}

	function sortAttributes( attributes ) {
		attributes = Array.from( attributes );

		return attributes.sort( ( attr1, attr2 ) => {
			const key1 = attr1[ 0 ];
			const key2 = attr2[ 0 ];

			if ( key1 > key2 ) {
				return 1;
			}

			if ( key1 < key2 ) {
				return -1;
			}

			return 0;
		} );
	}
} );
