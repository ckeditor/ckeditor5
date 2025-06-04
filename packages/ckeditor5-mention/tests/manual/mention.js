/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Mention from '../../src/mention.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Font from '@ckeditor/ckeditor5-font/src/font.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

class InlineWidget extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowAttributes: [ 'type' ]
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, conversionApi ) => {
				const widgetElement = createPlaceholderView( modelItem, conversionApi );

				return toWidget( widgetElement, conversionApi.writer );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: createPlaceholderView
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'placeholder',
			model: ( viewElement, { writer } ) => {
				let type = 'general';

				if ( viewElement.childCount ) {
					const text = viewElement.getChild( 0 );

					if ( text.is( '$text' ) ) {
						type = text.data.slice( 1, -1 );
					}
				}

				return writer.createElement( 'placeholder', { type } );
			}
		} );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( editor.model, viewElement => viewElement.name == 'placeholder' )
		);

		this._createToolbarButton();

		function createPlaceholderView( modelItem, { writer } ) {
			const widgetElement = writer.createContainerElement( 'placeholder' );
			const viewText = writer.createText( '{' + modelItem.getAttribute( 'type' ) + '}' );

			writer.insert( writer.createPositionAt( widgetElement, 0 ), viewText );

			return widgetElement;
		}
	}

	_createToolbarButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'placeholder', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Insert placeholder' ),
				tooltip: true,
				withText: true
			} );

			this.listenTo( buttonView, 'execute', () => {
				const model = editor.model;

				model.change( writer => {
					const placeholder = writer.createElement( 'placeholder', { type: 'placeholder' } );

					model.insertContent( placeholder );

					writer.setSelection( placeholder, 'on' );
				} );
			} );

			return buttonView;
		} );
	}
}

class MentionCommandSwitcher extends Plugin {
	init() {
		const editor = this.editor;
		const mentionCommand = editor.commands.get( 'mention' );

		editor.ui.componentFactory.add( 'toggleMentionCommand', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Mentions',
				withText: true,
				isToggleable: true
			} );

			view.bind( 'isOn' ).to( mentionCommand, 'isEnabled' );

			this.listenTo( view, 'execute', () => {
				if ( mentionCommand.isEnabled ) {
					mentionCommand.forceDisabled( 'mentionCommandSwitcher' );
				} else {
					mentionCommand.clearForceDisabled( 'mentionCommandSwitcher' );
				}
			} );

			return view;
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Underline, Font, Mention, InlineWidget, MentionCommandSwitcher ],
		toolbar: [
			'heading',
			'|', 'bulletedList', 'numberedList', 'blockQuote',
			'|', 'bold', 'italic', 'underline', 'link',
			'|', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor',
			'|', 'insertTable', 'placeholder', 'toggleMentionCommand',
			'|', 'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney Stinson', '@Lily Aldrin', '@Marshall Eriksen', '@Robin Sherbatsky', '@Ted Mosby' ]
				},
				{
					marker: '#',
					feed: [
						'#a01', '#a02', '#a03', '#a04', '#a05', '#a06', '#a07', '#a08', '#a09', '#a10',
						'#a11', '#a12', '#a13', '#a14', '#a15', '#a16', '#a17', '#a18', '#a19', '#a20'
					]
				},
				{
					marker: ':',
					feed: [
						':+1:', ':-1:', ':@(at-sign):', ':$(dollar-sign):', ':#(hash-sign):'
					]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
