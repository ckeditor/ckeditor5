/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { TableScroll } from '../src/tablescroll.js';
import { TableScrollEditing } from '../src/tablescroll/tablescrollediting.js';

describe( 'TableScroll', () => {
	describe( 'plugin definition', () => {
		it( 'should have a name', () => {
			expect( TableScroll.pluginName ).toBe( 'TableScroll' );
		} );

		it( 'should be marked as an official plugin', () => {
			expect( TableScroll.isOfficialPlugin ).toBe( true );
		} );

		it( 'should require TableScrollEditing', () => {
			expect( TableScroll.requires ).toEqual( [ TableScrollEditing ] );
		} );
	} );

	describe( 'as an editor plugin', () => {
		let editor, element;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableScroll, Paragraph ]
			} );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		it( 'should load itself', () => {
			expect( editor.plugins.has( TableScroll ) ).toBe( true );
		} );

		it( 'should load TableScrollEditing', () => {
			expect( editor.plugins.has( TableScrollEditing ) ).toBe( true );
		} );
	} );
} );
