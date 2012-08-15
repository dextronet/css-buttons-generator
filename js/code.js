$(document).ready(function() {
  var Button = window.opener.Button;
  var comment = [
    '/**',
    ' * CSS Buttons Generator for your pleasure!',
    ' * http://www.dextronet.com/css-buttons-generator',
    ' * ',
    ' * (c) Ondrej Zabojnik <zabojnik@dextronet.com>, released under the MIT license',
    ' * ',
    ' * Usage: ',
    ' *   <a href="" class="shiny-button">{text}</a>',
    ' * ',
    ' */',
    '', ''
  ];

  var text = '<strong>' + Button.text.firstRow + '</strong>';
  if (Button.secondRow) {
    text += '<br>' + Button.text.secondRow;
  }

  comment = comment.join('\n').replace('{text}', text);

  $("pre").text(comment + Button.css());
});