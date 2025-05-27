/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Image from '../../src/image.js';
import ImageStyle from '../../src/imagestyle.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog.js';
import Context from '@ckeditor/ckeditor5-core/src/context.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

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
			window.onerror = sinon.spy();
		} );

		afterEach( async () => {
			await watchdog.destroy();

			window.onerror = originalErrorHandler;

			editorElement1.remove();
			editorElement2.remove();

			sinon.restore();
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

			const mainWatchdogRestartSpy = sinon.spy();
			const editorWatchdog1RestartSpy = sinon.spy();
			const editorWatchdog2RestartSpy = sinon.spy();

			watchdog.on( 'restart', mainWatchdogRestartSpy );
			editorWatchdog1.on( 'restart', editorWatchdog1RestartSpy );
			editorWatchdog2.on( 'restart', editorWatchdog2RestartSpy );

			// Throw an error from editor1.
			setTimeout( () => throwCKEditorError( 'foo', editorWatchdog1.editor ) );

			await waitCycle();

			// Only editor1 should be restarted.
			expect( editorWatchdog1RestartSpy.callCount ).to.equal( 1 );
			expect( editorWatchdog2RestartSpy.callCount ).to.equal( 0 );
			expect( mainWatchdogRestartSpy.callCount ).to.equal( 0 );

			expect( oldEditor1 ).to.not.equal( editorWatchdog1.editor );
			expect( oldEditor2 ).to.equal( editorWatchdog2.editor );

			expect( watchdog.context ).to.equal( oldContext );
		} );
	} );
} );

function throwCKEditorError( name, context ) {
	throw new CKEditorError( name, context );
}

function waitCycle() {
	return new Promise( resolve => setTimeout( resolve ) );
}
