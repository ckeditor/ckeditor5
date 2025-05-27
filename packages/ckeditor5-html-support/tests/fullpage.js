/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { FullPage, HtmlComment, HtmlPageDataProcessor } from '../src/index.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'FullPage', () => {
	let editor;

	testUtils.createSinonSandbox();

	afterEach( async () => {
		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'has proper name', () => {
		expect( FullPage.pluginName ).to.equal( 'FullPage' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FullPage.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FullPage.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set editor.data.processor', async () => {
		await createEditor( '' );

		expect( editor.data.processor ).to.be.an.instanceof( HtmlPageDataProcessor );
	} );

	it( 'should preserve full page content', async () => {
		const content =
			'<?xml version="1.0" encoding="UTF-8"?>\n' +
			'<!DOCTYPE html>\n' +
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (without doctype and xml declaration)', async () => {
		const content =
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (without doctype)', async () => {
		const content =
			'<?xml version="1.0" encoding="UTF-8"?>\n' +
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (without xml declaration)', async () => {
		const content =
			'<!DOCTYPE html>\n' +
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should not wrap data if there was no full page on input', async () => {
		const content = '<p>foo</p><p>bar</p>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (disable content trimming)', async () => {
		const content =
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>&nbsp;</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (disable content trimming, with options passed to getData)', async () => {
		const content =
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>&nbsp;</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData( {} ) ).to.equal( content );
	} );

	it( 'should preserve full page content after editor.setData() call with other data', async () => {
		await createEditor(
			'<!DOCTYPE html>\n' +
			'<html>' +
				'<head><title>Original page</title></head>' +
					'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>'
		);

		const content =
			'<?xml version="1.0" encoding="UTF-8"?>\n' +
			'<html>' +
				'<head><title>Replaced content</title></head>' +
				'<body style="background: blue">' +
					'<p>123</p>' +
				'</body>' +
			'</html>';

		editor.setData( content );

		expect( editor.getData() ).to.equal( content );
	} );

	describe( 'clipboard integration', () => {
		it( 'should not apply page data while pasting', async () => {
			await createEditor( '<p></p><p>test</p>' );

			pasteHtml( editor,
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Pasted page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p><p>test</p>' );
		} );

		it( 'should not apply page data while copying', async () => {
			await createEditor(
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);

			editor.model.change( writer => writer.setSelection( editor.model.document.getRoot(), 'in' ) );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {}
			};
			editor.editing.view.document.fire( 'copy', data );

			expect( data.dataTransfer.getData( 'text/html' ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		function pasteHtml( editor, html ) {
			const data = {
				dataTransfer: createDataTransfer(),
				stopPropagation() {},
				preventDefault() {}
			};

			data.dataTransfer.setData( 'text/html', html );
			editor.editing.view.document.fire( 'paste', data );
		}

		function createDataTransfer() {
			const store = new Map();

			return {
				setData( type, data ) {
					store.set( type, data );
				},

				getData( type ) {
					return store.get( type );
				}
			};
		}
	} );

	describe( 'config', () => {
		beforeEach( () => {
			sinon.stub( console, 'warn' );
		} );

		describe( 'htmlSupport.fullPage.allowRenderStylesFromHead', () => {
			it( 'should be set to `false` by default', async () => {
				await createEditor( '' );

				const fullPage = editor.config.get( 'htmlSupport.fullPage' );

				expect( fullPage.allowRenderStylesFromHead ).to.equal( false );
			} );

			it( 'should allow to extract and append `<style>` tag from editor content to the document `<head>`', async () => {
				const content =
					'<html>' +
						'<head>' +
							'<title>Testing full page</title>' +
							'<style>p { color: red; }</style>' +
						'</head>' +
						'<body>' +
							'<p>foo</p><p>bar</p>' +
						'</body>' +
					'</html>';

				const config = {
					htmlSupport: {
						fullPage: {
							allowRenderStylesFromHead: true
						}
					}
				};

				await createEditor( content, config );

				expect( editor.getData() ).to.equal( content );
				expect( document.querySelectorAll( 'style[data-full-page-style-id]' ) ).to.have.length( 1 );

				const stylesheet = document.querySelectorAll( 'style[data-full-page-style-id]' )[ 0 ];

				expect( stylesheet.textContent ).to.equal( 'p { color: red; }' );
				expect( stylesheet.getAttribute( 'data-full-page-style-id' ) ).to.equal( editor.id );
			} );

			it( 'should remove previously attached `<style>` tag after update the editor content', async () => {
				const content =
					'<html>' +
						'<head>' +
							'<title>Testing full page</title>' +
							'<style>p { color: red; }</style>' +
						'</head>' +
						'<body>' +
							'<p>foo</p><p>bar</p>' +
						'</body>' +
					'</html>';

				const config = {
					htmlSupport: {
						fullPage: {
							allowRenderStylesFromHead: true
						}
					}
				};

				await createEditor( content, config );

				expect( editor.getData() ).to.equal( content );
				expect( document.querySelectorAll( 'style[data-full-page-style-id]' ) ).to.have.length( 1 );

				const stylesheet = document.querySelectorAll( 'style[data-full-page-style-id]' )[ 0 ];

				expect( stylesheet.textContent ).to.equal( 'p { color: red; }' );
				expect( stylesheet.getAttribute( 'data-full-page-style-id' ) ).to.equal( editor.id );

				const contentToSet =
					'<html>' +
						'<head>' +
							'<title>Testing full page</title>' +
							'<style>p { color: green; }</style>' +
						'</head>' +
						'<body>' +
							'<p>foo</p><p>bar</p><p>baz</p>' +
						'</body>' +
					'</html>';

				editor.setData( contentToSet );

				expect( editor.getData() ).to.equal( contentToSet );

				expect( document.querySelectorAll( 'style[data-full-page-style-id]' ) ).to.have.length( 1 );

				const stylesheetUpdated = document.querySelectorAll( 'style[data-full-page-style-id]' )[ 0 ];

				expect( stylesheetUpdated.textContent ).to.equal( 'p { color: green; }' );
				expect( stylesheetUpdated.getAttribute( 'data-full-page-style-id' ) ).to.equal( editor.id );
			} );
		} );

		describe( 'default `htmlSupport.fullPage.sanitizeCss`', () => {
			let config = '';
			let fullPageConfig;

			beforeEach( async () => {
				config = {
					htmlSupport: {
						fullPage: {
							allowRenderStylesFromHead: true
						}
					}
				};

				await createEditor( '', config );

				fullPageConfig = editor.config.get( 'htmlSupport.fullPage' );
			} );

			it( 'should return an object with cleaned css and a note whether something has changed', async () => {
				expect( fullPageConfig.sanitizeCss( 'p { color: red; }' ) ).to.deep.equal( {
					css: 'p { color: red; }',
					hasChanged: false
				} );
			} );

			it( 'should return an input string (without any modifications)', () => {
				const unsafeCss = 'input[value="a"] { background: url(https://example.com/?value=a); }';

				expect( fullPageConfig.sanitizeCss( unsafeCss ).css ).to.deep.equal( unsafeCss );
			} );

			it( 'should display a warning when using the default sanitizer', () => {
				fullPageConfig.sanitizeCss( 'p { color: red; }' );

				expect( console.warn.callCount ).to.equal( 1 );
				expect( console.warn.firstCall.args[ 0 ] ).to.equal( 'css-full-page-provide-sanitize-function' );
			} );
		} );

		describe( 'custom `htmlSupport.fullPage.sanitizeCss`', () => {
			let config = '';
			let fullPageConfig;

			beforeEach( async () => {
				config = {
					htmlSupport: {
						fullPage: {
							allowRenderStylesFromHead: true,
							sanitizeCss: rawCss => {
								const cleanCss = rawCss.replace( /color: red;/g, 'color: #c0ffee;' );

								return {
									css: cleanCss,
									hasChanged: rawCss !== cleanCss
								};
							}
						}
					}
				};

				await createEditor( '', config );

				fullPageConfig = editor.config.get( 'htmlSupport.fullPage' );
			} );

			it( 'should return an object with cleaned css and a note whether something has changed', async () => {
				expect( fullPageConfig.sanitizeCss( 'p { color: red; }' ) ).to.deep.equal( {
					css: 'p { color: #c0ffee; }',
					hasChanged: true
				} );
			} );

			it( 'should return an input string (without any modifications)', () => {
				const unsafeCss = 'input[value="a"] { background: url(https://example.com/?value=a); }';

				expect( fullPageConfig.sanitizeCss( unsafeCss ).css ).to.deep.equal( unsafeCss );
			} );

			it( 'should allow to extract and append `<style>` tag from editor content to the document `<head>` ' +
				'with sanitized css', async () => {
				const content =
					'<html>' +
						'<head>' +
							'<title>Testing full page</title>' +
							'<style>p { color: red; }</style>' +
						'</head>' +
						'<body>' +
							'<p>foo</p><p>bar</p>' +
						'</body>' +
					'</html>';

				editor.setData( content );

				expect( editor.getData() ).to.equal( content );
				expect( document.querySelectorAll( 'style[data-full-page-style-id]' ) ).to.have.length( 1 );

				const stylesheet = document.querySelectorAll( 'style[data-full-page-style-id]' )[ 0 ];

				expect( stylesheet.textContent ).to.equal( 'p { color: #c0ffee; }' );
			} );

			it( 'should not display a warning when using the custom sanitizer', () => {
				fullPageConfig.sanitizeCss( 'p { color: red; }' );

				expect( console.warn.callCount ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'HtmlComment integration', () => {
		it( 'should preserve comments', async () => {
			const content =
				'<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<!-- comment -->' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>';

			await createEditor( content, {
				plugins: [ Paragraph, ClipboardPipeline, HtmlComment, FullPage ]
			} );

			expect( editor.getData() ).to.equal( content );
		} );
	} );

	async function createEditor( initialData, fullPageConfig = null ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ClipboardPipeline, FullPage ],
			initialData,
			...fullPageConfig
		} );

		// Stub `editor.editing.view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( editor.editing.view, 'scrollToTheSelection' );
	}
} );
