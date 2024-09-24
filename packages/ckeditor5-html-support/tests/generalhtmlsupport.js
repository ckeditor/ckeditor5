/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { GeneralHtmlSupport } from '../src/index.js';

describe( 'GeneralHtmlSupport', () => {
	let editor, element, dataSchema, generalHtmlSupport;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, GeneralHtmlSupport ]
		} );

		dataSchema = editor.plugins.get( 'DataSchema' );
		generalHtmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'getGhsAttributesForElement', () => {
		let dataFilter;

		beforeEach( () => {
			dataFilter = editor.plugins.get( 'DataFilter' );
			dataFilter.loadAllowedConfig( [ {
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			} ] );
		} );

		it( 'should return map of attributes for block elements', () => {
			editor.setData( '<p style="color: red" data-abc="123">foo bar</p>' );

			const paragraph = editor.model.document.getRoot().getChild( 0 );
			const attributes = generalHtmlSupport.getGhsAttributesForElement( paragraph );

			expect( attributes.size ).to.equal( 1 );
			expect( attributes.get( 'htmlPAttributes' ) ).to.deep.equal( {
				styles: {
					color: 'red'
				},
				attributes: {
					'data-abc': '123'
				}
			} );
		} );
	} );

	describe( 'getGhsAttributeNameForElement()', () => {
		beforeEach( () => {
			dataSchema.registerBlockElement( { model: 'def', view: 'def1' } );
			dataSchema.registerBlockElement( { model: 'def', view: 'def2' } );
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def3' } );
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def4' } );
			dataSchema.registerInlineElement( { model: 'htmlObj', view: 'def5', isObject: true } );
		} );

		it( 'should return "htmlXAttributes" for block elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def1' ) ).to.equal( 'htmlDef1Attributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def2' ) ).to.equal( 'htmlDef2Attributes' );
		} );

		it( 'should return "htmlXAttributes" for inline object elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def5' ) ).to.equal( 'htmlDef5Attributes' );
		} );

		it( 'should return model attribute name for inline elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def3' ) ).to.equal( 'htmlDef' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def4' ) ).to.equal( 'htmlDef' );
		} );

		it( 'should return model attribute name for block elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'td' ) ).to.equal( 'htmlTdAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'th' ) ).to.equal( 'htmlThAttributes' );
		} );

		it( 'should return model attribute name for list elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'ul' ) ).to.equal( 'htmlUlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'ol' ) ).to.equal( 'htmlOlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'li' ) ).to.equal( 'htmlLiAttributes' );
		} );

		it( 'should return model attribute name for block elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'div' ) ).to.equal( 'htmlDivAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'p' ) ).to.equal( 'htmlPAttributes' );
		} );

		it( 'should return model attribute name for inline elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'a' ) ).to.equal( 'htmlA' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'strong' ) ).to.equal( 'htmlStrong' );
		} );
	} );
} );
