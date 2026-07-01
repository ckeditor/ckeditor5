/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { getModelDataWithAttributes } from '../_utils/utils.js';
import { GeneralHtmlSupport } from '../../src/generalhtmlsupport.js';
import { HorizontalLineElementSupport } from '../../src/integrations/horizontalline.js';

describe( 'HorizontalLineElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ HorizontalLine, Paragraph, GeneralHtmlSupport ]
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

	it( 'should be named', () => {
		expect( editor.plugins.has( 'HorizontalLineElementSupport' ) ).toBe( true );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HorizontalLineElementSupport.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HorizontalLineElementSupport.isPremiumPlugin ).toBe( false );
	} );

	it( 'should allow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<hr data-foo="bar">';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
			data: '<horizontalLine htmlHrAttributes="(1)"></horizontalLine>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'bar'
					}
				}
			}
		} );

		expect( editor.getData() ).toBe( expectedHtml );
	} );

	it( 'should allow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			classes: 'foobar'
		} ] );

		const expectedHtml =
			'<hr class="foobar">';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
			data: '<horizontalLine htmlHrAttributes="(1)"></horizontalLine>',
			attributes: {
				1: {
					classes: [ 'foobar' ]
				}
			}
		} );

		expect( editor.getData() ).toBe( expectedHtml );
	} );

	it( 'should allow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			styles: 'border-color'
		} ] );

		const expectedHtml =
			'<hr style="border-color:red;">';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
			data: '<horizontalLine htmlHrAttributes="(1)"></horizontalLine>',
			attributes: {
				1: {
					styles: {
						'border-color': 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).toBe( expectedHtml );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			attributes: /^data-.*$/
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: 'hr',
			attributes: /^data-.*$/
		} ] );

		editor.setData(
			'<hr data-foo="bar">'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
			data: '<horizontalLine></horizontalLine>',
			attributes: {}
		} );

		expect( editor.getData() ).toBe(
			'<hr>'
		);
	} );

	it( 'should disallow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			classes: 'foobar'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: 'hr',
			classes: 'foobar'
		} ] );

		editor.setData(
			'<hr class="foobar">'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
			data: '<horizontalLine></horizontalLine>',
			attributes: {}
		} );

		expect( editor.getData() ).toBe(
			'<hr>'
		);
	} );

	it( 'should disallow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			styles: 'color'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: 'hr',
			styles: 'color'
		} ] );

		editor.setData(
			'<hr style="color:red;">'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
			data: '<horizontalLine></horizontalLine>',
			attributes: {}
		} );

		expect( editor.getData() ).toBe(
			'<hr>'
		);
	} );

	it( 'should not consume attributes already consumed (downcast)', () => {
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:htmlHrAttributes:horizontalLine', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			}, { priority: 'high' } );
		} );

		dataFilter.allowElement( 'hr' );
		dataFilter.allowAttributes( {
			name: 'hr',
			attributes: { 'data-foo': true }
		} );

		editor.setData(
			'<hr data-foo="foo">'
		);

		expect( editor.getData() ).toBe(
			'<hr>'
		);
	} );

	it( 'should update view element attributes when model attribute is changed programmatically', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			attributes: /^data-.*$/
		} ] );

		editor.setData( '<hr>' );

		const horizontalLineElement = model.document.getRoot().getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'htmlHrAttributes', { attributes: { 'data-foo': 'bar' } }, horizontalLineElement );
		} );

		expect( editor.getData() ).toBe( '<hr data-foo="bar">' );
	} );

	it( 'should not update attributes when view element is not found in container', () => {
		dataFilter.loadAllowedConfig( [ {
			name: 'hr',
			attributes: /^data-.*$/
		} ] );

		// Replace the default downcast so that the container element does not contain an <hr> child.
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'insert:horizontalLine', ( evt, data, conversionApi ) => {
				// Create a container without an inner <hr> element.
				const viewElement = conversionApi.writer.createContainerElement( 'div', { class: 'custom-hr' } );

				conversionApi.mapper.bindElements( data.item, viewElement );
				conversionApi.consumable.consume( data.item, 'insert' );
				conversionApi.writer.insert(
					conversionApi.mapper.toViewPosition( data.range.start ),
					viewElement
				);

				evt.stop();
			}, { priority: 'high' } );
		} );

		editor.setData( '<hr data-foo="foo">' );

		const horizontalLineElement = model.document.getRoot().getChild( 0 );

		// Updating the attribute should not throw even though there is no <hr> in the container.
		expect( () => model.change( writer => {
			writer.setAttribute( 'htmlHrAttributes', { attributes: { 'data-foo': 'bar' } }, horizontalLineElement );
		} ) ).not.toThrow();
	} );
} );
