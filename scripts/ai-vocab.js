var next_student_id = 0
var next_vocab_id = 0

localStorage.setItem('students_objs', JSON.stringify({}))
localStorage.setItem('vocab_objs', JSON.stringify({}))

function add_input_listeners(){
    document.querySelector('.js-name-input').addEventListener("keypress", name_input_keydown)
    document.querySelector('.js-interests-input').addEventListener("keypress", interests_input_keydown)
    document.querySelector('.js-vocab-input').addEventListener("keypress", vocab_input_keydown)
}
function add_student() {
    // collect inputs from input fields
    name_input = document.querySelector('.js-name-input');
    name = name_input.value;
    interests_input = document.querySelector('.js-interests-input');
    interests = interests_input.value;

    //clear input fields
    name_input.value = "";
    interests_input.value = "";

    // make new student object, add it to local storage
    if(name === ""){
        name = "Student " + (next_student_id + 1)
    }
    new_student = {'student_id':next_student_id, 'name':name,'interests':interests};
    next_student_id = next_student_id + 1;
    students_objs = JSON.parse(localStorage.getItem('students_objs'));
    students_objs[new_student.student_id] = new_student
    localStorage.setItem('students_objs', JSON.stringify(students_objs))
    render_students()
}

function add_vocab_word() {
    // collect inputs from input fields
    vocab_input = document.querySelector('.js-vocab-input');
    vocab = vocab_input.value;

    //clear input fields
    vocab_input.value = "";

    // make new student object, add it to local storage
    if(vocab !== ""){
        new_vocab = {'vocab_id':next_vocab_id, 'vocab_word':vocab};
        next_vocab_id = next_vocab_id + 1;
        vocab_objs = JSON.parse(localStorage.getItem('vocab_objs'));
        vocab_objs[new_vocab.vocab_id] = new_vocab
        localStorage.setItem('vocab_objs', JSON.stringify(vocab_objs))
        render_vocab()
    }
}


function render_students(){
    students_objs = JSON.parse(localStorage.getItem('students_objs'));
    keys = Object.keys(students_objs)
    let text = ""
    for (let i = 0; i < keys.length; i++) {
        student = students_objs[keys[i]]
        text = text + `<div class = 'js-student-info-badge student-info-badge'>${student.name}\
                            <img class = 'x-button' src = 'images/x-icon.svg' onclick = 'delete_student(${student.student_id})'></img>\
                            <img class = 'edit-button' src = 'images/edit-icon.svg'></img>\
                        </div>`
    }
    document.querySelector('.js-student-info-badge-list').innerHTML = text
}

function render_vocab(){
    vocab_objs = JSON.parse(localStorage.getItem('vocab_objs'));
    keys = Object.keys(vocab_objs)
    let text = ""
    for (let i = 0; i < keys.length; i++) {
        vocab = vocab_objs[keys[i]]
        text = text + `<div class = 'js-vocab-badge vocab-badge'>${vocab.vocab_word}\
                            <img class = 'x-button' src = 'images/x-icon.svg' onclick = 'delete_vocab(${vocab.vocab_id})'></img>\
                            <img class = 'edit-button' src = 'images/edit-icon.svg'></img>\
                        </div>`
    }
    document.querySelector('.js-vocab-badge-list').innerHTML = text
}

function name_input_keydown(event) {
    if( event.key === 'Enter'){
        document.querySelector(".interests-input").focus();
    }
}

function interests_input_keydown(event) {
    if( event.key === 'Enter'){
        add_student()
        document.querySelector(".name-input").focus();
    }
}

function vocab_input_keydown(event) {
    if( event.key === 'Enter'){
        add_vocab_word()
    }
}

function delete_student(id){
    students_objs = JSON.parse(localStorage.getItem('students_objs'));
    delete students_objs[id]
    localStorage.setItem('students_objs', JSON.stringify(students_objs))
    render_students()
}

function delete_vocab(id){
    vocab_objs = JSON.parse(localStorage.getItem('vocab_objs'));
    delete vocab_objs[id]
    localStorage.setItem('vocab_objs', JSON.stringify(vocab_objs))
    render_vocab()
}