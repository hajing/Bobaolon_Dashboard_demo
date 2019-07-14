/* ********************************************************************************************************* */
//
// function play_video(i) {
//     var container_id = 'video_' + i;
//     var container = $('#' + container_id)[0];
//     var panel = $(container_id).parent().parent();
//     if (panel.hasClass('video_hidden')) {
//         return;
//     }

//     var iProtocol = 1, // protocol 1：http, 2:https
//         szIP = ipList[i], // protocol ip
//         szPort = "80", // protocol port
//         szUsername = "admin", // device username
//         szPassword = "sz123456", // device password
//         iStreamType = 2, // stream 1：main stream  2：sub-stream  3：third stream  4：transcode stream
//         iChannelID = 1, // channel no
//         bZeroChannel = false // zero channel
//     ;

//     var webControl = WebVideoCtrlCreator.create(container);
//     var width = container.clientWidth;
//     var height = container.clientHeight;
//     webControl.I_InitPlugin(width, height, {
//         bWndFull: true,
//         iWndowType: 1,
//         cbInitPluginComplete: function () {
//             global_log("初始化" + szIP + "成功");
//             if (-1 == webControl.I_InsertOBJECTPlugin(container_id)) {
//                 global_erro(szIP + "嵌入播放插件失败！");
//                 return;
//             }
//             webControl.I_Login(szIP, iProtocol, szPort, szUsername, szPassword, {
//                 success: function (xmlDoc) {
//                     global_info("登录" + szIP + "成功");
//                     var szDeviceIdentify = szIP + "_" + szPort;
//                     webControl.I_StartRealPlay(szDeviceIdentify, {
//                         iStreamType: iStreamType,
//                         iChannelID: iChannelID,
//                         bZeroChannel: bZeroChannel,
//                         success: function () {
//                             global_info(szIP + "播放成功");
//                             if (i < 5) {
//                                 setTimeout(play_video, 1000, i + 1);
//                             }
//                         },
//                         error: function () {
//                             debugger;
//                             global_warn(szIP + "播放失败");
//                         }
//                     });
//                 },
//                 error: function () {
//                     global_warn("登录" + szIP + "失败");
//                 }
//             });
//         }
//     });
// }
//
/* ********************************************************************************************************* */

var ipList_bak = [
    {
        ip: "113.107.33.92",
        port: "81",
        username: "admin",
        password: "admin12345"
    },
    {
        ip: "113.107.33.92",
        port: "82",
        username: "admin",
        password: "admin12345"
    },
    {
        ip: "113.107.33.92",
        port: "83",
        username: "admin",
        password: "admin12345"
    },
    {
        ip: "113.107.33.92",
        port: "84",
        username: "admin",
        password: "admin12345"
    },
    {
        ip: "113.107.33.92",
        port: "85",
        username: "admin",
        password: "admin12345"
    },
    {
        ip: "192.168.6.202",
        port: "80",
        username: "admin",
        password: "sz123456"
    },
    {
        ip: "192.168.6.203",
        port: "80",
        username: "admin",
        password: "sz123456"
    },
    {
        ip: "192.168.6.204",
        port: "80",
        username: "admin",
        password: "sz123456"
    },
    {
        ip: "192.168.6.205",
        port: "80",
        username: "admin",
        password: "sz123456"
    },
    {
        ip: "192.168.6.209",
        port: "80",
        username: "admin",
        password: "sz123456"
    }
];

var ipList = [];

var STATUS_NOT_INITED = 0, //0.未初始化
    STATUS_INIT_COMPLETED = 1, //1 已初始化
    STATUS_LOGINED = 2, // 2 已登录
    STATUS_STARTED = 3 //3 播放中
    ;

var WebVideoPlayerCreator = {
    checkPluginInstalled: function () {
        try {
            new ActiveXObject("WebVideoKitActiveX.WebVideoKitActiveXCtrl.1");
            return 0;
        } catch (n) {
            return -1;
        }
    },
    create: function (e) {
        var container_id = e.containerId;
        var iProtocol = 1, // protocol 1：http, 2:https
            szIP = e.ip, // protocol ip
            szPort = e.port, // protocol port
            szUsername = e.username, // device username
            szPassword = e.password, // device password
            iStreamType = 2, // stream 1：main stream  2：sub-stream  3：third stream  4：transcode stream
            iChannelID = 1, // channel no
            bZeroChannel = false // zero channel
            ;
        var container = $('#' + container_id)[0];
        var innerControl = new t(container);
        var is_in_start = false;
        var status = STATUS_NOT_INITED;
        var statusChanged = e.onPlayerStatusChanged;

        var player = {
            getStatus: function () {
                return status;
            },
            switch_to: function (ip) {
                this.stop();
                szIP = ip;
                change_status(STATUS_INIT_COMPLETED);
                do_login();
            },
            start: function () {
                global_log("正在启动" + szIP + "……");
                if (is_in_start) {
                    global_log(szIP + "正在启动中，等待启动完成……");
                    return;
                }
                is_in_start = true;

                if (status >= STATUS_INIT_COMPLETED) { //已经初始化过
                    do_login();
                    return;
                }
                global_log("正在初始化" + szIP + "……");

                do_init();
            },

            stop: function (isTrayAgain) {
                global_info(szIP + "开始停止……");
                if (status != STATUS_STARTED) {
                    global_info(szIP + "已经停止");
                    return;
                }

                innerControl.I_Stop({
                    success: function () {
                        global_info(szIP + "停止成功");
                        if (status >= STATUS_LOGINED) {
                            status = STATUS_LOGINED;
                        }
                    },
                    error: function () {
                        if (isTrayAgain) {
                            return;
                        }
                        global_info(szIP + "停止失败，进行再次尝试");
                        me.stop(true); //再尝试一次。
                    }
                });
            }
        };

        var change_status = function (value) {
            status = value;
            if (statusChanged && typeof (statusChanged) == "function") {
                statusChanged(player, value);
            }
        };

        var do_play = function () {
            global_info(szIP + "开始播放……");

            var szDeviceIdentify = szIP + "_" + szPort;
            innerControl.I_StartRealPlay(szDeviceIdentify, {
                iStreamType: iStreamType,
                iChannelID: iChannelID,
                bZeroChannel: bZeroChannel,
                success: function () {
                    global_info(szIP + "播放成功");

                    is_in_start = false;
                    change_status(STATUS_STARTED);
                },
                error: function () {
                    global_warn(szIP + "播放失败");
                    is_in_start = false;
                }
            });
        };

        var do_login = function () {
            global_log("正在登录" + szIP + "...");
            if (status >= STATUS_LOGINED) {
                global_log("已经登录过" + szIP + "...");
                do_play();
            }

            if (-1 == innerControl.I_Login(szIP, iProtocol, szPort, szUsername, szPassword, {
                success: function (xmlDoc) {
                    global_info("登录" + szIP + "成功");
                    change_status(STATUS_LOGINED);
                    setTimeout(do_play, 300);
                },
                error: function () {
                    global_warn("登录" + szIP + "失败");
                    is_in_start = false;
                }
            })) {
                setTimeout(do_play, 300);
            }
        };

        var do_init = function () {
            var width = container.clientWidth;
            var height = container.clientHeight;

            innerControl.I_InitPlugin(width, height, {
                bWndFull: true,
                iWndowType: 1,
                cbInitPluginComplete: function () {
                    global_log("初始化" + szIP + "成功");

                    if (-1 == innerControl.I_InsertOBJECTPlugin(container_id)) {
                        global_erro(szIP + "嵌入播放插件失败！");
                        is_in_start = false;

                        return;
                    }
                    change_status(STATUS_INIT_COMPLETED);
                    do_login();
                }
            });
        };



        return player;
    }
}

var video_players = [];

function start_all_player() {
    var current_player_index = 0;
    var start_all_player_timer;
    var do_start = function () {
        if (current_player_index >= video_players.length) {
            clearInterval(start_all_player_timer);
            return;
        }
        var currentPlayer = video_players[current_player_index];
        currentPlayer.start();

        current_player_index += 1;
    };
    start_all_player_timer = setInterval(do_start, 1000);
}

//生成
function create_video_players() {
    for (var i = 0; i < ipList.length; i++) {
        var container_id = 'video_' + i;
        var player = WebVideoPlayerCreator.create({
            containerId: container_id,
            ip: ipList[i].ip,
            port: ipList[i].port,
            username: ipList[i].username,
            password: ipList[i].password
        });
        video_players.push(player);
    }
}


//切换
var switch_time = 0;

function switch_video() {

    var ipIndex = ((switch_time % 2) == 0) ? (ipList.length / 2) : 0;
    var i = 0;
    var do_switch_timer;
    var do_switch = function () {
        var ip = ipList[ipIndex];
        var player = video_players[i];
        player.switch_to(ip)

        i += 1;
        ipIndex += 1;
        if (i >= video_players.length) {
            clearInterval(do_switch_timer);
        }
    };
    do_switch_timer = setInterval(do_switch, 500);

    switch_time += 1;
}


// var player_stopped_check_timer;
// var MAX_WAIT_TIME = 100;
// var current_stop_wait_time = 0;

// //视频切换
// function switch_video() {
//     //停止
//     for (var i = 0; i < video_players.length; i++) {
//         var player = video_players[i];
//         if (player.getStatus() == STATUS_STARTED) {
//             video_players[i].stop();
//         }
//     }
//     current_stop_wait_time = 0;
//     player_stopped_check_timer = setInterval(check_players_stopped, 30);
// }

// function check_players_stopped() {
//     //检查是否停止
//     current_stop_wait_time += 1;
//     if (current_stop_wait_time >= MAX_WAIT_TIME) {
//         clearInterval(player_stopped_check_timer);
//         alert("停止视频失败，请重新刷新界面或者联系管理员！");
//         return;
//     }

//     for (var i = 0; i < video_players.length; i++) {
//         if (video_players[i].getStatus() == STATUS_STARTED) {
//             return;
//         }
//     }
//     clearInterval(player_stopped_check_timer);

//     //交换
//     $('.video_panel').each(function () {
//         if ($(this).hasClass('video_hidden')) {
//             $(this).removeClass('video_hidden');
//         } else {
//             $(this).addClass('video_hidden');
//         }
//     });

//     //启动
//     current_player_index = 0;
//     start_all_player_timer = setInterval(start_all_player, 1000);
// }



$(function () {

    //环境检查
    if (-1 == WebVideoPlayerCreator.checkPluginInstalled()) {
        alert("您还未安装过插件，双击开发包目录里的WebComponentsKit.exe安装！");
        return;
    }
    //初始化
    create_video_players();

    //启动
    start_all_player();

    //每60秒切换一次视频
    // setInterval(switch_video, 1 * 60 * 1000);
})
