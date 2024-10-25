document.addEventListener("DOMContentLoaded", function() {
    var daySelect = document.getElementById('birthday-day');
    var yearSelect = document.getElementById('birthday-year');

    for (var day = 1; day <= 31; day++) {
        var dayOption = document.createElement('option');
        dayOption.value = day;
        dayOption.text = day;
        daySelect.appendChild(dayOption);
    }

    var currentYear = new Date().getFullYear();
    for (var year = currentYear; year >= 1900; year--) {
        var yearOption = document.createElement('option');
        yearOption.value = year;
        yearOption.text = year;
        yearSelect.appendChild(yearOption);
    }

    function showAlert(message, details) {
        var alertDiv = document.querySelector('.alert');
        
        if (!alertDiv) {
            console.error("Alert div with class 'alert' not found in the DOM.");
            return;
        }

        var textAlert = alertDiv.querySelector('.text-alert');
        var errorParagraph = alertDiv.querySelector('.error-paragraph');

        textAlert.textContent = message;
        errorParagraph.textContent = details;
        
        alertDiv.style.display = 'block';
    }

    document.querySelector('.login-button').addEventListener('click', async function(event) {
        event.preventDefault();
        var email = document.getElementById('email').value;
        var password = document.getElementById('pass').value;

        if (email && password) {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();

                if (response.ok) {
                    console.log("Login successful!" + data.message);
                    window.location.href = '/'; 
                } else {
                    showAlert("Login unsuccessful", data.message || "Please check your credentials.");
                }
            } catch (error) {
                console.error("Error logging in:", error);
                showAlert("An error occurred", "Please try again later.");
            }
        } else {
            showAlert("Missing information", "Please enter both email and password.");
        }
    });

    const signUpButton = document.querySelector('.sign-up-button');
    if (signUpButton) {
        signUpButton.addEventListener('click', async function(event) {
            event.preventDefault();
            console.log("Sign-up button clicked");
            
            var firstname = document.getElementById('firstname').value;
            var lastname = document.getElementById('lastname').value;
            var regEmail = document.getElementById('reg-email').value;
            var regPassword = document.getElementById('reg-passwd').value;
            var sex = document.getElementById('sex').value;
            var month = document.getElementById('birthday-month').value;
            var day = document.getElementById('birthday-day').value;
            var year = document.getElementById('birthday-year').value;

            if (firstname && lastname && regEmail && regPassword && sex && month && day && year) {
                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            firstname,
                            lastname,
                            email: regEmail,
                            password: regPassword,
                            sex,
                            birthday: `${year}-${month}-${day}`
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        showAlert("Registration successful", "You can now log in.");
                    } else {
                        showAlert("Registration failed", data.message || "Please check the entered details.");
                    }
                } catch (error) {
                    console.error("Error signing up:", error);
                    showAlert("An error occurred", "Please try again later.");
                }
            } else {
                showAlert("Missing information", "Please fill out all fields to sign up.");
            }
        });
    } else {
        console.log("Sign-up button not found in the DOM");
    }

    const buttonDone = document.querySelector('.button-done');
    if (buttonDone) {
        buttonDone.addEventListener('click', function() {
            var alertDiv = document.querySelector('.alert');
            if (alertDiv) {
                alertDiv.style.display = 'none';
            }
        });
    } else {
        console.log("Button-done not found in the DOM");
    }
});
