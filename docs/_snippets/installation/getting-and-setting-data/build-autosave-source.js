/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Autosave } from '@ckeditor/ckeditor5-autosave';
import ClassicEditor from '../../build-classic';

ClassicEditor.builtinPlugins.push( Autosave );

window.ClassicEditor = ClassicEditor;
