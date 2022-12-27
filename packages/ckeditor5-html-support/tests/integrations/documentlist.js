/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DocumentListEditing from '@ckeditor/ckeditor5-list/src/documentlist/documentlistediting';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import stubUid from '@ckeditor/ckeditor5-list/tests/documentlist/_utils/uid';

import { getModelDataWithAttributes } from '../_utils/utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document */

describe( 'DocumentListElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, GeneralHtmlSupport, DocumentListEditing ]
			} );
		model = editor.model;
		dataFilter = editor.plugins.get( 'DataFilter' );

		stubUid();
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'DocumentListElementSupport' ) ).to.be.true;
	} );

	describe( 'downcast', () => {
		it( 'should downcast list attributes', () => {
			setModelData( model, makeList( 'bulleted', 0, { attributes: { 'data-foo': 'foo', 'data-bar': 'bar' } }, [
				{ text: '1.' },
				{ text: '2.' },
				{ text: '3.' }
			] ) );

			expect( editor.getData() ).to.equalMarkup(
				'<ul data-foo="foo" data-bar="bar">' +
					'<li>1.</li>' +
					'<li>2.</li>' +
					'<li>3.</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast list attributes (classes)', () => {
			setModelData( model, makeList( 'bulleted', 0, { classes: [ 'foo', 'bar', 'baz' ] }, [
				{ text: '1.' },
				{ text: '2.' },
				{ text: '3.' }
			] ) );

			expect( editor.getData() ).to.equalMarkup(
				'<ul class="foo bar baz">' +
					'<li>1.</li>' +
					'<li>2.</li>' +
					'<li>3.</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast list attributes (styles)', () => {
			setModelData( model, makeList( 'numbered', 0, { styles: { color: 'red', background: 'blue' } }, [
				{ text: '1.' },
				{ text: '2.' },
				{ text: '3.' }
			] ) );

			expect( editor.getData() ).to.equalMarkup(
				'<ol style="background:blue;color:red;">' +
					'<li>1.</li>' +
					'<li>2.</li>' +
					'<li>3.</li>' +
				'</ol>'
			);
		} );

		it( 'should downcast list item attributes', () => {
			setModelData( model, makeList( 'bulleted', 0, null, [
				{ text: '1.', attributes: { 'data-foo': 'foo' } },
				{ text: '2.', attributes: { 'data-foo': 'bar' } },
				{ text: '3.', attributes: { 'data-bar': 'baz' } }
			] ) );

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li data-foo="foo">1.</li>' +
					'<li data-foo="bar">2.</li>' +
					'<li data-bar="baz">3.</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast list item attributes (classes)', () => {
			setModelData( model, makeList( 'numbered', 0, null, [
				{ text: '1.', classes: [ 'foo' ] },
				{ text: '2.', classes: [ 'foo', 'bar' ] },
				{ text: '3.', classes: [ 'baz' ] }
			] ) );

			expect( editor.getData() ).to.equalMarkup(
				'<ol>' +
					'<li class="foo">1.</li>' +
					'<li class="foo bar">2.</li>' +
					'<li class="baz">3.</li>' +
				'</ol>'
			);
		} );

		it( 'should downcast list item attributes (styles)', () => {
			setModelData( model, makeList( 'numbered', 0, null, [
				{ text: '1.', styles: { color: 'red' } },
				{ text: '2.', styles: { color: 'green' } },
				{ text: '3.', styles: { background: 'blue', color: 'yellow' } }
			] ) );

			expect( editor.getData() ).to.equalMarkup(
				'<ol>' +
					'<li style="color:red;">1.</li>' +
					'<li style="color:green;">2.</li>' +
					'<li style="background:blue;color:yellow;">3.</li>' +
				'</ol>'
			);
		} );

		function makeList( listType, listIndent, listAttributes, elements ) {
			const htmlListAttributes = listAttributes ?
				`htmlListAttributes="${ JSON.stringify( listAttributes ).replaceAll( '"', '&quot;' ) }" ` :
				'';

			return elements.map( ( element, index ) => {
				const listItemAtributes = {
					attributes: element.attributes,
					classes: element.classes,
					styles: element.styles
				};

				const htmlLiAttributes = ( listItemAtributes.attributes || listItemAtributes.classes || listItemAtributes.styles ) ?
					`htmlLiAttributes="${ JSON.stringify( listItemAtributes ).replaceAll( '"', '&quot;' ) }" ` :
					'';

				return (
					'<paragraph ' +
						htmlLiAttributes +
						htmlListAttributes +
						`listIndent="${ listIndent }" ` +
						`listItemId="${ index }" ` +
						`listType="${ listType }">` +
						element.text +
					'</paragraph>'
				);
			} ).join( '' );
		}
	} );

	describe( 'upcast', () => {
		it( 'should allow attributes', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-foo': true } } );
			dataFilter.allowAttributes( { name: 'li', attributes: { 'data-bar': true } } );

			editor.setData( '<ul data-foo="foo"><li data-bar="A">Foo</li><li data-bar="B">Bar</li></ul>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="0" listItemId="a01" listType="bulleted">' +
						'Bar' +
					'</paragraph>',
				attributes: {
					1: {
						attributes: { 'data-bar': 'A' }
					},
					2: {
						attributes: { 'data-foo': 'foo' }
					},
					3: {
						attributes: { 'data-bar': 'B' }
					},
					4: {
						attributes: { 'data-foo': 'foo' }
					}
				}
			} );
		} );

		it( 'should allow attributes (classes)', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, classes: 'foo' } );
			dataFilter.allowAttributes( { name: 'li', classes: /^(bar|baz)$/ } );

			editor.setData( '<ol class="foo"><li class="bar">Foo</li><li class="baz">Bar</li></ol>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
						'Bar' +
					'</paragraph>',
				attributes: {
					1: {
						classes: [ 'bar' ]
					},
					2: {
						classes: [ 'foo' ]
					},
					3: {
						classes: [ 'baz' ]
					},
					4: {
						classes: [ 'foo' ]
					}
				}
			} );
		} );

		it( 'should allow attributes (styles)', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, styles: { background: 'blue' } } );
			dataFilter.allowAttributes( { name: 'li', styles: { color: /^(red|green)$/ } } );

			editor.setData( '<ol style="background:blue"><li style="color:red">Foo</li><li style="color:green">Bar</li></ol>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
						'Bar' +
					'</paragraph>',
				attributes: {
					1: {
						styles: { color: 'red' }
					},
					2: {
						styles: { background: 'blue' }
					},
					3: {
						styles: { color: 'green' }
					},
					4: {
						styles: { background: 'blue' }
					}
				}
			} );
		} );

		it( 'should allow attributes (complex))', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-foo': true } } );
			dataFilter.allowAttributes( { name: 'li', attributes: { 'data-bar': true } } );

			editor.setData(
				'<ul data-foo="foo">' +
					'<li data-bar="A">' +
						'<p>Foo</p>' +
						'<ol data-foo="bar">' +
							'<li data-bar="B">Bar</li>' +
						'</ol>' +
						'<p>Baz</p>' +
					'</li>' +
				'</ul>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a01" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="1" listItemId="a00" listType="numbered">' +
						'Bar' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(5)" htmlListAttributes="(6)" listIndent="0" listItemId="a01" listType="bulleted">' +
						'Baz' +
					'</paragraph>',
				attributes: {
					1: {
						attributes: { 'data-bar': 'A' }
					},
					2: {
						attributes: { 'data-foo': 'foo' }
					},
					3: {
						attributes: { 'data-bar': 'B' }
					},
					4: {
						attributes: { 'data-foo': 'bar' }
					},
					5: {
						attributes: { 'data-bar': 'A' }
					},
					6: {
						attributes: { 'data-foo': 'foo' }
					}
				}
			} );
		} );

		it( 'should allow attributes (non-list item content)', () => {
			dataFilter.allowElement( /^(ul|ol|div)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-foo': true } } );
			dataFilter.allowAttributes( { name: /^(li|div)$/, attributes: { 'data-bar': true } } );

			model.schema.register( 'div', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { view: 'div', model: 'div' } );

			editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( context.endsWith( 'div' ) && attributeName == 'listItemId' ) {
					return false;
				}
			} );

			editor.setData( '<ul data-foo="foo"><li data-bar="A">Foo<div data-bar="B">Bar</div></li></ul>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<div htmlAttributes="(3)">Bar</div>',
				attributes: {
					1: {
						attributes: { 'data-bar': 'A' }
					},
					2: {
						attributes: { 'data-foo': 'foo' }
					},
					3: {
						attributes: { 'data-bar': 'B' }
					}
				}
			} );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-foo': true } } );
			dataFilter.allowAttributes( { name: 'li', attributes: { 'data-bar': true } } );

			dataFilter.disallowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-foo': true } } );
			dataFilter.disallowAttributes( { name: 'li', attributes: { 'data-bar': true } } );

			editor.setData( '<ul data-foo="foo"><li data-bar="A">Foo</li><li data-bar="B">Bar</li></ul>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="0" listItemId="a01" listType="bulleted">' +
						'Bar' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {},
					4: {}
				}
			} );
		} );

		it( 'should disallow attributes (classes)', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, classes: 'foo' } );
			dataFilter.allowAttributes( { name: 'li', classes: /^(bar|baz)$/ } );

			dataFilter.disallowAttributes( { name: /^(ul|ol)$/, classes: 'foo' } );
			dataFilter.disallowAttributes( { name: 'li', classes: /^(bar|baz)$/ } );

			editor.setData( '<ol class="foo"><li class="bar">Foo</li><li class="baz">Bar</li></ol>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
						'Bar' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {},
					4: {}
				}
			} );
		} );

		it( 'should disallow attributes (styles)', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, styles: { background: 'blue' } } );
			dataFilter.allowAttributes( { name: 'li', styles: { color: /^(red|green)$/ } } );

			dataFilter.disallowAttributes( { name: /^(ul|ol)$/, styles: { background: 'blue' } } );
			dataFilter.disallowAttributes( { name: 'li', styles: { color: /^(red|green)$/ } } );

			editor.setData( '<ol style="background:blue"><li style="color:red">Foo</li><li style="color:green">Bar</li></ol>' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlListAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
						'<paragraph htmlLiAttributes="(3)" htmlListAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
						'Bar' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {},
					3: {},
					4: {}
				}
			} );
		} );
	} );

	describe( 'post-fixer', () => {
		describe( 'htmlListAttributes', () => {
			it( 'should ensure that all items in a single list have the same `htmlListAttributes`', () => {
				setModelData( model,
					paragraph( '1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'numbered', { 'data-foo': 'B' } ) +
					paragraph( '4.', '04', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '4.1.', '05', 1, 'bulleted', { 'data-foo': 'X' } ) +
					paragraph( '4.2.', '06', 1, 'bulleted', { 'data-foo': 'Y' } ) +
					paragraph( '4.3.', '07', 1, 'bulleted', { 'data-foo': 'X' } ) +
					paragraph( '5.', '08', 0, 'numbered', { 'data-foo': 'C' } ) +
					paragraph( 'A.', '09', 0, 'bulleted', { 'data-foo': 'B' } ) +
					paragraph( 'B.', '10', 0, 'bulleted', { 'data-foo': 'C' } ) +
					paragraph( 'C.', '11', 0, 'bulleted', { 'data-foo': 'B' } )
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					paragraph( '1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '4.', '04', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( '4.1.', '05', 1, 'bulleted', { 'data-foo': 'X' } ) +
					paragraph( '4.2.', '06', 1, 'bulleted', { 'data-foo': 'X' } ) +
					paragraph( '4.3.', '07', 1, 'bulleted', { 'data-foo': 'X' } ) +
					paragraph( '5.', '08', 0, 'numbered', { 'data-foo': 'A' } ) +
					paragraph( 'A.', '09', 0, 'bulleted', { 'data-foo': 'B' } ) +
					paragraph( 'B.', '10', 0, 'bulleted', { 'data-foo': 'B' } ) +
					paragraph( 'C.', '11', 0, 'bulleted', { 'data-foo': 'B' } )
				) );
			} );

			it( 'should ensure that all list items have the same `htmlListAttributes` after removing a block between them', () => {
				setModelData( model,
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					'<paragraph>Foo</paragraph>' +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'B' } ) +
					paragraph( '4.', '04', 0, 'bulleted', { 'data-foo': 'B' } )
				);

				model.change( writer => {
					writer.remove( model.document.getRoot().getChild( 2 ) );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '4.', '04', 0, 'bulleted', { 'data-foo': 'A' } )
				) );
			} );

			it( 'should restore `htmlListAttributes` attribute after it\'s changed in one of the following items', () => {
				setModelData( model,
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'A' } )
				);

				model.change( writer => {
					writer.setAttribute(
						'htmlListAttributes',
						{ attributes: { 'data-foo': 'B' } },
						model.document.getRoot().getChild( 2 )
					);
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'A' } )
				) );
			} );

			it( 'should change `htmlListAttributes` attribute for all the following items after the first one is changed', () => {
				setModelData( model,
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'A' } )
				);

				model.change( writer => {
					writer.setAttribute(
						'htmlListAttributes',
						{ attributes: { 'data-foo': 'B' } },
						model.document.getRoot().getChild( 0 )
					);
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'B' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'B' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'B' } )
				) );
			} );
		} );

		describe( 'htmlLiAttributes', () => {
			it( 'should ensure that all blocks of single list item have the same `htmlLiAttributes`', () => {
				setModelData( model,
					liParagraph( 'A1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( 'A2.', '01', 0, 'numbered', { 'data-foo': 'B' } ) +
					liParagraph( 'A3.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( 'B1.', '02', 0, 'numbered', { 'data-foo': 'X' } ) +
					liParagraph( 'B2.', '02', 0, 'numbered', { 'data-foo': 'Y' } ) +
					liParagraph( 'B3.', '02', 0, 'numbered', { 'data-foo': 'Z' } )
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					liParagraph( 'A1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( 'A2.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( 'A3.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( 'B1.', '02', 0, 'numbered', { 'data-foo': 'X' } ) +
					liParagraph( 'B2.', '02', 0, 'numbered', { 'data-foo': 'X' } ) +
					liParagraph( 'B3.', '02', 0, 'numbered', { 'data-foo': 'X' } )
				) );
			} );

			it( 'should restore `htmlLiAttributes` attribute after it\'s changed in one of the following items', () => {
				setModelData( model,
					liParagraph( '1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( '2.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( '3.', '01', 0, 'numbered', { 'data-foo': 'A' } )
				);

				model.change( writer => {
					writer.setAttribute(
						'htmlLiAttributes',
						{ attributes: { 'data-foo': 'B' } },
						model.document.getRoot().getChild( 2 )
					);
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					liParagraph( '1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( '2.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( '3.', '01', 0, 'numbered', { 'data-foo': 'A' } )
				) );
			} );

			it( 'should change `htmlLiAttributes` attribute for all the following items after the first one is changed', () => {
				setModelData( model,
					liParagraph( '1.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( '2.', '01', 0, 'numbered', { 'data-foo': 'A' } ) +
					liParagraph( '3.', '01', 0, 'numbered', { 'data-foo': 'A' } )
				);

				model.change( writer => {
					writer.setAttribute(
						'htmlLiAttributes',
						{ attributes: { 'data-foo': 'B' } },
						model.document.getRoot().getChild( 0 )
					);
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( unquote(
					liParagraph( '1.', '01', 0, 'numbered', { 'data-foo': 'B' } ) +
					liParagraph( '2.', '01', 0, 'numbered', { 'data-foo': 'B' } ) +
					liParagraph( '3.', '01', 0, 'numbered', { 'data-foo': 'B' } )
				) );
			} );

			function liParagraph( text, id, indent, type, liAttributes ) {
				const attrs = JSON.stringify( { attributes: liAttributes } ).replaceAll( '"', '&quot;' );

				return (
					`<paragraph htmlLiAttributes="${ attrs }" listIndent="${ indent }" listItemId="${ id }" listType="${ type }">` +
						text +
					'</paragraph>'
				);
			}
		} );
	} );

	describe( 'indenting lists', () => {
		it( 'should reset `htmlListAttributes` attribute after indenting a single item', () => {
			setModelData( model,
				paragraph( '1.', '01', 0, 'numbered', { 'data-foo': 'foo' } ) +
				paragraph( '1a.', '02', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '2.', '03', 0, 'numbered', { 'data-foo': 'foo' } ) +
				paragraph( '3.[]', '04', 0, 'numbered', { 'data-foo': 'foo' } ) +
				paragraph( '4.', '05', 0, 'numbered', { 'data-foo': 'foo' } )
			);

			editor.execute( 'indentList' );

			expect( getModelData( model ) ).to.equal( unquote(
				paragraph( '1.', '01', 0, 'numbered', { 'data-foo': 'foo' } ) +
				paragraph( '1a.', '02', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '2.', '03', 0, 'numbered', { 'data-foo': 'foo' } ) +
				paragraph( '3.[]', '04', 1, 'numbered', undefined ) +
				paragraph( '4.', '05', 0, 'numbered', { 'data-foo': 'foo' } )
			) );
		} );

		it( 'should reset `htmlListAttributes` attribute after indenting a few items', () => {
			setModelData( model,
				paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '[2.', '02', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '3.]', '03', 0, 'bulleted', { 'data-foo': 'foo' } )
			);

			editor.execute( 'indentList' );

			expect( getModelData( model ) ).to.equal( unquote(
				paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '[2.', '02', 1, 'bulleted', undefined ) +
				paragraph( '3.]', '03', 1, 'bulleted', undefined )
			) );
		} );

		it( 'should copy `htmlListAttributes` attribute after indenting a single item into previously nested list', () => {
			setModelData( model,
				paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '1a.', '02', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '1b.', '03', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '2.[]', '04', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '3.', '05', 0, 'bulleted', { 'data-foo': 'foo' } )
			);

			editor.execute( 'indentList' );

			expect( getModelData( model ) ).to.equal( unquote(
				paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '1a.', '02', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '1b.', '03', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '2.[]', '04', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '3.', '05', 0, 'bulleted', { 'data-foo': 'foo' } )
			) );
		} );

		it( 'should copy `htmlListAttributes` attribute after indenting a few items into previously nested list', () => {
			setModelData( model,
				paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '1a.', '02', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '1b.', '03', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '[2.', '04', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '3.]', '05', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '4.', '06', 0, 'bulleted', { 'data-foo': 'foo' } )
			);

			editor.execute( 'indentList' );

			expect( getModelData( model ) ).to.equal( unquote(
				paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'foo' } ) +
				paragraph( '1a.', '02', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '1b.', '03', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '[2.', '04', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '3.]', '05', 1, 'bulleted', { 'data-foo': 'bar' } ) +
				paragraph( '4.', '06', 0, 'bulleted', { 'data-foo': 'foo' } )
			) );
		} );
	} );

	function paragraph( text, id, indent, type, listAttributes ) {
		const attrs = JSON.stringify( { attributes: listAttributes } ).replaceAll( '"', '&quot;' );

		return (
			`<paragraph htmlListAttributes="${ attrs }" listIndent="${ indent }" listItemId="${ id }" listType="${ type }">` +
				text +
			'</paragraph>'
		);
	}

	function unquote( text ) {
		return text.replaceAll( '&quot;', '"' );
	}
} );
