!(function (o) {
	const i = (o.gu = o.gu || {});
	(i.dictionary = Object.assign(i.dictionary || {}, {
		'%0 of %1': '',
		'Block quote': ' વિચાર ટાંકો',
		Bold: 'ઘાટુ - બોલ્ડ્',
		Cancel: '',
		'Cannot upload file:': 'ફાઇલ અપલોડ ન થઇ શકી',
		Italic: 'ત્રાંસુ - ઇટલિક્',
		'Rich Text Editor. Editing area: %0': '',
		Save: '',
		'Show more items': ''
	})),
		(i.getPluralForm = function (o) {
			return 1 != o;
		});
})(window.CKEDITOR_TRANSLATIONS || (window.CKEDITOR_TRANSLATIONS = {}));
