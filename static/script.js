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
        var alertwrapperDiv = document.querySelector('.alert-wrapper');
        
        if (!alertDiv) {
            console.error("Alert div with class 'alert' not found in the DOM.");
            return;
        }

        var textAlert = alertDiv.querySelector('.text-alert');
        var errorParagraph = alertDiv.querySelector('.error-paragraph');

        textAlert.textContent = message;
        errorParagraph.textContent = details;
        
        alertDiv.style.display = 'block';
        alertwrapperDiv.style.display = 'flex';
    }

    var csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    document.querySelector('.login-button').addEventListener('click', function(event) {
        event.preventDefault();
        var email = document.getElementById('email').value;
        var password = document.getElementById('pass').value;

        if (email && password) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-CSRFToken', csrfToken);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    var data = JSON.parse(xhr.responseText);

                    if (xhr.status === 200) {
                        console.log("Login successful!" + data.message);
                        window.location.href = '/';
                    } else {
                        showAlert("Login unsuccessful", data.message || "Please check your credentials.");
                    }
                }
            };

            xhr.onerror = function() {
                console.error("Error logging in");
                showAlert("An error occurred", "Please try again later.");
            };

            xhr.send(JSON.stringify({ email: email, password: password }));
        } else {
            window.location.href = "/login";
        }
    });

    var signUpButton = document.querySelector('.sign-up-button');
    if (signUpButton) {
        signUpButton.addEventListener('click', function(event) {
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

            if (firstname && regEmail && regPassword && sex && month && day && year) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/register', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('X-CSRFToken', csrfToken);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var data = JSON.parse(xhr.responseText);

                        if (xhr.status === 201) {
                            showAlert("Sign up successful", "You may now log in. Redirecting to login page.");
                        } else {
                            showAlert("Registration failed", data.message || "Please check the entered details.");
                        }
                    }
                };

                xhr.onerror = function() {
                    console.error("Error signing up");
                    showAlert("An error occurred", "Please try again later.");
                };

                xhr.send(JSON.stringify({
                    firstname: firstname,
                    lastname: lastname || '',
                    email: regEmail,
                    password: regPassword,
                    sex: sex,
                    birthday: year + '-' + month + '-' + day
                }));
            } else {
                showAlert("Missing information", "Please fill out all fields to sign up.");
            }
        });
    } else {
        console.log("Sign-up button not found in the DOM");
    }

    var buttonDone = document.querySelector('.button-done');
    if (buttonDone) {
        buttonDone.addEventListener('click', function() {
            var alertDiv = document.querySelector('.alert');
            var alertwrapperDiv = document.querySelector('.alert-wrapper');
            if (alertDiv) {
                alertDiv.style.display = 'none';
                alertwrapperDiv.style.display = 'none';
            }
        });
    } else {
        console.log("Button-done not found in the DOM");
    }
});
