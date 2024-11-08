$(document).ready(function() {
    var $daySelect = $('#birthday-day');
    var $yearSelect = $('#birthday-year');

    for (var day = 1; day <= 31; day++) {
        $daySelect.append($('<option>', {
            value: day,
            text: day
        }));
    }

    var currentYear = new Date().getFullYear();
    for (var year = currentYear; year >= 1900; year--) {
        $yearSelect.append($('<option>', {
            value: year,
            text: year
        }));
    }

    function showAlert(message, details) {
        var $alertDiv = $('.alert');
        var $alertWrapperDiv = $('.alert-wrapper');

        if ($alertDiv.length === 0) {
            console.error("Alert div with class 'alert' not found in the DOM.");
            return;
        }

        var $textAlert = $alertDiv.find('.text-alert');
        var $errorParagraph = $alertDiv.find('.error-paragraph');

        $textAlert.text(message);
        $errorParagraph.text(details);

        $alertDiv.show();
        $alertWrapperDiv.css('display', 'flex');
    }

    var csrfToken = $('meta[name="csrf-token"]').attr('content');

    $('.login-button').click(function(event) {
        event.preventDefault();
        var email = $('#email').val();
        var password = $('#pass').val();

        if (email && password) {
            $.ajax({
                url: '/api/login',
                type: 'POST',
                contentType: 'application/json',
                headers: { 'X-CSRFToken': csrfToken },
                data: JSON.stringify({ email: email, password: password }),
                success: function(data, status, xhr) {
                    if (xhr.status === 200) {
                        console.log("Login successful!" + data.message);
                        window.location.href = '/home';
                    } else {
                        showAlert("Login unsuccessful", data.message || "Please check your credentials.");
                    }
                },
                error: function() {
                    console.error("Error logging in");
                    showAlert("An error occurred", "Please try again later.");
                }
            });
        } else {
            window.location.href = "/login";
        }
    });

    $('.sign-up-button').click(function(event) {
        event.preventDefault();
        console.log("Sign-up button clicked");

        var firstname = $('#firstname').val();
        var lastname = $('#lastname').val();
        var regEmail = $('#reg-email').val();
        var regPassword = $('#reg-passwd').val();
        var sex = $('#sex').val();
        var month = $('#birthday-month').val();
        var day = $('#birthday-day').val();
        var year = $('#birthday-year').val();

        if (firstname && regEmail && regPassword && sex && month && day && year) {
            $.ajax({
                url: '/api/register',
                type: 'POST',
                contentType: 'application/json',
                headers: { 'X-CSRFToken': csrfToken },
                data: JSON.stringify({
                    firstname: firstname,
                    lastname: lastname || '',
                    email: regEmail,
                    password: regPassword,
                    sex: sex,
                    birthday: year + '-' + month + '-' + day
                }),
                success: function(data, status, xhr) {
                    if (xhr.status === 201) {
                        showAlert("Sign up successful", "You may now log in. Redirecting to login page.");
                    } else {
                        showAlert("Registration failed", data.message || "Please check the entered details.");
                    }
                },
                error: function() {
                    console.error("Error signing up");
                    showAlert("An error occurred", "Please try again later.");
                }
            });
        } else {
            showAlert("Missing information", "Please fill out all fields to sign up.");
        }
    });

    $('.button-done').click(function() {
        var $alertDiv = $('.alert');
        var $alertWrapperDiv = $('.alert-wrapper');
        if ($alertDiv.length > 0) {
            $alertDiv.hide();
            $alertWrapperDiv.hide();
        }
    });
});
