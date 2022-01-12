/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Clipboard from '../src/clipboard';
import ClipboardPipeline from '../src/clipboardpipeline';
import DragDrop from '../src/dragdrop';
import PastePlainText from '../src/pasteplaintext';

describe( 'Clipboard Feature', () => {
	it( 'requires ClipboardPipeline, DragDrop and PastePlainText', () => {
		expect( Clipboard.requires ).to.deep.equal( [ ClipboardPipeline, DragDrop, PastePlainText ] );
	} );

	it( 'has proper name', () => {
		expect( Clipboard.pluginName ).to.equal( 'Clipboard' );
	} );
} );
