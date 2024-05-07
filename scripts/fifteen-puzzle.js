let n_cols = 4;
let n_rows = 4;
let puzzle_size = n_cols * n_rows;
let solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
let puzzle_state = solved_state.slice();
let empty_slot_index = puzzle_size - 1;
let solved = true;
let timer_on = false
var timer;


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

function keyhandler(event){
    console.log()
    console.log(event.key);
    move_keys = ['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
    console.log(move_keys.length);
    for(i = 0; i < move_keys.length; i++){
        if(event.key == move_keys[i]){
            do_move(event)
            break;
        }
    }
    if (event.key == ' '){
        shuffle_puzzle()
    }
}

function do_move(event){
    if ((event.key == 'ArrowUp') || event.key == ('w')){
        moveUp()
    } else if ((event.key == 'ArrowDown') || event.key == ('s')){
        moveDown()
    } else if ((event.key == 'ArrowLeft') || event.key == ('a')){
        moveLeft()
    } else{
        moveRight()
    }
    if(!(solved || timer_on)){
        start_timer()
    }
    if(!solved){
        solved = puzzle_state.toString() == solved_state.toString()
    }
    draw_puzzle()
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
    grid.style.width = `${82*n_cols}px`
    draw_puzzle()
}

function update_size(){
    console.log('update_size')
    n_rows = parseInt(document.querySelector('.js-row-input').value)
    n_cols = parseInt(document.querySelector('.js-col-input').value)
    puzzle_size = n_cols * n_rows;
    solved_state = Array.from({ length: puzzle_size }, (_, index) => index + 1);
    puzzle_state = solved_state.slice();
    empty_slot_index = puzzle_size - 1
    draw_grid()
}

function start_timer(){
    var time_cs = 0;
    timer_on = true
    timer = setInterval(function(){
        time_s = Math.floor(time_cs / 100)
        time_min = Math.floor(time_s / 60)
        cs_display = (time_cs % 100).toString().padStart(2,"0")
        s_display = (time_s % 60).toString().padStart(2,"0")
        min_display = time_min.toString().padStart(2,"0")
        document.querySelector('.timer').innerHTML=`${min_display}:${s_display}.${cs_display}`;
        time_cs++;
        if (solved) {
            clearInterval(timer);
            timer_on = false
            console.log('solved')
        }
        }, 10);
}

document.addEventListener('keydown', keyhandler)