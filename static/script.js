// note that the alert function will be replaced with a custom
// implementation with the fb style!

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
                    console.log("Login failed: " + data.message);
                }
            } catch (error) {
                console.error("Error logging in:", error);
                console.log("An error occurred. Please try again.");
            }
        } else {
            alert("Please enter both email and password.");
        }
    });

    document.querySelector('.sign-up-button').addEventListener('click', async function(event) {
        event.preventDefault();
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
                    alert("Registration successful! You can now log in.");
                } else {
                    alert("Registration failed: " + data.message);
                }
            } catch (error) {
                console.error("Error signing up:", error);
            }
        } else {
            alert("Please fill out all fields to sign up.");
        }
    });
});
