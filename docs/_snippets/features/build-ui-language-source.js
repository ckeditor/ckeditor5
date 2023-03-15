/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

/* config { "additionalLanguages": [ "ar", "es" ] } */

import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( Superscript );

window.ClassicEditor = ClassicEditor;
