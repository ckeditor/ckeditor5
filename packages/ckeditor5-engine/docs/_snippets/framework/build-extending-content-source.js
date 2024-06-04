/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code } from '@ckeditor/ckeditor5-basic-styles';
import { Font } from '@ckeditor/ckeditor5-font';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push( Code );
ClassicEditor.builtinPlugins.push( Font );

window.ClassicEditor = ClassicEditor;
