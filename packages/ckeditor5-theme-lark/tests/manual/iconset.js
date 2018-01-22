/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import alignLeftIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-left.svg';
import alignCenterIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-center.svg';
import alignRightIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-right.svg';
import alignJustifyIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-justify.svg';
import codeIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/code.svg';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import imageLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import imageCenterIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import editIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import strikethroughIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg';
import underlineIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/underline.svg';
import unlinkIcon from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

import fontFamilyIcon from '@ckeditor/ckeditor5-font/theme/icons/font-family.svg';
import fontSizeIcon from '@ckeditor/ckeditor5-font/theme/icons/font-size.svg';

import markerIcon from '@ckeditor/ckeditor5-highlight/theme/icons/marker.svg';
import penIcon from '@ckeditor/ckeditor5-highlight/theme/icons/pen.svg';
import eraserIcon from '@ckeditor/ckeditor5-highlight/theme/icons/eraser.svg';

class FakeIcons extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'alignLeft', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Align left',
				icon: alignLeftIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'alignCenter', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Align center',
				icon: alignCenterIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'alignRight', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Align right',
				icon: alignRightIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'alignJustify', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Align justify',
				icon: alignJustifyIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'code', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Code',
				icon: codeIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'edit', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Edit link',
				icon: editIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'eraser', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Erase highlight',
				icon: eraserIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'fontFamily', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Font family',
				icon: fontFamilyIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'fontSize', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Font size',
				icon: fontSizeIcon,
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

		editor.ui.componentFactory.add( 'imageLeft', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Left-sided image',
				icon: imageLeftIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'imageCenter', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Centered image',
				icon: imageCenterIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'marker', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Marker',
				icon: markerIcon,
				tooltip: true
			} );

			return view;
		} );

		editor.ui.componentFactory.add( 'pen', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Pen',
				icon: penIcon,
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

		editor.ui.componentFactory.add( 'marker', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Maker',
				icon: markerIcon,
				tooltip: true
			} );

			view.render();
			view.element.querySelector( '.ck-icon__fill' ).style.color = 'yellow';

			return view;
		} );

		editor.ui.componentFactory.add( 'pen', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Pen',
				icon: penIcon,
				tooltip: true
			} );

			view.render();
			view.element.querySelector( '.ck-icon__fill' ).style.color = 'yellow';

			return view;
		} );

		editor.ui.componentFactory.add( 'eraser', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Eraser',
				icon: eraserIcon,
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
			'headings', 'bold', 'italic', 'strikethrough', 'underline', 'link', 'unlink', 'edit', 'bulletedList', 'numberedList',
			'blockquote', 'code', 'undo', 'redo', 'imagestylefull', 'imagestyleside', 'imageLeft', 'imageCenter', 'imagetextalternative',
			'insertImage', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'fontFamily', 'fontSize', 'marker', 'pen', 'eraser'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
