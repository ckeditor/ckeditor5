/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

window.ClassicEditor = ClassicEditor;
window.toWidget = toWidget;
window.toWidgetEditable = toWidgetEditable;
