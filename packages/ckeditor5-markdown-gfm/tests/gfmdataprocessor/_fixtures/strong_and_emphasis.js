export default [
	{
		name: 'should use strong',
		md: '**this is strong** and __this too__',
		html: '<p><strong>this is strong</strong> and <strong>this too</strong></p>'
	},
	{
		name: 'should use emphasis',
		md: '*this is emphasis* and _this too_',
		html: '<p><em>this is emphasis</em> and <em>this too</em></p>'
	},
	{
		name: 'should use strong and emphasis together #1',
		md: '***This is strong and em.***',
		html: '<p><strong><em>This is strong and em.</em></strong></p>'
	},
	{
		name: 'should use strong and emphasis together #2',
		md: 'Single ***word*** is strong and em.',
		html: '<p>Single <strong><em>word</em></strong> is strong and em.</p>'
	},
	{
		name: 'should use strong and emphasis together #2',
		md: '___This is strong and em.___',
		html: '<p><strong><em>This is strong and em.</em></strong></p>'
	},
	{
		name: 'should use strong and emphasis together #2',
		md: 'Single ___word___ is strong and em.',
		html: '<p>Single <strong><em>word</em></strong> is strong and em.</p>'
	}
];
