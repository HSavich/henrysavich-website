let n_cols = 4;
let n_rows = 4;
let puzzle_size = n_cols * n_rows;
let solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
let puzzle_state = solved_state.slice();
let empty_slot_index = puzzle_size - 1;
let solved = true;
let timer_on = false
var timer;
let avgs = [];
let avg_lens = [5, 12, 25];
let avg_len = parseInt(localStorage.getItem('avg_len') || 5);

//we store DNFs as infinities, which get converted to null in JSONs, so we need to convert them back
let times = JSON.parse(localStorage.getItem('times')) || [];
let res = []
for(let i = 0; i < times.length; i++){
    let elt = times[i];
    if(elt == null){
        res.push(Infinity);
    }else{
        res.push(elt);
    }
}
times = res;

// fifteen puzzle mechanics
function draw_puzzle(){
    grid = document.querySelector('.puzzle-grid')
    grid.innerHTML = ""
    for (i=0; i < puzzle_size; i++){
        elt = puzzle_state[i];
        if (elt == puzzle_size) {
            grid.innerHTML += "<div class='empty-slot'></div>"
        }
        else {
            grid.innerHTML += `<div class = 'puzzle-tile'>${elt}</div>`
        }
    }
}

function moveUp(){
    if (empty_slot_index < puzzle_size - n_cols){
        swap_index = empty_slot_index + n_cols
        swap(puzzle_state, empty_slot_index, swap_index)
        empty_slot_index = swap_index
    }
}

function moveDown(){
    if (empty_slot_index >= n_cols){
        swap_index = empty_slot_index - n_cols
        swap(puzzle_state, empty_slot_index, swap_index)
        empty_slot_index = swap_index
    }
}

function moveRight(){
    if (empty_slot_index % n_cols != 0){
        swap_index = empty_slot_index - 1
        swap(puzzle_state, empty_slot_index, swap_index)
        empty_slot_index = swap_index
    }
}

function moveLeft(){
    if (empty_slot_index % n_cols != (n_cols - 1)){
        swap_index = empty_slot_index + 1
        swap(puzzle_state, empty_slot_index, swap_index)
        empty_slot_index = swap_index
    }
}

function swap(arr, i1, i2){
    buffer = arr[i1];
    arr[i1] = arr[i2]
    arr[i2] = buffer
}


function shuffle_puzzle(){
    if(timer_on){
        clearInterval(timer)
        timer_on =  false;
        document.querySelector('.timer').innerHTML=`            DNF  `
        add_time(Infinity)
    }
    clearInterval(timer)
    timer_on =  false;
    solved = false
    puzzle_state = solved_state.slice()
    parity = 0
    for(i = 0; i < puzzle_size - 1; i++){
        n_choices = puzzle_size - i;
        i2 = Math.floor(Math.random() * n_choices) + i
        if(i != i2){
            swap(puzzle_state, i, i2)
            parity += 1
        }
    }
    empty_slot_index = puzzle_state.indexOf(puzzle_size);
    parity += get_taxicab_distance(empty_slot_index);
    if ((parity % 2) == 1){
        swap(puzzle_state, puzzle_state.indexOf(1), puzzle_state.indexOf(2));
    }
    draw_puzzle()
    solved = false
}

function get_taxicab_distance(empty_index){
    horizontal_distance = n_cols - (empty_index % n_cols) + 1;
    vertical_distance = n_rows - (Math.floor(empty_index / n_cols)) + 1;
    return(horizontal_distance + vertical_distance);
}

function draw_grid(){
    grid = document.querySelector('.puzzle-grid')
    grid.style['grid-template-columns'] = `repeat(${n_cols}, 82px)`;
    grid.style['grid-template-rows'] = `repeat(${n_rows}, 82px)`;
    grid.style.width = `${82*n_cols}px`;
    draw_puzzle()
}

function update_size(){
    n_rows = parseInt(document.querySelector('.js-row-input').value);
    n_cols = parseInt(document.querySelector('.js-col-input').value);
    puzzle_size = n_cols * n_rows;
    solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
    puzzle_state = solved_state.slice();
    empty_slot_index = puzzle_size - 1;
    draw_grid()
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
        shuffle_puzzle();
    }
}

function do_move(event){
    if ((event.key == 'ArrowUp') || event.key == ('w')){
        moveUp();
    } else if ((event.key == 'ArrowDown') || event.key == ('s')){
        moveDown();
    } else if ((event.key == 'ArrowLeft') || event.key == ('a')){
        moveLeft();
    } else{
        moveRight();
    }
    if(!(solved || timer_on)){
        start_timer();
    }
    if(!solved){
        solved = puzzle_state.toString() == solved_state.toString();
    }
    draw_puzzle()
}

document.addEventListener('keydown', keyhandler)

//timer functionalities
function time_cs_to_string(time_cs, fixed_len){
    if(time_cs == Infinity){
        return('DNF')
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
        return(`${time_s}.${cs_display}`)
    }
}

function avg_to_string(avg){
    if((avg == Infinity)){
        return('DNF')
    } else if (avg == ' - '){
        return(' - ')
    } else {
        return(time_cs_to_string(avg, false))
    }
}

function start_timer(){
    var time_cs = 0;
    timer_on = true;
    timer = setInterval(function(){
        time_str = time_cs_to_string(time_cs, true);
        document.querySelector('.timer').innerHTML=time_str;
        if (solved) {
            clearInterval(timer);
            timer_on = false;
            add_time(time_cs);
        }
        time_cs++;
        }, 10);
}

function add_time(time_cs){
    times.push(time_cs);
    localStorage.setItem('times', JSON.stringify(times))
    add_avg(times.length-1)
    draw_one_time(times.length-1)
    update_bests(times.length)
}

function add_avg(i){
    if(i < avg_len-1){
        avgs.push(' - ')
    } else {;
        let avg = calculate_avg(times.slice(i-avg_len+1, i+1));
        avgs.push(avg)
    }
}

function calculate_avg(recent_times){
    recent_times = recent_times.sort((a,b) => a-b)
    windsorized_times = recent_times.slice(1,-1)
    sum = windsorized_times.reduce((a,b) => a+b, 0);
    avg = Math.round(sum / (avg_len-2));
    return(avg)
}

function draw_one_time(i){
    let time_list = document.querySelector('.time-list-items');
    let old_items = time_list.innerHTML;
    let time_str = time_cs_to_string(times[i], false);
    let avg_str = avg_to_string(avgs[i])
    let new_item = `<div class = \'time-list-item\'>${i+1}</div>`
    new_item += `<div class = \'time-list-item\'>${time_str}</div>`
    new_item += `<div class = \'time-list-item\'>${avg_str}</div>`
    new_item += `<div class = \'time-list-item\'> \
                    <img class = 'x-button-puzzle' src = 'images/x-icon.svg' onclick = 'delete_time(${i})'></img>\
                </div>`
    time_list.innerHTML = new_item + old_items;
}

function draw_time_list(){
    time_list = document.querySelector('.time-list-items')
    time_list.innerHTML = ''
    for(let i = 0; i < times.length; i++){
        draw_one_time(i)
    }
}

function clear_times(){
    times = []
    localStorage.setItem('times',JSON.stringify(times))
    avgs = []
    draw_time_list()
    update_bests()
}

function delete_time(idx){
    let arr1 = times.slice(0,idx);
    let arr2 = times.slice(idx+1);
    times = arr1.concat(arr2)
    localStorage.setItem('times',JSON.stringify(times))
    recalculate_avgs()
    draw_time_list()
}

function recalculate_avgs(){
    avgs = []
    for(let i = 0; i < times.length; i++){
        add_avg(i)
    }
    update_bests()
}

function update_bests(){
    if(times.length > 0){
        best_single = Math.min(...times);
        best_single_str = time_cs_to_string(best_single, false)
        document.getElementById("best-single").innerHTML = `Best time: ${best_single_str}`
    } else {
        document.getElementById("best-single").innerHTML = "Best time: - "
    }
    if(times.length >= avg_len){
        best_avg = Math.min(...avgs.slice(avg_len-1)) // this calculates minimum over heterogenous list, need to fix
        best_avg = avg_to_string(best_avg)
        document.getElementById("best-average").innerHTML = `Best ao${avg_len}: ${best_avg}`
    } else {
        document.getElementById("best-average").innerHTML = `Best ao${avg_len}: - `
    }
}

function change_avg_len(){
    idx = avg_lens.indexOf(avg_len)
    avg_len = avg_lens[(idx + 1) % avg_lens.length]
    localStorage.setItem('avg_len', avg_len)
    recalculate_avgs()
    draw_time_list()
    document.getElementById('avgs-header').innerHTML = `Ao${avg_len}`
}