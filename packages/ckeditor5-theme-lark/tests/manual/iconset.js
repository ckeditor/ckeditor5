/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import codeIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/code.svg';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import strikethroughIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg';
import underlineIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/underline.svg';
import unlinkIcon from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

class FakeIcons extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'code', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Code',
				icon: codeIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'insertImage', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'strikethrough', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Strikethrough',
				icon: strikethroughIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'underline', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Underline',
				icon: underlineIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'unlink', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Unlink',
				icon: unlinkIcon,
				tooltip: true
			} );

			return view;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, FakeIcons
		],
		toolbar: [
			'headings', 'bold', 'italic', 'strikethrough', 'underline', 'link', 'unlink', 'bulletedList', 'numberedList', 'blockquote',
			'code', 'undo', 'redo', 'imagestylefull', 'imagestyleside', 'imagetextalternative', 'insertImage'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
