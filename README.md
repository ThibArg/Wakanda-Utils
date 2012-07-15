# Wakanda-Utils

_(c) 4D SAS. Author Thibaud Arguillere_

_License: MIT, "Do whatever You Want With the Source Code"_

_Last update: 2012-07-15_

A set of utilities to handle [Wakanda](http://www.wakanda.org) widgets. This code adds features to the to the WAF ([Wakanda Application Framework](http://doc.wakanda.org/Wakanda-Studio/help/Title/en/page2145.html)), client side.


# Usage

Drop the file you need in the "scripts" folder of your "WebFolder", and include it via the GUI Designer, so it is loaded using WAF loader. We recommand to load it firts (reorganize the file inclusion if needed).)

# wafUtils.js

OPT means the parameter is optionnal

##Utilities for all widgets

Extending the [Widget](http://doc.wakanda.org/Wakanda-Studio/help/Title/en/page2145.html) API: The routines are added to the Widget prototype, so you call them from the Widget API. For example:

        $$('myGridId').WU_fadeOut();
        $$('myButtonId').WU_fadeIn();

**Methods:**

        WU_fadeIn(OPT inDuration, OPT inCallback)
        WU_fadeOut(OPT inDuration, OPT inCallback)
        WU_clearTextFields()


##Utilities for Datagrids
Extending the [Grid](http://doc.wakanda.org/Wakanda-Studio/help/Title/en/page2495.html) API: The routines are added to the Grid prototype, so you call them from the Grid API. For example:

        $$(myGridId).WU_hideParts({body: true, buttons: true});

**Methods:**

        WU_hideParts(inParts, OPT inDoFadeOut)
        WU_showParts(inParts, OPT inDoFadeIn)


# wafLocalizer.js

Give a set of original labels (['Cancel', 'Do it', 'Whatever']) and a set of localized labels (['Annuler', 'Allez', 'Quelque chose']), and the utility will replace every label, button title, menu title, placeholder, ... inside the page        

##Usage

        // To be called in the onLoad event of the page
        var loc = new WAFLocalizer(['Cancel', 'Do it', 'Whatever'], ['Annuler', 'Allez', 'Quelue chose']);
        loc.localizeWidgets();
        
        // Also accepts a key-value array:
        var arr = [];
        arr['Cancel'] = 'Annuler';
        arr['Do it'] = "Allez';
        var loc = new WAFLocalizer( arr );
        loc.localizeWidgets();
        

##Methods

        localizeWidgets();
        getVersion()
