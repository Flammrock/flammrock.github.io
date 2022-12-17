
# Icon System

The icon system is based on a custom font built
from a list of svg icons using the
npm [svgicons2svgfont](https://www.npmjs.com/package/svgicons2svgfont)
module the same way as [fontawesome](https://fontawesome.com/).

An svg icon is wrapped in the font associated with a
unicode character (i.e. U + E001) then can be added via
a css like this:

```ccc
.icons-my-icons:before {
  content: '\E001';
}
```

To add a custom font (ttf, woff, woff2, ...),
the font can be added this way in css:

```css
@font-face {
  font-family: "Custom Icons";
  src: url('./icons.eot');
  src: url('./icons.eot') format('embedded-opentype'),
    url('./icons.woff2') format('woff2'),
    url('./icons.woff') format('woff'),
    url('./icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

First and foremost, if a property has two declaration referred
to it for a single selection rule, it has to be understood by
the browser twice for the second declaration to win out.
In this case, older versions of IE only sees one src it
understands, and so do modern browsers that (usually) only
understand the second declaration.

Older versions of IE only understand the first declaration,
while modern browsers either don't understand the first
declaration that's usually written in a non-standard way
or override it with the second declaration.

Using both, we take account both older versions of IE
that only understand the first declaration while providing
the second for browsers that can understand a more
standard-compliant way of supporting a custom-font for our
web page.

Thus, we can define a css class to be able to specify the
font that we have added to certain html elements
(which will be targeted thanks to this css class) :

```css
.custom-icons {
  font-family: "Custom Icons";
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-rendering: auto
}
```

In this way, we can use the icons from the font
with html elements:

```html
<i class="custom-icons icons-my-icons"></i>
```

then, we can easily export the names of the icons
with constants in typescript, example:

```typescript
import './icons.css'

const prefix = 'custom-icons icons-'

export const Icons = {
  CarSide: prefix + 'car-side',
  Flag: prefix + 'flag',
  Hand: prefix + 'hand',
  Kamek: prefix + 'kamek',
  Road: prefix + 'road',
  TrafficLight: prefix + 'traffic-light',
  UpDownLeftRight: prefix + 'up-down-left-right'
}
```
