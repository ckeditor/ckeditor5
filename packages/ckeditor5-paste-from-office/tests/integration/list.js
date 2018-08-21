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
import PasteFromWord from '../../src/pastefromword';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { expectPaste } from '../_utils/utils';

import simple from '../data/integration/list/simple/input.word2016.html';
import styled from '../data/integration/list/styled/input.word2016.html';
import multiple from '../data/integration/list/multiple/input.word2016.html';
import multipleCombined from '../data/integration/list/multiple-combined/input.word2016.html';
import manyOneItem from '../data/integration/list/many-one-item/input.word2016.html';
import heading1 from '../data/integration/list/heading1/input.word2016.html';
import heading3Styled from '../data/integration/list/heading3-styled/input.word2016.html';
import heading7 from '../data/integration/list/heading7/input.word2016.html';

describe( 'List – integration', () => {
	let element, editor;

	before( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Link, List, PasteFromWord ] } )
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
	//		<p><span>2.</span>><span>Item 2</span></p>
	//
	// which should result in the same output as pasting:
	//
	//		<ol><li>Item1</li><li>Item2</li></ol>
	it( 'pastes simple list', () => {
		const expectedModel = '<listItem listIndent="0" listType="numbered">Item1</listItem>' +
			'<listItem listIndent="0" listType="numbered">Item 2[]</listItem>';

		expectPaste( editor, simple, expectedModel );
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
	it( 'pastes list with styled items prepended by a paragraph', () => {
		const expectedModel = '<paragraph>List:</paragraph>' +
			'<listItem listIndent="0" listType="bulleted">B<$text bold="true">old</$text></listItem>' +
			'<listItem listIndent="0" listType="bulleted"><$text linkHref="https://cksource.com">Lin</$text>k</listItem>' +
			'<listItem listIndent="0" listType="bulleted"><$text italic="true">M</$text><$text bold="true" italic="true">ul</$text>' +
			'<$text bold="true" italic="true" underline="true">tip</$text>' +
			'<$text italic="true" underline="true">le[]</$text></listItem>';

		expectPaste( editor, styled, expectedModel );
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
	it( 'pastes multiple lists separated by the paragraph', () => {
		const expectedModel = '<listItem listIndent="0" listType="numbered">Item1</listItem>' +
			'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
			'<paragraph>Some text</paragraph>' +
			'<listItem listIndent="0" listType="bulleted">Bullet 1[]</listItem>';

		expectPaste( editor, multiple, expectedModel );
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
	// It will create one list, see https://github.com/ckeditor/ckeditor5-list/issues/99.
	it( 'pastes multiple lists one right after another', () => {
		const expectedModel = '<listItem listIndent="0" listType="numbered">Item1</listItem>' +
			'<listItem listIndent="0" listType="numbered">Item 2</listItem>' +
			'<listItem listIndent="0" listType="numbered">Item 1</listItem>' +
			'<listItem listIndent="0" listType="numbered">Item2[]</listItem>';

		expectPaste( editor, multipleCombined, expectedModel );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>1.</span><span>A</span></p>
	//		<p><span>1)</span><span>B</span></p>
	//		<p><span>I.</span><span>C</span></p>
	//		<p><span>A.</span><span>D</span></p>
	//		<p><span>a)</span><span>E</span></p>
	//		<p><span>a.</span><span>F</span></p>
	//		<p><span>i.</span><span>G</span></p>
	//		<p></p>
	//		<p><span>·</span><span>H</span></p>
	//		<p><span>o</span><span>I</span></p>
	//		<p></p>
	//		<p><span>§</span><span>J</span></p>
	//		<p><span><img... /></span><span>k</span></p>
	//		<p></p>
	//		<p><span>1.</span><span>h1</span></p>
	//
	// which should result in the same output as pasting:
	//
	//		<ol><li>A</li></ol>
	//		<ol><li>B</li></ol>
	//		<ol><li>C</li></ol>
	//		<ol><li>D</li></ol>
	//		<ol><li>E</li></ol>
	//		<ol><li>F</li></ol>
	//		<ol><li>G</li></ol>
	//		<p></p>
	//		<ul><li>H</li></ul>
	//		<ul><li>I</li></ul>
	//		<p></p>
	//		<ul><li>J</li></ul>
	//		<ul><li>k</li></ul>
	//		<p></p>
	//		<ol><li>h1</li></ol>
	//
	// It will create one list, for all lists not separated by any element - see https://github.com/ckeditor/ckeditor5-list/issues/99.
	it( 'pastes many one item lists', () => {
		const expectedModel = '<listItem listIndent="0" listType="numbered">A</listItem>' +
			'<listItem listIndent="0" listType="numbered">B</listItem>' +
			'<listItem listIndent="0" listType="numbered">C</listItem>' +
			'<listItem listIndent="0" listType="numbered">D</listItem>' +
			'<listItem listIndent="0" listType="numbered">E</listItem>' +
			'<listItem listIndent="0" listType="numbered">F</listItem>' +
			'<listItem listIndent="0" listType="numbered">G</listItem>' +
			'<paragraph></paragraph>' +
			'<listItem listIndent="0" listType="bulleted">H</listItem>' +
			'<listItem listIndent="0" listType="bulleted">I</listItem>' +
			'<paragraph></paragraph>' +
			'<listItem listIndent="0" listType="bulleted">J</listItem>' +
			'<listItem listIndent="0" listType="bulleted">k</listItem>' +
			'<paragraph></paragraph>' +
			'<listItem listIndent="0" listType="numbered">h1[]</listItem>';

		expectPaste( editor, manyOneItem, expectedModel );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<h1><span>1.</span><span>H1 1</span></h1>
	//		<h1><span>2.</span><span>H1 2</span></h1>
	//
	// which should result in the same output as pasting:
	//
	// 		<ol>
	// 			<li>H1 1</li>
	// 			<li>H1 2</li>
	// 		</ol>
	//
	// Since headings cannot be used inside lists, they should be transformed to a regular text.
	it( 'pastes list created from headings (h1)', () => {
		const expectedModel = '<listItem listIndent="0" listType="numbered">H1 1</listItem>' +
			'<listItem listIndent="0" listType="numbered">H1 2[]</listItem>';

		expectPaste( editor, heading1, expectedModel );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<h3><span>·</span><span>H<b>2 1</b></span></h3>
	//		<h3><span>·</span><span><i><u>H</u></i><u>2</u> 2</span></h3>
	//
	// which should result in the same output as pasting:
	//
	// 		<ul>
	// 			<li>H<b>2 1</b></li>
	// 			<li><i><u>H</u></i><u>2</u> 2</li>
	// 		</ul>
	//
	// Since headings cannot be used inside lists, they should be transformed to a regular text.
	it( 'pastes list created from styled headings (h3)', () => {
		const expectedModel = '<listItem listIndent="0" listType="bulleted">H<$text bold="true">2 1</$text></listItem>' +
			'<listItem listIndent="0" listType="bulleted"><$text italic="true" underline="true">H</$text>' +
			'<$text underline="true">2</$text> 2[]</listItem>';

		expectPaste( editor, heading3Styled, expectedModel );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>1.</span><span>H 7</span></p>
	//
	// which should result in the same output as pasting:
	//
	// 		<ol>
	// 			<li>H 7</li>
	// 		</ol>
	//
	// In Word `Heading 7` is represented as `<p class="MsoHeading7"...>`.
	it( 'pastes list created from styled headings (h3)', () => {
		const expectedModel = '<listItem listIndent="0" listType="numbered">H 7[]</listItem>';

		expectPaste( editor, heading7, expectedModel );
	} );
} );
