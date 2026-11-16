/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Plugin,
	Essentials,
	Autoformat,
	Paragraph,
	Heading,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	FontColor,
	FontBackgroundColor,
	Alignment,
	Link,
	AutoLink,
	List,
	TodoList,
	BlockQuote,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageResize,
	ImageInsert,
	AutoImage,
	PictureEditing,
	CloudServices,
	CKBox,
	CKBoxImageEdit,
	Table,
	TableToolbar,
	TableProperties,
	TableCellProperties,
	TableCaption,
	TableColumnResize,
	Mention,
	FindAndReplace
} from 'ckeditor5';
import { Comments, TrackChanges } from 'ckeditor5-premium-features';
import { TOKEN_URL } from '@snippets/index.js';

import './native-dialog.css';

// The users, the comment thread, and the suggestion that the initial data refers to.
const USERS = [
	{ id: 'user-1', name: 'Mex Haddox' },
	{ id: 'user-2', name: 'Zee Croce' }
];

const COMMENT_THREADS = [
	{
		threadId: 'thread-1',
		comments: [
			{
				commentId: 'comment-1',
				authorId: 'user-2',
				content: '<p>Can we confirm the venue before we send this out?</p>',
				createdAt: new Date( '2026-10-28T10:15:00' ),
				attributes: {}
			}
		],
		context: {
			type: 'text',
			value: 'Team offsite'
		},
		resolvedAt: null,
		resolvedBy: null,
		attributes: {}
	}
];

const SUGGESTIONS = [
	{
		id: 'suggestion-1',
		type: 'insertion',
		authorId: 'user-2',
		createdAt: new Date( '2026-10-28T10:20:00' ),
		data: null,
		attributes: {}
	}
];

// Loads the users, the comment thread, and the suggestion. The demo has no backend, so everything stays in the browser.
class CollaborationDataLoader extends Plugin {
	static get pluginName() {
		return 'CollaborationDataLoader';
	}

	static get requires() {
		// `Comments` brings `CommentsRepository` and `Users` along.
		return [ Comments, TrackChanges ];
	}

	init() {
		const usersPlugin = this.editor.plugins.get( 'Users' );
		const commentsRepositoryPlugin = this.editor.plugins.get( 'CommentsRepository' );
		const trackChangesPlugin = this.editor.plugins.get( 'TrackChanges' );

		for ( const user of USERS ) {
			usersPlugin.addUser( user );
		}

		usersPlugin.defineMe( 'user-1' );

		for ( const commentThread of COMMENT_THREADS ) {
			commentsRepositoryPlugin.addCommentThread( commentThread );
		}

		for ( const suggestion of SUGGESTIONS ) {
			trackChangesPlugin.addSuggestion( suggestion );
		}
	}
}

const openButton = document.querySelector( '#snippet-native-dialog-open' );
const dialogElement = document.querySelector( '#snippet-native-dialog' );

// The editor is created right away, inside the closed dialog, and kept between the openings of the dialog, so the
// changes and comments stay. The page header stays under the dialog backdrop, so unlike other snippets, this one
// does not offset the viewport.
const editorPromise = ClassicEditor
	.create( {
		attachTo: dialogElement.querySelector( '.native-dialog-demo__editor-source' ),
		root: {
			initialData: document.querySelector( '#snippet-native-dialog-data' ).innerHTML
		},
		plugins: [
			Essentials, Autoformat, Paragraph, Heading,
			Bold, Italic, Underline, Strikethrough, FontColor, FontBackgroundColor, Alignment,
			Link, AutoLink, List, TodoList, BlockQuote, HorizontalLine,
			Image, ImageCaption, ImageStyle, ImageToolbar, ImageResize, ImageInsert, AutoImage, PictureEditing,
			CloudServices, CKBox, CKBoxImageEdit,
			Table, TableToolbar, TableProperties, TableCellProperties, TableCaption, TableColumnResize,
			Mention, FindAndReplace,
			Comments, TrackChanges, CollaborationDataLoader
		],
		toolbar: [
			'undo', 'redo',
			'|', 'trackChanges', 'comment', 'commentsArchive',
			'|', 'heading',
			'|', 'bold', 'italic', 'underline', 'strikethrough', 'fontColor', 'fontBackgroundColor',
			'|', 'link', 'insertImage', 'insertTable', 'blockQuote', 'horizontalLine',
			'|', 'alignment', 'bulletedList', 'numberedList', 'todoList',
			'|', 'findAndReplace'
		],
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText',
				'|', 'toggleImageCaption', 'imageTextAlternative',
				'|', 'ckboxImageEdit',
				'|', 'comment'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'|', 'tableProperties', 'tableCellProperties', 'toggleTableCaption',
				'|', 'comment'
			]
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
				}
			]
		},
		comments: {
			editorConfig: {
				extraPlugins: [ Bold, Italic, List ]
			}
		},
		sidebar: {
			container: dialogElement.querySelector( '.native-dialog-demo__sidebar' )
		},
		ui: {
			overlayContainer: dialogElement.querySelector( '.native-dialog-demo__overlay' )
		}
	} )
	.then( editor => {
		editor.plugins.get( 'AnnotationsUIs' ).switchTo( 'narrowSidebar' );

		window.nativeDialogEditor = editor;

		return editor;
	} );

editorPromise.catch( err => {
	console.error( err.stack );
} );

// The open button is in the guide, above the snippet.
openButton.addEventListener( 'click', () => {
	dialogElement.showModal();

	editorPromise
		.then( editor => {
			editor.editing.view.focus();
		} )
		// The error is already logged above.
		.catch( () => {} );
} );
