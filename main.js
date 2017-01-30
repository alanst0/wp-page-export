function generateExport(site) {
    site.getData()
        .on('done', function(event, data) {
            $('#page-content h1#site-name').text(data.name);
        })
        .on('error', handleError);

    $('#load-info').show();
    $('#load-error').hide();
    updatePageProgress({}, {current: 0, total: 1});
    site.getAllPages()
        .on('progress', updatePageProgress)
        .on('done', renderPages)
        .on('error', handleError);

    $('#site-contents').text('');
}

function handleError(event, info) {
    console.warn(info.message);
    $('#load-info').hide();
    $('#load-error').show().find('.alert').text(info.message);
}

function updatePageProgress(event, info) {
    $('#load-info .progress-bar').width((info.current / info.total * 100) + '%');
}

function renderPages(event, data) {
    $('#load-info').hide();
    updatePageProgress({}, {current: 0, total: 1});
    $.each(data.pages, function(_, page) {
        $('#site-contents')
            .append($('<hr>'))
            .append($('<h1>').text(page.title.rendered));
        $('<div>', {class: "site-page"}).html(page.content.rendered)
            .appendTo($('#site-contents'));
    });
}

jQuery(function($) {
    $('.hidden').hide().removeClass('hidden');
    $('form').on('submit', function(e) {
        e.preventDefault();
        var url = $(this).find('input#url').val();
        if (url)
            generateExport(new Site(url));
    });
});
