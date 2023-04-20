/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { GeneralHtmlSupport } from '../src';

describe( 'GeneralHtmlSupport', () => {
	let editor, element, dataSchema, generalHtmlSupport;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ GeneralHtmlSupport ]
		} );

		dataSchema = editor.plugins.get( 'DataSchema' );
		generalHtmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'getGhsAttributeNameForElement()', () => {
		beforeEach( () => {
			dataSchema.registerBlockElement( { model: 'def', view: 'def1' } );
			dataSchema.registerBlockElement( { model: 'def', view: 'def2' } );
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def3' } );
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def4' } );
			dataSchema.registerInlineElement( { model: 'htmlObj', view: 'def5', isObject: true } );
		} );

		it( 'should return "htmlAttributes" for block elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def1' ) ).to.equal( 'htmlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def2' ) ).to.equal( 'htmlAttributes' );
		} );

		it( 'should return "htmlAttributes" for inline object elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def5' ) ).to.equal( 'htmlAttributes' );
		} );

		it( 'should return model attribute name for inline elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def3' ) ).to.equal( 'htmlDef' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def4' ) ).to.equal( 'htmlDef' );
		} );

		it( 'should return model attribute name for block elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'td' ) ).to.equal( 'htmlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'th' ) ).to.equal( 'htmlAttributes' );
		} );

		it( 'should return model attribute name for inline elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'ul' ) ).to.equal( 'htmlListAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'ol' ) ).to.equal( 'htmlListAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'li' ) ).to.equal( 'htmlLiAttributes' );
		} );

		it( 'should return model attribute name for block elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'div' ) ).to.equal( 'htmlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'p' ) ).to.equal( 'htmlAttributes' );
		} );

		it( 'should return model attribute name for inline elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'a' ) ).to.equal( 'htmlA' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'strong' ) ).to.equal( 'htmlStrong' );
		} );
	} );
} );
