/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Clipboard from '../src/clipboard';
import ClipboardPipeline from '../src/clipboardpipeline';
import DragDropExperimental from '../src/dragdropexperimental';
import PastePlainText from '../src/pasteplaintext';

describe( 'Clipboard Feature', () => {
	it( 'requires ClipboardPipeline, DragDrop and PastePlainText', () => {
		expect( Clipboard.requires ).to.deep.equal( [ ClipboardPipeline, DragDropExperimental, PastePlainText ] );
	} );

	it( 'has proper name', () => {
		expect( Clipboard.pluginName ).to.equal( 'Clipboard' );
	} );
} );
