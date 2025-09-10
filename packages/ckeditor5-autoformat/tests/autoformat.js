/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Autoformat } from '../src/autoformat.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ListEditing, TodoListEditing } from '@ckeditor/ckeditor5-list';
import { HeadingEditing, HeadingCommand } from '@ckeditor/ckeditor5-heading';
import { BoldEditing, StrikethroughEditing, CodeEditing, ItalicEditing } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLineEditing } from '@ckeditor/ckeditor5-horizontal-line';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { Typing } from '@ckeditor/ckeditor5-typing';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { stubUid } from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

describe( 'Autoformat', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	describe( 'Plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Enter,
					Paragraph,
					Autoformat,
					ListEditing,
					TodoListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					StrikethroughEditing,
					BlockQuoteEditing,
					CodeBlockEditing,
					HorizontalLineEditing,
					ShiftEnter,
					UndoEditing
				]
			} );

			model = editor.model;
			doc = model.document;

			stubUid();
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should have pluginName', () => {
			expect( Autoformat.pluginName ).to.equal( 'Autoformat' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( Autoformat.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( Autoformat.isPremiumPlugin ).to.be.false;
		} );

		it( 'should add keystroke accessibility info', () => {
			expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
				label: 'Revert autoformatting action',
				keystroke: 'Backspace'
			} );
		} );
	} );

	describe( 'with multi-block lists plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Enter,
					Typing,
					Paragraph,
					Autoformat,
					ListEditing,
					TodoListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					StrikethroughEditing,
					BlockQuoteEditing,
					CodeBlockEditing,
					HorizontalLineEditing,
					ShiftEnter,
					UndoEditing
				]
			} );

			model = editor.model;
			doc = model.document;

			stubUid();
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'Bulleted list', () => {
			it( 'should replace asterisk with bulleted list item', () => {
				_setModelData( model, '<paragraph>*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>'
				);
			} );

			it( 'should replace minus character with bulleted list item', () => {
				_setModelData( model, '<paragraph>-[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>'
				);
			} );

			it( 'should replace a non-empty paragraph using the asterisk', () => {
				_setModelData( model, '<paragraph>*[]sample text</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]sample text</paragraph>'
				);
			} );

			it( 'should not replace minus character when inside bulleted list item', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="bulleted">-[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">- []</paragraph>'
				);
			} );

			it( 'should not replace asterisk character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>* []</paragraph>' );
			} );

			it( 'should be converted from a to-do list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>'
				);
			} );

			it( 'should be converted from a checked to-do list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>'
				);
			} );

			it( 'should restore selection attributes', () => {
				_setModelData( model, '<paragraph></paragraph>' );

				editor.execute( 'bold' );
				editor.execute( 'italic' );
				editor.execute( 'insertText', { text: '*' } );
				editor.execute( 'insertText', { text: ' ' } );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listItemItalic="true" listType="bulleted"' +
						' selection:bold="true" selection:italic="true">' +
						'<$text bold="true" italic="true">[]</$text>' +
					'</paragraph>'
				);
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/16240.
			it( 'should keep original content on undo triggered by backspace', () => {
				const view = editor.editing.view;
				const viewDocument = view.document;
				const viewRoot = viewDocument.getRoot();

				_setModelData( model,
					'<paragraph></paragraph>' +
					'<paragraph>*[]</paragraph>'
				);

				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>'
				);

				const targetRanges = [ view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
					view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
				) ];

				viewDocument.fire( 'keydown', {
					domEvent: {
						preventDefault() {}
					}
				} );

				viewDocument.fire( 'beforeinput', {
					inputType: 'deleteContentBackward',
					targetRanges,
					domEvent: {
						preventDefault() {}
					}
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph>* []</paragraph>'
				);
			} );
		} );

		describe( 'Numbered list', () => {
			it( 'should replace digit with numbered list item using the dot format', () => {
				_setModelData( model, '<paragraph>1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>'
				);
			} );

			it( 'should replace digit with numbered list item using the parenthesis format', () => {
				_setModelData( model, '<paragraph>1)[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>'
				);
			} );

			it( 'should replace a non-empty paragraph using the parenthesis format', () => {
				_setModelData( model, '<paragraph>1)[]sample text</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]sample text</paragraph>'
				);
			} );

			it( 'should not replace digit character when there is no . or ) in the format', () => {
				_setModelData( model, '<paragraph>1[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>1 []</paragraph>' );
			} );

			it( 'should not replace digit character when inside numbered list item', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">1. []</paragraph>'
				);
			} );

			it( 'should not replace digit with numbered list item when digit is different than "1"', () => {
				_setModelData( model, '<paragraph>3.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>3. []</paragraph>' );
			} );

			it( 'should not replace digit character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>1. []</paragraph>' );
			} );

			it( 'should be converted from a header', () => {
				_setModelData( model, '<heading1>1.[]</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading1 listIndent="0" listItemId="a00" listType="numbered">[]</heading1>' );
			} );

			it( 'should be converted from a bulleted list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="bulleted">1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>'
				);
			} );

			it( 'should be converted from a to-do list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>'
				);
			} );

			it( 'should be converted from a checked to-do list', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">1.[]</paragraph>'
				);
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>'
				);
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/16240.
			it( 'should keep original content on undo triggered by backspace', () => {
				const view = editor.editing.view;
				const viewDocument = view.document;
				const viewRoot = viewDocument.getRoot();

				_setModelData( model,
					'<paragraph></paragraph>' +
					'<paragraph>1.[]</paragraph>'
				);

				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>'
				);

				const targetRanges = [ view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
					view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
				) ];

				viewDocument.fire( 'keydown', {
					domEvent: {
						preventDefault() {}
					}
				} );

				viewDocument.fire( 'beforeinput', {
					inputType: 'deleteContentBackward',
					targetRanges,
					domEvent: {
						preventDefault() {}
					}
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph>1. []</paragraph>'
				);
			} );

			it( 'should restore selection attributes', () => {
				_setModelData( model, '<paragraph></paragraph>' );

				editor.execute( 'bold' );
				editor.execute( 'italic' );
				editor.execute( 'insertText', { text: '1.' } );
				editor.execute( 'insertText', { text: ' ' } );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listItemItalic="true" listType="numbered"' +
						' selection:bold="true" selection:italic="true">' +
					'<$text bold="true" italic="true">[]</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'To-do list', () => {
			function insertBrackets( content = '' ) {
				model.change( writer => {
					writer.insertText( '[' + content + ']', doc.selection.getFirstPosition() );
				} );
			}

			describe( 'unchecked', () => {
				it( 'should replace empty square brackets', () => {
					_setModelData( model, '[]' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo">[]</paragraph>'
					);
				} );

				it( 'should replace square brackets with space inside', () => {
					_setModelData( model, '[]' );
					insertBrackets( ' ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo">[]</paragraph>'
					);
				} );

				it( 'should be converted from a paragraph', () => {
					_setModelData( model, '<paragraph>[]Sample text</paragraph>' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo">[]Sample text</paragraph>'
					);
				} );

				it( 'should be converted from a header', () => {
					_setModelData( model, '<heading1>[]Header text</heading1>' );
					insertBrackets( ' ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<heading1 listIndent="0" listItemId="a00" listType="todo">[]Header text</heading1>'
					);
				} );

				it( 'should be converted from a numbered list', () => {
					_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">[]Sample text</paragraph>' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo">[]Sample text</paragraph>'
					);
				} );

				it( 'should not replace the brackets if is not at the beginning of the line', () => {
					_setModelData( model, '<paragraph>Sample text []</paragraph>' );
					insertBrackets( ' ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Sample text [ ] []</paragraph>' );
				} );

				it( 'should not replace the brackets if it contains a text', () => {
					_setModelData( model, '[]' );
					insertBrackets( 'Foo' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>[Foo] []</paragraph>' );
				} );

				it( 'should not replace the brackets after <softBreak>', () => {
					_setModelData( model, '<paragraph>Foo<softBreak></softBreak>[]</paragraph>' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>[] []</paragraph>' );
				} );

				// See https://github.com/ckeditor/ckeditor5/issues/16240.
				it( 'should keep original content on undo triggered by backspace', () => {
					const view = editor.editing.view;
					const viewDocument = view.document;
					const viewRoot = viewDocument.getRoot();

					_setModelData( model,
						'<paragraph></paragraph>' +
						'<paragraph>[]</paragraph>'
					);

					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="todo">[]</paragraph>'
					);

					const targetRanges = [ view.createRange(
						view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
						view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
					) ];

					viewDocument.fire( 'keydown', {
						domEvent: {
							preventDefault() {}
						}
					} );

					viewDocument.fire( 'beforeinput', {
						inputType: 'deleteContentBackward',
						targetRanges,
						domEvent: {
							preventDefault() {}
						}
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<paragraph>[] []</paragraph>'
					);
				} );

				it( 'should restore selection attributes', () => {
					_setModelData( model, '<paragraph></paragraph>' );

					editor.execute( 'bold' );
					editor.execute( 'italic' );
					editor.execute( 'insertText', { text: '[]' } );
					editor.execute( 'insertText', { text: ' ' } );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" selection:bold="true" selection:italic="true">' +
							'<$text bold="true" italic="true">[]</$text>' +
						'</paragraph>'
					);
				} );
			} );

			describe( 'checked', () => {
				it( 'should replace square brackets with "x"', () => {
					_setModelData( model, '[]' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</paragraph>'
					);
				} );

				it( 'should replace square brackets with " x "', () => {
					_setModelData( model, '[]' );
					insertBrackets( ' x ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</paragraph>'
					);
				} );

				it( 'should replace square brackets with "x "', () => {
					_setModelData( model, '[]' );
					insertBrackets( 'x ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</paragraph>'
					);
				} );

				it( 'should replace square brackets with " x"', () => {
					_setModelData( model, '[]' );
					insertBrackets( ' x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</paragraph>'
					);
				} );

				it( 'should be converted from a paragraph', () => {
					_setModelData( model, '<paragraph>[]Sample text</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]Sample text</paragraph>'
					);
				} );

				it( 'should be converted from a header', () => {
					_setModelData( model, '<heading1>[]Header text</heading1>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<heading1 listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]Header text</heading1>'
					);
				} );

				it( 'should be converted from a numbered list', () => {
					_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">[]Sample text</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]Sample text</paragraph>'
					);
				} );

				it( 'should not replace the brackets if is not at the beginning of the line', () => {
					_setModelData( model, '<paragraph>Sample text []</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Sample text [x] []</paragraph>' );
				} );

				it( 'should not replace the brackets after <softBreak>', () => {
					_setModelData( model, '<paragraph>Foo<softBreak></softBreak>[]</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>[x] []</paragraph>' );
				} );

				// See https://github.com/ckeditor/ckeditor5/issues/16240.
				it( 'should keep original content on undo triggered by backspace', () => {
					const view = editor.editing.view;
					const viewDocument = view.document;
					const viewRoot = viewDocument.getRoot();

					_setModelData( model,
						'<paragraph></paragraph>' +
						'<paragraph>[]</paragraph>'
					);

					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</paragraph>'
					);

					const targetRanges = [ view.createRange(
						view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
						view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
					) ];

					viewDocument.fire( 'keydown', {
						domEvent: {
							preventDefault() {}
						}
					} );

					viewDocument.fire( 'beforeinput', {
						inputType: 'deleteContentBackward',
						targetRanges,
						domEvent: {
							preventDefault() {}
						}
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<paragraph>[x] []</paragraph>'
					);
				} );

				it( 'should restore selection attributes', () => {
					_setModelData( model, '<paragraph></paragraph>' );

					editor.execute( 'bold' );
					editor.execute( 'italic' );
					editor.execute( 'insertText', { text: '[x]' } );
					editor.execute( 'insertText', { text: ' ' } );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph listIndent="0" listItemId="a00" listType="todo" selection:bold="true" selection:italic="true"' +
							' todoListChecked="true">' +
							'<$text bold="true" italic="true">[]</$text>' +
						'</paragraph>'
					);
				} );
			} );
		} );

		describe( 'Heading', () => {
			it( 'should replace hash character with heading', () => {
				_setModelData( model, '<paragraph>#[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading1>[]</heading1>' );
			} );

			it( 'should replace two hash characters with heading level 2', () => {
				_setModelData( model, '<paragraph>##[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading2>[]</heading2>' );
			} );

			it( 'should not replace hash character when inside heading', () => {
				_setModelData( model, '<heading1>#[]</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading1># []</heading1>' );
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

						_setModelData( model, '<paragraph>#[]</paragraph>' );
						model.change( writer => {
							writer.insertText( ' ', doc.selection.getFirstPosition() );
						} );

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, { value: 'heading1' } );

						spy.resetHistory();

						_setModelData( model, '<paragraph>######[]</paragraph>' );
						model.change( writer => {
							writer.insertText( ' ', doc.selection.getFirstPosition() );
						} );

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, { value: 'heading6' } );

						return editor.destroy();
					} );
			} );

			it( 'should not replace if heading command is disabled', () => {
				_setModelData( model, '<paragraph>#[]</paragraph>' );

				model.change( writer => {
					editor.commands.get( 'heading' ).refresh = () => {
					};
					editor.commands.get( 'heading' ).isEnabled = false;

					writer.insertText( ' ', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph># []</paragraph>' );
			} );

			it( 'should not replace hash character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>#[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak># []</paragraph>' );
			} );

			it( 'should convert a header that already contains a text', () => {
				_setModelData( model, '<heading1>###[]foo</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading3>[]foo</heading3>' );
			} );

			it( 'should restore selection attributes', () => {
				_setModelData( model, '<paragraph></paragraph>' );

				editor.execute( 'bold' );
				editor.execute( 'italic' );
				editor.execute( 'insertText', { text: '#' } );
				editor.execute( 'insertText', { text: ' ' } );

				expect( _getModelData( model ) ).to.equal(
					'<heading1 selection:bold="true" selection:italic="true">' +
						'<$text bold="true" italic="true">[]</$text>' +
					'</heading1>'
				);
			} );
		} );

		describe( 'Block quote', () => {
			it( 'should replace greater-than character with block quote', () => {
				_setModelData( model, '<paragraph>>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
			} );

			it( 'should replace greater-than character in a non-empty paragraph', () => {
				_setModelData( model, '<paragraph>>[]foo</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>[]foo</paragraph></blockQuote>' );
			} );

			it( 'should wrap the heading if greater-than character was used', () => {
				_setModelData( model, '<heading1>>[]</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<blockQuote><heading1>[]</heading1></blockQuote>' );
			} );

			it( 'should replace greater-than character when inside numbered list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote><paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph></blockQuote>'
				);
			} );

			it( 'should replace greater-than character when inside buletted list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="bulleted">>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote><paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph></blockQuote>'
				);
			} );

			it( 'should replace greater-than character when inside to-do list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote><paragraph listIndent="0" listItemId="a00" listType="todo">[]</paragraph></blockQuote>'
				);
			} );

			it( 'should replace greater-than character when inside checked to-do list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'should not replace greater-than character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>> []</paragraph>' );
			} );

			it( 'should restore selection attributes', () => {
				_setModelData( model, '<paragraph></paragraph>' );

				editor.execute( 'bold' );
				editor.execute( 'italic' );
				editor.execute( 'insertText', { text: '>' } );
				editor.execute( 'insertText', { text: ' ' } );

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph selection:bold="true" selection:italic="true">' +
							'<$text bold="true" italic="true">[]</$text>' +
						'</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'Code block', () => {
			it( 'should replace triple grave accents with a code block', () => {
				_setModelData( model, '<paragraph>``[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
			} );

			it( 'should replace triple grave accents in a heading', () => {
				_setModelData( model, '<heading1>``[]</heading1>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
			} );

			it( 'should replace triple grave accents in a non-empty paragraph', () => {
				_setModelData( model, '<paragraph>``[]let foo = 1;</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]let foo = 1;</codeBlock>' );
			} );

			it( 'should replace triple grave accents in a numbered list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">``[]let foo = 1;</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<codeBlock language="plaintext" listIndent="0" listItemId="a00" listType="numbered">[]let foo = 1;</codeBlock>'
				);
			} );

			it( 'should replace triple grave accents in a bulleted list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="bulleted">``[]let foo = 1;</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<codeBlock language="plaintext" listIndent="0" listItemId="a00" listType="bulleted">[]let foo = 1;</codeBlock>'
				);
			} );

			it( 'should not replace triple grave accents when already in a code block', () => {
				_setModelData( model, '<codeBlock language="plaintext">``[]</codeBlock>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">```[]</codeBlock>' );
			} );

			it( 'should remember the last used language', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				// Mock the UI usage: execute the command with the specified language.
				editor.execute( 'codeBlock', { language: 'cpp' } );
				editor.execute( 'codeBlock' );

				// Typing '```' in a single change does not trigger the autoformat feature.
				model.change( writer => {
					writer.insertText( '``', doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="cpp">[]</codeBlock>' );
			} );

			it( 'should not restore selection attributes', () => {
				_setModelData( model, '<paragraph></paragraph>' );

				editor.execute( 'bold' );
				editor.execute( 'italic' );
				editor.execute( 'insertText', { text: '``' } );
				editor.execute( 'insertText', { text: '`' } );

				expect( _getModelData( model ) ).to.equal(
					'<codeBlock language="plaintext">[]</codeBlock>'
				);
			} );
		} );

		describe( 'Horizontal line', () => {
			it( 'should replace three dashes with a horizontal line', () => {
				_setModelData( model, '<paragraph>--[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<horizontalLine></horizontalLine><paragraph>[]</paragraph>' );
			} );

			it( 'should replace three dashes in a heading', () => {
				_setModelData( model, '<heading1>--[]</heading1>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<horizontalLine></horizontalLine><paragraph>[]</paragraph>' );
			} );

			it( 'should replace three dashes in a non-empty paragraph', () => {
				_setModelData( model, '<paragraph>--[]foo - bar</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<horizontalLine></horizontalLine><paragraph>[]foo - bar</paragraph>'
				);
			} );

			it( 'should replace three dashes in a numbered list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">--[]let foo = 1;</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<horizontalLine listIndent="0" listItemId="a00" listType="numbered"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="a00" listType="numbered">[]let foo = 1;</paragraph>'
				);
			} );

			it( 'should replace three dashes in a bulleted list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="bulleted">--[]let foo = 1;</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<horizontalLine listIndent="0" listItemId="a00" listType="bulleted"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]let foo = 1;</paragraph>'
				);
			} );

			it( 'should replace three dashes when inside todo list', () => {
				_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="todo">--[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<horizontalLine listIndent="0" listItemId="a00" listType="todo"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="a00" listType="todo">[]</paragraph>'
				);
			} );

			it( 'should replace three dashes when inside checked todo list', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">--[]</paragraph>'
				);
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<horizontalLine listIndent="0" listItemId="a00" listType="todo"></horizontalLine>' +
					'<paragraph listIndent="0" listItemId="a00" listType="todo">[]</paragraph>'
				);
			} );
		} );

		describe( 'Inline autoformat', () => {
			it( 'should replace both "**" with bold', () => {
				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'should replace both "*" with italic', () => {
				_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'should replace both "`" with code', () => {
				_setModelData( model, '<paragraph>`foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'should replace both "~~" with strikethrough', () => {
				_setModelData( model, '<paragraph>~~foobar~[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '~', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'nothing should be replaces when typing "*"', () => {
				_setModelData( model, '<paragraph>foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foobar*[]</paragraph>' );
			} );

			it( 'should format inside the text', () => {
				_setModelData( model, '<paragraph>foo **bar*[] baz</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text>[] baz</paragraph>' );
			} );

			it( 'should not format if the command is not enabled', () => {
				model.schema.addAttributeCheck( ( context, attributeName ) => {
					if ( attributeName == 'bold' ) {
						return false;
					}
				} );

				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );

				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
			} );

			it( 'should not format if the plugin is disabled', () => {
				editor.plugins.get( 'Autoformat' ).forceDisabled( 'Test' );

				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );

				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
			} );

			describe( 'should not format', () => {
				it( '* without space preceding it', () => {
					_setModelData( model, '<paragraph>fo*ob*ar[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '*', doc.selection.getFirstPosition() );
					} );

					expect( _getModelData( model ) ).to
						.equal( '<paragraph>fo*ob*ar*[]</paragraph>' );
				} );

				it( '__ without space preceding it', () => {
					_setModelData( model, '<paragraph>fo__ob__ar_[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '_', doc.selection.getFirstPosition() );
					} );

					expect( _getModelData( model ) ).to
						.equal( '<paragraph>fo__ob__ar__[]</paragraph>' );
				} );

				// https://github.com/ckeditor/ckeditor5/issues/2388
				it( 'snake_case sentences', () => {
					_setModelData( model, '<paragraph>foo_bar baz[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '_', doc.selection.getFirstPosition() );
					} );

					expect( _getModelData( model ) ).to
						.equal( '<paragraph>foo_bar baz_[]</paragraph>' );
				} );
			} );

			describe( 'with code element', () => {
				describe( 'should not format (inside)', () => {
					it( '* inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo *obar[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '*', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo *obar*[]</$text></paragraph>' );
					} );

					it( '__ inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo __obar_[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '_', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo __obar__[]</$text></paragraph>' );
					} );

					it( '~~ inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo~~obar~[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '~', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo~~obar~~[]</$text></paragraph>' );
					} );

					it( '` inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo`obar[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '`', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo`obar`[]</$text></paragraph>' );
					} );
				} );

				describe( 'should not format (across)', () => {
					it( '* across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo *o</$text>bar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '*', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo *o</$text>bar*[]</paragraph>' );
					} );
					it( '__ across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo __o</$text>bar_[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '_', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo __o</$text>bar__[]</paragraph>' );
					} );
					it( '~~ across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo~~o</$text>bar~[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '~', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo~~o</$text>bar~~[]</paragraph>' );
					} );
					it( '` across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo`o</$text>bar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '`', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo`o</$text>bar`[]</paragraph>' );
					} );
				} );

				describe( 'should format', () => {
					it( '* after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo*o</$text>b *ar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '*', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo*o</$text>b <$text italic="true">ar</$text>[]</paragraph>' );
					} );
					it( '__ after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo__o</$text>b __ar_[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '_', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo__o</$text>b <$text bold="true">ar</$text>[]</paragraph>' );
					} );
					it( '~~ after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo~~o</$text>b~~ar~[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '~', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo~~o</$text>b<$text strikethrough="true">ar</$text>[]</paragraph>' );
					} );
					it( '` after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo`o</$text>b`ar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '`', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo`o</$text>b<$text code="true">ar</$text>[]</paragraph>' );
					} );
				} );
			} );

			it( 'should work with <softBreak>s in paragraph', () => {
				_setModelData( model, '<paragraph>foo<softBreak></softBreak>**barbaz*[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo<softBreak></softBreak><$text bold="true">barbaz</$text>[]</paragraph>'
				);
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

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should not replace asterisk with bulleted list item', () => {
				_setModelData( model, '<paragraph>*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
			} );

			it( 'should not replace minus character with bulleted list item', () => {
				_setModelData( model, '<paragraph>-[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
			} );

			it( 'should not replace digit with numbered list item', () => {
				_setModelData( model, '<paragraph>1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
			} );

			it( 'should not replace square brackets with to-do list item', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '[]', doc.selection.getFirstPosition() );
				} );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>[] []</paragraph>' );
			} );

			it( 'should not replace square brackets containing "x" with checked to-do list item', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '[x]', doc.selection.getFirstPosition() );
				} );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>[x] []</paragraph>' );
			} );

			it( 'should not replace hash character with heading', () => {
				_setModelData( model, '<paragraph>#[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph># []</paragraph>' );
			} );

			it( 'should not replace two hash characters with heading level 2', () => {
				_setModelData( model, '<paragraph>##[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
			} );

			it( 'should not replace both "**" with bold', () => {
				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
			} );

			it( 'should not replace both "*" with italic', () => {
				_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
			} );

			it( 'should not replace both "`" with code', () => {
				_setModelData( model, '<paragraph>`foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
			} );

			it( 'should not replace ">" with block quote', () => {
				_setModelData( model, '<paragraph>>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
			} );

			it( 'should not replace "```" with code block', () => {
				_setModelData( model, '<paragraph>``[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>```[]</paragraph>' );
			} );

			it( 'should not replace "---" with horizontal line', () => {
				_setModelData( model, '<paragraph>--[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>---[]</paragraph>' );
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

						_setModelData( model, '<paragraph>##[]</paragraph>' );
						insertSpace();

						expect( _getModelData( model ) ).to.equal( '<paragraph>## []</paragraph>' );

						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( 'with single-block lists plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Enter,
					Paragraph,
					Autoformat,
					ListEditing,
					TodoListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					StrikethroughEditing,
					BlockQuoteEditing,
					CodeBlockEditing,
					HorizontalLineEditing,
					ShiftEnter,
					UndoEditing
				],
				list: { multiBlock: false }
			} );

			model = editor.model;
			doc = model.document;

			stubUid();
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'Bulleted list', () => {
			it( 'should replace asterisk with bulleted list item', () => {
				_setModelData( model, '<paragraph>*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="bulleted">[]</listItem>' );
			} );

			it( 'should replace minus character with bulleted list item', () => {
				_setModelData( model, '<paragraph>-[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="bulleted">[]</listItem>' );
			} );

			it( 'should replace a non-empty paragraph using the asterisk', () => {
				_setModelData( model, '<paragraph>*[]sample text</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">[]sample text</listItem>'
				);
			} );

			it( 'should not replace minus character when inside bulleted list item', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="bulleted">-[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">- []</listItem>'
				);
			} );

			it( 'should not replace asterisk character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>* []</paragraph>' );
			} );

			it( 'should be converted from a to-do list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo">*[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="bulleted">[]</listItem>' );
			} );

			it( 'should be converted from a checked to-do list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">*[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="bulleted">[]</listItem>' );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/16240.
			it( 'should keep original content on undo triggered by backspace', () => {
				const view = editor.editing.view;
				const viewDocument = view.document;
				const viewRoot = viewDocument.getRoot();

				_setModelData( model,
					'<paragraph></paragraph>' +
					'<paragraph>*[]</paragraph>'
				);

				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">[]</listItem>'
				);

				const targetRanges = [ view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
					view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
				) ];

				viewDocument.fire( 'keydown', {
					domEvent: {
						preventDefault() {}
					}
				} );

				viewDocument.fire( 'beforeinput', {
					inputType: 'deleteContentBackward',
					targetRanges,
					domEvent: {
						preventDefault() {}
					}
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph>* []</paragraph>'
				);
			} );
		} );

		describe( 'Numbered list', () => {
			it( 'should replace digit with numbered list item using the dot format', () => {
				_setModelData( model, '<paragraph>1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>' );
			} );

			it( 'should replace digit with numbered list item using the parenthesis format', () => {
				_setModelData( model, '<paragraph>1)[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>' );
			} );

			it( 'should replace a non-empty paragraph using the parenthesis format', () => {
				_setModelData( model, '<paragraph>1)[]sample text</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="numbered">[]sample text</listItem>'
				);
			} );

			it( 'should not replace digit character when there is no . or ) in the format', () => {
				_setModelData( model, '<paragraph>1[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>1 []</paragraph>' );
			} );

			it( 'should not replace digit character when inside numbered list item', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="numbered">1.[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="numbered">1. []</listItem>'
				);
			} );

			it( 'should not replace digit with numbered list item when digit is different than "1"', () => {
				_setModelData( model, '<paragraph>3.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>3. []</paragraph>' );
			} );

			it( 'should not replace digit character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>1. []</paragraph>' );
			} );

			it( 'should be converted from a header', () => {
				_setModelData( model, '<heading1>1.[]</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>' );
			} );

			it( 'should be converted from a bulleted list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="bulleted">1.[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>' );
			} );

			it( 'should be converted from a to-do list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo">1.[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>' );
			} );

			it( 'should be converted from a checked to-do list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">1.[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>' );
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/16240.
			it( 'should keep original content on undo triggered by backspace', () => {
				const view = editor.editing.view;
				const viewDocument = view.document;
				const viewRoot = viewDocument.getRoot();

				_setModelData( model,
					'<paragraph></paragraph>' +
					'<paragraph>1.[]</paragraph>'
				);

				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<listItem listIndent="0" listItemId="a00" listType="numbered">[]</listItem>'
				);

				const targetRanges = [ view.createRange(
					view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
					view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
				) ];

				viewDocument.fire( 'keydown', {
					domEvent: {
						preventDefault() {}
					}
				} );

				viewDocument.fire( 'beforeinput', {
					inputType: 'deleteContentBackward',
					targetRanges,
					domEvent: {
						preventDefault() {}
					}
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph>1. []</paragraph>'
				);
			} );
		} );

		describe( 'To-do list', () => {
			function insertBrackets( content = '' ) {
				model.change( writer => {
					writer.insertText( '[' + content + ']', doc.selection.getFirstPosition() );
				} );
			}

			describe( 'unchecked', () => {
				it( 'should replace empty square brackets', () => {
					_setModelData( model, '[]' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="todo">[]</listItem>' );
				} );

				it( 'should replace square brackets with space inside', () => {
					_setModelData( model, '[]' );
					insertBrackets( ' ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="todo">[]</listItem>' );
				} );

				it( 'should be converted from a paragraph', () => {
					_setModelData( model, '<paragraph>[]Sample text</paragraph>' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo">[]Sample text</listItem>'
					);
				} );

				it( 'should be converted from a header', () => {
					_setModelData( model, '<heading1>[]Header text</heading1>' );
					insertBrackets( ' ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo">[]Header text</listItem>'
					);
				} );

				it( 'should be converted from a numbered list', () => {
					_setModelData( model, '<paragraph listIndent="0" listItemId="a00" listType="numbered">[]Sample text</paragraph>' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo">[]Sample text</listItem>'
					);
				} );

				it( 'should not replace the brackets if is not at the beginning of the line', () => {
					_setModelData( model, '<paragraph>Sample text []</paragraph>' );
					insertBrackets( ' ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Sample text [ ] []</paragraph>' );
				} );

				it( 'should not replace the brackets if it contains a text', () => {
					_setModelData( model, '[]' );
					insertBrackets( 'Foo' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>[Foo] []</paragraph>' );
				} );

				it( 'should not replace the brackets after <softBreak>', () => {
					_setModelData( model, '<paragraph>Foo<softBreak></softBreak>[]</paragraph>' );
					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>[] []</paragraph>' );
				} );

				// See https://github.com/ckeditor/ckeditor5/issues/16240.
				it( 'should keep original content on undo triggered by backspace', () => {
					const view = editor.editing.view;
					const viewDocument = view.document;
					const viewRoot = viewDocument.getRoot();

					_setModelData( model,
						'<paragraph></paragraph>' +
						'<paragraph>[]</paragraph>'
					);

					insertBrackets();
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listItemId="a00" listType="todo">[]</listItem>'
					);

					const targetRanges = [ view.createRange(
						view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
						view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
					) ];

					viewDocument.fire( 'keydown', {
						domEvent: {
							preventDefault() {}
						}
					} );

					viewDocument.fire( 'beforeinput', {
						inputType: 'deleteContentBackward',
						targetRanges,
						domEvent: {
							preventDefault() {}
						}
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<paragraph>[] []</paragraph>'
					);
				} );
			} );

			describe( 'checked', () => {
				it( 'should replace square brackets with "x"', () => {
					_setModelData( model, '[]' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</listItem>'
					);
				} );

				it( 'should replace square brackets with " x "', () => {
					_setModelData( model, '[]' );
					insertBrackets( ' x ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</listItem>'
					);
				} );

				it( 'should replace square brackets with "x "', () => {
					_setModelData( model, '[]' );
					insertBrackets( 'x ' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</listItem>'
					);
				} );

				it( 'should replace square brackets with " x"', () => {
					_setModelData( model, '[]' );
					insertBrackets( ' x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</listItem>'
					);
				} );

				it( 'should be converted from a paragraph', () => {
					_setModelData( model, '<paragraph>[]Sample text</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]Sample text</listItem>'
					);
				} );

				it( 'should be converted from a header', () => {
					_setModelData( model, '<heading1>[]Header text</heading1>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]Header text</listItem>'
					);
				} );

				it( 'should be converted from a numbered list', () => {
					_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="numbered">[]Sample text</listItem>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]Sample text</listItem>'
					);
				} );

				it( 'should not replace the brackets if is not at the beginning of the line', () => {
					_setModelData( model, '<paragraph>Sample text []</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Sample text [x] []</paragraph>' );
				} );

				it( 'should not replace the brackets after <softBreak>', () => {
					_setModelData( model, '<paragraph>Foo<softBreak></softBreak>[]</paragraph>' );
					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>[x] []</paragraph>' );
				} );

				// See https://github.com/ckeditor/ckeditor5/issues/16240.
				it( 'should keep original content on undo triggered by backspace', () => {
					const view = editor.editing.view;
					const viewDocument = view.document;
					const viewRoot = viewDocument.getRoot();

					_setModelData( model,
						'<paragraph></paragraph>' +
						'<paragraph>[]</paragraph>'
					);

					insertBrackets( 'x' );
					insertSpace();

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">[]</listItem>'
					);

					const targetRanges = [ view.createRange(
						view.createPositionAt( viewRoot.getChild( 0 ), 0 ),
						view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ), 0 )
					) ];

					viewDocument.fire( 'keydown', {
						domEvent: {
							preventDefault() {}
						}
					} );

					viewDocument.fire( 'beforeinput', {
						inputType: 'deleteContentBackward',
						targetRanges,
						domEvent: {
							preventDefault() {}
						}
					} );

					expect( _getModelData( model ) ).to.equal(
						'<paragraph></paragraph>' +
						'<paragraph>[x] []</paragraph>'
					);
				} );
			} );
		} );

		describe( 'Heading', () => {
			it( 'should replace hash character with heading', () => {
				_setModelData( model, '<paragraph>#[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading1>[]</heading1>' );
			} );

			it( 'should replace two hash characters with heading level 2', () => {
				_setModelData( model, '<paragraph>##[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading2>[]</heading2>' );
			} );

			it( 'should not replace hash character when inside heading', () => {
				_setModelData( model, '<heading1>#[]</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading1># []</heading1>' );
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

						_setModelData( model, '<paragraph>#[]</paragraph>' );
						model.change( writer => {
							writer.insertText( ' ', doc.selection.getFirstPosition() );
						} );

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, { value: 'heading1' } );

						spy.resetHistory();

						_setModelData( model, '<paragraph>######[]</paragraph>' );
						model.change( writer => {
							writer.insertText( ' ', doc.selection.getFirstPosition() );
						} );

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, { value: 'heading6' } );

						return editor.destroy();
					} );
			} );

			it( 'should not replace if heading command is disabled', () => {
				_setModelData( model, '<paragraph>#[]</paragraph>' );

				model.change( writer => {
					editor.commands.get( 'heading' ).refresh = () => {
					};
					editor.commands.get( 'heading' ).isEnabled = false;

					writer.insertText( ' ', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph># []</paragraph>' );
			} );

			it( 'should not replace hash character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>#[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak># []</paragraph>' );
			} );

			it( 'should convert a header that already contains a text', () => {
				_setModelData( model, '<heading1>###[]foo</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<heading3>[]foo</heading3>' );
			} );
		} );

		describe( 'Block quote', () => {
			it( 'should replace greater-than character with block quote', () => {
				_setModelData( model, '<paragraph>>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
			} );

			it( 'should replace greater-than character in a non-empty paragraph', () => {
				_setModelData( model, '<paragraph>>[]foo</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>[]foo</paragraph></blockQuote>' );
			} );

			it( 'should wrap the heading if greater-than character was used', () => {
				_setModelData( model, '<heading1>>[]</heading1>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<blockQuote><heading1>[]</heading1></blockQuote>' );
			} );

			it( 'should not replace greater-than character when inside numbered list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="numbered">>[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="numbered">> []</listItem>'
				);
			} );

			it( 'should not replace greater-than character when inside buletted list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="bulleted">>[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">> []</listItem>'
				);
			} );

			it( 'should not replace greater-than character when inside to-do list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo">>[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="todo">> []</listItem>' );
			} );

			it( 'should not replace greater-than character when inside checked to-do list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">>[]</listItem>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">> []</listItem>'
				);
			} );

			it( 'should not replace greater-than character after <softBreak>', () => {
				_setModelData( model, '<paragraph>Foo<softBreak></softBreak>>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>Foo<softBreak></softBreak>> []</paragraph>' );
			} );
		} );

		describe( 'Code block', () => {
			it( 'should replace triple grave accents with a code block', () => {
				_setModelData( model, '<paragraph>``[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
			} );

			it( 'should replace triple grave accents in a heading', () => {
				_setModelData( model, '<heading1>``[]</heading1>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
			} );

			it( 'should replace triple grave accents in a non-empty paragraph', () => {
				_setModelData( model, '<paragraph>``[]let foo = 1;</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]let foo = 1;</codeBlock>' );
			} );

			it( 'should not replace triple grave accents in a numbered list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="numbered">``[]let foo = 1;</listItem>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="numbered">```[]let foo = 1;</listItem>'
				);
			} );

			it( 'should not replace triple grave accents in a bulleted list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="bulleted">``[]let foo = 1;</listItem>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">```[]let foo = 1;</listItem>'
				);
			} );

			it( 'should not replace triple grave accents when already in a code block', () => {
				_setModelData( model, '<codeBlock language="plaintext">``[]</codeBlock>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">```[]</codeBlock>' );
			} );

			it( 'should remember the last used language', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				// Mock the UI usage: execute the command with the specified language.
				editor.execute( 'codeBlock', { language: 'cpp' } );
				editor.execute( 'codeBlock' );

				// Typing '```' in a single change does not trigger the autoformat feature.
				model.change( writer => {
					writer.insertText( '``', doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="cpp">[]</codeBlock>' );
			} );
		} );

		describe( 'Horizontal line', () => {
			it( 'should replace three dashes with a horizontal line', () => {
				_setModelData( model, '<paragraph>--[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<horizontalLine></horizontalLine><paragraph>[]</paragraph>' );
			} );

			it( 'should replace three dashes in a heading', () => {
				_setModelData( model, '<heading1>--[]</heading1>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<horizontalLine></horizontalLine><paragraph>[]</paragraph>' );
			} );

			it( 'should replace three dashes in a non-empty paragraph', () => {
				_setModelData( model, '<paragraph>--[]foo - bar</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<horizontalLine></horizontalLine><paragraph>[]foo - bar</paragraph>'
				);
			} );

			it( 'should not replace three dashes when inside bulleted list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="bulleted">--[]</listItem>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">---[]</listItem>'
				);
			} );

			it( 'should not replace three dashes when inside numbered list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="numbered">--[]</listItem>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="numbered">---[]</listItem>'
				);
			} );

			it( 'should not replace three dashes when inside todo list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo">--[]</listItem>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listItemId="a00" listType="todo">---[]</listItem>' );
			} );

			it( 'should not replace three dashes when inside checked todo list', () => {
				_setModelData( model, '<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">--[]</listItem>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">---[]</listItem>'
				);
			} );
		} );

		describe( 'Inline autoformat', () => {
			it( 'should replace both "**" with bold', () => {
				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'should replace both "*" with italic', () => {
				_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'should replace both "`" with code', () => {
				_setModelData( model, '<paragraph>`foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'should replace both "~~" with strikethrough', () => {
				_setModelData( model, '<paragraph>~~foobar~[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '~', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
			} );

			it( 'nothing should be replaces when typing "*"', () => {
				_setModelData( model, '<paragraph>foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foobar*[]</paragraph>' );
			} );

			it( 'should format inside the text', () => {
				_setModelData( model, '<paragraph>foo **bar*[] baz</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text>[] baz</paragraph>' );
			} );

			it( 'should not format if the command is not enabled', () => {
				model.schema.addAttributeCheck( ( context, attributeName ) => {
					if ( attributeName == 'bold' ) {
						return false;
					}
				} );

				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );

				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
			} );

			it( 'should not format if the plugin is disabled', () => {
				editor.plugins.get( 'Autoformat' ).forceDisabled( 'Test' );

				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );

				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
			} );

			describe( 'should not format', () => {
				it( '* without space preceding it', () => {
					_setModelData( model, '<paragraph>fo*ob*ar[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '*', doc.selection.getFirstPosition() );
					} );

					expect( _getModelData( model ) ).to
						.equal( '<paragraph>fo*ob*ar*[]</paragraph>' );
				} );

				it( '__ without space preceding it', () => {
					_setModelData( model, '<paragraph>fo__ob__ar_[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '_', doc.selection.getFirstPosition() );
					} );

					expect( _getModelData( model ) ).to
						.equal( '<paragraph>fo__ob__ar__[]</paragraph>' );
				} );

				// https://github.com/ckeditor/ckeditor5/issues/2388
				it( 'snake_case sentences', () => {
					_setModelData( model, '<paragraph>foo_bar baz[]</paragraph>' );

					model.change( writer => {
						writer.insertText( '_', doc.selection.getFirstPosition() );
					} );

					expect( _getModelData( model ) ).to
						.equal( '<paragraph>foo_bar baz_[]</paragraph>' );
				} );
			} );

			describe( 'with code element', () => {
				describe( 'should not format (inside)', () => {
					it( '* inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo *obar[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '*', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo *obar*[]</$text></paragraph>' );
					} );

					it( '__ inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo __obar_[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '_', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo __obar__[]</$text></paragraph>' );
					} );

					it( '~~ inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo~~obar~[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '~', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo~~obar~~[]</$text></paragraph>' );
					} );

					it( '` inside', () => {
						_setModelData( model, '<paragraph><$text code="true">fo`obar[]</$text></paragraph>' );

						model.change( writer => {
							writer.insertText( '`', { code: true }, doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo`obar`[]</$text></paragraph>' );
					} );
				} );

				describe( 'should not format (across)', () => {
					it( '* across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo *o</$text>bar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '*', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo *o</$text>bar*[]</paragraph>' );
					} );
					it( '__ across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo __o</$text>bar_[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '_', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo __o</$text>bar__[]</paragraph>' );
					} );
					it( '~~ across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo~~o</$text>bar~[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '~', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo~~o</$text>bar~~[]</paragraph>' );
					} );
					it( '` across', () => {
						_setModelData( model, '<paragraph><$text code="true">fo`o</$text>bar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '`', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo`o</$text>bar`[]</paragraph>' );
					} );
				} );

				describe( 'should format', () => {
					it( '* after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo*o</$text>b *ar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '*', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo*o</$text>b <$text italic="true">ar</$text>[]</paragraph>' );
					} );
					it( '__ after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo__o</$text>b __ar_[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '_', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo__o</$text>b <$text bold="true">ar</$text>[]</paragraph>' );
					} );
					it( '~~ after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo~~o</$text>b~~ar~[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '~', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo~~o</$text>b<$text strikethrough="true">ar</$text>[]</paragraph>' );
					} );
					it( '` after', () => {
						_setModelData( model, '<paragraph><$text code="true">fo`o</$text>b`ar[]</paragraph>' );

						model.change( writer => {
							writer.insertText( '`', doc.selection.getFirstPosition() );
						} );

						expect( _getModelData( model ) ).to
							.equal( '<paragraph><$text code="true">fo`o</$text>b<$text code="true">ar</$text>[]</paragraph>' );
					} );
				} );
			} );

			it( 'should work with <softBreak>s in paragraph', () => {
				_setModelData( model, '<paragraph>foo<softBreak></softBreak>**barbaz*[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>foo<softBreak></softBreak><$text bold="true">barbaz</$text>[]</paragraph>'
				);
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

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should not replace asterisk with bulleted list item', () => {
				_setModelData( model, '<paragraph>*[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
			} );

			it( 'should not replace minus character with bulleted list item', () => {
				_setModelData( model, '<paragraph>-[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
			} );

			it( 'should not replace digit with numbered list item', () => {
				_setModelData( model, '<paragraph>1.[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
			} );

			it( 'should not replace square brackets with to-do list item', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '[]', doc.selection.getFirstPosition() );
				} );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>[] []</paragraph>' );
			} );

			it( 'should not replace square brackets containing "x" with checked to-do list item', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '[x]', doc.selection.getFirstPosition() );
				} );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>[x] []</paragraph>' );
			} );

			it( 'should not replace hash character with heading', () => {
				_setModelData( model, '<paragraph>#[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph># []</paragraph>' );
			} );

			it( 'should not replace two hash characters with heading level 2', () => {
				_setModelData( model, '<paragraph>##[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
			} );

			it( 'should not replace both "**" with bold', () => {
				_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
			} );

			it( 'should not replace both "*" with italic', () => {
				_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '*', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
			} );

			it( 'should not replace both "`" with code', () => {
				_setModelData( model, '<paragraph>`foobar[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
			} );

			it( 'should not replace ">" with block quote', () => {
				_setModelData( model, '<paragraph>>[]</paragraph>' );
				insertSpace();

				expect( _getModelData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
			} );

			it( 'should not replace "```" with code block', () => {
				_setModelData( model, '<paragraph>``[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '`', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>```[]</paragraph>' );
			} );

			it( 'should not replace "---" with horizontal line', () => {
				_setModelData( model, '<paragraph>--[]</paragraph>' );
				model.change( writer => {
					writer.insertText( '-', doc.selection.getFirstPosition() );
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>---[]</paragraph>' );
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
						},
						list: { multiBlock: false }
					} )
					.then( editor => {
						model = editor.model;
						doc = model.document;

						_setModelData( model, '<paragraph>##[]</paragraph>' );
						insertSpace();

						expect( _getModelData( model ) ).to.equal( '<paragraph>## []</paragraph>' );

						return editor.destroy();
					} );
			} );
		} );
	} );

	function insertSpace() {
		model.change( writer => {
			writer.insertText( ' ', doc.selection.getFirstPosition() );
		} );
	}
} );
