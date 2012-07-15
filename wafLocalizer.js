/*	wafLocalizer.js

	Version 1.0, 2012-07-15

	Utilities to localize Wakanda Application Framework widgets at runtime

	(c) 4D SAS, author: Thibaud Arguillere
	License: MIT. See the license at the end of this source code
	
	--------------------------------------
	Usage
	--------------------------------------
		// To be called, probably, in the onLoad event of the page
		var loc = new WAFLocalizer(['Cancel', 'Launch', 'Build'], ['Annuler', 'Démarrer', 'Construire']);
		loc.localizeWidgets();

	or	var arr = [];
		arr['Cancel'] = 'Annuler';
		arr['Launch'] = 'Démarrer';
		arr['Build'] = 'Construire';
	
		var loc = new WAFLocalizer(arr);
		loc.localizeWidgets();
			
	--------------------------------------
	Constructor
	--------------------------------------
		new WAFLocalizer(inSrceValues, inLocalizedValues)
		new WAFLocalizer(inKeyValueArray)
	
	--------------------------------------
	Class methods
	--------------------------------------
		getVersion()
	
	--------------------------------------
	Instance methods
	--------------------------------------
		localizeWidgets()
*/

if(typeof WAFLocalizer === 'undefined') {
		
	(function _scope_localize() {
		// Shared variables
		var _version = '1.0';
	
		// Constructor accepts either 2 synchronized arrays, or the final, key/value array
		function _WAFLocalizer(inSrceOrFinal, inLocalized) {
			var i, max, _localizedValues = [], _ignoreSrceCase = false;
			
			// Build the key/value array
			if(inSrceOrFinal && !inLocalized) {
				_localizedValues = inSrceOrFinal;
			} else if (inSrceOrFinal && inLocalized && inSrceOrFinal.length && inLocalized.length && inSrceOrFinal.length === inLocalized.length) {
				for (i = 0, max = inSrceOrFinal.length; i < max; i++) {
					_localizedValues[ inSrceOrFinal[i] ] = inLocalized[i];
				}
			} else {
				throw new TypeError(inSrceOrFinal)
			}
			
			// Utility that returns the original value if no translation is found
			//--------------------------------------
			function _getLocalizedValue(inSrceValue) {
			//--------------------------------------
				var localized = inSrceValue;

				if (inSrceValue) {
					localized = _localizedValues[inSrceValue];
					if (!localized) {
						localized = inSrceValue;
					}
				}

				return localized;
			}
			
		//--------------------------------------
		//Instance methods
		//--------------------------------------
			
			//--------------------------------------
			this.localizeWidgets = function() {
			//--------------------------------------
				// Main routine, exchanging the values depending on the kind of widget
				function _doIt(inWidget) {
					var subWidgets, container, labelObj, anArray, anObject, aProperty, aValue;

					if (inWidget) {
						switch (inWidget.kind) {
						case 'dataGrid':
							inWidget.columns().forEach(function(inColumn) {
								inColumn.title = _getLocalizedValue(inColumn.title);
								inColumn.gridview._private.globals.headerContainerNode.cells[inColumn.columnNumber].title.html(inColumn.title);
							});
							break;

						case 'autoForm':
						case 'queryForm':
							// Hum, the autoForm class can be used for an autoForm or a queryForm...
							anArray = $('#' + inWidget.id + ' .waf-form-att-label-text');
							if (anArray.length > 0) { // We have a true autoform
								for (i = 0, max = anArray.length; i < max; i++) {
									anObject = anArray[i];
									anObject.innerText = _getLocalizedValue(anObject.innerText);
								}
							}
							else {
								anArray = $('#' + inWidget.id + ' .attribute-div');
								if (anArray.length > 0) { // We have a queryform
									for (i = 0, max = anArray.length; i < max; i++) {
										anObject = anArray[i];
										anObject.innerText = _getLocalizedValue(anObject.innerText);
									}
								}
							}
							break;
						
						case 'login':
							/*
							labels: Object
								loginAction: "Login"
								loginButton: "Login"
								loginTitle: "Login Dialog"
								logoutAction: "Logout"
								noUserDisplay: ""
								passwordLabel: "Password: "
								userDisplay: "Signed in as "
								userLabel: "User:
							*/
							if(inWidget.labels) {
								for(aProperty in inWidget.labels) {
									aValue = inWidget.labels[aProperty];
									if(aValue && typeof aValue === 'string') {
										inWidget.labels[aProperty] = _getLocalizedValue(aValue);
									}
								}
							}
							inWidget.refresh();
							break;

						default:
							subWidgets = null;
							// Every menuItem of a menuBar is part of WAF.widgets => we don't
							// need to handle them separatly with getChildren()
							if (inWidget.kind !== 'menuBar') {
								subWidgets = inWidget.getChildren();
							}

							if (subWidgets && subWidgets.length > 0) {
								subWidgets.forEach(function(inSubWidget) {
									_doIt(inSubWidget);
								});
							}
							else {
								switch (inWidget.kind) {
								case 'button':
								case 'label':
								case 'richText':
									inWidget.setValue(_getLocalizedValue(inWidget.getValue()));
									break;

								case 'menuItem':
									debugger;
									inWidget.domNode.innerText = _getLocalizedValue(inWidget.domNode.innerText);
									break;

								}

								if (inWidget.getLabel) {
									labelObj = inWidget.getLabel();
									if (labelObj) {
										labelObj.setValue(_getLocalizedValue(labelObj.getValue()));
									}
								}

								if (inWidget.domNode && inWidget.domNode.placeholder) {
									inWidget.domNode.placeholder = _getLocalizedValue(inWidget.domNode.placeholder);
								}
							}
							break;
						}
					}
				}

				Object.keys(WAF.widgets).forEach(function(inID) {
					// WAF.widgets is an object, wich contains also properties
					// that are not widgets ("_length" for example)
					// Just checking some properties of any widget
					var widget = WAF.widgets[inID];
					if (widget instanceof WAF.Widget) {
						_doIt(widget);
					}
				});
			}
		} // function _WAFLocalizer
	
		//--------------------------------------
		// Class methods
		//--------------------------------------
		_WAFLocalizer.getVersion = function() {
			return _version;
		}
		
	
		//--------------------------------------
		// Finally, make the whole stuff avilable everywhere
		//--------------------------------------
		WAFLocalizer = _WAFLocalizer;
		
	})();
	
} // if(typeof wafLocalizer === 'undefined')
