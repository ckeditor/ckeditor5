## Editor locales

**Note**: For the best testing, run manual tests adding Arabic to [additional languages configuration](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/contributing/testing-environment.html#running-manual-tests).

---

Play with different editor configurations to make sure localization and the right–to–left language support work fine.

### language = 'en' (LTR)

1. Make sure the UI of the editor is English.
2. Make sure the language of the content is English (`lang` attribute of th editable) and aligned to the **left** side.
3. Delete **all** the content.
4. Write something in Arabic.
5. The text you've just written should be aligned **right**.

### language = 'ar' (RTL)

1. Make sure the UI of the editor is Arabic.
2. Make sure the language of the content is Arabic (`lang` attribute of th editable) and aligned to the **right** side.
3. Delete **all** the content.
4. Write something in English.
5. The text you've just written should be aligned **left**.

### language = 'en' (LTR), contentLanguage = 'ar' (RTL)

1. Make sure the UI of the editor is English.
2. Make sure the language of the content is Arabic (`lang` attribute of th editable) and aligned to the **right** side.
3. Delete **all** the content.
4. Write something in English.
5. The text you've just written should be aligned **right**.

### language = 'ar' (RTL), contentLanguage = 'en' (LTR)

1. Make sure the UI of the editor is Arabic.
2. Make sure the language of the content is English (`lang` attribute of th editable) and aligned to the **left** side.
3. Delete **all** the content.
4. Write something in Arabic.
5. The text you've just written should be aligned **left**.
