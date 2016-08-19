export default [
	{
		name: 'single',
		md: '> foo bar',
		html: '<blockquote><p>foo bar</p></blockquote>'
	},
	{
		name: 'nested',
		md: '> foo\n>\n> > bar\n>\n> foo\n',
		html: '<blockquote><p>foo</p><blockquote><p>bar</p></blockquote><p>foo</p></blockquote>'
	}
];
