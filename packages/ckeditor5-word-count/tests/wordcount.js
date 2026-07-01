/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { WordCount } from '../src/wordcount.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { _setModelData, ModelPosition } from '@ckeditor/ckeditor5-engine';
import { add as addTranslations, _clearTranslations, env } from '@ckeditor/ckeditor5-utils';
import { ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { TableEditing } from '@ckeditor/ckeditor5-table';
import { ListEditing } from '@ckeditor/ckeditor5-list';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { ImageCaptionEditing, ImageBlockEditing } from '@ckeditor/ckeditor5-image';

// Delay related to word-count throttling.
const DELAY = 300;

describe( 'WordCount', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	let wordCountPlugin, editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [
					WordCount, Paragraph, ShiftEnter, TableEditing, ListEditing, LinkEditing, ImageBlockEditing, ImageCaptionEditing
				]
			} )
			.then( _editor => {
				editor = _editor;
				model = editor.model;
				wordCountPlugin = editor.plugins.get( 'WordCount' );

				model.schema.extend( '$text', { allowAttributes: 'foo' } );
			} );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `WC`', () => {
		expect( WordCount.licenseFeatureCode ).toBe( 'WC' );
	} );

	describe( 'constructor()', () => {
		describe( '#words property', () => {
			it( 'is defined', () => {
				expect( wordCountPlugin.words ).toBe( 0 );
			} );

			it( 'returns the number of words right away', () => {
				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				expect( wordCountPlugin.words ).toBe( 2 );

				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world</paragraph>' );
				expect( wordCountPlugin.words ).toBe( 2 );

				_setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );
				expect( wordCountPlugin.words ).toBe( 1 );

				_setModelData( model, '' );
				expect( wordCountPlugin.words ).toBe( 0 );
			} );

			it( 'is observable', async () => {
				const spy = vi.fn();

				wordCountPlugin.on( 'change:words', spy );

				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				_setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );

				await new Promise( resolve => {
					setTimeout( resolve, DELAY );
				} );

				// The #update event fired once because it is throttled.
				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 2 ] ).toBe( 1 );
			} );
		} );

		describe( '#characters property', () => {
			it( 'is defined', () => {
				expect( wordCountPlugin.characters ).toBe( 0 );
			} );

			it( 'returns the number of characters right away', () => {
				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				expect( wordCountPlugin.characters ).toBe( 12 );

				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world</paragraph>' );
				expect( wordCountPlugin.characters ).toBe( 11 );

				_setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );
				expect( wordCountPlugin.characters ).toBe( 5 );

				_setModelData( model, '' );
				expect( wordCountPlugin.characters ).toBe( 0 );
			} );

			it( 'is observable', async () => {
				const spy = vi.fn();

				wordCountPlugin.on( 'change:characters', spy );

				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				_setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );

				await new Promise( resolve => {
					setTimeout( resolve, DELAY );
				} );

				// The #update event fired once because it is throttled.
				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 2 ] ).toBe( 5 );
			} );
		} );

		it( 'has a name', () => {
			expect( WordCount.pluginName ).toBe( 'WordCount' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( WordCount.isOfficialPlugin ).toBe( true );
		} );

		it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
			expect( WordCount.isPremiumPlugin ).toBe( true );
		} );
	} );

	describe( 'functionality', () => {
		describe( 'counting words', () => {
			beforeEach( () => {
				expect( wordCountPlugin.words ).toBe( 0 );
			} );

			it( 'should count a number as a word', () => {
				_setModelData( model, '<paragraph>1 12 3,5 3/4 1.2 0</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 6 );
			} );

			it( 'should count a single letter as a word', () => {
				_setModelData( model, '<paragraph>a</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 1 );
			} );

			it( 'should count an e-mail as a single word', () => {
				_setModelData( model, '<paragraph>j.doe@cksource.com</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 1 );
			} );

			it( 'should ignore apostrophes in words', () => {
				_setModelData( model, '<paragraph>Foo\'bar</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 1 );
			} );

			it( 'should ignore dots in words', () => {
				_setModelData( model, '<paragraph>Foo.bar</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 1 );
			} );

			it( 'should count words in links', () => {
				_setModelData( model, '<paragraph><$text linkHref="http://www.cksource.com">CK Source</$text></paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 2 );
			} );

			it( 'should not count the string with no letters or numbers as a word', () => {
				_setModelData( model, '<paragraph>(@#$%^*()) . ??? @ --- ...</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 0 );
			} );

			it( 'should not count the list item number/bullet as a word', () => {
				_setModelData(
					model,
					'<paragraph listIndent="0" listItemId="000" listType="numbered">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="001" listType="bulleted">bar</paragraph>'
				);

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 2 );
			} );

			it( 'should count words in the image caption', () => {
				_setModelData( model,
					'<imageBlock>' +
						'<caption>Foo Bar</caption>' +
					'</imageBlock>'
				);

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 2 );
			} );

			it( 'should count words in the table', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>Foo</paragraph></tableCell>' +
							'<tableCell><paragraph>Foo</paragraph></tableCell>' +
							'<tableCell><paragraph>Foo</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>Foo</paragraph></tableCell>' +
							'<tableCell><paragraph>Foo</paragraph></tableCell>' +
							'<tableCell><paragraph>Foo</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 6 );
			} );

			it( 'should separate words with the end of the paragraph', () => {
				_setModelData( model, '<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 2 );
			} );

			it( 'should separate words with the new line character', () => {
				_setModelData( model, '<paragraph>Foo\nBar</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 2 );
			} );

			it( 'should separate words with the soft break', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>Bar</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 2 );
			} );

			it( 'should not separate words with the special characters', () => {
				_setModelData( model, '<paragraph>F!o@o-B#a$r%F^o*B(a)r_F-o+o=B£a§r`F~o,B,a.F/o?o;B:a\'r"F\\o|oB{ar}</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).toBe( 1 );
			} );

			( env.features.isRegExpUnicodePropertySupported ? it : it.skip )( 'should count international words', () => {
				_setModelData( model, '<paragraph>שמש 太陽 ดวงอาทิตย์ شمس ਸੂਰਜ słońce</paragraph>' );
				wordCountPlugin._refreshStats();

				expect( wordCountPlugin.words ).toBe( 6 );
			} );

			describe( 'ES2018 RegExp Unicode property fallback', () => {
				const originalPropertiesSupport = env.features.isRegExpUnicodePropertySupported;

				beforeAll( () => {
					env.features.isRegExpUnicodePropertySupported = false;
				} );

				afterAll( () => {
					env.features.isRegExpUnicodePropertySupported = originalPropertiesSupport;
				} );

				it( 'should use different regexp when unicode properties are not supported', () => {
					expect( wordCountPlugin.words ).toBe( 0 );

					_setModelData( model, '<paragraph>hello world.</paragraph>' );
					wordCountPlugin._refreshStats();

					expect( wordCountPlugin.words ).toBe( 2 );
				} );
			} );
		} );

		it( 'counts characters', () => {
			_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );

			wordCountPlugin._refreshStats();

			expect( wordCountPlugin.characters ).toBe( 12 );
		} );

		it( 'should not count enter as a character', () => {
			expect( wordCountPlugin.characters ).toBe( 0 );

			_setModelData( model, '<paragraph>Fo<softBreak></softBreak>o</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<table>' +
				'<tableRow>' +
					'<tableCell></tableCell><tableCell></tableCell><tableCell></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell></tableCell><tableCell><paragraph>foo</paragraph></tableCell><tableCell></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell></tableCell><tableCell></tableCell><tableCell></tableCell>' +
				'</tableRow>' +
				'</table>' );

			wordCountPlugin._refreshStats();

			expect( wordCountPlugin.characters ).toBe( 9 );
		} );

		describe( '#update event', () => {
			it( 'fires with the actual number of characters and words', () => {
				const fake = vi.fn();
				wordCountPlugin.on( 'update', fake );

				wordCountPlugin._refreshStats();

				expect( fake ).toHaveBeenCalledTimes( 1 );
				expect( fake ).toHaveBeenNthCalledWith( 1, expect.anything(), { words: 0, characters: 0 } );

				// _refreshStats is throttled, so for this test case is run manually
				_setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				wordCountPlugin._refreshStats();

				expect( fake ).toHaveBeenCalledTimes( 2 );
				expect( fake ).toHaveBeenNthCalledWith( 2, expect.anything(), { words: 2, characters: 12 } );
			} );

			it( 'should be fired after editor initialization', () => {
				const fake = vi.fn();

				return VirtualTestEditor.create( {
					plugins: [ WordCount, Paragraph, ShiftEnter, TableEditing ],
					wordCount: {
						onUpdate: fake
					}
				} )
					.then( () => {
						expect( fake ).toHaveBeenCalledTimes( 1 );
					} );
			} );
		} );
	} );

	describe( 'self-updating element', () => {
		let container;
		beforeEach( () => {
			container = wordCountPlugin.wordCountContainer;
		} );

		it( 'provides html element', () => {
			expect( container ).toBeInstanceOf( HTMLElement );
		} );

		it( 'provided element has proper structure', () => {
			expect( container.tagName ).toBe( 'DIV' );
			expect( container.classList.contains( 'ck' ) ).toBe( true );
			expect( container.classList.contains( 'ck-word-count' ) ).toBe( true );

			const children = Array.from( container.children );
			expect( children.length ).toBe( 2 );
			expect( children[ 0 ].tagName ).toBe( 'DIV' );
			expect( children[ 0 ].innerHTML ).toBe( 'Words: 0' );
			expect( children[ 1 ].tagName ).toBe( 'DIV' );
			expect( children[ 1 ].innerHTML ).toBe( 'Characters: 0' );
		} );

		it( 'updates container content', () => {
			expect( container.innerText ).toBe( 'Words: 0Characters: 0' );

			_setModelData( model, '<paragraph>Foo bar</paragraph>' +
				'<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );

			wordCountPlugin._refreshStats();

			expect( container.innerText ).toBe( 'Words: 4Characters: 19' );
		} );

		it( 'subsequent calls provides the same element', () => {
			const newContainer = wordCountPlugin.wordCountContainer;

			expect( container ).toBe( newContainer );
		} );

		describe( 'destroy()', () => {
			it( 'html element is removed', () => {
				const frag = document.createDocumentFragment();

				frag.appendChild( container );

				expect( frag.querySelector( '*' ) ).toBeInstanceOf( HTMLElement );

				return editor.destroy()
					.then( () => {
						expect( frag.querySelector( '*' ) ).toBeNull();
					} );
			} );

			it( 'method is called', () => {
				const spy = vi.spyOn( wordCountPlugin, 'destroy' );

				return editor.destroy()
					.then( () => {
						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );
			} );

			it( 'should not throw an error if container is not specified', () => {
				return VirtualTestEditor.create( {
					plugins: [ WordCount, Paragraph ]
				} )
					.then( editor => {
						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( '_refreshStats and throttle', () => {
		beforeEach( () => {
			// We need to flush initial throttle value after editor's initialization
			return new Promise( resolve => {
				setTimeout( resolve, DELAY );
			} );
		} );

		it( 'gets update after model data change', async () => {
			const fake = vi.fn();

			wordCountPlugin.on( 'update', fake );

			// Initial change in model should be immediately reflected in word-count
			_setModelData( model, '<paragraph>Hello world.</paragraph>' );

			expect( fake ).toHaveBeenCalledTimes( 1 );
			expect( fake ).toHaveBeenNthCalledWith( 1, expect.anything(), { words: 2, characters: 12 } );

			_setModelData( model, '<paragraph>Hello world</paragraph>' );
			_setModelData( model, '<paragraph>Hello worl</paragraph>' );
			_setModelData( model, '<paragraph>Hello wor</paragraph>' );

			// Subsequent updates should be throttle and run with last parameters
			await new Promise( resolve => {
				setTimeout( resolve, DELAY );
			} );

			expect( fake ).toHaveBeenCalledTimes( 2 );
			expect( fake ).toHaveBeenNthCalledWith( 2, expect.anything(), { words: 2, characters: 9 } );
		} );

		it( 'is not update after selection change', async () => {
			_setModelData( model, '<paragraph>Hello[] world.</paragraph>' );

			const fake = vi.fn();
			const fakeSelectionChange = vi.fn();

			wordCountPlugin.on( 'update', fake );
			model.document.on( 'change', fakeSelectionChange );

			model.change( writer => {
				const range = writer.createRange( new ModelPosition( model.document.getRoot(), [ 0, 1 ] ) );

				writer.setSelection( range );
			} );

			model.change( writer => {
				const range = writer.createRange( new ModelPosition( model.document.getRoot(), [ 0, 10 ] ) );

				writer.setSelection( range );
			} );

			await new Promise( resolve => {
				setTimeout( resolve, DELAY );
			} );

			expect( fake ).not.toHaveBeenCalled();
			expect( fakeSelectionChange ).toHaveBeenCalled();
		} );
	} );

	describe( 'custom config options', () => {
		it( 'displayWords = false', () => {
			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				wordCount: {
					displayWords: false
				}
			} )
				.then( editor => {
					const wordCountPlugin = editor.plugins.get( 'WordCount' );
					const container = wordCountPlugin.wordCountContainer;

					expect( container.innerText ).toBe( 'Characters: 0' );
				} );
		} );

		it( 'displayCharacters = false', () => {
			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				wordCount: {
					displayCharacters: false
				}
			} )
				.then( editor => {
					const wordCountPlugin = editor.plugins.get( 'WordCount' );
					const container = wordCountPlugin.wordCountContainer;

					expect( container.innerText ).toBe( 'Words: 0' );
				} );
		} );

		it( 'should call function registered under config.wordCount.onUpdate', () => {
			const fake = vi.fn();
			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				wordCount: {
					onUpdate: fake
				}
			} )
				.then( editor => {
					expect( fake ).toHaveBeenNthCalledWith( 1, { words: 0, characters: 0 } );

					_setModelData( editor.model, '<paragraph>Foo Bar</paragraph>' );
				} )
				.then( () => new Promise( resolve => {
					setTimeout( resolve, DELAY );
				} ) )
				.then( () => {
					expect( fake ).toHaveBeenLastCalledWith( { words: 2, characters: 7 } );
				} );
		} );

		it( 'should append word count container in element referenced in config.wordCount.container', () => {
			const element = document.createElement( 'div' );

			expect( element.children.length ).toBe( 0 );

			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				wordCount: {
					container: element
				}
			} )
				.then( editor => {
					expect( element.children.length ).toBe( 1 );

					const wordCountPlugin = editor.plugins.get( 'WordCount' );

					expect( element.firstElementChild ).toBe( wordCountPlugin.wordCountContainer );
				} );
		} );
	} );

	describe( 'translations', () => {
		beforeAll( () => {
			addTranslations( 'pl', {
				'Words: %0': 'Słowa: %0',
				'Characters: %0': 'Znaki: %0'
			} );
			addTranslations( 'en', {
				'Words: %0': 'Words: %0',
				'Characters: %0': 'Characters: %0'
			} );
		} );

		afterAll( () => {
			_clearTranslations();
		} );

		it( 'applies proper language translations', () => {
			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				language: 'pl'
			} )
				.then( editor => {
					const wordCountPlugin = editor.plugins.get( 'WordCount' );
					const container = wordCountPlugin.wordCountContainer;

					expect( container.innerText ).toBe( 'Słowa: 0Znaki: 0' );
				} );
		} );
	} );

	describe( 'multi-root editor integration', () => {
		beforeEach( () => {
			return MultiRootEditor
				.create( {
					foo: document.createElement( 'div' ),
					bar: document.createElement( 'div' )
				}, {
					plugins: [
						WordCount, Paragraph
					]
				} )
				.then( _editor => {
					editor = _editor;
					model = editor.model;
					wordCountPlugin = editor.plugins.get( 'WordCount' );
				} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should sum characters of each root', () => {
			_setModelData( model, '<paragraph>foo bar</paragraph>', { rootName: 'foo' } );
			_setModelData( model, '<paragraph>lorem ipsum</paragraph>', { rootName: 'bar' } );

			expect( wordCountPlugin.characters ).toBe( 18 );
		} );

		it( 'should sum words of each root', () => {
			_setModelData( model, '<paragraph>foo bar</paragraph>', { rootName: 'foo' } );
			_setModelData( model, '<paragraph>lorem ipsum</paragraph>', { rootName: 'bar' } );

			expect( wordCountPlugin.words ).toBe( 4 );
		} );
	} );
} );
