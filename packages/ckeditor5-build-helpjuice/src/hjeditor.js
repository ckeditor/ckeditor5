/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import AutoSave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
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
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import Style from '@ckeditor/ckeditor5-style/src/style';

// Custom Plugins
import Accordion from './plugins/accordion/accordion';
import Tab from './plugins/tab/tab';
import CalloutBlocks from './plugins/calloutblocks/calloutblocks';
import InternalBlock from './plugins/internalblock/internalblock';
import DecisionTree from './plugins/decisiontree/decisiontree';
import InsertArticle from './plugins/insertarticle/insertarticle';
import FilesManager from './plugins/filesmanager/filesmanager';
import Mention from './plugins/mention/src/mention';
import Comments from './plugins/comments/comments';
import Glossary from './plugins/glossary/glossary';

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
	ImageInsert,
	Indent,
	Link,
	List,
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
	SimpleUploadAdapter,
	InsertArticle,
	FilesManager,
	Mention,
	MentionCustomization,
	Style,
	Comments,
	Glossary
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
	simpleUpload: {
		// The URL that the images are uploaded to.
		uploadUrl: '/uploads'
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
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'imageStyle:alignLeft',
			'imageStyle:alignRight',
			'|',
			{
				name: 'resizeImage',
				items: [
					'resizeImage:original',
					'resizeImage:25',
					'resizeImage:50',
					'resizeImage:75',
				],
				defaultItem: 'resizeImage:original'
			},
			'|',
			'linkImage',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en',
	mediaEmbed: {
		previewsInData: true,
		extraProviders: [
			{
				name: 'helpjuiceProvider',
				url: /^static.helpjuice\.com\/(\w+)/,
				html: match => {
					const getUrl = match.input;

					return (
						`<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 62.5%;">
							<iframe src="https://${getUrl}"
								style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"
								frameborder="0" allowtransparency="true" allow="encrypted-media">
							</iframe>
						</div>`
					);
				}
			},
			{
				name: 'localProvider',
				url: /uploads\/upload\/(\w+)/,
				html: match => {
					const getUrl = match.input;

					return (
						`<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 62.5%;">
							<iframe src="http://example.localtest.me:3000/${getUrl}"
								style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"
								frameborder="0" allowtransparency="true" allow="encrypted-media">
							</iframe>
						</div>`
					);
				}
			},
		]
	},
	link: {
		addTargetToExternalLinks: true,
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
				attributes: {
					class: 'link-button'
				}
			}
		}
	},
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml: html => ( { html, hasChange: false } )
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
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
			'undo',
			'redo',
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
			'highlight',
			'|',
			'bulletedList',
			'numberedList',
			'todoList',
			'outdent',
			'indent',
			'removeFormat',
			'alignment',
			'blockQuote',
			'link',
			'|',
			'horizontalLine',
			'htmlembed',
			'codeblock',
			'filesmanager',
			'imageInsert',
			'mediaEmbed',
			'insertTable',
			'|',
			'insertarticle',
			'accordion',
			'tab',
			'calloutblocksdropdown',
			'internalblock',
			'decisiontree',
			'glossary',
			'|',
			'findAndReplace',
			'sourceEditing'
		],
		shouldNotGroupWhenFull: true
	},
};
