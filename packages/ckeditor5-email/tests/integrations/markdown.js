/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';

import MarkdownEmailIntegration from '../../src/integrations/markdown.js';
import EmailIntegrationUtils from '../../src/emailintegrationutils.js';

describe( 'MarkdownEmailIntegration', () => {
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
		expect( MarkdownEmailIntegration.pluginName ).to.equal( 'MarkdownEmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MarkdownEmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( MarkdownEmailIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should not log warning when Markdown plugin is not available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MarkdownEmailIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when Markdown plugin is available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MarkdownEmailIntegration, EmailIntegrationUtils, Markdown ]
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-plugin' );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MarkdownEmailIntegration, EmailIntegrationUtils, Markdown ],
				email: {
					logs: {
						suppressAll: true
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when specific warning is suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MarkdownEmailIntegration, EmailIntegrationUtils, Markdown ],
				email: {
					logs: {
						suppress: [ 'email-integration-unsupported-plugin' ]
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );
