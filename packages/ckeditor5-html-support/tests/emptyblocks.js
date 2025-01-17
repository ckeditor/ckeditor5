/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import EmptyBlocks from '../src/emptyblocks.js';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget';

describe( 'EmptyBlocks', () => {
	let editor, model, element;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, TableEditing, EmptyBlocks ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( EmptyBlocks.pluginName ).to.equal( 'EmptyBlocks' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmptyBlocks.isOfficialPlugin ).to.be.true;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( EmptyBlocks ) ).to.be.instanceOf( EmptyBlocks );
	} );

	describe( 'schema', () => {
		it( 'should allow htmlEmptyBlock attribute on $block', () => {
			expect( model.schema.checkAttribute( [ '$block' ], 'htmlEmptyBlock' ) ).to.be.true;
		} );
	} );

	describe( 'upcast conversion', () => {
		it( 'should set htmlEmptyBlock attribute on empty paragraph', () => {
			editor.setData( '<p></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);
		} );

		it( 'should not set htmlEmptyBlock attribute on non-empty paragraph', () => {
			editor.setData( '<p>foo</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>'
			);
		} );

		it( 'should set htmlEmptyBlock attribute on paragraph with whitespace', () => {
			editor.setData( '<p> </p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);
		} );

		it( 'should not set htmlEmptyBlock attribute on empty inline elements', () => {
			registerInlinePlaceholderWidget();

			editor.setData(
				'<p>' +
					'Hello' +
					'<span class="placeholder"></span>' +
					'World' +
				'</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>Hello<placeholder></placeholder>World</paragraph>'
			);
		} );
	} );

	describe( 'downcast conversion', () => {
		it( 'should not return anything if blank paragraph in model (as it used to do)', () => {
			setModelData( model, '<paragraph></paragraph>' );

			expect( editor.getData() ).to.equal( '' );
		} );

		it( 'should add filler to normal empty paragraph', () => {
			setModelData( model, '<paragraph>Hello</paragraph><paragraph></paragraph>' );

			expect( editor.getData() ).to.equal( '<p>Hello</p><p>&nbsp;</p>' );
		} );

		it( 'should preserve multiple empty paragraphs', () => {
			setModelData(
				model,
				'<paragraph>Hello</paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>Hello</paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);

			expect( editor.getData() ).to.equal( '<p>Hello</p><p></p><p></p><p></p>' );
		} );

		it( 'should preserve empty paragraphs mixed with non-empty ones', () => {
			editor.setData( '<p></p><p>foo</p><p></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph htmlEmptyBlock="true"></paragraph>' +
				'<paragraph>foo</paragraph>' +
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);

			expect( editor.getData() ).to.equal( '<p></p><p>foo</p><p></p>' );
		} );
	} );

	describe( 'table integration', () => {
		it( 'should set htmlEmptyBlock attribute on empty table cell', () => {
			editor.setData( '<figure class="table"><table><tbody><tr><td></td></tr></tbody></table></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table><tableRow><tableCell htmlEmptyBlock="true"><paragraph></paragraph></tableCell></tableRow></table>'
			);
		} );

		it( 'should preserve empty table cells in data output', () => {
			editor.setData( '<figure class="table"><table><tbody><tr><td></td><td>foo</td><td></td></tr></tbody></table></figure>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td></td><td>foo</td><td></td></tr></tbody></table></figure>'
			);
		} );

		it( 'should preserve empty cells mixed with non-empty ones', () => {
			editor.setData( '<figure class="table"><table><tbody><tr><td>foo</td><td></td><td>bar</td></tr></tbody></table></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>foo</paragraph></tableCell>' +
						'<tableCell htmlEmptyBlock="true"><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph>bar</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td>foo</td><td></td><td>bar</td></tr></tbody></table></figure>'
			);
		} );

		it( 'should not set htmlEmptyBlock attribute on table cell with whitespace', () => {
			editor.setData( '<figure class="table"><table><tbody><tr><td> </td></tr></tbody></table></figure>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td>&nbsp;</td></tr></tbody></table></figure>'
			);
		} );
	} );

	function registerInlinePlaceholderWidget() {
		model.schema.register( 'placeholder', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'name' ]
		} );

		model.schema.extend( '$text', { allowIn: 'placeholder' } );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'placeholder' ]
			},
			model: ( _, { writer } ) => writer.createElement( 'placeholder' )
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( _, { writer } ) => toWidget(
				writer.createContainerElement( 'span', { class: 'placeholder' } ),
				writer
			)
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( _, { writer } ) => writer.createContainerElement( 'span', { class: 'placeholder' } )
		} );
	}
} );
