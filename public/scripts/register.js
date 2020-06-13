document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerBtn").disabled = true;
    document.getElementById("edit_firstname").focus();
    document.getElementById("registerBtn").addEventListener('click',()=>{
        event.preventDefault();
        registerUser();
    });

});

const pass_match = document.getElementById("match_password");
const pass = document.getElementById("edit_password");
const pattern = pass.getAttribute('pattern');
var reg_ex = new RegExp(pattern)

pass.onkeyup = function() {
    checkPassword();
}

pass_match.onkeyup = function() {
    checkPassword();
}

function checkPassword() {
    if(reg_ex.test(pass.value)){
        document.getElementById("passwordOK").style.display = "block";
    }else{
        document.getElementById("passwordOK").style.display = "none";
    }
    if (reg_ex.test(pass.value) && matchPassword()) {
        document.getElementById("registerBtn").disabled = false;
        document.getElementById("matchOK").style.display = "block";
        document.getElementById("match_password_label").style.color = "black";
        document.getElementById("match_password_label").textContent = "Retype Password"
    }else{
        document.getElementById("registerBtn").disabled = true;
        document.getElementById("matchOK").style.display = "none";
        document.getElementById("match_password_label").style.color = "red";
        document.getElementById("match_password_label").textContent = "Retype Password (Mismatch)"
    }
}

function registerUser(){
    if(allValid2()){
        let data = {
            fname:document.getElementById("edit_firstname").value,
            lname:document.getElementById("edit_lastname").value,
            email:document.getElementById("edit_email").value,
            password:document.getElementById("edit_password").value,
            phone:document.getElementById("userphone").value
        }

        fetch('/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		}).then((data1)=>{
            console.log(data1);
            if(!data1.ok){
                throw Error(data1.status);
            }
            return data1.json();
        }).then((data2)=>{
            if(data2.error){
                document.getElementById("edit_email_label").textContent = `Email (${data2.status})`;
                document.getElementById("edit_email_label").style.color = "red";
            }else{
                setTimeout(function(){
                    window.location.href = './login';
                },1000);
            }
        }).catch((err) => {
            alert(err);
            //reloadPage(1000);
        });
    }
}

function matchPassword() { 
    let password1 = document.getElementById("edit_password").value;
    let password2 = document.getElementById("match_password").value;
    if (password1 == password2) {
        return true;
    } else {
        return false;
    }
}

