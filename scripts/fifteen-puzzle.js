let side_len = parseInt(localStorage.getItem('side_len')) || 4;
let puzzle_size = side_len * side_len;
let solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
let puzzle_state = solved_state.slice();
let empty_slot_index = puzzle_size - 1;
let solved = true;
let timer_on = false;
var timer;
let avgs = [];
let avg_lens = [5, 12, 25];
let avg_len = parseInt(localStorage.getItem('avg_len')) || 5;
let move_counts = JSON.parse(localStorage.getItem('move_counts'+side_len)) || [];
let times = JSON.parse(localStorage.getItem('times'+side_len)) || [];
let move_count = 0;
let moves_per_second = [];
let display_move_count = JSON.parse(localStorage.getItem('display_move_count'))
if (display_move_count == null){
    display_move_count = true;
}

//we store DNFs as infinities, which get converted to null in JSONs, so we need to convert them back
function parse_times(times){
    let res = [];
    for(let i = 0; i < times.length; i++){
        let elt = times[i];
        if(elt == null){
            res.push(Infinity);
        }else{
            res.push(elt);
        }
    }
    return(res);
}

times = parse_times(times);

// fifteen puzzle mechanics
function draw_puzzle(){
    grid = document.querySelector('.puzzle-grid')
    grid.innerHTML = "";
    for (i=0; i < puzzle_size; i++){
        elt = puzzle_state[i];
        if (elt == puzzle_size) {
            grid.innerHTML += "<div class='empty-slot'></div>";
        }
        else {
            grid.innerHTML += `<div class = 'puzzle-tile'>${elt}</div>`;
        }
    }
}

function moveUp(){
    if (empty_slot_index < puzzle_size - side_len){
        swap(puzzle_state, empty_slot_index, (empty_slot_index + side_len));
        empty_slot_index = empty_slot_index + side_len;
        move_count++;
    }
}

function moveDown(){
    if (empty_slot_index >= side_len){
        swap(puzzle_state, empty_slot_index, (empty_slot_index - side_len));
        empty_slot_index = empty_slot_index - side_len;
        move_count++;
    }
}

function moveRight(){
    if (empty_slot_index % side_len != 0){
        swap(puzzle_state, empty_slot_index, (empty_slot_index - 1));
        empty_slot_index = empty_slot_index - 1;
        move_count++;
    }
}
 
function moveLeft(){
    if (empty_slot_index % side_len != (side_len - 1)){
        swap(puzzle_state, empty_slot_index, (empty_slot_index + 1));
        empty_slot_index = empty_slot_index + 1;
        move_count++;
    }
}

function swap(arr, i1, i2){
    let buffer = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = buffer;
}

function shuffle_puzzle(){
    puzzle_state = solved_state.slice()
    parity = 0;
    for(i = 0; i < puzzle_size - 1; i++){
        n_choices = puzzle_size - i;
        i2 = Math.floor(Math.random() * n_choices) + i
        if(i != i2){
            swap(puzzle_state, i, i2);
            parity += 1;
        }
    }
    empty_slot_index = puzzle_state.indexOf(puzzle_size);
    parity += get_taxicab_distance(empty_slot_index);
    if ((parity % 2) == 1){
        swap(puzzle_state, puzzle_state.indexOf(1), puzzle_state.indexOf(2));
    }
    draw_puzzle();
}

function get_taxicab_distance(empty_index){
    horizontal_distance = side_len - (empty_index % side_len) + 1;
    vertical_distance = side_len - (Math.floor(empty_index / side_len)) + 1;
    return(horizontal_distance + vertical_distance);
}

function reset_puzzle(){
    reset_timer();
    shuffle_puzzle();
    solved = false;
    move_count = 0;
    draw_move_count();
}

function draw_grid(){
    grid = document.querySelector('.puzzle-grid');
    grid.style['grid-template-columns'] = `repeat(${side_len}, 82px)`;
    grid.style['grid-template-rows'] = `repeat(${side_len}, 82px)`;
    grid.style.width = `${82*side_len}px`;
    draw_puzzle();
}

function update_size(){
    side_len = parseInt(document.querySelector('.js-size-input').value);
    side_len = side_len;
    side_len = side_len;
    localStorage.setItem('side_len', side_len);
    puzzle_size = side_len * side_len;
    solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
    puzzle_state = solved_state.slice();
    empty_slot_index = puzzle_size - 1;
    draw_grid()

    //change time list
    times = JSON.parse(localStorage.getItem('times'+side_len)) || [];
    times = parse_times(times);
    recalculate_avgs();

    //change move counts
    move_counts = JSON.parse(localStorage.getItem('move_counts'+side_len)) || [];
    recalculate_mps();

    draw_time_list();
    update_bests();
}

//key handling
function keyhandler(event){
    move_keys = ['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
    for(i = 0; i < move_keys.length; i++){
        if(event.key == move_keys[i]){
            do_move(event);
            break;
        }
    }
    if (event.key == ' '){
        reset_puzzle();
    }
}

function do_move(event){
    if ((event.key == 'ArrowUp') || event.key == ('w')){
        moveUp();
    } else if ((event.key == 'ArrowDown') || event.key == ('s')){
        moveDown();
    } else if ((event.key == 'ArrowLeft') || event.key == ('a')){
        moveLeft();
    } else if ((event.key == 'ArrowRight') || event.key == ('d')){
        moveRight();
    }
    if(!(solved || timer_on)){
        start_timer();
    }
    if(!solved){
        solved = puzzle_state.toString() == solved_state.toString();
    }
    draw_puzzle();
    draw_move_count();
}

document.addEventListener('keydown', keyhandler);

//timer functionalities
function start_timer(){
    var time_cs = 0;
    timer_on = true;
    timer = setInterval(function(){
        time_str = time_cs_to_string(time_cs, true);
        document.querySelector('.timer').innerHTML=time_str;
        if (solved) {
            clearInterval(timer);
            timer_on = false;
            add_solve(time_cs);
        }
        time_cs++;
        }, 10);
}

function reset_timer(){
    if(timer_on){
        clearInterval(timer);
        timer_on =  false;;
        document.querySelector('.timer').innerHTML=`            DNF  `;
        add_solve(Infinity);
    }
    clearInterval(timer);
    timer_on =  false;;
}

function time_cs_to_string(time_cs, fixed_len){
    if(time_cs == Infinity){
        return('DNF');
    }
    let time_s = Math.floor(time_cs / 100);
    let cs_display = (time_cs % 100).toString().padStart(2,"0");

    if(fixed_len || time_s > 60){
        let time_min = Math.floor(time_s / 60);
        let s_display = (time_s % 60).toString().padStart(2,"0");
        let min_display = time_min.toString().padStart(2,"0");
        return(`${min_display}:${s_display}.${cs_display}`);
    } 
    else {
        return(`${time_s}.${cs_display}`);
    }
}

function add_solve(time_cs){
    move_counts.push(move_count);
    localStorage.setItem('move_counts'+side_len, JSON.stringify(move_counts));
    times.push(time_cs);
    localStorage.setItem('times'+side_len, JSON.stringify(times));
    moves_per_second.push(Math.floor(move_count / time_cs * 10000) / 100);
    add_avg(times.length-1);
    draw_one_time(times.length-1);
    update_bests(times.length);
}

//time list functionalities

function avg_to_string(avg){
    if((avg == Infinity)){
        return('DNF');
    } else if (avg == ' - '){
        return(' - ');
    } else {
        return(time_cs_to_string(avg, false));
    }
}

function add_avg(i){
    if(i < avg_len-1){
        avgs.push(' - ');
    } else {;
        let avg = calculate_avg(times.slice(i-avg_len+1, i+1));
        avgs.push(avg);
    }
}

function calculate_avg(some_times){
    let times_copy = some_times.slice()
    let len = times_copy.length;
    let cut_size = Math.max(1,Math.floor(len / 10));
    //default sort() does alphabetical order, so we need to use an anonymous function to get numerical sort
    middle_times = times_copy.sort((a, b) => a - b).slice(cut_size,len-cut_size);
    sum = middle_times.reduce((a,b) => a+b, 0);
    avg = Math.round(sum / (len-(2*cut_size)));
    return(avg);
}

function mps_to_string(mps){
    let mps_str = mps.toString();
    if(mps * 100 % 100 == 0){
        mps_str += ".00";
    } else if (mps * 100 % 10 == 0){
        mps_str += "0";
    }
    return(mps_str)
}

function draw_one_time(i){
    let time_list = document.querySelector('.time-list-items');
    let old_items = time_list.innerHTML;
    let time_str = time_cs_to_string(times[i], false);
    let avg_str = avg_to_string(avgs[i]);
    let new_item = `<div class = \'time-list-item\'>${i+1}</div>`;
    new_item += `<div class = \'time-list-item\'>${time_str}</div>`;
    new_item += `<div class = \'time-list-item\'>${avg_str}</div>`;
    if(display_move_count){
        new_item += `<div class = \'time-list-item\'>${move_counts[i]}</div>`;
    } else {
        let mps_str = mps_to_string(moves_per_second[i])
        new_item += `<div class = \'time-list-item\'>${mps_str}</div>`;
    }
    new_item += `<div class = \'time-list-item\'> \
                    <img class = 'x-button-puzzle' src = 'images/x-icon.svg' onclick = 'delete_solve(${i})'></img>\
                </div>`
    time_list.innerHTML = new_item + old_items;
}

function draw_time_list(){
    time_list = document.querySelector('.time-list-items');
    time_list.innerHTML = '';
    for(let i = 0; i < times.length; i++){
        draw_one_time(i);
    }
}

function clear_times(){
    delete_times = confirm('Delete all times?')
    if(delete_times){
        move_counts = [];
        times = [];
        avgs = [];
        moves_per_second = [];
        localStorage.setItem('move_counts'+side_len, JSON.stringify(times));
        localStorage.setItem('times'+side_len,JSON.stringify(times));
        draw_time_list();
        update_bests();
    }
}

function delete_solve(idx){
    delete_one_time = confirm('Delete one time?')
    if(delete_one_time){
        let arr1 = times.slice(0,idx);
        let arr2 = times.slice(idx+1);
        times = arr1.concat(arr2);
        localStorage.setItem('times'+side_len,JSON.stringify(times));
        let arr3 = move_counts.slice(0,idx);
        let arr4 = move_counts.slice(idx+1);
        move_counts = arr3.concat(arr4);
        localStorage.setItem('move_counts'+side_len,JSON.stringify(move_counts));
        recalculate_avgs();
        recalculate_mps();
        draw_time_list();
    }
}

function recalculate_avgs(){
    avgs = [];
    for(let i = 0; i < times.length; i++){
        add_avg(i);
    }
    update_bests();
}

function recalculate_mps(){
    moves_per_second = []
    for(let i = 0; i < times.length; i++){
        mps = Math.floor(move_counts[i] / times[i] * 10000) / 100;
        moves_per_second.push(mps);
    }
}

function update_bests(){
    if(times.length > 0){
        best_single = Math.min(...times);
        best_single_str = time_cs_to_string(best_single, false);
        document.getElementById("best-single").innerHTML = `Best time: ${best_single_str}`;
    } else {
        document.getElementById("best-single").innerHTML = "Best time: - ";
    }
    if(times.length >= 3){
        session_avg = calculate_avg(times);
        session_avg_str = time_cs_to_string(session_avg, false)
        document.getElementById("session-average").innerHTML = `Session average: ${session_avg_str}`;
    } else {
        document.getElementById("session-average").innerHTML = "Session average: - ";
    }
    if(times.length >= avg_len){
        best_avg = Math.min(...avgs.slice(avg_len-1)); // this calculates minimum over heterogenous list, need to fix
        best_avg = avg_to_string(best_avg);
        document.getElementById("best-average").innerHTML = `Best ao${avg_len}: ${best_avg}`;
    } else {
        document.getElementById("best-average").innerHTML = `Best ao${avg_len}: - `;
    }
}

function change_avg_len(){
    idx = avg_lens.indexOf(avg_len);
    avg_len = avg_lens[(idx + 1) % avg_lens.length];
    localStorage.setItem('avg_len', avg_len);
    recalculate_avgs();
    draw_time_list();
    document.getElementById('avgs-header').innerHTML = `Ao${avg_len}`;
}

function change_move_count_mps(){
    if(display_move_count){
        display_move_count = false;
        document.getElementById('moves-header').innerHTML = `MPS`;
    } else {
        display_move_count = true;
        document.getElementById('moves-header').innerHTML = `Moves`;
    }
    localStorage.setItem('display_move_count', JSON.stringify(display_move_count));
    console.log('stored');
    console.log(localStorage.getItem('display_move_count'));
    draw_time_list();
}
// move count functionalities
function draw_move_count(){
    document.querySelector('.move-count').innerHTML=move_count;
}