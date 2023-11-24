/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';

import CKBoxImageEditEditing from '../../src/ckboximageedit/ckboximageeditediting';
import CKBoxImageEditCommand from '../../src/ckboximageedit/ckboximageeditcommand';

describe( 'CKBoxImageEditEditing', () => {
	let editor, domElement;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				ImageEditing,
				CKBoxImageEditEditing
			]
		} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( CKBoxImageEditEditing.pluginName ).to.equal( 'CKBoxImageEditEditing' );
	} );

	it( 'should register the "ckboxImageEdit" command', () => {
		const command = editor.commands.get( 'ckboxImageEdit' );

		expect( command ).to.be.instanceOf( CKBoxImageEditCommand );
	} );
} );
