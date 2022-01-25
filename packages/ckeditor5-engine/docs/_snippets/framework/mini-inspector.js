/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/src/ckeditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
// TODO: import from @ckeditor/ckeditor5-inspector once this PR is merged: https://github.com/ckeditor/ckeditor5-inspector/pull/142/files
import MiniCKEditorInspector from '../../framework/guides/mini-inspector/miniinspector.js';

window.DecoupledEditor = DecoupledEditor;
window.Essentials = Essentials;
window.MiniCKEditorInspector = MiniCKEditorInspector;
