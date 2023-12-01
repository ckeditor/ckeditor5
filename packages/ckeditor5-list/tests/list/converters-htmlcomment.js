/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListEditing from '../../src/list/listediting.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { setupTestHelpers } from './_utils/utils.js';
import stubUid from './_utils/uid.js';

describe( 'ListEditing - converters - preserve HTML comments', () => {
	let editor, test;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ListEditing, HtmlComment ]
		} );

		stubUid();
		test = setupTestHelpers( editor );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'flat lists', () => {
		it( 'preserves html comments', () => {
			test.data(
				'<ul>' +
					'<li>a</li>' +
					'<!--<li>b</li>-->' +
					'<li>c</li>' +
					'<!--<li>d</li>-->' +
				'</ul>' +
				'<p>c</p>',

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">c</paragraph>' +
				'<paragraph>c</paragraph>',

				'<ul>' +
					'<li>a</li>' +
					'<!--<li>b</li>-->' +
					'<li>c</li>' +
				'</ul>' +
				'<!--<li>d</li>-->' +
				'<p>c</p>'
			);
		} );
	} );
} );
