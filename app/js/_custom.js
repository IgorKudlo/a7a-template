document.addEventListener("DOMContentLoaded", function() {

    /**
     * fancybox
     */
    $('.modal').fancybox({

    });


    /**
     * main-menu
     **/
    var menu = $('.hide-menu');
    var sandwich = $('#sandwich');
    sandwich.on('click', function (e) {
        e.preventDefault();
        menu.slideToggle();
        sandwich.toggleClass('active');
    });
    $(window).resize(function () {
        var w = $(window).width();
        if (w > 768 && menu.is(':hidden')) {
            menu.removeAttr('style');
        }
    });



    /**
     * E-mail Ajax Send
     **/
    $('.form__popup').submit(function () {
        var th = $(this);
        afterTxt = $(th).find('.success');
        $.ajax({
            type: 'POST',
            url: 'mail.php',
            data: th.serialize()
        }).done(function () {
            $(afterTxt).addClass('form__success_visible');
            setTimeout(function () {
                th.trigger('reset');
                $(afterTxt).removeClass('form__success_visible');
                $.fancybox.close();
            }, 3000);
        });
        return false;
    });




});
