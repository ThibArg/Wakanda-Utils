/*	wafLocalizer.js

	Utilities to localize Wakanda Application Framework widgets at runtime

	(c) 4D SAS, author: Thibaud Arguillere
	License: MIT. See the license at the end of this source code

	--------------------------------------
	Versions
	--------------------------------------
	1.0, 2012-07-15
		First version
	
	1.1, 2012-07-16
		Added localizeString()
		Added setOptons()
	
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
			As its name states. Should be called in the onLoad event
		
		localizeString(inString)
			To be used with dynamic strings. An alert for example:
			alert( theLocalizer.localizeString("Everything is gonna be ok.") );
		
		setOptions(inOptions)
			inOptions is an obect. As of today (2012-07-16), the method should
			not end with a 's' because there is only one option ;->
				caseSensitive
					Default value is true
					Passing false => the key value is compared using lowerCase
					and no accent
*/

if(typeof WAFLocalizer === 'undefined') {

	(function _scope_localize() {
		// Shared variables
		var _version = '1.1';
	
		// Constructor accepts either 2 synchronized arrays, or the final, key/value array
		function _WAFLocalizer(inSrceOrFinal, inLocalized) {
			var i, max, _localizedValues = [], _localizedValuesLowerCase = [], _caseSensitive = true;
			
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
			
			
		//--------------------------------------
		// Internal utilities
		//--------------------------------------
			// _getLowerCaseNoAccents assumes inString really is a string
			//--------------------------------------
			function _getLowerCaseNoAccents(inString) {
			//--------------------------------------
				if(inString) {
					return inString.toLowerCase().replace(/[àáâãäå]/g,"a")
										.replace(/[éèêë]/g,"e")
										.replace(/[ìíîï]/g,"i")
										.replace(/[ðòóôõöø]/g,"o")
										.replace(/[ùúûü]/g,"u")
										.replace(/[ýýÿ]/g,"y");
				}
				
				return '';
			}
			
			//--------------------------------------
			function _createLocalizedValuesLowerCase() {
			//--------------------------------------
				var theKey, theKeyLowerCase;
				
				_localizedValuesLowerCase = [];
				for(theKey in _localizedValues) {
					_localizedValuesLowerCase[ _getLowerCaseNoAccents(theKey) ] = _localizedValues[ theKey ];
				}
			}
			
			// Utility that returns the original value if no translation is found
			//--------------------------------------
			function _getLocalizedValue(inSrceValue) {
			//--------------------------------------
				var localized = '';

				if (inSrceValue) {
					localized = _localizedValues[inSrceValue];
					if (!localized) {
						if(_caseSensitive) {
							localized = inSrceValue;
						} else {
							// Create the lowerCase localized values if needed
							if(_localizedValuesLowerCase.length === 0) {
								_createLocalizedValuesLowerCase();
							}
							localized = _localizedValues[ _getLowerCaseNoAccents(inSrceValue) ];
							if(!localized) {
								localized = inSrceValue;
							}
						}
					}
				}

				return localized;
			}
			
		//--------------------------------------
		//Instance methods
		//--------------------------------------
			//--------------------------------------
			this.setOptions = function(inOptions) {
			//--------------------------------------
				if(inOptions) {
					_caseSensitive = typeof inOptions.caseSensitive === 'boolean' ? inOptions.caseSensitive : _caseSensitive;
				}
			}
			
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
					var widget = WAF.widgets[inID];
					if (widget instanceof WAF.Widget) {
						_doIt(widget);
					}
				});
			} // localizeWidgets()

			//--------------------------------------
			this.localizeString = function(inString) {
			//--------------------------------------
				return _getLocalizedValue(inString);
			}
			
			
		} // function _WAFLocalizer
	
		//--------------------------------------
		// Class methods
		//--------------------------------------
		_WAFLocalizer.getVersion = function() {
			return _version;
		}
		
	
		//--------------------------------------
		// Finally, make the whole stuff available everywhere
		//--------------------------------------
		WAFLocalizer = _WAFLocalizer;
		
	})();
	
} // if(typeof wafLocalizer === 'undefined')

/*	License: MIT (http://www.opensource.org/licenses/MIT)

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:
	
	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
*/

// --EOF