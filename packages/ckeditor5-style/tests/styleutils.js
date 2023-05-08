/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import StyleUtils from '../src/styleutils';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Element } from '@ckeditor/ckeditor5-engine';
import StyleEditing from '../src/styleediting';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Table } from '@ckeditor/ckeditor5-table';

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

	describe( 'Attribute fixing', () => {
		const pStyle = {
			name: 'Test p style',
			element: 'p',
			classes: [ 'test-p-style' ]
		};
		const h1Style = {
			name: 'Test h2 style',
			element: 'h2',
			classes: [ 'test-h2-style' ]
		};
		const h3Style = {
			name: 'Test h4 style',
			element: 'h4',
			classes: [ 'test-h4-style' ]
		};
		const thStyle = {
			name: 'Test th style',
			element: 'th',
			classes: [ 'test-th-style' ]
		};
		const tdStyle = {
			name: 'Test td style',
			element: 'td',
			classes: [ 'test-td-style' ]
		};

		const styleDefinitions = [
			pStyle,
			h1Style,
			h3Style,
			thStyle,
			tdStyle
		];

		let editor2, styleUtils2, rootElement, normalizedDefinitions;

		beforeEach( async () => {
			rootElement = document.createElement( 'div' );
			document.body.appendChild( rootElement );

			editor2 = await ClassicTestEditor.create( rootElement, {
				plugins: [ GeneralHtmlSupport, StyleEditing, Paragraph, Heading, Table ],
				style: {
					definitions: styleDefinitions
				}
			} );

			styleUtils2 = editor2.plugins.get( StyleUtils );
			normalizedDefinitions = styleUtils2.normalizeConfig( editor2.plugins.get( 'DataSchema' ), styleDefinitions ).block;
		} );

		afterEach( async () => {
			rootElement.remove();

			await editor2.destroy();
		} );

		describe( 'checkElement()', () => {
			it( 'smoke test #1', () => {
				const element = new Element( 'paragraph' );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'smoke test #2', () => {
				const element = new Element( 'paragraph', { 'htmlAttributes': { 'something-else-than-classes': true } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'smoke test #3', () => {
				const element = new Element( 'paragraph', { 'htmlAttributes': { 'classes': [ 'unknown-class' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.be.empty; // or not?
			} );

			it( 'test #1 p with p-style', () => {
				const element = new Element( 'paragraph', { 'htmlAttributes': { 'classes': [ 'test-p-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'test #2 h2 with h2-style', () => {
				const element = new Element( 'heading1', { 'htmlAttributes': { 'classes': [ 'test-h2-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'test #3 h4 with h4-style', () => {
				const element = new Element( 'heading3', { 'htmlAttributes': { 'classes': [ 'test-h4-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'test table #1 td with td-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-td-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', undefined, new Element( 'tableRow', undefined, cell ) );

				expect( styleUtils2.checkElement( cell, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'test table #2 th with th-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-th-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', { 'headingRows': 1 }, new Element( 'tableRow', undefined, cell ) );

				expect( styleUtils2.checkElement( cell, normalizedDefinitions ) ).to.be.empty;
			} );

			it( 'test #4 h3 with h4-style', () => {
				const element = new Element( 'heading2', { 'htmlAttributes': { 'classes': [ 'test-h4-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.not.be.empty;
			} );

			it( 'test #5 p with h2-style', () => {
				const element = new Element( 'paragraph', { 'htmlAttributes': { 'classes': [ 'test-h2-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.not.be.empty;
			} );

			it( 'test #6 h4 with h2-style', () => {
				const element = new Element( 'heading3', { 'htmlAttributes': { 'classes': [ 'test-h2-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.not.be.empty;
			} );

			it( 'test #7 h4 with p-style', () => {
				const element = new Element( 'heading3', { 'htmlAttributes': { 'classes': [ 'test-p-style' ] } } );

				expect( styleUtils2.checkElement( element, normalizedDefinitions ) ).to.not.be.empty;
			} );

			it( 'test table #3 td with th-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-th-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', undefined, new Element( 'tableRow', undefined, cell ) );

				expect( styleUtils2.checkElement( cell, normalizedDefinitions ) ).to.not.be.empty;
			} );

			it( 'test table #4 th with td-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-td-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', { 'headingRows': 1 }, new Element( 'tableRow', undefined, cell ) );

				expect( styleUtils2.checkElement( cell, normalizedDefinitions ) ).to.not.be.empty;
			} );
		} );

		describe( 'fixElement()', () => {
			it( 'test #1 p with p-style', () => {
				const element = new Element( 'paragraph', { 'htmlAttributes': { 'classes': [ 'test-p-style' ] } } );

				styleUtils2.fixElement( element, normalizedDefinitions );

				expect( element.getAttribute( 'htmlAttributes' ).classes.length ).to.equal( 1 );
				expect( element.getAttribute( 'htmlAttributes' ).classes[ 0 ] ).to.equal( 'test-p-style' );
			} );

			it( 'test #2 h2 with h2-style', () => {
				const element = new Element( 'heading1', { 'htmlAttributes': { 'classes': [ 'test-h2-style' ] } } );

				styleUtils2.fixElement( element, normalizedDefinitions );

				expect( element.getAttribute( 'htmlAttributes' ).classes.length ).to.equal( 1 );
				expect( element.getAttribute( 'htmlAttributes' ).classes[ 0 ] ).to.equal( 'test-h2-style' );
			} );

			it( 'test table #1 td with td-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-td-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', undefined, new Element( 'tableRow', undefined, cell ) );

				styleUtils2.fixElement( cell, normalizedDefinitions );

				expect( cell.getAttribute( 'htmlAttributes' ).classes.length ).to.equal( 1 );
				expect( cell.getAttribute( 'htmlAttributes' ).classes[ 0 ] ).to.equal( 'test-td-style' );
			} );

			it( 'test table #2 th with th-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-th-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', { 'headingRows': 1 }, new Element( 'tableRow', undefined, cell ) );

				styleUtils2.fixElement( cell, normalizedDefinitions );

				expect( cell.getAttribute( 'htmlAttributes' ).classes.length ).to.equal( 1 );
				expect( cell.getAttribute( 'htmlAttributes' ).classes[ 0 ] ).to.equal( 'test-th-style' );
			} );

			it( 'test #3 h3 with h4-style', () => {
				const element = new Element( 'heading2', { 'htmlAttributes': { 'classes': [ 'test-h4-style' ] } } );

				styleUtils2.fixElement( element, normalizedDefinitions );

				expect( element.getAttribute( 'htmlAttributes' ).classes ).to.be.empty;
			} );

			it( 'test #4 p with h2-style', () => {
				const element = new Element( 'paragraph', { 'htmlAttributes': { 'classes': [ 'test-h2-style' ] } } );

				styleUtils2.fixElement( element, normalizedDefinitions );

				expect( element.getAttribute( 'htmlAttributes' ).classes ).to.be.empty;
			} );

			it( 'test #5 h4 with p-style', () => {
				const element = new Element( 'heading3', { 'htmlAttributes': { 'classes': [ 'test-p-style' ] } } );

				styleUtils2.fixElement( element, normalizedDefinitions );

				expect( element.getAttribute( 'htmlAttributes' ).classes ).to.be.empty;
			} );

			it( 'test table #3 td with th-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-th-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', undefined, new Element( 'tableRow', undefined, cell ) );

				styleUtils2.fixElement( cell, normalizedDefinitions );

				expect( cell.getAttribute( 'htmlAttributes' ).classes ).to.be.empty;
			} );

			it( 'test table #4 th with td-style', () => {
				const cell = new Element( 'tableCell', { 'htmlAttributes': { 'classes': [ 'test-td-style' ] } } );
				// eslint-disable-next-line no-unused-vars
				const table = new Element( 'table', { 'headingRows': 1 }, new Element( 'tableRow', undefined, cell ) );

				styleUtils2.fixElement( cell, normalizedDefinitions );

				expect( cell.getAttribute( 'htmlAttributes' ).classes ).to.be.empty;
			} );

			it( 'test #5 h4 with p-style, h2-style and h4-style', () => {
				const element = new Element(
					'heading3',
					{ 'htmlAttributes': { 'classes': [ 'test-p-style', 'test-h2-style', 'test-h4-style' ] } }
				);

				styleUtils2.fixElement( element, normalizedDefinitions );

				expect( element.getAttribute( 'htmlAttributes' ).classes.length ).to.equal( 1 );
				expect( element.getAttribute( 'htmlAttributes' ).classes[ 0 ] ).to.equal( 'test-h4-style' );
			} );
		} );
	} );
} );
