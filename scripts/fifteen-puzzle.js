let n_cols = 4;
let n_rows = 4;
let puzzle_size = n_cols * n_rows;
let solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
let puzzle_state = solved_state.slice();
let empty_slot_index = puzzle_size - 1;
let solved = true;
let timer_on = false
var timer;
//localStorage.setItem('times', JSON.stringify([]))
let times = JSON.parse(localStorage.getItem('times')) || [];

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
    return((horizontal_distance + vertical_distance) % 2);
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
    time_str = time_cs_to_string(time_cs, false);
    times.push(time_cs);
    console.log(`time before: ${times}`)
    localStorage.setItem('times', JSON.stringify(times))
    console.log(`time after: ${times}`)
    draw_one_time(times.length-1)
}

function draw_time_list(){
    time_list = document.querySelector('.time-list-items')
    time_list.innerHTML = ''
    for(let i = 0; i < times.length; i++){
        draw_one_time(i)
    }
}

function draw_one_time(i){
    let time_list = document.querySelector('.time-list-items');
    let old_items = time_list.innerHTML;
    let time = times[i]
    let time_str = time_cs_to_string(time, false);
    let new_item = `<div class = \'time-list-item\'>${i+1}</div>`
    new_item += `<div class = \'time-list-item\'>${time_str}</div>`
    //time_list.innerHTML += `<div class = \'time-list-item\'>${i+1}</div>`
    //time_list.innerHTML += `<div class = \'time-list-item\'>${time_str}</div>`;
    if(i >= 4){
        let ao5 = get_ao5(times.slice(i-4, i+1));
        let ao5_string = time_cs_to_string(ao5, false)
        new_item += `<div class = \'time-list-item\'>${ao5_string}</div>`
    }
    else {
        new_item += `<div class = \'time-list-item\'>  -  </div>`
    }
    new_item += `<div class = \'time-list-item\'> \
                    <img class = 'x-button-puzzle' src = 'images/x-icon.svg' onclick = 'delete_time(${i})'></img>\
                </div>`
    time_list.innerHTML = new_item + old_items;
}

function get_ao5(recent_5){
    sum = recent_5.reduce((a,b) => a+b, 0);
    sum -= Math.max(...recent_5);
    sum -= Math.min(...recent_5);
    ao5 = Math.round(sum / 3);
    return(ao5)
}

function clear_times(){
    times = []
    localStorage.setItem('times',JSON.stringify(times))
    draw_time_list()
}

function delete_time(idx){
    arr1 = times.slice(0,idx)
    arr2 = times.slice(idx+1)
    times = arr1.concat(arr2)
    draw_time_list()
}