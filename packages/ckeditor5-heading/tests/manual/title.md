Note: use any editor if not specified.

### Placeholder

- make sure that the first editor has default placeholders: `Type your title` and `Type or paste your content here.`
- make sure that the second editor has custom placeholders: `Custom title placeholder` and `Custom body placeholder`.

## Title feature

- you should see placeholders when there is no text in any of the sections.
- you should be able to put the selection to the both sections and jump between them using `Shift` and `Tab+Shift`.

### Prevent extra paragraphing (typing)

- type `FooBar` in the title
- place selection in the middle of the title `Foo{}Bar`
- press `Enter`

There should be no empty paragraph at the end of document, title should contains `Foo` body `Bar`.

### Prevent extra paragraphing (pasting)

- type `Foo` in the title
- type `Bar` in the body
- select and cut all text (you should see an empty document with selection in the title element)
- paste text

There should be no empty paragraph at the end of document, title should contains `Foo` body `Bar`.

### Changing title

- type something in the title
- put selection in the middle of the title

Heading dropdown, upload and bold icons should be disabled as long as selection stay in the title element.
Alignment feature should be enabled.
