/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeblockCaption from '../src/codeblockcaption';
import CodeblockCaptionUI from '../src/codeblockcaption/codeblockcaptionui';
import CodeblockCaptionEditing from '../src/codeblockcaption/codeblockcaptionediting';

describe( 'CodeblockCaption', () => {
	it( 'should require CodeblockCaptionUI and CodeblockCaptionEditing plugins', () => {
		expect( CodeblockCaption.requires ).to.have.members( [ CodeblockCaptionUI, CodeblockCaptionEditing ] );
	} );

	it( 'should define pluginName', () => {
		expect( CodeblockCaption.pluginName ).to.equal( 'CodeblockCaption' );
	} );
} );
