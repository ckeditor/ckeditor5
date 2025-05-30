/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import { Collection } from 'ckeditor5/src/utils.js';

import FindAndReplace from '../src/findandreplace.js';
import FindAndReplaceUI from '../src/findandreplaceui.js';
import FindAndReplaceEditing from '../src/findandreplaceediting.js';
import FindAndReplaceUtils from '../src/findandreplaceutils.js';

describe( 'FindAndReplace', () => {
	let editor, findAndReplaceUtils, model, editorElement, root;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );

		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace, FindAndReplaceUI, FindAndReplaceEditing ],
			toolbar: [ 'findAndReplace' ]
		} );

		model = editor.model;
		root = model.document.getRoot();
		findAndReplaceUtils = editor.plugins.get( 'FindAndReplaceUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FindAndReplaceUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FindAndReplaceUtils.isPremiumPlugin ).to.be.false;
	} );

	it( 'should not append duplicated search result in updateFindResultFromRange if already present in startResults', () => {
		editor.setData( 'Test Test Test' );

		const findCallback = findAndReplaceUtils.findByTextCallback( 'Test', {} );
		const results = new Collection();

		findAndReplaceUtils.updateFindResultFromRange(
			model.createRangeIn( root ),
			model,
			findCallback,
			results
		);

		expect( results.length ).to.equal( 3 );

		findAndReplaceUtils.updateFindResultFromRange(
			model.createRangeIn( root ),
			model,
			findCallback,
			results
		);

		expect( results.length ).to.equal( 3 );
	} );

	afterEach( async () => {
		await editor.destroy();

		editorElement.remove();
	} );
} );
