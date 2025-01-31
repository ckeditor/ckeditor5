/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ImageBlock } from '@ckeditor/ckeditor5-image';

import { ImageEmailIntegration } from '../../src/integrations/image.js';
import { EmailIntegrationUtils } from '../../src/emailintegrationutils.js';

describe( 'ImageEmailIntegration', () => {
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
		expect( ImageEmailIntegration.pluginName ).to.equal( 'ImageEmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageEmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( ImageEmailIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should not log warning when ImageBlock plugin is not available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ ImageEmailIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when ImageBlock plugin is available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ ImageEmailIntegration, EmailIntegrationUtils, ImageBlock ]
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-plugin' );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ ImageEmailIntegration, EmailIntegrationUtils, ImageBlock ],
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
				plugins: [ ImageEmailIntegration, EmailIntegrationUtils, ImageBlock ],
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
