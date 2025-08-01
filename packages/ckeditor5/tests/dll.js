/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import * as clipboardBase from '@ckeditor/ckeditor5-clipboard';
import * as clipboardDLL from '../src/clipboard.js';
import * as coreBase from '@ckeditor/ckeditor5-core';
import * as coreDLL from '../src/core.js';
import * as engineBase from '@ckeditor/ckeditor5-engine';
import * as engineDLL from '../src/engine.js';
import * as enterBase from '@ckeditor/ckeditor5-enter';
import * as enterDLL from '../src/enter.js';
import * as paragraphBase from '@ckeditor/ckeditor5-paragraph';
import * as paragraphDLL from '../src/paragraph.js';
import * as selectallBase from '@ckeditor/ckeditor5-select-all';
import * as selectallDLL from '../src/select-all.js';
import * as typingBase from '@ckeditor/ckeditor5-typing';
import * as typingDLL from '../src/typing.js';
import * as uiBase from '@ckeditor/ckeditor5-ui';
import * as uiDLL from '../src/ui.js';
import * as undoBase from '@ckeditor/ckeditor5-undo';
import * as undoDLL from '../src/undo.js';
import * as uploadBase from '@ckeditor/ckeditor5-upload';
import * as uploadDLL from '../src/upload.js';
import * as utilsBase from '@ckeditor/ckeditor5-utils';
import * as utilsDLL from '../src/utils.js';
import * as widgetBase from '@ckeditor/ckeditor5-widget';
import * as widgetDLL from '../src/widget.js';

describe( 'CKEditor DLL', () => {
	testEqualExports( 'clipboard', clipboardBase, clipboardDLL );
	testEqualExports( 'core', coreBase, coreDLL );
	testEqualExports( 'engine', engineBase, engineDLL );
	testEqualExports( 'enter', enterBase, enterDLL );
	testEqualExports( 'paragraph', paragraphBase, paragraphDLL );
	testEqualExports( 'selectall', selectallBase, selectallDLL );
	testEqualExports( 'typing', typingBase, typingDLL );
	testEqualExports( 'ui', uiBase, uiDLL );
	testEqualExports( 'undo', undoBase, undoDLL );
	testEqualExports( 'upload', uploadBase, uploadDLL );
	testEqualExports( 'utils', utilsBase, utilsDLL );
	testEqualExports( 'widget', widgetBase, widgetDLL );

	function testEqualExports( testedLib, base, dll ) {
		it( 'should load everything from ' + testedLib, () => {
			for ( const exportName of Object.keys( base ) ) {
				expect( base[ exportName ], exportName ).to.equal( dll[ exportName ] );
			}
		} );
	}
} );
