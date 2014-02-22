var $window = $(window);

docReady(function() {
  /*
   * var container = document.querySelector('#container');
   * var pckry = new Packery(container, {
   *   itemSelector: '.item',
   *   columnHeight: '.item',
   * });

   * $(window).resize(function() {
   *   console.log('body', $('body').height());
   *   console.log('window', $window.height());

   *   var items = $('.item');
   *   var wH = $window.height();
   *   var iH = wH / items.length;
   *   items.height(iH);
   * });
   */

  $('.item h1').fitText();
});
