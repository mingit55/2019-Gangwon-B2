class App {
    constructor(mainSelector){
        /* JSON init
        */
        this.color = {
            "A1" : "maroon",
            "A2" : "red",
            "A3" : "purple",
            "A4" : "fuchsia",
            "A5" : "green",
            "B1" : "lime",
            "B2" : "olive",
            "B3" : "navy",
            "B4" : "blue",
            "B5" : "teal",
            "C1" : "aqua",
            "C2" : "orange",
            "C3" : "chocolate",
            "C4" : "crimson",
            "C5" : "darkgray"
        };

        /* Prop init
        */
        this.selected = null;
        this.saveList = [];

        this.$root = document.querySelector(mainSelector);
        this.$contents = this.$root.querySelector(".contents");

        this.$selBooth = this.$root.querySelector("#booth-id");
        this.$outSize = this.$root.querySelector("#select-size span");
        this.$outColor = this.$root.querySelector("#booth-color");        

        this.$typeList = this.$root.querySelector(".type-list");
        this.$saveList = this.$root.querySelector(".save-list");

        this.$btnSave = this.$root.querySelector("#btn-save");
        this.$btnDelete = this.$root.querySelector("#btn-delete");

        this.canvasList = [];
        for(let i = 0; i < 4; i++){
            let item = new Canvas(this, {type: i, guide: false}).toImage();
            item.addEventListener("click", () => this.reset(i));
            item.addEventListener("load", () => {
                setTimeout(() => {
                    this.fadeAppend(this.$typeList, item);
                }, 200 * i);
            });
        }
        this.reset(0);

        /* Document Node init
        */
        Object.keys(this.color).forEach(x => {
            let option = document.createElement("option");
            option.innerText = option.value = x;
            this.$selBooth.append(option);
        })
        this.$selBooth.addEventListener("change", () => {
            let {value} = this.$selBooth;
            this.selected = value;
            this.$outColor.style.backgroundColor = this.selectedColor;
            if(value !== ""){
                let exist = this.current.boothList.find(booth => booth.text === value);
                this.$outSize.innerText = exist ? exist.bl_w * exist.bl_h : 0;
            }
        });

        this.$btnSave.addEventListener("click", e => {
            let obj = {};
            obj.type = this.current.type;
            obj.image = this.current.toImage();
            obj.boothList = this.current.boothList.map(({x, y, width, height, text}) => ({x, y, width, height, text}))
            obj.image.addEventListener("click", () => {
                let new_canvas = new Canvas(this, obj);
                this.changeCanvas(new_canvas);
            });

            this.saveList.push(obj);
            this.update();

            let new_canvas = new Canvas(this, {type: 0});
            this.changeCanvas(new_canvas);
        });

        this.$btnDelete.addEventListener("click", e => {
            this.current.boothList = [];
        });

        this.restore();
        this.update();
    }

    get selectedColor(){
        return this.selected ? this.color[this.selected] : "#ffffff";
    }

    update(){
        if(this.saveList.length === 0){
            this.$saveList.innerHTML = "<p class='text-muted text-center'>저장된 부스가 없습니다.</p>";
        }
        else this.$saveList.innerHTML = "";
        
        this.saveList.forEach(item => {
            this.fadeAppend(this.$saveList, item.image);
        });

        this.save();
    }

    save(){
        // 저장된 데이터
        let _saveList = this.saveList.map(x => {
            let src = x.image.src;
            let obj = JSON.parse(JSON.stringify(x));
            obj.image = src;

            return obj;
        });
        _saveList = JSON.stringify(_saveList);

        // 현재 화면
        let _current = {
            type: this.current.type,
            boothList: this.current.boothList.map(({x, y, width, height, text}) => ({x, y, width, height, text}))
        };
        _current = JSON.stringify(_current);

        localStorage.setItem("saveList", _saveList);
        localStorage.setItem("current", _current);
    }

    restore(){
        let _saveList = localStorage.getItem("saveList");
        let _current = localStorage.getItem("current");

        if(_saveList){
            _saveList = JSON.parse(_saveList);
            this.saveList = _saveList.map((item, i) => {
                let obj = {};
                obj.type = item.type;
                obj.boothList = item.boothList;
                obj.image = document.createElement("img");
                obj.image.src = item.image;
                obj.image.addEventListener("click", () => {
                    let new_canvas = new Canvas(this, item);
                    this.changeCanvas(new_canvas);
                });
                obj.image.addEventListener("load", () => {
                    setTimeout(() => {
                        this.fadeAppend(this.$saveList, obj.image);
                    }, 200 * i);
                });
                
                return obj;
            });
            console.log(this.saveList[0]);
        }
        
        if(_current){
            _current = JSON.parse(_current);
            let new_canvas = new Canvas(this, _current);
            this.changeCanvas(new_canvas);
        }
    }

    reset(type = 0){
        let new_canvas =  new Canvas(this, {type});
        this.changeCanvas(new_canvas, "right");
    }

    fadeAppend($parent, $target){
        $target.style.opacity = "0";
        $target.style.transform = "scale(0.6)"
        $target.style.transition = "opacity 0.5s, transform 0.5s";
        $parent.append($target);
        setTimeout(() => {
            $target.style.opacity = "1";
            $target.style.transform = "scale(1)"
        }, 100);
    }

    changeCanvas(new_canvas, dir = "left"){
        if(this.current){
            let st = this.current.$root.style;
            st.transition = "0.5s";
            st.opacity = "0";
            st.transform = "scale(0.5) translate("+ (dir === "left" ? "-50%" : "50%") + ", 0%)";
            setTimeout(() => {
                this.current.$root.remove();
                cancelAnimationFrame(this.current.updateFrame);
    
                this.current = new_canvas;
                this.fadeAppend(this.$contents, new_canvas.$root);
            }, 500);   
        }
        else {
            this.current = new_canvas;
                this.fadeAppend(this.$contents, new_canvas.$root);
        }
        
    }
}