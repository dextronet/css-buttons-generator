/**
 * The Button Class
 */
  
var Button = (function($, window, undefined) {
  var me = this;
  
  // The container for the button-like element styles
  var $container = $('<style type="text/css"></style>').appendTo("body");
  var $button = $('<a href="" class="shiny-button" onclick="return false;"></a>').appendTo(".preview");

  // Css classes for the styled element
  var css_classes = {
    base: '.shiny-button',
    text: '.shiny-button strong',
    hover: '.shiny-button:hover',
    active: '.shiny-button:active'
  };
  
  // Css definitions for the classes
  // These are serialized to string and replace the container <style> element content
  var css_definitions = {
    base: {
      'display': 'inline-block',
      'text-align': 'center',
      'border-width': '1px',
      'border-style': 'solid',
      'text-transform': 'uppercase',
      'text-decoration': 'none',
      'line-height': '1.1',
      'font-weight': 'normal',
      'font-family': 'sans-serif'
    },
    text: {
      'letter-spacing': '1px'
    },
    hover: {},
    active: {}
  };

  // Change color luminosity
  function lum(color, amount) {
    if (amount > 0) {
      return tinycolor.lighten(color, amount).toHexString();
    } else {
      return tinycolor.darken(color, -amount).toHexString();
    }
  }

  function desaturate(color, amount) {
    return tinycolor.desaturate(color, amount);
  }

  // Serialize the css definitions for one of the css classes to string
  function classToCss(name, values) {
    var css_str = css_classes[name] + " {\n";
    $.each(values, function(key, value) {
      // Css property can be an array - e.g. background-image with linear-gradient with different vendor prefixes
      if ($.isArray(value)) {
        $.each(value, function(i, v) {
          css_str += "  " + key + ": " + v + ";\n";
        });
      } else {
        css_str += "  " + key + ": " + value + ";\n";
      }
    });
    css_str += "}\n\n";
    return css_str;
  }

  // Map an array of numerical values, e.g. [5, 2, 7, 5], to pixel based css property value 5px 2px 7px 5px
  function arrayToPx(value) {
    return $.map(value, function(v) {
      return v + 'px';
    }).join(' ');
  }

  function directionsToPx(map) {
    return [map.top + 'px', map.right + 'px', map.bottom + 'px', map.left + 'px'];
  }

  function allDirectionsPresent(map) {
    return map.top && map.right && map.bottom && map.left;
  }

  function prefixed(pref) {
    return pref ? '-' + pref + '-' : '';
  }

  function linearGradient(pref, stops) {
    var lg, defs = [];

    if (stops.length == 4) {
      lg = 'linear-gradient(top, '
        + stops[0] + ' 0%, '
        + stops[1] + ' 48%, '
        + stops[2] + ' 49%, '
        + stops[2] + ' 82%, '
        + stops[3] + ' 100%)';
    } else if (stops.length == 2) {
      lg = 'linear-gradient(top, '
        + stops[0] + ' 0%, '
        + stops[1] + ' 100%)';
    }
    
    if (lg) {
      $.each(['webkit', 'moz', 'o', ''], function(i, p) {
        defs.push(prefixed(p) + lg);
      });
    }

    return defs || '';
  }

  function boxShadow(color) {
    return 'inset 0 0 1px 1px ' + color + ', 0 0 1px 3px rgba(0, 0, 0, 0.15)';
  }

  function textShadow(color) {
    return '1px 1px 1px ' + color;
  }

  // Take the baseColor for a theme and deduce colors for:
  // - background
  // - border
  // - inner shine (inset box-shadow)
  // - text shadow
  function themeColors(baseColor) {
    var rgb = tinycolor(baseColor).toRgb();
    var colorWeight = (299 * rgb.r +
          587 * rgb.g +
          114 * rgb.b) / 1000;

    var coef = Math.floor(Math.abs(colorWeight - 130) * 0.13);

    var colors = {
      base: baseColor,
      textShadow: lum(baseColor, -20),
      stops: [
        lum(baseColor, 1),
        lum(desaturate(baseColor, 20), 8),
        baseColor,
        lum(baseColor, 5.5)
      ]
    };

    var borderColor = baseColor;
    if (colorWeight > 140) {
      borderColor = tinycolor.darken(borderColor, 2 * coef);
    }

    var border = desaturate(borderColor, 55 + coef);
    var innerShine = lum(baseColor, 10 + coef);

    colors.innerShine = innerShine;
    colors.border = border;

    return colors;
  }

  // Add css properties do definitions for particular states of the button-like styled element
  function addThemeToDefinitions(type, theme) {
    var ext = {
      'background-color': theme.base,
      'background-image': linearGradient('webkit', theme.stops)
    };

    if (theme.border) {
      ext['border-color'] = theme.border;
    }

    if (theme.innerShine) {
      ext['-webkit-box-shadow'] = boxShadow(theme.innerShine);
      ext['-moz-box-shadow'] = boxShadow(theme.innerShine);
      ext['box-shadow'] = boxShadow(theme.innerShine);
    }

    if (theme.textShadow) {
      ext['-webkit-text-shadow'] = textShadow(theme.textShadow);
      ext['-moz-text-shadow'] = textShadow(theme.textShadow);
      ext['-o-text-shadow'] = textShadow(theme.textShadow);
      ext['text-shadow'] = textShadow(theme.textShadow);
    }

    $.extend(css_definitions[type], ext);
  }

  function applyPadding(direction, value) {
    basePadding[direction] = value;
    if (allDirectionsPresent(basePadding)) {
      css_definitions.base.padding = directionsToPx(basePadding);
      // pressed (active) state padding
      var bp = basePadding;
      css_definitions.active.padding = arrayToPx([bp.top + 1, bp.right, bp.bottom - 1, bp.left]);
    }
  }

  // These are set methods for the customizable styles that changes css definitions
  var set = {
    
    fontColor: function(value) {
      css_definitions.base.color = value;
      css_definitions.hover.color = value;
      css_definitions.active.color = value;
    },

    firstRowFontSize: function(value) {
      css_definitions.text['font-size'] = value + 'px';
    },

    secondRowFontSize: function(value) {
      css_definitions.base['font-size'] = value + 'px';
    },

    themeColor: function(baseColor) {
      var colors = themeColors(baseColor);
      addThemeToDefinitions('base', colors);

      var hoverColors = themeColors(lum(baseColor, 3));
      addThemeToDefinitions('hover', hoverColors);

      var base = lum(baseColor, -3);
      addThemeToDefinitions('active', { base: base, stops: [lum(base, -2), baseColor] });
    },

    borderRadius: function(value) {
      var px_value = value + 'px';
      $.extend(css_definitions.base, {
        '-webkit-border-radius': px_value,
        '-moz-border-radius': px_value,
        'border-radius': px_value
      });
    },

    topPadding: function(value) {
      applyPadding('top', value);
    },

    rightPadding: function(value) {
      applyPadding('right', value);
    },

    bottomPadding: function(value) {
      applyPadding('bottom', value);
    },

    leftPadding: function(value) {
      applyPadding('left', value);
    },

    padding: function(value) {
      if (!(value = parseFloat(value))) {
        return;
      }
      var pad = $.map(me.basePadding, function(p) {
        return p * value;
      });
      css_definitions.base.padding = arrayToPx(pad);
      // pressed (active) state padding
      css_definitions.active.padding = arrayToPx([pad[0] + 1, pad[1], pad[2] - 1, pad[3]]);
    },

    width: function(value) {

    },

    height: function(value) {

    }

  };
  
  // public methods
  $.extend(this, {

    cssCache: null,

    styles: {
      'fontColor': '#FFFFFF',
      'firstRowFontSize': 22,
      'secondRowFontSize': 12,
      'themeColor': '#73B10E',
      'borderRadius': 32,
      'padding': 1
    },

    basePadding: [12, 30, 12, 30],

    text: {
      firstRow: 'Free Download',
      secondRow: 'No hidden battle droids inside'
    },

    secondRow: true,

    autoSize: true,

    // Set custom style for the button-like element and repaint the element
    // *Allowed style names are:*
    // - fontColor
    // - firstRowFontSize
    // - secondRowFontSize
    // - borderRadius
    // - themeColor
    // - padding (padding multiplier, 0 to 2)
    // Colors should be in hex format with sharp sign (e.g. #fff)
    style: function(name, value) {
      this.styles[name] = value;
      this.paint();
    },

    maxBorderRadius: function() {
      return parseInt($button.outerHeight() / 2);
    },

    // Provide html content for the button-like element based on first row and second row text
    html: function() {
      var html = '<strong>' + this.text.firstRow + '</strong>';
      if (this.secondRow) {
        html += '<br>' + text.secondRow;
      }
      return html;
    },

    // Serialize the css definitions into string
    css: function() {
      var self = this;
      if (!self.cssCache) {
        self.cssCache = '';
        $.each(css_definitions, function(key, value) {
          self.cssCache += classToCss(key, value)
        });
      }
      return self.cssCache;
    },
    
    // Paint or repaint the button-like element according to the used styles
    paint: function() {
      var self = this;

      // Dynamicly call the set methods for each style
      $.each(self.styles, function(name, style) {
        if (self.styles.hasOwnProperty(name)) {
          set[name](style);
        }
      });

      self.cssCache = null;
      $container.text(self.css());
      self.update();
    },

    update: function() {
      $button.html(self.html());
    }
    
  });
  
  return this;
  
}(jQuery, window));