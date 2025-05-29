/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ListEditing from '@ckeditor/ckeditor5-list/src/list/listediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import stubUid from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

import { getModelDataWithAttributes } from '../_utils/utils.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ListElementSupport from '../../src/integrations/list.js';

describe( 'ListElementSupport', () => {
	let editor, model, editorElement, dataFilter, dataSchema;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, GeneralHtmlSupport, ListEditing, TableEditing ]
			} );
		model = editor.model;
		dataFilter = editor.plugins.get( 'DataFilter' );
		dataSchema = editor.plugins.get( 'DataSchema' );

		stubUid();
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListElementSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListElementSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'ListElementSupport' ) ).to.be.true;
	} );

	it( 'should preserve attributes on lists on conversion', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		const expectedHtml =
			'<ul class="foo">' +
				'<li data-foo="bar1">One</li>' +
			'</ul>';

		editor.setData( expectedHtml );

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal( expectedHtml );
	} );

	it( 'removes list attributes when list is changed to a paragraph', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ul data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);

		editor.commands.get( 'bulletedList' ).execute( { forceValue: false } );

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal( '<p data-foo="bar-p">1.</p>' );
	} );

	it( 'removes list attributes when list type changed (numbered -> bulleted)', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ol data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ol>'
		);

		editor.commands.get( 'bulletedList' ).execute();

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
			'<ul>' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);
	} );

	it( 'removes list attributes when list type changed (bulleted -> numbered)', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ul data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);

		editor.commands.get( 'numberedList' ).execute();

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
			'<ol>' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ol>'
		);
	} );

	it( 'does not remove list attributes when list type changed (numbered -> customNumbered)', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ol data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ol>'
		);

		model.change( writer => {
			writer.setAttribute( 'listType', 'customNumbered', model.document.getRoot().getChild( 0 ) );
		} );

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
			'<ol data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ol>'
		);
	} );

	it( 'does not remove list attributes when list type changed (bulleted -> customBulleted)', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ul data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);

		model.change( writer => {
			writer.setAttribute( 'listType', 'customBulleted', model.document.getRoot().getChild( 0 ) );
		} );

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
			'<ul data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);
	} );

	it( 'removes list attributes when list type changed (customNumbered -> bulleted)', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ol data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ol>'
		);

		model.change( writer => {
			writer.setAttribute( 'listType', 'customNumbered', model.document.getRoot().getChild( 0 ) );
		} );

		editor.commands.get( 'bulletedList' ).execute();

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
			'<ul>' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);
	} );

	it( 'removes list attributes when list type changed (customBulleted -> numbered)', () => {
		dataFilter.allowElement( /^.*$/ );
		dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
		dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

		editor.setData(
			'<ul data-foo="bar-list">' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ul>'
		);

		model.change( writer => {
			writer.setAttribute( 'listType', 'customBulleted', model.document.getRoot().getChild( 0 ) );
		} );

		editor.commands.get( 'numberedList' ).execute();

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
			'<ol>' +
				'<li data-foo="bar-item">' +
					'<p data-foo="bar-p">1.</p>' +
				'</li>' +
			'</ol>'
		);
	} );

	describe( 'downcast', () => {
		beforeEach( () => {
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			// Apply filtering rules added after initial data load.
			editor.setData( '' );
		} );

		it( 'should downcast list attributes', () => {
			setModelData( model, makeList( 'bulleted', 0, { attributes: { 'data-foo': 'foo', 'data-bar': 'bar' } }, [
				{ text: '1.' },
				{ text: '2.' },
				{ text: '3.' }
			] ) );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ol>' +
					'<li style="color:red;">1.</li>' +
					'<li style="color:green;">2.</li>' +
					'<li style="background:blue;color:yellow;">3.</li>' +
				'</ol>'
			);
		} );

		function makeList( listType, listIndent, listAttributes, elements ) {
			const attribute = listType === 'bulleted' ?
				'htmlUlAttributes' :
				'htmlOlAttributes';

			const htmlElementAttributes = listAttributes ?
				`${ attribute }="${ JSON.stringify( listAttributes ).replaceAll( '"', '&quot;' ) }" ` :
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
						htmlElementAttributes +
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
					'<paragraph htmlLiAttributes="(1)" htmlUlAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlUlAttributes="(4)" listIndent="0" listItemId="a01" listType="bulleted">' +
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
					'<paragraph htmlLiAttributes="(1)" htmlOlAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
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
					'<paragraph htmlLiAttributes="(1)" htmlOlAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
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
					'<paragraph htmlLiAttributes="(1)" htmlUlAttributes="(2)" listIndent="0" listItemId="a01" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="1" listItemId="a00" listType="numbered">' +
						'Bar' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(5)" htmlUlAttributes="(6)" listIndent="0" listItemId="a01" listType="bulleted">' +
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
			dataSchema.registerBlockElement( {
				model: 'div',
				view: 'div'
			} );

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
					'<paragraph htmlLiAttributes="(1)" htmlUlAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<div htmlDivAttributes="(3)">Bar</div>',
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
					'<paragraph htmlLiAttributes="(1)" htmlUlAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlUlAttributes="(4)" listIndent="0" listItemId="a01" listType="bulleted">' +
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
					'<paragraph htmlLiAttributes="(1)" htmlOlAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
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
					'<paragraph htmlLiAttributes="(1)" htmlOlAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
						'Foo' +
					'</paragraph>' +
						'<paragraph htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="0" listItemId="a01" listType="numbered">' +
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

		it( 'should not apply the attributes from ancestor list', () => {
			dataFilter.allowElement( /^(ul|ol)$/ );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-foo': true } } );
			dataFilter.allowAttributes( { name: /^(ul|ol)$/, attributes: { 'data-bar': true } } );

			editor.setData( '<ul data-foo="myUl"><li>Foo<ol data-bar="myOl"><li>Bar</li></ol></li></ul>' );

			// The attributes from the `ul` list should not be applied to the `ol` list.
			// In that case, the postfixer should not create an additional operation to clean those attributes.
			for ( const operation of editor.model.document.history.getOperations() ) {
				expect( operation.type ).to.be.not.equal( 'removeAttribute' );
			}

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlUlAttributes="(2)" listIndent="0" listItemId="a01" listType="bulleted">' +
					'Foo' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="1" listItemId="a00" listType="numbered">' +
					'Bar' +
					'</paragraph>',
				attributes: {
					1: {},
					2: {
						attributes: {
							'data-foo': 'myUl'
						}
					},
					3: {},
					4: {
						attributes: {
							'data-bar': 'myOl'
						}
					}
				}
			} );
		} );
	} );

	describe( 'post-fixer', () => {
		describe( 'html*Attributes', () => {
			beforeEach( () => {
				dataFilter.allowElement( /^.*$/ );
				dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
				dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

				// Apply filtering rules added after initial data load.
				editor.setData( '' );
			} );

			it( 'should ensure that all items in a single list have the same `html*Attributes`', () => {
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

			it( 'should ensure that all list items have the same `html*Attributes` after removing a block between them', () => {
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

			it( 'should restore `html*Attributes` attribute after it\'s changed in one of the following items', () => {
				setModelData( model,
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'A' } )
				);

				model.change( writer => {
					writer.setAttribute(
						'htmlUlAttributes',
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

			it( 'should change `html*Attributes` attribute for all the following items after the first one is changed', () => {
				setModelData( model,
					paragraph( '1.', '01', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '2.', '02', 0, 'bulleted', { 'data-foo': 'A' } ) +
					paragraph( '3.', '03', 0, 'bulleted', { 'data-foo': 'A' } )
				);

				model.change( writer => {
					writer.setAttribute(
						'htmlUlAttributes',
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
			beforeEach( () => {
				dataFilter.allowElement( /^.*$/ );
				dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
				dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

				// Apply filtering rules added after initial data load.
				editor.setData( '' );
			} );

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
		beforeEach( () => {
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			// Apply filtering rules added after initial data load.
			editor.setData( '' );
		} );

		it( 'should reset `html*Attributes` attribute after indenting a single item', () => {
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

		it( 'should reset `html*Attributes` attribute after indenting a few items', () => {
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

		it( 'should copy `html*Attributes` attribute after indenting a single item into previously nested list', () => {
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

		it( 'should copy `html*Attributes` attribute after indenting a few items into previously nested list', () => {
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

	describe( '#14349 and #14346', () => {
		it( 'splitting a list does not remove styles', () => {
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			editor.setData(
				'<ol>' +
					'<li class="background-list-item">1.1</li>' +
					'<li class="background-list-item">1.2</li>' +
					'<li class="background-list-item">1.3</li>' +
				'</ol>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 1 ), 0 );
			} );

			editor.commands.get( 'numberedList' ).execute( { forceValue: false } );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
				'<ol>' +
					'<li class="background-list-item">1.1</li>' +
				'</ol>' +
				'<p>1.2</p>' +
				'<ol>' +
					'<li class="background-list-item">1.3</li>' +
				'</ol>'
			);
		} );

		it( 'removing item from a list does not remove styles of other elements list', () => {
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			editor.setData(
				'<ol>' +
					'<li class="background-list-item">1.1</li>' +
					'<li class="background-list-item">1.2</li>' +
					'<li class="background-list-item">1.3</li>' +
				'</ol>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 0 ), 0 );
			} );

			editor.commands.get( 'numberedList' ).execute( { forceValue: false } );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
				'<p>1.1</p>' +
				'<ol>' +
					'<li class="background-list-item">1.2</li>' +
					'<li class="background-list-item">1.3</li>' +
				'</ol>'
			);
		} );
	} );

	describe( '#14434', () => {
		it( 'doesnt crash the editor when adding new element to the nested list', () => {
			editor.setData(
				'<ul>' +
					'<li>1.1</li>' +
					'<li>2.1</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 1 ), 'end' );
			} );

			editor.commands.execute( 'indentList' );
			editor.commands.execute( 'enter' );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
				'<ul>' +
					'<li>1.1' +
						'<ul>' +
							'<li>2.1</li>' +
							'<li>&nbsp;</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'doesnt add empty html*Attributes to nested list when its not allowed in schema', () => {
			editor.setData(
				'<ul>' +
					'<li>1.1</li>' +
					'<li>2.1</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getChild( 1 ), 'end' );
			} );

			editor.commands.execute( 'indentList' );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
					'1.1' +
					'</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="bulleted">' +
					'2.1' +
					'</paragraph>',
				attributes: {}
			} );
		} );

		it( 'doesnt crash the editor when element inside a list has disallowed attribute', async () => {
			// Create editor with custom plugin that disallows `ul` and `li` attributes on H2 elements
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						Paragraph,
						GeneralHtmlSupport,
						ListEditing,
						function disallowUlAndLiElementsOnH2Elements( editor ) {
							editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
								if ( attributeName === 'htmlUlAttributes' && context.endsWith( 'htmlH2' ) ) {
									return false;
								}

								if ( attributeName === 'htmlLiAttributes' && context.endsWith( 'htmlH2' ) ) {
									return false;
								}
							} );
						}
					]
				} );

			const dataFilter = editor.plugins.get( 'DataFilter' );

			// Allow everything
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			// Set data with H2 that doesn't allow `li` or `ul` attributes
			editor.setData(
				'<ul data-foo="data">' +
					'<li>a</li>' +
					'<li data-foo="bar">' +
						'<p>Paragraph</p>' +
						'<h2>Heading</h2>' +
					'</li>' +
					'<li>c</li>' +
					'<li>d</li>' +
				'</ul>'
			);

			expect( getModelDataWithAttributes( editor.model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlLiAttributes="(1)" htmlUlAttributes="(2)" listIndent="0" listItemId="a00" listType="bulleted">' +
						'a' +
					'</paragraph>' +
					'<paragraph htmlLiAttributes="(3)" htmlUlAttributes="(4)" listIndent="0" listItemId="a01" listType="bulleted">' +
						'Paragraph' +
					'</paragraph>' +
					'<htmlH2 listIndent="0" listItemId="a01" listType="bulleted">Heading</htmlH2>' +
					'<paragraph htmlLiAttributes="(5)" listIndent="0" listItemId="a02" listType="bulleted">c</paragraph>' +
					'<paragraph htmlLiAttributes="(6)" listIndent="0" listItemId="a03" listType="bulleted">d</paragraph>',
				attributes: {
					1: {},
					2: {
						attributes: {
							'data-foo': 'data'
						}
					},
					3: {
						attributes: {
							'data-foo': 'bar'
						}
					},
					4: {
						attributes: {
							'data-foo': 'data'
						}
					},

					/**
					 * Elements after H2 will lose their li and ul attributes, but this is a known
					 * limitation and has little potential to cause problems. Lists will retain
					 * their attributes during downcast as long as the first element in the list
					 * has them, like the paragraph before H2 in this test.
					 */

					5: {},
					6: {}
				}
			} );

			expect( editor.getData( { skipListItemIds: true } ) ).to.be.equal(
				'<ul data-foo="data">' +
					'<li>a</li>' +
					'<li data-foo="bar">' +
						'<p>Paragraph</p>' +
						'<h2>Heading</h2>' +
					'</li>' +
					'<li>c</li>' +
					'<li>d</li>' +
				'</ul>'
			);

			await editorElement.remove();
			await editor.destroy();
		} );
	} );

	describe( '#15527 and #15565', () => {
		// See https://github.com/ckeditor/ckeditor5/issues/15527.
		it( 'should not remove attribute from other elements (inside GHS div)', () => {
			const dataFilter = editor.plugins.get( 'DataFilter' );

			// Allow everything
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			editor.setData(
				'<div>' +
					'<ol>' +
						'<li>foo</li>' +
						'<li>' +
							'<div>' +
								'<ol>' +
									'<li>bar</li>' +
								'</ol>' +
							'</div>' +
						'</li>' +
					'</ol>' +
				'</div>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getNodeByPath( [ 0, 1, 0 ] ), 0 );
			} );

			expect( getModelDataWithAttributes( model ) ).to.deep.equal( {
				data:
					'<htmlDiv>' +
						'<paragraph htmlLiAttributes="(1)" htmlOlAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
							'foo' +
						'</paragraph>' +
						'<htmlDiv htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="0" listItemId="a02" listType="numbered">' +
							'<paragraph' +
								' htmlLiAttributes="(5)" htmlOlAttributes="(6)" listIndent="0" listItemId="a01" listType="numbered">' +
								'[]bar' +
							'</paragraph>' +
						'</htmlDiv>' +
					'</htmlDiv>',
				attributes: {
					1: {},
					2: {},
					3: {},
					4: {},
					5: {},
					6: {}
				}
			} );

			editor.editing.view.document.fire( 'delete', { direction: 'backward', preventDefault() {} } );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<htmlDiv>' +
						'<paragraph htmlLiAttributes="(1)" htmlOlAttributes="(2)" listIndent="0" listItemId="a00" listType="numbered">' +
							'foo' +
						'</paragraph>' +
						'<htmlDiv htmlLiAttributes="(3)" htmlOlAttributes="(4)" listIndent="0" listItemId="a02" listType="numbered">' +
							'<paragraph>bar</paragraph>' +
						'</htmlDiv>' +
					'</htmlDiv>',
				attributes: {
					1: {},
					2: {},
					3: {},
					4: {}
				}
			} );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/15565.
		it( 'should not remove attribute from other elements (inside table cell)', () => {
			const dataFilter = editor.plugins.get( 'DataFilter' );

			// Allow everything
			dataFilter.allowElement( /^.*$/ );
			dataFilter.allowAttributes( { name: /^.*$/, attributes: true } );
			dataFilter.allowAttributes( { name: /^.*$/, classes: true } );

			editor.setData(
				'<ul>' +
					'<li>' +
						'<p><br>&nbsp;</p>' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>' +
											'<ul><li>&nbsp;</li></ul>' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getNodeByPath( [ 1, 0, 0, 0 ] ), 0 );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph htmlLiAttributes="{}" htmlUlAttributes="{}" listIndent="0" listItemId="a01" listType="bulleted">' +
					'<htmlCustomElement htmlContent="" htmlElementName="br"></htmlCustomElement> ' +
				'</paragraph>' +
				'<table htmlLiAttributes="{}" htmlUlAttributes="{}" listIndent="0" listItemId="a01" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph htmlLiAttributes="{}" htmlUlAttributes="{}" listIndent="0" listItemId="a00" listType="bulleted">' +
								'[]' +
							'</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			editor.editing.view.document.fire( 'enter', { preventDefault() {} } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph htmlLiAttributes="{}" htmlUlAttributes="{}" listIndent="0" listItemId="a01" listType="bulleted">' +
					'<htmlCustomElement htmlContent="" htmlElementName="br"></htmlCustomElement> ' +
				'</paragraph>' +
				'<table htmlLiAttributes="{}" htmlUlAttributes="{}" listIndent="0" listItemId="a01" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>' +
								'[]' +
							'</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );
	} );

	function paragraph( text, id, indent, type, listAttributes ) {
		const attributeName = type === 'bulleted' ?
			'htmlUlAttributes' :
			'htmlOlAttributes';
		const attrs = JSON.stringify( { attributes: listAttributes } ).replaceAll( '"', '&quot;' );

		return (
			`<paragraph ${ attributeName }="${ attrs }" listIndent="${ indent }" listItemId="${ id }" listType="${ type }">` +
				text +
			'</paragraph>'
		);
	}

	function unquote( text ) {
		return text.replaceAll( '&quot;', '"' );
	}
} );
