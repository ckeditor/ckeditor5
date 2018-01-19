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

const fontFamilyIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.28 5L10 4.263V4h7v1h-6.72zm.38 1H17v1h-5.96l-.38-1zm.76 2H17v1h-5.199l-.38-1zm.761 2h4.82v1h-4.44l-.38-1zm1.615 6H8.89v-.59c.432-.027.79-.082 1.075-.165.285-.083.427-.186.427-.307a1.234 1.234 0 0 0-.066-.374l-.98-2.64H5.222c-.155.388-.28.725-.378 1.013-.096.288-.184.553-.261.797a5.681 5.681 0 0 0-.15.58c-.027.15-.041.272-.041.366 0 .222.174.393.523.515.349.122.741.194 1.179.216V16H1.66v-.59c.144-.01.324-.042.54-.095.215-.052.392-.123.53-.211.222-.15.394-.306.515-.47.122-.163.241-.388.357-.676a466.815 466.815 0 0 0 1.96-4.98c.713-1.843 1.35-3.484 1.909-4.923h.664l3.926 10.16c.083.216.177.39.282.523.105.133.252.263.44.39.127.078.293.143.498.195.205.053.376.082.515.088V16zm-4.748-4.814L7.263 6.62l-1.751 4.566h3.536z" fill="#333" fill-rule="evenodd"/></svg>';

const fontSizeIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M16.995 14h1.5l-2 2-2-2h1.5V6.2h-1.5l2-2 2 2h-1.5V14zM13.38 7.417h-.573c-.05-.2-.14-.436-.27-.71a6.38 6.38 0 0 0-.436-.776 3.888 3.888 0 0 0-.543-.668c-.197-.191-.386-.3-.569-.328a7.808 7.808 0 0 0-.647-.05c-.26-.01-.501-.016-.722-.016h-.482v9.421c0 .183.039.35.116.502.078.152.213.27.407.353.1.039.309.091.627.158.318.066.566.102.743.108V16H5.469v-.59c.155-.01.392-.033.71-.066.318-.033.538-.074.66-.124a.806.806 0 0 0 .402-.312c.086-.135.129-.316.129-.543V4.869h-.481c-.172 0-.385.004-.64.012a8.538 8.538 0 0 0-.73.054c-.183.022-.372.131-.569.328-.196.196-.377.42-.543.668a5.642 5.642 0 0 0-.44.793 4.81 4.81 0 0 0-.266.693H3.12V4.221h10.26v3.196z" fill="#333" fill-rule="evenodd"/></svg>';

const eraserIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M16.774 9.069a1 1 0 0 0 0-1.415l-3.23-3.23a1 1 0 0 0-1.414 0L4.903 11.65a1 1 0 0 0 0 1.414l2.805 2.805h2.266l6.8-6.8zm-6.386 7.8H3.933v-1h2.36L4.197 13.77a2 2 0 0 1 0-2.828l7.226-7.226a2 2 0 0 1 2.829 0l3.23 3.23a2 2 0 0 1 0 2.829l-7.093 7.093zm-8.455 0v-1h1v1h-1zM13.649 3.577l4.108 4.114a1 1 0 0 1 0 1.414l-4.302 4.302-5.522-5.529 4.302-4.302a1 1 0 0 1 1.414 0z" fill="#333" fill-rule="nonzero"/></svg>';

const markerIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M3.596 15.196l.707.707-.53.53-1.379-.035 1.202-1.202zm8.927-10.872l2.652 2.652L8.9 14.842 4.657 10.6l7.866-6.275z" class="ck-icon__fill" fill="red"/><path d="M8.542 15.906a2.15 2.15 0 0 0-2.82 0l-.004-.003-.708.707-.353-.354-.746.746-2.79-.039 2.122-2.12-.354-.354.6-.6.001-.001v-.001l.106-.106-.003-.003a2.15 2.15 0 0 0 0-2.821l.003-.004-.353-.354 10.26-8.274a1 1 0 0 1 1.335.071l2.265 2.265a1 1 0 0 1 .071 1.335L8.9 16.256l-.353-.353-.004.003zm-4.946-.71l-1.202 1.202 1.379.035.53-.53-.707-.707zm8.927-10.872l-7.866 6.275 4.242 4.243 6.276-7.866-2.652-2.652zm1.482-1.347l-.792.622L15.9 6.286l.622-.792-2.517-2.517zM5.03 18.998h13v-1h-12l-.464.463-.281.282z" fill="#333"/></g></svg>';

const penIcon = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M4.062 15.488l.708.707-.682.983-1.336.328.27-1.393 1.04-.625zM15.83 3.014l1.415 1.414L6.559 15.112l-1.414-1.414L15.829 3.014z" class="ck-icon__fill"/><path d="M13.88 3.549l-.758.017-4.557 4.262-.683-.73 4.836-4.523 2.795-.063.395.423.688-.688 1.414 1.414-.707.707a1 1 0 0 1 0 1.414L7.857 15.23l-.56.56c-.444.044-.88.225-1.24.54l-.004-.003-.725.725-.354-.354-.725.726-1.792.383.378-1.798.725-.725-.354-.353.616-.616.002-.002.108-.108-.004-.003c.315-.361.496-.797.541-1.241l.56-.56L13.88 3.55zm1.87.68l-.568-.568-9.475 9.475 1.414 1.415 9.475-9.476-.451-.451-.014.012-.38-.406zM3.914 15.638l-.726.725-.225.935.932-.228.726-.725-.707-.707zM6.05 19.01h13v-1h-12l-.464.464-.281.281z" fill="#333"/></g></svg>';
;


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
