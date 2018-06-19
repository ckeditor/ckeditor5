/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AlignmentPlugin from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontsizePlugin from '@ckeditor/ckeditor5-font/src/fontsize';
import FontfamilyPlugin from '@ckeditor/ckeditor5-font/src/fontfamily';
import HighlightPlugin from '@ckeditor/ckeditor5-highlight/src/highlight';
import UploadadapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import StrikethroughPlugin from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import UnderlinePlugin from '@ckeditor/ckeditor5-basic-styles/src/underline';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyimagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageuploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TablePlugin from '@ckeditor/ckeditor5-table/src/table';
import TabletoolbarPlugin from '@ckeditor/ckeditor5-table/src/tabletoolbar';

export default class DecoupledEditor extends DecoupledEditorBase {}

DecoupledEditor.build = {
	plugins: [
		EssentialsPlugin,
		AlignmentPlugin,
		FontsizePlugin,
		FontfamilyPlugin,
		HighlightPlugin,
		UploadadapterPlugin,
		AutoformatPlugin,
		BoldPlugin,
		ItalicPlugin,
		StrikethroughPlugin,
		UnderlinePlugin,
		BlockquotePlugin,
		EasyimagePlugin,
		HeadingPlugin,
		ImagePlugin,
		ImagecaptionPlugin,
		ImagestylePlugin,
		ImagetoolbarPlugin,
		ImageuploadPlugin,
		LinkPlugin,
		ListPlugin,
		ParagraphPlugin,
		TablePlugin,
		TabletoolbarPlugin
	],
	config: {
		toolbar: {
			items: [
				'heading',
				'|',
				'fontsize',
				'fontfamily',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'highlight',
				'|',
				'alignment',
				'|',
				'numberedList',
				'bulletedList',
				'|',
				'link',
				'blockquote',
				'imageUpload',
				'insertTable',
				'|',
				'undo',
				'redo'
			]
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			toolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		language: 'en'
	}
};
