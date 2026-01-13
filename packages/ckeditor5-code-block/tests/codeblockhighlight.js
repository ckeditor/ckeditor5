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
		it( '🐛 BUG: selection jumps and highlighting fails when typing "console.log(\\"test\\");" (real DOM typing)', async () => {
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
				const modelData = _getModelData( model );

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
			expect( _getModelData( model ) ).to.equal(
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
	} );
} );
