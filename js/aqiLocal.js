var XML = new XMLHttpRequest();
var firstRequest = 1;

async function getData() {
	var url = "fetchDataLocal.php";
	XML.onreadystatechange = showValue;
	XML.open("GET", url, true);
	XML.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	XML.send();
}

async function showValue() {
	if (XML.readyState == 4) {
		var data;
		data = XML.responseText;

		var dataSplitArray = data.split(";");
		console.log(dataSplitArray);

		//CDSC-Werte
		var CDSCpm25 = dataSplitArray[1];
		var CDSCpm10 = dataSplitArray[2];
		var CDSCzeitstr = dataSplitArray[0];

		var CDSCDatum = new Date(CDSCzeitstr);
		if (CDSCzeitstr != "-") {
			var CDSCzeit = "Stündlicher Wert vom <b>" + ("0" + CDSCDatum.getDate()).slice(-2) + "." + ("0" + (CDSCDatum.getMonth() + 1)).slice(-2) + "." + CDSCDatum.getFullYear() + "</b> um <b>" + ("0" + CDSCDatum.getHours()).slice(-2) + ":" + ("0" + CDSCDatum.getMinutes()).slice(-2) + ":" + ("0" + CDSCDatum.getSeconds()).slice(-2) + "</b>";
			CDSCtime = CDSCDatum.getTime();
			//kiosk
			await localforage.setItem("time", "Wert am <b>" + ("0" + CDSCDatum.getDate()).slice(-2) + "." + ("0" + (CDSCDatum.getMonth() + 1)).slice(-2) + "." + CDSCDatum.getFullYear() + ", " + ("0" + CDSCDatum.getHours()).slice(-2) + ":" + ("0" + CDSCDatum.getMinutes()).slice(-2) + " Uhr</b>");
		} else {
			var CDSCzeit = "CDSC-Station ist offline!";
		}

		if (CDSCpm25 != "-" && CDSCpm10 != "-") {
			CDSCpm25 = parseFloat(CDSCpm25).toFixed(2);
			CDSCpm10 = parseFloat(CDSCpm10).toFixed(2);
		}

		if (firstRequest == 0) {
			if (CDSCpm25 == "-" || CDSCpm10 == "-") {
				CDSCzeit = await localforage.getItem("CDSCzeit");
				CDSCpm25 = await localforage.getItem("CDSCpm25");
				CDSCpm10 = await localforage.getItem("CDSCpm10");
			}
		}

		await localforage.setItem("CDSCzeit", CDSCzeit);
		await localforage.setItem("CDSCpm25", CDSCpm25);
		await localforage.setItem("CDSCpm10", CDSCpm10);

		firstRequest = 0;

		await aqipm25();
		await aqipm10();
		await compareaqi();
		await displayData();
	}
}


async function setData(pm10, pm25) {
	await localforage.setItem("36pm25", pm25);
	await localforage.setItem("36pm10", pm10);

	await localforage.setItem("CDSCpm25", pm25);
	await localforage.setItem("CDSCpm10", pm10);

	await localforage.setItem("GISpm25", pm25);
	await localforage.setItem("GISpm10", pm10);

	//CallFunctions
	await aqipm25();
	await aqipm10();
	await compareaqi();
	await displayData();
}

async function aqipm25() {
	await calcaqi25("CDSCpm25", "CDSCaqi25", "AQI25CDSC");
}

async function aqipm10() {
	await calcaqi10("CDSCpm10", "CDSCaqi10", "AQI10CDSC");
}

async function compareaqi() {
	var aqi10 = parseFloat(await localforage.getItem("CDSCaqi10"));
	var aqi25 = parseFloat(await localforage.getItem("CDSCaqi25"));

	var aqi = Math.max(aqi10, aqi25);
	console.log(aqi);
	if (isNaN (aqi) || aqi == 0) {
		await localforage.setItem("AQI", "Offline!");
		await localforage.setItem("AQIkiosk", "Offline!");
	} else {
		await localforage.setItem("AQI", aqi.toFixed(2));
		await localforage.setItem("AQIkiosk", aqi.toFixed(0));
	}

	setIcon();


}

async function calcaqi25(pm25div, AQI25div, AQI25td) {
	var pm1 = 0;
	var pm2 = 12;
	var pm3 = 35.4;
	var pm4 = 55.4;
	var pm5 = 150.4;
	var pm6 = 250.4;
	var pm7 = 350.4;
	var pm8 = 500.4;

	var aqi1 = 0;
	var aqi2 = 50;
	var aqi3 = 100;
	var aqi4 = 150;
	var aqi5 = 200;
	var aqi6 = 300;
	var aqi7 = 400;
	var aqi8 = 500;

	if (await localforage.getItem(pm25div) != "-") {
		var pm25 = parseFloat(await localforage.getItem(pm25div));

		if (pm25 >= pm1 && pm25 <= pm2) {
			var aqipm25 = ((aqi2 - aqi1) / (pm2 - pm1)) * (pm25 - pm1) + aqi1;
		} else if (pm25 >= pm2 && pm25 <= pm3) {
			var aqipm25 = ((aqi3 - aqi2) / (pm3 - pm2)) * (pm25 - pm2) + aqi2;
		} else if (pm25 >= pm3 && pm25 <= pm4) {
			var aqipm25 = ((aqi4 - aqi3) / (pm4 - pm3)) * (pm25 - pm3) + aqi3;
		} else if (pm25 >= pm4 && pm25 <= pm5) {
			var aqipm25 = ((aqi5 - aqi4) / (pm5 - pm4)) * (pm25 - pm4) + aqi4;
		} else if (pm25 >= pm5 && pm25 <= pm6) {
			var aqipm25 = ((aqi6 - aqi5) / (pm6 - pm5)) * (pm25 - pm5) + aqi5;
		} else if (pm25 >= pm6 && pm25 <= pm7) {
			var aqipm25 = ((aqi7 - aqi6) / (pm7 - pm6)) * (pm25 - pm6) + aqi6;
		} else if (pm25 >= pm7 && pm25 <= pm8) {
			var aqipm25 = ((aqi8 - aqi7) / (pm8 - pm7)) * (pm25 - pm7) + aqi7;
		}
		console.log(aqipm25);
		await localforage.setItem(AQI25div, aqipm25.toFixed(2));
	} else {
		await localforage.setItem(AQI25div, "Kein PM2.5-Wert");
	}
}

async function calcaqi10(pm10div, AQI10div, AQI10td) {
	var pm1 = 0;
	var pm2 = 54;
	var pm3 = 154;
	var pm4 = 254;
	var pm5 = 354;
	var pm6 = 424;
	var pm7 = 504;
	var pm8 = 604;

	var aqi1 = 0;
	var aqi2 = 50;
	var aqi3 = 100;
	var aqi4 = 150;
	var aqi5 = 200;
	var aqi6 = 300;
	var aqi7 = 400;
	var aqi8 = 500;

	if (await localforage.getItem(pm10div) != "-") {
		var pm10 = parseFloat(await localforage.getItem(pm10div));

		if (pm10 >= pm1 && pm10 <= pm2) {
			var aqipm10 = ((aqi2 - aqi1) / (pm2 - pm1)) * (pm10 - pm1) + aqi1;
		} else if (pm10 >= pm2 && pm10 <= pm3) {
			var aqipm10 = ((aqi3 - aqi2) / (pm3 - pm2)) * (pm10 - pm2) + aqi2;
		} else if (pm10 >= pm3 && pm10 <= pm4) {
			var aqipm10 = ((aqi4 - aqi3) / (pm4 - pm3)) * (pm10 - pm3) + aqi3;
		} else if (pm10 >= pm4 && pm10 <= pm5) {
			var aqipm10 = ((aqi5 - aqi4) / (pm5 - pm4)) * (pm10 - pm4) + aqi4;
		} else if (pm10 >= pm5 && pm10 <= pm6) {
			var aqipm10 = ((aqi6 - aqi5) / (pm6 - pm5)) * (pm10 - pm5) + aqi5;
		} else if (pm10 >= pm6 && pm10 <= pm7) {
			var aqipm10 = ((aqi7 - aqi6) / (pm7 - pm6)) * (pm10 - pm6) + aqi6;
		} else if (pm10 >= pm7 && pm10 <= pm8) {
			var aqipm10 = ((aqi8 - aqi7) / (pm8 - pm7)) * (pm10 - pm7) + aqi7;
		}
		console.log(aqipm10);
		await localforage.setItem(AQI10div, aqipm10.toFixed(2));

	} else {
		await localforage.setItem(AQI10div, "Kein PM10-Wert");
	}
}

function setColor(aqivalue, AQItd) {
	if (aqivalue < 50) {
		document.getElementById(AQItd).style.backgroundColor = "#00ff00";
		document.getElementById(AQItd).style.color = "black";
	} else if (aqivalue < 100) {
		document.getElementById(AQItd).style.backgroundColor = "#ffff00";
		document.getElementById(AQItd).style.color = "black";
	} else if (aqivalue < 150) {
		document.getElementById(AQItd).style.backgroundColor = "#ff9900";
		document.getElementById(AQItd).style.color = "black";
	} else if (aqivalue < 200) {
		document.getElementById(AQItd).style.backgroundColor = "#ff0000";
		document.getElementById(AQItd).style.color = "black";
	} else if (aqivalue < 300) {
		document.getElementById(AQItd).style.backgroundColor = "#cc0000";
		document.getElementById(AQItd).style.color = "white";
	} else if (aqivalue < 350) {
		document.getElementById(AQItd).style.backgroundColor = "#674ea7";
		document.getElementById(AQItd).style.color = "white";
	} else if (aqivalue >= 350) {
		document.getElementById(AQItd).style.backgroundColor = "#000000";
		document.getElementById(AQItd).style.color = "white";
	} else if (aqivalue == "Kein PM10-Wert" || aqivalue == "Kein PM2.5-Wert" || aqivalue == "Offline!") {
		document.getElementById(AQItd).style.backgroundColor = "#ffffff";
		document.getElementById(AQItd).style.color = "black";
	}
}

function setFontColor(aqivalue) {
	if (aqivalue < 200) {
		document.getElementById("time").style.color = "black";
		document.getElementById("aPinat").style.color = "black";
	} else if (aqivalue < 350) {
		document.getElementById("time").style.color = "white";
		document.getElementById("aPinat").style.color = "white";
	} else if (aqivalue >= 350) {
		document.getElementById("time").style.color = "white";
		document.getElementById("aPinat").style.color = "white";
	} else if (aqivalue == "Kein PM10-Wert" || aqivalue == "Kein PM2.5-Wert" || aqivalue == "Offline!") {
		document.getElementById("time").style.color = "black";
		document.getElementById("aPinat").style.color = "black";
	}
}

function setStyle(aqivalue, site) {
	if (aqivalue < 100) {
		document.getElementById("action").style.textAlign = "center";
		document.getElementById("action").style.paddingLeft = "0px";
	} else if (aqivalue < 350) {
		document.getElementById("action").style.textAlign = "left";
		document.getElementById("action").style.paddingLeft = "25px";
	} else if (aqivalue >= 350) {
		document.getElementById("action").style.textAlign = "center";
		document.getElementById("action").style.paddingLeft = "0px";
	} else if (aqivalue == "Kein PM10-Wert" || aqivalue == "Kein PM2.5-Wert" || aqivalue == "Offline!") {
		document.getElementById("action").style.textAlign = "center";
		document.getElementById("action").style.paddingLeft = "0px";
		if (site == "main") {
			document.getElementById("info-header").style.backgroundColor = "#008CBA";
			document.getElementById("info-header").style.color = "white";
			document.getElementById("info-footer").style.backgroundColor = "#008CBA";
			document.getElementById("info-footer").style.color = "white";
		}
	}
}

function setFontSize(aqivalue) {
	if (aqivalue < 100) {
		document.getElementById("action").style.fontSize = "250%";
	} else if (aqivalue < 150) {
		document.getElementById("action").style.fontSize = "200%";
	} else if (aqivalue < 200) {
		document.getElementById("action").style.fontSize = "175%";
	} else if (aqivalue < 350) {
		document.getElementById("action").style.fontSize = "150%";
	} else if (aqivalue >= 350) {
		document.getElementById("action").style.fontSize = "200%";
	} else if (aqivalue == "Kein PM10-Wert" || aqivalue == "Kein PM2.5-Wert" || aqivalue == "Offline!") {
		document.getElementById("action").style.fontSize = "200%";
	}
}

function setAction(aqivalue, site) {
	if (aqivalue < 50) {
		document.getElementById("action").innerHTML = action[0].action;
	} else if (aqivalue < 100) {
		document.getElementById("action").innerHTML = action[1].action;
	} else if (aqivalue < 150) {
		document.getElementById("action").innerHTML = action[2].action;
	} else if (aqivalue < 200) {
		document.getElementById("action").innerHTML = action[3].action;
	} else if (aqivalue < 300) {
		document.getElementById("action").innerHTML = action[4].action;
	} else if (aqivalue < 350) {
		document.getElementById("action").innerHTML = action[5].action;
	} else if (aqivalue >= 350) {
		document.getElementById("action").innerHTML = action[6].action;
	} else if (aqivalue == "Kein PM10-Wert" || aqivalue == "Kein PM2.5-Wert" || aqivalue == "Offline!") {
		document.getElementById("action").innerHTML = action[7].action;
	}

	if (site == "main") {
		if (aqivalue < 50) {
			document.getElementById("colordesc").innerHTML = action[0].colordesc;
			document.getElementById("actionextra").innerHTML = action[0].actionextra;
		} else if (aqivalue < 100) {
			document.getElementById("colordesc").innerHTML = action[1].colordesc;
			document.getElementById("actionextra").innerHTML = action[1].actionextra;
		} else if (aqivalue < 150) {
			document.getElementById("colordesc").innerHTML = action[2].colordesc;
			document.getElementById("actionextra").innerHTML = action[2].actionextra;
		} else if (aqivalue < 200) {
			document.getElementById("colordesc").innerHTML = action[3].colordesc;
			document.getElementById("actionextra").innerHTML = action[3].actionextra;
		} else if (aqivalue < 300) {
			document.getElementById("colordesc").innerHTML = action[4].colordesc;
			document.getElementById("actionextra").innerHTML = action[4].actionextra;
		} else if (aqivalue < 350) {
			document.getElementById("colordesc").innerHTML = action[5].colordesc;
			document.getElementById("actionextra").innerHTML = action[5].actionextra;
		} else if (aqivalue >= 350) {
			document.getElementById("colordesc").innerHTML = action[6].colordesc;
			document.getElementById("actionextra").innerHTML = action[6].actionextra;
		} else if (aqivalue == "Kein PM10-Wert" || aqivalue == "Kein PM2.5-Wert" || aqivalue == "Offline!") {
			document.getElementById("colordesc").innerHTML = action[7].colordesc;
			document.getElementById("actionextra").innerHTML = action[7].actionextra;
		}
	}
}

function setIcon(aqivalue) {
	if (aqivalue < 50) {
		document.getElementById("ico").setAttribute("href", "images/00ff00.png");
	} else if (aqivalue < 100) {
		document.getElementById("ico").setAttribute("href", "images/ffff00.png");
	} else if (aqivalue < 150) {
		document.getElementById("ico").setAttribute("href", "images/ff9900.png");
	} else if (aqivalue < 200) {
		document.getElementById("ico").setAttribute("href", "images/ff0000.png");
	} else if (aqivalue < 300) {
		document.getElementById("ico").setAttribute("href", "images/cc0000.png");
	} else if (aqivalue < 350) {
		document.getElementById("ico").setAttribute("href", "images/674ea7.png");
	} else if (aqivalue >= 350) {
		document.getElementById("ico").setAttribute("href", "images/000000.png");
	}
}

var action = {
	"0": {
		"colordesc": "Gut (AQI bis 49)",
		"action": "Keine Einschränkungen",
		"actionextra": "-"
	},
	"1": {
		"colordesc": "Moderat (AQI 50 - 99)",
		"action": "Keine Einschränkungen",
		"actionextra": "-"
	},
	"2": {
		"colordesc": "Ungesund für sensible Gruppen (AQI 100 - 149)",
		"action": "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Sportunterricht & AGs finden nur mit geringen Belastungen statt.</li><li>Außenaktivitäten im Kindergarten finden nur in einem geringen Umfang statt.</li>",
		"actionextra": "-"
	},
	"3": {
		"colordesc": "Ungesund (AQI 150 - 199)",
		"action": "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Alle halten sich nach Möglichkeit in geschlossenen Räumen auf.*</li><li>Der Sportunterricht findet im Klassenraum statt.</li><li>Die Sport AGs entfallen.**</li>",
		"actionextra": "* Die Entscheidung, ob die Andacht stattfindet oder die Klassenlehrer mit ihren Klassen in den Klassenraum gehen, wird in der Dienstbesprechung getroffen. Als Richtwert gilt ein AQI von 175.<br>** Die Entscheidung, ob die AGs stattfinden oder entfallen, wird um 13:15 Uhr von Schulleitung und Athletic Director getroffen und umgehend veröffentlicht. Gleiches gilt für CMAC Wettbewerbe."
	},
	"4": {
		"colordesc": "Sehr Ungesund (AQI 200 - 299)",
		"action": "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Geschlossene Räume werden nur in Ausnahmefällen (wie z.B. Raumwechsel, Toilettengang, kurzer Gang zur Kantine) verlassen.</li><li>Der Sportunterricht findet im Klassenraum statt.</li><li>Schutzmasken werden nach Möglichkeit getragen.</li><li>Schulschluss nach dem Mittagessen.*</li>",
		"actionextra": "* Schulschluss ab 12:15 Uhr bzw. 13:05 Uhr und Absage der AGs, sobald der Wert am Vormittag für zwei Stunden > 250 ist. Die Kantine bleibt in Absprache mit der Schulleitung geöffnet. Das Mittagessen kann im Klassenraum eingenommen werden."
	},
	"5": {
		"colordesc": "Gesundheitsschädigend (AQI 300 - 399)",
		"action": "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Alle halten sich in geschlossenen Räumen auf.</li><li>Geschlossene Räume werden nur in dringenden Ausnahmefällen (wie z.B. Raumwechsel, Toilettengang) verlassen.</li><li>Der Sportunterricht findet im Klassenraum statt.</li><li>Schutzmasken werden zur Verfügung gestellt und nach Möglichkeit getragen.</li><li>Schulschluss zum Mittagessen.*</li>",
		"actionextra": "* Schulschluss ab 12:15 Uhr bzw. 13:05 Uhr und Absage der AGs, sobald der Wert am Vormittag für zwei Stunden > 250 ist. Die Kantine wird in Absprache mit der Schulleitung geschlossen. Ggf. kann das Mittagessen noch im Klassenraum eingenommen werden."
	},
	"6": {
		"colordesc": "Gefährlich (AQI ab 400)",
		"action": "Schulfrei*",
		"actionextra": "* Schulfrei, wenn der Durchschnittswert von 5:00 Uhr bis 7:00 Uhr > 350 ist. Entscheidung und Bekanntgabe durch die Schulleitung und Athletic Director um 07:15 Uhr."
	},
	"7": {
		"colordesc": "Offline!",
		"action": "Offline!",
		"actionextra": "-"
	}
}

function chart() {
	var xml = new XMLHttpRequest();
	var url = "fetchDataChart.php";
	var chartload = 0;
	var CDSCchart

	xml.onreadystatechange = function() {
		if (xml.readyState == 4 && xml.status == 200) {
			var dataCDSC = JSON.parse(xml.responseText);
			var j = dataCDSC.length / 3;
			console.log(j);
			var labels = [];
			var pm25data = [];
			var pm10data = [];

			for (var i = 0; i < j; i++) {
				var time = dataCDSC[0 + 3 * i] + "+00";
				labels.push(time);
			}
			labels.reverse();

			for (var i = 0; i < j; i++) {
				var pm10 = dataCDSC[1 + 3 * i];
				pm10data.push(pm10);
			}
			pm10data.reverse();

			for (var i = 0; i < j; i++) {
				var pm25 = dataCDSC[2 + 3 * i];
				pm25data.push(pm25);
			}
			pm25data.reverse();

			if (chartload == 0) {
				var ctx = document.getElementById("ChartCDSC").getContext('2d');
				Chart.defaults.global.defaultFontFamily = "'Myriad Pro'";
				Chart.defaults.global.defaultFontSize = 15;
				document.getElementById("ChartCDSC").style.backgroundColor = "white";
				CDSCchart = new Chart(ctx, {
					type: 'line',
					data: {
						labels: labels,
						datasets: [{
							label: 'AQI PM10',
							data: pm10data,
							backgroundColor: "rgba(0,0,255,0.4)",
							fillColor: "rgba(0,0,255,0.2)",
							strokeColor: "rgba(0,0,255,1)",
							pointColor: "rgba(0,0,255,1)",
							pointStrokeColor: "#fff",
						}, {
							label: 'AQI PM2.5',
							data: pm25data,
							backgroundColor: "rgba(255,0,0,0.4)",
							fillColor: "rgba(255,0,0,0.2)",
							strokeColor: "rgba(255,0,0,1)",
							pointColor: "rgba(255,0,0,1)",
							pointStrokeColor: "#fff",
						}]
					},
					options: {
						title: {
							display: true,
							text: "CDSC: AQI der letzten 24 Stunden",
							fontSize: 30
						},
						scales: {
							xAxes: [{
								type: 'time',
								time: {
									displayFormats: {
										hour: 'HH:mm'
									},
									unit: "hour"
								}
							}]
						}
					}
				});
				chartload = 1;
				console.log('CDSCchart geladen.');
			} else {
				CDSCchart.data.labels = labels;
				CDSCchart.data.datasets[0].data = pm10data;
				CDSCchart.data.datasets[1].data = pm25data;
				CDSCchart.update();
			}


		}
	};
	xml.open("GET", url, true);
	xml.send();
}