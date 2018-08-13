/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { expectPaste } from '../_utils/utils';

import simple from '../data/integration/list/simple/input.word2016.html';
import styled from '../data/integration/list/styled/input.word2016.html';
import multiple from '../data/integration/list/multiple/input.word2016.html';
import multipleCombined from '../data/integration/list/multiple-combined/input.word2016.html';

describe( 'List – integration', () => {
	let element, editor;

	before( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Link, List ] } )
			.then( editorInstance => {
				editor = editorInstance;
			} );
	} );

	beforeEach( () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
	} );

	after( () => {
		editor.destroy();

		element.remove();
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>1.</span<span>Item1</span></p>
	//		<p><span>2.</span>><span>Item2</span></p>
	//
	// which should result in the same output as pasting:
	//
	//		<ol><li>Item1</li><li>Item2</li></ol>
	//
	// Input same for: Chrome, Firefox and Edge.
	describe( 'simple', () => {
		it( 'pastes in the empty editor', () => {
			const expectedView = '<ol><li>Item1</li><li>Item2{}</li></ol>';

			const expectedModel = '<listItem listIndent="0" listType="numbered">Item1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item2[]</listItem>';

			expectPaste( editor, simple, expectedModel, expectedView );
		} );

		it( 'pastes in the paragraph', () => {
			const expectedView = '<p>More Item1</p><ol><li>Item2{} text</li></ol>';

			const expectedModel = '<paragraph>More Item1</paragraph>' +
				'<listItem listIndent="0" listType="numbered">Item2[] text</listItem>';

			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, simple, expectedModel, expectedView );
		} );

		it( 'pastes in the heading', () => {
			const expectedView = '<h2>More Item1</h2><ol><li>Item2{} text</li></ol>';

			const expectedModel = '<heading1>More Item1</heading1>' +
				'<listItem listIndent="0" listType="numbered">Item2[] text</listItem>';

			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, simple, expectedModel, expectedView );
		} );

		it( 'pastes in the inline styling context', () => {
			const expectedView = '<p><strong>Ita</strong>Item1</p><ol><li>Item2{}<strong>lic</strong></li></ol>';

			const expectedModel = '<paragraph><$text bold="true">Ita</$text>Item1</paragraph>' +
				'<listItem listIndent="0" listType="numbered">Item2[]<$text bold="true">lic</$text></listItem>';

			setData( editor.model, '<paragraph><$text bold="true">Ita[]lic</$text></paragraph>' );

			expectPaste( editor, simple, expectedModel, expectedView );
		} );

		it( 'pastes inside another list', () => {
			const expectedView = '<ol><li>ItemAItem1</li><li>Item2{}</li><li>ItemB</li></ol>';

			const expectedModel = '<listItem listIndent="0" listType="numbered">ItemAItem1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item2[]</listItem>' +
				'<listItem listIndent="0" listType="numbered">ItemB</listItem>';

			setData( editor.model, '<listItem listIndent="0" listType="numbered">ItemA[]</listItem>' +
				'<listItem listIndent="0" listType="numbered">ItemB</listItem>' );

			expectPaste( editor, simple, expectedModel, expectedView );
		} );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p>List:</p>
	//		<p><span>·</span><span>B<b>old</b></span></p>
	//		<p><span>·</span><span><a href="https://cksource.com">Lin</a>k</span></p>
	//		<p><span>·</span><span><i>M<b>ul<u>tip</u></b><u>le</u></span></i></p>
	//
	// which should result in the same output as pasting:
	//
	// 		<p>List:</p>
	// 		<ul>
	// 			<li>B<b>old</b></li>
	// 			<li><a href="https://cksource.com">Lin</a>k</li>
	// 			<li><i>M<b>ul<u>tip</u></b><u>le</u></i></li>
	// 		</ul>
	//
	// Input same for: Chrome, Firefox and Edge.
	describe( 'styled', () => {
		it( 'pastes in the empty editor', () => {
			const expectedView = '<p>List:</p><ul><li>B<strong>old</strong></li>' +
				'<li><a href="https://cksource.com">Lin</a>k</li>' +
				'<li><i>M<strong>ul<u>tip</u></strong><u>le{}</u></i></li></ul>';

			const expectedModel = '<paragraph>List:</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">B<$text bold="true">old</$text></listItem>' +
				'<listItem listIndent="0" listType="bulleted"><$text linkHref="https://cksource.com">Lin</$text>k</listItem>' +
				'<listItem listIndent="0" listType="bulleted"><$text italic="true">M</$text><$text bold="true" italic="true">ul</$text>' +
				'<$text bold="true" italic="true" underline="true">tip</$text>' +
				'<$text italic="true" underline="true">le[]</$text></listItem>';

			expectPaste( editor, styled, expectedModel, expectedView );
		} );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>1.</span><span>Item1</span></p>
	//		<p><span>2.</span><span>Item 2</span></p>
	//		<p>Some text</p>
	//		<p><span>·</span><span>Bullet 1</span></p>
	//
	// which should result in the same output as pasting:
	//
	//		<ol>
	//			<li>Item1</li>
	//			<li>Item 2</li>
	//		</ol>
	//		<p>Some text</p>
	//		<ul>
	//			<li>Bullet 1</li>
	//		</ul>
	//
	// Input same for: Chrome, Firefox and Edge.
	describe( 'multiple', () => {
		it( 'pastes in the empty editor', () => {
			const expectedView = '<ol><li>Item1</li><li>Item 2</li></ol><p>Some text</p><ul><li>Bullet 1{}</li></ul>';

			const expectedModel = '<listItem listIndent="0" listType="numbered">Item1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
				'<paragraph>Some text</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Bullet 1[]</listItem>';

			expectPaste( editor, multiple, expectedModel, expectedView );
		} );

		it( 'pastes inside heading', () => {
			const expectedView = '<h2>More Item1</h2><ol><li>Item 2</li></ol><p>Some text</p><ul><li>Bullet 1{} text</li></ul>';

			const expectedModel = '<heading1>More Item1</heading1>' +
				'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
				'<paragraph>Some text</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Bullet 1[] text</listItem>';

			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, multiple, expectedModel, expectedView );
		} );

		it( 'pastes inside another list', () => {
			const expectedView = '<ul><li>ItemAItem1</li></ul><ol><li>Item 2</li></ol><p>Some text</p>' +
				'<ul><li>Bullet 1{}</li><li>ItemB</li></ul>';

			const expectedModel = '<listItem listIndent="0" listType="bulleted">ItemAItem1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
				'<paragraph>Some text</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Bullet 1[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted">ItemB</listItem>';

			setData( editor.model, '<listItem listIndent="0" listType="bulleted">ItemA[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted">ItemB</listItem>' );

			expectPaste( editor, multiple, expectedModel, expectedView );
		} );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>1.</span><span>Item1</span></p>
	//		<p><span>2.</span><span>Item 2</span></p>
	//		<p><span>1.</span><span>Item 1</span></p>
	//		<p><span>2.</span><span>Item2</span></p>
	//
	// which should result in the same output as pasting:
	//
	// 		<ol>
	// 			<li>Item1</li>
	// 			<li>Item 2</li>
	// 		</ol>
	// 		<ol>
	// 			<li>Item 1</li>
	// 			<li>Item2</li>
	// 		</ol>
	//
	// Input same for: Chrome, Firefox and Edge.
	describe( 'multiple combined', () => {
		it( 'pastes in the empty editor', () => {
			// Should create two subsequent lists, see https://github.com/ckeditor/ckeditor5-list/issues/99.
			const expectedView = '<ol><li>Item1</li><li>Item 2</li></ol><ol><li>Item 1</li><li>Item2{}</li></ol>';

			const expectedModel = '<listItem listIndent="0" listType="numbered">Item1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item 1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item2[]</listItem>';

			expectPaste( editor, multipleCombined, expectedModel, expectedView );
		} );

		it( 'pastes inside another list', () => {
			// Should create two subsequent lists, see https://github.com/ckeditor/ckeditor5-list/issues/99.
			const expectedView = '<ul><li>ItemAItem1</li></ul><ol><li>Item 2</li></ol>' +
				'<ol><li>Item 1</li><li>Item2{}</li></ol><ul><li>ItemB</li></ul>';

			const expectedModel = '<listItem listIndent="0" listType="bulleted">ItemAItem1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item 1</listItem>' +
				'<listItem listIndent="0" listType="numbered">Item2[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted">ItemB</listItem>';

			setData( editor.model, '<listItem listIndent="0" listType="bulleted">ItemA[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted">ItemB</listItem>' );

			expectPaste( editor, multipleCombined, expectedModel, expectedView );
		} );
	} );
} );
