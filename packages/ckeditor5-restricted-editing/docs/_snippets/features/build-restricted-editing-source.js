/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';
import StandardEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '@ckeditor/ckeditor5-table/src/table';

ClassicEditor.builtinPlugins.push(
	RestrictedEditingMode, StandardEditingMode, ArticlePluginSet, Table );

window.ClassicEditor = ClassicEditor;
