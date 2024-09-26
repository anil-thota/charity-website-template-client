"use strict";
(function () {
	// Global variables
	var userAgent = navigator.userAgent.toLowerCase(),
		initialDate = new Date(),

		$document = $(document),
		$window = $(window),
		$html = $("html"),
		$body = $("body"),

		isDesktop = $html.hasClass("desktop"),
		isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false,
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
		windowReady = false,
		isNoviBuilder = false,
		livedemo = true,

		plugins = {
			bootstrapTooltip: $("[data-toggle='tooltip']"),
			copyrightYear: $(".copyright-year"),
			materialParallax: $(".parallax-container"),
			preloader: $(".preloader"),
			rdNavbar: $(".rd-navbar"),
			rdMailForm: $(".rd-mailform"),
			rdInputLabel: $(".form-label"),
			regula: $("[data-constraints]"),
			wow: $(".wow")
		};

	// Initialize scripts that require a loaded page
	$window.on('load', function () {
		// Page loader & Page transition
		if (plugins.preloader.length && !isNoviBuilder) {
			pageTransition({
				target: document.querySelector( '.page' ),
				delay: 0,
				duration: 500,
				classIn: 'fadeIn',
				classOut: 'fadeOut',
				classActive: 'animated',
				conditions: function (event, link) {
					return !/(\#|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
				},
				onTransitionStart: function ( options ) {
					setTimeout( function () {
						plugins.preloader.removeClass('loaded');
					}, options.duration * .75 );
				},
				onReady: function () {
					plugins.preloader.addClass('loaded');
					windowReady = true;
				}
			});
		}

		// Material Parallax
		if ( plugins.materialParallax.length ) {
			if ( !isNoviBuilder && !isIE && !isMobile) {
				plugins.materialParallax.parallax();
			} else {
				for ( var i = 0; i < plugins.materialParallax.length; i++ ) {
					var $parallax = $(plugins.materialParallax[i]);

					$parallax.addClass( 'parallax-disabled' );
					$parallax.css({ "background-image": 'url('+ $parallax.data("parallax-img") +')' });
				}
			}
		}
	});


	var PROJECTID = "";

// Document ready (DOMContentLoaded) function
document.addEventListener("DOMContentLoaded", function () {
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds
    const storedProjectId = localStorage.getItem('projectId');
    const projectIdTimestamp = localStorage.getItem('projectIdTimestamp');
    const now = new Date().getTime();

    if (storedProjectId && projectIdTimestamp) {
        const timeDiff = now - projectIdTimestamp;
        if (timeDiff < THIRTY_MINUTES) {
            PROJECTID = storedProjectId;
            console.log("Valid session found, PROJECTID:", PROJECTID);
            document.getElementById('projectIdModal').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            applyUpdates();
        } else {
            localStorage.removeItem('projectId');
            localStorage.removeItem('projectIdTimestamp');
            console.log("Session expired, clearing stored data.");
        }
    }

    document.getElementById('submitProjectId').addEventListener('click', function (event) {
        event.preventDefault();
        const projectId = document.getElementById('projectIdInput').value;
        if (!projectId) {
            alert("Please enter a Project ID");
            return;
        }

        fetch('http://localhost:3001/project')
            .then(response => response.json())
            .then(data => {
                const projects = data.projects;
                console.log("Projects data fetched:", projects);
                const project = projects.find(proj => proj._id === projectId);

                if (project) {
                    localStorage.setItem('projectId', projectId);
                    localStorage.setItem('projectIdTimestamp', new Date().getTime());
                    PROJECTID = projectId;
                    document.getElementById('projectIdModal').style.display = 'none';
                    document.getElementById('mainContent').style.display = 'block';
                    applyUpdates();
                } else {
                    alert("Please enter a valid Project ID");
                }
            })
            .catch(error => {
                console.error('Error fetching project data:', error);
                alert('There was an error fetching project data.');
            });
    });
});

function applyUpdates() {
    updateLogo();
    updateAddressDetails();
	updateAboutSection();
	updateCarouselSlides();
	fetchAndDisplayGalleryProducts();
   
}


function updateLogo() {
	// Select all elements with the class 'dynamicLogo'
	const logoElements = document.getElementsByClassName('dynamicLogo');
	console.log(logoElements)
	
	// Check if elements exist
	if (logoElements.length === 0) {
	  console.error("No logo elements found");
	  return;
	}
  
	// Fetch the logo data from the API using the project ID
	fetch(`http://localhost:3001/properties/${PROJECTID}/logo`)
	  .then(response => response.json())
	  .then(data => {
		console.log("API Response:", data);
  
		// Check if the response contains a logo URL
		if (data.logo) {
		  // Loop through all logo elements and update their src attribute
		  Array.from(logoElements).forEach(logoElement => {
			logoElement.src = data.logo;
		  });
		} else {
		  console.error('Logo URL not found in the response');
		}
	  })
	  .catch(error => {
		console.error('Error fetching the logo:', error);
	  });
}

function updateAddressDetails() {
	fetch(`http://localhost:3001/properties/${PROJECTID}/address`)
		.then(response => response.json())
		.then(data => {
			if (data) {
				// Log the address details for debugging
				console.log('Address details:', data);

				// Update phone number
				var phoneElements = document.querySelectorAll('.link-phone');
				phoneElements.forEach(element => {
					element.textContent = data.contactNo;
					element.href = `tel:${data.contactNo}`;
				});

				// Update email
				var emailElements = document.querySelectorAll('.link-aemail');
				emailElements.forEach(element => {
					element.textContent = data.emailId;
					element.href = `mailto:${data.emailId}`;
				});

				// Update location
				var locationElements = document.querySelectorAll('.link-location');
				locationElements.forEach(element => {
					element.textContent = `${data.street}, ${data.city}, ${data.state}, ${data.pincode}`;
				});
			} else {
				console.error('No address details found in the response');
			}
		})
		.catch(error => {
			console.error('Error fetching the address details:', error);
		});
}

function updateAboutSection() {
	// Fetching API data for the About Us section
	fetch(`http://localhost:3001/properties/${PROJECTID}/about`)
		.then(response => response.json())
		
		.then(data => {
			console.log("About Section ",data)
			// Assuming the response data is an array with a single object
			const aboutData = data[0];

			// Update the About Us image
			const aboutImageElement = document.querySelector('.dynamicAboutUsImage');
			aboutImageElement.src = aboutData.image;
			aboutImageElement.alt = aboutData.title;

			// Update the About Us heading
			const aboutHeadingElement = document.querySelector('.dynamicAboutUsHead');
			aboutHeadingElement.textContent = aboutData.title;

			// Update the About Us paragraph
			const aboutParagraphElement = document.querySelector('.dynamicAboutUsPara');
			aboutParagraphElement.textContent = aboutData.description;
			
			// Optionally, adjust image dimensions (if necessary)
			aboutImageElement.style.width = '546px';
			aboutImageElement.style.height = '516px';
		})
		.catch(error => console.error('Error fetching about data:', error));
}

let swiperInstance = null;




function updateCarouselSlides() {
	fetch(`http://localhost:3001/properties/${PROJECTID}/banner`)
	  .then(response => response.json())
	  .then(data => {
		if (data.banners && data.banners.length > 0) {
		  const banner = data.banners[0]; // Assuming you want to use the first banner
  
		  const mainBannerImg = document.querySelector('.main-bunner-img');
		  mainBannerImg.style.backgroundImage = `url(${banner.image})`;
		  mainBannerImg.style.backgroundSize = 'cover';
  
		  // Optionally, update text or add additional banner information
		  const bannerHeading = document.createElement('h1');
		  bannerHeading.innerText = banner.heading;
		  mainBannerImg.appendChild(bannerHeading);
  
		  // You can add more elements or adjust as per banner data
		} else {
		  console.error('No banners found in the response');
		}
	  })
	  .catch(error => {
		console.error('Error fetching the banner:', error);
	  });
  }
  

function fetchAndDisplayGalleryProducts() {
    const apiUrl = `http://localhost:3001/properties/${PROJECTID}/product`;

    // Fetch the product data from the API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Filter the products to include only those with the category name "GALLERY"
            const galleryProducts = data.allProducts.filter(item => item.category.name === 'GALLERY');

            console.log("Gallery", galleryProducts);

            // Get the container where thumbnails will be appended or updated
            const container = document.querySelector('.gallery-container');

            // Clear existing thumbnails (if needed)
            container.innerHTML = '';

            // Loop through the gallery products and create/update thumbnails
            galleryProducts.forEach(product => {
                // Create a new thumbnail element
                const item = document.createElement('div');
                item.classList.add('col-xs-12', 'col-sm-6', 'col-md-3', 'isotope-item', 'wow', 'fadeInUp');
                item.dataset.filter = 'Category 1';

                // Create a link element wrapping the thumbnail image
                const linkElement = document.createElement('a');
                linkElement.classList.add('portfolio-item', 'thumbnail-classic');
                linkElement.href = product.images[0];
                linkElement.dataset.size = '1200x800'; // Adjust size if needed
                linkElement.dataset.lightgallery = 'item';

                // Create and append the image element
                const imageElement = document.createElement('img');
                imageElement.src = product.images[0];
                imageElement.alt = product.title;
                imageElement.width = 420; // Adjust width and height as needed
                imageElement.height = 278;

                // Create and append the caption element
                const captionElement = document.createElement('div');
                captionElement.classList.add('caption');
                const thumbsUp = document.createElement('span');
                thumbsUp.classList.add('icon', 'mdi-thumb-up-outline');
                thumbsUp.textContent = '346'; // Replace with actual data if available
                const eyeIcon = document.createElement('span');
                eyeIcon.classList.add('icon', 'mdi-eye');
                eyeIcon.textContent = '220'; // Replace with actual data if available

                captionElement.appendChild(thumbsUp);
                captionElement.appendChild(eyeIcon);

                // Assemble the thumbnail item
                linkElement.appendChild(imageElement);
                linkElement.appendChild(captionElement);
                item.appendChild(linkElement);

                // Append the new thumbnail to the container
                container.appendChild(item);
            });

            // Initialize LightGallery or any other required plugins
            // For example: lightGallery(container, {selector: '.portfolio-item'});
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

	// Initialize scripts that require a finished document
	$(function () {
		isNoviBuilder = window.xMode;

		/**
		 * @desc Attach form validation to elements
		 * @param {object} elements - jQuery object
		 */
		function attachFormValidator(elements) {
			// Custom validator - phone number
			regula.custom({
				name: 'PhoneNumber',
				defaultMessage: 'Invalid phone number format',
				validator: function() {
					if ( this.value === '' ) return true;
					else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test( this.value );
				}
			});

			for (var i = 0; i < elements.length; i++) {
				var o = $(elements[i]), v;
				o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
				v = o.parent().find(".form-validation");
				if (v.is(":last-child")) o.addClass("form-control-last-child");
			}

			elements.on('input change propertychange blur', function (e) {
				var $this = $(this), results;

				if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
				if ($this.parents('.rd-mailform').hasClass('success')) return;

				if (( results = $this.regula('validate') ).length) {
					for (i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}).regula('bind');

			var regularConstraintsMessages = [
				{
					type: regula.Constraint.Required,
					newMessage: "The text field is required."
				},
				{
					type: regula.Constraint.Email,
					newMessage: "The email is not a valid email."
				},
				{
					type: regula.Constraint.Numeric,
					newMessage: "Only numbers are required"
				},
				{
					type: regula.Constraint.Selected,
					newMessage: "Please choose an option."
				}
			];


			for (var i = 0; i < regularConstraintsMessages.length; i++) {
				var regularConstraint = regularConstraintsMessages[i];

				regula.override({
					constraintType: regularConstraint.type,
					defaultMessage: regularConstraint.newMessage
				});
			}
		}

		/**
		 * @desc Check if all elements pass validation
		 * @param {object} elements - object of items for validation
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function isValidated(elements, captcha) {
			var results, errors = 0;

			if (elements.length) {
				for (var j = 0; j < elements.length; j++) {

					var $input = $(elements[j]);
					if ((results = $input.regula('validate')).length) {
						for (k = 0; k < results.length; k++) {
							errors++;
							$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
						}
					} else {
						$input.siblings(".form-validation").text("").parent().removeClass("has-error")
					}
				}

				if (captcha) {
					if (captcha.length) {
						return validateReCaptcha(captcha) && errors === 0
					}
				}

				return errors === 0;
			}
			return true;
		}

		/**
		 * @desc Initialize Bootstrap tooltip with required placement
		 * @param {string} tooltipPlacement
		 */
		function initBootstrapTooltip(tooltipPlacement) {
			plugins.bootstrapTooltip.tooltip('dispose');

			if (window.innerWidth < 576) {
				plugins.bootstrapTooltip.tooltip({placement: 'bottom'});
			} else {
				plugins.bootstrapTooltip.tooltip({placement: tooltipPlacement});
			}
		}

		// Additional class on html if mac os.
		if (navigator.platform.match(/(Mac)/i)) {
			$html.addClass("mac-os");
		}

		// Adds some loosing functionality to IE browsers (IE Polyfills)
		if (isIE) {
			if (isIE === 12) $html.addClass("ie-edge");
			if (isIE === 11) $html.addClass("ie-11");
			if (isIE < 10) $html.addClass("lt-ie-10");
			if (isIE < 11) $html.addClass("ie-10");
		}

		// Bootstrap Tooltips
		if (plugins.bootstrapTooltip.length) {
			var tooltipPlacement = plugins.bootstrapTooltip.attr('data-placement');
			initBootstrapTooltip(tooltipPlacement);

			$window.on('resize orientationchange', function () {
				initBootstrapTooltip(tooltipPlacement);
			})
		}

		// Copyright Year (Evaluates correct copyright year)
		if (plugins.copyrightYear.length) {
			plugins.copyrightYear.text(initialDate.getFullYear());
		}

		// UI To Top
		if (isDesktop && !isNoviBuilder) {
			$().UItoTop({
				easingType: 'easeOutQuad',
				containerClass: 'ui-to-top fa fa-angle-up'
			});
		}

		// RD Navbar
		if (plugins.rdNavbar.length) {
			var aliaces, i, j, len, value, values, responsiveNavbar;

			aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"];
			values = [0, 576, 768, 992, 1200, 1600];
			responsiveNavbar = {};

			for (i = j = 0, len = values.length; j < len; i = ++j) {
				value = values[i];
				if (!responsiveNavbar[values[i]]) {
					responsiveNavbar[values[i]] = {};
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'layout')) {
					responsiveNavbar[values[i]].layout = plugins.rdNavbar.attr('data' + aliaces[i] + 'layout');
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout')) {
					responsiveNavbar[values[i]]['deviceLayout'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout');
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on')) {
					responsiveNavbar[values[i]]['focusOnHover'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on') === 'true';
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height')) {
					responsiveNavbar[values[i]]['autoHeight'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height') === 'true';
				}

				if (isNoviBuilder) {
					responsiveNavbar[values[i]]['stickUp'] = false;
				} else if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up')) {
					responsiveNavbar[values[i]]['stickUp'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up') === 'true';
				}

				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset')) {
					responsiveNavbar[values[i]]['stickUpOffset'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset');
				}
			}


			plugins.rdNavbar.RDNavbar({
				anchorNav: !isNoviBuilder,
				stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
				responsive: responsiveNavbar,
				callbacks: {
					onStuck: function () {
						var navbarSearch = this.$element.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
						}
					},
					onDropdownOver: function () {
						return !isNoviBuilder;
					},
					onUnstuck: function () {
						if (this.$clone === null)
							return;

						var navbarSearch = this.$clone.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
							navbarSearch.trigger('blur');
						}

					}
				}
			});


			if (plugins.rdNavbar.attr("data-body-class")) {
				document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
			}
		}

		// WOW
		if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
			new WOW().init();
		}

		// RD Input Label
		if (plugins.rdInputLabel.length) {
			plugins.rdInputLabel.RDInputLabel();
		}

		// Regula
		if (plugins.regula.length) {
			attachFormValidator(plugins.regula);
		}

		// RD Mailform
		if (plugins.rdMailForm.length) {
			var i, j, k,
				msg = {
					'MF000': 'Successfully sent!',
					'MF001': 'Recipients are not set!',
					'MF002': 'Form will not work locally!',
					'MF003': 'Please, define email field in your form!',
					'MF004': 'Please, define type of your form!',
					'MF254': 'Something went wrong with PHPMailer!',
					'MF255': 'Aw, snap! Something went wrong.'
				};

			for (i = 0; i < plugins.rdMailForm.length; i++) {
				var $form = $(plugins.rdMailForm[i]),
					formHasCaptcha = false;

				$form.attr('novalidate', 'novalidate').ajaxForm({
					data: {
						"form-type": $form.attr("data-form-type") || "contact",
						"counter": i
					},
					beforeSubmit: function (arr, $form, options) {
						if (isNoviBuilder)
							return;

						var form = $(plugins.rdMailForm[this.extraData.counter]),
							inputs = form.find("[data-constraints]"),
							output = $("#" + form.attr("data-form-output")),
							captcha = form.find('.recaptcha'),
							captchaFlag = true;

						output.removeClass("active error success");

						if (isValidated(inputs, captcha)) {

							// veify reCaptcha
							if (captcha.length) {
								var captchaToken = captcha.find('.g-recaptcha-response').val(),
									captchaMsg = {
										'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
										'CPT002': 'Something wrong with google reCaptcha'
									};

								formHasCaptcha = true;

								$.ajax({
									method: "POST",
									url: "bat/reCaptcha.php",
									data: {'g-recaptcha-response': captchaToken},
									async: false
								})
									.done(function (responceCode) {
										if (responceCode !== 'CPT000') {
											if (output.hasClass("snackbars")) {
												output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

												setTimeout(function () {
													output.removeClass("active");
												}, 3500);

												captchaFlag = false;
											} else {
												output.html(captchaMsg[responceCode]);
											}

											output.addClass("active");
										}
									});
							}

							if (!captchaFlag) {
								return false;
							}

							form.addClass('form-in-process');

							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
								output.addClass("active");
							}
						} else {
							return false;
						}
					},
					error: function (result) {
						if (isNoviBuilder)
							return;

						var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
							form = $(plugins.rdMailForm[this.extraData.counter]);

						output.text(msg[result]);
						form.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
						}
					},
					success: function (result) {
						if (isNoviBuilder)
							return;

						var form = $(plugins.rdMailForm[this.extraData.counter]),
							output = $("#" + form.attr("data-form-output")),
							select = form.find('select');

						form
							.addClass('success')
							.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
						}

						result = result.length === 5 ? result : 'MF255';
						output.text(msg[result]);

						if (result === "MF000") {
							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active success");
							}
						} else {
							if (output.hasClass("snackbars")) {
								output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active error");
							}
						}

						form.clearForm();

						if (select.length) {
							select.select2("val", "");
						}

						form.find('input, textarea').trigger('blur');

						setTimeout(function () {
							output.removeClass("active error success");
							form.removeClass('success');
						}, 3500);
					}
				});
			}
		}

		// parallax scroll
		if($('[data-parallax-scroll]').length && !isNoviBuilder && !isMobile){
			ParallaxScroll.init();
		}

	});
}());
