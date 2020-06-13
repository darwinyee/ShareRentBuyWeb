document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("editInfo") != undefined){
        document.getElementById("editInfo").addEventListener('click',()=>{
            $("#editUserInfo").modal();
            getUserInfo();
        });
    }   
});


function getUserInfo(){
    fetch('/../usr', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then((data1)=>{
        if(!data1.ok){
            throw Error(data1.status);
        }
        return data1.json();
    }).then((data2)=>{
        fillUserInfo(data2.auth);
        allValid2();
    }).catch((err) => {
        alert(err);
        reloadPage(1000);
    });
}


function fillUserInfo(data){
    document.getElementById("edit_firstname").value = data.firstname;
    document.getElementById("edit_lastname").value = data.lastname;
    document.getElementById("edit_email").value = data.email;
    document.getElementById("userphone").value = data.phone;
    document.getElementById("userId").value = data.id;
    document.getElementById("edit_password").value = "";
}


function getUserInfoFromField(){
    return {
        firstname:document.getElementById("edit_firstname").value,
        lastname:document.getElementById("edit_lastname").value,
        password:document.getElementById("edit_password").value,
        email:document.getElementById("edit_email").value,
        phone:document.getElementById("userphone").value,
        userID:document.getElementById("userId").value
    }
}

function saveUser(){
    if(allValid2()){
        let payload = getUserInfoFromField();
        fetch('/../updateUsr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        }).then((data1) => {
            if(!data1.ok){
                throw Error(data1.status);
            }
            return data1.json();
        }).then((data2)=>{
            if(!data2.error){
                $("#editUserInfo").modal('hide');
                reloadPage(1000);
            }else{
                alert(data2.status);
            }
        }).catch((err) => {
            alert(err);
            reloadPage(1000);
        });
    }    
}


function reloadPage(timeout){
    setTimeout(function(){
        location.reload();
    },timeout);
}


/*Input Validation*/
function inputValidate2(htmlID){
	//get input type
	let curInput = document.getElementById(htmlID);

	switch (htmlID){
		case "edit_firstname":
		case "edit_lastname":
			curInput.value = curInput.value.replace(/^\s+/,'');
			curInput.value = curInput.value.replace(/\s+$/,'');
			(curInput.value != "")?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;	
		case "edit_email":
            curInput.value = curInput.value.replace(/^\s+/,'');
			curInput.value = curInput.value.replace(/\s+$/,'');
			(inputTest(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
            break;
		case "edit_password":
			(inputTest(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,curInput.value) || (curInput.value==""))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
		case "userphone":
			(inputTest(/^\d{3}\-\d{3}\-\d{4}$/,curInput.value))?setWarning(htmlID, 1):setWarning(htmlID,0);
			break;
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

function allValid2(){
	let fieldData = {
		firstname : document.getElementById('edit_firstname'),
        lastname : document.getElementById('edit_lastname'),
        email : document.getElementById('edit_email'),
        password : document.getElementById('edit_password'),
        phone : document.getElementById('userphone')
	}

	let inputOkay = 1;
	for(let key of Object.keys(fieldData)){
		inputValidate2(fieldData[key].id);
		if(fieldData[key].getAttribute('data-inputValid') == "0"){inputOkay = 0;}
    }
    
    if(inputOkay){
        document.getElementById("editUserReady").style.display = "none";
    }else{
        document.getElementById("editUserReady").style.display = "block";
    }
	return inputOkay;
}

/* This function performs extensive input test using regular expression.*/
function inputTest(regexPattern, targetInput){
    const regex = RegExp(regexPattern);
    return regex.test(targetInput);
}