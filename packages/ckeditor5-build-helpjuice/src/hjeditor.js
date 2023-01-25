/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { icons } from 'ckeditor5/src/core';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import AutoSave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Image from './plugins/image/src/image';
import ImageCaption from './plugins/image/src/imagecaption';
import ImageStyle from './plugins/image/src/imagestyle';
import ImageResize from './plugins/image/src/imageresize';
import ImageToolbar from './plugins/image/src/imagetoolbar';
import ImageUpload from './plugins/image/src/imageupload';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Style from '@ckeditor/ckeditor5-style/src/style';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

// Custom Plugins
import Heading from './plugins/heading/src/heading';
import Accordion from './plugins/accordion/accordion';
import Tab from './plugins/tab/tab';
import CalloutBlocks from './plugins/calloutblocks/calloutblocks';
import ExtraFormatting from './plugins/extraformatting/extraformatting';
import InternalBlock from './plugins/internalblock/internalblock';
import DecisionTree from './plugins/decisiontree/decisiontree';
import InsertArticle from './plugins/insertarticle/insertarticle';
import FilesManager from './plugins/filesmanager/filesmanager';
import Mention from './plugins/mention/src/mention';
import Comments from './plugins/comments/comments';
import Glossary from './plugins/glossary/glossary';
import CmdDelete from './plugins/cmddelete/cmddelete';
import FontFamily from './plugins/font/src/fontfamily';
import FontSize from './plugins/font/src/fontsize';
import FontColor from './plugins/font/src/fontcolor';
import FontBackgroundColor from './plugins/font/src/fontbackgroundcolor';

const { objectInline, objectLeft, objectRight, objectCenter } = icons;

const VIDEO_EXTENSIONS_REGEX = 'mpg|mp4|wmv|mpeg|webm|mkv|flv|vob|ogv|ogg|avi|rm|rmvb|asf|amv|mp2|mpe|mpv|m4v|svi|3gp|mov'

export default class HelpjuiceEditor extends ClassicEditorBase { }

// Plugins to include in the build.
HelpjuiceEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Alignment,
	Autoformat,
	AutoSave,
	Bold,
	Underline,
	Italic,
	FontFamily,
	FontSize,
	FontColor,
	FontBackgroundColor,
	GeneralHtmlSupport,
	Highlight,
	BlockQuote,
	HorizontalLine,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageResize,
	ImageToolbar,
	LinkImage,
	ImageUpload,
	Indent,
	IndentBlock,
	Link,
	List,
	ListProperties,
	TodoList,
	FindAndReplace,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableCaption,
	TableToolbar,
	TableProperties,
	TableCellProperties,
	TableColumnResize,
	TextTransformation,
	CodeBlock,
	HtmlEmbed,
	RemoveFormat,
	SourceEditing,
	Accordion,
	Tab,
	CalloutBlocks,
	InternalBlock,
	DecisionTree,
	InsertArticle,
	FilesManager,
	Mention,
	MentionCustomization,
	Style,
	Comments,
	Glossary,
	ExtraFormatting,
	Strikethrough,
	Subscript,
	Superscript,
	CmdDelete
];

function MentionCustomization(editor) {
    // The upcast converter will convert <a class="mention" href="" data-user-id="">
    // elements to the model 'mention' attribute.
    editor.conversion.for('upcast').elementToAttribute( {
        view: {
            name: 'a',
            key: 'data-mention',
            classes: 'mention',
            attributes: {
                href: true,
                'data-helpjuice-id': true
            }
        },
        model: {
            key: 'mention',
            value: viewItem => {
                // The mention feature expects that the mention attribute value
                // in the model is a plain object with a set of additional attributes.
                // In order to create a proper object, use the toMentionAttribute helper method:
                const mentionAttribute = editor.plugins.get('Mention').toMentionAttribute(viewItem, {
                    // Add any other properties that you need.
                    codename: viewItem.getAttribute('href'),
                    userId: viewItem.getAttribute('data-helpjuice-id')
                } );

                return mentionAttribute;
            }
        },
        converterPriority: 'high'
    });

    // Downcast the model 'mention' text attribute to a view <a> element.
    editor.conversion.for('downcast').attributeToElement( {
        model: 'mention',
        view: (modelAttributeValue, { writer }) => {
            // Do not convert empty attributes (lack of value means no mention).
            if (!modelAttributeValue) {
                return;
            }

            return writer.createAttributeElement('a', {
                class: 'mention',
                'data-mention': modelAttributeValue.id,
                'data-helpjuice-id': modelAttributeValue.id,
                'href': modelAttributeValue.codename
            }, {
                // Make mention attribute to be wrapped by other attribute elements.
                priority: 20,
                // Prevent merging mentions together.
                id: modelAttributeValue.uid
            });
        },
        converterPriority: 'high'
    } );
}

const colorPalette = [
	{color: 'hsl(6, 78%, 74%)', label:' '}, {color: 'hsl(6, 78%, 66%)', label:' '}, {color: 'hsl(6, 78%, 57%)', label:' '}, {color: 'hsl(6, 59%, 50%)', label:' '}, {color: 'hsl(6, 59%, 43%)', label:' '}, {color: 'hsl(6, 59%, 37%)', label:' '}, {color: 'hsl(6, 59%, 30%)', label:' '}, {color: 'hsl(282, 39%, 68%)', label:' '}, {color: 'hsl(282, 39%, 58%)', label:' '}, {color: 'hsl(282, 44%, 47%)', label:' '}, {color: 'hsl(282, 44%, 42%)', label:' '}, {color: 'hsl(282, 44%, 36%)', label:' '}, {color: 'hsl(282, 44%, 30%)', label:' '}, {color: 'hsl(282, 44%, 25%)', label:' '}, {color: 'hsl(204, 70%, 72%)', label:' '}, {color: 'hsl(204, 70%, 63%)', label:' '}, {color: 'hsl(204, 70%, 53%)', label:' '}, {color: 'hsl(204, 62%, 47%)', label:' '}, {color: 'hsl(204, 62%, 40%)', label:' '}, {color: 'hsl(204, 62%, 34%)', label:' '}, {color: 'hsl(204, 62%, 28%)', label:' '}, {color: 'hsl(145, 61%, 69%)', label:' '}, {color: 'hsl(145, 61%, 59%)', label:' '}, {color: 'hsl(145, 63%, 49%)', label:' '}, {color: 'hsl(145, 63%, 43%)', label:' '}, {color: 'hsl(145, 63%, 37%)', label:' '}, {color: 'hsl(145, 63%, 31%)', label:' '}, {color: 'hsl(145, 63%, 25%)', label:' '}, {color: 'hsl(48, 89%, 70%)', label:' '}, {color: 'hsl(48, 89%, 60%)', label:' '}, {color: 'hsl(48, 89%, 50%)', label:' '}, {color: 'hsl(48, 88%, 44%)', label:' '}, {color: 'hsl(48, 88%, 38%)', label:' '}, {color: 'hsl(48, 88%, 32%)', label:' '}, {color: 'hsl(48, 88%, 26%)', label:' '}, {color: 'hsl(24, 71%, 65%)', label:' '}, {color: 'hsl(24, 71%, 53%)', label:' '}, {color: 'hsl(24, 100%, 41%)', label:' '}, {color: 'hsl(24, 100%, 36%)', label:' '}, {color: 'hsl(24, 100%, 31%)', label:' '}, {color: 'hsl(24, 100%, 26%)', label:' '}, {color: 'hsl(24, 100%, 22%)', label:' '}, {color: 'hsl(210, 12%, 86%)', label:' '}, {color: 'hsl(210, 12%, 71%)', label:' '}, {color: 'hsl(210, 12%, 57%)', label:' '}, {color: 'hsl(210, 15%, 43%)', label:' '}, {color: 'hsl(210, 29%, 18%)', label:' '}, {color: 'hsl(210, 29%, 16%)', label:' '}, {color: 'hsl(210, 29%, 13%)', label:' '}
]

// Editor configuration.
HelpjuiceEditor.defaultConfig = {
	placeholder: "Type Your Content Here!",
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
		]
	},
	fontFamily: {
		options: [
			'Arial, Helvetica, sans-serif',
			'Courier New, Courier, monospace',
			'Georgia, serif',
			'Lucida Sans Unicode, Lucida Grande, sans-serif',
			'Tahoma, Geneva, sans-serif',
			'Times New Roman, Times, serif',
			'Trebuchet MS, Helvetica, sans-serif',
			'Verdana, Geneva, sans-serif',
			'Open Sans, sans-serif'
		]
	},
	fontSize: {
		options: [
			12,
			14,
			16,
			18,
			20,
			24,
			30,
			36,
			48,
			60,
			72,
			92
		]
	},
	fontColor: {
		colors: colorPalette,
		columns: 7
	},
	fontBackgroundColor: {
		colors: colorPalette,
		columns: 7
	},
	table: {
		contentToolbar: [
			'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
		],

		// Configuration of the TableProperties plugin.
		tableProperties: {
			// ...
		},

		// Configuration of the TableCellProperties plugin.
		tableCellProperties: {
			// ...
		}
	},
	image: {
		resizeUnit: 'px',
		styles: {
			options: [
				{
					name: 'inline',
					title: 'In line',
					icon: objectInline,
					modelElements: [ 'imageInline' ],
					isDefault: true
				},
				{
					name: 'block',
					title: 'Centered image',
					icon: objectCenter,
					modelElements: [ 'imageBlock' ],
					isDefault: true
				},
				{
					name: 'side',
					title: 'Side image',
					icon: objectRight,
					modelElements: [ 'imageBlock' ],
					className: 'image-style-side'
				},
				{
					name: 'alignLeft',
					title: 'Left aligned image',
					icon: objectLeft,
					modelElements: [ 'imageBlock', 'imageInline' ],
					className: 'image-style-align-left'
				},
				{
					name: 'alignRight',
					title: 'Right aligned image',
					icon: objectRight,
					modelElements: [ 'imageBlock', 'imageInline' ],
					className: 'image-style-align-right'
				}
			]
		},
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'imageStyle:alignLeft',
			'imageStyle:alignRight',
			'|',
			'linkImage',
			'toggleImageCaption',
			'imageTextAlternative',
		],
		upload: {
			types: [ 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg+xml', 'x-icon' ]
		}
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en',
	mediaEmbed: {
		previewsInData: true,
		extraProviders: [
			{
				name: 'helpjuiceProvider',
				url: new RegExp(`^static.helpjuice\\.com\\/(\\w+)\\.(${VIDEO_EXTENSIONS_REGEX})`),
				html: match => {
					const getUrl = match.input;

					return (
						`<video controls="" style="max-width: 100%" src="https://${getUrl}">Your browser does not support HTML5 video.</video>`
					);
				}
			},
			{
				name: 'localProvider',
				url: new RegExp(`.*uploads\\/upload\\/(\\w+)\\.(${VIDEO_EXTENSIONS_REGEX})`),
				html: match => {
					const getUrl = match.input;

					return (
						`<video controls="" style="max-width: 100%" src="${getUrl}">Your browser does not support HTML5 video.</video>`
					);
				}
			},
			{
				name: 'externalProvider',
				url: new RegExp(`.*\\.(${VIDEO_EXTENSIONS_REGEX})`, 'i'),
				html: match => {
					const getUrl = match.input;

					return (
						`<video controls="" style="max-width: 100%" src="${getUrl}">Your browser does not support HTML5 video.</video>`
					);
				}
			}
		]
	},
	indentBlock: {
		offset: 1,
		unit: 'em'
	},
	htmlSupport: {
		allow: [
			{
				name: /^(video|iframe)$/,
				attributes: {
					src: true,
					width: true,
					height: true,
					title: true,
					frameborder: true,
					allow: true,
					allowfullscreen: true,
					autoplay: true,
					autopictureinpicture: true,
					controls: true,
					controlslist: true,
					crossorigin: true,
					disablepictureinpicture: true,
					disableremoteplayback: true,
					loop: true,
					muted: true,
					playsinline: true,
					poster: true,
					preload: true,
					name: true,
					type: true,
					align: true
				}
			},
			{
				name: /.*/,
				classes: true,
				styles: true,
				attributes: true
			}
		],
		disallow: [ /* HTML features to disallow */ ]
	},
	link: {
		decorators: {
			toggleDownloadable: {
				mode: 'manual',
				label: 'Downloadable',
				attributes: {
					download: 'file'
				}
			},
			openInNewTab: {
				mode: 'manual',
				label: 'Open In a New Tab',
				defaultValue: false,
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			},
			buttonLink: {
				mode: 'manual',
				label: 'Style as Button',
				defaultValue: false,
				classes: 'link-button'
			}
		}
	},
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml: html => ( { html, hasChange: false } )
	},
	style: {
		definitions: [
			{
				name: "Disable Text Selecting",
				element: "span",
				classes: ["hj-unselectable"]
			},
			{
				name: "Bordered",
				element: "span",
				classes: ["fr-text-bordered"]
			},
			{
				name: "Spaced",
				element: "span",
				classes: ["fr-text-spaced"]
			},
			{
				name: "Uppercase",
				element: "span",
				classes: ["fr-text-uppercase"]
			}
		]
	},
	toolbar: {
		items: [
			'heading',
			'fontFamily',
			'fontSize',
			'style',
			'|',
			'bold',
			'underline',
			'italic',
			'fontColor',
			'fontBackgroundColor',
			'extraformattingdropdown',
			'highlight',
			'htmlembed',
			'codeblock',
			'|',
			'filesmanager',
			'link',
			'mediaEmbed',
			'insertTable',
			'|',
			'alignment',
			'horizontalLine',
			'blockQuote',
			'|',
			'bulletedList',
			'numberedList',
			'todoList',
			'indent',
			'outdent',
			'|',
			'insertarticle',
			'tab',
			'accordion',
			'calloutblocksdropdown',
			'internalblock',
			'glossary',
			'decisiontree',
			'|',
			'redo',
			'undo',
			'removeFormat',
			'sourceEditing',
			'findAndReplace'
		],
		shouldNotGroupWhenFull: true
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	},
	codeBlock: {
		languages: [
			{ language: 'plaintext', label: 'Plain text', class: 'language-plain' }, // The default language.
			{ language: 'c', label: 'C', class: 'language-c' },
			{ language: 'coffeescript', label: 'Coffeescript', class: 'language-coffeescript' },
			{ language: 'cs', label: 'C#', class: 'language-cs' },
			{ language: 'cpp', label: 'C++', class: 'language-cpp' },
			{ language: 'css', label: 'CSS', class: 'language-css' },
			{ language: 'diff', label: 'Diff', class: 'language-diff' },
			{ language: 'go', label: 'Go', class: 'language-go' },
			{ language: 'html', label: 'HTML', class: 'language-html' },
			{ language: 'java', label: 'Java', class: 'language-java' },
			{ language: 'javascript', label: 'JavaScript', class: 'language-javascript' },
			{ language: 'json', label: 'JSON', class: 'language-json' },
			{ language: 'lua', label: 'LUA', class: 'language-lua' },
			{ language: 'markdown', label: 'Markdown', class: 'language-markdown' },
			{ language: 'php', label: 'PHP', class: 'language-php' },
			{ language: 'python', label: 'Python', class: 'language-python' },
			{ language: 'ruby', label: 'Ruby', class: 'language-ruby' },
			{ language: 'sql', label: 'SQL', class: 'language-sql' },
			{ language: 'typescript', label: 'TypeScript', class: 'language-typescript' },
			{ language: 'xml', label: 'XML', class: 'language-xml' }
		]
	}
};
