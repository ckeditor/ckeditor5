/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import Typing from '../src/typing.js';
import TextTransformation from '../src/texttransformation.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';

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
			expect( editor.plugins.get( TextTransformation ) ).to.instanceOf( TextTransformation );
		} );
	} );

	it( 'has proper name', () => {
		return createEditorInstance().then( () => {
			expect( TextTransformation.pluginName ).to.equal( 'TextTransformation' );
		} );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TextTransformation.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TextTransformation.isPremiumPlugin ).to.be.false;
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
			expect( plugin.isEnabled ).to.be.true;
		} );
	} );

	describe( 'transformations', () => {
		beforeEach( createEditorInstance );

		it( 'should not work for selection changes', () => {
			setData( model, '<paragraph>foo bar(tm) baz[]</paragraph>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 11 );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foo bar(tm) baz</paragraph>' );
		} );

		it( 'should not work for deletion changes', () => {
			setData( model, '<paragraph>foo bar(tm) []</paragraph>' );

			// Simulate delete command.
			model.change( writer => {
				const selection = writer.createSelection( doc.selection );
				model.modifySelection( selection, { direction: 'backward', unit: 'character' } );
				model.deleteContent( selection, { doNotResetEntireContent: true } );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foo bar(tm)</paragraph>' );
		} );

		it( 'should not work for merging changes', () => {
			setData( model, '<paragraph>foo bar(tm)</paragraph><paragraph>[] baz</paragraph>' );

			// Simulate delete command.
			model.change( writer => {
				writer.merge( writer.createPositionAfter( doc.getRoot().getChild( 0 ) ) );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foo bar(tm) baz</paragraph>' );
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
			setData( model, '<paragraph>Foo "<$text bold="true">Bar</$text>[]</paragraph>' );

			simulateTyping( '"' );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>Foo “<$text bold="true">Bar”</$text></paragraph>' );
		} );

		it( 'should keep styles of the replaced text #1', () => {
			setData( model, '<paragraph>Foo <$text bold="true">"</$text>Bar[]</paragraph>' );

			model.change( writer => {
				writer.setSelectionAttribute( { bold: true } );
			} );

			simulateTyping( '"' );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>Foo <$text bold="true">“</$text>Bar<$text bold="true">”</$text></paragraph>' );
		} );

		it( 'should keep styles of the replaced text #2', () => {
			setData( model, '<paragraph>F<$text bold="true">oo "B</$text>ar[]</paragraph>' );

			simulateTyping( '"' );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>F<$text bold="true">oo “B</$text>ar”</paragraph>' );
		} );

		it( 'should work with soft breaks in parent', () => {
			setData( model, '<paragraph>"Foo <softBreak></softBreak>"Bar[]</paragraph>' );

			simulateTyping( '"' );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>"Foo <softBreak></softBreak>“Bar”</paragraph>' );
		} );

		it( 'should be disabled inside code blocks', () => {
			setData( model, '<codeBlock language="plaintext">some [] code</codeBlock>' );

			simulateTyping( '1/2' );

			const plugin = editor.plugins.get( 'TextTransformation' );

			expect( plugin.isEnabled ).to.be.false;
			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<codeBlock language="plaintext">some 1/2 code</codeBlock>' );
		} );

		it( 'can undo transformation', () => {
			setData( model, '<paragraph>Foo[]</paragraph>' );

			simulateTyping( '(c)' );

			editor.commands.execute( 'undo' );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>Foo(c)</paragraph>' );
		} );

		it( 'can undo transformation by pressing backspace', () => {
			const viewDocument = editor.editing.view.document;
			const deleteEvent = new DomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			setData( model, '<paragraph>Foo[]</paragraph>' );

			simulateTyping( '(c)' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>Foo(c)</paragraph>' );
		} );

		function testTransformation( transformFrom, transformTo, textInParagraph = 'A foo' ) {
			it( `should transform "${ transformFrom }" to "${ transformTo }"`, () => {
				setData( model, `<paragraph>${ textInParagraph }[]</paragraph>` );

				simulateTyping( transformFrom );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( `<paragraph>${ textInParagraph }${ transformTo }</paragraph>` );
			} );

			it( `should not transform "${ transformFrom }" to "${ transformTo }" inside text`, () => {
				setData( model, '<paragraph>[]</paragraph>' );

				// Insert text - should not be transformed.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( `${ textInParagraph }${ transformFrom } bar`, doc.selection.focus );
				} );

				// Enforce text watcher check after insertion.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( ' ', doc.selection.focus );
				} );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( `<paragraph>${ textInParagraph }${ transformFrom } bar </paragraph>` );
			} );

			it( `should not transform "${ transformFrom }" to "${ transformTo } if not right before selection"`, () => {
				setData( model, '<paragraph>[]</paragraph>' );

				// Insert text - should not be transformed.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( `${ textInParagraph }${ transformFrom }`, doc.selection.focus );
				} );

				simulateTyping( ' ' );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( `<paragraph>${ textInParagraph }${ transformFrom } </paragraph>` );
			} );
		}

		function testShouldNotTransform( transformFrom, transformTo ) {
			it( `should not transform "${ transformFrom }" to "${ transformTo }"`, () => {
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( transformFrom );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( `<paragraph>${ transformFrom }</paragraph>` );
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
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'CKE' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>CKEditor</paragraph>' );
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
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'user@example.com' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>user.at.example.com</paragraph>' );
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
				setData( model, '<paragraph>Foo. []</paragraph>' );

				simulateTyping( 'b' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>Foo. B</paragraph>' );
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
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'CKE' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>CKEditor</paragraph>' );

				simulateTyping( '(tm)' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>CKEditor™</paragraph>' );
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
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( 'CKE' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>CKEditor</paragraph>' );

				simulateTyping( '(tm)' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>CKEditor(tm)</paragraph>' );
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
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(tm)' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>(tm)</paragraph>' );

				simulateTyping( '(r)' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>(tm)®</paragraph>' );
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
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(tm)' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>(tm)</paragraph>' );

				simulateTyping( '...' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>(tm)…</paragraph>' );
			} );
		} );

		it( 'should not fail for unknown rule name', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						include: [ 'symbols', 'typo' ]
					}
				}
			} );
		} );

		it( 'should not fail for re-declared include rules config', () => {
			return createEditorInstance( {
				typing: {
					transformations: {
						extra: [ 'trademark' ]
					}
				}
			} ).then( () => {
				setData( model, '<paragraph>[]</paragraph>' );

				simulateTyping( '(tm)' );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>™</paragraph>' );
			} );
		} );
	} );

	function createEditorInstance( additionalConfig = {} ) {
		return ClassicTestEditor
			.create( editorElement, Object.assign( {
				plugins: [ Typing, Paragraph, Bold, TextTransformation, CodeBlock, UndoEditing ]
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
