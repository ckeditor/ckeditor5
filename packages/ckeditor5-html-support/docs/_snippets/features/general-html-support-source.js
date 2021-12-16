/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor.builtinPlugins.push(
	CloudServices,
	Code,
	EasyImage,
	ImageUpload,
	SourceEditing
);

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'sourceEditing',
			'|',
			'heading',
			'|',
			'bold',
			'italic',
			'code',
			'bulletedList',
			'numberedList',
			'|',
			'blockQuote',
			'link',
			'uploadImage',
			'mediaEmbed',
			'insertTable',
			'|',
			'undo',
			'redo'
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	}
};

window.ClassicEditor = ClassicEditor;
window.GeneralHtmlSupport = GeneralHtmlSupport;
window.HtmlComment = HtmlComment;
window.ArticlePluginSet = ArticlePluginSet;
