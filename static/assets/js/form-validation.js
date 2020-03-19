(function ($) {
    // init the validator
    // validator files are included in the download package
    // otherwise download from http://1000hz.github.io/bootstrap-validator
    'use strict';

	/*
	Custom Rules
	*/

    // No White Space
    $.validator.addMethod("noSpace", function (value, element) {
        if ($(element).attr('required')) {
            return value.search(/[a-zA-Z0-9]/i) == 0;
        }

        return true;
    }, 'Please fill this empty field.');

	/*
	Assign Custom Rules on Fields
	*/
    $.validator.addClassRules({
        'form-control': {
            noSpace: true
        }
    });

    $('#tphForm').validate({
        rules: {
            name: {
                rangelength: [2, 40],
                required: true
            },
            surname: {
                rangelength: [2, 40],
                required: true
            },
            email: {
                rangelength: [2, 40],
                required: true
            },
            subject: {
                required: true
            },
            message: {
                rangelength: [25,5000],
                required: true
            },
            terms: {
                required: true
            }
        },
        //For custom messages
        messages: {
            name: "Introduce un nombre válido",
            surname: "Introduce un apellido válido",
            subject: "Selecciona un tema por el que nos quieras contactar",
            message: "Por favor, déjanos un mensaje lo suficientemente largo para que tenga sentido",
            email: "Introduce un email válido",
            terms: "Por favor, acepta los términos y condiciones"
        },
        submitHandler: function (form) {
            var $submitButton = $(this.submitButton)
            $submitButton.val($submitButton.data('loading-text') ? $submitButton.data('loading-text') : 'Sending...').attr('disabled', true);
            grecaptcha.execute();
        },
        errorPlacement: function (error, element) {
            if (element.attr('type') == 'radio' || element.attr('type') == 'checkbox') {
                error.appendTo(element.closest('.form-group'));
            } else {
                error.insertAfter(element);
            }
        }
    });
}).apply(this, [jQuery]);

function submitForm(token) {
    debugger
    // when the form is submitted
    if (token != null) {
        // great, it is not a bot
        var $form = $('#tphForm'),
            $messageSuccess = $('#messageSuccess'),
            $messageError = $('#messageError'),
            $submitButton = $form.find('input[type="submit"]'),
            $errorMessage = $('#mailErrorMessage'),
            submitButtonText = $submitButton.data('submit-text') ? $submitButton.data('submit-text') : 'Descargar',
            resourceName = $form.attr('name');
        
        if ($form.hasClass('ebook-form')) {
            formType = "ebook";
        } else if ($form.hasClass('resource-form')) {
            formType = "resource";
        } else if ($form.hasClass('subscription-form')) {
            formType = "subscription";
        } else if ($form.hasClass('contact-form')) {
            formType = "contact";
        } else {
            return false;
        }

        // Ajax Submit
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                form: formType,
                resource: resourceName,
                name: $form.find('#name').val(),
                surname: $form.find('#surname').val(),
                email: $form.find('#email').val(),
                subject: $form.find('#subject').children("option:selected").text(),
                message: $form.find('#message').val(),
                terms: $form.find('#terms')[0].checked,
                gtoken: token
            })
        }).always(function (data, textStatus, jqXHR) {
            grecaptcha.reset();
            $errorMessage.empty().hide();
            if (textStatus === 'success') {
                $messageSuccess.removeClass('d-none');
                $messageError.addClass('d-none');
                // Reset Form
                $form.find('.form-control')
                    .val('')
                    .blur()
                    .parent()
                    .removeClass('has-success')
                    .removeClass('has-danger')
                    .find('label.error')
                    .remove();

                if (($messageSuccess.offset().top - 80) < $(window).scrollTop()) {
                    $('html, body').animate({
                        scrollTop: $messageSuccess.offset().top - 80
                    }, 300);
                }
                
                $form.find('.form-control').removeClass('error');
                $submitButton.val(submitButtonText).attr('disabled', false);

                // store the cookie with the id of the new guy
                window.localStorage.setItem('theproducthacker',
                    {
                        id: data.id,
                        email: data.email
                    })
                window.location = data.url
                return;
            } else if (data.response == 'error' && typeof data.errorMessage !== 'undefined') {
                $errorMessage.html(data.errorMessage).show();
            } else {
                $errorMessage.html(data.responseText).show();
            }

            $messageError.removeClass('d-none');
            $messageSuccess.addClass('d-none');

            if (($messageError.offset().top - 80) < $(window).scrollTop()) {
                $('html, body').animate({
                    scrollTop: $messageError.offset().top - 80
                }, 300);
            }

            $form.find('.has-success')
                .removeClass('has-success');

            $submitButton.val(submitButtonText).attr('disabled', false);
        });
        return true;
    }
    return false;
}
