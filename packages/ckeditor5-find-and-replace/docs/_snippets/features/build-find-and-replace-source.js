/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Underline } from '@ckeditor/ckeditor5-basic-styles';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( FindAndReplace, Underline );

window.ClassicEditor = ClassicEditor;
