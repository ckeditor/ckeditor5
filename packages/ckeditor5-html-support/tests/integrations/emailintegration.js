/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import { Plugin } from '@ckeditor/ckeditor5-core';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import EmailIntegrationSupport from '../../src/integrations/emailintegration.js';
import DataFilter from '../../src/datafilter.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

describe( 'EmailIntegrationSupport', () => {
	let editor, emailWarningSpy, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should have proper name', () => {
		expect( EmailIntegrationSupport.pluginName ).to.equal( 'EmailIntegrationSupport' );
	} );

	it( 'should require DataFilter', () => {
		expect( EmailIntegrationSupport.requires ).to.deep.equal( [ DataFilter ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmailIntegrationSupport.isOfficialPlugin ).to.be.true;
	} );

	describe( 'check registered elements', () => {
		const UNSUPPORTED_ELEMENTS = [
			'object', 'article', 'details', 'main', 'nav', 'summary',
			'abbr', 'acronym', 'bdi', 'output', 'hgroup',
			'form', 'input', 'button', 'audio', 'canvas',
			'meter', 'progress', 'iframe'
		];

		it( 'should not log warnings if no unsupported elements are registered', async () => {
			editor = await createEditor( dataFilter => {
				dataFilter.allowElement( 'magic' );
			} );

			expect( emailWarningSpy.called ).to.be.false;
		} );

		for ( const element of UNSUPPORTED_ELEMENTS ) {
			it( `should log warning for unsupported "${ element }" element`, async () => {
				editor = await createEditor( dataFilter => {
					dataFilter.allowElement( element );
				} );

				expect( emailWarningSpy.calledOnce ).to.be.true;
				expect( emailWarningSpy.firstCall.args ).to.deep.equal( [
					'email-unsupported-html-element',
					{ element }
				] );
			} );
		}

		it( 'should log multiple warnings for multiple unsupported elements', async () => {
			editor = await createEditor( dataSchema => {
				dataSchema.allowElement( 'form' );
				dataSchema.allowElement( 'input' );
			} );

			expect( emailWarningSpy.calledTwice ).to.be.true;
			expect( emailWarningSpy.firstCall.args ).to.deep.equal( [
				'email-unsupported-html-element',
				{ element: 'form' }
			] );

			expect( emailWarningSpy.secondCall.args ).to.deep.equal( [
				'email-unsupported-html-element',
				{ element: 'input' }
			] );
		} );

		it( 'should log warning for unsupported element only once', async () => {
			editor = await createEditor( dataSchema => {
				dataSchema.allowElement( 'form' );
				dataSchema.allowElement( 'form' );
			} );

			expect( emailWarningSpy.calledOnce ).to.be.true;
		} );
	} );

	async function createEditor( callback ) {
		class EmailIntegrationUtils extends Plugin {
			static get pluginName() {
				return 'EmailIntegrationUtils';
			}

			_logSuppressibleWarning() {}
		}

		class FakeSchemaRegisterPlugin extends Plugin {
			static get pluginName() {
				return 'FakeSchemaRegisterPlugin';
			}

			static get requires() {
				return [ GeneralHtmlSupport, EmailIntegrationUtils ];
			}

			async init() {
				const { plugins } = this.editor;

				const emailUtils = plugins.get( 'EmailIntegrationUtils' );
				const dataFilter = plugins.get( 'DataFilter' );

				emailWarningSpy = sinon.stub( emailUtils, '_logSuppressibleWarning' );

				callback( dataFilter );
			}
		}

		if ( editor ) {
			await editor.destroy();
		}

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmailIntegrationSupport, GeneralHtmlSupport, EmailIntegrationUtils, FakeSchemaRegisterPlugin ]
		} );

		return editor;
	}
} );
