var counter_value = 0;
var score_elm;
var logs = [];
var logs_container;
var previous_action_timestamp;
var new_action_timestamp;
var audio_up;
var audio_down;
var sound_checkbox;
var button_up;
var button_down;
var buttons_container;
var invert_state = 0;
var slider_container;
var start_timestamp = null;
var total_duration = 0;
/* Stopwatch */
var visual_stopwatch_container;
var stopwatch_container;
var is_stopwatch_paused = true;
var stopwatch_start_timestamp;
var pause_timestamp;
function is_touch_screen() {
    // https://codepen.io/tteske/pen/KKwxOxp
    is_touch = false;
    if ("ontouchstart" in document.documentElement) {
        is_touch = true;
    }
    return is_touch;
}
function setScore() {
    get_score_elm();
    score_elm.setAttribute("score", counter_value);
}
function handleClick(e) {
    var bouton_up;
    var bouton_down;
    if (!bouton_up) {
        bouton_up = document.getElementById("plus");
    }
    if (!bouton_down) {
        bouton_down = document.getElementById("minus");
    }
    if (e.target == bouton_up) {
        addPoint(bouton_up);
        return false;
    } else if (e.target == bouton_down) {
        removePoint(bouton_down);
        return false;
    }
}
document.addEventListener("touchstart", function(e){
    if(!is_touch_screen())
        return false;
    handleClick(e);
});
document.addEventListener("mousedown", function(e){
    if(is_touch_screen())
        return false;
    handleClick(e);
});
function addPoint(button_elm) {
    play_audio("up");
    counter_value++;
    logTimestamp("add");
    setScore();
    return false;
}
function removePoint(button_elm) {
    play_audio("down");
    counter_value--;
    if (counter_value < 0)
        counter_value = 0;
    logTimestamp("remove");
    setScore();
    return false;
}
function get_score_elm() {
    if (!score_elm) {
        score_elm = document.querySelector('.score');
    }
}
function logTimestamp(type) {
    if(!start_timestamp){
        start_timestamp = new Date();
    }
    new_timestamp = new Date();
    total_duration = new_timestamp - start_timestamp;
    if (!previous_action_timestamp)
        previous_action_timestamp = new_timestamp;
    var log_element = {
        "action": type,
        "timestamp": new_timestamp,
        "count": counter_value,
        "total_duration": total_duration,
        "delta": getTimeOffset(previous_action_timestamp, new_timestamp)
    }
    logs.push(log_element);
    display_logs(log_element);
    previous_action_timestamp = new_timestamp;
}
function display_logs(log_element) {
    getLogsContainer();
    var div = document.createElement("div");
    div.classList.add(log_element.action);
    div.classList.add("log-item");
    var the_time = getTime(log_element.timestamp);
    var the_duration = getDurationToString(log_element.total_duration);
    if (previous_action_timestamp == new_timestamp) {
        div.textContent = counter_value + " => Start timestamp : " + the_time;
    } else {
        div.textContent = counter_value + " => " + log_element.delta + " | Duration : " + the_duration;
    }
    logs_container.append(div);
}
function getTimeOffset(previous_date, new_date) {
    var seconds = (new_date.getTime() - previous_date.getTime()) / 1000;
    return "+" + seconds + " secs";
}
function getLogsContainer() {
    if (!logs_container) {
        logs_container = document.querySelector('.logs-container');
    }
}
function play_audio(up_or_down) {
    getSoundCheckbox();
    var audio = document.createElement("audio");
    if (up_or_down == "up") {
        audio.src = media_up;
    } else if (up_or_down == "down") {
        audio.src = media_down;
    }
    if (sound_checkbox.checked) {
        audio.play();   
    }
}

function getTime(the_date) {
    var hours = the_date.getHours();
    var minutes = the_date.getMinutes();
    var seconds = the_date.getSeconds();
    var ms = the_date.getMilliseconds();
    hours = hours.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    })
    minutes = minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    });
    seconds = seconds.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    })
    seconds.toLocaleString('en-US', {
        minimumSignificantDigits: 3
    });
    return hours + "h" + minutes + "m" + seconds + "s." + ms + "ms";
}
function getTime2(hours, minutes, seconds){
    hours = hours.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    })
    minutes = minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    });
    seconds = seconds.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        minimumFractionDigits: 3
    });
    return hours + ":" + minutes + ":" + seconds
}

function getDurationToString(duration_ms){
    var seconds = duration_ms / 1000;
    var minutes = seconds / 60;
    if(minutes < 1)
        minutes = 0;
    else
        minutes = Math.ceil(minutes);
    var hours = minutes / 60;
    if(hours < 1)
        hours = 0;
    else
        hours = Math.ceil(hours);

    var string = getTime2(hours, minutes, seconds);
    return string;
}

function resetScore(){
    var choice = confirm("This will :\n- Erase all data\n- Reset score to 0\n- Reset stopwatch to 0\nProceed?");
    if(!choice){
        return false;
    } else {
        previous_action_timestamp = null;
        start_timestamp = null;
        counter_value = 0;
        setScore();
        getLogsContainer();
        logs = new Array();
        logs_container.innerHTML = "";
    }
}

function toggleStopwatch(element, event){
    getStopwatchContainer();
    element.classList.toggle('inactive')
    visual_stopwatch_container.classList.toggle('hidden');
}

function pauseStopwatch(element, event){
    if(!stopwatch_start_timestamp)
        pause_timestamp = stopwatch_start_timestamp = new Date();
    if(!is_stopwatch_paused){
        // Request to pause the timestamp
        pause_timestamp = new Date();
    }else{
        // Request to unpause the timestamp
        pause_duration = new Date() - pause_timestamp;
        stopwatch_start_timestamp = new Date(stopwatch_start_timestamp.getTime() + pause_duration);
    }
    is_stopwatch_paused = !is_stopwatch_paused;
}
function resetStopwatch(element, event){
    if(!confirm('Reset stopwatch to 0?'))
        return false;

    pause_timestamp = stopwatch_start_timestamp = null;
    is_stopwatch_paused = true;
    setStopwatchTime(getDurationToString(0));
}
function getStopwatchContainer(){
    if(!visual_stopwatch_container)
        visual_stopwatch_container = document.querySelector('.stopwatch-container');
    if(!stopwatch_container)
        stopwatch_container = document.querySelector('.stopwatch');
}
function setStopwatchTime(duration_string){
    getStopwatchContainer();
    duration_string = duration_string.substring(0, 12);
    stopwatch_container.setAttribute("data-value", duration_string);
}
setInterval(function(){
    if(is_stopwatch_paused)
        return;

    var t_now = new Date();
    var t_total_duration = t_now - stopwatch_start_timestamp;
    var t_duration_to_string = getDurationToString(t_total_duration);

    setStopwatchTime(t_duration_to_string);
}, 100)

function getSoundCheckbox() {
    if (!sound_checkbox)
        sound_checkbox = document.getElementById("sound");
}

function getButtons() {
    if (!button_up) {
        button_up = document.getElementById("plus");
    }
    if (!button_down) {
        button_down = document.getElementById("minus");
    }
}

function getButtonsContainer() {
    if (!buttons_container) {
        buttons_container = document.querySelector('.btn-container');
    }
}

function invertButtons(element, event) {
    getButtonsContainer();
    getButtons();
    var btn_to_move = button_down;
    if (invert_state % 2 == 0) {
        btn_to_move = button_up;
    }
    buttons_container.prepend(btn_to_move);
    invert_state++;
}

function getSlider() {
    slider_container = document.querySelector(".app-container__slider");
}

function goToFrame(frame_index) {
    getSlider();
    slider_container.style.top = "-" + (frame_index * 100) + "%";
}

var media_up = "data:audio/mp3;base64,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nQgZ5NP9y4Oae//1OUTxiiXTEgocWDgyUCRb/MSRYW62277+sAABWbd9gkI10sm3e+K1cOlOH4pykDaiu6ZMUm6W0lvftH13ruczHj0Xf9n9x23/2L720PQ//35doAGIAAAFADij4zlbDSEVqFcrvvYyqG1aKV/oxDWF25P1JXDAqBmHTIdwNB1VOmvt/KTQM8NqR/vUiipYEToAcyySOqa3/9aP1P//9NzUvEWEIQDQ4BhaRAYTAgpUZo8eQ/////0QSAILD0jn/1xFnAwtt113zYAAMzdaOhBLJKEuThpEpskoI3MqQUUCZEGVKYdGgRQqToULGEcAsDJAE0tb//s/dbf7PqWO7r2bMQE4BAAJjibRPVgbK1JVNMrq1klYEhp68sGm0+puYl8of9yC05t0gdkJl6nFdoljA8rR/1LZ0VP+ff/7kETcAASMWFl7A60oOqRJfVBmDw51YVHtjrSA5w/l9UCM/GYHTUXOI8AwmkAC1mCwHGZLZBDjfrf////6i4H+GNH0MaHqhb0BgoBiBoLJuBj0AOCIFwFgGkDKBcc5////9iLAkAUA4nAZMHAvrT1HQSAAGYNhfrt//v9AAADI0iAKFx1q0I+G58tNPNKyhBKh346h8HkJoeKypmuaLf/6o797axACEAFAZuvay1mcSX5cVSbR/2a3lyX48/cC7+XyTPKJjgCMBToweFUrndtGp88+i////oLY3HIAzkAJtClycNy4r/T/////WRpcN6xXAHgMDQTBAKG4swrGhuZ/////6IX7BxBHwa/8XxEXG2F13930YAAMrQCAgA4DIOSXwnDGlHy4caeZucKB10AEbOr1n8URBgolKgHQpYoopG//b93/+lRv+966QAFADQARh9g0oZEnOpPKNKAJou6yhQOE5S9+N1KF2InGGVgwENN3h97gSa2xjeb///2oJmBuQAA06gYdBgyajNBD/b////9cni6XhcwcSCYIArCgAv/7kETdggSEWFL7dbVIKsMZnVAjCw3ZYU/uSrTA35CmNUCMPA0OaRxiyH////9BMOVChJGeP/8dQ23B1V3dneP/6AAAY6lxS6oWawZBT8TC5IJJYX0ST2ulzpjJSXsa0v5Yw22rg3/v9muADABsAKEe9T1NQjJME8ZXCrVPBL7tbfR94MuyCFyjPCD21NBqThQxCl+oyKKGXM3//+26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";
var media_down = "data:audio/mp3;base64,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fLqSSS0TM8Uj5dSJlR5zQ+cZlJJLRlg3PLUapJLMVGyaNFa/+pFF10HRVWs8lWYnnq//Zmra/62NGSOnVsYqA5WJWGKFZ0Z2nsYAAAAAA7Ksr7SlTP3DaVaOiXz6xKXOqYhUuoLOAGgxfhnTLmJsLQd/hPmcoibIxtYFEsRsWYj0evGhUmq/bDqVOPX2bmX/+0V3////48XI8mhMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+3Bk+oAF2FzP/nJAgFwESb/MPAAAAAH+HAAAIAAAP8OAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";