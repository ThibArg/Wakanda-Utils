/*	wafUtils

	2012-06-03
	
	A set of utilities to handle Wakanda (http://wakanda.org) widgets. This code adds features
	to the WAF (Wakanda Application Framework) client side.
	
	Some utilities may become deprecated when a new version of Wakanda implements the feature, that's
	why all methods start with the "WU_" prefix (WU = Wakanda Utilities). For example, it is likely
	that in a short future, the Widget API will allow to show/hide a widget with routines like
	fadeIn() and fadeOut(). Here, you will find the WU_fadeIn() and WU_fadeOut() code. Once the WAF
	implements the feature, one can just replace (in all .js files) every call to WU_fadeIn with a
	call to fadeIn.
	
	Original source code by Thibaud Arguillere.
	Source code under the MIT license (see at the end of this file).
	
	-------------------------------------------------------------------------------
	Usage
	-------------------------------------------------------------------------------
		Drop the file in the "scripts" folder of your "WebFolder", and include it
		via the GUI Designer, so it is loaded using WAF loader. We recommand to
		load it firts (reorganize the file inclusion if needed).)
	
	
	-------------------------------------------------------------------------------
	List of routines. _OPT_ means the parameter is optionnal
	-------------------------------------------------------------------------------
	* Utilities for all widgets
		Extending the Widget API: The routines are added to the Widget prototype, so you
		call them from the Widget API. For example:
				$$('myGridId').WU_fadeOut();
				$$('myButtonId').WU_fadeIn();

		WU_fadeIn(_OPT_ inDuration, _OPT_ inCallback)
		WU_fadeOut(_OPT_ inDuration, _OPT_ inCallback)

		WU_clearTextFields()
			Call setValue('') for every widget of kind TextField inside the caller.
			Warning: This works only for the first level of the widget


	* Utilities for Datagrids
		Extending the Grid API: The routines are added to the Grid prototype, so you
		call them from the Grid API. For example:
				$$(myGridId).WU_hideParts({body: true, buttons: true});

		WU_hideParts(inParts, _OPT_ inDoFadeOut)
			inParts is an object, than may contain one or several boolean properties:
			body, footer, buttons, footerInfos
			ex. : $$(myGridId).WU_hideParts({body: true, buttons: true});

		WU_showParts(inParts, _OPT_ inDoFadeIn)
			inParts is an object, than may contain one or several boolean properties:
			body, footer, buttons, footerInfos
			ex. : $$(myGridId).WU_showParts({body: true, buttons: true});
			
			
*/
if(typeof WU === 'undefined') {
	WU = {};
	
	// --------------------------------------------
	WU.getVersion = function() {
	// --------------------------------------------
		return "1.1";
	}
	
	
	function _buildLocalizedArray(inSrce, inDest, inoutResult) {
		var i, max, ok = false;

		if (inSrce && inDest && inSrce.length && inDest.length && inSrce.length === inDest.length) {
			for (i = 0, max = inSrce.length; i < max; i++) {
				inoutResult[ inSrce[i] ] = inDest[i];
			}
			ok = true;
		}
		return ok;
	}

	// --------------------------------------------
	WU.localizeArray = function(inSrce, inDest, inoutResult) {
	// --------------------------------------------
		_buildLocalizedArray(inSrce, inDest, inoutResult);
	}

	// --------------------------------------------
	WU.localizeWidgets = function(inSrce, inDest) {
		// --------------------------------------------
		var _localized = [],
			i, max;

		function _init() {
			_localized = [];
			return _buildLocalizedArray(inSrce, inDest, _localized);
		}

		// Utility that returns the original value if no translation is found
		function _getLocalizedValue(inSrceValue) {
			var localized = inSrceValue;

			if (inSrceValue) {
				localized = _localized[inSrceValue];
				if (!localized) {
					localized = inSrceValue;
				}
			}

			return localized;
		}

		// Main routine, exhanging the values depending on the kind of widget
		function _doIt(inWidget) {
			var subWidgets, container, label, anArray, anObject;

			if (inWidget) {
				switch (inWidget.kind) {
				case 'dataGrid':
					inWidget.columns().forEach(function(inColumn) {
						inColumn.title = _getLocalizedValue(inColumn.title);
						inColumn.gridview._private.globals.headerContainerNode.cells[inColumn.columnNumber].title.html(inColumn.title);
					});
					break;

				case 'autoForm':
					// Hum, the autoForm class can be used for an autoForm or a queryForm
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
							label = inWidget.getLabel();
							if (label) {
								label.setValue(_getLocalizedValue(label.getValue()));
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

		if (_init()) {
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
	}
	
	//	===========================================
	//	Widget
	//	===========================================
	// Save microseconds by resolving WAF.Widget.prototype just once
	var _WIDGET_PROTOTYPE = WAF.Widget.prototype;
	// --------------------------------------------
	_WIDGET_PROTOTYPE.WU_fadeOut = function(inDuration, inCallback) {
	// --------------------------------------------
		if (typeof inDuration === "undefined") {
			inDuration = '';
		}
		
		if (typeof inCallback !== "function") {
			inCallback = null;
		}
		$("#" + this.id).fadeOut(inDuration, inCallback);
	}
	
	// --------------------------------------------
	_WIDGET_PROTOTYPE.WU_fadeIn = function(inDuration, inCallback) {
	// --------------------------------------------
		if (typeof inDuration === "undefined") {
			inDuration = '';
		}
		
		if (typeof inCallback !== "function") {
			inCallback = null;
		}
		$("#" + this.id).fadeIn(inDuration, inCallback);
	}
	
	// --------------------------------------------
	_WIDGET_PROTOTYPE.WU_clearTextFields = function() {
	// --------------------------------------------
		this.getChildren().forEach(function(inWidget) {
			if(inWidget && inWidget.kind === 'textField') {
				inWidget.setValue('');
			}
		});
	}

	//	===========================================
	//	Grid
	//	===========================================
	// Save microseconds by resolving WAF.classes.DataGrid.prototype just once
	var _GRID_PROTOTYPE = WAF.classes.DataGrid.prototype;
	
	// Hard coded class names. If WAF changes, just change the values according
	// to the version (WAF.version)
	var _CLASS_DG_BODY = ".waf-dataGrid-body";
	var _CLASS_DG_FOOTER = ".waf-dataGrid-footer";
	var _CLASS_DG_FOOTER_STATUS = ".waf-dataGrid-footer .waf-status-element";
	var _CLASS_DG_FOOTER_BUTTONS = ".waf-dataGrid-footer .waf-toolbar";
	var _CLASS_DG_FOOTER_INFOS = ".waf-dataGrid-footer .waf-status-center"
	
	// --------------------------------------------
	_GRID_PROTOTYPE.WU_hideParts = function(inParts, inDoFadeOut) {
	// --------------------------------------------
		var jqueryPrefix = "#" + this.id + " ";
		var fnToCall;

		if(inDoFadeOut) {
			fnToCall = $.fn.fadeOut;
		} else {
			fnToCall = $.fn.hide;
		}
					
		if(inParts.body) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_BODY) );
		}
		
		if(inParts.footer) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_FOOTER_STATUS) );
		}
		
		if(inParts.buttons) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_FOOTER_BUTTONS) );
		}
		
		if(inParts.footerInfos) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_FOOTER_INFOS) );
		}
	}
	

	// --------------------------------------------
	_GRID_PROTOTYPE.WU_showParts = function(inParts, inDoFadeIn) {
	// --------------------------------------------
		var jqueryPrefix = "#" + this.id + " ";
		var fnToCall;

		if(inDoFadeOut) {
			fnToCall = $.fn.fadeIn;
		} else {
			fnToCall = $.fn.hide;
		}
		
		if(inParts.body) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_BODY) );
		}
		
		if(inParts.footer) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_FOOTER_STATUS) );
		}
		
		if(inParts.buttons) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_FOOTER_BUTTONS) );
		}
		
		if(inParts.footerInfos) {
			fnToCall.apply( $(jqueryPrefix + _CLASS_DG_FOOTER_INFOS) );
		}
	}	
}


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

// --EOF--