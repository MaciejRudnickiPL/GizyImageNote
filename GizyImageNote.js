let mySett = {
    urlForm: '/potwierdzenie',
    urlAjax: '/canvas',
    form: true,
    zIndex: 0,
    idPrefix: 'gizy',
    editor: {
        backColor: "steelblue", // kolor tła w pełnym ekranie
        type: "horizontal", // horizontal , vertical
    },
    tools: {
        btnSize: 80,// wielkość ikon narzędziowych
        btnClearTxt: "Wyczyść",
        btnDeleteTxt: "Usuń",
        btnDraw: "Rysuj",
        btnSend: "Wyślij",
        btnSave: "Zapisz"
    }
};

class GizyImageNote {
    constructor(imgDiv) {
        this.divName = imgDiv;
        this.editorDiv = null;
        this.mySett = T.clone(mySett);
    }

    start() {
        let editorDivs;
        console.log(this.divName);
        if (this.divName.indexOf("#") >= 0) {
            editorDivs = document.getElementById(this.divName);
            new CreateNote(editorDivs);
        } else if (this.divName.indexOf(".") >= 0) {
            editorDivs = document.querySelectorAll(this.divName);
            let length = editorDivs.length;

            for (let i = 0; i < length; ++i) {
                new CreateNote(editorDivs[i]);
            }

        } else {
            editorDivs = document.querySelectorAll("." + this.divName);
            let length = editorDivs.length;
            for (let i = 0; i < length; ++i) {
                new CreateNote(editorDivs[i]);
            }
        }
    }
}

let loop = 0;

class CreateNote {

    constructor(imageWrap) {
        this.my = this;

        this.editor = imageWrap;
        this.picture = null;
        this.editor_Image_Field = null;
        this.editor_Form = null;

        this.c_points = [];
        this.mySett = T.clone(mySett);

        this.btnTest = null;
        this.btnClear = null;

        this.canvas = null;
        this.ctx = null;


        this.editorToolBox = null;
        this.editorImageBox = null;

        this.height = 0;
        this.width = 0;

        this.pos = {x: 0, y: 0};
        this.gForm = null;

        this.note = null;
        this.noteLastId = 0;
        this.noteChosenId = 0;
        this.notePointList = new Map();
        this.noteTextPointList = new Map();
        this.noteTextList = new Map();
        this.noteTextAreaOn = false;
        this.noteTextArea = null;
        this.btnNoteOk = null;
        this.btnNoteDelete = null;

        this.czytacz = null;

        this.formName = name;
        this.gForm = null;
        this.gInputFIle = null;
        this.gInputComment = null;
        this.gHideBlobImage = null;
        this.gHideInfo = null;
        this.gFormBtnSend = null;

        this.start();
    }

    start() {

        this.createForm();
        this.createEditor();
        this.createNoteEditor();
        this.createToolsEditor();
        this.addListners();
    }


    createEditor() {
        document.addEventListener('afterLoadImg', this.afterImageLoad.bind(this), true);
        this.editor.classList.add('editor');

        this.editor_Image_Field = document.createElement("div");
        this.editor_Image_Field.setAttribute('class', 'editor_image-field');

        if (!this.picture) {
            this.picture = document.createElement('img');
            this.picture.setAttribute('class', 'editor_img');
            this.editor_Image_Field.appendChild(this.picture);
        }

        this.editor_Form = document.createElement("div");
        this.editor_Form.setAttribute('class', 'editor_form');


        this.editor_Form.appendChild(this.gForm);

        this.editor.appendChild(this.editor_Image_Field);
        this.editor.appendChild(this.editor_Form);
        // this.gForm.addListners();

        this.editorImageBox = document.createElement("div");
        this.editorImageBox.setAttribute("class", "imageBox");

    }

    afterImageLoad() {
        this.picture.onload = () => {
            this.editorToolBox.style.visibility = "inherit";
            this.getSizes();
            this.createCanvasEditor();

            this.gInputComment.style.visibility = "inherit";
            this.gFormBtnSend.style.visibility = "inherit";
            //dwa
            this.gFormBtnSend.addEventListener('click', this.sendForm.bind(this), false)
        };
    }


    createCanvasEditor() {
        console.log("createCanvasEditor");
        if (this.canvas) {
            this.canvas.remove();
            this.clearCanvas();
        }
        this.canvas = document.createElement("canvas");

        this.canvas.setAttribute('class', 'editor_canvas');
        this.canvas.style.zIndex = this.mySett.zIndex + 10;
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.canvas.style.backgroundColor = "transparent";


        this.editor_Image_Field.appendChild(this.canvas);

        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mousedown', this.setPosition.bind(this));
        this.canvas.addEventListener('mouseup', this.drawEnd.bind(this));
        this.canvas.addEventListener('mouseenter', this.setPosition.bind(this));
        this.ctx = this.canvas.getContext("2d");
        this.ctx.globalCompositeOperation = "source-over";
    }

    createNoteEditor() {

        // notatka
        this.noteTextArea = document.createElement("TEXTAREA");
        this.noteTextArea.setAttribute('class', 'editor_txt');
        this.noteTextArea.maxLength = 2000;
        this.noteTextArea.name = "note";

        // przycisk notatka ok
        this.btnNoteOk = document.createElement('button');
        this.btnNoteOk.innerText = this.mySett.tools.btnSave;
        this.btnNoteOk.setAttribute("class", "editor_note-btn");

        // przycisk notatka usun
        this.btnNoteDelete = document.createElement('button');
        this.btnNoteDelete.innerText = "Usuń";
        this.btnNoteDelete.setAttribute("class", "editor_note-btn");

        this.note = document.createElement('div');
        this.note.setAttribute("class", "editor_mask");
        this.note.setAttribute("id", this.mySett.idPrefix + "idNoteMask");
        this.note.style.zIndex = mySett.zIndex;

        this.noteEditor = document.createElement("div");
        this.noteEditor.setAttribute("class", "editor_note");

        this.noteEditor.appendChild(this.noteTextArea);
        this.noteEditor.appendChild(this.btnNoteDelete);
        this.noteEditor.appendChild(this.btnNoteOk);

        this.note.style.zIndex = this.mySett.zIndex + 20;

        this.note.appendChild(this.noteEditor);

        //dodanie notatki do dokumentu
        document.body.appendChild(this.note);
        this.note.style.visibility = "hidden";

    }

    createToolsEditor() {

        //przycisk test
        this.btnTest = document.createElement('button');
        this.btnTest.innerText = "Test";
        this.btnTest.setAttribute("class", "editor_btn");
        //przycisk wyczyść
        this.btnClear = document.createElement('button');
        this.btnClear.innerText = this.mySett.tools.btnClearTxt;
        this.btnClear.setAttribute("class", "editor_btn");
        // toolbox z przyciskami
        this.editorToolBox = document.createElement('div');
        this.editorToolBox.setAttribute("class", "editor_toolBox");
        this.editorToolBox.style.zIndex = this.mySett.zIndex + 15;
        //
        this.editorToolBox.appendChild(this.btnClear);
        this.editorToolBox.appendChild(this.btnTest);
        this.editor_Image_Field.appendChild(this.editorToolBox);

        this.editorToolBox.style.visibility = "hidden";

        this.btnClear.addEventListener('click', this.clearCanvas.bind(this));

        this.btnNoteOk.addEventListener('click', this.noteOK.bind(this));
        this.btnNoteDelete.addEventListener('click', this.noteDeleteFromBtn.bind(this));
        this.btnTest.addEventListener('click', this.test.bind(this));

    }

    getSizes() {

        let w = {};

        console.log(this.picture.height, this.picture.width);
        w = T.resizeValue(
            this.picture.naturalWidth,
            this.picture.naturalHeight,
            window.innerWidth, window.innerHeight);

        this.height = w.height;
        this.width = w.width;

        this.picture.height = w.height;
        this.picture.width = w.width;
    }

    noteOK() {

        if (!document.getElementById(this.mySett.idPrefix + 'idBtn' + this.noteChosenId)) {
            this.addButtonShow("Poz:");
        }
        this.noteTextList.set(this.noteChosenId, this.noteTextArea.value.trim());
        this.note.style.visibility = "hidden";
    }

    hideNote() {
        this.note.style.visibility = "hidden";
        this.noteTextAreaOn = false;
    }

    noteShow() {

        console.log("note");
        let note = this.noteTextList.get(this.noteChosenId);
        if (!T.isEmpty(note) && note.length > 0) {
            this.noteTextArea.value = note;
        } else {
            this.noteTextArea.value = "";
        }

        // this.note.style.display = "inherit";
        this.note.style.visibility = "inherit";
        this.noteTextAreaOn = true;
    }

    setPosition(e) {
        let tx = T.getRelativeCoordinates(e, this.editor).x;
        let ty = T.getRelativeCoordinates(e, this.editor).y;
        this.pos.x = tx;
        this.pos.y = ty;
    }

    clearCanvas() {


        let buttons = document.querySelectorAll(".editor_btn-small");

        buttons.forEach(function (btn) {
            btn.remove();
        });

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.noteLastId = 0;
        this.noteChosenId = 0;
        this.c_points = [];

        this.noteTextList.clear();
        this.notePointList.clear();
        this.noteTextPointList.clear();
    }

    addText() {
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(this.noteChosenId, this.pos.x, this.pos.y);

        this.noteTextPointList.set(this.noteChosenId, {"x": this.pos.x, "y": this.pos.y});
    }

    addButtonShow(name) {
        let btn = document.createElement('button');
        btn.innerText = name + this.noteChosenId;
        btn.setAttribute("class", "editor_btn editor_btn-small");
        btn.setAttribute('id', this.mySett.idPrefix + "idBtn" + this.noteChosenId);
        this.editorToolBox.appendChild(btn);
        btn.addEventListener('click', this.noteShowFromBtn.bind(this));
    }

    noteShowFromBtn(e) {
        this.noteChosenId = T.numberFromString(e.target.id);
        this.noteShow();
    }

    noteDeleteFromBtn() {
        this.noteDelete();
    }

    drawEnd() {
        console.log("emd draw");
        this.noteChosenId = this.noteLastId;
        this.addText();
        this.notePointList.set(this.noteChosenId, this.c_points);
        this.c_points = [];
        this.noteTextPointList.set(this.noteLastId, {"x": this.pos.x, "y": this.pos.y});
        this.noteShow();
        this.noteLastId++;
    }

    draw(e) {

        if (e.buttons !== 1) return;
        if (this.noteTextAreaOn) {
            this.hideNote();
        }
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.beginPath(); // begin

        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#c0392b';

        this.ctx.moveTo(this.pos.x, this.pos.y); // from
        this.setPosition(e);
        this.ctx.lineTo(this.pos.x, this.pos.y); // to
        this.ctx.stroke(); // draw it!

        this.c_points[loop] = [this.pos.x, this.pos.y, this.noteLastId];
        loop++;
    }

    noteDelete() {
        let tempPoints = this.notePointList.get(this.noteChosenId);
        this.deleteDraw(tempPoints);
        this.deleteText(this.noteTextPointList.get(this.noteChosenId));

        this.noteTextList.delete(this.noteChosenId);
        this.hideNote();
        document.getElementById(this.mySett.idPrefix + "idBtn" + this.noteChosenId).remove();
    }

    deleteDraw(points) {
        let tem = 0;
        this.ctx.beginPath(); // begin
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#e80000';
        let posX;
        let posY;
        points.forEach((item) => {
            posX = item[0];
            posY = item[1];
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.lineTo(posX, posY); // to
            tem++;
        });

        this.ctx.stroke(); // draw it!
        this.notePointList.delete(this.noteChosenId);
    }

    deleteText(points) {
        this.ctx.beginPath(); // begin
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = "steelblue";
        this.ctx.lineWidth = "2";
        this.ctx.clearRect(points.x, points.y, 20, -23);
        this.ctx.stroke(); // draw it!
        this.noteTextPointList.delete(this.noteChosenId);
    }


    handlerFileSelect(e) {
        let plikWYbrany = e.target.files[0];
        this.czytacz.readAsDataURL(plikWYbrany);
    }


    imageLoad(e) {
        T.h("poWczytaniu ");
        this.picture.src = e.target.result;
        //
        const event = new CustomEvent("afterLoadImg", {
            detail: {},
            bubbles: true, //idąc w góre dokumentu, event będzie odpalany dla elementów (jeżeli mają nasłuch)
            cancelable: false //czy można przerwać za pomocą e.stopPropagation()
        });
        this.gForm.dispatchEvent(event);
    }

    addListners() {
        this.czytacz = new FileReader();
        this.gInputFIle.addEventListener('change', this.handlerFileSelect.bind(this), false);
        this.czytacz.onload = this.imageLoad.bind(this);
    }

    sendForm(e) {
        e.preventDefault();
        T.h('sendForm');
        this.setData();
        this.sendCanvas();
        this.gForm.submit();
    }

    setData() {
        T.h('setData');
        let data = {temp: "temp"};
        this.noteTextList.forEach(
            function (wart, klucz) {
                data.info = data.info + klucz + "_" + wart + "|";
            }
        );

        this.gInputComment.value = "komentarz2";
        this.gHideInfo.value = "test info";
        this.gHideBlobImage.value = this.picture.src;
        this.gHideInfo.value = data.info;
    }

    sendCanvas() {
        T.h('sendCanvas');

        let my = this;
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = "destination-atop";
        this.ctx.drawImage(this.picture, 0, 0, this.picture.width, this.picture.height);
        this.canvas.toBlob(function (blob) {
                let request = new XMLHttpRequest();
                request.open(
                    "POST",
                    mySett.urlAjax
                );

                let formData = new FormData();
                formData.append('blobImage', blob, my.gInputFIle.value);
                formData.append('imageName', 'odptest');
                request.send(formData);
            }
            , 'image/jpeg', 0.8);
    }


    createForm() {
        this.gInputFIle = document.createElement('input');
        this.gInputFIle.setAttribute('type', "file");
        this.gInputFIle.setAttribute('name', 'myFile');

        this.gForm = document.createElement('form');
        this.gForm.setAttribute('class', 'editor_form');
        this.gForm.enctype = 'multipart/form-data';
        this.gForm.setAttribute('name', this.formName);

        this.gForm.method = "POST";
        this.gForm.action = this.mySett.urlForm;

        this.gInputComment = document.createElement('textarea');

        this.gInputComment.setAttribute('name', 'comment');
        this.gInputComment.setAttribute('class', 'editor_text-comment');


        this.gHideInfo = document.createElement('input');
        this.gHideInfo.setAttribute('type', 'hidden');
        this.gHideInfo.setAttribute('name', 'info');

        this.gHideBlobImage = document.createElement('input');
        this.gHideBlobImage.setAttribute('type', 'hidden');
        this.gHideBlobImage.setAttribute('name', 'blobImage');

        this.gFormBtnSend = document.createElement('button');
        this.gFormBtnSend.setAttribute('class', 'editor_btn');
        this.gFormBtnSend.innerText = this.mySett.tools.btnSend;

        this.gFormBtnSend.style.visibility = "hidden";
        this.gInputComment.style.display = "none";

        this.gForm.appendChild(this.gInputComment);
        this.gForm.appendChild(this.gHideBlobImage);
        this.gForm.appendChild(this.gHideInfo);
        this.gForm.appendChild(this.gInputFIle);
        this.gForm.appendChild(this.gFormBtnSend);

    }

    test(e) {

        this.sendCanvas();

    }
}


class T {
    static clone(obj) {
        if (typeof obj !== 'object' || obj == null) {
            return obj;
        }
        var c = obj instanceof Array ? [] : {};
        for (var i in obj) {
            var prop = obj[i];
            if (typeof prop == 'object') {
                if (prop instanceof Array) {
                    c[i] = [];

                    for (var j = 0; j < prop.length; j++) {
                        if (typeof prop[j] != 'object') {
                            c[i].push(prop[j]);
                        } else {
                            c[i].push(this.clone(prop[j]));
                        }
                    }
                } else {
                    c[i] = this.clone(prop);
                }
            } else {
                c[i] = prop;
            }
        }
        return c;
    }

    static h(obj) {
        console.log(obj);
    }

    static toBlob64Base(b64Data, sliceSize) {

        let block = b64Data.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];


        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        let byteCharacters = atob(realData);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        // let blob = new Blob(byteArrays, {type: contentType});
        return new Blob(byteArrays, {type: contentType});
    }


    static resizeValue(imageWidth, imageHeight, maxWidth, maxHeight) {


        if (imageWidth < maxWidth) {
            let coe = ((imageWidth + maxWidth)) / imageWidth;
            imageWidth = imageWidth + maxWidth;
            imageHeight = imageHeight * coe;
        }

        if (imageHeight < maxHeight) {
            let coe = ((imageHeight + maxHeight)) / imageHeight;
            imageWidth = imageWidth * coe;
            imageHeight = imageHeight + maxHeight;
        }


        if (imageWidth > maxWidth) {
            imageHeight = imageHeight * (maxWidth / imageWidth);
            imageWidth = maxWidth;
            if (imageHeight > maxHeight) {
                imageWidth = imageWidth * (maxHeight / imageHeight);
                imageHeight = maxHeight;
            }
        } else if (imageHeight > maxHeight) {
            imageWidth = imageWidth * (maxHeight / imageHeight);
            imageHeight = maxHeight;
            if (imageWidth > maxWidth) {
                imageHeight = imageHeight * (maxWidth / imageWidth);
                imageWidth = maxWidth;
            }
        }

        return {width: imageWidth, height: imageHeight};
    }

    static numberFromString(stringNumber) {
        let number = stringNumber.match(/\d+/g).map(Number);
        return number[0];
    }


    static isEmpty(str) {
        return typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "";
    }


    static getRelativeCoordinates(event, reference) {
        let x, y;
        event = event || window.event;
        let el = event.target || event.srcElement;

        if (!window.opera && typeof event.offsetX != 'undefined') {
            let pos = {x: event.offsetX, y: event.offsetY};

            var e = el;
            while (e) {
                e.mouseX = pos.x;
                e.mouseY = pos.y;
                pos.x += e.offsetLeft;
                pos.y += e.offsetTop;
                e = e.offsetParent;
            }

            var e = reference;
            let offset = {x: 0, y: 0};
            while (e) {
                if (typeof e.mouseX != 'undefined') {
                    x = e.mouseX - offset.x;
                    y = e.mouseY - offset.y;
                    break;
                }
                offset.x += e.offsetLeft;
                offset.y += e.offsetTop;
                e = e.offsetParent;
            }

            e = el;
            while (e) {
                e.mouseX = undefined;
                e.mouseY = undefined;
                e = e.offsetParent;
            }
        } else {
            let pos = getAbsolutePosition(reference);
            x = event.pageX - pos.x;
            y = event.pageY - pos.y;
        }
        return {x: x, y: y};
    }
}

export default GizyImageNote;