document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addAttachLnk").addEventListener('click',()=>{
        document.getElementById("newAttached").style.display = "block";
    });
});

function saveEdit() {
    if(allValid()){
        //modal for saving screen
        let loadingModal = document.getElementById("loadingModalStatus");
        loadingModal.textContent = "Saving new listing...";
        $("#LoadingModal1").modal();

        let payload = getFormFields();

        fetch('editItem/save',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then((response)=>{
            if(!response.ok){throw Error(response.status);}
            //delete attachments
            return fetch('/aws/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({deleteList:gatherDeleteAttachments("close")})});           
        }).then((response1) => {
            if(!response1.ok){throw Error(response1.status);}
            return response1.json();          
        }).then((data2) => {
            //upload attachment
            loadingModal.textContent = "Updating attachment...";
            return fetch('/aws/upload', {method: 'POST', body: getMultiformData(payload.itemID)});				
        }).then((data3) => {
            return data3.json();
        }).then((data4) => {
            loadingModal.textContent = data4.uploadStatus;
            reloadPage(1000);                   
            return data4; 
        }).catch((err) => {
            loadingModal.textContent = err;
            reloadPage(1000);
        }); 
    } 
}


function getFormFields(){
    return {
        itemID: document.getElementById("edit_item_Id").value,
        catID: document.getElementById("inputCat").value,
        itemName: document.getElementById("edit_name").value,
        itemDescription: document.getElementById("edit_descr").value,
        itemPrice: document.getElementById("edit_price").value,
        itemAddress: document.getElementById("inputAddress").value,
        itemCity: document.getElementById("inputCity").value,
        itemState: document.getElementById("inputState").value,
        itemZip: document.getElementById("inputZip").value,
        sellType: document.getElementById("select_buy_choice").value,
        itemPhone: document.getElementById("phone").value
    }
}

function getMultiformData(listingId){
	let form = document.forms.namedItem('fileinfo');
	let formData = new FormData(form);
	formData.append('listId', listingId);
	formData.append('newFileCt', document.getElementById('myFile').files.length);
	return formData;
}

function reloadPage(timeout){
    setTimeout(function(){
        location.reload();
    },timeout);
}

function cancelEdit() {
    document.getElementById("edits").hidden = true;
    document.getElementById("cards").hidden = false;
    document.getElementById("edit_name").value = "";
    document.getElementById("edit_descr").value = "";
    document.getElementById("edit_price").value = "";
    document.getElementById("inputCat").innerHTML = "";
    document.getElementById("inputAddress").value = "";
    document.getElementById("inputCity").value = "";
    document.getElementById("inputState").value = "";
    document.getElementById("select_buy_choice").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("inputZip").value = "";
    document.getElementById("curAttached").style.display = "none"
    document.getElementById("addAttachLnk").disabled = false;
    document.getElementById("newAttached").style.display = "none"
    document.getElementById("attachImgs").innerHTML = "";
    document.getElementById("myFile").value = null;
}

function populateCategoriesAndSelect(data) {
    let category = document.getElementById("inputCat");
    var req = new XMLHttpRequest();
    req.open('GET', '/editItem/cats', true);
    req.addEventListener('load', function () {
        //Process response
        if (req.status >= 200 && req.status < 400) {
            var resp = JSON.parse(req.responseText);
            // Add a dropdown option for every category found in the data base
            var option = document.createElement("option");
            option.text = "Please Select";
            option.value = "-1";
            category.add(option);
            for (var i = 0; i < resp.length; i++) {
                var option = document.createElement("option");
                option.text = resp[i].categoryName;
                option.value = resp[i].categoryId;
                console.log(data.categoryId);
                // Select current category
                if (option.value == data.categoryId) {
                    option.selected = true;
                }
                category.add(option);
            }
            console.log(resp);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);
}


function renderEditFormWithData(data){
    loadFormFields(data);
    loadAttachments(data.attachments);
    allValid();
}


function loadFormFields(data){
    //fill in the form fields
    fillTextFieldsWithData(data);

    //set the state
    let state = document.getElementById("inputState");
    for (var i = 0; i < state.options.length; i++) {
        if (state.options[i].value == data.itemState) {
            state.options[i].selected = true;
        }
    }

    //set the listing type
    let listType = document.getElementById("select_buy_choice");
    for (let j = 0; j < listType.options.length; j++){
        if(listType.options[j].value == data.sellType){
            listType.options[j].selected = true;
        }
    }
    
    //fill in and set the category
    populateCategoriesAndSelect(data);
}


function fillTextFieldsWithData(data){
    document.getElementById("edit_item_Id").value = data.id;
    document.getElementById("edit_name").focus();
    document.getElementById("edit_name").value = data.itemName;
    document.getElementById("edit_descr").value = data.itemDescription;
    document.getElementById("edit_price").value = data.itemPrice;
    document.getElementById("inputAddress").value = data.itemAddress;
    document.getElementById("inputCity").value = data.itemCity;
    document.getElementById("inputZip").value = data.itemZip;
    document.getElementById("phone").value = data.itemPhone;
    console.log(data);
}


function loadAttachments(attachmentArr){
    let imgtags = document.getElementById("attachImgs");
    //write the html for each attachment
    for(let n = 0; n < attachmentArr.length; n++){

        let curImg = createImgElement(attachmentArr[n]);      
        let curImgData = createImgDataElement(attachmentArr[n]);
        let curImgContainer = document.createElement("div");
        curImgContainer.className = "img-wrap col-sm-4";
        curImgContainer.appendChild(curImgData);
        curImgContainer.appendChild(curImg);
        imgtags.appendChild(curImgContainer);
    }
    
    //add the image remove function to each image and toggle attachment link and attachment block
    addImageRemoveFunction();
    toggleAttachLnkAndAttachBlock();
}


function createImgElement(imgData){
    let curImg = document.createElement("img");
    curImg.className = "img-thumbnail";
    curImg.setAttribute("id", "att_"+imgData.AttachId);
    curImg.setAttribute("src", imgData.AttLink);
    return curImg;
}


function createImgDataElement(imgData){
    let curImgData = document.createElement("span");
    curImgData.setAttribute("id", "attname_"+imgData.AttachId);
    curImgData.setAttribute("data-filename", imgData.AttName);
    curImgData.setAttribute("data-id", imgData.AttachId);
    curImgData.setAttribute("data-deleted", '0');
    curImgData.className = "close";
    curImgData.textContent = "X";
    return curImgData;
}


function editItem(id) {
    document.getElementById("edits").hidden = false;
    document.getElementById("cards").hidden = true;

    var req = new XMLHttpRequest();
    req.open('POST', '/editItem/id', true)
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        //Process response
        if (req.status >= 200 && req.status < 400) {
            var resp = JSON.parse(req.responseText);
            renderEditFormWithData(resp);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    payload = { id: id }
    req.send(JSON.stringify(payload));
}

function deleteItem(id) {

    var r = confirm("This will permanently remove the item.\nThis change may not be undone!");
    if (r == true) {

        //delete attachment first, then the item from the database
        fetch('/aws/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({deleteList:gatherDeleteAttachments("attachdetails_" + id)})
            })
			.then((data1) => {

				return data1.json();
	
			}).then((data2) => {
				console.log(data2);
				//delete listing
				return fetch('/editItem', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({id:id})});
						
			}).then((data3) => {
				return data3.json();
			}).then((data4) => {
				console.log(data4);
				location.reload();
				return data4; 
			})
			.catch((err) => console.log(err));
    }
}


function addImageRemoveFunction(){
    //reference from stackoverflow
    var closeBtns = document.querySelectorAll('.img-wrap .close')

    for (var i = 0, l = closeBtns.length; i < l; i++) {
        closeBtns[i].addEventListener('click', function() {
            this.setAttribute("data-deleted",'1');
            this.parentElement.style.display = "none";
            toggleAttachLnkAndAttachBlock();           
        });
    }
}


function toggleAttachLnkAndAttachBlock(){
    let imgWrapList = document.getElementsByClassName("img-wrap");
    let curDeletelist = gatherDeleteAttachments("close");

    //toggle Attach Block
    if(imgWrapList.length-curDeletelist.files.length > 0){
        document.getElementById("curAttached").style.display = "block";
    }else{
        document.getElementById("curAttached").style.display = "none";
    }

    //toggle New Attachment Link
    if(imgWrapList.length-curDeletelist.files.length == 3){
        document.getElementById("addAttachLnk").disabled = true;
    }else{
        document.getElementById("addAttachLnk").disabled = false;
    }
}


//This function gathers the attachments to be deleted
function gatherDeleteAttachments(imgtagClassName){
    //an object: {deleteCt:,files:[{attachId:,filename:}]}
    let curImgList = document.getElementsByClassName(imgtagClassName);
    let result = {files:[]};
    let deleteCt = 0;
    for(let i = 0; i < curImgList.length; i++){
        if(curImgList[i].getAttribute('data-deleted') == 1){
            result.files.push({"attachId":curImgList[i].getAttribute('data-id'),
                        "filename":curImgList[i].getAttribute('data-filename')});
            deleteCt++;
        }
    }
    result.deleteCt = deleteCt;
    return result;
}


/*Input Validation*/
function inputValidate(htmlID){
	//get input type
	let curInput = document.getElementById(htmlID);

	switch (htmlID){
		case "edit_name":
		case "inputAddress":
		case "inputCity":
		case "edit_descr":
			curInput.value = curInput.value.replace(/^\s+/,'');
			curInput.value = curInput.value.replace(/\s+$/,'');
			(curInput.value != "")?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;	
		case "inputCat":
		case "inputState":
		case "select_buy_choice":
			(curInput.value != -1)?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "inputZip":
			(inputTest(/^\d{5}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "phone":
			(inputTest(/^\d{3}\-\d{3}\-\d{4}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "edit_price":
			(inputTest(/^\d{1,9}\.?\d{0,2}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "myFile":
            let imgWrapList = document.getElementsByClassName("img-wrap");
            let curDeletelist = gatherDeleteAttachments("close");
			(imgWrapList.length - curDeletelist.files.length + curInput.files.length <= 3)?setWarning(htmlID, 1):setWarning(htmlID,0);
	}

}

function setWarning(htmlID, isValid){
	if(isValid){
		document.getElementById(htmlID).setAttribute('data-inputValid',1);
		document.getElementById(htmlID+"_label").style.color = "black";
	}else{
		document.getElementById(htmlID).setAttribute('data-inputValid',0);
		document.getElementById(htmlID+"_label").style.color = "red";
	}
}

function allValid(){
	let fieldData = {
		name : document.getElementById('edit_name'),
		description : document.getElementById('edit_descr'),
		price : document.getElementById('edit_price'),
		sell_type : document.getElementById('select_buy_choice'),
		category : document.getElementById('inputCat'),
		phone : document.getElementById('phone'),
		address : document.getElementById('inputAddress'),
		city : document.getElementById('inputCity'),
		state : document.getElementById('inputState'),
		zip : document.getElementById('inputZip'),
		files : document.getElementById('myFile')
	}

	let inputOkay = 1;
	for(let key of Object.keys(fieldData)){
		inputValidate(fieldData[key].id);
		if(fieldData[key].getAttribute('data-inputValid') == "0"){inputOkay = 0;}
    }
    
    if(inputOkay){
        document.getElementById("inputReady").style.display = "none";
    }else{
        document.getElementById("inputReady").style.display = "block";
    }
	return inputOkay;
}

/* This function performs extensive input test using regular expression.*/
function inputTest(regexPattern, targetInput){
    const regex = RegExp(regexPattern);
    return regex.test(targetInput);
}