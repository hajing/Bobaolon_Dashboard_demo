var switchTimes = 0;
var initDate = new Date();
var load_check_timer, start_check_timer;
var video_frames = [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
];

function check_video_loaded() {
    global_log("检查页面是否已经全部加载...");

    for (var i = 0; i < video_frames.length; i++) {
        if (video_frames[i] === 0) {
            return;
        }
    }
    clearInterval(load_check_timer);

    global_log("所有页面都已经加载,清除检查器 load_check_timer ，开始启动摄像头...");
    for (var i = 0; i < video_frames.length; i++) {
        var selector = '#video_' + i;
        var panel = $(selector).parent().parent();
        if (!panel.hasClass('video_hidden')) {
            $(selector)[0].contentWindow.start();
        } else {
            global_log(ipList[i] + "已隐藏，不需要启动...");
        }
    }
    start_check_timer = setInterval(check_started, 5000);
}

function check_started() {
    for (var i = 0; i < video_frames.length; i++) {
        if (video_frames[i] === 2) {
            continue;
        }

        var selector = '#video_' + i;
        var panel = $(selector).parent().parent();
        if (!panel.hasClass('video_hidden')) {
            $(selector)[0].contentWindow.start();
        } else {
            global_log(ipList[i] + "已隐藏，不需要启动...");
        }
    }
}

function on_video_stoped(i) {
    video_frames[i] = 1;
}

function on_video_started(i) {
    video_frames[i] = 2;
}


function on_video_init_completed(i) {
    video_frames[i] = 1;
}

function switchVideo() {
    $('.video_panel').each(function () {
        if ($(this).hasClass('video_hidden')) {
            $(this).removeClass('video_hidden');
            $(this).find('.video_frame').each(function () {
                this.contentWindow.start();
            });
        } else {
            $(this).addClass('video_hidden');
            $(this).find('.video_frame').each(function () {
                this.contentWindow.stop();
            });
        }
    });
}

$(function () {
    load_check_timer = setInterval(check_video_loaded, 100);

    setInterval(function () {
        switchVideo();
    }, 1 * 60 * 1000);
})