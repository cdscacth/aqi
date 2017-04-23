var XML = new XMLHttpRequest();

async function getData() {
	var url = "fetchData.php";
	XML.onreadystatechange = showValue;
	XML.open("GET", url, true);
	XML.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	XML.send();
}

async function showValue(callback) {
	if (XML.readyState == 4) {
		var data;
		data = XML.responseText;

		var dataSplitArray = data.split(";");
		console.log(dataSplitArray);

		var _36pm25 = dataSplitArray[1];
		console.log(_36pm25);
		var _36pm10 = dataSplitArray[2];
		var zeitstr = dataSplitArray[0];

		if (zeitstr === "-") {
			var _36zeit = "aqmthai.com ist nicht verfügbar!";
		} else {
			var zeitarr = zeitstr.split(",");
			var stunde = parseFloat(zeitarr[3]) + 1;
			var _36Datum = new Date(zeitarr[0] + "-" + zeitarr[1] + "-" + zeitarr[2] + " " + stunde + ":" + zeitarr[4] + ":" + zeitarr[5]);
			_36time = _36Datum.getTime();
			if (stunde >= 10) {
				var _36zeit = "Stündlicher Wert vom <b>" + zeitarr[2] + "." + zeitarr[1] + "." + zeitarr[0] + "</b> um <b>" + stunde + ":" + zeitarr[4] + ":" + zeitarr[5] + "</b>";

			} else {
				var _36zeit = "Stündlicher Wert vom <b>" + zeitarr[2] + "." + zeitarr[1] + "." + zeitarr[0] + "</b> um <b> 0" + stunde + ":" + zeitarr[4] + ":" + zeitarr[5] + "</b>";
			}
			console.log(_36zeit);
		}

		if (_36pm25 != "-" && _36pm10 != "-") {
			_36pm25 = parseFloat(_36pm25).toFixed(2);
			_36pm10 = parseFloat(_36pm10).toFixed(2);
		}

		await localforage.setItem("36zeit", _36zeit);
		await localforage.setItem("36pm25", _36pm25);
		await localforage.setItem("36pm10", _36pm10);

		//CDSC-Werte
		var CDSCpm25 = dataSplitArray[4];
		console.log(CDSCpm25);

		var CDSCpm10 = dataSplitArray[6];
		console.log(CDSCpm10);

		var CDSCzeitstr = dataSplitArray[3];
		var CDSCDatum = new Date(CDSCzeitstr);
		CDSCDatum.setHours(CDSCDatum.getHours() + 7);
		if (CDSCzeitstr != "-") {
			var CDSCzeit = "Stündlicher Wert vom <b>" + ("0" + CDSCDatum.getDate()).slice(-2) + "." + ("0" + (CDSCDatum.getMonth() + 1)).slice(-2) + "." + CDSCDatum.getFullYear() + "</b> um <b>" + ("0" + CDSCDatum.getHours()).slice(-2) + ":" + ("0" + CDSCDatum.getMinutes()).slice(-2) + ":" + ("0" + CDSCDatum.getSeconds()).slice(-2) + "</b>";
			CDSCtime = CDSCDatum.getTime();
			//kiosk
			await localforage.setItem("time", "Wert am <b>" + ("0" + CDSCDatum.getDate()).slice(-2) + "." + ("0" + (CDSCDatum.getMonth() + 1)).slice(-2) + "." + CDSCDatum.getFullYear() + ", " + ("0" + CDSCDatum.getHours()).slice(-2) + " Uhr</b>");
		} else {
			var CDSCzeit = "CDSC-Station ist offline!";
		}

		if (CDSCpm25 != "-" && CDSCpm10 != "-") {
			CDSCpm25 = parseFloat(CDSCpm25).toFixed(2);
			CDSCpm10 = parseFloat(CDSCpm10).toFixed(2);
		}

		await localforage.setItem("CDSCzeit", CDSCzeit);
		await localforage.setItem("CDSCpm25", CDSCpm25);
		await localforage.setItem("CDSCpm10", CDSCpm10);

		

		//GIS-Werte
		var GISpm25 = dataSplitArray[9];
		console.log(GISpm25);

		var GISpm10 = dataSplitArray[11];
		console.log(GISpm10);

		var GISzeitstr = dataSplitArray[8];

		var GISDatum = new Date(GISzeitstr);
		GISDatum.setHours(GISDatum.getHours() + 7);

		if (GISzeitstr != "-") {
			var GISzeit = "Stündlicher Wert vom <b>" + ("0" + GISDatum.getDate()).slice(-2) + "." + ("0" + (GISDatum.getMonth() + 1)).slice(-2) + "." + GISDatum.getFullYear() + "</b> um <b>" + ("0" + GISDatum.getHours()).slice(-2) + ":" + ("0" + GISDatum.getMinutes()).slice(-2) + ":" + ("0" + GISDatum.getSeconds()).slice(-2) + "</b>";
			GIStime = GISDatum.getTime();
		} else {
			var GISzeit = "GIS-Station ist offline!";
		}

		if (GISpm25 != "-" && GISpm10 != "-") {
			GISpm25 = parseFloat(GISpm25).toFixed(2);
			GISpm10 = parseFloat(GISpm10).toFixed(2);
		}

		await localforage.setItem("GISzeit", GISzeit);
		await localforage.setItem("GISpm25", GISpm25);
		await localforage.setItem("GISpm10", GISpm10);

		await aqipm25();
		await aqipm10();
		await aqiavg();
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
	await aqiavg();
	await compareaqi();
	await displayData();
}

async function aqipm25() {
	await calcaqi25("36pm25", "36aqi25", "AQI2536");

	await calcaqi25("CDSCpm25", "CDSCaqi25", "AQI25CDSC");

	await calcaqi25("GISpm25", "GISaqi25", "AQI25GIS");
}

async function aqipm10() {
	await calcaqi10("36pm10", "36aqi10", "AQI1036");

	await calcaqi10("CDSCpm10", "CDSCaqi10", "AQI10CDSC");

	await calcaqi10("GISpm10", "GISaqi10", "AQI10GIS");
}

async function aqiavg() {
	var _36pm25 = await localforage.getItem("36aqi25");
	var _36pm10 = await localforage.getItem("36aqi10");
	var CDSCaqi25 = await localforage.getItem("CDSCaqi25");
	var CDSCaqi10 = await localforage.getItem("CDSCaqi10");
	var GISaqi25 = await localforage.getItem("GISaqi25");
	var GISaqi10 = await localforage.getItem("GISaqi10");
	var arrayAQI10 = [];
	var arrayAQI25 = [];

	if (_36pm25 != "Kein PM2.5-Wert") {
		var i = arrayAQI25.length;
		arrayAQI25[i] = parseFloat(_36pm25);
	}

	if (GISaqi25 != "Kein PM2.5-Wert") {
		var i = arrayAQI25.length;
		arrayAQI25[i] = parseFloat(GISaqi25);
	}

	if (_36pm10 != "Kein PM10-Wert") {
		var i = arrayAQI10.length;
		arrayAQI10[i] = parseFloat(_36pm10);
	}

	if (GISaqi10 != "Kein PM10-Wert") {
		var i = arrayAQI10.length;
		arrayAQI10[i] = parseFloat(GISaqi10);
	}

	//PM2.5
	if (CDSCaqi25 != "Kein PM2.5-Wert") {
		var sumaqi25 = 0;
		for (var i = 0; i < arrayAQI25.length; i++) {
			sumaqi25 += arrayAQI25[i];
		}

		if (isNaN (sumaqi25) || sumaqi25 == 0) {
			var aqiavg25CDSC = parseFloat(CDSCaqi25);
		} else {
			var aqiavg25 = sumaqi25 / arrayAQI25.length;

			var aqiavg25CDSC = (aqiavg25 + parseFloat(CDSCaqi25)) / 2;
		}

		await localforage.setItem("AQIavg25", aqiavg25CDSC.toFixed(2));

		setColor(aqiavg25CDSC, "AQI25tr");
	} else {
		var sumaqi25 = 0;
		for (var i = 0; i < arrayAQI25.length; i++) {
			sumaqi25 += arrayAQI25[i];
		}
		var aqiavg25 = sumaqi25 / arrayAQI25.length;

		await localforage.setItem("AQIavg25", aqiavg25.toFixed(2));

		setColor(aqiavg25, "AQI25tr");
	}

	//PM10
	if (CDSCaqi10 != "Kein PM10-Wert") {
		var sumaqi10 = 0;
		for (var i = 0; i < arrayAQI10.length; i++) {
			sumaqi10 += arrayAQI10[i];
		}
		if (isNaN (sumaqi10) || sumaqi10 == 0) {
			var aqiavg10CDSC = parseFloat(CDSCaqi10);
		} else {
			var aqiavg10 = sumaqi10 / arrayAQI10.length;

			var aqiavg10CDSC = (aqiavg10 + parseFloat(CDSCaqi10)) / 2;
		}
		await localforage.setItem("AQIavg10", aqiavg10CDSC.toFixed(2));

		setColor(aqiavg10CDSC, "AQI10tr");
	} else {
		var sumaqi10 = 0;
		for (var i = 0; i < arrayAQI10.length; i++) {
			sumaqi10 += arrayAQI10[i];
		}
		var aqiavg10 = sumaqi10 / arrayAQI10.length;

		await localforage.setItem("AQIavg10", aqiavg10.toFixed(2));

		setColor(aqiavg10, "AQI10tr");
	}
}

async function compareaqi() {
	var aqiavg10 = parseFloat(await localforage.getItem("AQIavg10"));
	var aqiavg25 = parseFloat(await localforage.getItem("AQIavg25"));

	var aqi = Math.max(aqiavg10, aqiavg25);
	console.log(aqi);
	if (isNaN (aqi) || aqi == 0) {
		await localforage.setItem("AQI", "Offline!");
		await localforage.setItem("AQIkiosk", "Offline!");
	} else {
		await localforage.setItem("AQI", aqi.toFixed(2));
		await localforage.setItem("AQIkiosk", aqi.toFixed(0));
	}
	setColor(aqi, "AQItr");
	setColor(aqi, "info-header");
	setColor(aqi, "info-footer");

	setIcon();

	if (aqi < 50) {
		await localforage.setItem("colordesc", "Gut (AQI bis 49)");
		await localforage.setItem("action", "Keine Einschränkungen");
		await localforage.setItem("action.style.textAlign", "center");
		await localforage.setItem("action.style.paddingLeft", "0px");
		await localforage.setItem("action.style.fontSize", "250%");
		await localforage.setItem("actionextra", "-");
	} else if (aqi < 100) {
		await localforage.setItem("colordesc", "Moderat (AQI 50 - 99)");
		await localforage.setItem("action", "Keine Einschränkungen");
		await localforage.setItem("action.style.textAlign", "center");
		await localforage.setItem("action.style.paddingLeft", "0px");
		await localforage.setItem("action.style.fontSize", "250%");
		await localforage.setItem("actionextra", "-");
	} else if (aqi < 150) {
		await localforage.setItem("colordesc", "Ungesund für sensible Gruppen (AQI 100 - 149)");
		await localforage.setItem("action", "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Sportunterricht & AGs finden nur mit geringen Belastungen statt.</li><li>Außenaktivitäten im Kindergarten finden nur in einem geringen Umfang statt.</li>");
		await localforage.setItem("action.style.textAlign", "left");
		await localforage.setItem("action.style.paddingLeft", "25px");
		await localforage.setItem("action.style.fontSize", "200%");
		await localforage.setItem("actionextra", "-");
	} else if (aqi < 200) {
		await localforage.setItem("colordesc", "Ungesund (AQI 150 - 199)");
		await localforage.setItem("action", "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Alle halten sich nach Möglichkeit in geschlossenen Räumen auf.*</li><li>Der Sportunterricht findet im Klassenraum statt.</li><li>Die Sport AGs entfallen.**</li>");
		await localforage.setItem("action.style.textAlign", "left");
		await localforage.setItem("action.style.paddingLeft", "25px");
		await localforage.setItem("action.style.fontSize", "175%");
		await localforage.setItem("actionextra", "* Die Entscheidung, ob die Andacht stattfindet oder die Klassenlehrer mit ihren Klassen in den Klassenraum gehen, wird in der Dienstbesprechung getroffen. Als Richtwert gilt ein AQI von 175.<br>** Die Entscheidung, ob die AGs stattfinden oder entfallen, wird um 13:15 Uhr von Schulleitung und Athletic Director getroffen und umgehend veröffentlicht. Gleiches gilt für CMAC Wettbewerbe.");
	} else if (aqi < 300) {
		await localforage.setItem("colordesc", "Sehr Ungesund (AQI 200 - 299)");
		await localforage.setItem("action", "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Geschlossene Räume werden nur in Ausnahmefällen (wie z.B. Raumwechsel, Toilettengang, kurzer Gang zur Kantine) verlassen.</li><li>Der Sportunterricht findet im Klassenraum statt.</li><li>Schutzmasken werden nach Möglichkeit getragen.</li><li>Schulschluss nach dem Mittagessen.*</li>");
		await localforage.setItem("action.style.textAlign", "left");
		await localforage.setItem("action.style.paddingLeft", "25px");
		await localforage.setItem("action.style.fontSize", "150%");
		await localforage.setItem("actionextra", "* Schulschluss ab 12:15 Uhr bzw. 13:05 Uhr und Absage der AGs, sobald der Wert am Vormittag für zwei Stunden > 250 ist. Die Kantine bleibt in Absprache mit der Schulleitung geöffnet. Das Mittagessen kann im Klassenraum eingenommen werden.");
	} else if (aqi < 350) {
		await localforage.setItem("colordesc", "Gesundheitsschädigend (AQI 300 - 399)");
		await localforage.setItem("action", "<li>Fenster und Türen geschlossen halten. Klimaanlagen werden eingeschaltet.<li>Alle halten sich in geschlossenen Räumen auf.</li><li>Geschlossene Räume werden nur in dringenden Ausnahmefällen (wie z.B. Raumwechsel, Toilettengang) verlassen.</li><li>Der Sportunterricht findet im Klassenraum statt.</li><li>Schutzmasken werden zur Verfügung gestellt und nach Möglichkeit getragen.</li><li>Schulschluss zum Mittagessen.*</li>");
		await localforage.setItem("action.style.textAlign", "left");
		await localforage.setItem("action.style.paddingLeft", "25px");
		await localforage.setItem("action.style.fontSize", "150%");
		await localforage.setItem("actionextra", "* Schulschluss ab 12:15 Uhr bzw. 13:05 Uhr und Absage der AGs, sobald der Wert am Vormittag für zwei Stunden > 250 ist. Die Kantine wird in Absprache mit der Schulleitung geschlossen. Ggf. kann das Mittagessen noch im Klassenraum eingenommen werden.");
	} else if (aqi >= 350) {
		await localforage.setItem("colordesc", "Gefährlich (AQI ab 400)");
		await localforage.setItem("action", "Schulfrei*");
		await localforage.setItem("action.style.textAlign", "center");
		await localforage.setItem("action.style.paddingLeft", "0px");
		await localforage.setItem("action.style.fontSize", "250%");
		await localforage.setItem("actionextra", "* Schulfrei, wenn der Durchschnittswert von 5:00 Uhr bis 7:00 Uhr > 350 ist. Entscheidung und Bekanntgabe durch die Schulleitung und Athletic Director um 07:15 Uhr.");
	}
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
		await localforage.setItem(AQI25div, aqipm25.toFixed(2))

		setColor(aqipm25, AQI25td);

	} else {
		await localforage.setItem(AQI25div, "Kein PM2.5-Wert");
		await localforage.setItem(AQI25td + ".style.backgroundColor", "white");
		await localforage.setItem(AQI25td + ".style.Color", "black");
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

		setColor(aqipm10, AQI10td);

	} else {
		await localforage.setItem(AQI10div, "Kein PM10-Wert");
		await localforage.setItem(AQI10td + ".style.backgroundColor", "white");
		await localforage.setItem(AQI10td + ".style.Color", "black");
	}
}

async function setColor(aqivalue, AQItd) {
	if (aqivalue < 50) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#00ff00");
		await localforage.setItem(AQItd + ".style.color", "black");
	} else if (aqivalue < 100) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#ffff00");
		await localforage.setItem(AQItd + ".style.color", "black");
	} else if (aqivalue < 150) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#ff9900");
		await localforage.setItem(AQItd + ".style.color", "black");
	} else if (aqivalue < 200) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#ff0000");
		await localforage.setItem(AQItd + ".style.color", "black");
	} else if (aqivalue < 300) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#cc0000");
		await localforage.setItem(AQItd + ".style.color", "white");
	} else if (aqivalue < 400) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#674ea7");
		await localforage.setItem(AQItd + ".style.color", "white");
	} else if (aqivalue >= 400) {
		await localforage.setItem(AQItd + ".style.backgroundColor", "#000000");
		await localforage.setItem(AQItd + ".style.color", "white");
	}
}

async function setIcon() {
	var aqi = parseFloat(await localforage.getItem("AQI"));

	if (aqi < 50) {
		document.getElementById("ico").setAttribute("href", "images/00ff00.png");
	} else if (aqi < 100) {
		document.getElementById("ico").setAttribute("href", "images/ffff00.png");
	} else if (aqi < 150) {
		document.getElementById("ico").setAttribute("href", "images/ff9900.png");
	} else if (aqi < 200) {
		document.getElementById("ico").setAttribute("href", "images/ff0000.png");
	} else if (aqi < 300) {
		document.getElementById("ico").setAttribute("href", "images/cc0000.png");
	} else if (aqi < 400) {
		document.getElementById("ico").setAttribute("href", "images/674ea7.png");
	} else if (aqi >= 400) {
		document.getElementById("ico").setAttribute("href", "images/000000.png");
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