/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import * as ballooneditorBase from '@ckeditor/ckeditor5-editor-balloon/ballooneditor';
import * as ballooneditorDLL from '../src/ballooneditor';
import * as classiceditorBase from '@ckeditor/ckeditor5-editor-classic/classiceditor';
import * as classiceditorDLL from '../src/classiceditor';
import * as clipboardBase from '@ckeditor/ckeditor5-clipboard/clipboard';
import * as clipboardDLL from '../src/clipboard';
import * as coreBase from '@ckeditor/ckeditor5-core/core';
import * as coreDLL from '../src/core';
import * as decouplededitorBase from '@ckeditor/ckeditor5-editor-decoupled/decouplededitor';
import * as decouplededitorDLL from '../src/decouplededitor';
import * as engineBase from '@ckeditor/ckeditor5-engine/engine';
import * as engineDLL from '../src/engine';
import * as enterBase from '@ckeditor/ckeditor5-enter/enter';
import * as enterDLL from '../src/enter';
import * as inlineeditorBase from '@ckeditor/ckeditor5-editor-inline/inlineeditor';
import * as inlineeditorDLL from '../src/inlineeditor';
import * as paragraphBase from '@ckeditor/ckeditor5-paragraph/paragraph';
import * as paragraphDLL from '../src/paragraph';
import * as selectallBase from '@ckeditor/ckeditor5-select-all/selectall';
import * as selectallDLL from '../src/selectall';
import * as typingBase from '@ckeditor/ckeditor5-typing/typing';
import * as typingDLL from '../src/typing';
import * as uiBase from '@ckeditor/ckeditor5-ui/ui';
import * as uiDLL from '../src/ui';
import * as undoBase from '@ckeditor/ckeditor5-undo/undo';
import * as undoDLL from '../src/undo';
import * as uploadBase from '@ckeditor/ckeditor5-upload/upload';
import * as uploadDLL from '../src/upload';
import * as utilsBase from '@ckeditor/ckeditor5-utils/utils';
import * as utilsDLL from '../src/utils';
import * as widgetBase from '@ckeditor/ckeditor5-widget/widget';
import * as widgetDLL from '../src/widget';

describe( 'CKEditor DLL', () => {
	testEqualExports( 'ballooneditor', ballooneditorBase, ballooneditorDLL );
	testEqualExports( 'classiceditor', classiceditorBase, classiceditorDLL );
	testEqualExports( 'clipboard', clipboardBase, clipboardDLL );
	testEqualExports( 'core', coreBase, coreDLL );
	testEqualExports( 'decouplededitor', decouplededitorBase, decouplededitorDLL );
	testEqualExports( 'engine', engineBase, engineDLL );
	testEqualExports( 'enter', enterBase, enterDLL );
	testEqualExports( 'inlineeditor', inlineeditorBase, inlineeditorDLL );
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
