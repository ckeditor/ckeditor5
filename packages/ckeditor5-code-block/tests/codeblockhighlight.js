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

/**
 * Helper to get model data with text and selection only (ignoring codeHighlight attributes).
 * Strips out <$text codeHighlight="..."> wrappers to focus on content and selection position.
 */
function getModelTextWithSelection( model ) {
	const fullData = _getModelData( model );

	// Remove all <$text codeHighlight="..."> and </$text> tags
	// Keep the text content and selection markers ([], {}, etc.)
	return fullData
		.replace( /<\$text codeHighlight="[^"]*">/g, '' )
		.replace( /<\/\$text>/g, '' );
}

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
				_setModelData( model,
					'<codeBlock language="css">' +
						'.foo' +
						'<softBreak></softBreak>' +
						' color: red;[]' +
					'</codeBlock>'
				);

				// Verify model has codeHighlight attributes with exact structure
				const modelData = _getModelData( model );
				expect( modelData ).to.equal(
					'<codeBlock language="css">' +
						'<$text codeHighlight="hljs-selector-class">.foo</$text>' +
						'<softBreak></softBreak>' +
						' ' +
						'<$text codeHighlight="hljs-attribute">color</$text>' +
						': red;[]' +
					'</codeBlock>'
				);

				// Verify view has exact CSS highlighting structure
				const viewData = _getViewData( view, { withoutSelection: true } );
				expect( viewData ).to.equal(
					'<pre data-language="CSS" spellcheck="false">' +
						'<code class="language-css">' +
							'<span class="hljs-selector-class">.foo</span>' +
							'<br></br>' +
							' ' +
							'<span class="hljs-attribute">color</span>' +
							': red;' +
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
			it( 'should maintain correct selection when typing', async () => {
				_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

				// Type "console.log"
				const text = 'console.log';
				for ( const char of text ) {
					fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
				}

				// Wait for highlighting to complete
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// Verify final selection is at the end
				expect( getModelTextWithSelection( model ) ).to.equal(
					'<codeBlock language="javascript">console.log[]</codeBlock>'
				);
			} );

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

				// Verify initial JavaScript highlighting in model and view
				let modelData = _getModelData( model );
				let viewData = _getViewData( view, { withoutSelection: true } );
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

				// Change language to plaintext
				model.change( writer => {
					const codeBlock = model.document.getRoot().getChild( 0 );
					writer.setAttribute( 'language', 'plaintext', codeBlock );
				} );

				// Verify highlighting is removed from model and view
				modelData = _getModelData( model );
				viewData = _getViewData( view, { withoutSelection: true } );
				expect( modelData ).to.equal(
					'<codeBlock language="plaintext">const x = 10;[]</codeBlock>'
				);
				// Verify no highlight spans (plain text only)
				expect( viewData ).to.not.include( '<span class="hljs' );
				expect( viewData ).to.include( '<code' );
				expect( viewData ).to.include( '>const x = 10;</code>' );
			} );

			it( 'should re-highlight when changing from plaintext to JavaScript', () => {
				_setModelData( model,
					'<codeBlock language="plaintext">const x = 10;[]</codeBlock>'
				);

				// Verify no highlighting initially
				let modelData = _getModelData( model );
				let viewData = _getViewData( view, { withoutSelection: true } );
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

				// Change language to JavaScript
				model.change( writer => {
					const codeBlock = model.document.getRoot().getChild( 0 );
					writer.setAttribute( 'language', 'javascript', codeBlock );
				} );

				// Verify highlighting is applied in model and view
				modelData = _getModelData( model );
				viewData = _getViewData( view, { withoutSelection: true } );
				expect( modelData ).to.equal(
					'<codeBlock language="javascript">' +
						'<$text codeHighlight="hljs-keyword">const</$text>' +
						' x = ' +
						'<$text codeHighlight="hljs-number">10</$text>' +
						';[]' +
					'</codeBlock>'
				);
				// Verify highlight spans are present
				expect( viewData ).to.include( '<span class="hljs-keyword">const</span>' );
				expect( viewData ).to.include( '<span class="hljs-number">10</span>' );
				expect( viewData ).to.include( '<code' );
				expect( viewData ).to.include( ' x = ' );
			} );

			it( 'should re-highlight when changing between different languages', () => {
				_setModelData( model,
					'<codeBlock language="javascript">const x = 10;[]</codeBlock>'
				);

				// Verify JavaScript highlighting in model and view
				let modelData = _getModelData( model );
				let viewData = _getViewData( view, { withoutSelection: true } );
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

				// Change to CSS
				model.change( writer => {
					const codeBlock = model.document.getRoot().getChild( 0 );
					writer.setAttribute( 'language', 'css', codeBlock );
				} );

				// Verify CSS highlighting (different from JavaScript)
				// In CSS context, "x" becomes attribute and "10" becomes number
				modelData = _getModelData( model );
				viewData = _getViewData( view, { withoutSelection: true } );
				expect( modelData ).to.equal(
					'<codeBlock language="css">' +
						'const ' +
						'<$text codeHighlight="hljs-attribute">x</$text>' +
						' = ' +
						'<$text codeHighlight="hljs-number">10</$text>' +
						';[]' +
					'</codeBlock>'
				);
				// Verify CSS-specific highlighting (different from JavaScript)
				expect( viewData ).to.not.include( '<span class="hljs-keyword">const</span>' );
				expect( viewData ).to.include( '<span class="hljs-attribute">x</span>' );
				expect( viewData ).to.include( '<span class="hljs-number">10</span>' );
				expect( viewData ).to.include( 'const ' );
			} );
		} );
	} );
} );
