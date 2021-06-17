export default {
	block: [
		// Existing features
		{ model: 'heading1', view: 'h2' },
		{ model: 'heading2', view: 'h3' },
		{ model: 'heading3', view: 'h4' },
		{ model: 'codeBlock', view: 'pre' },
		{ model: 'paragraph', view: 'p' },
		{ model: 'blockQuote', view: 'blockquote' },
		{ model: 'listItem', view: 'li' },
		// New features
		{
			model: '$htmlBlock',
			modelSchema: {
				allowChildren: '$block',
				allowIn: [ '$root', '$htmlBlock' ],
				isBlock: true
			}
		},
		{ model: 'htmlPre', view: 'pre', modelSchema: { inheritAllFrom: '$block' } },
		{ model: 'htmlArticle', view: 'article', modelSchema: { inheritAllFrom: '$htmlBlock' } },
		{ model: 'htmlSection', view: 'section', modelSchema: { inheritAllFrom: '$htmlBlock' } },
		{ model: 'htmlForm', view: 'form', modelSchema: { inheritAllFrom: '$htmlBlock' } },
		{ model: 'htmlDetails', view: 'details', modelSchema: { inheritAllFrom: '$htmlBlock' } },
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
			model: 'htmlDl',
			view: 'dl',
			modelSchema: {
				allowIn: [ '$htmlBlock', '$root' ],
				allowChildren: [ 'htmlDt', 'htmlDl' ],
				isBlock: true
			}
		},
		{
			model: 'htmlDt',
			view: 'dt',
			modelSchema: {
				allowChildren: '$block',
				isBlock: true
			}
		},
		{
			model: 'htmlDd',
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
		{ model: 'htmlA', view: 'a', priority: 5 },
		{ model: 'htmlStrong', view: 'strong' },
		{ model: 'htmlI', view: 'i' },
		{ model: 'htmlS', view: 's' },
		{ model: 'htmlU', view: 'u' },
		{ model: 'htmlSub', view: 'sub' },
		{ model: 'htmlSup', view: 'sup' },
		{ model: 'htmlCode', view: 'code' },
		{ model: 'htmlMark', view: 'mark' },
		{ model: 'htmlSpan', view: 'span', attributeProperties: { copyOnEnter: true } },
		{ model: 'htmlCite', view: 'cite', attributeProperties: { copyOnEnter: true } },
		{ model: 'htmlLabel', view: 'label', attributeProperties: { copyOnEnter: true } },

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
			view: 'object',
			model: 'htmlObject',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'iframe',
			model: 'htmlIframe',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'input',
			model: 'htmlInput',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'button',
			model: 'htmlButton',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'textarea',
			model: 'htmlTextarea',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'select',
			model: 'htmlSelect',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'video',
			model: 'htmlVideo',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		},
		{
			view: 'audio',
			model: 'htmlAudio',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		}
	]
};
