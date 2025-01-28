/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { modelList, stringifyList } from '../_utils/utils.js';

describe( 'mockList()', () => {
	it( 'Single bulleted list item', () => {
		expect( modelList( [
			'* foo'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>'
		);
	} );

	it( 'flat list', () => {
		expect( modelList( [
			'* foo',
			'* bar'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'list item after plain paragraph', () => {
		expect( modelList( [
			'foo',
			'* bar'
		] ) ).to.equalMarkup(
			'<paragraph>foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should allow leading space in list content', () => {
		expect( modelList( [
			'*  foo',
			'   bar',
			'*   baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted"> foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted"> bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">  baz</paragraph>'
		);
	} );

	it( 'list item before plain paragraph', () => {
		expect( modelList( [
			'* foo',
			'bar'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph>bar</paragraph>'
		);
	} );

	it( 'list item with multiple blocks', () => {
		expect( modelList( [
			'* foo',
			'  bar',
			'  baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'flat list item with multiple blocks in the first item', () => {
		expect( modelList( [
			'* foo',
			'  bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'flat list item with multiple blocks in the last item', () => {
		expect( modelList( [
			'* foo',
			'* bar',
			'  baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'mixed bulleted with numbered lists', () => {
		expect( modelList( [
			'* foo',
			'# bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="numbered">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'numbered lists with blocks', () => {
		expect( modelList( [
			'# foo',
			'# bar',
			'  baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="numbered">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="numbered">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="numbered">baz</paragraph>'
		);
	} );

	it( 'list with nested lists', () => {
		expect( modelList( [
			'* foo',
			'  * bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'list with nested list inside a single list item', () => {
		expect( modelList( [
			'* foo',
			'  * bar',
			'  baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'list with deep nested lists', () => {
		expect( modelList( [
			'* foo',
			'  * bar',
			'    * baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="2" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'list with indent drop', () => {
		expect( modelList( [
			'* foo',
			'  * bar',
			'    * baz',
			'  * abc',
			'* 123'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="2" listItemId="002" listType="bulleted">baz</paragraph>' +
			'<paragraph listIndent="1" listItemId="003" listType="bulleted">abc</paragraph>' +
			'<paragraph listIndent="0" listItemId="004" listType="bulleted">123</paragraph>'
		);
	} );

	it( 'list with higher indent drop', () => {
		expect( modelList( [
			'* foo',
			'  * bar',
			'    * baz',
			'* abc',
			'  * 123'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="2" listItemId="002" listType="bulleted">baz</paragraph>' +
			'<paragraph listIndent="0" listItemId="003" listType="bulleted">abc</paragraph>' +
			'<paragraph listIndent="1" listItemId="004" listType="bulleted">123</paragraph>'
		);
	} );

	it( 'lists with plain paragraph in the middle', () => {
		expect( modelList( [
			'* foo',
			'  * bar',
			'baz',
			'* abc',
			'  * 123'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph>baz</paragraph>' +
			'<paragraph listIndent="0" listItemId="003" listType="bulleted">abc</paragraph>' +
			'<paragraph listIndent="1" listItemId="004" listType="bulleted">123</paragraph>'
		);
	} );

	it( 'should not alter selection brackets', () => {
		expect( modelList( [
			'* fo[o',
			'  * bar',
			'    * b]az'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">fo[o</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="2" listItemId="002" listType="bulleted">b]az</paragraph>'
		);
	} );

	it( 'should allow passing custom element', () => {
		expect( modelList( [
			'* <heading1>foo</heading1>',
			'* <heading2 alignment="right">bar</heading2>',
			'* baz'
		] ) ).to.equalMarkup(
			'<heading1 listIndent="0" listItemId="000" listType="bulleted">foo</heading1>' +
			'<heading2 alignment="right" listIndent="0" listItemId="001" listType="bulleted">bar</heading2>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should allow passing custom element (no selection)', () => {
		expect( modelList( [
			'* <objectElement></objectElement>'
		] ) ).to.equalMarkup(
			'<objectElement listIndent="0" listItemId="000" listType="bulleted"></objectElement>'
		);
	} );

	it( 'should allow passing custom element (self closing, no attributes)', () => {
		expect( modelList( [
			'* <objectElement/>'
		] ) ).to.equalMarkup(
			'<objectElement listIndent="0" listItemId="000" listType="bulleted"></objectElement>'
		);
	} );

	it( 'should allow passing custom element (self closing, with attributes)', () => {
		expect( modelList( [
			'* <objectElement foo="bar"/>'
		] ) ).to.equalMarkup(
			'<objectElement foo="bar" listIndent="0" listItemId="000" listType="bulleted"></objectElement>'
		);
	} );

	it( 'should allow passing custom element (empty)', () => {
		expect( modelList( [
			'* [<objectElement></objectElement>]',
			'* bar'
		] ) ).to.equalMarkup(
			'[<objectElement listIndent="0" listItemId="000" listType="bulleted"></objectElement>]' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should allow passing custom element (nested)', () => {
		expect( modelList( [
			'* [<paragraph><nested></nested></paragraph>]',
			'* bar'
		] ) ).to.equalMarkup(
			'[<paragraph listIndent="0" listItemId="000" listType="bulleted"><nested></nested></paragraph>]' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should allow passing custom element (nested mixed)', () => {
		expect( modelList( [
			'* [<objectElement>a<nested></nested>b</objectElement>]',
			'* bar'
		] ) ).to.equalMarkup(
			'[<objectElement listIndent="0" listItemId="000" listType="bulleted">a<nested></nested>b</objectElement>]' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should allow passing custom element (selected)', () => {
		expect( modelList( [
			'* [<objectElement>foo</objectElement>]',
			'* bar'
		] ) ).to.equalMarkup(
			'[<objectElement listIndent="0" listItemId="000" listType="bulleted">foo</objectElement>]' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should allow passing custom element (selection starts before)', () => {
		expect( modelList( [
			'* [<objectElement>foo</objectElement>',
			'* bar]'
		] ) ).to.equalMarkup(
			'[<objectElement listIndent="0" listItemId="000" listType="bulleted">foo</objectElement>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar]</paragraph>'
		);
	} );

	it( 'should allow passing custom element (selection ends before)', () => {
		expect( modelList( [
			'* [bar',
			'* ]<objectElement>foo</objectElement>'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">[bar</paragraph>]' +
			'<objectElement listIndent="0" listItemId="001" listType="bulleted">foo</objectElement>'
		);
	} );

	it( 'should allow passing custom element (selection starts after)', () => {
		expect( modelList( [
			'* <objectElement>foo</objectElement>[',
			'* bar]'
		] ) ).to.equalMarkup(
			'<objectElement listIndent="0" listItemId="000" listType="bulleted">foo</objectElement>' +
			'[<paragraph listIndent="0" listItemId="001" listType="bulleted">bar]</paragraph>'
		);
	} );

	it( 'should allow passing custom element (selection ends after)', () => {
		expect( modelList( [
			'* [bar',
			'* <objectElement>foo</objectElement>]'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">[bar</paragraph>' +
			'<objectElement listIndent="0" listItemId="001" listType="bulleted">foo</objectElement>]'
		);
	} );

	it( 'should allow to customize the list item id (suffix)', () => {
		expect( modelList( [
			'* foo{id:abc}',
			'  bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="abc" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="abc" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should allow to customize the list item id (prefix)', () => {
		expect( modelList( [
			'* foo',
			'* {id:abc}bar',
			'  baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="abc" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="abc" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should allow to customize the list item id (with prefix)', () => {
		expect( modelList( [
			'* foo',
			'* bar{id:abc}',
			'  baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="abc" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="abc" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should not parse the custom list item ID if provided in the following block of a list item', () => {
		expect( modelList( [
			'* foo',
			'  {id:abc}bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">{id:abc}bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should parse the custom list style', () => {
		expect( modelList( [
			'* foo {style:abc}',
			'  bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listStyle="abc" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listStyle="abc" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listStyle="abc" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should parse the custom list start', () => {
		expect( modelList( [
			'* foo {start:7}',
			'  bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listStart="7" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listStart="7" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listStart="7" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should parse the list reversed', () => {
		expect( modelList( [
			'* foo {reversed:true}',
			'  bar',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listReversed="true" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listReversed="true" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listReversed="true" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should not parse the custom list style if provided in the following block of a list item', () => {
		expect( modelList( [
			'* foo {style:123}',
			'  bar {style:abc}',
			'* baz'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listStyle="123" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="000" listStyle="123" listType="bulleted">bar {style:abc}</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listStyle="123" listType="bulleted">baz</paragraph>'
		);
	} );

	it( 'should parse the custom list style of the different adjacent list type', () => {
		expect( modelList( [
			'* foo {style:123}',
			'* bar',
			'# abc {style:789}',
			'# def'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listStyle="123" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listStyle="123" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="0" listItemId="002" listStyle="789" listType="numbered">abc</paragraph>' +
			'<paragraph listIndent="0" listItemId="003" listStyle="789" listType="numbered">def</paragraph>'
		);
	} );

	it( 'should not forward `style` to different list', () => {
		expect( modelList( [
			'* foo {style:xyz}',
			'# bar'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listStyle="xyz" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="numbered">bar</paragraph>'
		);
	} );

	it( 'should not forward `start` to different list', () => {
		expect( modelList( [
			'# foo {start:7}',
			'* bar'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listStart="7" listType="numbered">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should not forward `reversed` to different list', () => {
		expect( modelList( [
			'# foo {reversed:true}',
			'* bar'
		] ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listReversed="true" listType="numbered">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
		);
	} );

	it( 'should parse string to lines', () => {
		expect( modelList( `
			* foo
			* bar
			  # num
				block
			  # aaa
			  abc
			* end
		` ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>' +
			'<paragraph listIndent="1" listItemId="002" listType="numbered">num</paragraph>' +
			'<paragraph listIndent="1" listItemId="002" listType="numbered">block</paragraph>' +
			'<paragraph listIndent="1" listItemId="004" listType="numbered">aaa</paragraph>' +
			'<paragraph listIndent="0" listItemId="001" listType="bulleted">abc</paragraph>' +
			'<paragraph listIndent="0" listItemId="006" listType="bulleted">end</paragraph>'
		);
	} );

	it( 'should parse string with mixed tabs and spaces to lines', () => {
		expect( modelList( `
			* foo
			\x20\x20# num
			\ta
			\x20\tb
			\x20\x20\tc
			\x20\x20\x20\td
			\x20\x20\x20\x20e
		` ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">foo</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="numbered">num</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="numbered">a</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="numbered">b</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="numbered">c</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="numbered">d</paragraph>' +
			'<paragraph listIndent="1" listItemId="001" listType="numbered">e</paragraph>'
		);
	} );

	it( 'should throw when indent is invalid', () => {
		expect( () => modelList( [
			'* foo',
			'    bar',
			'    baz'
		] ) ).to.throw( Error, 'Invalid indent:     bar' );
	} );

	it( 'should throw when ID is reused', () => {
		expect( () => modelList( [
			'* foo',
			'* bar {id:000}'
		] ) ).to.throw( Error, 'ID conflict: 000' );
	} );

	it( 'should allow using different default block', () => {
		modelList.defaultBlock = 'listItem';

		expect( modelList( `
			text
			* foo
			# bar
			# <paragraph>baz</paragraph>
		` ) ).to.equalMarkup(
			'<paragraph>text</paragraph>' +
			'<listItem listIndent="0" listItemId="001" listType="bulleted">foo</listItem>' +
			'<listItem listIndent="0" listItemId="002" listType="numbered">bar</listItem>' +
			'<paragraph listIndent="0" listItemId="003" listType="numbered">baz</paragraph>'
		);

		modelList.defaultBlock = 'paragraph';
	} );
} );

describe( 'stringifyList()', () => {
	let model;

	beforeEach( () => {
		model = new Model();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	describe( 'bulleted list', () => {
		it( 'flat list', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="foo" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="0" listItemId="bar" listType="bulleted">bbb</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'* aaa',
				'* bbb'
			].join( '\n' ) );
		} );

		it( 'flat list with multi-block items', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="foo" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="0" listItemId="foo" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="0" listItemId="bar" listType="bulleted">ccc</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'* aaa',
				'  bbb',
				'* ccc'
			].join( '\n' ) );
		} );

		it( 'nested list with multi-block items', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">ccc</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'* aaa',
				'  * bbb',
				'  ccc'
			].join( '\n' ) );
		} );

		it( 'nested list with many items', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">ccc</paragraph>' +
				'<paragraph listIndent="1" listItemId="d" listType="bulleted">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'* aaa',
				'  * bbb',
				'  * ccc',
				'  * ddd'
			].join( '\n' ) );
		} );

		it( 'many indentations', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">ccc</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="bulleted">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'* aaa',
				'  * bbb',
				'    * ccc',
				'      * ddd'
			].join( '\n' ) );
		} );

		it( 'many indentations with multiple blocks', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">ccc</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">ccc</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="bulleted">ddd</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="bulleted">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* aaa',
				'  aaa',
				'  * bbb',
				'    bbb',
				'    * ccc',
				'      ccc',
				'      * ddd',
				'        ddd'
			].join( '\n' ) );
		} );

		it( 'nested multi-blocks item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">ccc</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* aaa',
				'  * bbb',
				'    ccc'
			].join( '\n' ) );
		} );

		it( 'nested multi-blocks item followed by a list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">ccc</paragraph>' +
				'<paragraph listIndent="0" listItemId="c" listType="bulleted">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* aaa',
				'  * bbb',
				'    ccc',
				'* ddd'
			].join( '\n' ) );
		} );

		it( 'single list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* a'
			].join( '\n' ) );
		} );

		it( 'empty list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted"></paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* '
			].join( '\n' ) );
		} );
	} );

	describe( 'numbered list', () => {
		it( 'flat list', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="foo" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="0" listItemId="bar" listType="numbered">bbb</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'# bbb'
			].join( '\n' ) );
		} );

		it( 'flat list with multi-block items', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="foo" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="0" listItemId="foo" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="0" listItemId="bar" listType="numbered">ccc</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  bbb',
				'# ccc'
			].join( '\n' ) );
		} );

		it( 'nested list with multi-block items', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">ccc</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  # bbb',
				'  ccc'
			].join( '\n' ) );
		} );

		it( 'nested list with many items', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="numbered">ccc</paragraph>' +
				'<paragraph listIndent="1" listItemId="d" listType="numbered">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  # bbb',
				'  # ccc',
				'  # ddd'
			].join( '\n' ) );
		} );

		it( 'many indentations', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="numbered">ccc</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="numbered">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  # bbb',
				'    # ccc',
				'      # ddd'
			].join( '\n' ) );
		} );

		it( 'many indentations with multiple blocks', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="numbered">ccc</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="numbered">ccc</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="numbered">ddd</paragraph>' +
				'<paragraph listIndent="3" listItemId="d" listType="numbered">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  aaa',
				'  # bbb',
				'    bbb',
				'    # ccc',
				'      ccc',
				'      # ddd',
				'        ddd'
			].join( '\n' ) );
		} );

		it( 'nested multi-blocks item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">ccc</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  # bbb',
				'    ccc'
			].join( '\n' ) );
		} );

		it( 'nested multi-blocks item followed by a list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">aaa</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">bbb</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">ccc</paragraph>' +
				'<paragraph listIndent="0" listItemId="c" listType="numbered">ddd</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# aaa',
				'  # bbb',
				'    ccc',
				'# ddd'
			].join( '\n' ) );
		} );

		it( 'single list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# a'
			].join( '\n' ) );
		} );

		it( 'empty list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="numbered"></paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equal( [
				'# '
			].join( '\n' ) );
		} );
	} );

	describe( 'mixed lists', () => {
		it( 'bulleted and numbered list', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="numbered">0</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* a',
				'# 0'
			].join( '\n' ) );
		} );

		it( 'numbered list item with nested bulleted list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="0" listType="numbered">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="1" listType="bulleted">a</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'# 0',
				'  * a'
			].join( '\n' ) );
		} );

		it( 'bulleted list item with nested numbered list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="0" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="1" listType="numbered">0</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* a',
				'  # 0'
			].join( '\n' ) );
		} );

		it( 'numbered list with many blocks and nested bulleted list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="0" listType="numbered">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="0" listType="numbered">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="1" listType="bulleted">a</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'# 0',
				'  1',
				'  * a'
			].join( '\n' ) );
		} );

		it( 'bulleted list with many blocks and nested numbered list item', () => {
			const input = parseModel(
				'<paragraph listIndent="0" listItemId="0" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="0" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="1" listType="numbered">0</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* a',
				'  b',
				'  # 0'
			].join( '\n' ) );
		} );

		it( 'should allow using different default block', () => {
			modelList.defaultBlock = 'listItem';
			model.schema.register( 'listItem', { inheritAllFrom: '$block' } );

			const input = parseModel(
				'<listItem listIndent="0" listItemId="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="0" listItemId="1" listType="numbered">b</listItem>' +
				'<paragraph listIndent="0" listItemId="2" listType="numbered">c</paragraph>',
				model.schema
			);

			expect( stringifyList( input ) ).to.equalMarkup( [
				'* a',
				'# b',
				'# <paragraph>c</paragraph>'
			].join( '\n' ) );

			modelList.defaultBlock = 'paragraph';
		} );
	} );
} );
