$('head').append('<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css">');

$('input, select, textarea').focus(function() {
  $(this).closest('.float-label-field').addClass('float').addClass('focus');
})

$('input, select, textarea').blur(function() {
  $(this).closest('.float-label-field').removeClass('focus');
  if (!$(this).val()) {
    $(this).closest('.float-label-field').removeClass('float');
  }
});