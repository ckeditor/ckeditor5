### Upcast deprecated table `border` attribute

The demo is split into three columns:

1. **Editor**
2. **Source data (user agent styles)**
3. **Source data wrapped in the `.ck-content` class**

Each table has the deprecated `border` attribute set to `10` (except those which are marked as 0-border tables), along with additional inline styles that affect how the table border is rendered.

By default, CKEditor 5 applies a `double` border style to tables and sets `border-collapse` to `collapse`.
