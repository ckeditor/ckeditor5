/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { UploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Plugin } from '@ckeditor/ckeditor5-core';

class JSONData extends Plugin {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public init() {
		const editor: any = this.editor;

		// Override the data initialisation process - supports only direct JSON input.
		editor.data.init = ( allRootsData: any ) => {
			const parsedData = JSON.parse( allRootsData.trim() );

			editor.model.enqueueChange( 'transparent', ( writer: any ) => {
				const root = editor.model.document.getRoot( parsedData.root );

				append( writer, root, parsedData.children );
			} );
		};

		// Override stringify method used by `editor.getData()`.
		editor.data.stringify = ( modelElementOrFragment: any ) => {
			const data = {
				// Supports only stringification of a root element.
				root: modelElementOrFragment.toJSON(),
				children: Array.from( modelElementOrFragment.getChildren() ).map( ( child: any ) => child.toJSON() )
			};

			return JSON.stringify( data );
		};
	}
}

/**
 * Creates children from passed definitions.
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {module:engine/model/element~Element} parentElement
 * @param {Array.<Object>} childrenData
 */
function append( writer: any, parentElement: any, childrenData: any = [] ) {
	for ( const child of childrenData ) {
		if ( !child.name ) {
			writer.appendText( child.data, child.attributes, parentElement );
		} else {
			const childElement = writer.createElement( child.name, child.attributes );

			writer.append( childElement, parentElement );

			append( writer, childElement, child.children );
		}
	}
}

export default class ClassicEditor extends ClassicEditorBase {
	public static override builtinPlugins = [
		Essentials,
		UploadAdapter,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CKBox,
		CKFinder,
		CloudServices,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		PictureEditing,
		Table,
		TableToolbar,
		TextTransformation,
		JSONData
	];

	public static override defaultConfig = {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
