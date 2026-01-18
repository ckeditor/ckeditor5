/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CodeBlockHighlight } from '../src/codeblockhighlight.js';
import { CodeBlockEditing } from '../src/codeblockediting.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { fireBeforeInputDomEvent } from '@ckeditor/ckeditor5-typing/tests/_utils/utils.js';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';

describe( 'CodeBlockHighlight', () => {
	let editor, element, model, view, domRoot;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ CodeBlockEditing, CodeBlockHighlight, Paragraph, Typing, ClipboardPipeline, BlockQuoteEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;

				// Get the DOM root for simulating real DOM typing events.
				domRoot = view.domRoots.get( 'main' );
			} );
	} );

	afterEach( () => {
		return editor.destroy().then( () => element.remove() );
	} );

	it( 'defines plugin name', () => {
		expect( CodeBlockHighlight.pluginName ).to.equal( 'CodeBlockHighlight' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CodeBlockHighlight.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CodeBlockHighlight.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require CodeBlockEditing plugin', () => {
		expect( CodeBlockHighlight.requires ).to.deep.equal( [ CodeBlockEditing ] );
	} );

	describe( 'syntax highlighting', () => {
		describe( 'initialization', () => {
			// Tests verifying that code blocks are properly highlighted when the editor initializes.

			it( 'should highlight JavaScript code on initialization', () => {
				_setModelData( model,
					'<codeBlock language="javascript">' +
						'const x = 5;' +
						'<softBreak></softBreak>' +
						'console.log(x);[]' +
					'</codeBlock>'
				);

				// Verify that the model has codeHighlight attributes applied correctly.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' x = ' +
						'<$text codeHighlight="hljs-number">5</$text>' +
						';' +
						'<softBreak></softBreak>' +
						'<$text codeHighlight="hljs-variable language_">console</$text>' +
						'.' +
						'<$text codeHighlight="hljs-title function_">log</$text>' +
						'(x);[]' +
					'</codeBlock>'
				);

				// Verify that the view renders the highlighted code correctly.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">const</span>' +
							' x = ' +
							'<span class="hljs-number">5</span>' +
							';' +
							'<br></br>' +
							'<span class="hljs-variable language_">console</span>' +
							'.' +
							'<span class="function_ hljs-title">log</span>' +
							'(x);' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should not highlight plaintext code', () => {
				_setModelData( model,
					'<codeBlock language="plaintext">just some text[]</codeBlock>'
				);

				// Verify that the model does NOT have codeHighlight attributes (plain text only).
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="plaintext">just some text[]</codeBlock>'
				);

				// Verify that the view has no highlight spans (plain text only).
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'just some text' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should highlight CSS code', () => {
				// Create a code block with valid CSS syntax.
				// Use model.change() instead of _setModelData() because curly braces {...} are treated as selection markers.
				model.change( writer => {
					const root = model.document.getRoot();
					writer.remove( writer.createRangeIn( root ) );

					const codeBlock = writer.createElement( 'codeBlock', { language: 'css' } );
					writer.insert( codeBlock, root, 0 );

					writer.insertText( '.foo { color: red; }', codeBlock, 0 );
					writer.setSelection( codeBlock, 'end' );
				} );

				// Verify that the model has codeHighlight attributes for CSS syntax.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="css">' +
						'<$text codeHighlight="hljs-selector-class">.foo</$text>' +
						' { ' +
						'<$text codeHighlight="hljs-attribute">color</$text>' +
						': red; }[]' +
					'</codeBlock>'
				);

				// Verify that the view renders CSS highlighting correctly.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="CSS" spellcheck="false">' +
						'<code class="language-css">' +
							'<span class="hljs-selector-class">.foo</span>' +
							' { ' +
							'<span class="hljs-attribute">color</span>' +
							': red; }' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should highlight multi-line code blocks', () => {
				_setModelData( model,
					'<codeBlock language="javascript">' +
						'const a = 1;' +
						'<softBreak></softBreak>' +
						'const b = 2;' +
						'<softBreak></softBreak>' +
						'const c = 3;[]' +
					'</codeBlock>'
				);

				// Verify that the model has codeHighlight attributes applied to all lines.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' a = ' +
						'<$text codeHighlight="hljs-number">1</$text>' +
						';' +
						'<softBreak></softBreak>' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' b = ' +
						'<$text codeHighlight="hljs-number">2</$text>' +
						';' +
						'<softBreak></softBreak>' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' c = ' +
						'<$text codeHighlight="hljs-number">3</$text>' +
						';[]' +
					'</codeBlock>'
				);

				// Verify that the view renders all lines with correct highlighting.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">const</span>' +
							' a = ' +
							'<span class="hljs-number">1</span>' +
							';' +
							'<br></br>' +
							'<span class="hljs-keyword">const</span>' +
							' b = ' +
							'<span class="hljs-number">2</span>' +
							';' +
							'<br></br>' +
							'<span class="hljs-keyword">const</span>' +
							' c = ' +
							'<span class="hljs-number">3</span>' +
							';' +
						'</code>' +
					'</pre>'
				);
			} );
		} );

		describe( 'real-time highlighting during typing', () => {
			// Tests syntax highlighting behavior as users type code in real-time.
			// Verifies that highlights are applied correctly without causing selection issues.

			it( 'should apply syntax highlighting as user types a code statement', async () => {
				_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

				// Simulate typing "const x = 5;" character by character.
				const text = 'const x = 5;';

				for ( const char of text ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					// Small delay to allow the typing queue to process input.
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for the post-fixer to apply syntax highlighting.
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Verify that the model has codeHighlight attributes applied correctly.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' x = ' +
						'<$text codeHighlight="hljs-number">5</$text>' +
						';[]' +
					'</codeBlock>'
				);

				// Verify that the view renders the highlighted code correctly.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">const</span>' +
							' x = ' +
							'<span class="hljs-number">5</span>' +
							';' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should apply syntax highlighting when typing comments in an existing multi-line code block', async () => {
				// Create a code block containing a JavaScript function with multiple lines.
				// Use model.change() instead of _setModelData() because curly braces {...} are treated as selection markers.
				model.change( writer => {
					const root = model.document.getRoot();
					writer.remove( writer.createRangeIn( root ) );

					const codeBlock = writer.createElement( 'codeBlock', { language: 'javascript' } );
					writer.insert( codeBlock, root, 0 );

					// Insert the JavaScript function: function foo() {\n  const name = 'John';\n}
					writer.insertText( 'function foo() {', codeBlock, 0 );
					writer.insert( writer.createElement( 'softBreak' ), codeBlock, 'end' );
					writer.insertText( '  const name = \'John\';', codeBlock, 'end' );
					writer.insert( writer.createElement( 'softBreak' ), codeBlock, 'end' );
					writer.insertText( '}', codeBlock, 'end' );

					// Position the cursor at the end of line 2, after the semicolon.
					const softBreaks = Array.from( codeBlock.getChildren() )
						.filter( child => child.is( 'element', 'softBreak' ) );
					const secondSoftBreak = softBreaks[ 1 ];
					const positionBeforeSoftBreak = writer.createPositionBefore( secondSoftBreak );
					writer.setSelection( positionBeforeSoftBreak );
				} );

				// Wait for initial highlighting to complete.
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Simulate typing a JavaScript comment character by character.
				const commentText = ' // Initialize name.';

				for ( const char of commentText ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					// Small delay to allow the typing queue to process input.
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for the post-fixer to apply syntax highlighting to the comment.
				await new Promise( resolve => setTimeout( resolve, 100 ) );

				// Verify that the model has correct highlighting for the comment and existing code.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">function</$text>' +
						' ' +
						'<$text codeHighlight="hljs-title function_">foo</$text>' +
						'() {' +
						'<softBreak></softBreak>' +
						'  ' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' name = ' +
						'<$text codeHighlight="hljs-string">\'John\'</$text>' +
						'; ' +
						'<$text codeHighlight="hljs-comment">// Initialize name.[]</$text>' +
						'<softBreak></softBreak>' +
						'}' +
					'</codeBlock>'
				);

				// Verify that the view renders the comment and code with correct highlighting.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">function</span>' +
							' ' +
							'<span class="function_ hljs-title">foo</span>' +
							'() {' +
							'<br></br>' +
							'  ' +
							'<span class="hljs-keyword">const</span>' +
							' name = ' +
							'<span class="hljs-string">\'John\'</span>' +
							'; ' +
							'<span class="hljs-comment">// Initialize name.</span>' +
							'<br></br>' +
							'}' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should leave plain text (operators, spaces, punctuation) unhighlighted', async () => {
				_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

				// Simulate typing "const x = 5;" character by character.
				const text = 'const x = 5;';

				for ( const char of text ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					// Small delay to allow the typing queue to process input.
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for the post-fixer to apply syntax highlighting.
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Verify that the view has plain text between spans (operators, spaces, semicolon are not wrapped).
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">const</span>' +
							' x = ' +
							'<span class="hljs-number">5</span>' +
							';' +
						'</code>' +
					'</pre>'
				);
			} );
		} );

		describe( 'language changes', () => {
			// Tests verifying that syntax highlighting is updated when the code block language changes.

			it( 'should remove syntax highlighting when changing language from JavaScript to plaintext', () => {
				_setModelData( model,
					'<codeBlock language="javascript">const x = 10;[]</codeBlock>'
				);

				// Change the language attribute to plaintext.
				const codeBlock = model.document.getRoot().getChild( 0 );
				model.change( writer => {
					writer.setAttribute( 'language', 'plaintext', codeBlock );
				} );

				// Reconvert the element to update the view.
				editor.editing.reconvertItem( codeBlock );

				// Verify that highlighting is removed from both model and view.
				const modelData = _getModelData( model );
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( modelData ).to.equal(
					'<codeBlock language="plaintext">const x = 10;[]</codeBlock>'
				);
				expect( viewData ).to.equal(
					'<pre data-language="Plain text" spellcheck="false">' +
						'<code class="language-plaintext">' +
							'const x = 10;' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should apply syntax highlighting when changing language from plaintext to JavaScript', () => {
				_setModelData( model,
					'<codeBlock language="plaintext">const x = 10;[]</codeBlock>'
				);

				// Change the language attribute to JavaScript.
				const codeBlock = model.document.getRoot().getChild( 0 );
				model.change( writer => {
					writer.setAttribute( 'language', 'javascript', codeBlock );
				} );

				// Reconvert the element to update the view.
				editor.editing.reconvertItem( codeBlock );

				// Verify that highlighting is applied correctly in both model and view.
				const modelData = _getModelData( model );
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' x = ' +
						'<$text codeHighlight="hljs-number">10</$text>' +
						';[]' +
					'</codeBlock>'
				);
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">const</span>' +
							' x = ' +
							'<span class="hljs-number">10</span>' +
							';' +
						'</code>' +
					'</pre>'
				);
			} );
		} );

		describe( 'paste integration', () => {
			// Tests verifying that pasted code is properly highlighted in code blocks.

			it( 'should apply syntax highlighting to multi-line JavaScript code pasted into empty code block', () => {
				_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

				// Create a mock clipboard data transfer with multi-line JavaScript code.
				const dataTransferMock = {
					getData: sinon.stub().withArgs( 'text/plain' ).returns(
						'function greet(name) {\n' +
						'  console.log("Hello, " + name);\n' +
						'}'
					)
				};

				// Simulate paste event.
				view.document.fire( 'clipboardInput', {
					dataTransfer: dataTransferMock,
					stop: sinon.spy()
				} );

				// Verify that the model has codeHighlight attributes applied correctly to the pasted code.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">function</$text>' +
						' ' +
						'<$text codeHighlight="hljs-title function_">greet</$text>' +
						'(' +
						'<$text codeHighlight="hljs-params">name</$text>' +
						') {' +
						'<softBreak></softBreak>' +
						'  ' +
						'<$text codeHighlight="hljs-variable language_">console</$text>' +
						'.' +
						'<$text codeHighlight="hljs-title function_">log</$text>' +
						'(' +
						'<$text codeHighlight="hljs-string">"Hello, "</$text>' +
						' + name);' +
						'<softBreak></softBreak>' +
						'}[]' +
					'</codeBlock>'
				);

				// Verify that the view renders the pasted code with correct highlighting.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="JavaScript" spellcheck="false">' +
						'<code class="language-javascript">' +
							'<span class="hljs-keyword">function</span>' +
							' ' +
							'<span class="function_ hljs-title">greet</span>' +
							'(' +
							'<span class="hljs-params">name</span>' +
							') {' +
							'<br></br>' +
							'  ' +
							'<span class="hljs-variable language_">console</span>' +
							'.' +
							'<span class="function_ hljs-title">log</span>' +
							'(' +
							'<span class="hljs-string">"Hello, "</span>' +
							' + name);' +
							'<br></br>' +
							'}' +
						'</code>' +
					'</pre>'
				);
			} );

			it( 'should apply syntax highlighting to pasted content with nested code block', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				// Create a mock clipboard data transfer with multi-line JavaScript code.
				const dataTransferMock = {
					getData: sinon.stub().withArgs( 'text/html' ).returns(
						'<blockquote>' +
							'<p>Snippet:</p>' +
							'<pre><code class="language-javascript">function greet(name) {\n' +
							'  console.log("Hello, " + name);\n' +
							'}</code></pre>' +
						'</blockquote>'
					)
				};

				// Simulate paste event.
				view.document.fire( 'clipboardInput', {
					dataTransfer: dataTransferMock,
					stop: sinon.spy()
				} );

				// Verify that the model has codeHighlight attributes applied correctly to the pasted code.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph>Snippet:</paragraph>' +
						'<codeBlock language="javascript">' +
							'<$text codeHighlight="hljs-keyword">function</$text>' +
							' <$text codeHighlight="hljs-title function_">greet</$text>' +
							'(<$text codeHighlight="hljs-params">name</$text>) {<softBreak></softBreak>' +
							'  <$text codeHighlight="hljs-variable language_">console</$text>.' +
							'<$text codeHighlight="hljs-title function_">log</$text>' +
							'(<$text codeHighlight="hljs-string">"Hello, "</$text> + name);<softBreak></softBreak>' +
							'}[]' +
						'</codeBlock>' +
					'</blockQuote>'
				);

				// Verify that the view renders the pasted code with correct highlighting.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<p>foo</p>' +
					'<blockquote>' +
						'<p>Snippet:</p>' +
						'<pre data-language="JavaScript" spellcheck="false"><code class="language-javascript">' +
							'<span class="hljs-keyword">function</span> <span class="function_ hljs-title">greet</span>' +
							'(<span class="hljs-params">name</span>) {<br></br>' +
							'  <span class="hljs-variable language_">console</span>.' +
							'<span class="function_ hljs-title">log</span>(<span class="hljs-string">"Hello, "</span> + name);<br></br>' +
							'}' +
						'</code></pre>' +
					'</blockquote>'
				);
			} );
		} );

		describe( 'cleanup on structure changes', () => {
			// Tests verifying that codeHighlight attributes are properly removed when code blocks
			// are deleted, merged, or converted to other element types.

			it( 'should remove highlight attributes when merging code block into paragraph', () => {
				_setModelData( model,
					'<paragraph>Foobar</paragraph>' +
					'<codeBlock language="javascript">[]const test = "test";</codeBlock>'
				);

				// Execute backspace to merge the code block with the preceding paragraph.
				editor.execute( 'delete', { direction: 'backward' } );

				// Verify that the model has no codeHighlight attributes after merging.
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<paragraph>Foobar[]const test = "test";</paragraph>'
				);

				// Verify that the view has no highlight spans after merging.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<p>Foobarconst test = "test";</p>'
				);
			} );

			it( 'should remove highlight attributes when converting code block to paragraphs', () => {
				_setModelData( model,
					'<codeBlock language="javascript">' +
						'const test = "test";' +
						'<softBreak></softBreak>' +
						'let i = 0;[]' +
					'</codeBlock>'
				);

				// Execute the codeBlock command to toggle it off (converts to paragraphs).
				editor.execute( 'codeBlock' );

				// Verify that the model has no codeHighlight attributes (lines split into paragraphs).
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<paragraph>const test = "test";</paragraph>' +
					'<paragraph>let i = 0;[]</paragraph>'
				);

				// Verify that the view has no highlight spans after conversion.
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<p>const test = "test";</p>' +
					'<p>let i = 0;</p>'
				);
			} );
		} );
	} );
} );
