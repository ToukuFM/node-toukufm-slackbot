$(function() {
    $('#preloader').fadeOut().attr('aria-busy', 'false');
    $('main').fadeIn();
});

/*$('#submit').click(function() {
    var cat = $('#item_category');
    var url = $('#item_url');
    var text = $('#item_text');
    var name = $('#item_name');
    var title = $('#item_title');

    if (cat.val() &&
        url.val() &&
        text.val() &&
        text.val().length <= 200 &&
        name.val() &&
        title.val()) {


        $.ajax({
            url: '/api/roundup/items/',
            type: 'post',
            dataType: 'json',
            data: {
                category: cat.val(),
                url: url.val(),
                text: text.val(),
                name: name.val(),
                title: title.val()
            },
            success: function(data) {
                console.log(data);
            }
        });
    }
});*/