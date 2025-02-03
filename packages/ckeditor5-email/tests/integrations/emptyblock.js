/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Plugin } from '@ckeditor/ckeditor5-core';

import { EmptyBlockIntegration } from '../../src/integrations/emptyblock.js';
import EmailIntegrationUtils from '../../src/emailintegrationutils.js';

describe( 'EmptyBlockIntegration', () => {
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
		expect( EmptyBlockIntegration.pluginName ).to.equal( 'EmptyBlockIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmptyBlockIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( EmptyBlockIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should log warning when EmptyBlock plugin is not available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ EmptyBlockIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-missing-empty-block-plugin' );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ EmptyBlockIntegration, EmailIntegrationUtils ],
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
				plugins: [ EmptyBlockIntegration, EmailIntegrationUtils ],
				email: {
					warnings: {
						suppress: [ 'email-integration-missing-empty-block-plugin' ]
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when warning is suppressed via function', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ EmptyBlockIntegration, EmailIntegrationUtils ],
				email: {
					warnings: {
						suppress: warningCode => warningCode === 'email-integration-missing-empty-block-plugin'
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when EmptyBlock plugin is available', async () => {
			class EmptyBlockStub extends Plugin {
				static get pluginName() {
					return 'EmptyBlock';
				}
			}

			editor = await ClassicEditor.create( domElement, {
				plugins: [ EmptyBlockIntegration, EmailIntegrationUtils, EmptyBlockStub ]
			} );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );
