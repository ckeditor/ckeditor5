/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import StyleUtils from '../src/styleutils.js';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

describe( 'StyleUtils', () => {
	let editor, element, styleUtils, dataSchema;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ StyleUtils, GeneralHtmlSupport ]
		} );

		styleUtils = editor.plugins.get( StyleUtils );
		dataSchema = editor.plugins.get( 'DataSchema' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StyleUtils.pluginName ).to.equal( 'StyleUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StyleUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StyleUtils.isPremiumPlugin ).to.be.false;
	} );

	describe( 'normalizeConfig()', () => {
		it( 'should output empty lists for inline and block styles if there is no styles configured', () => {
			const styleDefinitions = styleUtils.normalizeConfig( dataSchema );

			expect( styleDefinitions ).to.deep.equal( {
				block: [],
				inline: []
			} );
		} );

		it( 'should normalize block style', () => {
			sinon.stub( styleUtils, 'getStylePreview' ).callsFake( definition => ( {
				fake: 'preview for ' + definition.name
			} ) );

			const styleDefinitions = styleUtils.normalizeConfig( dataSchema, [ {
				name: 'Foo',
				element: 'p',
				classes: 'bar'
			} ] );

			expect( styleDefinitions ).to.deep.equal( {
				block: [
					{
						name: 'Foo',
						element: 'p',
						classes: 'bar',

						isBlock: true,
						modelElements: [
							'paragraph',
							'htmlP'
						],
						previewTemplate: {
							fake: 'preview for Foo'
						}
					}
				],
				inline: []
			} );
		} );

		it( 'should normalize inline style', () => {
			sinon.stub( styleUtils, 'getStylePreview' ).callsFake( definition => ( {
				fake: 'preview for ' + definition.name
			} ) );

			const styleDefinitions = styleUtils.normalizeConfig( dataSchema, [ {
				name: 'Bar',
				element: 'acronym',
				classes: 'foo'
			} ] );

			expect( styleDefinitions ).to.deep.equal( {
				inline: [
					{
						name: 'Bar',
						element: 'acronym',
						classes: 'foo',

						ghsAttributes: [
							'htmlAcronym'
						],
						previewTemplate: {
							fake: 'preview for Bar'
						}
					}
				],
				block: []
			} );
		} );

		it( 'should normalize inline style that applies to model element', () => {
			sinon.stub( styleUtils, 'getStylePreview' ).callsFake( definition => ( {
				fake: 'preview for ' + definition.name
			} ) );

			const styleDefinitions = styleUtils.normalizeConfig( dataSchema, [ {
				name: 'Bar',
				element: 'figure',
				classes: 'foo'
			} ] );

			expect( styleDefinitions ).to.deep.equal( {
				block: [
					{
						name: 'Bar',
						element: 'figure',
						classes: 'foo',
						isBlock: true,
						modelElements: [
							'htmlFigure',
							'table',
							'imageBlock'
						],
						previewTemplate: {
							fake: 'preview for Bar'
						}
					}
				],
				inline: []
			} );
		} );
	} );

	describe( 'getStylePreview()', () => {
		it( 'should build template definition for style', () => {
			const preview = styleUtils.getStylePreview( {
				name: 'Foo',
				element: 'p',
				classes: 'bar'
			}, [ { text: 'abc' } ] );

			expect( preview ).to.deep.equal( {
				tag: 'p',
				attributes: {
					class: 'bar'
				},
				children: [
					{ text: 'abc' }
				]
			} );
		} );

		it( 'should use passed children', () => {
			const children = [ { text: 'abc' } ];
			const preview = styleUtils.getStylePreview( {
				name: 'Foo',
				element: 'p',
				classes: 'bar'
			}, children );

			expect( preview ).to.deep.equal( {
				tag: 'p',
				attributes: {
					class: 'bar'
				},
				children: [
					{ text: 'abc' }
				]
			} );

			expect( preview.children ).to.equal( children );
		} );

		it( 'should render non-previewable styles as div', () => {
			const preview = styleUtils.getStylePreview( {
				name: 'Foo',
				element: 'li',
				classes: 'bar'
			}, [ { text: 'abc' } ] );

			expect( preview ).to.deep.equal( {
				tag: 'div',
				attributes: {
					class: 'bar'
				},
				children: [
					{ text: 'abc' }
				]
			} );
		} );
	} );
} );
