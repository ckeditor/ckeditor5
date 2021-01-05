/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Autoformat from '../src/autoformat';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import StrikethroughEditing from '@ckeditor/ckeditor5-basic-styles/src/strikethrough/strikethroughediting';
import CodeEditing from '@ckeditor/ckeditor5-basic-styles/src/code/codeediting';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import HeadingCommand from '@ckeditor/ckeditor5-heading/src/headingcommand';

describe( 'Autoformat', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [
					Enter,
					Paragraph,
					Autoformat,
					ListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					StrikethroughEditing,
					BlockQuoteEditing,
					CodeBlockEditing,
					ShiftEnter
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'Bulleted list', () => {
		it( 'should replace asterisk with bulleted list item', () => {
			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );
		} );

		it( 'should replace minus character with bulleted list item', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );
		} );

		it( 'should replace a non-empty paragraph using the asterisk', () => {
			setData( model, '<paragraph>*[]sample text</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]sample text</listItem>' );
		} );

		it( 'should not replace minus character when inside bulleted list item', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted">-[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">- []</listItem>' );
		} );

		it( 'should not replace asterisk character after <softBreak>', () => {
			setData( model, '<paragraph>Foo<softBreak></softBreak>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>* []</paragraph>' );
		} );
	} );

	describe( 'Numbered list', () => {
		it( 'should replace digit with numbered list item using the dot format', () => {
			setData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
		} );

		it( 'should replace digit with numbered list item using the parenthesis format', () => {
			setData( model, '<paragraph>1)[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
		} );

		it( 'should replace a non-empty paragraph using the parenthesis format', () => {
			setData( model, '<paragraph>1)[]sample text</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]sample text</listItem>' );
		} );

		it( 'should not replace digit character when there is no . or ) in the format', () => {
			setData( model, '<paragraph>1[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>1 []</paragraph>' );
		} );

		it( 'should not replace digit character when inside numbered list item', () => {
			setData( model, '<listItem listIndent="0" listType="numbered">1.[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">1. []</listItem>' );
		} );

		it( 'should not replace digit with numbered list item when digit is different than "1"', () => {
			setData( model, '<paragraph>3.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>3. []</paragraph>' );
		} );

		it( 'should not replace digit character after <softBreak>', () => {
			setData( model, '<paragraph>Foo<softBreak></softBreak>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>1. []</paragraph>' );
		} );

		it( 'should be converted from a header', () => {
			setData( model, '<heading1>1.[]</heading1>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
		} );

		it( 'should be converted from a bulleted list', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted">1.[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
		} );
	} );

	describe( 'Heading', () => {
		it( 'should replace hash character with heading', () => {
			setData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'should replace two hash characters with heading level 2', () => {
			setData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading2>[]</heading2>' );
		} );

		it( 'should not replace hash character when inside heading', () => {
			setData( model, '<heading1>#[]</heading1>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1># []</heading1>' );
		} );

		it( 'should work with heading1-heading6 commands regardless of the config of the heading feature', () => {
			const command = new HeadingCommand( editor, [ 'heading1', 'heading6' ] );

			const spy = sinon.spy( command, 'execute' );

			function HeadingPlugin( editor ) {
				editor.commands.add( 'heading', command );
				command.refresh();
			}

			return VirtualTestEditor
				.create( {
					plugins: [
						Paragraph, Autoformat, HeadingPlugin
					]
				} )
				.then( editor => {
					const model = editor.model;
					const doc = model.document;

					setData( model, '<paragraph>#[]</paragraph>' );
					model.change( writer => {
						writer.insertText( ' ', doc.selection.getFirstPosition() );
					} );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWithExactly( spy, { value: 'heading1' } );

					spy.resetHistory();

					setData( model, '<paragraph>######[]</paragraph>' );
					model.change( writer => {
						writer.insertText( ' ', doc.selection.getFirstPosition() );
					} );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWithExactly( spy, { value: 'heading6' } );

					return editor.destroy();
				} );
		} );

		it( 'should not replace if heading command is disabled', () => {
			setData( model, '<paragraph>#[]</paragraph>' );

			model.change( writer => {
				editor.commands.get( 'heading' ).refresh = () => {};
				editor.commands.get( 'heading' ).isEnabled = false;

				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should not replace hash character after <softBreak>', () => {
			setData( model, '<paragraph>Foo<softBreak></softBreak>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak># []</paragraph>' );
		} );

		it( 'should convert a header that already contains a text', () => {
			setData( model, '<heading1>###[]foo</heading1>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading3>[]foo</heading3>' );
		} );
	} );

	describe( 'Block quote', () => {
		it( 'should replace greater-than character with block quote', () => {
			setData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
		} );

		it( 'should replace greater-than character in a non-empty paragraph', () => {
			setData( model, '<paragraph>>[]foo</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<blockQuote><paragraph>[]foo</paragraph></blockQuote>' );
		} );

		it( 'should wrap the heading if greater-than character was used', () => {
			setData( model, '<heading1>>[]</heading1>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<blockQuote><heading1>[]</heading1></blockQuote>' );
		} );

		it( 'should not replace greater-than character when inside numbered list', () => {
			setData( model, '<listItem listIndent="0" listType="numbered">1. >[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">1. > []</listItem>' );
		} );

		it( 'should not replace greater-than character when inside buletted list', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted">1. >[]</listItem>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">1. > []</listItem>' );
		} );

		it( 'should not replace greater-than character after <softBreak>', () => {
			setData( model, '<paragraph>Foo<softBreak></softBreak>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>> []</paragraph>' );
		} );
	} );

	describe( 'Code block', () => {
		it( 'should replace triple grave accents with a code block', () => {
			setData( model, '<paragraph>``[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
		} );

		it( 'should replace triple grave accents in a heading', () => {
			setData( model, '<heading1>``[]</heading1>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
		} );

		it( 'should replace triple grave accents in a non-empty paragraph', () => {
			setData( model, '<paragraph>``[]let foo = 1;</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<codeBlock language="plaintext">[]let foo = 1;</codeBlock>' );
		} );

		it( 'should not replace triple grave accents when already in a code block', () => {
			setData( model, '<codeBlock language="plaintext">``[]</codeBlock>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<codeBlock language="plaintext">```[]</codeBlock>' );
		} );

		it( 'should not replace triple grave accents when inside numbered list', () => {
			setData( model, '<listItem listIndent="0" listType="numbered">1. ``[]</listItem>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">1. ```[]</listItem>' );
		} );

		it( 'should not replace triple grave accents when inside buletted list', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted">1. ``[]</listItem>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">1. ```[]</listItem>' );
		} );
	} );

	describe( 'Inline autoformat', () => {
		it( 'should replace both "**" with bold', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both "*" with italic', () => {
			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both "`" with code', () => {
			setData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both "~~" with strikethrough', () => {
			setData( model, '<paragraph>~~foobar~[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '~', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'nothing should be replaces when typing "*"', () => {
			setData( model, '<paragraph>foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foobar*[]</paragraph>' );
		} );

		it( 'should format inside the text', () => {
			setData( model, '<paragraph>foo **bar*[] baz</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text>[] baz</paragraph>' );
		} );

		it( 'should not format if the command is not enabled', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( attributeName == 'bold' ) {
					return false;
				}
			} );

			setData( model, '<paragraph>**foobar*[]</paragraph>' );

			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should not format if the plugin is disabled', () => {
			editor.plugins.get( 'Autoformat' ).forceDisabled( 'Test' );

			setData( model, '<paragraph>**foobar*[]</paragraph>' );

			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		describe( 'with code element', () => {
			describe( 'should not format (inside)', () => {
				it( '* inside', () => {
					setData( model, '<paragraph><$text code="true">fo*obar[]</$text></paragraph>' );

					model.change( writer => {
						writer.insertText( '*', { code: true }, doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo*obar*[]</$text></paragraph>' );
				} );

				it( '__ inside', () => {
					setData( model, '<paragraph><$text code="true">fo__obar_[]</$text></paragraph>' );

					model.change( writer => {
						writer.insertText( '_', { code: true }, doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo__obar__[]</$text></paragraph>' );
				} );

				it( '~~ inside', () => {
					setData( model, '<paragraph><$text code="true">fo~~obar~[]</$text></paragraph>' );

					model.change( writer => {
						writer.insertText( '~', { code: true }, doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo~~obar~~[]</$text></paragraph>' );
				} );

				it( '` inside', () => {
					setData( model, '<paragraph><$text code="true">fo`obar[]</$text></paragraph>' );

					model.change( writer => {
						writer.insertText( '`', { code: true }, doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo`obar`[]</$text></paragraph>' );
				} );
			} );

			describe( 'should not format (across)', () => {
				it( '* across', () => {
					setData( model, '<paragraph><$text code="true">fo*o</$text>bar[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '*', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo*o</$text>bar*[]</paragraph>' );
				} );
				it( '__ across', () => {
					setData( model, '<paragraph><$text code="true">fo__o</$text>bar_[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '_', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo__o</$text>bar__[]</paragraph>' );
				} );
				it( '~~ across', () => {
					setData( model, '<paragraph><$text code="true">fo~~o</$text>bar~[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '~', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo~~o</$text>bar~~[]</paragraph>' );
				} );
				it( '` across', () => {
					setData( model, '<paragraph><$text code="true">fo`o</$text>bar[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '`', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo`o</$text>bar`[]</paragraph>' );
				} );
			} );

			describe( 'should format', () => {
				it( '* after', () => {
					setData( model, '<paragraph><$text code="true">fo*o</$text>b*ar[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '*', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo*o</$text>b<$text italic="true">ar</$text>[]</paragraph>' );
				} );
				it( '__ after', () => {
					setData( model, '<paragraph><$text code="true">fo__o</$text>b__ar_[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '_', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo__o</$text>b<$text bold="true">ar</$text>[]</paragraph>' );
				} );
				it( '~~ after', () => {
					setData( model, '<paragraph><$text code="true">fo~~o</$text>b~~ar~[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '~', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo~~o</$text>b<$text strikethrough="true">ar</$text>[]</paragraph>' );
				} );
				it( '` after', () => {
					setData( model, '<paragraph><$text code="true">fo`o</$text>b`ar[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '`', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to
						.equal( '<paragraph><$text code="true">fo`o</$text>b<$text code="true">ar</$text>[]</paragraph>' );
				} );
			} );
		} );

		it( 'should work with <softBreak>s in paragraph', () => {
			setData( model, '<paragraph>foo<softBreak></softBreak>**barbaz*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo<softBreak></softBreak><$text bold="true">barbaz</$text>[]</paragraph>' );
		} );
	} );

	describe( 'without commands', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Enter, Paragraph, Autoformat ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should not replace asterisk with bulleted list item', () => {
			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
		} );

		it( 'should not replace minus character with bulleted list item', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should not replace digit with numbered list item', () => {
			setData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should not replace hash character with heading', () => {
			setData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should not replace two hash characters with heading level 2', () => {
			setData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
		} );

		it( 'should not replace both "**" with bold', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should not replace both "*" with italic', () => {
			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should not replace both "`" with code', () => {
			setData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
		} );

		it( 'should not replace ">" with block quote', () => {
			setData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
		} );

		it( 'should not replace "```" with code block', () => {
			setData( model, '<paragraph>``[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph>```[]</paragraph>' );
		} );

		it( 'should use only configured headings', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Enter, Paragraph, Autoformat, ListEditing, HeadingEditing ],
					heading: {
						options: [
							{ model: 'paragraph' },
							{ model: 'heading1', view: 'h2' }
						]
					}
				} )
				.then( editor => {
					model = editor.model;
					doc = model.document;

					setData( model, '<paragraph>##[]</paragraph>' );
					model.change( writer => {
						writer.insertText( ' ', doc.selection.getFirstPosition() );
					} );

					expect( getData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
				} );
		} );
	} );
} );
