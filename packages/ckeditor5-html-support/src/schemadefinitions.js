/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

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
// Skipped elements due to lack empty element support:
// * hr
// * area
// * br
// * command
// * map
// * wbr
// Skipped elements due to complexity:
// * datalist with option elements used as a data source for input[list] element
// Skipped elements as they are handled as an object content:
// TODO shouldn't we also filter attributes on these element and enable them separately?
// * track
// * source
// * option
// * param
// * optgroup
// Skipped full page HTML elements:
// * body
// * html
// * title
// * head
// * etc...

export default {
	block: [
		// Existing features
		{
			model: 'heading1',
			view: 'h2'
		},
		{
			model: 'heading2',
			view: 'h3'
		},
		{
			model: 'heading3',
			view: 'h4'
		},
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

		// Compatibility features
		{
			model: '$htmlBlock',
			modelSchema: {
				allowChildren: '$block',
				allowIn: [ '$root', '$htmlBlock' ],
				isBlock: true
			}
		},
		{
			model: 'htmlParagraph',
			view: 'p',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlBlockQuote',
			view: 'blockquote',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		{
			model: 'htmlTable',
			view: 'table',
			modelSchema: {
				allowIn: [ '$htmlBlock', '$root' ],
				isBlock: true
			}
		},
		{
			model: 'htmlTableBody',
			view: 'tbody',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: true
			}
		},
		{
			model: 'htmlTableHead',
			view: 'thead',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: true
			}
		},
		{
			model: 'htmlTableFoot',
			view: 'tfoot',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: true
			}
		},
		{
			model: 'htmlColumnGroup',
			view: 'colgroup',
			modelSchema: {
				allowIn: 'htmlTable',
				isBlock: true
			}
		},
		{
			model: 'htmlCaption',
			view: 'caption',
			modelSchema: {
				allowIn: 'htmlTable',
				allowChildren: '$text',
				isBlock: true
			}
		},
		{
			model: 'htmlTableRow',
			view: 'tr',
			modelSchema: {
				allowIn: [ 'htmlTable', 'htmlTableHead', 'htmlTableBody' ],
				isBlock: true
			}
		},
		// TODO can also include text.
		{
			model: 'htmlTableData',
			view: 'td',
			modelSchema: {
				allowIn: 'tr',
				allowChildren: [ '$block', '$htmlBlock' ],
				isBlock: true
			}
		},
		// TODO can also include text.
		{
			model: 'htmlTableHeader',
			view: 'th',
			modelSchema: {
				allowIn: 'tr',
				allowChildren: [ '$block', '$htmlBlock' ],
				isBlock: true
			}
		},
		// TODO can also include text.
		{
			model: 'htmlFigure',
			view: 'figure',
			modelSchema: {
				inheritAllFrom: '$htmlBlock',
				isBlock: true
			}
		},
		// TODO can also include other block elements.
		{
			model: 'htmlFigcaption',
			view: 'figcaption',
			modelSchema: {
				allowIn: 'htmlFigure',
				allowChildren: '$text',
				isBlock: true
			}
		},
		// TODO can also include other block elements.
		{
			model: 'htmlAddress',
			view: 'address',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlAside',
			view: 'aside',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlMain',
			view: 'main',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlDetails',
			view: 'details',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlDiv',
			view: 'div',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlFieldset',
			view: 'fieldset',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include h1-h6.
		{
			model: 'htmlLegend',
			view: 'legend',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlHeader',
			view: 'header',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlFooter',
			view: 'footer',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlForm',
			view: 'form',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		{
			model: 'htmlHeadingGroup',
			view: 'hgroup',
			modelSchema: {
				allowChildren: [
					'htmlHeading1',
					'htmlHeading2',
					'htmlHeading3',
					'htmlHeading4',
					'htmlHeading5',
					'htmlHeading6',
					'heading1',
					'heading2',
					'heading3'
				],
				isBlock: true
			}
		},
		{
			model: 'htmlHeading1',
			view: 'h1',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlHeading2',
			view: 'h2',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlHeading3',
			view: 'h3',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlHeading4',
			view: 'h4',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlHeading5',
			view: 'h5',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: 'htmlHeading6',
			view: 'h6',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		},
		{
			model: '$htmlList',
			modelSchema: {
				allowIn: [ '$htmlBlock', 'htmlListItem' ],
				allowChildren: 'htmlListItem',
				isBlock: true
			}
		},
		{
			model: 'htmlDirectory',
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
			model: 'htmlUnorderedList',
			view: 'ul',
			modelSchema: {
				inheritAllFrom: '$htmlList'
			}
		},
		{
			model: 'htmlOrderedList',
			view: 'ol',
			modelSchema: {
				inheritAllFrom: '$htmlList'
			}
		},
		// TODO can also include other block elements.
		{
			model: 'htmlListItem',
			view: 'li',
			modelSchema: {
				allowChildren: '$text',
				allowIn: '$htmlList',
				isBlock: true
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
				inheritAllFrom: '$htmlBlock'
			}
		},
		{
			model: 'htmlSection',
			view: 'section',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		// TODO can also include text.
		{
			model: 'htmlNav',
			view: 'nav',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		},
		{
			model: 'htmlSumary',
			view: 'summary',
			modelSchema: {
				allowChildren: '$text',
				allowIn: 'htmlDetails',
				isBlock: true
			}
		},
		{
			model: 'htmlDescriptionList',
			view: 'dl',
			modelSchema: {
				allowIn: [ '$htmlBlock', '$root' ],
				allowChildren: [ 'htmlDescriptionTerm', 'htmlDescriptionDetails' ],
				isBlock: true
			}
		},
		{
			model: 'htmlDescriptionTerm',
			view: 'dt',
			modelSchema: {
				allowChildren: '$block',
				isBlock: true
			}
		},
		{
			model: 'htmlDescriptionDetails',
			view: 'dd',
			modelSchema: {
				allowChildren: '$block',
				isBlock: true
			}
		},
		// Objects
		{
			model: '$htmlObjectBlock',
			isObject: true,
			modelSchema: {
				isObject: true,
				isBlock: true,
				allowWhere: '$block'
			}
		}
	],
	inline: [
		{
			model: 'htmlCenter',
			view: 'center',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlAcronym',
			view: 'acronym',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlTeletypeText',
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
			model: 'htmlSample',
			view: 'samp',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlQuote',
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
			model: 'htmlKeyboardInput',
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
			model: 'htmlAbbreviation',
			view: 'abbr',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlLink',
			view: 'a',
			priority: 5,
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlStrong',
			view: 'strong',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlBold',
			view: 'b',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlItalic',
			view: 'i',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlEmphasis',
			view: 'em',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlStrike',
			view: 's',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		// TODO According to HTML-spec can behave as div-like element, althouth CKE4 only handles it as an inline element.
		{
			model: 'htmlDeleted',
			view: 'del',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		// TODO According to HTML-spec can behave as div-like element, althouth CKE4 only handles it as an inline element.
		{
			model: 'htmlInserted',
			view: 'ins',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlUnderline',
			view: 'u',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlSubscript',
			view: 'sub',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlSuperscript',
			view: 'sup',
			attributeProperties: {
				copyOnEnter: true
			}
		},
		{
			model: 'htmlCode',
			view: 'code',
			attributeProperties: {
				copyOnEnter: true
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
			model: 'htmlDefinition',
			view: 'dfn',
			attributeProperties: {
				copyOnEnter: true
			}
		},

		// Objects
		{
			model: '$htmlObjectInline',
			isObject: true,
			modelSchema: {
				isObject: true,
				isInline: true,
				allowWhere: '$text',
				allowAttributesOf: '$text'
			}
		},
		{
			model: 'htmlObject',
			view: 'object',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlIframe',
			view: 'iframe',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlInput',
			view: 'input',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlButton',
			view: 'button',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlTextarea',
			view: 'textarea',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlSelect',
			view: 'select',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlVideo',
			view: 'video',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlEmbed',
			view: 'embed',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			model: 'htmlAudio',
			view: 'audio',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		// TODO Should image be an object?
		{
			model: 'htmlImage',
			view: 'img',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		// TODO Should canvas be an object?
		{
			model: 'htmlCanvas',
			view: 'canvas',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		// TODO it could be probably represented as non-object element, although it has grafical representation,
		// so probably makes more sense to keep it as an object.
		{
			model: 'htmlMeter',
			view: 'meter',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		// TODO it could be probably represented as non-object element, although it has grafical representation,
		// so probably makes more sense to keep it as an object.
		{
			model: 'htmlProgress',
			view: 'progress',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		}
	]
};
