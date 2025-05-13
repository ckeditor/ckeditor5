/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { List, ListProperties, AdjacentListsSupport } from '../../src/index.js';

import stubUid from './_utils/uid.js';

describe( 'AdjacentListsSupport', () => {
	let editorElement, editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph,
				List,
				AdjacentListsSupport
			]
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should have pluginName', () => {
		expect( AdjacentListsSupport.pluginName ).to.equal( 'AdjacentListsSupport' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( AdjacentListsSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( AdjacentListsSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( AdjacentListsSupport ) ).to.be.instanceOf( AdjacentListsSupport );
	} );

	it( 'shoud set proper schema rules', () => {
		expect( model.schema.isRegistered( 'listSeparator' ) ).to.equal( true );
	} );

	describe( 'upcast', () => {
		it( 'inserts "listSeparator" element between two "ul" lists in model', () => {
			editor.setData(
				'<ul>' +
					'<li>One</li>' +
				'</ul>' +
				'<ul>' +
					'<li>Two</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">One</paragraph>' +
				'<listSeparator></listSeparator>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Two</paragraph>'
			);
		} );

		it( 'inserts "listSeparator" element between two "ol" lists in model', () => {
			editor.setData(
				'<ol>' +
					'<li>One</li>' +
				'</ol>' +
				'<ol>' +
					'<li>Two</li>' +
				'</ol>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="numbered">One</paragraph>' +
				'<listSeparator></listSeparator>' +
				'<paragraph listIndent="0" listItemId="a01" listType="numbered">Two</paragraph>'
			);
		} );

		it( 'doesn\'t insert "listSeparator" element between two different lists in model', () => {
			editor.setData(
				'<ol>' +
					'<li>One</li>' +
				'</ol>' +
				'<ul>' +
					'<li>Two</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="numbered">One</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Two</paragraph>'
			);
		} );

		it( 'should not fail if "listSeparator" is not allowed to be inserted', () => {
			model.schema.register( 'customContainer', {
				allowChildren: 'paragraph',
				allowWhere: '$block',
				isLimit: true
			} );

			editor.conversion.elementToElement( {
				model: 'customContainer',
				view: 'custom-block'
			} );

			editor.setData(
				'<custom-block>' +
					'<ul>' +
						'<li>One</li>' +
					'</ul>' +
					'<ul>' +
						'<li>Two</li>' +
					'</ul>' +
				'</custom-block>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<customContainer>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">One</paragraph>' +
					'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Two</paragraph>' +
				'</customContainer>'
			);
		} );
	} );

	describe( 'editingDowncast', () => {
		it( 'inserts a "div.ck-list-separator" between two "ul" lists in view', () => {
			editor.setData(
				'<ul>' +
					'<li>One</li>' +
				'</ul>' +
				'<ul>' +
					'<li>Two</li>' +
				'</ul>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">One</span></li>' +
				'</ul>' +
				'<div class="ck-hidden ck-list-separator"></div>' +
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">Two</span></li>' +
				'</ul>'
			);
		} );

		it( 'inserts a "div.ck-list-separator" between two "ol" lists in view', () => {
			editor.setData(
				'<ol>' +
					'<li>One</li>' +
				'</ol>' +
				'<ol>' +
					'<li>Two</li>' +
				'</ol>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ol>' +
					'<li><span class="ck-list-bogus-paragraph">One</span></li>' +
				'</ol>' +
				'<div class="ck-hidden ck-list-separator"></div>' +
				'<ol>' +
					'<li><span class="ck-list-bogus-paragraph">Two</span></li>' +
				'</ol>'
			);
		} );

		it( 'doesn\'t insert a "div.ck-list-separator" between two different lists in view', () => {
			editor.setData(
				'<ol>' +
					'<li>One</li>' +
				'</ol>' +
				'<ul>' +
					'<li>Two</li>' +
				'</ul>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ol>' +
					'<li><span class="ck-list-bogus-paragraph">One</span></li>' +
				'</ol>' +
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">Two</span></li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'dataDowncast', () => {
		it( 'doesn\'t insert anything between two "ul" lists in output data', () => {
			const data =
				'<ul>' +
					'<li>One</li>' +
				'</ul>' +
				'<ul>' +
					'<li>Two</li>' +
				'</ul>';

			editor.setData( data );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup( data );
		} );

		it( 'doesn\'t insert anything between two "ol" lists in output data', () => {
			const data =
				'<ol>' +
					'<li>One</li>' +
				'</ol>' +
				'<ol>' +
					'<li>Two</li>' +
				'</ol>';

			editor.setData( data );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup( data );
		} );

		it( 'doesn\'t insert anything between two different lists in output data', () => {
			const data =
				'<ol>' +
					'<li>One</li>' +
				'</ol>' +
				'<ul>' +
					'<li>Two</li>' +
				'</ul>';

			editor.setData( data );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup( data );
		} );
	} );
} );

describe( 'AdjacentListsSupport - integrations', () => {
	let editorElement, editor, model;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph,
				List,
				ListProperties,
				AdjacentListsSupport
			]
		} );

		model = editor.model;

		stubUid();
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'works with ListProperties', () => {
		editor.setData(
			'<ul>' +
				'<li>One</li>' +
			'</ul>' +
			'<ul>' +
				'<li>Two</li>' +
			'</ul>'
		);

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<paragraph listIndent="0" listItemId="a00" listStyle="default" listType="bulleted">One</paragraph>' +
			'<listSeparator></listSeparator>' +
			'<paragraph listIndent="0" listItemId="a01" listStyle="default" listType="bulleted">Two</paragraph>'
		);
	} );
} );
