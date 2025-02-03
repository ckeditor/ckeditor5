/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import EmailIntegrationSupport from '../../src/integrations/emailintegration.js';
import DataSchema from '../../src/dataschema.js';
import { EmailIntegrationUtils } from '@ckeditor/ckeditor5-email';
import { Plugin } from '@ckeditor/ckeditor5-core';

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

	it( 'should require DataSchema', () => {
		expect( EmailIntegrationSupport.requires ).to.deep.equal( [ DataSchema ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmailIntegrationSupport.isOfficialPlugin ).to.be.true;
	} );

	describe( 'integration', () => {
		const UNSUPPORTED_ELEMENTS = [
			'object', 'article', 'details', 'main', 'nav', 'summary',
			'abbr', 'acronym', 'bdi', 'output', 'hgroup',
			'form', 'input', 'button', 'audio', 'canvas',
			'meter', 'progress'
		];

		it( 'should not log warnings if no unsupported elements are registered', async () => {
			editor = await createEditor( dataSchema => {
				dataSchema.registerBlockElement( { view: 'div', model: 'div' } );
			} );

			expect( emailWarningSpy.called ).to.be.false;
		} );

		for ( const element of UNSUPPORTED_ELEMENTS ) {
			it( `should log warning for unsupported "${ element }" element`, async () => {
				editor = await createEditor( dataSchema => {
					dataSchema.registerBlockElement( { view: element, model: element } );
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
				dataSchema.registerBlockElement( { view: 'form', model: 'form' } );
				dataSchema.registerBlockElement( { view: 'input', model: 'input' } );
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
	} );

	async function createEditor( callback ) {
		class FakeSchemaRegisterPlugin extends Plugin {
			static get pluginName() {
				return 'FakeSchemaRegisterPlugin';
			}

			static get requires() {
				return [ DataSchema, EmailIntegrationUtils ];
			}

			async init() {
				const { plugins } = this.editor;

				const emailUtils = plugins.get( 'EmailIntegrationUtils' );
				const dataSchema = plugins.get( 'DataSchema' );

				emailWarningSpy = sinon.stub( emailUtils, '_logSuppressibleWarning' );

				dataSchema._definitions = [];

				callback( dataSchema );
			}
		}

		if ( editor ) {
			await editor.destroy();
		}

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmailIntegrationSupport, DataSchema, EmailIntegrationUtils, FakeSchemaRegisterPlugin ]
		} );

		return editor;
	}
} );
