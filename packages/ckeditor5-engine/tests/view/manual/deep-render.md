## Text nodes deep rendering ([#1125](https://github.com/ckeditor/ckeditor5-engine/issues/1125))

### Deep space rerender ([#1093](https://github.com/ckeditor/ckeditor5-engine/issues/1093))

1. Put caret after each `Foo` text (`Foo^`).
1. Press space.

**Expected**: Inserted space is visible. Space on the beginning of the next text node is replaced with `&nbsp;`.

### Link ending with styles ([ckeditor5-typing#120](https://github.com/ckeditor/ckeditor5-typing/issues/120))

1. Put caret on the end of the link (`Link Bold^`).
1. Insert some text.

**Expected**: Bold text is inserted as a part of the link. No errors thrown in the browser dev console.
