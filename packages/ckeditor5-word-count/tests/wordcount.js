/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import WordCount from '../src/wordcount.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import Position from '@ckeditor/ckeditor5-engine/src/model/position.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import LegacyListEditing from '@ckeditor/ckeditor5-list/src/legacylist/legacylistediting.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';

// Delay related to word-count throttling.
const DELAY = 300;

describe( 'WordCount', () => {
	testUtils.createSinonSandbox();

	let wordCountPlugin, editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [
					WordCount, Paragraph, ShiftEnter, TableEditing, LegacyListEditing, LinkEditing, ImageBlockEditing, ImageCaptionEditing
				]
			} )
			.then( _editor => {
				editor = _editor;
				model = editor.model;
				wordCountPlugin = editor.plugins.get( 'WordCount' );

				model.schema.extend( '$text', { allowAttributes: 'foo' } );
			} );
	} );

	describe( 'constructor()', () => {
		describe( '#words property', () => {
			it( 'is defined', () => {
				expect( wordCountPlugin.words ).to.equal( 0 );
			} );

			it( 'returns the number of words right away', () => {
				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				expect( wordCountPlugin.words ).to.equal( 2 );

				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world</paragraph>' );
				expect( wordCountPlugin.words ).to.equal( 2 );

				setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );
				expect( wordCountPlugin.words ).to.equal( 1 );

				setModelData( model, '' );
				expect( wordCountPlugin.words ).to.equal( 0 );
			} );

			it( 'is observable', done => {
				const spy = sinon.spy();

				wordCountPlugin.on( 'change:words', spy );

				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );

				setTimeout( () => {
					// The #update event fired once because it is throttled.
					sinon.assert.calledOnce( spy );
					expect( spy.firstCall.args[ 2 ] ).to.equal( 1 );

					done();
				}, DELAY );
			} );
		} );

		describe( '#characters property', () => {
			it( 'is defined', () => {
				expect( wordCountPlugin.characters ).to.equal( 0 );
			} );

			it( 'returns the number of characters right away', () => {
				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				expect( wordCountPlugin.characters ).to.equal( 12 );

				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world</paragraph>' );
				expect( wordCountPlugin.characters ).to.equal( 11 );

				setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );
				expect( wordCountPlugin.characters ).to.equal( 5 );

				setModelData( model, '' );
				expect( wordCountPlugin.characters ).to.equal( 0 );
			} );

			it( 'is observable', done => {
				const spy = sinon.spy();

				wordCountPlugin.on( 'change:characters', spy );

				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				setModelData( model, '<paragraph><$text foo="true">Hello</$text></paragraph>' );

				setTimeout( () => {
					// The #update event fired once because it is throttled.
					sinon.assert.calledOnce( spy );
					expect( spy.firstCall.args[ 2 ] ).to.equal( 5 );

					done();
				}, DELAY );
			} );
		} );

		it( 'has a name', () => {
			expect( WordCount.pluginName ).to.equal( 'WordCount' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( WordCount.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( WordCount.isPremiumPlugin ).to.be.false;
		} );
	} );

	describe( 'functionality', () => {
		describe( 'counting words', () => {
			beforeEach( () => {
				expect( wordCountPlugin.words ).to.equal( 0 );
			} );

			it( 'should count a number as a word', () => {
				setModelData( model, '<paragraph>1 12 3,5 3/4 1.2 0</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 6 );
			} );

			it( 'should count a single letter as a word', () => {
				setModelData( model, '<paragraph>a</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 1 );
			} );

			it( 'should count an e-mail as a single word', () => {
				setModelData( model, '<paragraph>j.doe@cksource.com</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 1 );
			} );

			it( 'should ignore apostrophes in words', () => {
				setModelData( model, '<paragraph>Foo\'bar</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 1 );
			} );

			it( 'should ignore dots in words', () => {
				setModelData( model, '<paragraph>Foo.bar</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 1 );
			} );

			it( 'should count words in links', () => {
				setModelData( model, '<paragraph><$text linkHref="http://www.cksource.com">CK Source</$text></paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 2 );
			} );

			it( 'should not count the string with no letters or numbers as a word', () => {
				setModelData( model, '<paragraph>(@#$%^*()) . ??? @ --- ...</paragraph>' );
				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 0 );
			} );

			it( 'should not count the list item number/bullet as a word', () => {
				setModelData( model, '<listItem listType="numbered" listIndent="0">Foo</listItem>' +
				'<listItem listType="bulleted" listIndent="0">bar</listItem>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 2 );
			} );

			it( 'should count words in the image caption', () => {
				setModelData( model,
					'<imageBlock>' +
						'<caption>Foo Bar</caption>' +
					'</imageBlock>'
				);

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 2 );
			} );

			it( 'should count words in the table', () => {
				setModelData( model,
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
				expect( wordCountPlugin.words ).to.equal( 6 );
			} );

			it( 'should separate words with the end of the paragraph', () => {
				setModelData( model, '<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 2 );
			} );

			it( 'should separate words with the new line character', () => {
				setModelData( model, '<paragraph>Foo\nBar</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 2 );
			} );

			it( 'should separate words with the soft break', () => {
				setModelData( model, '<paragraph>Foo<softBreak></softBreak>Bar</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 2 );
			} );

			it( 'should not separate words with the special characters', () => {
				setModelData( model, '<paragraph>F!o@o-B#a$r%F^o*B(a)r_F-o+o=B£a§r`F~o,B,a.F/o?o;B:a\'r"F\\o|oB{ar}</paragraph>' );

				wordCountPlugin._refreshStats();
				expect( wordCountPlugin.words ).to.equal( 1 );
			} );

			it( 'should count international words', function() {
				if ( !env.features.isRegExpUnicodePropertySupported ) {
					this.skip();
				}

				setModelData( model, '<paragraph>שמש 太陽 ดวงอาทิตย์ شمس ਸੂਰਜ słońce</paragraph>' );
				wordCountPlugin._refreshStats();

				expect( wordCountPlugin.words ).to.equal( 6 );
			} );

			describe( 'ES2018 RegExp Unicode property fallback', () => {
				const originalPropertiesSupport = env.features.isRegExpUnicodePropertySupported;

				before( () => {
					env.features.isRegExpUnicodePropertySupported = false;
				} );

				after( () => {
					env.features.isRegExpUnicodePropertySupported = originalPropertiesSupport;
				} );

				it( 'should use different regexp when unicode properties are not supported', () => {
					expect( wordCountPlugin.words ).to.equal( 0 );

					setModelData( model, '<paragraph>hello world.</paragraph>' );
					wordCountPlugin._refreshStats();

					expect( wordCountPlugin.words ).to.equal( 2 );
				} );
			} );
		} );

		it( 'counts characters', () => {
			setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );

			wordCountPlugin._refreshStats();

			expect( wordCountPlugin.characters ).to.equal( 12 );
		} );

		it( 'should not count enter as a character', () => {
			expect( wordCountPlugin.characters ).to.equal( 0 );

			setModelData( model, '<paragraph>Fo<softBreak></softBreak>o</paragraph>' +
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

			expect( wordCountPlugin.characters ).to.equal( 9 );
		} );

		describe( '#update event', () => {
			it( 'fires with the actual number of characters and words', () => {
				const fake = sinon.fake();
				wordCountPlugin.on( 'update', fake );

				wordCountPlugin._refreshStats();

				sinon.assert.calledOnce( fake );
				sinon.assert.calledWithExactly( fake, sinon.match.any, { words: 0, characters: 0 } );

				// _refreshStats is throttled, so for this test case is run manually
				setModelData( model, '<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );
				wordCountPlugin._refreshStats();

				sinon.assert.calledTwice( fake );
				sinon.assert.calledWithExactly( fake, sinon.match.any, { words: 2, characters: 12 } );
			} );

			it( 'should be fired after editor initialization', () => {
				const fake = sinon.fake();

				return VirtualTestEditor.create( {
					plugins: [ WordCount, Paragraph, ShiftEnter, TableEditing ],
					wordCount: {
						onUpdate: fake
					}
				} )
					.then( () => {
						sinon.assert.calledOnce( fake );
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
			expect( container ).to.be.instanceof( HTMLElement );
		} );

		it( 'provided element has proper structure', () => {
			expect( container.tagName ).to.equal( 'DIV' );
			expect( container.classList.contains( 'ck' ) ).to.be.true;
			expect( container.classList.contains( 'ck-word-count' ) ).to.be.true;

			const children = Array.from( container.children );
			expect( children.length ).to.equal( 2 );
			expect( children[ 0 ].tagName ).to.equal( 'DIV' );
			expect( children[ 0 ].innerHTML ).to.equal( 'Words: 0' );
			expect( children[ 1 ].tagName ).to.equal( 'DIV' );
			expect( children[ 1 ].innerHTML ).to.equal( 'Characters: 0' );
		} );

		it( 'updates container content', () => {
			expect( container.innerText ).to.equal( 'Words: 0Characters: 0' );

			setModelData( model, '<paragraph>Foo bar</paragraph>' +
				'<paragraph><$text foo="true">Hello</$text> world.</paragraph>' );

			wordCountPlugin._refreshStats();

			expect( container.innerText ).to.equal( 'Words: 4Characters: 19' );
		} );

		it( 'subsequent calls provides the same element', () => {
			const newContainer = wordCountPlugin.wordCountContainer;

			expect( container ).to.equal( newContainer );
		} );

		describe( 'destroy()', () => {
			it( 'html element is removed', done => {
				const frag = document.createDocumentFragment();

				frag.appendChild( container );

				expect( frag.querySelector( '*' ) ).to.be.instanceof( HTMLElement );

				editor.destroy()
					.then( () => {
						expect( frag.querySelector( '*' ) ).to.be.null;
					} )
					.then( done )
					.catch( done );
			} );

			it( 'method is called', done => {
				const spy = sinon.spy( wordCountPlugin, 'destroy' );

				editor.destroy()
					.then( () => {
						sinon.assert.calledOnce( spy );
					} )
					.then( done )
					.catch( done );
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
		beforeEach( done => {
			// We need to flush initial throttle value after editor's initialization
			setTimeout( done, DELAY );
		} );

		it( 'gets update after model data change', done => {
			const fake = sinon.fake();

			wordCountPlugin.on( 'update', fake );

			// Initial change in model should be immediately reflected in word-count
			setModelData( model, '<paragraph>Hello world.</paragraph>' );

			sinon.assert.calledOnce( fake );
			sinon.assert.calledWith( fake, sinon.match.any, { words: 2, characters: 12 } );

			// Subsequent updates should be throttle and run with last parameters
			setTimeout( () => {
				sinon.assert.calledTwice( fake );
				sinon.assert.calledWith( fake, sinon.match.any, { words: 2, characters: 9 } );

				done();
			}, DELAY );

			setModelData( model, '<paragraph>Hello world</paragraph>' );
			setModelData( model, '<paragraph>Hello worl</paragraph>' );
			setModelData( model, '<paragraph>Hello wor</paragraph>' );
		} );

		it( 'is not update after selection change', done => {
			setModelData( model, '<paragraph>Hello[] world.</paragraph>' );

			const fake = sinon.fake();
			const fakeSelectionChange = sinon.fake();

			wordCountPlugin.on( 'update', fake );
			model.document.on( 'change', fakeSelectionChange );

			model.change( writer => {
				const range = writer.createRange( new Position( model.document.getRoot(), [ 0, 1 ] ) );

				writer.setSelection( range );
			} );

			model.change( writer => {
				const range = writer.createRange( new Position( model.document.getRoot(), [ 0, 10 ] ) );

				writer.setSelection( range );
			} );

			setTimeout( () => {
				sinon.assert.notCalled( fake );
				sinon.assert.called( fakeSelectionChange );

				done();
			}, DELAY );
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

					expect( container.innerText ).to.equal( 'Characters: 0' );
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

					expect( container.innerText ).to.equal( 'Words: 0' );
				} );
		} );

		it( 'should call function registered under config.wordCount.onUpdate', () => {
			const fake = sinon.fake();
			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				wordCount: {
					onUpdate: fake
				}
			} )
				.then( editor => {
					sinon.assert.calledWithExactly( fake, { words: 0, characters: 0 } );

					setModelData( editor.model, '<paragraph>Foo Bar</paragraph>' );
				} )
				.then( () => new Promise( resolve => {
					setTimeout( resolve, DELAY );
				} ) )
				.then( () => {
					sinon.assert.calledWithExactly( fake, { words: 2, characters: 7 } );
				} );
		} );

		it( 'should append word count container in element referenced in config.wordCount.container', () => {
			const element = document.createElement( 'div' );

			expect( element.children.length ).to.equal( 0 );

			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				wordCount: {
					container: element
				}
			} )
				.then( editor => {
					expect( element.children.length ).to.equal( 1 );

					const wordCountPlugin = editor.plugins.get( 'WordCount' );

					expect( element.firstElementChild ).to.equal( wordCountPlugin.wordCountContainer );
				} );
		} );
	} );

	describe( 'translations', () => {
		before( () => {
			addTranslations( 'pl', {
				'Words: %0': 'Słowa: %0',
				'Characters: %0': 'Znaki: %0'
			} );
			addTranslations( 'en', {
				'Words: %0': 'Words: %0',
				'Characters: %0': 'Characters: %0'
			} );
		} );

		after( () => {
			clearTranslations();
		} );

		it( 'applies proper language translations', () => {
			return VirtualTestEditor.create( {
				plugins: [ WordCount, Paragraph ],
				language: 'pl'
			} )
				.then( editor => {
					const wordCountPlugin = editor.plugins.get( 'WordCount' );
					const container = wordCountPlugin.wordCountContainer;

					expect( container.innerText ).to.equal( 'Słowa: 0Znaki: 0' );
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
			setModelData( model, '<paragraph>foo bar</paragraph>', { rootName: 'foo' } );
			setModelData( model, '<paragraph>lorem ipsum</paragraph>', { rootName: 'bar' } );

			expect( wordCountPlugin.characters ).to.be.equal( 18 );
		} );

		it( 'should sum words of each root', () => {
			setModelData( model, '<paragraph>foo bar</paragraph>', { rootName: 'foo' } );
			setModelData( model, '<paragraph>lorem ipsum</paragraph>', { rootName: 'bar' } );

			expect( wordCountPlugin.words ).to.be.equal( 4 );
		} );
	} );
} );
