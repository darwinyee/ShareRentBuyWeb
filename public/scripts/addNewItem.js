showCategories = async () => {
	let catElem = document.getElementById('categories');

	let allAvailableCats = await fetch('/api/getCategories');
	let listCategories = await allAvailableCats.json();

	let defaultNode = document.createElement('option');
	defaultNode.textContent = 'Please Select';
	defaultNode.value = "-1";
	catElem.appendChild(defaultNode);

	listCategories.categoryResults.forEach((element) => {
		let newNode = document.createElement('option');
		newNode.value = element.categoryId;
		newNode.innerText = element.categoryName;
		catElem.appendChild(newNode);
	});
};

showCategories();

document.getElementById('addItemSubmit').addEventListener('click', (event) => {

	//Check form data
	if(allValid()){
		let data = getFormFields();

		//modal for saving screen
		let loadingModal = document.getElementById('loadingModalStatus');
		loadingModal.textContent = 'Saving new listing...';
		$('#LoadingModal1').modal();


		console.log(data);
		fetch('/api/addNewItem', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then((data1) => {
				return data1.json();
			})
			.then((data2) => {
				//upload attachment
				loadingModal.textContent = 'Uploading attachment...';
				return fetch('/aws/upload', { method: 'POST', body: getMultiformData(data2.insertID) });
			})
			.then((data3) => {
				return data3.json();
			})
			.then((data4) => {
				loadingModal.textContent = data4.uploadStatus;
				redirectToHomePage(1000);
				return data4;
			})
			.catch((err) => {
				loadingModal.textContent = err;
				reloadPage(1000);
			});	
	}
});


function getFormFields(){
    let name = document.getElementById('name').value;
	let description = document.getElementById('description').value;
	let price = document.getElementById('price').value;
	let sell_type = document.getElementById('select_buy_choice').value;
	let category = document.getElementById('categories').value;
	let phone = document.getElementById('phone').value;
	let address = document.getElementById('address').value;
	let city = document.getElementById('city').value;
	let state = document.getElementById('state').value;
	let zip = document.getElementById('zip').value;
	return { name, description, price, sell_type, phone, address, city, state, zip, category };
}

function getMultiformData(listingId){
	let form = document.forms.namedItem('fileinfo');
	let formData = new FormData(form);
	formData.append('listId', listingId);
	formData.append('newFileCt', document.getElementById('myFile').files.length);
	return formData;
}

function redirectToHomePage(timeout){
    setTimeout(function(){
        window.location.href = './';
    },timeout);
}

function inputValidate(htmlID){
	//get input type
	let curInput = document.getElementById(htmlID);

	switch (htmlID){
		case "name":
		case "address":
		case "city":
		case "description":
			curInput.value = curInput.value.replace(/^\s+/,'');
			curInput.value = curInput.value.replace(/\s+$/,'');
			(curInput.value != "")?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;	
		case "categories":
		case "state":
		case "select_buy_choice":
			(curInput.value != -1)?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "zip":
			(inputTest(/^\d{5}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "phone":
			(inputTest(/^\d{3}\-\d{3}\-\d{4}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "price":
			(inputTest(/^\d{1,9}\.?\d{0,2}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "myFile":
			(curInput.files.length <= 3)?setWarning(htmlID, 1):setWarning(htmlID,0);
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
		name : document.getElementById('name'),
		description : document.getElementById('description'),
		price : document.getElementById('price'),
		sell_type : document.getElementById('select_buy_choice'),
		category : document.getElementById('categories'),
		phone : document.getElementById('phone'),
		address : document.getElementById('address'),
		city : document.getElementById('city'),
		state : document.getElementById('state'),
		zip : document.getElementById('zip'),
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