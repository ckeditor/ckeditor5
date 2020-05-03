### Nested editable manual test

* Put selection inside `foo bar baz` nested editable. Main editable and nested one should be focused (blue outline should be visible).
* Change selection inside nested editable and see if `Model contents` change accordingly.
* Click outside the editor. Outline from main editable and nested editable should be removed.
* Check following scenario:
  * put selection inside nested editable: `foo bar baz{}`,
  * click outside the editor (outlines should be removed),
  * put selection at exact same place as before: `foo bar baz{}`,
  * both editables should be focused (blue outline should be visible).