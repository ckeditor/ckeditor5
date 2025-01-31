/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Highlight } from '@ckeditor/ckeditor5-highlight';

import { HighlightEmailIntegration } from '../../src/integrations/highlight.js';
import { EmailIntegrationUtils } from '../../src/emailintegrationutils.js';

describe( 'HighlightEmailIntegration', () => {
	let domElement, editor, warnStub;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		warnStub = sinon.stub( console, 'warn' );
	} );

	afterEach( async () => {
		warnStub.restore();

		domElement.remove();
		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( HighlightEmailIntegration.pluginName ).to.equal( 'HighlightEmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HighlightEmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( HighlightEmailIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should not log warning when Highlight plugin is not available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ HighlightEmailIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when Highlight plugin is available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ HighlightEmailIntegration, EmailIntegrationUtils, Highlight ]
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-plugin' );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ HighlightEmailIntegration, EmailIntegrationUtils, Highlight ],
				email: {
					warnings: {
						suppressAll: true
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when specific warning is suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ HighlightEmailIntegration, EmailIntegrationUtils, Highlight ],
				email: {
					warnings: {
						suppress: [ 'email-unsupported-plugin' ]
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );
