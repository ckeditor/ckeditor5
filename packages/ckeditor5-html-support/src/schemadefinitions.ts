/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { DataSchemaBlockElementDefinition, DataSchemaInlineElementDefinition } from './dataschema';

/**
 * @module html-support/schemadefinitions
 */

// Skipped elements due to HTML deprecation:
// * noframes (not sure if we should provide support for this element. CKE4 is not supporting frameset and frame,
//   but it will unpack <frameset><noframes>foobar</noframes></frameset> to <noframes>foobar</noframes>, so there
//   may be some content loss. Although using noframes as a standalone element seems invalid)
// * keygen (this one is also empty)
// * applet (support is limited mostly to old IE)
// * basefont (this one is also empty)
// * isindex (basically no support for modern browsers at all)
//
// Skipped elements due to lack empty element support:
// * hr
// * area
// * br
// * command
// * map
// * wbr
// * colgroup -> col
//
// Skipped elements due to complexity:
// * datalist with option elements used as a data source for input[list] element
//
// Skipped elements as they are handled as an object content:
// * track
// * source
// * option
// * param
// * optgroup
//
// Skipped full page HTML elements:
// * body
// * html
// * title
// * head
// * meta
// * link
// * etc...
//
// Skipped hidden elements:
// noscript

export default {
	block: [
		// Existing features
		{
			model: 'codeBlock',
			view: 'pre'
		},
		{
			model: 'paragraph',
			view: 'p'
		},
		{
			model: 'blockQuote',
			view: 'blockquote'
		},
		{
			model: 'listItem',
			view: 'li'
		},
		{
			model: 'pageBreak',
			view: 'div'
		},
		{
			model: 'rawHtml',
			view: 'div'
		},
		{
			model: 'table',
			view: 'table'
		},
		{
			model: 'tableRow',
			view: 'tr'
		},
		{
			model: 'tableCell',
			view: 'td'
		},
		{
			model: 'tableCell',
			view: 'th'
		},
		{
			model: 'tableColumnGroup',
			view: 'colgroup'
		},
		{
			model: 'tableColumn',
			view: 'col'
		},
		{
			model: 'caption',
			view: 'caption'
		},
		{
			model: 'caption',
			view: 'figcaption'
		},
		{
			model: 'imageBlock',
			view: 'img'
		},
		{
			model: 'imageInline',
			view: 'img'
		},

		// Compatibility features
		{
			model: 'htmlP',
			view: 'p',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlBlockquote',
			view: 'blockquote',
			modelSchema: {
				inheritAllFrom: '$container'
			}
		},
		{
			model: 'htmlTable',
			view: 'table',
			modelSchema: {
				allowWhere: '$block',
				isBlock: true
			}
		},
		{
			model: 'htmlTbody',
			view: 'tbody',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: false
			}
		},
		{
			model: 'htmlThead',
			view: 'thead',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: false
			}
		},
		{
			model: 'htmlTfoot',
			view: 'tfoot',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: false
			}
		},
		{
			model: 'htmlCaption',
			view: 'caption',
			modelSchema: {
				allowIn: 'htmlTable',
				allowChildren: '$text',
				isBlock: false
			}
		},
		{
			model: 'htmlColgroup',
			view: 'colgroup',
			modelSchema: {
				allowIn: 'htmlTable',
				allowChildren: 'col',
				isBlock: false
			}
		},
		{
			model: 'htmlCol',
			view: 'col',
			modelSchema: {
				allowIn: 'htmlColgroup',
				isBlock: false
			}
		},
		{
			model: 'htmlTr',
			view: 'tr',
			modelSchema: {
				allowIn: [ 'htmlTable', 'htmlThead', 'htmlTbody' ],
				isLimit: true
			}
		},
		// TODO can also include text.
		{
			model: 'htmlTd',
			view: 'td',
			modelSchema: {
				allowIn: 'htmlTr',
				allowContentOf: '$container',
				isLimit: true,
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlTh',
			view: 'th',
			modelSchema: {
				allowIn: 'htmlTr',
				allowContentOf: '$container',
				isLimit: true,
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlFigure',
			view: 'figure',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include other block elements.
		{
			model: 'htmlFigcaption',
			view: 'figcaption',
			modelSchema: {
				allowIn: 'htmlFigure',
				allowChildren: '$text',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlAddress',
			view: 'address',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlAside',
			view: 'aside',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlMain',
			view: 'main',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlDetails',
			view: 'details',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		{
			model: 'htmlSummary',
			view: 'summary',
			modelSchema: {
				allowChildren: '$text',
				allowIn: 'htmlDetails',
				isBlock: false
			}
		},
		{
			model: 'htmlDiv',
			view: 'div',
			paragraphLikeModel: 'htmlDivParagraph',
			modelSchema: {
				inheritAllFrom: '$container'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlFieldset',
			view: 'fieldset',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include h1-h6.
		{
			model: 'htmlLegend',
			view: 'legend',
			modelSchema: {
				allowIn: 'htmlFieldset',
				allowChildren: '$text'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlHeader',
			view: 'header',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlFooter',
			view: 'footer',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlForm',
			view: 'form',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: true
			}
		},
		{
			model: 'htmlHgroup',
			view: 'hgroup',
			modelSchema: {
				allowChildren: [
					'htmlH1',
					'htmlH2',
					'htmlH3',
					'htmlH4',
					'htmlH5',
					'htmlH6'
				],
				isBlock: false
			}
		},
		{
			model: 'htmlH1',
			view: 'h1',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlH2',
			view: 'h2',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlH3',
			view: 'h3',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlH4',
			view: 'h4',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlH5',
			view: 'h5',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlH6',
			view: 'h6',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: '$htmlList',
			modelSchema: {
				allowWhere: '$container',
				allowChildren: [ '$htmlList', 'htmlLi' ],
				isBlock: false
			}
		},
		{
			model: 'htmlDir',
			view: 'dir',
			modelSchema: {
				inheritAllFrom: '$htmlList'
			}
		},
		{
			model: 'htmlMenu',
			view: 'menu',
			modelSchema: {
				inheritAllFrom: '$htmlList'
			}
		},
		{
			model: 'htmlUl',
			view: 'ul',
			modelSchema: {
				inheritAllFrom: '$htmlList'
			}
		},
		{
			model: 'htmlOl',
			view: 'ol',
			modelSchema: {
				inheritAllFrom: '$htmlList'
			}
		},
		// TODO can also include other block elements.
		{
			model: 'htmlLi',
			view: 'li',
			modelSchema: {
				allowIn: '$htmlList',
				allowChildren: '$text',
				isBlock: false
			}
		},
		{
			model: 'htmlPre',
			view: 'pre',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlArticle',
			view: 'article',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		{
			model: 'htmlSection',
			view: 'section',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		// TODO can also include text.
		{
			model: 'htmlNav',
			view: 'nav',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		},
		{
			model: 'htmlDivDl',
			view: 'div',
			modelSchema: {
				allowChildren: [ 'htmlDt', 'htmlDd' ],
				allowIn: 'htmlDl'
			}
		},
		{
			model: 'htmlDl',
			view: 'dl',
			modelSchema: {
				allowWhere: '$container',
				allowChildren: [ 'htmlDt', 'htmlDd', 'htmlDivDl' ],
				isBlock: false
			}
		},
		{
			model: 'htmlDt',
			view: 'dt',
			modelSchema: {
				allowChildren: '$block',
				isBlock: false
			}
		},
		{
			model: 'htmlDd',
			view: 'dd',
			modelSchema: {
				allowChildren: '$block',
				isBlock: false
			}
		},
		{
			model: 'htmlCenter',
			view: 'center',
			modelSchema: {
				inheritAllFrom: '$container',
				isBlock: false
			}
		}
	] as Array<DataSchemaBlockElementDefinition>,
	inline: [
		{
			model: 'htmlAcronym',
			view: 'acronym',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlTt',
			view: 'tt',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlFont',
			view: 'font',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlTime',
			view: 'time',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlVar',
			view: 'var',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlBig',
			view: 'big',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlSmall',
			view: 'small',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlSamp',
			view: 'samp',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlQ',
			view: 'q',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlOutput',
			view: 'output',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlKbd',
			view: 'kbd',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlBdi',
			view: 'bdi',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlBdo',
			view: 'bdo',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlAbbr',
			view: 'abbr',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlA',
			view: 'a',
			priority: 5,
			coupledAttribute: 'linkHref',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlStrong',
			view: 'strong',
			coupledAttribute: 'bold',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlB',
			view: 'b',
			coupledAttribute: 'bold',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlI',
			view: 'i',
			coupledAttribute: 'italic',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlEm',
			view: 'em',
			coupledAttribute: 'italic',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlS',
			view: 's',
			coupledAttribute: 'strikethrough',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		// TODO According to HTML-spec can behave as div-like element, although CKE4 only handles it as an inline element.
		{
			model: 'htmlDel',
			view: 'del',
			coupledAttribute: 'strikethrough',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		// TODO According to HTML-spec can behave as div-like element, although CKE4 only handles it as an inline element.
		{
			model: 'htmlIns',
			view: 'ins',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlU',
			view: 'u',
			coupledAttribute: 'underline',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlSub',
			view: 'sub',
			coupledAttribute: 'subscript',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlSup',
			view: 'sup',
			coupledAttribute: 'superscript',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlCode',
			view: 'code',
			coupledAttribute: 'code',
			attributeProperties: {
				copyOnEnter: true,
				isFormatting: true
			}
		},
		{
			model: 'htmlMark',
			view: 'mark',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlSpan',
			view: 'span',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlCite',
			view: 'cite',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlLabel',
			view: 'label',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlDfn',
			view: 'dfn',
			attributeProperties: {
				copyOnEnter: true
			}
		},

		// Objects
		{
			model: 'htmlObject',
			view: 'object',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlIframe',
			view: 'iframe',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlInput',
			view: 'input',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlButton',
			view: 'button',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlTextarea',
			view: 'textarea',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlSelect',
			view: 'select',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlVideo',
			view: 'video',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlEmbed',
			view: 'embed',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlOembed',
			view: 'oembed',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlAudio',
			view: 'audio',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlImg',
			view: 'img',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlCanvas',
			view: 'canvas',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		// TODO it could be probably represented as non-object element, although it has graphical representation,
		// so probably makes more sense to keep it as an object.
		{
			model: 'htmlMeter',
			view: 'meter',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		// TODO it could be probably represented as non-object element, although it has graphical representation,
		// so probably makes more sense to keep it as an object.
		{
			model: 'htmlProgress',
			view: 'progress',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$inlineObject'
			}
		},
		{
			model: 'htmlScript',
			view: 'script',
			modelSchema: {
				allowWhere: [ '$text', '$block' ],
				isInline: true
			}
		},
		{
			model: 'htmlStyle',
			view: 'style',
			modelSchema: {
				allowWhere: [ '$text', '$block' ],
				isInline: true
			}
		},
		{
			model: 'htmlCustomElement',
			view: '$customElement',
			modelSchema: {
				allowWhere: [ '$text', '$block' ],
				isInline: true
			}
		}
	] as Array<DataSchemaInlineElementDefinition>
};
