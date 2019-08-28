## Title feature

- you should see `Title` and `Body` placeholders when there is no text in any of sections.
- you should be able to put selection to both sections and jump between them using `Shift` and `Tab+Shift`.

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

### Uploading image to the title

- type something in the title
- put selection in the middle of the title
- upload image using toolbar button

Image should land after the title element and should not split the title.

### Uploading image to the title (drag&drop)

- type something in the title
- try to drop image to the title or before the title

Image should always land after the title element.
