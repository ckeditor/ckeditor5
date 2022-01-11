/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import { parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { modelList, stringifyList } from '../_utils/utils';

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

	it( 'should throw when indent is invalid', () => {
		expect( () => modelList( [
			'* foo',
			'    bar',
			'    baz'
		] ) ).to.throw( Error, 'Invalid indent:     bar' );
	} );
} );

describe( 'stringifyList()', () => {
	let model;

	beforeEach( () => {
		model = new Model();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

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

	// TODO
} );
