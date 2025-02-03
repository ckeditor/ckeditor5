/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { SourceEditingIntegration } from '../../src/integrations/sourceediting.js';
import EmailIntegrationUtils from '../../src/emailintegrationutils.js';
import { Plugin } from '@ckeditor/ckeditor5-core';

describe( 'SourceEditingIntegration', () => {
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
		expect( SourceEditingIntegration.pluginName ).to.equal( 'SourceEditingIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SourceEditingIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( SourceEditingIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should log warning when SourceEditing and SourceEditingEnhanced plugins are not available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ SourceEditingIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-missing-source-editing-plugin' );
		} );

		it( 'should not log warning when SourceEditing plugin is available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ SourceEditingIntegration, EmailIntegrationUtils, SourceEditing ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when SourceEditingEnhanced plugin is available', async () => {
			// A dummy plugin to simulate SourceEditingEnhanced, as it fails to load in tests.
			class SourceEditingEnhanced extends Plugin {
				static get pluginName() {
					return 'SourceEditingEnhanced';
				}
			}

			editor = await ClassicEditor.create( domElement, {
				plugins: [ SourceEditingIntegration, EmailIntegrationUtils, SourceEditingEnhanced ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ SourceEditingIntegration, EmailIntegrationUtils ],
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
				plugins: [ SourceEditingIntegration, EmailIntegrationUtils ],
				email: {
					warnings: {
						suppress: [ 'email-missing-source-editing-plugin' ]
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );
