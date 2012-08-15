$(document).ready(function() {
  Tweaker.init();

  if (navigator.platform && navigator.platform.match(/win/i)) {
    $(".stdl").show();
  }
});