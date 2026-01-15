/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CodeBlockHighlight } from '../src/codeblockhighlight.js';
import { CodeBlockEditing } from '../src/codeblockediting.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { fireBeforeInputDomEvent } from '@ckeditor/ckeditor5-typing/tests/_utils/utils.js';

describe( 'CodeBlockHighlight', () => {
	let editor, element, model, view, domRoot;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ CodeBlockEditing, CodeBlockHighlight, Paragraph, Typing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				// Get the DOM root for firing real DOM events
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
			it( 'should highlight JavaScript code on initialization', () => {
				_setModelData( model,
					'<codeBlock language="javascript">' +
						'const x = 5;' +
						'<softBreak></softBreak>' +
						'console.log(x);[]' +
					'</codeBlock>'
				);

				// Verify model has codeHighlight attributes with exact structure
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

				// Verify view has exact structure with highlight spans
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

				// Verify model does NOT have codeHighlight attributes (plain text only)
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="plaintext">just some text[]</codeBlock>'
				);

				// Verify view has no highlight spans (plain text only)
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
				// Manually create code block with valid CSS syntax (can't use _setModelData because {} are selection markers)
				model.change( writer => {
					const root = model.document.getRoot();
					writer.remove( writer.createRangeIn( root ) );

					const codeBlock = writer.createElement( 'codeBlock', { language: 'css' } );
					writer.insert( codeBlock, root, 0 );

					writer.insertText( '.foo { color: red; }', codeBlock, 0 );
					writer.setSelection( codeBlock, 'end' );
				} );

				// Verify model has codeHighlight attributes with exact structure
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="css">' +
						'<$text codeHighlight="hljs-selector-class">.foo</$text>' +
						' { ' +
						'<$text codeHighlight="hljs-attribute">color</$text>' +
						': red; }[]' +
					'</codeBlock>'
				);

				// Verify view has exact CSS highlighting structure
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

				// Verify model has codeHighlight attributes with exact structure
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

				// Verify view has exact multi-line structure
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
			it( 'should apply highlighting while typing', async () => {
				_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

				// Type "const x = 5;"
				const text = 'const x = 5;';
				for ( const char of text ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for highlighting to complete
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Verify model has codeHighlight attributes with exact structure
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' x = ' +
						'<$text codeHighlight="hljs-number">5</$text>' +
						';[]' +
					'</codeBlock>'
				);

				// Verify view has exact highlighting structure
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

			it( 'should apply highlighting when typing in existing multi-line code block', async () => {
				// Create code block with existing JavaScript function (using model.change to handle {})
				model.change( writer => {
					const root = model.document.getRoot();
					writer.remove( writer.createRangeIn( root ) );

					const codeBlock = writer.createElement( 'codeBlock', { language: 'javascript' } );
					writer.insert( codeBlock, root, 0 );

					// Insert: function foo() {\n  const name = 'John';\n}
					writer.insertText( 'function foo() {', codeBlock, 0 );
					writer.insert( writer.createElement( 'softBreak' ), codeBlock, 'end' );
					writer.insertText( '  const name = \'John\';', codeBlock, 'end' );
					writer.insert( writer.createElement( 'softBreak' ), codeBlock, 'end' );
					writer.insertText( '}', codeBlock, 'end' );

					// Position cursor at the end of line 2, after the semicolon
					// We need to find the position after "  const name = 'John';"
					const softBreaks = Array.from( codeBlock.getChildren() )
						.filter( child => child.is( 'element', 'softBreak' ) );
					const secondSoftBreak = softBreaks[ 1 ];
					const positionBeforeSoftBreak = writer.createPositionBefore( secondSoftBreak );
					writer.setSelection( positionBeforeSoftBreak );
				} );

				// Wait for initial highlighting
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Type a space and then the comment character by character
				const commentText = ' // Initialize name.';

				for ( const char of commentText ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for highlighting to complete
				await new Promise( resolve => setTimeout( resolve, 100 ) );

				// Verify model has correct highlighting for the comment and existing code
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

				// Verify view has correct highlighting structure
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

			it( 'should not wrap all text in highlight spans', async () => {
				_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

				// Type "const x = 5;"
				const text = 'const x = 5;';
				for ( const char of text ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for highlighting to complete
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Verify view has plain text between spans (operators, spaces, semicolon not wrapped)
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
			it( 'should re-highlight when changing from JavaScript to plaintext', () => {
				_setModelData( model,
					'<codeBlock language="javascript">const x = 10;[]</codeBlock>'
				);

				// Change language to plaintext
				const codeBlock = model.document.getRoot().getChild( 0 );
				model.change( writer => {
					writer.setAttribute( 'language', 'plaintext', codeBlock );
				} );

				// Reconvert the element to update view
				editor.editing.reconvertItem( codeBlock );

				// Verify highlighting is removed from model and view
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

			it( 'should re-highlight when changing from plaintext to JavaScript', () => {
				_setModelData( model,
					'<codeBlock language="plaintext">const x = 10;[]</codeBlock>'
				);

				// Change language to JavaScript
				const codeBlock = model.document.getRoot().getChild( 0 );
				model.change( writer => {
					writer.setAttribute( 'language', 'javascript', codeBlock );
				} );

				// Reconvert the element to update view
				editor.editing.reconvertItem( codeBlock );

				// Verify highlighting is applied in model and view
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

		describe( 'cleanup on structure changes', () => {
			it( 'should remove highlight attributes when merging code block into paragraph', () => {
				_setModelData( model,
					'<paragraph>Foobar</paragraph>' +
					'<codeBlock language="javascript">[]const test = "test";</codeBlock>'
				);

				// Execute backspace to merge code block with paragraph
				editor.execute( 'delete', { direction: 'backward' } );

				// Verify model has no codeHighlight attributes
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<paragraph>Foobar[]const test = "test";</paragraph>'
				);

				// Verify view has no highlight spans
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<p>Foobarconst test = "test";</p>'
				);
			} );

			it( 'should remove highlight attributes when changing code block to paragraph', () => {
				_setModelData( model,
					'<codeBlock language="javascript">' +
						'const test = "test";' +
						'<softBreak></softBreak>' +
						'let i = 0;[]' +
					'</codeBlock>'
				);

				// Execute codeBlock command to toggle it off (changes to paragraphs)
				editor.execute( 'codeBlock' );

				// Verify model has no codeHighlight attributes (split into paragraphs)
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<paragraph>const test = "test";</paragraph>' +
					'<paragraph>let i = 0;[]</paragraph>'
				);

				// Verify view has no highlight spans
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<p>const test = "test";</p>' +
					'<p>let i = 0;</p>'
				);
			} );
		} );
	} );
} );
