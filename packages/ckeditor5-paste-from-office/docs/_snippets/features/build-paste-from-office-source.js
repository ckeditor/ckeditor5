/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

ClassicEditor.builtinPlugins.push( Alignment );
ClassicEditor.builtinPlugins.push( PasteFromOffice );

window.ClassicEditor = ClassicEditor;
