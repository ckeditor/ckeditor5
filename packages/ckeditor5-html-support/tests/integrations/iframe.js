/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { GeneralHtmlSupport } from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import { _getViewData } from '@ckeditor/ckeditor5-engine';
import { IframeElementSupport } from '../../src/integrations/iframe.js';

describe( 'IframeElementSupport', () => {
	let editor, editorElement, model, dataFilter;

	async function createEditor( config = {} ) {
		if ( editor ) {
			await editor.destroy();
		}

		const editorConfig = {
			plugins: [ Paragraph, GeneralHtmlSupport ],
			...config
		};

		editor = await ClassicTestEditor.create( editorElement, editorConfig );
		model = editor.model;
		dataFilter = editor.plugins.get( 'DataFilter' );
		dataFilter.allowElement( 'iframe' );

		return editor;
	}

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return createEditor();
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
		editor = null;
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( IframeElementSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( IframeElementSupport.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'IframeElementSupport' ) ).to.be.true;
	} );

	it( 'should allow attributes but not modify them in data pipeline', () => {
		dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

		editor.setData( '<p><iframe data-foo="bar"></iframe></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><htmlIframe htmlContent="" htmlIframeAttributes="(1)"></htmlIframe></paragraph>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'bar'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><iframe data-foo="bar"></iframe></p>' );
	} );

	it( 'should allow classes', () => {
		dataFilter.allowAttributes( { name: 'iframe', classes: true } );

		editor.setData( '<p><iframe class="foo bar"></iframe></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><htmlIframe htmlContent="" htmlIframeAttributes="(1)"></htmlIframe></paragraph>',
			attributes: {
				1: {
					classes: [ 'foo', 'bar' ]
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><iframe class="foo bar"></iframe></p>' );
	} );

	it( 'should allow styles', () => {
		dataFilter.allowAttributes( { name: 'iframe', styles: true } );

		editor.setData( '<p><iframe style="width: 100px; height: 200px;"></iframe></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><htmlIframe htmlContent="" htmlIframeAttributes="(1)"></htmlIframe></paragraph>',
			attributes: {
				1: {
					styles: {
						width: '100px',
						height: '200px'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<p><iframe style="height:200px;width:100px;"></iframe></p>'
		);
	} );

	it( 'should disallow certain attributes', () => {
		dataFilter.allowAttributes( { name: 'iframe', attributes: true } );
		dataFilter.disallowAttributes( { name: 'iframe', attributes: [ 'data-foo' ] } );

		editor.setData( '<p><iframe data-foo="bar"></iframe></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><htmlIframe htmlContent=""></htmlIframe></paragraph>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<p><iframe></iframe></p>' );
	} );

	it( 'should disallow certain classes', () => {
		dataFilter.allowAttributes( { name: 'iframe', classes: true } );
		dataFilter.disallowAttributes( { name: 'iframe', classes: [ 'foo' ] } );

		editor.setData( '<p><iframe class="foo bar"></iframe></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><htmlIframe htmlContent="" htmlIframeAttributes="(1)"></htmlIframe></paragraph>',
			attributes: {
				1: {
					classes: [ 'bar' ]
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><iframe class="bar"></iframe></p>' );
	} );

	it( 'should disallow certain styles', () => {
		dataFilter.allowAttributes( { name: 'iframe', styles: true } );
		dataFilter.disallowAttributes( { name: 'iframe', styles: [ 'width' ] } );

		editor.setData( '<p><iframe style="width: 100px; height: 200px;"></iframe></p>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<paragraph><htmlIframe htmlContent="" htmlIframeAttributes="(1)"></htmlIframe></paragraph>',
			attributes: {
				1: {
					styles: {
						height: '200px'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<p><iframe style="height:200px;"></iframe></p>' );
	} );

	it( 'should not remove allow-scripts from sandbox attribute in data pipeline', () => {
		dataFilter.allowElement( 'iframe' );
		dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

		editor.setData( '<p><iframe sandbox="allow-scripts"></iframe></p>' );

		expect( editor.getData() ).to.equal( '<p><iframe sandbox="allow-scripts"></iframe></p>' );
	} );

	it( 'should not remove allow-scripts from sandbox attribute while keeping other values in data pipeline', () => {
		dataFilter.allowElement( 'iframe' );
		dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

		editor.setData( '<p><iframe sandbox="allow-scripts allow-same-origin"></iframe></p>' );

		expect( editor.getData() ).to.equal(
			'<p><iframe sandbox="allow-scripts allow-same-origin"></iframe></p>'
		);
	} );

	describe( 'editing downcast', () => {
		beforeEach( async () => {
			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );
		} );

		it( 'should add default sandbox attribute (empty) to iframe with src in editing view', () => {
			editor.setData( '<p><iframe></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
				'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
					'<iframe class="html-object-embed__content" sandbox=""></iframe>' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should filter out sandbox values not in allowed config (empty by default)', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: [ 'allow-forms', 'allow-popups' ]
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );
			editor.setData( '<p><iframe sandbox="allow-scripts allow-popups"></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
				'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
					'<iframe class="html-object-embed__content" sandbox="allow-popups"></iframe>' +
				'</span>' +
			'</p>'
			);
		} );

		it( 'should not override empty sandbox attribute', () => {
			editor.setData( '<p><iframe sandbox=""></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox=""></iframe>' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should deduplicate upcasted sandbox values', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: [ 'allow-forms' ]
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );
			editor.setData( '<p><iframe sandbox="allow-forms allow-forms"></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox="allow-forms"></iframe>' +
					'</span>' +
				'</p>'
			);
		} );
	} );

	describe( 'configuration', () => {
		beforeEach( async () => {
			await editor.destroy();
		} );

		it( 'should respect custom sandbox config', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: [ 'allow-forms', 'allow-popups' ]
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			editor.setData( '<p><iframe></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox="allow-forms allow-popups">' +
						'</iframe>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal( '<p><iframe></iframe></p>' );

			editorElement.remove();
		} );

		it( 'should filter sandbox values based on custom config', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: [ 'allow-forms' ]
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			editor.setData( '<p><iframe sandbox="allow-forms allow-scripts"></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox="allow-forms"></iframe>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><iframe sandbox="allow-forms allow-scripts"></iframe></p>'
			);

			editorElement.remove();
		} );

		it( 'should disable sandbox enforcement when config is set to false', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: false
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			editor.setData( '<p><iframe></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content"></iframe>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal( '<p><iframe></iframe></p>' );

			editorElement.remove();
		} );

		it( 'should not modify sandbox attribute when config is set to false', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: false
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			editor.setData( '<p><iframe sandbox="allow-scripts allow-same-origin"></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox="allow-scripts allow-same-origin">' +
						'</iframe>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><iframe sandbox="allow-scripts allow-same-origin"></iframe></p>'
			);

			editorElement.remove();
		} );

		it( 'should enforce empty sandbox when config is set to true', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: true
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			editor.setData( '<p><iframe></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox=""></iframe>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal( '<p><iframe></iframe></p>' );

			editorElement.remove();
		} );

		it( 'should filter out all sandbox values when config is set to true', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: true
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			editor.setData( '<p><iframe sandbox="allow-scripts allow-same-origin"></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
					'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
						'<iframe class="html-object-embed__content" sandbox=""></iframe>' +
					'</span>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><iframe sandbox="allow-scripts allow-same-origin"></iframe></p>'
			);

			editorElement.remove();
		} );

		it( 'should not allow changing config at runtime (config.set)', async () => {
			await createEditor();

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			const initialConfig = editor.config.get( 'htmlSupport.htmlIframeSandbox' );

			expect( initialConfig ).to.be.equal( true );

			editor.config.set( 'htmlSupport.htmlIframeSandbox', [ 'allow-forms' ] );
			editor.setData( '<p><iframe></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
				'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
					'<iframe class="html-object-embed__content" sandbox="">' +
						'</iframe>' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should not allow changing config at runtime (push)', async () => {
			await createEditor( {
				htmlSupport: {
					htmlIframeSandbox: [ 'allow-forms' ]
				}
			} );

			dataFilter.allowAttributes( { name: 'iframe', attributes: true } );

			const initialConfig = editor.config.get( 'htmlSupport.htmlIframeSandbox' );

			expect( initialConfig ).to.be.deep.equal( [ 'allow-forms' ] );

			initialConfig.push( 'allow-scripts' );
			editor.setData( '<p><iframe sandbox="allow-scripts allow-forms"></iframe></p>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>' +
				'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
					'<iframe class="html-object-embed__content" sandbox="allow-forms">' +
						'</iframe>' +
					'</span>' +
				'</p>'
			);
		} );
	} );
} );
