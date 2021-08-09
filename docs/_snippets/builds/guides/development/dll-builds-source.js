/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window */

/* config { "type": "DLL" } */

// Dll core.
import 'ckeditor5/build/ckeditor5-dll.js';

// The editor creator.
import '@ckeditor/ckeditor5-editor-classic/build/editor-classic';

// The editor features. The list contains features from the `@ckeditor/ckeditor5-build-classic` package.
import '@ckeditor/ckeditor5-essentials/build/essentials';
import '@ckeditor/ckeditor5-adapter-ckfinder/build/adapter-ckfinder';
import '@ckeditor/ckeditor5-autoformat/build/autoformat';
import '@ckeditor/ckeditor5-basic-styles/build/basic-styles';
import '@ckeditor/ckeditor5-block-quote/build/block-quote';
import '@ckeditor/ckeditor5-ckfinder/build/ckfinder';
import '@ckeditor/ckeditor5-easy-image/build/easy-image';
import '@ckeditor/ckeditor5-heading/build/heading';
import '@ckeditor/ckeditor5-image/build/image';
import '@ckeditor/ckeditor5-indent/build/indent';
import '@ckeditor/ckeditor5-link/build/link';
import '@ckeditor/ckeditor5-list/build/list';
import '@ckeditor/ckeditor5-media-embed/build/media-embed';
import '@ckeditor/ckeditor5-paste-from-office/build/paste-from-office';
import '@ckeditor/ckeditor5-table/build/table';
import '@ckeditor/ckeditor5-cloud-services/build/cloud-services';

// Translations:ES.
import 'ckeditor5/build/translations/es';
import '@ckeditor/ckeditor5-adapter-ckfinder/build/translations/es';
import '@ckeditor/ckeditor5-basic-styles/build/translations/es';
import '@ckeditor/ckeditor5-block-quote/build/translations/es';
import '@ckeditor/ckeditor5-ckfinder/build/translations/es';
import '@ckeditor/ckeditor5-heading/build/translations/es';
import '@ckeditor/ckeditor5-image/build/translations/es';
import '@ckeditor/ckeditor5-indent/build/translations/es';
import '@ckeditor/ckeditor5-link/build/translations/es';
import '@ckeditor/ckeditor5-list/build/translations/es';
import '@ckeditor/ckeditor5-media-embed/build/translations/es';
import '@ckeditor/ckeditor5-table/build/translations/es';

window.editors = {};
