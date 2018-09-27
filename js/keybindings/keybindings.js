var Mousetrap = require('mousetrap')
const fs = require('fs')
const dialog = require('electron').remote.dialog

// Variables used to access HTML elements for DOM manipulation

var tabs_li = document.getElementById('flow-navbar').getElementsByClassName('nav-item')
var tabs = document.getElementById('flow-navbar').getElementsByClassName('nav-link')
var flows = document.getElementsByClassName('tab-pane')

// Variables used for tab switching through hotkeys

var index = 0
var mouseClicked = true
var tabDeleted = false

// Variables used to implement constraints on add deletion
var advNum;
if (flow_type == 'LD Plan Flow') {
    advNum = 6
}
else {
    advNum = 7
}

var offNum;
if (flow_type == 'LD Plan Flow') {
    offNum = 6
}
else {
    offNum = 7
}

var vex = require('vex-js')
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os'


var x
var w

// Font Weight Configuration
var bold_cell_tD = []

// Variables for saving the flow

var fileName = ""
var loadedData
var dataSuccess = false
var tD = false
var loadedOnce = false;

// Speech-Doc Removal
var speechDocRemoved = false;

// Variables for storing auto-complete data

const Store = require('electron-store');
const store = new Store();

var autocomplete = {
    'c1': 'Contention 1',
    'c2': 'Contention 2',
    'c3': 'Contention 3',
    'c4': 'Contention 4',
    'c5': 'Contention 5',
    'c6': 'Contention 6',
    'c7': 'Contention 7',
    'c8': 'Contention 8',
    'c9': 'Contention 9',
    'c10': 'Contention 10',
    'o1': 'Off 1',
    'o2': 'Off 2',
    'o3': 'Off 3',
    'o4': 'Off 4',
    'o5': 'Off 5',
    'o6': 'Off 6',
    'o7': 'Off 7',
    'o8': 'Off 8',
    'o9': 'Off 9',
    'obs': 'Observations',
    'Adv1': 'Advantage 1',
    'Adv2': 'Advantage 2',
    'Adv3': 'Advantage 3',
    'Adv4': 'Advantage 4',
    'Adv5': 'Advantage 5',
    'Adv6': 'Advantage 6',
    'o10': 'Off 10',
    'fw': 'Framework',
    'def': 'Definitions',
    'im': 'Impact',
    'vm': 'value: morality',
    'stsv': 'standard is mitigating structural violence',
    'stmsw': 'standard is maximizing societal welfare',
    'stmew': 'standard is maximizing expected wellbeing',
    'stut': 'maximizing utility',
    'stcomm': 'standard is consistency with communal obligations',
    'strl': 'standard is respecting liberty',
    'goo': 'Goodin 95',
    'k83': 'Korsgaard 83',
    'k93': 'Korsgaard 93',
    'b02': 'Bostrom 02',
    'b11': 'Bostrom 11',
    'win': 'Winter and Leighton 99',
    'int': 'Interp -',
    'vio': 'Violation -',
    'sta': 'Standards',
    'vot': 'Voters',
    'ecd': 'Econ Da',
    'cpk': 'Cap K',
    'ak': 'Afropess K'
}

var fontColor = {
    'affFontColor': '#ff2600',
    'negFontColor': '#076BFF',
    'affShadeColor': '#ffffff',
    'negShadeColor': '#ffffff'
}


if (store.has('autocomplete') == false) {
    store.set('autocomplete', autocomplete)
}
else {
    autocomplete = store.get('autocomplete')
}

if (store.has('fontColor') == false) {
    store.set('fontColor', fontColor)
}
else {
    var o = store.get('fontColor')
    affFontColor = o['affFontColor']
    negFontColor = o['negFontColor']
    affShadeColor = o['affShadeColor']
    negShadeColor = o['negShadeColor']
}

/* 
    Selects all the first cells of the flow: This is to make sure that handsontable 
    doesn't return undefined when getSelected() is called.
*/
selectAllCells()


/* Mousetrap js: adds keybindings for keyboard shortcuts to navigate the flow */


/* Adds keybindg to switch to the previous tab */

Mousetrap.bind(['command+o', 'ctrl+o'], function () {
    previousTab()
}, 'keyup');

/* Adds keybindg to switch to the next tab */

Mousetrap.bind(['command+p', 'ctrl+p'], function () {
    nextTab()
}, 'keyup');


/* Puts focus on the cell when the tab is selected/clicked */

$('#flow-navbar a').on('click', function (e) {

    var rc = selectCell_rc[index];
    var r = rc[0]
    var c = rc[1]
    handsontable_flows[index].selectCell(r, c);

})



/* 
    The flow is switched and the index is updated AFTER the user has selected/clicked the tab.
    This prevents the overlapping of flows when the user quickly switches tab and forces the 
    code to be executed synchronously.
*/

$('#flow-navbar li').on('shown.bs.tab', function (e) {

    /* 
        The manual switching of flows will only be called if the user switches tabs through
        the keyboard shortcut. B/c if clicked by mouse, bootstrap will automatically take 
        care of that.
    */
    if (!mouseClicked) {
        switchFlow();
    }
    mouseClicked = true;
    index = $(this).index();

    var rc = selectCell_rc[index];
    var r = rc[0]
    var c = rc[1]
    handsontable_flows[index].selectCell(r, c);

    for (x = 0; x < bold_RC[index].length; x++) {
        var a = bold_RC[index][x]
        var r = a[0]
        var c = a[1]

        if (typeof r != 'undefined' && typeof c != 'undefined') {

            if (typeof handsontable_flows[index].getCell(r, c) != 'undefined') {
                handsontable_flows[index].getCell(r, c).style.fontWeight = 'bold'
                bold_cell_tD.push(handsontable_flows[index].getCell(r, c))

            }
        }

    }
})

/* Adds Tab */

Mousetrap.bind(['command+k', 'ctrl+k'], function () {

    if (flow_type == 'LD Plan Flow' || flow_type == 'Policy Flow') {
        addAdvTab(() => {
        })
    }

    advNum = advNum + 1

})

Mousetrap.bind(['command+j', 'ctrl+j'], function () {

    if (flow_type == 'LD Plan Flow' || flow_type == 'Policy Flow') {
        addOffTab(() => {
        })
    }

    offNum = offNum + 1

})


Mousetrap.bind(['command+y', 'ctrl+y'], function () {
    $('#ephox_mytextarea').toggle()

    if(!speechDocRemoved){
        speechDocRemoved = true

        $('.plan-container').css({
            "position":"absolute","height":"100vh","width":"100vw"
        })
        $('.ephox-polish-html-switch').remove()

        $(window).resize()
    }
    else{
        speechDocRemoved = false

        $('.plan-container').css({
            "position":"absolute","height":"100vh","width":"68.80152187698161vw"
        })
        $('.ephox-polish-html-switch').remove()

        $(window).resize()

    }
}, 'keyup');

/* 
    Deletes the current tab. A tab can only be deleted in order of the flow tabs i.e you can only
    deleted the ADV's in order starting from 5; this also applies to the Off's.
*/

Mousetrap.bind(['command+i', 'ctrl+i'], function () {

    deleteTab()
    resizeFlowHeight()
    tD = true

})

/* 
   User selects the file and it loaded into the flow if the 
   flow-type and file type is correct.
*/

Mousetrap.bind(['commands + d', 'ctrl+d'], function () {

    if (tD == false && loadedOnce == false) {
        dialog.showOpenDialog((fileNames) => {
            if (fileNames === undefined) {
                console.log("No file selected");
                return;
            }
            var fileName = fileNames[0];

            x = fileName.split('/')
            w = x[x.length - 1].split('.')

            fs.readFile(fileName, 'utf-8', (err, data) => {
                if (err) {
                    alert("An error ocurred reading the file :" + err.message);
                    return;
                }
                try {
                    loadedData = JSON.parse(data);
                    dataSuccess = true
                }
                catch (err) {
                    vex.dialog.alert('Error: Only .json files can be loaded')
                }
                dataLoaded = true
                loadFlow()
            });
        });
    }

    else {
        vex.dialog.alert('Error: Open a blank flow and load the file ')
    }
})

/* 
    Saves the flow (data json obj) to a json format.    
*/

Mousetrap.bind(['commands + s', 'ctrl+s'], function () {

    data['boldElements'] = bold_RC
    configureTabs()

    var jsonObj = JSON.parse(JSON.stringify(data));
    var jsonContent = JSON.stringify(jsonObj);

    handsontable_flows[index].deselectCell()
    vex.dialog.prompt({
        message: 'Save As',
        placeholder: 'e.g. 1AC vs SJ Round 5',
        width: 100,
        callback: function (value) {
            fileName = value
            fileNamed = true

            selectAllCells()
            if (fileName != '') {
                document.title = fileName
                dialog.showOpenDialog({
                    properties: ['openDirectory']
                }, (filePaths, bookmarks) => {

                    if (filePaths[0] === undefined) {
                        console.log("You didn't save the file");
                        return;
                    }
                    var fP = filePaths[0] + '/' + fileName

                    fs.writeFile(fP + '.json', jsonContent, 'utf8', (err) => {
                        if (err) {
                            alert("An error ocurred creating the file " + err.message)
                        }
                        alert("The file has been succesfully saved");
                    });
                })
            }
        }
    })
    document.getElementsByClassName('vex-dialog-prompt-input')[0].style.width = '95%'
})

/* 
    Allows the user to add a custom key, value for autocomplete
*/
Mousetrap.bind(['commands + t', 'ctrl+t'], function () {

    handsontable_flows[index].deselectCell()
    vex.dialog.prompt({
        message: 'Add autocomplete key and value in the format: key,value',
        placeholder: 'vm, value:morality',
        width: 100,
        callback: function (value) {

            if (value != false) {

                var v = value.split(',')

                if (typeof v[0] != 'undefined') {
                    if (typeof v[1] != 'undefined') {

                        if (v[0] == v[1]) {
                            vex.dialog.alert('You cannot have the same key and value!')
                        }
                        else {
                            autocomplete[v[0]] = v[1]
                            store.set('autocomplete', autocomplete)
                        }
                    }
                }
                else {
                    vex.dialog.alert('Wrong Format! The format is -> key,value: v m, value:morality')
                }

                selectAllCells()
            }

        }
    })
    document.getElementsByClassName('vex-dialog-prompt-input')[0].style.width = '95%'
})


/* Reconfigure PF Speaker */

Mousetrap.bind(['command+l', 'ctrl+l'], function () {
    if (flow_type == 'PF Flow') {
        if (firstSpeaker == 'Pro') {
            switchToCon()
            firstSpeaker = 'Con'
        }
        else {
            switchToPro()
            firstSpeaker = 'Pro'
        }
    }

})

/* Reconfigures flow css when speech-doc is removed */




/* Reconfigure Font Color */

Mousetrap.bind(['command+f', 'ctrl+f'], function () {
    vex.dialog.open({
        message: 'Select a date and color.',
        input: [
            '<style>',
            '.vex-custom-field-wrapper {',
            'margin: 1em 0;',
            '}',
            '.vex-custom-field-wrapper > label {',
            'display: inline-block;',
            'margin-bottom: .2em;',
            '}',
            '</style>',
            '<div class="vex-custom-field-wrapper">',
            '<h4>AFF Font Color</h4>',
            '<div class="vex-custom-input-wrapper">',
            '<input name="color" type="color" value="', affFontColor, '" />',
            '</div>',
            '</div>',
            '<div class="vex-custom-field-wrapper">',
            '<div class="vex-custom-input-wrapper">',
            '<h4>NEG Font Color</h4>',
            '<input name="color" type="color" value="', negFontColor, '" />',
            '</div>',
            '<div class="vex-custom-field-wrapper">',
            '<div class="vex-custom-input-wrapper">',
            '<h4>AFF Column Color</h4>',
            '<input name="color" type="color" value="', affShadeColor, '" />',
            '</div>',
            '<div class="vex-custom-field-wrapper">',
            '<div class="vex-custom-input-wrapper">',
            '<h4>NEG Column Color</h4>',
            '<input name="color" type="color" value="', negShadeColor, '" />',
            '</div>',
            '</div>'
        ].join(''),
        callback: function (data) {
            if (!data) {
                selectAllCells()
                return console.log('Cancelled')
            }
            console.log('Color', data.color)
            selectAllCells()


            fontColor['affFontColor'] = data.color[0]
            fontColor['negFontColor'] = data.color[1]

            affFontColor = data.color[0]
            negFontColor = data.color[1]

            fontColor['affShadeColor'] = data.color[2]
            fontColor['negShadeColor'] = data.color[3]
            store.set('fontColor', fontColor)


            affShadeColor = data.color[2]
            negShadeColor = data.color[3]

            for (i = 0; i < handsontable_flows.length; i++) {
                handsontable_flows[i].render()
            }

            for (i = 0; i < bold_cell_tD.length; i++) {
                bold_cell_tD[i].style.fontWeight = 'bold'
            }


        }
    })
})

/* Reconfigure Font Weight */

Mousetrap.bind(['command+b', 'ctrl+b'], function () {

    var rc = handsontable_flows[index].getSelected()
    var r = rc[0]
    var c = rc[1]
    var tDElement = handsontable_flows[index].getCell(r, c)

    if (tDElement.style.fontWeight == 'bold') {
        tDElement.style.fontWeight = ''
        bold_cell_tD.splice(bold_cell_tD.indexOf(tDElement), 1)
    }
    else {
        tDElement.style.fontWeight = 'bold'
        bold_cell_tD.push(tDElement)
        bold_RC[index].push([r, c])
    }

})

/* 
    Switches to the next tab. This is done in accordance an index variable 
    which is increased everytime you go right and decreased when you go left.
    The index is then used to access the tab element's ID, which is then clicked
    through jQuery. Before switching, the row and column of the previous cell 
    is updated
*/

function nextTab() {

    if (!tabDeleted) {
        reset_rc()
    }

    mouseClicked = false;

    if (index < tabs.length - 1) {

        index = index + 1;
        var id = tabs[index].id;
        var reference = '#' + id;
        $(document).ready(function () {
            $(reference).click();
        });
    }

    else {
        index = 0;
        var id = tabs[index].id;
        var reference = '#' + id;
        $(document).ready(function () {
            $(reference).click();
        });

    }

}

/* 
    Switches to the previous tab. This is done in accordance an index variable 
    which is increased everytime you go right and decreased when you go left.
    The index is then used to access the tab element's ID, which is then clicked
    through jQuery. Before switching, the row and column of the previous cell 
    is updated
*/
function previousTab() {


    if (!tabDeleted) {
        reset_rc()
    }
    tabDeleted = false
    mouseClicked = false;

    if (index > 0) {

        index = index - 1;
        var id = tabs[index].id;
        var reference = '#' + id;
        $(document).ready(function () {
            $(reference).click();
        });
    }
    else {
        index = tabs.length - 1;
        var id = tabs[index].id;
        var reference = '#' + id;
        $(document).ready(function () {
            $(reference).click();
        });


    }
}

function addAdvTab(callback) {

    /* Element we are inserting the Adv after */

    var prevElement = flows[index]
    $('<div class="AC tab-pane fade" id="Adv-' + advNum + '-tab" role="tabpanel" aria-labelledby="Adv' + advNum + '">Adv' + advNum + '</div>').insertAfter(prevElement)

    prevElement = tabs_li[index]
    $('<li class="tab nav-item" id="Adv' + advNum + '-li"><input class="txt" type="text"/><a class="nav-link text-white" id="Adv' + advNum + '" data-toggle="pill" href="#Adv-' + advNum + '-tab" role="tab" aria-controls="Adv-' + advNum + '-tab" aria-selected="false">Adv ' + '</a></li>').insertAfter(prevElement)

    var con_id = 'Adv-' + advNum + '-tab'
    var con = document.getElementById(con_id)

    var cols;
    var minCol;
    if (flow_type == 'LD Plan Flow') {
        cols = ['AC', '1NR', '1AR', '2NR', '2AR']
        minCol = 5
    }
    else {
        cols = ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR']
        minCol = 7
    }

    Handsontable.renderers.registerRenderer('ac_flowRenderer', ac_flowRenderer);

    handsontable_flows.splice(index + 1, 0, new Handsontable(con, {
        colHeaders: cols,
        minCols: minCol,
        minRows: 35,
        width: 500,
        height: 500,
        viewportRowRenderingOffsetequal: 35,
        viewportColumnRenderingOffset: 5,
        colWidths: 190,
        fillHandle: {
            autoInsertRow: true
        },
        minSpareRows: true,
        cells: function (row, col) {
            var cellProperties = {};
            var data = this.instance.getData();

            cellProperties.renderer = 'ac_flowRenderer'; // uses lookup map

            return cellProperties;
        }
    }))


    setTimeout(() => {
        resizeFlowHeight()
        for (i = 0; i < handsontable_flows.length; i++) {
            if (handsontable_flows[i].countCols() == 4) {
                widthoffSet = 0.24615384615384617
            }
            else {
                widthoffSet = 0.19487179487179487
            }
            handsontable_flows[i].updateSettings({
                width: document.getElementById('df').offsetWidth - 16,
                colWidths: (document.getElementById('df').offsetWidth - 16) * widthoffSet,
                afterChange(changes) {

                    var auto_used = false;

                    if (!dataLoaded) {
                        for (i = 0; i < bold_cell_tD.length; i++) {
                            bold_cell_tD[i].style.fontWeight = 'bold'
                        }

                        data['flow-data'][index] = handsontable_flows[index].getData()

                        /* Autocomplete Feature */
                        changes.forEach(([row, prop, oldValue, newValue]) => {

                            var textLine = newValue.split(" ")

                            for (i = 0; i < textLine.length; i++) {
                                if (typeof autocomplete[textLine[i]] != 'undefined') {
                                    var nV = autocomplete[textLine[i]]
                                    textLine[i] = nV
                                    auto_used = true;
                                }
                            }

                            if (auto_used) {
                                textLine = textLine.join(" ")
                                handsontable_flows[index].setDataAtCell(row, prop, textLine)
                            }

                        });
                    }
                    else {
                        dataLoaded = false
                    }

                }
            });
        }
    }, 10);


    selectCell_rc.splice(index + 1, 0, [0, 0])
    handsontable_flows[index + 1].selectCell(0, 0)

    $('#Adv' + advNum + '-li').on('shown.bs.tab', function (e) {

        if (!mouseClicked) {
            switchFlow();
        }
        mouseClicked = true;
        index = $(this).index();

        var rc = selectCell_rc[index];
        var r = rc[0]
        var c = rc[1]
        handsontable_flows[index].selectCell(r, c);

        for (x = 0; x < bold_RC[index].length; x++) {
            var a = bold_RC[index][x]
            var r = a[0]
            var c = a[1]

            if (typeof r != 'undefined' && typeof c != 'undefined') {

                if (typeof handsontable_flows[index].getCell(r, c) != 'undefined') {
                    handsontable_flows[index].getCell(r, c).style.fontWeight = 'bold'
                    bold_cell_tD.push(handsontable_flows[index].getCell(r, c))

                }
            }

        } if (!mouseClicked) {
            switchFlow();
        }
        mouseClicked = true;
        index = $(this).index();

        var rc = selectCell_rc[index];
        var r = rc[0]
        var c = rc[1]
        handsontable_flows[index].selectCell(r, c);

        for (x = 0; x < bold_RC[index].length; x++) {
            var a = bold_RC[index][x]
            var r = a[0]
            var c = a[1]

            if (typeof r != 'undefined' && typeof c != 'undefined') {

                if (typeof handsontable_flows[index].getCell(r, c) != 'undefined') {
                    handsontable_flows[index].getCell(r, c).style.fontWeight = 'bold'
                    bold_cell_tD.push(handsontable_flows[index].getCell(r, c))

                }
            }

        }
    })

    $('#Adv' + advNum).on('click', function (e) {

        var rc = selectCell_rc[index];
        var r = rc[0]
        var c = rc[1]
        handsontable_flows[index].selectCell(r, c);

    })

    /* User can rename the tab on dblclick */

    $('#Adv' + advNum + '-li').on('dblclick', function () {
        handsontable_flows[index].deselectCell()
        $(this).find('input').toggle().val($(this).find('a').html()).focus();
        $(this).find('a').toggleClass('hidden')
    });

    /* Events on Input */

    $('#Adv' + advNum + '-li').on('keydown blur dblclick', 'input', function (e) {
        if (e.type == "keydown") {
            if (e.which == 13) {
                $(this).toggle();
                $(this).siblings('a').toggle().html($(this).val());
                var f = $(this).parent('.nav-item')[0].id
                $('#' + f).find('a').removeClass('hidden')

                var id = tabs[index].id;
                var reference = '#' + id;
                $(document).ready(function () {
                    $(reference).click();
                });
            }
            if (e.which == 38 || e.which == 40 || e.which == 37 || e.which == 39) {
                e.stopPropagation();
            }
        }
        else if (e.type == "focusout") {
            if ($(this).css('display') == "inline-block") {
                $(this).toggle();
                $(this).siblings('a').toggle().html($(this).val());
                var f = $(this).parent('.nav-item')[0].id
                $('#' + f).find('a').removeClass('hidden')

                var id = tabs[index].id;
                var reference = '#' + id;
                $(document).ready(function () {
                    $(reference).click();
                });

            }
        }
        else {
            e.stopPropagation();
        }
    });


    /* Reconfiguration */

    tabs_li = document.getElementById('flow-navbar').getElementsByClassName('nav-item');
    tabs = document.getElementById('flow-navbar').getElementsByClassName('nav-link');
    flows = document.getElementsByClassName('tab-pane');


    data['flow-data'].splice(index + 1, 0, handsontable_flows[index + 1].getData())
    bold_RC.splice(index + 1, 0, [])


    /* Removes all of Handsontable's licenses */

    var allLiceneses = document.querySelectorAll("#hot-display-license-info");
    $(allLiceneses).remove();

    // nextTab()
    callback()

}


function addOffTab(callback) {

    /* Element we are inserting the Off after */

    var prevElement = flows[index]

    $('<div class="NC tab-pane fade" id="Off-' + offNum + '-tab" role="tabpanel" aria-labelledby="Adv' + offNum + '">Off' + offNum + '</div>').insertAfter(prevElement)

    prevElement = tabs_li[index]
    $('<li class="tab nav-item" id="Off' + offNum + '-li"><input class="txt" type="text"/><a class="nav-link text-white" id="Off' + offNum + '" data-toggle="pill" href="#Off-' + offNum + '-tab" role="tab" aria-controls="Off-' + offNum + '-tab" aria-selected="false">Off ' + '</a></li>').insertAfter(prevElement)

    var con_id = 'Off-' + offNum + '-tab'
    var con = document.getElementById(con_id)

    var cols;
    var minCol;
    if (flow_type == 'LD Plan Flow') {
        cols = ['1NC', '1AR', '2NR', '2AR']
        minCol = 4
    }
    else {
        cols = ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR']
        minCol = 7
    }
    Handsontable.renderers.registerRenderer('nc_flowRenderer', nc_flowRenderer);

    handsontable_flows.splice(index + 1, 0, new Handsontable(con, {
        colHeaders: cols,
        minCols: minCol,
        maxCols: minCol,
        minRows: 35,
        maxRows: 200,
        width: 500,
        height: 500,
        viewportRowRenderingOffsetequal: 35,
        viewportColumnRenderingOffset: 4,
        colWidths: 240,
        fillHandle: {
            autoInsertRow: true
        },
        minSpareRows: true,
        cells: function (row, col) {
            var cellProperties = {};
            var data = this.instance.getData();

            cellProperties.renderer = 'nc_flowRenderer';

            return cellProperties;
        }
    }))
    setTimeout(() => {
        resizeFlowHeight()
        for (i = 0; i < handsontable_flows.length; i++) {
            if (handsontable_flows[i].countCols() == 4) {
                widthoffSet = 0.24615384615384617
            }
            else {
                widthoffSet = 0.19487179487179487
            }
            handsontable_flows[i].updateSettings({
                width: document.getElementById('df').offsetWidth - 16,
                colWidths: (document.getElementById('df').offsetWidth - 16) * widthoffSet,
                afterChange(changes) {

                    var auto_used = false;
                    if (!dataLoaded) {

                        for (i = 0; i < bold_cell_tD.length; i++) {
                            bold_cell_tD[i].style.fontWeight = 'bold'
                        }
                        data['flow-data'][index] = handsontable_flows[index].getData()

                        /* Autocomplete Feature */
                        changes.forEach(([row, prop, oldValue, newValue]) => {

                            var textLine = newValue.split(" ")

                            for (i = 0; i < textLine.length; i++) {
                                if (typeof autocomplete[textLine[i]] != 'undefined') {
                                    var nV = autocomplete[textLine[i]]
                                    textLine[i] = nV
                                    auto_used = true;
                                }
                            }

                            if (auto_used) {
                                textLine = textLine.join(" ")
                                handsontable_flows[index].setDataAtCell(row, prop, textLine)
                            }

                        });
                    }
                    else {
                        dataLoaded = false
                    }

                }
            });
        }
    }, 10);


    selectCell_rc.splice(index + 1, 0, [0, 0])
    data['flow-data'].splice(index + 1, 0, handsontable_flows[index + 1].getData())
    bold_RC.splice(index + 1, 0, [])


    handsontable_flows[index + 1].selectCell(0, 0)


    $('#Off' + offNum + '-li').on('shown.bs.tab', function (e) {

        if (!mouseClicked) {
            switchFlow();
        }
        mouseClicked = true;
        index = $(this).index();

        var rc = selectCell_rc[index];
        var r = rc[0]
        var c = rc[1]
        handsontable_flows[index].selectCell(r, c);

        for (x = 0; x < bold_RC[index].length; x++) {
            var a = bold_RC[index][x]
            var r = a[0]
            var c = a[1]

            if (typeof r != 'undefined' && typeof c != 'undefined') {

                if (typeof handsontable_flows[index].getCell(r, c) != 'undefined') {
                    handsontable_flows[index].getCell(r, c).style.fontWeight = 'bold'
                    bold_cell_tD.push(handsontable_flows[index].getCell(r, c))

                }
            }

        }
    })

    $('#Off' + offNum).on('click', function (e) {

        var rc = selectCell_rc[index];
        var r = rc[0]
        var c = rc[1]
        handsontable_flows[index].selectCell(r, c);

    })

    /* User can rename the tab on dblclick */

    $('#Off' + offNum + '-li').on('dblclick', function () {
        handsontable_flows[index].deselectCell()
        $(this).find('input').toggle().val($(this).find('a').html()).focus();
        $(this).find('a').toggleClass('hidden')
    });

    /* Events on Input */

    $('#Off' + offNum + '-li').on('keydown blur dblclick', 'input', function (e) {
        if (e.type == "keydown") {
            if (e.which == 13) {
                $(this).toggle();
                $(this).siblings('a').toggle().html($(this).val());
                var f = $(this).parent('.nav-item')[0].id
                $('#' + f).find('a').removeClass('hidden')
                var id = tabs[index].id;
                var reference = '#' + id;
                $(document).ready(function () {
                    $(reference).click();
                });
            }
            if (e.which == 38 || e.which == 40 || e.which == 37 || e.which == 39) {
                e.stopPropagation();
            }
        }
        else if (e.type == "focusout") {
            if ($(this).css('display') == "inline-block") {
                $(this).toggle();
                $(this).siblings('a').toggle().html($(this).val());
                var f = $(this).parent('.nav-item')[0].id
                $('#' + f).find('a').removeClass('hidden')
                var id = tabs[index].id;
                var reference = '#' + id;
                $(document).ready(function () {
                    $(reference).click();
                });

            }
        }
        else {
            e.stopPropagation();
        }
    });


    /* Reconfiguration */

    tabs_li = document.getElementById('flow-navbar').getElementsByClassName('nav-item');
    tabs = document.getElementById('flow-navbar').getElementsByClassName('nav-link');
    flows = document.getElementsByClassName('tab-pane');




    /* Removes all of Handsontable's licenses */

    var allLiceneses = document.querySelectorAll("#hot-display-license-info");
    $(allLiceneses).remove();

    // nextTab()
    callback()


}

/* 
    Deletes the current tab in accordance to the current index. More specifically, it deletes the current
    nav-item, nav-link, flow-div and resets the selectedCell, handsontable flows, and tabs array.
*/

function deleteTab() {


    tabDeleted = true
    var deleteTab_index = index
    nextTab()


    //-- Removes the div

    var id = tabs[deleteTab_index].href.split("#")[1]

    for (i = 0; i < flows.length; i++) {
        if (flows[i].id == id) {
            id = '#' + flows[i].id
            $(id).remove()
        }
    }

    //-- Removes the nav-pill
    var id = '#' + tabs[deleteTab_index].id
    $(id).remove()

    //-- Removes the nav-item
    id = '#' + tabs_li[deleteTab_index].id
    $(id).remove()



    //-- Removes handsontable flow
    handsontable_flows.splice(deleteTab_index, 1)

    // Removes data index
    data['flow-data'].splice(deleteTab_index, 1)

    bold_RC.splice(deleteTab_index, 1)


    //-- removes cell row and column element
    selectCell_rc.splice(deleteTab_index, 1)


    tabs_li = document.getElementById('flow-navbar').getElementsByClassName('nav-item');
    tabs = document.getElementById('flow-navbar').getElementsByClassName('nav-link');
    flows = document.getElementsByClassName('tab-pane');

    previousTab()

}

function configureTabs() {

    if (flow_type == 'LD Plan Flow' || flow_type == 'Policy Flow') {
        for (i = 0; i < tabs.length; i++) {
            data['tab-names'][i] = tabs[i].innerHTML

            if (tabs[i].classList.contains('1AC')) {
                data['tab-types'][i] = '1AC'
            }
            else {
                data['tab-types'][i] = '1NC'
            }
        }
    }
}



/* When the user switches tab through keybindings, it manually adds visibility to the selected flow */

function switchFlow() {

    var id = tabs[index].href.split("#")[1]


    for (i = 0; i < flows.length; i++) {


        if (flows[i].id == id) {
            flows[i].classList.add('active');
            flows[i].classList.add('show');
        }
        else {
            flows[i].classList.remove('show');
            flows[i].classList.remove('active');
        }

    }

}

function loadFlow() {
    if (dataSuccess && loadedData['flow_type'] == flow_type) {

        loadedOnce = true
        $('#body').append('<div class="loader" id="pre-loader"></div>')
        document.getElementById('flow-navbar').style.visibility = 'hidden'
        document.getElementById('flows').style.visibility = 'hidden'
        document.getElementById('ephox_mytextarea').style.visibility = 'hidden'
        document.getElementById('mytextarea').style.visibility = 'hidden'

        if (flow_type == 'LD Plan Flow' || flow_type == 'Policy Flow') {

            deleteAllTabs()
            addLoadedTabs(loadData)

        }
        else if (flow_type == 'PF Flow') {
            if (loadedData['firstSpeaker'] == 'Con') {
                switchToCon()
            }
            else {
                if (firstSpeaker == 'Con') {
                    switchToPro()
                }
            }
            loadData()
        }
        else {
            loadData()
        }
        document.title = w[0]
    }
    else {
        if (dataSuccess == true) {
            vex.dialog.alert('Error: Only ' + flow_type + ' can be loaded')
        }
    }
    console.log("The file content is : " + loadedData);
    dataSuccess = false


}

/* Resizes the flow based on the number of tabs */

function resizeFlowHeight() {
    if (document.getElementById('flow-tabs').offsetHeight > 100) {
        for (i = 0; i < handsontable_flows.length; i++) {
            handsontable_flows[i].updateSettings({
                height: document.getElementById('df').offsetHeight - 168,
            })
        }
    }
    else if (document.getElementById('flow-tabs').offsetHeight > 40) {
        for (i = 0; i < handsontable_flows.length; i++) {
            handsontable_flows[i].updateSettings({
                height: document.getElementById('df').offsetHeight - 131,
            })
        }
    }
    else {
        for (i = 0; i < handsontable_flows.length; i++) {
            handsontable_flows[i].updateSettings({
                height: document.getElementById('df').offsetHeight - 94,
            })
        }
    }

    for (i = 0; i < bold_RC.length; i++) {

        for (x = 0; x < bold_RC[i].length; x++) {
            var a = bold_RC[i][x]
            var r = a[0]
            var c = a[1]

            if (typeof r != 'undefined' && typeof c != 'undefined') {

                if (typeof handsontable_flows[i].getCell(r, c) != 'undefined') {
                    handsontable_flows[i].getCell(r, c).style.fontWeight = 'bold'
                    bold_cell_tD.push(handsontable_flows[i].getCell(r, c))

                }
            }
        }
    }
}


/* Selects all cells */

function selectAllCells() {
    for (i = handsontable_flows.length - 1; i >= 0; i--) {
        var rc = selectCell_rc[i];
        var r = rc[0]
        var c = rc[1]
        handsontable_flows[i].selectCell(r, c);
    }
}

/* Deletes all tabs to load customized flow */

function deleteAllTabs() {
    previousTab()
    for (i = 0; i < tabs.length; i++) {

        setTimeout(() => {
            deleteTab()
        }, 100);
    }

}

/* Adds and names the customized tabs */

function addLoadedTabs(callback) {
    var tab_names = loadedData["tab-names"]
    var numOfTabs = tab_names.length
    var tab_types = loadedData["tab-types"]

    for (i = 0; i < numOfTabs; i++) {

        if (tab_types[i] == '1AC') {

            addAdvTab(() => {
                advNum = advNum + 1
                tabs[index].innerHTML = tab_names[i]
            })

        }
        else if (tab_types[i] == '1NC') {


            addOffTab(() => {
                offNum = offNum + 1
                tabs[index].innerHTML = tab_names[i]
            })

        }
    }

    setTimeout(() => {
        callback()
    }, 2000);


}


/* Loads the Data into the Flow */

function loadData() {

    nextTab()
    deleteTab()
    for (i = 0; i < handsontable_flows.length; i++) {
        dataLoaded = true
        handsontable_flows[i].updateSettings({
            data: loadedData['flow-data'][i]
        })
    }

    setTimeout(() => {
        var tab_names = loadedData["tab-names"]
        var numOfTabs = tab_names.length

        for (i = 0; i < numOfTabs; i++) {
            tabs[i].innerHTML = tab_names[i]
        }
    }, 2000);

    setTimeout(() => {
        boldFlow()
    }, 2000);


}



/* updates the selectedCells array everytime the user switches tabs */

function reset_rc() {

    var newRC = handsontable_flows[index].getSelected()
    if (typeof newRC != 'undefined') {
        selectCell_rc[index] = [newRC[0], newRC[1]];
    }

}

function switchToCon() {
    $('#PRO').html('CON')
    $('#NC').html('PRO')

    data['firstSpeaker'] = 'Con'
    dataLoaded = true
    handsontable_flows[0].updateSettings({
        data: [['Con Constructive', 'Pro Rebuttal', 'Con Summary', 'Pro Summary', 'Con Final Focus', 'Pro Final Focus']]
    })

    dataLoaded = true
    handsontable_flows[1].updateSettings({
        data: [['Pro Constructive', 'Con Rebuttal', 'Pro Rebuttal', 'Con Summary', 'Pro Summary', 'Con Final Focus']]
    })
}

function switchToPro() {
    $('#PRO').html('PRO')
    $('#NC').html('CON')

    data['firstSpeaker'] = 'Pro'
    dataLoaded = true
    handsontable_flows[0].updateSettings({
        data: [['Pro Constructive', 'Con Rebuttal', 'Pro Summary', 'Con Summary', 'Pro Final Focus', 'Con Final Focus']],
    })

    dataLoaded = true
    handsontable_flows[1].updateSettings({
        minCol: 7,
        maxCols: 7,
        data: [['Con Constructive', 'Pro Rebuttal', 'Con Rebuttal', 'Pro Summary', 'Con Summary', 'Pro Final Focus', 'Con Final Focus']],
    })
}

function boldFlow() {

    bold_RC = loadedData['boldElements']
    if (loadedOnce) {
        for (i = 0; i < bold_RC.length; i++) {

            for (x = 0; x < bold_RC[i].length; x++) {

                var a = bold_RC[i][x]
                var r = a[0]
                var c = a[1]

                if (typeof r != 'undefined' && typeof c != 'undefined') {

                    if (typeof handsontable_flows[i].getCell(r, c) != 'undefined') {
                        handsontable_flows[i].getCell(r, c).style.fontWeight = 'bold'
                        bold_cell_tD.push(handsontable_flows[i].getCell(r, c))
                    }
                }
            }
        }
    }

    setTimeout(() => {
        switchFlow()
        nextTab()
        previousTab()
        $('.loader').remove()
        document.getElementById('flow-navbar').style.visibility = 'visible'
        document.getElementById('flows').style.visibility = 'visible'
        document.getElementById('ephox_mytextarea').style.visibility = 'visible'
        tabs_li = document.getElementById('flow-navbar').getElementsByClassName('nav-item');
        tabs = document.getElementById('flow-navbar').getElementsByClassName('nav-link');
        flows = document.getElementsByClassName('tab-pane');
        dataLoaded = false
    }, 2000);

    setTimeout(() => {
        data = loadedData
    }, 2000);

}

/* Debuggin utilities: prints out the class list of every flow and tab div */

function getClassNames() {

    var classnames;

    for (i = 0; i < flows.length; i++) {

        var name_list = flows[i].classList

        classnames = classnames + flows[i].id + " ";
        for (k = 0; k < name_list.length; k++) {
            classnames = classnames + name_list[k] + " ";
        }

        classnames = classnames + "\n";
    }

    return classnames;
}


function nav_classNames() {

    var classnames;

    for (i = 0; i < tabs.length; i++) {

        var name_list = tabs[i].classList

        classnames = classnames + tabs[i].id + " ";
        for (k = 0; k < name_list.length; k++) {
            classnames = classnames + name_list[k] + " ";
        }

        classnames = classnames + "\n";
    }

    return classnames;
}


/* 
    Function executed after the page is loaded to make sure all cells are displayed. It also makes sure
    that the height and width of the flow is in accordance to the user's screen resolution.
    After loading, the pre-loader is removed.
*/

$(function () {
    nextTab()
    previousTab()

    /* Sets a timeout for 1 second to make sure the whole page is loaded */

    var widthoffSet;

    setTimeout(() => {
        resizeFlowHeight()
        for (i = 0; i < handsontable_flows.length; i++) {
            if (handsontable_flows[i].countCols() == 4) {
                widthoffSet = 0.24615384615384617
            }
            else {
                widthoffSet = 0.19487179487179487
            }
            handsontable_flows[i].updateSettings({
                width: document.getElementById('df').offsetWidth - 16,
                colWidths: (document.getElementById('df').offsetWidth - 16) * widthoffSet,
                afterChange(changes) {


                    var auto_used = false;

                    if (!dataLoaded) {

                        for (i = 0; i < bold_cell_tD.length; i++) {
                            bold_cell_tD[i].style.fontWeight = 'bold'
                        }
                        data['flow-data'][index] = handsontable_flows[index].getData()

                        /* Autocomplete Feature */
                        changes.forEach(([row, prop, oldValue, newValue]) => {


                            var textLine = newValue.split(" ")

                            for (i = 0; i < textLine.length; i++) {
                                if (typeof autocomplete[textLine[i]] != 'undefined') {
                                    var nV = autocomplete[textLine[i]]
                                    textLine[i] = nV
                                    auto_used = true;
                                }
                            }

                            if (auto_used) {
                                textLine = textLine.join(" ")
                                handsontable_flows[index].setDataAtCell(row, prop, textLine)
                            }

                        });
                    }
                    else {

                        dataLoaded = false
                    }

                }
            });
        }

        /* User can rename the tab on dblclick */

        $('.tab').on('dblclick', function () {
            handsontable_flows[index].deselectCell()
            $(this).find('input').toggle().val($(this).find('a').html()).focus();
            $(this).find('a').toggleClass('hidden')
        });

        /* Events on Input */

        $('.tab').on('keydown blur dblclick', 'input', function (e) {
            if (e.type == "keydown") {
                if (e.which == 13) {
                    $(this).toggle();
                    $(this).siblings('a').toggle().html($(this).val());
                    var f = $(this).parent('.nav-item')[0].id
                    $('#' + f).find('a').removeClass('hidden')

                    var id = tabs[index].id;
                    var reference = '#' + id;
                    $(document).ready(function () {
                        $(reference).click();
                    });
                }
                if (e.which == 38 || e.which == 40 || e.which == 37 || e.which == 39) {
                    e.stopPropagation();
                }
            }
            else if (e.type == "focusout") {
                if ($(this).css('display') == "inline-block") {
                    $(this).toggle();
                    $(this).siblings('a').toggle().html($(this).val());
                    var f = $(this).parent('.nav-item')[0].id
                    $('#' + f).find('a').removeClass('hidden')

                    var id = tabs[index].id;
                    var reference = '#' + id;
                    $(document).ready(function () {
                        $(reference).click();
                    });

                }
            }
            else {
                e.stopPropagation();
            }
        });

        $('.loader').remove()
        document.getElementById('df').classList.add('elementToFadeInAndOutLeft')
        document.getElementById('flow-navbar').style.visibility = 'visible'
        document.getElementById('ephox_mytextarea').classList.add('elementToFadeInAndOutRight')
        document.getElementById('ephox_mytextarea').style.visibility = 'visible'
        document.getElementById('flows').style.visibility = 'visible'
        $('.ephox-polish-html-switch').remove()
    }, 1000);

});

// Function executed everytime window is reszied

$(window).resize(function () {
    resizeFlowHeight()
    for (i = 0; i < handsontable_flows.length; i++) {
        if (handsontable_flows[i].countCols() == 4) {
            widthoffSet = 0.24615384615384617
        }
        else {
            widthoffSet = 0.19487179487179487
        }
        handsontable_flows[i].updateSettings({
            width: document.getElementById('df').offsetWidth - 16,
            colWidths: (document.getElementById('df').offsetWidth - 16) * widthoffSet
        });
    }

    for (i = 0; i < bold_RC.length; i++) {
        for (x = 0; x < bold_RC[i].length; x++) {
            var a = bold_RC[i][x]
            var r = a[0]
            var c = a[1]

            if (typeof r != 'undefined' && typeof c != 'undefined') {

                if (typeof handsontable_flows[i].getCell(r, c) != 'undefined') {
                    handsontable_flows[i].getCell(r, c).style.fontWeight = 'bold'
                    bold_cell_tD.push(handsontable_flows[i].getCell(r, c))

                }
            }
        }
    }
});



// Implements Tab Sorting

var list_tabs = document.getElementById("flow-tabs");

if (flow_type == 'LD Plan Flow' || flow_type == 'Policy Flow') {
    new Sortable(list_tabs, {
        onEnd: function (/**Event*/evt) {


            tabs_li = document.getElementById('flow-navbar').getElementsByClassName('nav-item');
            tabs = document.getElementById('flow-navbar').getElementsByClassName('nav-link');
            flows = document.getElementsByClassName('tab-pane');

            if (evt.oldIndex < evt.newIndex) {
                for (i = evt.oldIndex; i < evt.newIndex; i++) {
                    var tempFlow = handsontable_flows[i]
                    handsontable_flows[i] = handsontable_flows[i + 1]
                    handsontable_flows[i + 1] = tempFlow

                    var tempSC = selectCell_rc[i]
                    selectCell_rc[i] = selectCell_rc[i + 1]
                    selectCell_rc[i + 1] = tempSC

                    var tempBC = bold_RC[i]
                    bold_RC[i] = bold_RC[i + 1]
                    bold_RC[i + 1] = tempBC

                    var tempDataFlow = data["flow-data"][i]
                    data["flow-data"][i] = data["flow-data"][i + 1]
                    data["flow-data"][i + 1] = tempDataFlow
                }
            }
            else {
                for (i = evt.oldIndex; i > evt.newIndex; i--) {
                    var tempFlow = handsontable_flows[i]
                    handsontable_flows[i] = handsontable_flows[i - 1]
                    handsontable_flows[i - 1] = tempFlow

                    var tempSC = selectCell_rc[i]
                    selectCell_rc[i] = selectCell_rc[i - 1]
                    selectCell_rc[i - 1] = tempSC

                    var tempBC = bold_RC[i]
                    bold_RC[i] = bold_RC[i - 1]
                    bold_RC[i - 1] = tempBC

                    var tempDataFlow = data["flow-data"][i]
                    data["flow-data"][i] = data["flow-data"][i - 1]
                    data["flow-data"][i - 1] = tempDataFlow
                }
            }

            for (i = 0; i < tabs.length; i++) {
                if (tabs[i].classList.contains('active')) {
                    index = i;
                }
            }
            selectAllCells()
        }
    });

}







