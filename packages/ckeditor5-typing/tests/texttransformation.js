/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import { Typing } from '../src/typing.js';
import { TextTransformation } from '../src/texttransformation.js';
import { _setModelData, _getModelData, ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Code } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';

describe( 'Text transformation feature', () => {
	let editorElement, editor, model, doc;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be loaded', () => {
		return createEditorInstance().then( () => {
			expect( editor.plugins.get( TextTransformation ) ).toBeInstanceOf( TextTransformation );
		} );
	} );

	it( 'has proper name', () => {
		return createEditorInstance().then( () => {
			expect( TextTransformation.pluginName ).toEqual( 'TextTransformation' );
		} );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TextTransformation.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TextTransformation.isPremiumPlugin ).toBe( false );
	} );

	describe( '#isEnabled', () => {
		let plugin;

		beforeEach( () => {
			return createEditorInstance().then( () => {
				plugin = editor.plugins.get( TextTransformation );
			} );
		} );

		afterEach( () => {
			plugin.destroy();
		} );

		it( 'should be enabled after initialization', () => {
			expect( plugin.isEnabled ).toBe( true );
		} );
	} );

	describe( 'transformations', () => {
		beforeEach( () => createEditorInstance() );

		it( 'should not work for selection changes', () => {
			_setModelData( model, '<paragraph>foo bar(tm) baz[]</paragraph>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 11 );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo bar(tm) baz</paragraph>' );
		} );

		it( 'should not work for deletion changes', () => {
			_setModelData( model, '<paragraph>foo bar(tm) []</paragraph>' );

			// Simulate delete command.
			model.change( writer => {
				const selection = writer.createSelection( doc.selection );
				model.modifySelection( selection, { direction: 'backward', unit: 'character' } );
				model.deleteContent( selection, { doNotResetEntireContent: true } );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo bar(tm)</paragraph>' );
		} );

		it( 'should not work for merging changes', () => {
			_setModelData( model, '<paragraph>foo bar(tm)</paragraph><paragraph>[] baz</paragraph>' );

			// Simulate delete command.
			model.change( writer => {
				writer.merge( writer.createPositionAfter( doc.getRoot().getChild( 0 ) ) );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo bar(tm) baz</paragraph>' );
		} );

		describe( 'symbols', () => {
			testTransformation( '(c)', '©' );
			testTransformation( '(r)', '®' );
			testTransformation( '(tm)', '™' );
		} );

		describe( 'mathematical', () => {
			testTransformation( '1/2 ', '½ ', '' );
			testTransformation( '1/2.', '½.', 'A foo ' );
			testTransformation( '1/2+', '½+', '+' );
			testShouldNotTransform( 'x1/2 ', '½ ' );
			testShouldNotTransform( '1/22', '½2' );
			testShouldNotTransform( '11/2', '1½' );
			testShouldNotTransform( '1/2A', '½A' );
			testTransformation( '<=', '≤' );
		} );

		describe( 'typography', () => {
			testTransformation( '...', '…' );
			testTransformation( ' -- ', ' – ' );
			testTransformation( ' --- ', ' — ' );
			testTransformation( '-- ', '– ', '' );
			testTransformation( '--- ', '— ', '' );
		} );

		describe( 'quotations', () => {
			describe( 'english US', () => {
				describe( 'primary', () => {
					testTransformation( ' "Foo 1992 — bar(1) baz: xyz."', ' “Foo 1992 — bar(1) baz: xyz.”' );
					testTransformation( '\' foo "bar"', '\' foo “bar”' );
					testTransformation( 'Foo "Bar bar\'s it\'s a baz"', 'Foo “Bar bar\'s it\'s a baz”' );
					testTransformation( ' ""', ' “”' );
					testTransformation( ' "Bar baz"', ' “Bar baz”', '"A foo<softBreak></softBreak>' );
				} );

				describe( 'secondary', () => {
					testTransformation( ' \'Foo 1992 — bar(1) baz: xyz.\'', ' ‘Foo 1992 — bar(1) baz: xyz.’' );
					testTransformation( '" foo \'bar\'', '" foo ‘bar’' );
					testTransformation( ' \'\'', ' ‘’' );
				} );
			} );
		} );

		// https://github.com/ckeditor/ckeditor5-typing/issues/203.
		it( 'should replace only the parts of content which changed', () => {
			_setModelData( model, '<paragraph>Foo "<$text bold="true">Bar</$text>[]</paragraph>' );

			simulateTyping( '"' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>Foo “<$text bold="true">Bar”</$text></paragraph>' );
		} );

		it( 'should keep styles of the replaced text #1', () => {
			_setModelData( model, '<paragraph>Foo <$text bold="true">"</$text>Bar[]</paragraph>' );

			model.change( writer => {
				writer.setSelectionAttribute( { bold: true } );
			} );

			simulateTyping( '"' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>Foo <$text bold="true">“</$text>Bar<$text bold="true">”</$text></paragraph>' );
		} );

		it( 'should keep styles of the replaced text #2', () => {
			_setModelData( model, '<paragraph>F<$text bold="true">oo "B</$text>ar[]</paragraph>' );

			simulateTyping( '"' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>F<$text bold="true">oo “B</$text>ar”</paragraph>' );
		} );

		it( 'should work with soft breaks in parent', () => {
			_setModelData( model, '<paragraph>"Foo <softBreak></softBreak>"Bar[]</paragraph>' );

			simulateTyping( '"' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>"Foo <softBreak></softBreak>“Bar”</paragraph>' );
		} );

		it( 'should be disabled inside code blocks', () => {
			_setModelData( model, '<codeBlock language="plaintext">some []code</codeBlock>' );

			simulateTyping( '1/2 ' );

			const plugin = editor.plugins.get( 'TextTransformation' );

			expect( plugin.isEnabled ).toBe( false );
			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<codeBlock language="plaintext">some 1/2 code</codeBlock>' );
		} );

		it( 'should be disabled inside inline code', () => {
			_setModelData( model, '<paragraph><$text code="true">some []inline code</$text></paragraph>' );

			simulateTyping( '-- ' );

			const plugin = editor.plugins.get( 'TextTransformation' );

			expect( plugin.isEnabled ).toBe( false );
			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text code="true">some -- inline code</$text></paragraph>' );
		} );

		it( 'can undo transformation', () => {
			_setModelData( model, '<paragraph>Foo[]</paragraph>' );

			simulateTyping( '(c)' );

			editor.commands.execute( 'undo' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>Foo(c)</paragraph>' );
		} );

		it( 'can undo transformation by pressing backspace', () => {
			const viewDocument = editor.editing.view.document;
			const deleteEvent = new ViewDocumentDomEventData(
				viewDocument,
				{ preventDefault: vi.fn() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			_setModelData( model, '<paragraph>Foo[]</paragraph>' );

			simulateTyping( '(c)' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>Foo(c)</paragraph>' );
		} );

		function testTransformation( transformFrom, transformTo, textInParagraph = 'A foo' ) {
			it( `should transform "${ transformFrom }" to "${ transformTo }"`, () => {
				_setModelData( model, `<paragraph>${ textInParagraph }[]</paragraph>` );

				simulateTyping( transformFrom );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( `<paragraph>${ textInParagraph }${ transformTo }</paragraph>` );
			} );

			it( `should not transform "${ transformFrom }" to "${ transformTo }" inside text`, () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				// Insert text - should not be transformed.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( `${ textInParagraph }${ transformFrom } bar`, doc.selection.focus );
				} );

				// Enforce text watcher check after insertion.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( ' ', doc.selection.focus );
				} );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( `<paragraph>${ textInParagraph }${ transformFrom } bar </paragraph>` );
			} );

			it( `should not transform "${ transformFrom }" to "${ transformTo } if not right before selection"`, () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				// Insert text - should not be transformed.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( `${ textInParagraph }${ transformFrom }`, doc.selection.focus );
				} );

				simulateTyping( ' ' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( `<paragraph>${ textInParagraph }${ transformFrom } </paragraph>` );
			} );
		}

		function testShouldNotTransform( transformFrom, transformTo ) {
			it( `should not transform "${ transformFrom }" to "${ transformTo }"`, () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( transformFrom );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( `<paragraph>${ transformFrom }</paragraph>` );
			} );
		}
	} );

	describe( 'configuration', () => {
		it( 'should allow adding own rules with string pattern', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						extra: [
							{ from: 'CKE', to: 'CKEditor' }
						]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'CKE' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>CKEditor</paragraph>' );
			} );
		} );

		it( 'should allow adding own rules with RegExp object', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						extra: [
							{ from: /([a-z]+)(@)(example.com)$/, to: [ null, '.at.', null ] }
						]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'user@example.com' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>user.at.example.com</paragraph>' );
			} );
		} );

		it( 'should allow adding own rules with function as `to` value', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						extra: [
							{ from: /(\. )([a-z])$/, to: matches => [ null, matches[ 1 ].toUpperCase() ] }
						]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>Foo. []</paragraph>' );

				simulateTyping( 'b' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>Foo. B</paragraph>' );
			} );
		} );

		it( 'should not alter include rules adding own rules as extra', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						extra: [
							{ from: 'CKE', to: 'CKEditor' }
						]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'CKE' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>CKEditor</paragraph>' );

				simulateTyping( '(tm)' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>CKEditor™</paragraph>' );
			} );
		} );

		it( 'should overwrite all rules when defining include rules', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						include: [
							{ from: 'CKE', to: 'CKEditor' }
						]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'CKE' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>CKEditor</paragraph>' );

				simulateTyping( '(tm)' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>CKEditor(tm)</paragraph>' );
			} );
		} );

		it( 'should remove rules from group when defining remove rules', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						include: [ 'symbols' ],
						remove: [ 'trademark' ]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(tm)' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>(tm)</paragraph>' );

				simulateTyping( '(r)' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>(tm)®</paragraph>' );
			} );
		} );

		it( 'should remove all rules from group when group is in remove', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						include: [ 'symbols', 'typography' ],
						remove: [ 'symbols' ]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(tm)' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>(tm)</paragraph>' );

				simulateTyping( '...' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>(tm)…</paragraph>' );
			} );
		} );

		it( 'should not fail for unknown rule name', async () => {
			await expect( createEditorInstance( {
				typing: {
					transformations: {
						include: [ 'symbols', 'typo' ]
					}
				}
			} ) ).resolves.toBeUndefined();
		} );

		it( 'should not fail for re-declared include rules config', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						extra: [ 'trademark' ]
					}
				}
			} ).then( () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(tm)' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>™</paragraph>' );
			} );
		} );
	} );

	describe( 'emoticons', () => {
		const EMOTICONS = [
			[ 'slightlySmilingFace', ':)', '🙂' ],
			[ 'slightlyFrowningFace', ':(', '🙁' ],
			[ 'grinning', ':D', '😀' ],
			[ 'openMouth', ':O', '😮' ],
			[ 'wink', ';)', '😉' ],
			[ 'stuckOutTongue', ':P', '😛' ],
			[ 'confused', ':/', '😕' ],
			[ 'confusedBackslash', ':\\', '😕' ],
			[ 'neutralFace', ':|', '😐' ],
			[ 'sunglasses', '8)', '😎' ],
			[ 'kissing', ':*', '😗' ],
			[ 'cry', ':\'(', '😢' ],
			[ 'crySemicolon', ';(', '😢' ],
			[ 'joy', ':\')', '😂' ],
			[ 'laughing', 'XD', '😆' ],
			[ 'stuckOutTongueWinkingEye', 'XP', '😜' ],
			[ 'sob', 'T_T', '😭' ],
			[ 'expressionless', '-_-', '😑' ],
			[ 'dizzyFace', 'x_x', '😵' ],
			[ 'smileCat', ':3', '😸' ],
			[ 'heart', '<3', '❤️' ],
			[ 'brokenHeart', '</3', '💔' ],
			[ 'angry', '>:(', '😠' ],
			[ 'anguished', 'D:', '😧' ],
			[ 'zanyFace', ':^D', '🤪' ],
			[ 'victoryHand', ':v', '✌️' ],
			[ 'grin', '=D', '😁' ],
			[ 'tiredFace', '8(', '😫' ]
		];

		describe( 'with the "emoticons" group included', () => {
			beforeEach( () => createEditorInstance( {
				typing: {
					transformations: {
						include: [ 'emoticons' ]
					}
				}
			} ) );

			for ( const [ name, emoticon, emoji ] of EMOTICONS ) {
				describe( `${ name } (${ emoticon })`, () => {
					it( 'should transform at the beginning of a paragraph', () => {
						_setModelData( model, '<paragraph>[]</paragraph>' );

						simulateTyping( `${ emoticon } ` );

						expect( getParagraphText() ).toEqual( `${ emoji } ` );
					} );

					it( 'should transform after a whitespace', () => {
						_setModelData( model, '<paragraph>Foo[]</paragraph>' );

						simulateTyping( ` ${ emoticon } ` );

						expect( getParagraphText() ).toEqual( `Foo ${ emoji } ` );
					} );

					it( 'should transform after a soft break', () => {
						_setModelData( model, '<paragraph>Foo<softBreak></softBreak>[]</paragraph>' );

						simulateTyping( `${ emoticon } ` );

						expect( _getModelData( model, { withoutSelection: true } ) )
							.toEqual( `<paragraph>Foo<softBreak></softBreak>${ emoji } </paragraph>` );
					} );

					it( 'should not transform without the trailing space', () => {
						_setModelData( model, '<paragraph>Foo []</paragraph>' );

						simulateTyping( emoticon );

						expect( getParagraphText() ).toEqual( `Foo ${ emoticon }` );
					} );

					it( 'should not transform when typed after a non-space character', () => {
						_setModelData( model, '<paragraph>Foo[]</paragraph>' );

						simulateTyping( `${ emoticon } ` );

						expect( getParagraphText() ).toEqual( `Foo${ emoticon } ` );
					} );

					it( 'should not transform when followed by other characters', () => {
						_setModelData( model, '<paragraph>Foo []</paragraph>' );

						simulateTyping( `${ emoticon }a ` );

						expect( getParagraphText() ).toEqual( `Foo ${ emoticon }a ` );
					} );

					it( 'should transform when followed by a punctuation mark and a space', () => {
						const marks = [ '.', ',', ':', ';', '!', '?', '…' ];

						_setModelData( model, '<paragraph>Foo []</paragraph>' );

						simulateTyping( marks.map( mark => `${ emoticon }${ mark } ` ).join( '' ) );

						// For example: "Foo 🙂. 🙂, 🙂: 🙂; 🙂! 🙂? 🙂… ".
						expect( getParagraphText() ).toEqual( 'Foo ' + marks.map( mark => `${ emoji }${ mark } ` ).join( '' ) );
					} );

					it( 'should not transform when followed by a punctuation mark without a space', () => {
						_setModelData( model, '<paragraph>Foo []</paragraph>' );

						simulateTyping( `${ emoticon }.` );

						expect( getParagraphText() ).toEqual( `Foo ${ emoticon }.` );
					} );
				} );
			}

			it( 'should transform when followed by several punctuation marks and a space', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'Wow :)!!! What :)?! Wait :)... ' );

				expect( getParagraphText() ).toEqual( 'Wow 🙂!!! What 🙂?! Wait 🙂... ' );
			} );

			it( 'should transform in the middle of a text when a punctuation mark and a space are typed after it', () => {
				_setModelData( model, '<paragraph>Hi :)[]world</paragraph>' );

				simulateTyping( ', ' );

				expect( getParagraphText() ).toEqual( 'Hi 🙂, world' );
			} );

			it( 'should not transform when followed by characters other than the supported punctuation marks', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( ':)) :)" :)\' :)] :)- :)/ :)* :).x ' );

				expect( getParagraphText() ).toEqual( ':)) :)" :)\' :)] :)- :)/ :)* :).x ' );
			} );

			it( 'should not transform emoticon-like fragments followed by punctuation inside words, URLs, or numbers', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'https:/. 1:3, a8). ratio8). :Docs. foo:), a<3. ' );

				expect( getParagraphText() ).toEqual( 'https:/. 1:3, a8). ratio8). :Docs. foo:), a<3. ' );
			} );

			it( 'should transform multiple emoticons in a row', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'Hi :) and <3 and XD done ' );

				expect( getParagraphText() ).toEqual( 'Hi 🙂 and ❤️ and 😆 done ' );
			} );

			it( 'should be case-sensitive', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( ':d xd xp :o :p t_t X_X d: :V ' );

				expect( getParagraphText() ).toEqual( ':d xd xp :o :p t_t X_X d: :V ' );
			} );

			it( 'should not transform emoticon-like fragments inside words, URLs, or numbers', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'https:/ 1:3 a8) ratio8) :Docs foo:) a<3 ' );

				expect( getParagraphText() ).toEqual( 'https:/ 1:3 a8) ratio8) :Docs foo:) a<3 ' );
			} );

			it( 'should transform after a non-breaking space', () => {
				_setModelData( model, '<paragraph>Foo []</paragraph>' );

				simulateTyping( ':) ' );

				expect( getParagraphText() ).toEqual( 'Foo 🙂 ' );
			} );

			it( 'should not transform when the emoticon was not typed', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( 'Foo :) ', doc.selection.focus );
				} );

				expect( getParagraphText() ).toEqual( 'Foo :) ' );
			} );

			describe( 'overlapping emoticons', () => {
				it( 'should transform ">:(" to the angry face, not ">" followed by the frowning face', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( '>:( ' );

					expect( getParagraphText() ).toEqual( '😠 ' );
				} );

				it( 'should transform ":^D" to the zany face, not ":^" followed by the grinning face', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':^D ' );

					expect( getParagraphText() ).toEqual( '🤪 ' );
				} );

				it( 'should transform "</3" to the broken heart, not to the heart', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( '</3 ' );

					expect( getParagraphText() ).toEqual( '💔 ' );
				} );

				it( 'should transform ":\'(" to the crying face, not to the frowning face', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':\'( ' );

					expect( getParagraphText() ).toEqual( '😢 ' );
				} );

				it( 'should transform ">:(" followed by a period to the angry face', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( '>:(. ' );

					expect( getParagraphText() ).toEqual( '😠. ' );
				} );

				it( 'should transform "D:" followed by a colon to the anguished face', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( 'D:: ' );

					expect( getParagraphText() ).toEqual( '😧: ' );
				} );
			} );

			describe( 'accepted false positives', () => {
				it( 'should transform "D:" in "Plan D: "', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( 'Plan D: ' );

					expect( getParagraphText() ).toEqual( 'Plan 😧 ' );
				} );

				it( 'should transform "<3" in "x <3 "', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( 'x <3 ' );

					expect( getParagraphText() ).toEqual( 'x ❤️ ' );
				} );

				it( 'should transform "8)" in "See (page 8). "', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( 'See (page 8). ' );

					expect( getParagraphText() ).toEqual( 'See (page 😎. ' );
				} );

				it( 'should transform "XP" in "Windows XP. "', () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( 'Windows XP. ' );

					expect( getParagraphText() ).toEqual( 'Windows 😜. ' );
				} );
			} );

			it( 'should undo the transformation by pressing backspace', () => {
				const viewDocument = editor.editing.view.document;
				const deleteEvent = new ViewDocumentDomEventData(
					viewDocument,
					{ preventDefault: vi.fn() },
					{ direction: 'backward', unit: 'codePoint', sequence: 1 }
				);

				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				simulateTyping( ' :) ' );

				expect( getParagraphText() ).toEqual( 'Foo 🙂 ' );

				viewDocument.fire( 'delete', deleteEvent );

				expect( getParagraphText() ).toEqual( 'Foo :) ' );
			} );

			it( 'should undo the transformation followed by a punctuation mark by pressing backspace', () => {
				const viewDocument = editor.editing.view.document;
				const deleteEvent = new ViewDocumentDomEventData(
					viewDocument,
					{ preventDefault: vi.fn() },
					{ direction: 'backward', unit: 'codePoint', sequence: 1 }
				);

				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				simulateTyping( ' :). ' );

				expect( getParagraphText() ).toEqual( 'Foo 🙂. ' );

				viewDocument.fire( 'delete', deleteEvent );

				expect( getParagraphText() ).toEqual( 'Foo :). ' );

				simulateTyping( 'Bar ' );

				expect( getParagraphText() ).toEqual( 'Foo :). Bar ' );
			} );

			it( 'should undo the transformation with the undo command', () => {
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );

				simulateTyping( ' <3 ' );

				editor.commands.execute( 'undo' );

				expect( getParagraphText() ).toEqual( 'Foo <3 ' );
			} );

			it( 'should keep styles of the replaced text', () => {
				_setModelData( model, '<paragraph><$text bold="true">Foo []</$text></paragraph>' );

				simulateTyping( ':) ' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( '<paragraph><$text bold="true">Foo 🙂 </$text></paragraph>' );
			} );

			it( 'should keep styles of the replaced text when the punctuation mark has other styles', () => {
				_setModelData( model, '<paragraph><$text bold="true">Foo :)[]</$text></paragraph>' );

				model.change( writer => {
					writer.removeSelectionAttribute( 'bold' );
				} );

				simulateTyping( '. ' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( '<paragraph><$text bold="true">Foo 🙂</$text>. </paragraph>' );
			} );

			it( 'should not transform inside code blocks', () => {
				_setModelData( model, '<codeBlock language="plaintext">some []code</codeBlock>' );

				simulateTyping( ':) XD ' );

				expect( editor.plugins.get( 'TextTransformation' ).isEnabled ).toBe( false );
				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( '<codeBlock language="plaintext">some :) XD code</codeBlock>' );
			} );

			it( 'should not transform inside inline code', () => {
				_setModelData( model, '<paragraph><$text code="true">some []inline code</$text></paragraph>' );

				simulateTyping( ':) XD ' );

				expect( editor.plugins.get( 'TextTransformation' ).isEnabled ).toBe( false );
				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( '<paragraph><$text code="true">some :) XD inline code</$text></paragraph>' );
			} );
		} );

		describe( 'with the default configuration', () => {
			beforeEach( () => createEditorInstance() );

			for ( const [ name, emoticon, emoji ] of EMOTICONS ) {
				it( `should transform ${ name } (${ emoticon })`, () => {
					_setModelData( model, '<paragraph>Foo []</paragraph>' );

					simulateTyping( `${ emoticon } ` );

					expect( getParagraphText() ).toEqual( `Foo ${ emoji } ` );
				} );
			}

			it( 'should still apply the default transformations', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(c) <= <- -- "foo" ' );

				expect( getParagraphText() ).toEqual( '© ≤ ← – “foo” ' );
			} );

			it( 'should not let "--" affect "-_-"', () => {
				_setModelData( model, '<paragraph>Foo []</paragraph>' );

				simulateTyping( '-_- -- ' );

				expect( getParagraphText() ).toEqual( 'Foo 😑 – ' );
			} );

			it( 'should not let "<=" and "<-" affect "<3" and "</3"', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '<3 </3 <= <- ' );

				expect( getParagraphText() ).toEqual( '❤️ 💔 ≤ ← ' );
			} );

			it( 'should not let the quote transformations affect ":\'(" and ":\')"', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'It\'s sad :\'( or funny :\') ' );

				expect( getParagraphText() ).toEqual( 'It\'s sad 😢 or funny 😂 ' );
			} );

			it( 'should not transform ":\'(" when the quote transformation closes a quote first', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'Foo \'bar :\'( ' );

				expect( getParagraphText() ).toEqual( 'Foo ‘bar :’( ' );
			} );

			it( 'should transform an emoticon followed by "..." after the ellipsis transformation', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'Wait :)... ' );

				expect( getParagraphText() ).toEqual( 'Wait 🙂… ' );
			} );

			it( 'should not transform an emoticon followed by a closing quote', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '"Great :)" \'Great :)\' ' );

				expect( getParagraphText() ).toEqual( '“Great :)” ‘Great :)’ ' );
			} );
		} );

		describe( 'configuration', () => {
			it( 'should allow including a single emoticon by name', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							include: [ 'heart' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( '<3 :) (c) ' );

					expect( getParagraphText() ).toEqual( '❤️ :) (c) ' );
				} );
			} );

			it( 'should allow adding a single emoticon by name as extra', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							include: [ 'symbols' ],
							extra: [ 'slightlySmilingFace' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':) :( (c) ' );

					expect( getParagraphText() ).toEqual( '🙂 :( © ' );
				} );
			} );

			it( 'should allow adding the "emoticons" group as extra', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							include: [ 'symbols' ],
							extra: [ 'emoticons' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':) (c) ' );

					expect( getParagraphText() ).toEqual( '🙂 © ' );
				} );
			} );

			it( 'should allow removing a single emoticon by name', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							include: [ 'emoticons' ],
							remove: [ 'anguished' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( 'Plan D: :) ' );

					expect( getParagraphText() ).toEqual( 'Plan D: 🙂 ' );
				} );
			} );

			it( 'should not transform emoticons when "include" does not list them', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							include: [ 'symbols' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':) (c) ' );

					expect( getParagraphText() ).toEqual( ':) © ' );
				} );
			} );

			it( 'should allow disabling the "emoticons" group in the default configuration', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							remove: [ 'emoticons' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':) <3 (c) ' );

					expect( getParagraphText() ).toEqual( ':) <3 © ' );
				} );
			} );

			it( 'should allow disabling a single emoticon in the default configuration', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							remove: [ 'sunglasses' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( '(page 8) :) ' );

					expect( getParagraphText() ).toEqual( '(page 8) 🙂 ' );
				} );
			} );

			it( 'should allow removing the "emoticons" group', () => {
				return createEditorInstance( {
					typing: {
						transformations: {
							include: [ 'emoticons', 'symbols' ],
							remove: [ 'emoticons' ]
						}
					}
				} ).then( () => {
					_setModelData( model, '<paragraph>[]</paragraph>' );

					simulateTyping( ':) (c) ' );

					expect( getParagraphText() ).toEqual( ':) © ' );
				} );
			} );
		} );

		function getParagraphText() {
			const paragraph = doc.getRoot().getChild( 0 );

			return Array.from( paragraph.getChildren() )
				.filter( node => node.is( '$text' ) )
				.map( node => node.data )
				.join( '' );
		}
	} );

	function createEditorInstance( additionalConfig = {} ) {
		return ClassicTestEditor
			.create( editorElement, Object.assign( {
				plugins: [ Typing, Paragraph, Bold, Code, TextTransformation, CodeBlock, UndoEditing ]
			}, additionalConfig ) )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				doc = model.document;

				editor.conversion.elementToElement( {
					model: 'softBreak',
					view: 'br'
				} );
			} );
	}

	function simulateTyping( transformFrom ) {
		const letters = transformFrom.split( '' );

		for ( const letter of letters ) {
			editor.execute( 'insertText', { text: letter } );
		}
	}
} );
