/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import GeneralHtmlSupport from '../src/generalhtmlsupport';
import { getModelDataWithAttributes } from './_utils/utils';
import { range } from 'lodash-es';

/* global document */

describe( 'TableElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ List, TodoList, Paragraph, GeneralHtmlSupport ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = editor.plugins.get( 'DataFilter' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should allow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<ol data-list="ol">' +
				'<li data-list="li">1</li>' +
				'<li data-list="li">2</li>' +
				'<li data-list="li">3' +
					'<ol data-list="ol">' +
						'<li data-list="li">4</li>' +
						'<li data-list="li">5</li>' +
						'<li data-list="li">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>';

		editor.setData( expectedHtml );

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem htmlAttributes="(1)" htmlList="htmlList-1" listIndent="0" listType="numbered">1</listItem>' +
			'<listItem htmlAttributes="(2)" htmlList="htmlList-2" listIndent="0" listType="numbered">2</listItem>' +
			'<listItem htmlAttributes="(3)" htmlList="htmlList-3" listIndent="0" listType="numbered">3</listItem>' +
			'<listItem htmlAttributes="(4)" htmlList="htmlList-4" listIndent="1" listType="numbered">4</listItem>' +
			'<listItem htmlAttributes="(5)" htmlList="htmlList-5" listIndent="1" listType="numbered">5</listItem>' +
			'<listItem htmlAttributes="(6)" htmlList="htmlList-6" listIndent="1" listType="numbered">6</listItem>',
			attributes: createAttributesFromRange( 1, 7, ( { attributes: { 'data-list': 'li' } } ) )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	// TODO Enable once fixing #8829
	it.skip( 'should allow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			classes: 'foobar'
		} ] );

		const expectedHtml =
			'<ol class="foobar">' +
				'<li class="foobar">1</li>' +
				'<li class="foobar">2</li>' +
				'<li class="foobar">3' +
					'<ol class="foobar">' +
						'<li class="foobar">4</li>' +
						'<li class="foobar">5</li>' +
						'<li class="foobar">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>';

		editor.setData( expectedHtml );

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem htmlAttributes="(1)" htmlList="htmlList-1" listIndent="0" listType="numbered">1</listItem>' +
			'<listItem htmlAttributes="(2)" htmlList="htmlList-2" listIndent="0" listType="numbered">2</listItem>' +
			'<listItem htmlAttributes="(3)" htmlList="htmlList-3" listIndent="0" listType="numbered">3</listItem>' +
			'<listItem htmlAttributes="(4)" htmlList="htmlList-4" listIndent="1" listType="numbered">4</listItem>' +
			'<listItem htmlAttributes="(5)" htmlList="htmlList-5" listIndent="1" listType="numbered">5</listItem>' +
			'<listItem htmlAttributes="(6)" htmlList="htmlList-6" listIndent="1" listType="numbered">6</listItem>',
			attributes: createAttributesFromRange( 1, 7, ( { classes: [ 'foobar' ] } ) )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should allow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			styles: 'color'
		} ] );

		const expectedHtml =
			'<ol style="color:red;">' +
				'<li style="color:red;">1</li>' +
				'<li style="color:red;">2</li>' +
				'<li style="color:red;">3' +
					'<ol style="color:red;">' +
						'<li style="color:red;">4</li>' +
						'<li style="color:red;">5</li>' +
						'<li style="color:red;">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>';

		editor.setData( expectedHtml );

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem htmlAttributes="(1)" htmlList="htmlList-1" listIndent="0" listType="numbered">1</listItem>' +
			'<listItem htmlAttributes="(2)" htmlList="htmlList-2" listIndent="0" listType="numbered">2</listItem>' +
			'<listItem htmlAttributes="(3)" htmlList="htmlList-3" listIndent="0" listType="numbered">3</listItem>' +
			'<listItem htmlAttributes="(4)" htmlList="htmlList-4" listIndent="1" listType="numbered">4</listItem>' +
			'<listItem htmlAttributes="(5)" htmlList="htmlList-5" listIndent="1" listType="numbered">5</listItem>' +
			'<listItem htmlAttributes="(6)" htmlList="htmlList-6" listIndent="1" listType="numbered">6</listItem>',
			attributes: createAttributesFromRange( 1, 7, ( { styles: { color: 'red' } } ) )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: /^data-.*$/
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: /^data-.*$/
		} ] );

		editor.setData(
			'<ol data-list="ol">' +
				'<li data-list="li">1</li>' +
				'<li data-list="li">2</li>' +
				'<li data-list="li">3' +
					'<ol data-list="ol">' +
						'<li data-list="li">4</li>' +
						'<li data-list="li">5</li>' +
						'<li data-list="li">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem listIndent="0" listType="numbered">1</listItem>' +
			'<listItem listIndent="0" listType="numbered">2</listItem>' +
			'<listItem listIndent="0" listType="numbered">3</listItem>' +
			'<listItem listIndent="1" listType="numbered">4</listItem>' +
			'<listItem listIndent="1" listType="numbered">5</listItem>' +
			'<listItem listIndent="1" listType="numbered">6</listItem>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<ol>' +
				'<li>1</li>' +
				'<li>2</li>' +
				'<li>3' +
					'<ol>' +
						'<li>4</li>' +
						'<li>5</li>' +
						'<li>6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);
	} );

	it( 'should disallow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			classes: 'foobar'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(ol|ul|li)$/,
			classes: 'foobar'
		} ] );

		editor.setData(
			'<ol class="foobar">' +
				'<li class="foobar">1</li>' +
				'<li class="foobar">2</li>' +
				'<li class="foobar">3' +
					'<ol class="foobar">' +
						'<li class="foobar">4</li>' +
						'<li class="foobar">5</li>' +
						'<li class="foobar">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem listIndent="0" listType="numbered">1</listItem>' +
			'<listItem listIndent="0" listType="numbered">2</listItem>' +
			'<listItem listIndent="0" listType="numbered">3</listItem>' +
			'<listItem listIndent="1" listType="numbered">4</listItem>' +
			'<listItem listIndent="1" listType="numbered">5</listItem>' +
			'<listItem listIndent="1" listType="numbered">6</listItem>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<ol>' +
				'<li>1</li>' +
				'<li>2</li>' +
				'<li>3' +
					'<ol>' +
						'<li>4</li>' +
						'<li>5</li>' +
						'<li>6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);
	} );

	it( 'should disallow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			styles: 'color'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(ol|ul|li)$/,
			styles: 'color'
		} ] );

		editor.setData(
			'<ol style="color:red;">' +
				'<li style="color:red;">1</li>' +
				'<li style="color:red;">2</li>' +
				'<li style="color:red;">3' +
					'<ol style="color:red;">' +
						'<li style="color:red;">4</li>' +
						'<li style="color:red;">5</li>' +
						'<li style="color:red;">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem listIndent="0" listType="numbered">1</listItem>' +
			'<listItem listIndent="0" listType="numbered">2</listItem>' +
			'<listItem listIndent="0" listType="numbered">3</listItem>' +
			'<listItem listIndent="1" listType="numbered">4</listItem>' +
			'<listItem listIndent="1" listType="numbered">5</listItem>' +
			'<listItem listIndent="1" listType="numbered">6</listItem>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<ol>' +
				'<li>1</li>' +
				'<li>2</li>' +
				'<li>3' +
					'<ol>' +
						'<li>4</li>' +
						'<li>5</li>' +
						'<li>6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>'
		);
	} );

	it( 'should only set htmlList attribute if needed', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<ol>' +
				'<li data-list="li">1</li>' +
				'<li data-list="li">2</li>' +
				'<li data-list="li">3' +
					'<ol data-list="ol">' +
						'<li data-list="li">4</li>' +
						'<li data-list="li">5</li>' +
						'<li data-list="li">6</li>' +
					'</ol>' +
				'</li>' +
			'</ol>';

		editor.setData( expectedHtml );

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem htmlAttributes="(1)" listIndent="0" listType="numbered">1</listItem>' +
			'<listItem htmlAttributes="(2)" listIndent="0" listType="numbered">2</listItem>' +
			'<listItem htmlAttributes="(3)" listIndent="0" listType="numbered">3</listItem>' +
			'<listItem htmlAttributes="(4)" htmlList="htmlList-1" listIndent="1" listType="numbered">4</listItem>' +
			'<listItem htmlAttributes="(5)" htmlList="htmlList-2" listIndent="1" listType="numbered">5</listItem>' +
			'<listItem htmlAttributes="(6)" htmlList="htmlList-3" listIndent="1" listType="numbered">6</listItem>',
			attributes: createAttributesFromRange( 1, 7, ( { attributes: { 'data-list': 'li' } } ) )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	// TODO Enable once fixing #8829
	it.skip( 'should handle mixed allowed and disallowed attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: /^data-.*$/,
			classes: [ 'allow', 'disallow' ],
			styles: [ 'color', 'background' ]
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: 'data-disallow',
			classes: 'disallow',
			styles: 'background'
		} ] );

		/* eslint-disable max-len */
		editor.setData(
			'<ul class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
				'<li class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">1</li>' +
				'<li class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">2</li>' +
				'<li class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">3' +
					'<ul class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
						'<li class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">4</li>' +
						'<li class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">5</li>' +
						'<li class="allow disallow" invalid-attribute="invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">6</li>' +
					'</ul>' +
				'</ul>' +
				'</li>' +
			'</ul>'
		);

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem htmlAttributes="(1)" htmlList="htmlList-1" listIndent="0" listType="bulleted">1</listItem>' +
			'<listItem htmlAttributes="(2)" htmlList="htmlList-2" listIndent="0" listType="bulleted">2</listItem>' +
			'<listItem htmlAttributes="(3)" htmlList="htmlList-3" listIndent="0" listType="bulleted">3</listItem>' +
			'<listItem htmlAttributes="(4)" htmlList="htmlList-4" listIndent="1" listType="bulleted">4</listItem>' +
			'<listItem htmlAttributes="(5)" htmlList="htmlList-5" listIndent="1" listType="bulleted">5</listItem>' +
			'<listItem htmlAttributes="(6)" htmlList="htmlList-6" listIndent="1" listType="bulleted">6</listItem>',
			attributes: createAttributesFromRange( 1, 7, ( {
				attributes: {
					'data-allow': 'allow'
				},
				styles: {
					color: 'red'
				},
				classes: [ 'allow' ]
			} ) )
		} );
		/* eslint-enable max-len */

		expect( editor.getData() ).to.equal(
			'<ul class="allow" style="color:red;" data-allow="allow">' +
				'<li class="allow" style="color:red;" data-allow="allow">1</li>' +
				'<li class="allow" style="color:red;" data-allow="allow">2</li>' +
				'<li class="allow" style="color:red;" data-allow="allow">3' +
					'<ul class="allow" style="color:red;" data-allow="allow">' +
						'<li class="allow" style="color:red;" data-allow="allow">4</li>' +
						'<li class="allow" style="color:red;" data-allow="allow">5</li>' +
						'<li class="allow" style="color:red;" data-allow="allow">6</li>' +
					'</ul>' +
				'</li>' +
			'</ul>'
		);
	} );

	it( 'should work for to-do lists', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(ol|ul|li)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<ul class="todo-list" data-list="ul">' +
				'<li data-list="li">' +
					'<label class="todo-list__label">' +
						'<input type="checkbox" disabled="disabled">' +
						'<span class="todo-list__label__description">1</span>' +
					'</label>' +
				'</li>' +
				'<li data-list="li">' +
					'<label class="todo-list__label">' +
						'<input type="checkbox" disabled="disabled">' +
						'<span class="todo-list__label__description">2</span>' +
					'</label>' +
				'</li>' +
				'<li data-list="li">' +
					'<label class="todo-list__label">' +
						'<input type="checkbox" disabled="disabled">' +
						'<span class="todo-list__label__description">3</span>' +
					'</label>' +
					'<ul class="todo-list" data-list="ul">' +
						'<li data-list="li">' +
							'<label class="todo-list__label">' +
								'<input type="checkbox" disabled="disabled">' +
								'<span class="todo-list__label__description">4</span>' +
							'</label>' +
						'</li>' +
						'<li data-list="li">' +
							'<label class="todo-list__label">' +
								'<input type="checkbox" disabled="disabled">' +
								'<span class="todo-list__label__description">5</span>' +
							'</label>' +
						'</li>' +
						'<li data-list="li">' +
							'<label class="todo-list__label">' +
								'<input type="checkbox" disabled="disabled">' +
								'<span class="todo-list__label__description">6</span>' +
							'</label>' +
						'</li>' +
					'</ul>' +
				'</li>' +
			'</ul>';

		editor.setData( expectedHtml );

		expect( getTableModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<listItem htmlAttributes="(1)" htmlList="htmlList-1" listIndent="0" listType="todo">1</listItem>' +
			'<listItem htmlAttributes="(2)" htmlList="htmlList-2" listIndent="0" listType="todo">2</listItem>' +
			'<listItem htmlAttributes="(3)" htmlList="htmlList-3" listIndent="0" listType="todo">3</listItem>' +
			'<listItem htmlAttributes="(4)" htmlList="htmlList-4" listIndent="1" listType="todo">4</listItem>' +
			'<listItem htmlAttributes="(5)" htmlList="htmlList-5" listIndent="1" listType="todo">5</listItem>' +
			'<listItem htmlAttributes="(6)" htmlList="htmlList-6" listIndent="1" listType="todo">6</listItem>',
			attributes: createAttributesFromRange( 1, 7, ( { attributes: { 'data-list': 'li' } } ) )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	function createAttributesFromRange( from, to, expected ) {
		return range( from, to ).reduce( ( attributes, index ) => {
			attributes[ index ] = expected;
			return attributes;
		}, {} );
	}

	function getTableModelDataWithAttributes( model, options ) {
		const result = getModelDataWithAttributes( model, { ...options, excludeAttributes: [ 'htmlList' ] } );

		let counter = 1;
		result.data = result.data.replace( /htmlList="htmlList-(.*?)"/g, () => {
			return `htmlList="htmlList-${ counter++ }"`;
		} );

		return result;
	}
} );
