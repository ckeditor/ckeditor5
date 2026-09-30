/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Image } from '../../src/image.js';
import { ImageStyle } from '../../src/imagestyle.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Context, onEditorError } from '@ckeditor/ckeditor5-core';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { stubWindowOnError } from '@ckeditor/ckeditor5-core/tests/_utils/stubwindowonerror.js';

describe( 'ImageStyle integration', () => {
	// Covers the reporting path end to end: an error thrown with an editor as its context reaches a
	// registered callback, naming that editor. It does not cover attribution — an error whose context is the
	// editor itself short-circuits in `resolveErrorSource()` and never reaches the graph walk. Telling two
	// editors apart when they share objects is a known stage-1 limitation; ImageStyle does connect them
	// today, so strengthening this test has to wait for #11300.
	describe( 'error reporting', () => {
		let context, editor1, editor2, editorElement1, editorElement2, off;

		beforeEach( async () => {
			stubWindowOnError();

			context = await Context.create();

			editorElement1 = document.createElement( 'div' );
			editorElement2 = document.createElement( 'div' );

			document.body.appendChild( editorElement1 );
			document.body.appendChild( editorElement2 );

			const editorConfig = {
				context,
				plugins: [
					Paragraph, Image, ImageStyle
				],
				image: {
					toolbar: [
						'imageStyle:inline',
						'imageStyle:wrapText',
						'imageStyle:breakText',
						'|',
						'toggleImageCaption',
						'imageTextAlternative'
					]
				}
			};

			editor1 = await ClassicTestEditor.create( editorElement1, editorConfig );
			editor2 = await ClassicTestEditor.create( editorElement2, editorConfig );
		} );

		afterEach( async () => {
			// The reporter is page-level state, so the registration has to go or it leaks into the next test.
			off?.();

			await editor1.destroy();
			await editor2.destroy();
			await context.destroy();

			editorElement1.remove();
			editorElement2.remove();
		} );

		it( 'should report an error to the callback, naming the editor it was thrown with', async () => {
			const sources = [];

			off = onEditorError( ( { source } ) => sources.push( source ) );

			setTimeout( () => throwCKEditorError( 'foo', editor1 ) );

			await waitCycle();

			expect( sources ).toEqual( [ editor1 ] );
		} );
	} );
} );

function throwCKEditorError( name, context ) {
	throw new CKEditorError( name, context );
}

function waitCycle() {
	return new Promise( resolve => setTimeout( resolve ) );
}
