/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { List } from '@ckeditor/ckeditor5-list';

import { ListEmailIntegration } from '../../src/integrations/list.js';
import EmailIntegrationUtils from '../../src/emailintegrationutils.js';

describe( 'ListEmailIntegration', () => {
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
		expect( ListEmailIntegration.pluginName ).to.equal( 'ListEmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListEmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( ListEmailIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should not log warning when reversed list is not enabled', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ ListEmailIntegration, EmailIntegrationUtils, List ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when reversed list is enabled', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ ListEmailIntegration, EmailIntegrationUtils, List ],
				list: {
					properties: {
						reversed: true
					}
				}
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-reversed-list' );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ ListEmailIntegration, EmailIntegrationUtils, List ],
				list: {
					properties: {
						reversed: true
					}
				},
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
				plugins: [ ListEmailIntegration, EmailIntegrationUtils, List ],
				list: {
					properties: {
						reversed: true
					}
				},
				email: {
					warnings: {
						suppress: [ 'email-unsupported-reversed-list' ]
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );
