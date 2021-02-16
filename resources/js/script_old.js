class LRU{
    constructor(page_size){
        this.queue = []
        this.history = []
        this.page_size = page_size

        this.page = []
        this.changeHistory = []

        for(let i=0; i<page_size;i++){
            this.page.push(' ')
            this.changeHistory.push(i)
        }
    }

    setPage(page){
        this.page = page
        this.page_size = page.length
        this.changeHistory = []
    }

    _getNearestElement(list, start, items){
        let retC = start
        let retVal = 1000
        let done = false
        let curItem = ''

        let i2 = 0

        for(let item in items){
            curItem = items[item]
            done = false

            for(let i=start; i>= 0; i--){
                if (list[i] == curItem){
                    done = true
                    if (retC > i){
                        retC = i
                        retVal = item
                    }
                    break
                }
            }
            if (done){
                continue
            }
            for(let i=list.length; i> start; i--){
                if (list[i] == curItem){
                    done = true
                    i2 = start-(list.length - item)
                    if (retC > i2){
                        retC = i2
                        retVal = item
                    }
                    break
                }
            }

            if (!list.includes(item)){
                retC = -1000
                retVal = item
                continue
            }
            
        }

        return retVal
    }

    process(){

        let item = '_'
        let loc = 0

        this.history.push([0, ' ', [...this.page]])

        let pageFaults = 0
        

        for(let i=0; i<this.queue.length;i++){

            item = this.queue[i]

            if (! this.page.includes(item)){ // if item is not in page
                if (this.changeHistory.length > 0){
                    loc = this.changeHistory.shift()
                }
                else{
                    loc = this._getNearestElement(this.queue, i, this.page)
                }

                pageFaults += 1
                
                this.page[loc] = item;

            }

            this.history.push([i+1, item, [...this.page]])

        }

        console.log("Page Faults: ", pageFaults)
    }

    addQueue(x){
        this.queue.push(x)
    }

    addQueueList(x){
        this.queue = this.queue.concat(x)
    }
}

let process_lru = new LRU(3)
process_lru.setPage(['8', '4', '3'])
process_lru.addQueueList("1 2 3 4 5 6 7 9".split(" "))

process_lru.process()
for(let item in process_lru.history){
    console.log(process_lru.history[item])
}