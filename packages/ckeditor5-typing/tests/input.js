/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { ViewDocumentDomEventData, _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { toWidget, Widget } from '@ckeditor/ckeditor5-widget';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { insertAt, env } from '@ckeditor/ckeditor5-utils';

import { Input } from '../src/input.js';
import { InsertTextCommand } from '../src/inserttextcommand.js';

describe( 'Input', () => {
	afterEach( () => {
		vi.useRealTimers();
	} );

	describe( 'common', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy, scrollToTheSelectionSpy, rendererUpdateTextNodeSpy,
			typingQueuePushSpy, typingQueueFlushSpy;

		beforeEach( async () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph, Bold, Widget, CodeBlock, BlockQuote ],
				initialData: '<p>foo</p>'
			} );

			view = editor.editing.view;
			viewDocument = view.document;
			scrollToTheSelectionSpy = vi.spyOn( view, 'scrollToTheSelection' ).mockImplementation( () => {} );
			rendererUpdateTextNodeSpy = vi.spyOn( view._renderer, '_updateTextNodeInternal' );

			const inputPlugin = editor.plugins.get( 'Input' );

			typingQueuePushSpy = vi.spyOn( inputPlugin._typingQueue, 'push' );
			typingQueueFlushSpy = vi.spyOn( inputPlugin._typingQueue, 'flush' );

			editor.model.schema.register( 'widget', { inheritAllFrom: '$blockObject' } );
			editor.conversion.for( 'downcast' ).elementToElement( {
				model: 'widget',
				view: ( modelItem, { writer } ) => {
					return toWidget( writer.createContainerElement( 'div' ), writer, { label: 'element label' } );
				}
			} );

			viewDocument.isFocused = true;
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		it( 'should define #pluginName', () => {
			expect( Input.pluginName ).to.equal( 'Input' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( Input.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( Input.isPremiumPlugin ).to.be.false;
		} );

		describe( 'basic typing', () => {
			beforeEach( () => {
				insertTextCommandSpy = vi.spyOn( editor.commands.get( 'insertText' ), 'execute' ).mockImplementation( () => {} );
			} );

			it( 'should register the insert text command', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				expect( editor.commands.get( 'insertText' ) ).to.be.instanceOf( InsertTextCommand );

				await editor.destroy();
			} );

			it( 'should register the input command (deprecated) with the same command instance', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Input ]
				} );

				const insertTextCommand = editor.commands.get( 'insertText' );

				expect( editor.commands.get( 'input' ) ).to.equal( insertTextCommand );

				await editor.destroy();
			} );

			it( 'should not preventDefault() the original beforeinput event if not composing', () => {
				const spy = vi.fn();

				viewDocument.fire( 'insertText', {
					preventDefault: spy,
					selection: viewDocument.selection,
					text: 'bar',
					domEvent: {}
				} );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not preventDefault() the original beforeinput event if composing', () => {
				const spy = vi.fn();

				viewDocument.isComposing = true;

				viewDocument.fire( 'insertText', {
					preventDefault: spy,
					selection: viewDocument.selection,
					text: 'bar',
					domEvent: {}
				} );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should preventDefault() the original beforeinput event if insertText command is disabled', () => {
				const spy = vi.fn();

				editor.commands.get( 'insertText' ).forceDisabled();

				viewDocument.fire( 'insertText', {
					preventDefault: spy,
					selection: viewDocument.selection,
					text: 'bar',
					domEvent: {}
				} );

				expect( spy ).toHaveBeenCalledOnce();
				expect( insertTextCommandSpy ).not.toHaveBeenCalled();
			} );

			it( 'should preventDefault() the original beforeinput event if target ranges match fake selection', () => {
				_setModelData( editor.model, '[<widget></widget>]' );

				const eventData = {
					preventDefault: vi.fn(),
					selection: viewDocument.selection,
					text: 'bar'
				};

				eventData.domEvent = {
					get defaultPrevented() {
						return eventData.preventDefault.mock.calls.length > 0;
					}
				};

				viewDocument.fire( 'insertText', eventData );

				expect( eventData.preventDefault ).toHaveBeenCalled();
				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should preventDefault() the original beforeinput event if target ranges span across different blocks', () => {
				_setModelData( editor.model,
					'<paragraph>[foo</paragraph>' +
					'<paragraph>]bar</paragraph>'
				);

				const eventData = {
					preventDefault: vi.fn(),
					selection: viewDocument.selection,
					text: 'abc',
					domEvent: {}
				};

				eventData.domEvent = {
					get defaultPrevented() {
						return eventData.preventDefault.mock.calls.length > 0;
					}
				};

				viewDocument.fire( 'insertText', eventData );

				expect( eventData.preventDefault ).toHaveBeenCalledOnce();
				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const executeOptions = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( executeOptions.text ).to.equal( 'abc' );
				expect( executeOptions.selection.rangeCount ).to.equal( 1 );
				expect( executeOptions.selection.isCollapsed ).to.be.false;
				expect( executeOptions.selection.getFirstRange().start.isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 0 )
				) ).to.be.true;
				expect( executeOptions.selection.getFirstRange().end.isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 1 ), 0 )
				) ).to.be.true;
			} );

			it( 'should preventDefault() the original event if target ranges span across different blocks (ends in code block)', () => {
				_setModelData( editor.model,
					'<paragraph>[foo</paragraph>' +
					'<codeBlock language="javascript">]bar</codeBlock>'
				);

				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>foo</p>' +
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">bar</code>' +
					'</pre>'
				);

				// Emulate browser generated target range: <p>[foo</p><pre>]<code>bar</code></pre>
				const eventData = {
					preventDefault: vi.fn(),
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ), 0 ),
						view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 )
					) ),
					text: 'abc',
					domEvent: {}
				};

				eventData.domEvent = {
					get defaultPrevented() {
						return eventData.preventDefault.mock.calls.length > 0;
					}
				};

				viewDocument.fire( 'insertText', eventData );

				expect( eventData.preventDefault ).toHaveBeenCalledOnce();
				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const executeOptions = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( executeOptions.text ).to.equal( 'abc' );
				expect( executeOptions.selection.rangeCount ).to.equal( 1 );
				expect( executeOptions.selection.isCollapsed ).to.be.false;
				expect( executeOptions.selection.getFirstRange().start.isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 0 )
				) ).to.be.true;
				expect( executeOptions.selection.getFirstRange().end.isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 3 )
				) ).to.be.true;
			} );

			it( 'should preventDefault() the original event if target ranges span across different blocks (ends in block quote)', () => {
				_setModelData( editor.model,
					'<paragraph>[foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>]bar</paragraph>' +
					'</blockQuote>'
				);

				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>foo</p>' +
					'<blockquote>' +
						'<p>bar</p>' +
					'</blockquote>'
				);

				// Emulate browser generated target range: <p>[foo</p><blockquote><p>]bar</p></blockquote>
				const eventData = {
					preventDefault: vi.fn(),
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ), 0 ),
						view.createPositionAt( viewDocument.getRoot().getChild( 1 ).getChild( 0 ), 0 )
					) ),
					text: 'abc',
					domEvent: {}
				};

				eventData.domEvent = {
					get defaultPrevented() {
						return eventData.preventDefault.mock.calls.length > 0;
					}
				};

				viewDocument.fire( 'insertText', eventData );

				expect( eventData.preventDefault ).toHaveBeenCalledOnce();
				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const executeOptions = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( executeOptions.text ).to.equal( 'abc' );
				expect( executeOptions.selection.rangeCount ).to.equal( 1 );
				expect( executeOptions.selection.isCollapsed ).to.be.false;
				expect( executeOptions.selection.getFirstRange().start.isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 0 )
				) ).to.be.true;
				expect( executeOptions.selection.getFirstRange().end.isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 1 ).getChild( 0 ), 0 )
				) ).to.be.true;
			} );

			it( 'should preventDefault() the original event if target ranges span empty paragraph and ends in code block', () => {
				_setModelData( editor.model,
					'<paragraph>[</paragraph>' +
					'<codeBlock language="javascript">]bar</codeBlock>'
				);

				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p></p>' +
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">bar</code>' +
					'</pre>'
				);

				// Emulate browser generated target range: <p>[</p><pre>]<code>bar</code></pre>
				const preventDefaultSpy = vi.fn();

				const eventData = {
					inputType: 'insertText',
					targetRanges: [
						view.createRange(
							view.createPositionAt( viewDocument.getRoot().getChild( 0 ), 0 ),
							view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 )
						)
					],
					data: 'abc',
					domEvent: {}
				};

				eventData.domEvent = {
					get defaultPrevented() {
						return preventDefaultSpy.mock.calls.length > 0;
					},
					preventDefault: preventDefaultSpy
				};

				// Note this test is using beforeinput event as only on that event target ranges are fixed by EditingController.
				viewDocument.fire( 'beforeinput', eventData );

				expect( preventDefaultSpy ).toHaveBeenCalledOnce();
				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const executeOptions = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( executeOptions.text ).to.equal( 'abc' );
				expect( executeOptions.selection.rangeCount ).to.equal( 1 );
				expect( executeOptions.selection.isCollapsed ).to.be.true;
				expect( executeOptions.selection.getFirstPosition().isEqual(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 0 )
				) ).to.be.true;
			} );

			it( 'should not preventDefault() the original beforeinput event if target range is collapsed', () => {
				_setModelData( editor.model, '<paragraph>fo[]o</paragraph>' );

				const eventData = {
					preventDefault: vi.fn(),
					selection: viewDocument.selection,
					text: 'abc',
					domEvent: {}
				};

				eventData.domEvent = {
					get defaultPrevented() {
						return eventData.preventDefault.mock.calls.length > 0;
					}
				};

				viewDocument.fire( 'insertText', eventData );

				expect( eventData.preventDefault ).not.toHaveBeenCalled();
				expect( insertTextCommandSpy ).not.toHaveBeenCalled();
			} );

			it( 'should have the text property passed correctly to the insert text command', async () => {
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: viewDocument.selection,
					preventDefault: () => {},
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.resultRange ).to.be.undefined;
				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should have the selection property passed correctly to the insert text command', async () => {
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 1 )
				);

				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: view.createSelection(
						view.createPositionAt( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 1 )
					),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;
				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should use model document selection if the selection property is not passed', async () => {
				const expectedSelection = editor.model.createSelection(
					editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 1 )
				);

				editor.model.change( writer => {
					writer.setSelection( expectedSelection );
				} );

				viewDocument.fire( 'insertText', {
					text: 'bar',
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( expectedSelection ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;
				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should use model selection if view selection is in a detached root', () => {
				_setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

				let detachedElement;

				view.change( writer => {
					detachedElement = writer.createContainerElement( 'p' );
				} );

				// Create a selection in the detached element.
				const detachedSelection = view.createSelection(
					view.createRange(
						view.createPositionAt( detachedElement, 0 ),
						view.createPositionAt( detachedElement, 0 )
					)
				);

				// Fire insertText with this detached selection.
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: detachedSelection,
					preventDefault: () => {},
					domEvent: {
						defaultPrevented: true
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				// It should use the current model selection (which is in the live paragraph).
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( editor.model.document.selection ) ).to.be.true;
			} );

			it( 'should delete selected content on composition start', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.fire( 'compositionstart' );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( editor.model.document.selection );
			} );

			it( 'should update model selection to the DOM selection on composition start and use it on compositionend', () => {
				const root = editor.model.document.getRoot();
				const modelSelection = editor.model.document.selection;

				const modelParagraph = root.getChild( 0 );
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const domParagraph = view.domConverter.mapViewToDom( viewParagraph );

				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( modelParagraph, 1 ),
					editor.model.createPositionAt( modelParagraph, 3 )
				);

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );

				window.getSelection().setBaseAndExtent( domParagraph.childNodes[ 0 ], 1, domParagraph.childNodes[ 0 ], 3 );

				viewDocument.fire( 'compositionstart' );

				expect( modelSelection.getFirstRange().isEqual( expectedRange ) ).to.be.true;

				viewDocument.fire( 'compositionend', new ViewDocumentDomEventData( view, {
					preventDefault() {}
				}, {
					data: 'bar'
				} ) );

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.getFirstRange().isEqual( expectedRange ) ).to.be.true;
			} );

			it( 'should not call model.deleteContent() on composition start for collapsed model selection', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				viewDocument.fire( 'compositionstart' );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not call model.deleteContent() on composition start if insertText command is disabled', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.commands.get( 'insertText' ).forceDisabled( 'commentsOnly' );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.fire( 'compositionstart' );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should scroll to the selection after inserting text', async () => {
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: viewDocument.selection,
					preventDefault: () => {},
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( scrollToTheSelectionSpy ).toHaveBeenCalledOnce();
				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			describe( 'Typing queue', () => {
				it( 'should push the event to the typing queue', () => {
					viewDocument.fire( 'insertText', {
						text: 'bar',
						selection: viewDocument.selection,
						preventDefault: () => {},
						domEvent: {
							defaultPrevented: false
						}
					} );

					expect( insertTextCommandSpy ).not.toHaveBeenCalled();
					expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).not.toHaveBeenCalled();
				} );

				it( 'should push the event to the typing queue and flush it if dom event is prevented', () => {
					viewDocument.fire( 'insertText', {
						text: 'bar',
						selection: viewDocument.selection,
						preventDefault: () => {},
						domEvent: {
							defaultPrevented: true
						}
					} );

					expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
					expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).toHaveBeenCalledWith( 'beforeinput default prevented' );
				} );

				it( 'should not push the event to the typing queue if command is disabled', () => {
					editor.commands.get( 'insertText' ).forceDisabled();

					viewDocument.fire( 'insertText', {
						text: 'bar',
						selection: viewDocument.selection,
						preventDefault: () => {},
						domEvent: {
							defaultPrevented: false
						}
					} );

					expect( insertTextCommandSpy ).not.toHaveBeenCalled();
					expect( typingQueuePushSpy ).not.toHaveBeenCalled();
					expect( typingQueueFlushSpy ).not.toHaveBeenCalled();
				} );

				it( 'should flush the typing queue on next beforeinput', () => {
					viewDocument.fire( 'insertText', {
						text: 'bar',
						selection: viewDocument.selection,
						preventDefault: () => {},
						domEvent: {
							defaultPrevented: false
						}
					} );

					expect( insertTextCommandSpy ).not.toHaveBeenCalled();
					expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).not.toHaveBeenCalled();

					viewDocument.fire( 'beforeinput', new ViewDocumentDomEventData( view, {
						target: view.getDomRoot(),
						preventDefault: () => {}
					}, {
						inputType: 'insertParagraph',
						targetRanges: []
					} ) );

					expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
					expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).toHaveBeenCalledWith( 'next beforeinput' );
				} );

				it( 'should flush the typing queue on DOM mutations', () => {
					insertTextCommandSpy.mockRestore();
					insertTextCommandSpy = vi.spyOn( editor.commands.get( 'insertText' ), 'execute' );

					const root = editor.model.document.getRoot();
					const viewParagraph = viewDocument.getRoot().getChild( 0 );

					editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

					// Verify initial model state.
					expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

					const composition = compositionHelper( editor, 1 );

					// Simulate DOM changes triggered by browser. Flush MutationObserver as it is async.
					composition.updateNonComposition(
						'abc',
						view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) )
					);

					expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
					expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
					expect( typingQueueFlushSpy ).toHaveBeenCalledTimes( 2 );

					expect( typingQueueFlushSpy.mock.calls[ 0 ][ 0 ] ).to.equal( 'next beforeinput' );
					expect( typingQueueFlushSpy.mock.calls[ 1 ][ 0 ] ).to.equal( 'mutations' );

					expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
				} );

				it( 'should queue command data without a selection (no selection ranges are tracked)', () => {
					const queue = editor.plugins.get( 'Input' )._typingQueue;

					// The queue may receive command data that has no selection. No selection ranges are
					// tracked then, and the data shifted back from the queue also has no selection.
					queue.push( { text: 'bar' }, false );

					const commandData = queue.shift();

					expect( commandData.text ).toBe( 'bar' );
					expect( commandData.selection ).toBeUndefined();
				} );
			} );
		} );

		describe( 'composition', () => {
			beforeEach( () => {
				insertTextCommandSpy = vi.spyOn( editor.commands.get( 'insertText' ), 'execute' );
			} );

			it( 'should render the DOM on composition end only when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Make sure that model is not modified by DOM changes.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should render the DOM on composition end only once when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				// Note that NBSP is in different order than expected by the ViewDomConverter and Renderer.
				composition.update( '  abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Make sure that model is not modified by DOM changes.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// Commit composition.
				composition.end( '  abc' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				// DOM text node requires NBSP vs space fixing.
				expect( rendererUpdateTextNodeSpy ).toHaveBeenCalledOnce();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo  abc[]</paragraph>' );
				expect( editor.getData() ).to.equal( '<p>foo &nbsp;abc</p>' );
			} );
		} );
	} );

	describe( 'Android env', () => {
		let domElement, editor, view, viewDocument, insertTextCommandSpy, scrollToTheSelectionSpy, rendererUpdateTextNodeSpy,
			typingQueuePushSpy, typingQueueFlushSpy;

		beforeEach( async () => {
			vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph, Bold ],
				initialData: '<p>foo</p>'
			} );

			view = editor.editing.view;
			viewDocument = view.document;
			scrollToTheSelectionSpy = vi.spyOn( view, 'scrollToTheSelection' ).mockImplementation( () => {} );
			rendererUpdateTextNodeSpy = vi.spyOn( view._renderer, '_updateTextNodeInternal' );

			const inputPlugin = editor.plugins.get( 'Input' );

			typingQueuePushSpy = vi.spyOn( inputPlugin._typingQueue, 'push' );
			typingQueueFlushSpy = vi.spyOn( inputPlugin._typingQueue, 'flush' );
		} );

		afterEach( async () => {
			domElement.remove();

			await editor.destroy();
		} );

		describe( 'basic typing', () => {
			beforeEach( () => {
				insertTextCommandSpy = vi.spyOn( editor.commands.get( 'insertText' ), 'execute' ).mockImplementation( () => {} );
			} );

			it( 'should adjust text and range to minimize model change (adding text)', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const modelParagraph = editor.model.document.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'foobar',
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
						view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
					) ),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'end' ) ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;

				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should adjust text and range to minimize model change (adding text, text and inline object selected)', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const modelParagraph = editor.model.document.getRoot().getChild( 0 );

				editor.model.schema.register( 'inline', { inheritAllFrom: '$inlineObject' } );
				editor.conversion.elementToElement( { model: 'inline', view: 'span' } );

				editor.model.change( writer => {
					writer.insertElement( 'inline', modelParagraph, 2 );
				} );

				viewDocument.fire( 'insertText', {
					text: 'foobar',
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
						view.createPositionAt( viewParagraph.getChild( 2 ), 'end' )
					) ),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( editor.model.createSelection( editor.model.createRange(
					editor.model.createPositionAt( modelParagraph, 3 ),
					editor.model.createPositionAt( modelParagraph, 4 )
				) ) ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;

				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should adjust text and range to minimize model change (removing text)', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const modelParagraph = editor.model.document.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'fo',
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
						view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
					) ),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( firstCallArgs.text ).to.equal( '' );
				expect( firstCallArgs.selection.isEqual( editor.model.createSelection( editor.model.createRange(
					editor.model.createPositionAt( modelParagraph, 2 ),
					editor.model.createPositionAt( modelParagraph, 3 )
				) ) ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;

				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not adjust text and range if the whole selected text is replaced', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const modelParagraph = editor.model.document.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'barfoo',
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
						view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
					) ),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( firstCallArgs.text ).to.equal( 'barfoo' );
				expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'in' ) ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;

				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not adjust text and range if the whole selected text is replaced with shorter text', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const modelParagraph = editor.model.document.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'ba',
					selection: view.createSelection( view.createRange(
						view.createPositionAt( viewParagraph.getChild( 0 ), 0 ),
						view.createPositionAt( viewParagraph.getChild( 0 ), 'end' )
					) ),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( firstCallArgs.text ).to.equal( 'ba' );
				expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'in' ) ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;

				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not adjust text and range if the selection is collapsed', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );
				const modelParagraph = editor.model.document.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: view.createSelection( viewParagraph.getChild( 0 ), 'end' ),
					preventDefault: vi.fn(),
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				const firstCallArgs = insertTextCommandSpy.mock.calls[ 0 ][ 0 ];

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( firstCallArgs.text ).to.equal( 'bar' );
				expect( firstCallArgs.selection.isEqual( editor.model.createSelection( modelParagraph, 'end' ) ) ).to.be.true;
				expect( firstCallArgs.resultRange ).to.be.undefined;

				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should ignore insertText event if requires no model changes', () => {
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				viewDocument.fire( 'insertText', {
					text: 'foo',
					selection: view.createSelection( viewParagraph.getChild( 0 ), 'on' ),
					preventDefault: vi.fn(),
					domEvent: {}
				} );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();
			} );

			it( 'should delete selected content on 229 keydown while composing', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.isComposing = true;
				viewDocument.fire( 'keydown', {
					keyCode: 229,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				} );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( editor.model.document.selection );
			} );

			it( 'should not call model.deleteContent() on 229 keydown for collapsed model selection', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				viewDocument.fire( 'keydown', {
					keyCode: 229,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				} );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not call model.deleteContent() on 229 keydown if not composing', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				viewDocument.fire( 'keydown', {
					keyCode: 229,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				} );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not call model.deleteContent() on 229 keydown if insertText command is disabled', () => {
				const spy = vi.spyOn( editor.model, 'deleteContent' );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'in' ) );

				editor.commands.get( 'insertText' ).forceDisabled( 'commentsOnly' );

				viewDocument.isComposing = true;
				viewDocument.fire( 'keydown', {
					keyCode: 229,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				} );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should scroll to the selection after inserting text', async () => {
				viewDocument.fire( 'insertText', {
					text: 'bar',
					selection: viewDocument.selection,
					preventDefault: () => {},
					domEvent: {
						defaultPrevented: true // Just to trigger immediate queue flush.
					}
				} );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				expect( scrollToTheSelectionSpy ).toHaveBeenCalledOnce();
				expect( typingQueuePushSpy ).toHaveBeenCalledOnce();
				expect( typingQueueFlushSpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'composition', () => {
			beforeEach( () => {
				insertTextCommandSpy = vi.spyOn( editor.commands.get( 'insertText' ), 'execute' );
			} );

			it( 'should not modify DOM when not needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Type 'a'.
				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'a', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooa[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Type 'b'.
				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'b', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooab[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Type 'c'.
				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'c', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should render the DOM on composition end only when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should render the DOM on composition end only once when needed', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				// Note that NBSP is in different order than expected by the ViewDomConverter and Renderer.
				composition.update( '  abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Make sure that model is not modified by DOM changes.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo  abc[]</paragraph>' );

				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( '  abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node requires NBSP vs space fixing.
				expect( rendererUpdateTextNodeSpy ).toHaveBeenCalledOnce();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo  abc[]</paragraph>' );
				expect( editor.getData() ).to.equal( '<p>foo &nbsp;abc</p>' );
			} );

			it( 'should verify if composed elements are correct after composition', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				const reportedMutations = [];

				viewDocument.on( 'mutations', ( evt, { mutations } ) => {
					reportedMutations.push( ...mutations );
				} );

				// Commit composition.
				composition.end( 'abc' );

				expect( reportedMutations.length ).to.equal( 1 );
				expect( reportedMutations[ 0 ].type ).to.equal( 'children' );
				expect( reportedMutations[ 0 ].node ).to.equal( viewParagraph );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should not fire mutations for removed elements (after composition end)', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				// Simulate DOM changes triggered by IME. Flush MutationObserver as it is async.
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				editor.model.change( writer => {
					writer.remove( root.getChild( 0 ) );
					writer.insertElement( 'paragraph', root, 0 );
				} );

				const reportedMutations = [];

				viewDocument.on( 'mutations', ( evt, { mutations } ) => {
					reportedMutations.push( ...mutations );
				} );

				// Commit composition.
				composition.end( 'abc' );

				expect( reportedMutations.length ).to.equal( 0 );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'should apply changes to model after composed DOM node mutated', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should apply changes to model after composed DOM node mutated inside an attribute element', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => {
					writer.setAttribute( 'bold', true, writer.createRangeIn( root.getChild( 0 ) ) );
					writer.setSelection( root.getChild( 0 ), 'end' );
				} );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ).getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );
			} );

			it( 'should apply changes to model after composed DOM node mutated inside an attribute element (mutations on bold)', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => {
					writer.setAttribute( 'bold', true, writer.createRangeIn( root.getChild( 0 ) ) );
					writer.setSelection( root.getChild( 0 ), 'end' );
				} );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ).getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// Modify DOM element.
				const domText = view.domConverter.viewPositionToDom( viewRange.start ).parent;

				// Inject some element to trigger "children" mutations.
				domText.parentNode.appendChild( domElement.ownerDocument.createElement( 'span' ) );

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">fooabc[]</$text></paragraph>' );
			} );

			it( 'should apply changes to model after a timeout before DOM mutations', async () => {
				vi.useFakeTimers();
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				await vi.advanceTimersByTimeAsync( 100 );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				expect( rendererUpdateTextNodeSpy ).toHaveBeenCalledOnce();
				rendererUpdateTextNodeSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should apply changes to the model in the position adjusted by other model changes', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				editor.model.change( writer => {
					writer.insertElement( 'paragraph', root, 0 );
				} );

				// Simulate DOM changes triggered by IME.
				composition.modifyDom( 'abc', viewRange );

				// Changes are immediately applied to the model.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph></paragraph><paragraph>fooabc[]</paragraph>' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				// DOM text node is already the proper one so no changes are required.
				expect( rendererUpdateTextNodeSpy ).not.toHaveBeenCalled();
				rendererUpdateTextNodeSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph></paragraph><paragraph>fooabc[]</paragraph>' );
			} );

			it( 'should commit composition into replaced element', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				editor.model.change( writer => {
					writer.remove( root.getChild( 0 ) );
					writer.insertElement( 'paragraph', root, 0 );
				} );

				// Commit composition.
				composition.end( 'abc' );

				expect( insertTextCommandSpy ).toHaveBeenCalledOnce();
				insertTextCommandSpy.mockClear();

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>abc[]</paragraph>' );
			} );

			it( 'should destroy composition queue on editor destroy', async () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				// Verify initial model state.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition.
				composition.start();

				const viewRange = view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) );

				// Simulate only beforeInput event.
				composition.fireBeforeInputEvent( 'abc', viewRange );

				// Changes are not applied to the model before the DOM got modified by IME.
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( insertTextCommandSpy ).not.toHaveBeenCalled();

				const queue = editor.plugins.get( 'Input' )._typingQueue;

				expect( queue.length ).to.equal( 1 );

				await editor.destroy();

				expect( queue.length ).to.equal( 0 );
			} );

			it( 'should not flush the typing queue on mutations unrelated to the composed element', () => {
				const root = editor.model.document.getRoot();
				const viewParagraph = viewDocument.getRoot().getChild( 0 );

				// Add a second paragraph that will NOT be affected by the composition.
				editor.model.change( writer => {
					writer.insertElement( 'paragraph', root, 1 );
					writer.insertText( 'bar', root.getChild( 1 ), 0 );
					writer.setSelection( root.getChild( 0 ), 'end' );
				} );

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

				const composition = compositionHelper( editor );

				// Start composition and type into the first paragraph. This marks the first paragraph as affected.
				composition.start();
				composition.update( 'abc', view.createRange( view.createPositionAt( viewParagraph.getChild( 0 ), 'end' ) ) );

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph><paragraph>bar</paragraph>' );

				const queue = editor.plugins.get( 'Input' )._typingQueue;

				// The affected elements set still holds the first (composed) paragraph.
				expect( queue.hasAffectedElements() ).to.be.true;
				expect( queue.isElementAffected( root.getChild( 0 ) ) ).to.be.true;
				expect( queue.isElementAffected( root.getChild( 1 ) ) ).to.be.false;

				// The queue itself is empty after the immediate composing flush.
				expect( queue.length ).to.equal( 0 );

				typingQueueFlushSpy.mockClear();

				// Fire a mutations event for the second (unaffected) paragraph while still composing.
				const otherViewParagraph = viewDocument.getRoot().getChild( 1 );

				viewDocument.fire( 'mutations', {
					mutations: [ { type: 'children', node: otherViewParagraph } ]
				} );

				// As the mutated element is not affected, no flush should be triggered.
				expect( typingQueueFlushSpy ).not.toHaveBeenCalled();

				// The affected element set is untouched and the model is unchanged.
				expect( queue.isElementAffected( root.getChild( 0 ) ) ).to.be.true;
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fooabc[]</paragraph><paragraph>bar</paragraph>' );

				composition.end( 'abc' );
			} );

			it( 'should not collect mutations on composition end when there are no affected elements', () => {
				const root = editor.model.document.getRoot();

				editor.model.change( writer => writer.setSelection( root.getChild( 0 ), 'end' ) );

				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				const composition = compositionHelper( editor );

				const queue = editor.plugins.get( 'Input' )._typingQueue;

				// Start composition without any beforeinput, so nothing is queued and nothing is affected.
				composition.start();

				expect( queue.hasAffectedElements() ).to.be.false;

				const reportedMutations = [];

				viewDocument.on( 'mutations', ( evt, { mutations } ) => {
					reportedMutations.push( ...mutations );
				} );

				// End the composition. With no affected elements, no composition mutations are collected/fired.
				composition.end( '' );

				expect( reportedMutations.length ).to.equal( 0 );
				expect( queue.hasAffectedElements() ).to.be.false;
				expect( _getModelData( editor.model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
			} );
		} );
	} );

	function compositionHelper( editor, expectedTypingQueueSize = env.isAndroid ? 1 : 0 ) {
		const view = editor.editing.view;
		const viewDocument = view.document;
		const inputPlugin = editor.plugins.get( 'Input' );

		return {
			start() {
				viewDocument.fire( 'compositionstart' );
				expect( viewDocument.isComposing ).to.be.true;
			},

			update( data, range ) {
				expect( viewDocument.isComposing ).to.be.true;

				const preventDefaultSpy = this.fireBeforeInputEvent( data, range );

				if ( !preventDefaultSpy.mock.calls.length ) {
					this.modifyDom( data, range );
				}
			},

			updateNonComposition( data, range ) {
				const preventDefaultSpy = this.fireBeforeInputEvent( data, range, 'insertText', false );

				if ( !preventDefaultSpy.mock.calls.length ) {
					this.modifyDom( data, range );
				}
			},

			fireBeforeInputEvent( data, range, inputType = 'insertCompositionText', isComposing = true ) {
				const preventDefaultSpy = vi.fn();

				viewDocument.fire( 'beforeinput', new ViewDocumentDomEventData( view, {
					target: view.getDomRoot()
				}, {
					data: data.replace( /\u00A0/g, ' ' ),
					inputType,
					isComposing,
					targetRanges: [ range ],
					preventDefault: preventDefaultSpy
				} ) );

				return preventDefaultSpy;
			},

			modifyDom( data, range ) {
				const domRange = view.domConverter.viewRangeToDom( range );

				if ( !domRange.collapsed ) {
					domRange.deleteContents();
				}

				if ( domRange.startContainer.nodeType === 3 ) {
					domRange.startContainer.insertData( domRange.startOffset, data );
				} else {
					insertAt( domRange.startContainer, domRange.startOffset, domRange.startContainer.ownerDocument.createTextNode( data ) );
				}

				// Make sure it is always no bigger than 1 entry to avoid problems with position mapping.
				expect( inputPlugin._typingQueue.length ).to.equal( expectedTypingQueueSize );

				window.getSelection().setBaseAndExtent(
					domRange.startContainer, domRange.startOffset + data.length,
					domRange.startContainer, domRange.startOffset + data.length
				);
				window.document.dispatchEvent( new window.Event( 'selectionchange' ) );
			},

			end( data ) {
				expect( viewDocument.isComposing ).to.be.true;

				viewDocument.fire(
					'compositionend',
					new ViewDocumentDomEventData( view, {
						preventDefault: vi.fn()
					}, {
						data
					} )
				);

				expect( viewDocument.isComposing ).to.be.false;
			}
		};
	}
} );
