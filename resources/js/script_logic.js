class Page{
    constructor(content,tick=0){
        this.content = content
        this.tick = tick
    }

    tick_clock(val=1){
        this.tick += val
    }

    change(content, tick=0){
        this.content = content
        this.tick = tick
    }

    getString(){
        return this.content
    }
}

class FIFO{
    constructor(pagesize, filler='_') {

        this.page_fault = 0

        this.pageFrame = []

        this.currentInput = 0

        for(let i = 0; pagesize > i; i++){
            this.pageFrame.push(new Page(filler))
            this.pageFrame[i].tick = pagesize - i
        }

        this.inputList = []

        this.history = []

        this._log_history('_', false)
    }

    _set_frames(){
        //container class only
    }

    getinput_string(input){
        this.inputList = this.inputList.concat(input.split(" "))

        this._set_frames()
    }

    getinput_list(input){
        this.inputList = this.inputList.concat(input)

        this._set_frames()
    }

    _get_last(){
        let retIndex = -1
        let mostLeast = -1
        for (let p=0; p<this.pageFrame.length; p++){
            if (this.pageFrame[p].tick > mostLeast){
                mostLeast = this.pageFrame[p].tick
                retIndex = p
            }
        }

        return retIndex
    }

    _check_exist(item){
        let retIndex = -1

        for (let p=0; p<this.pageFrame.length; p++){
            if (this.pageFrame[p].content === item){
                retIndex = p
                break
            }
        }

        return retIndex
    }

    _tick_all(){
        for (let p=0; p<this.pageFrame.length; p++){
            this.pageFrame[p].tick_clock()
        }
    }

    _get_frame_string(){
        let fr_str = []
        for (let p=0; p<this.pageFrame.length; p++){
            fr_str.push(this.pageFrame[p].getString())
        }

        return fr_str
    }

    _get_frame_health(){
        let fr_str = []
        for (let p=0; p<this.pageFrame.length; p++){
            fr_str.push(this.pageFrame[p].tick)
        }

        return fr_str
    }

    _log_history(input, change){
        if (change){
            this.page_fault += 1
        }
        let data = {
            step: this.currentInput, 
            input: input, 
            page: this._get_frame_string(),
            page_health: this._get_frame_health(),
            changed: change,
            page_fault: this.page_fault
        }

        data.page_health_worst = Math.max(...data["page_health"])

        this.history.push(
            data
        )

        return data
    }

    page_step(){

        if (this.currentInput >= this.inputList.length){
            return false
        }

        let currentData = this.inputList[this.currentInput]

        let exist = this._check_exist(currentData)

        let index_to_change = 0

        let change = false

        if (exist == -1){ // item not exist
            index_to_change = this._get_last()
            this.pageFrame[index_to_change].change(currentData)
            change = true
        }

        this.currentInput += 1
        this._tick_all()
        
        let log = this._log_history(currentData, change)

        return log
    }

    page_run(){
        for(let i=this.currentInput; i < this.inputList.length; i++){
            this.page_step()
        }
    }
}

class LRU extends FIFO{
    constructor(pagesize, filler='_') {
        super(pagesize, filler)
        
    }


    page_step(){

        if (this.currentInput >= this.inputList.length){
            return false
        }

        let currentData = this.inputList[this.currentInput]

        let exist = this._check_exist(currentData)

        let index_to_change = 0

        let change = false

        if (exist == -1){ // item not exist
            index_to_change = this._get_last()
            this.pageFrame[index_to_change].change(currentData)
            change = true
        }
        else{
            this.pageFrame[exist].change(currentData)
        }

        this.currentInput += 1
        this._tick_all()
        
        let log = this._log_history(currentData, change)

        return log
    }

}

class Optimal extends FIFO{
    constructor(pagesize, filler='_') {

        super(pagesize, filler)

        this.max = 1000

        this.page_fault = 0

        this.pagesize = pagesize
        this.filler = filler

        this.pageFrame = []

        this.currentInput = 0

        for(let i = 0; pagesize > i; i++){
            this.pageFrame.push(new Page(filler))
            this.pageFrame[i].tick = pagesize - i
        }

        this.inputList = []

        this.history = []

        this._log_history('_', false)
        
    }

    _tick_all(){
        for (let p=0; p<this.pageFrame.length; p++){
            this.pageFrame[p].tick_clock(-1)
        }
    }

    _get_last(){
        let retIndex = -1
        let mostLeast = -10000
        for (let p=0; p<this.pageFrame.length; p++){
            if (this.pageFrame[p].tick > mostLeast){
                mostLeast = this.pageFrame[p].tick
                retIndex = p
            }
        }

        return retIndex
    }

    _set_frames(){
        this.max = this.inputList.length

        this.pageFrame = []
        
        for(let i = 0; this.pagesize > i; i++){
            this.pageFrame.push(new Page(this.filler))
            this.pageFrame[i].tick = (this.max - i)*1.5
        }

    }

    _get_next_occurence(target){
        let index = this.inputList.indexOf(target,this.currentInput+1)

        if (index !== -1){
            return index - this.currentInput
        }

        index = this.inputList.indexOf(target)

        if (index !== -1){
            return (this.inputList.length - this.currentInput) + index
        }
        else{
            return this.inputList.length
        }

    }


    page_step(){

        if (this.currentInput >= this.inputList.length){
            return false
        }

        let currentData = this.inputList[this.currentInput]
        let nextOccurence = this._get_next_occurence(currentData)

        let exist = this._check_exist(currentData)

        let index_to_change = 0

        let change = false


        if (exist == -1){ // item not exist
            index_to_change = this._get_last()
            this.pageFrame[index_to_change].change(currentData, nextOccurence)
            change = true
        }
        else{
            this.pageFrame[exist].change(currentData, nextOccurence)
        }

        this.currentInput += 1
        this._tick_all()
        
        let log = this._log_history(currentData, change)

        return log
    }

}

x = {
    lru: LRU,
    fifo: FIFO,
    optimal: Optimal,
}

p_lru = new x.optimal(3, '')

input = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1'.split(" ")
//input = '1 2 3 4 1 2 5 1 2 3 4 5'.split(" ")    
//input = '5 7 6 5 7 3'.split(" ")
p_lru.getinput_list(input)
p_lru.page_run()
console.log(p_lru.history)




/*
for(let i = 0; i < input.length; i++){
    console.log(p_lru.page_step())
}
*/

