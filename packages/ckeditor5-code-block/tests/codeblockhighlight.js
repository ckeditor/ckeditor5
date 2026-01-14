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
		it( 'should highlight code in real-time without visible selection jumps when typing "console.l"', async () => {
			_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

			// Type "console" rapidly
			for ( const char of 'console' ) {
				fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: char } );
				await new Promise( resolve => setTimeout( resolve, 10 ) );
			}

			// Type "." immediately after
			fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: '.' } );
			await new Promise( resolve => setTimeout( resolve, 50 ) );

			// Verify state before typing "l"
			expect( getModelTextWithSelection( model ) ).to.equal(
				'<codeBlock language="javascript">console.[]</codeBlock>',
				'Selection should be after "." before typing "l"'
			);

			// Type "l"
			fireBeforeInputDomEvent( domRoot, { inputType: 'insertText', data: 'l' } );

			// Wait for all operations to complete
			await new Promise( resolve => setTimeout( resolve, 50 ) );

			// Verify final selection is correct
			expect( getModelTextWithSelection( model ) ).to.equal(
				'<codeBlock language="javascript">console.l[]</codeBlock>',
				'Final selection should be after "l" (not before it)'
			);

			// Verify highlighting is applied correctly in the view (what users see)
			const viewData = _getViewData( view, { withoutSelection: true } );

			expect( viewData ).to.include(
				'<span class="hljs-variable language_">console</span>',
				'"console" should be highlighted'
			);

			expect( viewData ).to.include(
				'<span class="hljs-property">l</span>',
				'"l" should be highlighted as property'
			);

			// Verify punctuation is not wrapped
			expect( viewData ).to.match( /console<\/span>\.<span/, '"." should be plain text between spans' );
		} );

		it( 'should maintain correct selection when typing "console.l" step by step', async () => {
			_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

			// Step 1: Type "console" - should highlight after "e"
			for ( const char of 'console' ) {
				fireBeforeInputDomEvent( domRoot, {
					inputType: 'insertText',
					data: char
				} );
				await new Promise( resolve => setTimeout( resolve, 50 ) );
			}

			// Verify we have "console" and selection is at the end
			expect( getModelTextWithSelection( model ) ).to.equal(
				'<codeBlock language="javascript">console[]</codeBlock>',
				'After typing "console", selection should be at the end'
			);

			// Step 2: Type "." - this triggers highlighting of "console"
			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: '.'
			} );
			await new Promise( resolve => setTimeout( resolve, 50 ) );

			// Verify selection is still at the end after "."
			expect( getModelTextWithSelection( model ) ).to.equal(
				'<codeBlock language="javascript">console.[]</codeBlock>',
				'After typing ".", selection should be after the dot'
			);

			// Verify "console" is now highlighted
			const viewAfterDot = _getViewData( view, { withoutSelection: true } );
			expect( viewAfterDot ).to.include(
				'<span class="hljs-variable language_">console</span>',
				'"console" should be highlighted after typing "."'
			);

			// Step 3: Type "l" - THIS IS WHERE THE BUG OCCURS
			// Track all selection changes during this operation
			const selectionChanges = [];
			const selectionListener = () => {
				selectionChanges.push( {
					time: Date.now(),
					model: _getModelData( model ),
					view: _getViewData( view )
				} );
			};

			model.document.selection.on( 'change', selectionListener );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: 'l'
			} );

			// Wait for all operations to complete
			await new Promise( resolve => setTimeout( resolve, 100 ) );

			model.document.selection.off( 'change', selectionListener );

			// Check final state (what users see)
			const modelAfterL = getModelTextWithSelection( model );

			// Selection should stay at "console.l[]"
			expect( modelAfterL ).to.equal(
				'<codeBlock language="javascript">console.l[]</codeBlock>',
				'After typing "l", selection should be after "l"'
			);

			// Verify "l" is highlighted in the view
			const viewAfterL = _getViewData( view, { withoutSelection: true } );
			expect( viewAfterL ).to.include(
				'<span class="hljs-property">l</span>',
				'"l" should be highlighted as a property'
			);
		} );

		it( 'should highlight code in real-time while typing full statement "console.log(\\"test\\");"', async () => {
			_setModelData( model, '<codeBlock language="javascript">[]</codeBlock>' );

			// Type the full statement character by character with real DOM events
			const fullText = 'console.log("test");';
			let currentText = '';

			for ( const char of fullText ) {
				// Fire real DOM beforeinput event
				fireBeforeInputDomEvent( domRoot, {
					inputType: 'insertText',
					data: char
				} );
				currentText += char;

				// Wait for all async operations (reduced delay for faster test)
				await new Promise( resolve => setTimeout( resolve, 50 ) );

				// After each character, verify selection is at the end
				const modelData = getModelTextWithSelection( model );

				// The BUG: Selection jumps at word boundaries (., (, ), etc.)
				// Expected: console.log("test");[]
				// Actual:   console[].(log("test"); or similar jumps
				expect( modelData ).to.equal(
					`<codeBlock language="javascript">${ currentText }[]</codeBlock>`,
					`🐛 After typing "${ char }", selection should be at END of: "${ currentText }"`
				);

				// After typing "console", verify it gets highlighted
				if ( currentText === 'console' ) {
					const viewData = _getViewData( view, { withoutSelection: true } );

					// Check if "console" is highlighted
					expect( viewData ).to.include(
						'<span class="hljs-variable language_">console</span>',
						'After typing "console", it should be highlighted immediately'
					);
				}
			}

			// Wait for final highlighting
			await new Promise( resolve => setTimeout( resolve, 100 ) );

			// Final verification
			expect( getModelTextWithSelection( model ) ).to.equal(
				'<codeBlock language="javascript">console.log("test");[]</codeBlock>',
				'Selection should be at the end of the statement'
			);

			const viewData = _getViewData( view, { withoutSelection: true } );

			// Verify syntax highlighting is applied correctly
			expect( viewData ).to.include( '<span class="hljs-variable language_">console</span>' );
			expect( viewData ).to.include( '<span class="function_ hljs-title">log</span>' );
			expect( viewData ).to.include( '<span class="hljs-string">"test"</span>' );

			// Verify plain text (punctuation) is not highlighted
			expect( viewData ).to.include( '</span>.<span' );
			expect( viewData ).to.include( '</span>(<span' );
			expect( viewData ).to.include( '</span>);<' );
		} );

		it( 'should highlight JavaScript code on initialization', () => {
			_setModelData( model,
				'<codeBlock language="javascript">' +
					'const x = 5;' +
					'<softBreak></softBreak>' +
					'console.log(\'Hello World\');' +
					'<softBreak></softBreak>' +
					'const y = 10;' +
				'</codeBlock>'
			);

			const viewData = _getViewData( view, { withoutSelection: true } );

			// Verify syntax highlighting spans are present
			expect( viewData ).to.include( '<span class="hljs-keyword">const</span>' );
			expect( viewData ).to.include( '<span class="hljs-variable language_">console</span>' );
			expect( viewData ).to.include( '<span class="function_ hljs-title">log</span>' );
			expect( viewData ).to.include( '<span class="hljs-string">\'Hello World\'</span>' );

			// Verify plain text (punctuation, operators) is not highlighted
			expect( viewData ).to.include( '</span> x = <span' );
			expect( viewData ).to.include( '</span>.<span' );
			expect( viewData ).to.include( '</span>(<span' );
			expect( viewData ).to.include( '</span>);<' );
			expect( viewData ).to.include( '</span> y = <span' );
		} );

		it( 'should not highlight plaintext code', () => {
			_setModelData( model,
				'<codeBlock language="plaintext">just some text</codeBlock>'
			);

			const viewData = _getViewData( view, { withoutSelection: true } );

			// Plaintext should not have any highlighting spans
			expect( viewData ).to.not.include( '<span class="hljs' );
			expect( viewData ).to.include( 'just some text' );
		} );

		it( 'should highlight CSS code', () => {
			_setModelData( model,
				'<codeBlock language="css">' +
					'.foo' +
					'<softBreak></softBreak>' +
					'\tcolor: red;' +
				'</codeBlock>'
			);

			const viewData = _getViewData( view, { withoutSelection: true } );

			// Verify CSS-specific syntax highlighting
			expect( viewData ).to.include( '<span class="hljs-selector-class">.foo</span>' );
			expect( viewData ).to.include( '<span class="hljs-attribute">color</span>' );
			expect( viewData ).to.include( 'red' );

			// Verify plain text (punctuation) is not highlighted
			expect( viewData ).to.match( /color<\/span>:\s+/ );
			expect( viewData ).to.include( 'red;' );
		} );

		it( 'should re-highlight code when language attribute changes', () => {
			// Start with JavaScript code
			_setModelData( model,
				'<codeBlock language="javascript">const x = 10;[]</codeBlock>'
			);

			const viewAfterJS = _getViewData( view, { withoutSelection: true } );

			// Verify JavaScript highlighting
			expect( viewAfterJS ).to.include( '<span class="hljs-keyword">const</span>' );

			// Change language to plaintext
			model.change( writer => {
				const codeBlock = model.document.getRoot().getChild( 0 );
				writer.setAttribute( 'language', 'plaintext', codeBlock );
			} );

			const viewAfterPlaintext = _getViewData( view, { withoutSelection: true } );

			// Verify highlighting is removed (plaintext has no highlights)
			expect( viewAfterPlaintext ).to.not.include( '<span class="hljs-keyword">const</span>' );
			expect( viewAfterPlaintext ).to.not.include( '<span class="hljs' );
			expect( viewAfterPlaintext ).to.include( 'const x = 10;' );

			// Change language back to JavaScript
			model.change( writer => {
				const codeBlock = model.document.getRoot().getChild( 0 );
				writer.setAttribute( 'language', 'javascript', codeBlock );
			} );

			const viewAfterJSAgain = _getViewData( view, { withoutSelection: true } );

			// Verify JavaScript highlighting is back
			expect( viewAfterJSAgain ).to.include( '<span class="hljs-keyword">const</span>' );
		} );
	} );
} );
