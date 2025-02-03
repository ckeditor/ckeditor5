/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';

import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import EmptyBlock from '@ckeditor/ckeditor5-html-support/src/emptyblock.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { setupTestHelpers } from '../_utils/utils.js';
import stubUid from '../_utils/uid.js';

describe( 'ListEditing - EmptyBlock integration', () => {
	let editor, view, test;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ListEditing, HeadingEditing, EmptyBlock ]
		} );

		view = editor.editing.view;

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();

		test = setupTestHelpers( editor );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'inside a plain li element', () => {
		test.data(
			'<ul>' +
				'<li>x</li>' +
				'<li>&nbsp;</li>' +
				'<li></li>' +
			'</ul>',

			'<paragraph listIndent="0" listItemId="a00" listType="bulleted">x</paragraph>' +
			'<paragraph listIndent="0" listItemId="a01" listType="bulleted"></paragraph>' +
			'<paragraph htmlEmptyBlock="true" listIndent="0" listItemId="a02" listType="bulleted"></paragraph>'
		);
	} );

	it( 'inside a paragraph in a li element', () => {
		test.data(
			'<ul>' +
				'<li><p>x</p></li>' +
				'<li><p>&nbsp;</p></li>' +
				'<li><p></p></li>' +
			'</ul>',

			'<paragraph listIndent="0" listItemId="a00" listType="bulleted">x</paragraph>' +
			'<paragraph listIndent="0" listItemId="a01" listType="bulleted"></paragraph>' +
			'<paragraph htmlEmptyBlock="true" listIndent="0" listItemId="a02" listType="bulleted"></paragraph>',

			'<ul>' +
				'<li>x</li>' +
				'<li>&nbsp;</li>' +
				'<li></li>' +
			'</ul>'
		);
	} );

	it( 'inside a heading in a li element', () => {
		test.data(
			'<ul>' +
				'<li><h2>x</h2></li>' +
				'<li><h2>&nbsp;</h2></li>' +
				'<li><h2></h2></li>' +
			'</ul>',

			'<heading1 listIndent="0" listItemId="a00" listType="bulleted">x</heading1>' +
			'<heading1 listIndent="0" listItemId="a01" listType="bulleted"></heading1>' +
			'<heading1 htmlEmptyBlock="true" listIndent="0" listItemId="a02" listType="bulleted"></heading1>',

			'<ul>' +
				'<li><h2>x</h2></li>' +
				'<li><h2>&nbsp;</h2></li>' +
				'<li><h2></h2></li>' +
			'</ul>'
		);
	} );
} );
