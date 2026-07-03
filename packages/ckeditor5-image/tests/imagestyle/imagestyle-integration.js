/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Image } from '../../src/image.js';
import { ImageStyle } from '../../src/imagestyle.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { Context } from '@ckeditor/ckeditor5-core';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'ImageStyle integration', () => {
	describe( 'with Watchdog plugin', () => {
		let editorElement1, editorElement2, editorConfig;
		let watchdog;
		let originalErrorHandler;

		beforeEach( async () => {
			watchdog = new ContextWatchdog( Context );
			await watchdog.create();

			editorConfig = {
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

			editorElement1 = document.createElement( 'div' );
			editorElement2 = document.createElement( 'div' );

			document.body.appendChild( editorElement1 );
			document.body.appendChild( editorElement2 );

			originalErrorHandler = window.onerror;
			window.onerror = vi.fn();
		} );

		afterEach( async () => {
			await watchdog.destroy();

			window.onerror = originalErrorHandler;

			editorElement1.remove();
			editorElement2.remove();
		} );

		it( 'should only restart the editor in which the error occurred', async () => {
			await watchdog.add( [ {
				id: 'editor1',
				type: 'editor',
				creator: ( element, config ) => ClassicTestEditor.create( element, config ),
				sourceElementOrData: editorElement1,
				config: editorConfig
			}, {
				id: 'editor2',
				type: 'editor',
				creator: ( element, config ) => ClassicTestEditor.create( element, config ),
				sourceElementOrData: editorElement2,
				config: editorConfig
			} ] );

			const oldContext = watchdog.context;

			const editorWatchdog1 = watchdog._getWatchdog( 'editor1' );
			const editorWatchdog2 = watchdog._getWatchdog( 'editor2' );

			const oldEditor1 = watchdog.getItem( 'editor1' );
			const oldEditor2 = watchdog.getItem( 'editor2' );

			const mainWatchdogRestartSpy = vi.fn();
			const editorWatchdog1RestartSpy = vi.fn();
			const editorWatchdog2RestartSpy = vi.fn();

			watchdog.on( 'restart', mainWatchdogRestartSpy );
			editorWatchdog1.on( 'restart', editorWatchdog1RestartSpy );
			editorWatchdog2.on( 'restart', editorWatchdog2RestartSpy );

			// Throw an error from editor1.
			setTimeout( () => throwCKEditorError( 'foo', editorWatchdog1.editor ) );

			await waitCycle();

			// Only editor1 should be restarted.
			expect( editorWatchdog1RestartSpy ).toHaveBeenCalledTimes( 1 );
			expect( editorWatchdog2RestartSpy ).toHaveBeenCalledTimes( 0 );
			expect( mainWatchdogRestartSpy ).toHaveBeenCalledTimes( 0 );

			expect( oldEditor1 ).not.toBe( editorWatchdog1.editor );
			expect( oldEditor2 ).toBe( editorWatchdog2.editor );

			expect( watchdog.context ).toBe( oldContext );
		} );
	} );
} );

function throwCKEditorError( name, context ) {
	throw new CKEditorError( name, context );
}

function waitCycle() {
	return new Promise( resolve => setTimeout( resolve ) );
}
