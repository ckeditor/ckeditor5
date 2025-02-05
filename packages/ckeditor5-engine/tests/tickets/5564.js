/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';

import { getData as getModelData, setData as setModelData } from '../../src/dev-utils/model.js';

describe( 'Bug ckeditor5#5564', () => {
	let editor;

	beforeEach( () => {
		return VirtualTestEditor
			.create( { plugins: [ Paragraph, ShiftEnter ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'does not create an excessive new line when loading <p>x</p><p><br></p><p>x</p>', () => {
		editor.setData( '<p>x</p><p><br></p><p>x</p>' );

		expect( getModelData( editor.model ) ).to.equal(
			'<paragraph>[]x</paragraph><paragraph></paragraph><paragraph>x</paragraph>'
		);
	} );

	it( 'preserves a soft break in an empty paragraph', () => {
		setModelData( editor.model, '<paragraph>x</paragraph><paragraph><softBreak /></paragraph><paragraph>x</paragraph>' );

		const expectedData = '<p>x</p><p><br>&nbsp;</p><p>x</p>';
		const actualData = editor.getData();

		expect( actualData ).to.equal( expectedData );

		// Loading this data into the editor will actually create an excessive space as &nbsp; here isn't recognized as a filler.
		// It's a known issue.
		editor.setData( actualData );

		expect( editor.getData() ).to.equal( expectedData );
	} );
} );
