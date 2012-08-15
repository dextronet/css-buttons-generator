/**
 * The Tweaker Class
 */
  
var Tweaker = (function($) {
  var me = this;

  var $themeColor = $("#theme-color");
  var $radius = $("#border");
  var $padding = $("#padding");  
  var $radiusSlider = $("#border-slider");
  var $paddingSlider = $("#padding-slider");

  var $button = $(".shiny-button");

  function sliderWheel(e, delta) {
    var $this = $(this);
    $this.slider("value", $this.slider("value") + delta * $this.slider("option", "step"));
    e.preventDefault();
    return false;
  }

  function borderSlide(e, ui) {
    $radius.val(ui.value);
    Button.style('borderRadius', ui.value);
  }

  function paddingSlide(e, ui) {
    $padding.val(ui.value);
    Button.style('padding', ui.value);
    me.resetMaxRadius();
    me.position();
  }

  function slideOnChange() {
    var $this = $(this),
        val = parseFloat($this.val());
    if (val >= 0) {
      $this.data("slider").slider("value", val);
    }
  }

  function colorField() {
    var $this = $(this),
        hex = $this.val(),
        rgb = tinycolor(hex).toRgb();
    $this.css('background-color', hex);
    var color = (299 * rgb.r +
          587 * rgb.g +
          114 * rgb.b) / 1000
          < 130 ? '#FFF' : '#000';
    $this.css('color', color);
  }

  function getBoundValue($el) {
    var val, 
        args = $el.data('bind').split("."),
        arity = args.length;

    if (arity == 1) {
      val = Button[args[0]];
    } else if (arity == 2) {
      val = Button[args[0]][args[1]];
    }

    return val;
  }

  function setBoundValue($el, val) {
    var args = $el.data('bind').split(".");
    var arity = args.length;
    if (arity == 1) {
      Button[args[0]] = val;
    } else if (arity == 2) {
      Button[args[0]][args[1]] = val;
    }
  }

  function getEditorValue($el) {
    var val;
    if ($el.is(':checkbox')) {
      val = $el.prop('checked');
    } else {
      val = $el.val();
    }
    return val;
  }

  function styleEditor($el) {
    return $el.data("bind").indexOf("styles") == 0;
  }

  function radiusEditor($el) {
    return $el.data("bind").indexOf("borderRadius") > 0;
  }

  function editorChange() {
    var $this = $(this);
    var val = getEditorValue($this), $this = $(this);
    setBoundValue($this, val);
    if (styleEditor($this)) {
      me.repaint(radiusEditor($this));
    } else {
      me.updateText();
    }
  }

  $.extend(this, {

    init: function() {
      initEditors();
      Button.paint();
      position();
      initColors();
      initSliders();
      initWheels();
      initArrowKeys();
    },

    repaint: function(dontResetRadius) {
      Button.paint();
      if (dontResetRadius !== true) {
        resetMaxRadius();
      }
      position();
    },

    updateText: function() {
      Button.update();
      resetMaxRadius();
      position();
    },

    resetMaxRadius: function() {
      var value = $radiusSlider.slider("value");
      $radiusSlider.slider("option", "max", Button.maxBorderRadius());
      $radiusSlider.slider("value", Math.min(value, Button.maxBorderRadius()));
    },

    position: function() {
      var pos = $button.offsetParent().height() / 2 - $button.outerHeight() / 2;
      $button.css('margin-top', pos);
    },

    initEditors: function() {
      $(".controls input").each(function(i, el) {
        var $el = $(el);
        if (!$el.data('bind')) {
          return;
        }

        var val = getBoundValue($el);
        if ($el.is(':checkbox')) {
          $el.prop('checked', val);
        } else {
          $el.val(val);
        }
        
        $el.change(editorChange);
      });
    },

    initColors: function() {
      $(".color").each(function() {
        var $this = $(this)
        $this.miniColors({
          change: function() {
            $(this).trigger("change");
          }
        });
        $this.change(colorField);
        colorField.apply(this);
      });

      $(".preset").click(function(e) {
        e.preventDefault();
        var $this = $(this);
        Button.style('themeColor', $this.data("color"));
        $themeColor.val($this.data("color")).trigger("change");
      });

      $themeColor.change(function() {
        var $this = $(this);
        $this.miniColors('value', $this.val());
      });
    },

    initSliders: function() {
      // Border-radius slider
      // Max value is dependent on the height of the button-like element
      $radiusSlider.slider({
        value: Button.styles.borderRadius,
        max: Button.maxBorderRadius(),
        slide: borderSlide,
        change: borderSlide
      }).mousewheel(sliderWheel);
      
      $radius.data("slider", $radiusSlider);
      $radius.change(slideOnChange);

      // Padding multiply (coeficient) slider
      $paddingSlider.slider({
        value: Button.styles.padding,
        step: 0.1,
        min: 0,
        max: 2,
        slide: paddingSlide,
        change: paddingSlide
      }).mousewheel(sliderWheel);

      $padding.data("slider", $paddingSlider);
      $padding.change(slideOnChange);
      $padding.mousewheel(function(e, delta) {
        var $this = $(this);
        var val = parseFloat($this.val());
        if (val >= 0) {
          $this.val(val + delta * $paddingSlider.slider("option", "step"));
          $this.trigger("change");
        }
        e.preventDefault();
        return false;
      });
    },

    initWheels: function() {
      $(".wheel").mousewheel(function(e, delta) {
        var $this = $(this);
        var val = parseInt($this.val());
        if (val >= 0) {
          $this.val(val + delta);
          $this.trigger("change");
        }
        e.preventDefault();
        return false;
      }); 
    },

    initArrowKeys: function() {
      $(".wheel").keydown(function(e) {

      });
      $(".wheel").keyup(function(e) {
        
      });
    }
    
  });
  
  return this;
  
}(jQuery));