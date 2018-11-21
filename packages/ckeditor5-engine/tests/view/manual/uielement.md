### UIElement handling

1. Each paragraph should have UIElement at it's bottom showing "END OF PARAGRAPH".
1. UIElement should not block typing or prevent regular editor usage.
1. When paragraph is split or new paragraph is created - new UIElement should be created too.
1. You should not be able to place selection inside ui element or type in it.
1. Arrow keys should work correctly around ui element.

Note: You can't put a selection after `X` (UIElement). 
See a comment in issue [#1592](https://github.com/ckeditor/ckeditor5-engine/issues/1592#issuecomment-440638618). 
