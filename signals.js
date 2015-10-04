var tracksScheme        = $('#tracks-scheme');
	var activeTrackSelector = $('#active-track');
	var loadImage           = activeTrackSelector.val() + '.svg';

$(window).on('load', function() {

	/*===================================================
	 * Načítanie schémy koľajiska pre počiatočný stav
	 *===================================================*/

	tracksScheme.attr('src', loadImage);

	console.log(activeTrackSelector.val());

	activeTrackSelector.on('input', function() {
		loadImage = activeTrackSelector.val() + '.svg';
		tracksScheme.attr('src', loadImage);
	});
});




var switchSpeedInput = $('#switch-speed');
var switchSpeed      = switchSpeedInput.val();

switchSpeedInput.on('input', function() {
	switchSpeed = $(this).val();

	$.each($('.signal-light + .signal-row'), function(i, signalRow) {
		$(signalRow).addClass('show-if-speed-more-than-40');
	});
	$.each($('.signal-light + .signal-row + .signal-row'), function(i, signalRow) {
		$(signalRow).addClass('show-if-speed-more-than-60');
	});
	$.each($('.showing'), function(i, signalRow) {
			$.each($(signalRow).children(), function(j, signalLight) {
				$(signalLight).removeClass('signal-green').addClass('signal-orange');
			});
		});

	if (switchSpeed > 40 && switchSpeed < 100) {
		$.each($('.show-if-speed-more-than-40'), function(i, signalRow) {
			$(signalRow)
				.removeClass('show-if-speed-more-than-40')
				.addClass('showing');
		});
	}

	if (switchSpeed == 80) {
		$.each($('.showing'), function(i, signalRow) {
			$.each($(signalRow).children(), function(j, signalLight) {
				$(signalLight).removeClass('signal-orange').addClass('signal-green');
			});
		});
	}

	if (switchSpeed == 100) {
		$.each($('.show-if-speed-more-than-40'), function(i, signalRow) {
			$(signalRow)
				.removeClass('show-if-speed-more-than-40')
				.addClass('showing');
		});
		$.each($('.show-if-speed-more-than-60'), function(i, signalRow) {
			$(signalRow)
				.removeClass('show-if-speed-more-than-60')
				.addClass('showing');
		});
	}

	/*=================================================================
	 * Zapnutie položiek v bočnom výberovom menu
	 *=================================================================*/

	if (switchSpeed == 60) {
		$.each($('.no-access-when-less-than-60'), function(i, option) {
			$(option).removeClass('no-access-when-less-than-60').addClass('accessible');
		});
	}

	if (switchSpeed == 80) {
		$.each($('.no-access-when-less-than-60'), function(i, option) {
			$(option).removeClass('no-access-when-less-than-60').addClass('accessible');
		});
		$.each($('.no-access-when-less-than-80'), function(i, option) {
			$(option).removeClass('no-access-when-less-than-80').addClass('accessible');
		});
	}

	if (switchSpeed == 100) {
		$.each($('.no-access-when-less-than-60'), function(i, option) {
			$(option).removeClass('no-access-when-less-than-60').addClass('accessible');
		});
		$.each($('.no-access-when-less-than-80'), function(i, option) {
			$(option).removeClass('no-access-when-less-than-80').addClass('accessible');
		});
		$.each($('.no-access-when-less-than-100'), function(i, option) {
			$(option).removeClass('no-access-when-less-than-100').addClass('accessible');
		});
	}
});


var signalTree = {
	'tracksTrack1Active': {
		'L': {
			'caution': {
				'Ab': 'proceed',
				'PrL': 'proceed',
				'L1': 'stop',
				'L2':'stop',
				'L3':'stop',
				'Se1':'stop',
			}
		}
	},
	'tracksTrack2Active': {
		'L': {
			'caution': {
				'Ab': 'proceed',
				'PrL': 'proceed',
				'L': '40kmh',
				'L1': 'stop',
				'L2':'stop',
				'L3':'stop',
				'Se1':'stop',
			}
		}
	}
};

function cloneOjbect(object) {
	return JSON.parse(JSON.stringify(object));
}

var signalTree = new function() {
	var parent = this;
	this.tracksTrack1Active = new function() {
		this.L = new function() {
			this.caution = new function() {
				this.Ab  = 'proceed';
				this.PrL = 'proceed';
				this.L1  = 'stop';
				this.L2  = this.L1;
				this.L3  = this.L1;
				this.Se1 = this.L1;
			};
		};
	};
	this.tracksTrack2Active = new function() {
		this.L           = cloneOjbect(parent.tracksTrack1Active.L);
		this.L.caution.L = '40kmh';
	};
	this.tracksTrack3Active = this.tracksTrack2Active;
	this.tracksTrack5Active = this.tracksTrack2Active;
};

console.log(signalTree);

var signalPlate   = $('.signal-plate');
var signalCaution = $('#signal-caution');
var signalProceed = $('#signal-proceed');
var signalStop    = $('#signal-stop');
var signalShunt   = $('#signal-shunt');
var signal40kmh   = $('#signal-40kmh');
var signal60kmh   = $('#signal-60kmh');
var signal100kmh  = $('#signal-100kmh');

var signalPrLCaution = $('#PrL-caution');

var blinkingSignal = null;


$('#signals li').on('click', function() {

	signalPlate.find('.signal-on').removeClass('signal-on');

	if (blinkingSignal !== null) clearInterval(blinkingSignal);

	$('#signals').find('li').removeClass('active');
	$(this).addClass('active');

	var activeTrack = activeTrackSelector.val();

	switch($(this).attr('id')) {
		case 'caution':
			for (var track in signalTree) {
				if (signalTree.hasOwnProperty(activeTrack)) {
					var mainSignalDependencies = signalTree[activeTrack];
					for (var mainSignal in mainSignalDependencies) {
						var domSignal = $('#' + mainSignal);
						var mainSignalStates = mainSignalDependencies[mainSignal];
						for (var state in mainSignalStates) {
							var clickedSignals = $('#signals > li.active').attr('id');
							if (mainSignalStates.hasOwnProperty(clickedSignals)) {
								turnSignalOn(domSignal.find('[id*="' + state + '"]'));
							}
							for (var dependentSignal in mainSignalStates[state]) {
								var domDependentSignal = $('#' + dependentSignal);
								turnSignalOn(domDependentSignal.find('[id*="' + mainSignalStates[state][dependentSignal] + '"]'));
							}
						}
					}
				}
			}
		break;
		case 'proceed':
		turnSignalOn(signalProceed);
		var signalDependencies = signalTree.L.proceed;
		for (var dependency in signalDependencies) {
			turnSignalOn($('#' + dependency).find('[id*="' + signalDependencies[dependency] + '"]'));
		}
		break;
		case 'stop':
		turnSignalOn(signalStop);
		var signalDependencies = signalTree.L.stop;
		for (var dependency in signalDependencies) {
			turnSignalOn($('#' + dependency).find('[id*="' + signalDependencies[dependency] + '"]'));
		}
		break;
		case 'shunt':
		turnSignalOn(signalShunt);
		break;
		case '40kmh-caution':
		turnSignalOn([signalCaution, signal40kmh]);
		var signalDependencies = signalTree.L._40kmhCaution;
		for (var dependency in signalDependencies) {
			if (dependency == 'PrL') {
				blinkingSignal = signalBlinks(signalPrLCaution, 800);
				continue;
			}
			turnSignalOn($('#' + dependency).find('[id*="' + signalDependencies[dependency] + '"]'));
		}
		break;
		case '40kmh-proceed':
		turnSignalOn([signalProceed, signal40kmh]);
		var signalDependencies = signalTree.L._40kmhProceed;
		for (var dependency in signalDependencies) {
			if (dependency == 'PrL') {
				blinkingSignal = signalBlinks(signalPrLCaution, 800);
				continue;
			}
			console.log(dependency + ' ' + signalDependencies[dependency]);
			turnSignalOn($('#' + dependency).find('[id*="' + signalDependencies[dependency] + '"]'));
		}
		break;
		case 'stop-shunt':
		turnSignalOn(signalStop);
		blinkingSignal = signalBlinks(signalShunt, 800);
		turnOnDependentSignals(signalTree.L.stopShunt);
		break;
		case '40kmh-await-40kmh':
		turnSignalOn(signal40kmh);
		blinkingSignal = signalBlinks(signalCaution, 800);
		turnOnDependentSignals(signalTree.L._40kmhAwait40kmh, 'PrL', 'caution', 800);
		break;
		case '40kmh-await-60kmh':
		turnSignalOn(signal40kmh);
		blinkingSignal = signalBlinks(signalCaution, 400);
		break;
		case '40kmh-await-80kmh':
		turnSignalOn(signal40kmh);
		blinkingSignal = signalBlinks(signalProceed, 800);
		break;
		case '40kmh-await-100kmh':
		turnSignalOn(signal40kmh);
		blinkingSignal = signalBlinks(signalProceed, 400);
		break;
		case '60kmh-caution':
		turnSignalOn([signalCaution, signal40kmh, signal60kmh]);
		changeSignalRowColor(signal60kmh, 'orange', 'green');
		break;
		case '60kmh-proceed':
		turnSignalOn([signalProceed, signal40kmh, signal60kmh]);
		changeSignalRowColor(signal60kmh, 'orange', 'green');
		break;
		case '60kmh-await-40kmh':
		blinkingSignal = signalBlinks(signalCaution, 800);
		changeSignalRowColor(signal60kmh, 'orange', 'green');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '60kmh-await-60kmh':
		blinkingSignal = signalBlinks(signalCaution, 400);
		changeSignalRowColor(signal60kmh, 'orange', 'green');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '60kmh-await-80kmh':
		blinkingSignal = signalBlinks(signalProceed, 800);
		changeSignalRowColor(signal60kmh, 'orange', 'green');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '60kmh-await-100kmh':
		blinkingSignal = signalBlinks(signalProceed, 400);
		changeSignalRowColor(signal60kmh, 'orange', 'green');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '80kmh-caution':
		signalCaution.addClass('signal-on');
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '80kmh-proceed':
		turnSignalOn([signalProceed, signal40kmh, signal60kmh]);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		break;
		case '80kmh-await-40kmh':
		blinkingSignal = signalBlinks(signalCaution, 800);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '80kmh-await-60kmh':
		blinkingSignal = signalBlinks(signalCaution, 400);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '80kmh-await-80kmh':
		blinkingSignal = signalBlinks(signalProceed, 800);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '80kmh-await-100kmh':
		blinkingSignal = signalBlinks(signalProceed, 400);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh]);
		break;
		case '100kmh-caution':
		turnSignalOn([signalCaution, signal40kmh, signal60kmh, signal100kmh]);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		break;
		case '100kmh-proceed':
		turnSignalOn([signalProceed, signal40kmh, signal60kmh, signal100kmh]);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		break;
		case '100kmh-await-40kmh':
		blinkingSignal = signalBlinks(signalCaution, 800);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh, signal100kmh]);
		break;
		case '100kmh-await-60kmh':
		blinkingSignal = signalBlinks(signalCaution, 400);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		turnSignalOn([signal40kmh, signal60kmh, signal100kmh]);
		break;
		case '100kmh-await-80kmh':
		blinkingSignal = signalBlinks(signalProceed, 800);
		turnSignalOn([signal40kmh, signal60kmh, signal100kmh]);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		break;
		case '100kmh-await-100kmh':
		blinkingSignal = signalBlinks(signalProceed, 400);
		turnSignalOn([signal40kmh, signal60kmh, signal100kmh]);
		changeSignalRowColor(signal60kmh, 'green', 'orange');
		break;
	}
});

// Zapne signál návestidla
function turnSignalOn(signal) {
	if (Object.prototype.toString.call(signal) === '[object Array]') {
		for (var i = 0; i < signal.length; i++) {
			signal[i].addClass('signal-on');
		}

		return;
	}

	signal.addClass('signal-on');
}

// Zapne blikajúci signál na zadaný interval
function signalBlinks(signal, interval) {
	return setInterval(function() {
		signal.toggleClass('signal-on');
	}, interval);
}

// Zapne signál návestidla - všetky svetlá v riadku
function changeSignalRowColor(signal, colorOn, colorOff) {
	$.each(signal.children(), function(i, signalLight) {
		$(signalLight)
		.removeClass('signal-' + colorOff)
		.addClass('signal-' + colorOn);
	});
}

function turnOnDependentSignals(signalDependencies, blinkingDependency, blinkingDependencySignal, blinkingDependencySignalTime) {
	for (var dependency in signalDependencies) {
		if (dependency === blinkingDependency) {
			var domBlinkingDependency = $('#' + blinkingDependency).find('[id*="' + blinkingDependencySignal + '"]');
			blinkingSignal = signalBlinks(domBlinkingDependency, blinkingDependencySignalTime);
			continue;
		}

		if (Object.prototype.toString.call(signalDependencies[dependency]) === '[object Array]') {
			var lights = [];
			for (var i = 0; i < signalDependencies[dependency].length; i++) {
				lights.push($('#' + dependency).find('[id*="' + signalDependencies[dependency][i] + '"]'));
			}
			turnSignalOn(lights);
		} else {
			turnSignalOn($('#' + dependency).find('[id*="' + signalDependencies[dependency] + '"]'));
		}
	}
}