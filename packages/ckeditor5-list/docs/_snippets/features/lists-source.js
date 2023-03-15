/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { ImageResize } from '@ckeditor/ckeditor5-image';
import { ListProperties, DocumentList, DocumentListProperties } from '@ckeditor/ckeditor5-list';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

window.ClassicEditor = ClassicEditor;
window.ListProperties = ListProperties;
window.DocumentList = DocumentList;
window.DocumentListProperties = DocumentListProperties;
window.ImageResize = ImageResize;
