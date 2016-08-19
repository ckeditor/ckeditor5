export default [
	{
		name: 'should create list item when using tabs',
		md: '+	this is a list item indented with tabs\n',
		html: '<ul><li>this is a list item indented with tabs</li></ul>'
	},
	{
		name: 'should create list item when using spaces',
		md: '+   this is a list item indented with spaces\n\n',
		html: '<ul><li>this is a list item indented with spaces</li></ul>'
	},
	{
		name: 'should create code block indented by tab',
		md: '	this code block is indented by one tab',
		html: '<pre><code>this code block is indented by one tab</code></pre>'
	}
];
