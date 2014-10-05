#!/usr/bin/env node

var args = process.argv.slice(2),
    IN_FILE = getFileArg(0),
    OUT_FILE = getFileArg(1),
    USE_COLOR = getArg('-color') != null,
    MAGIC_CHARS = getArg('-chars') ? getArg('-chars') : '@Oo.';

if (!IN_FILE) {
    console.log('args: inputfile.png outputfile.txt -color true -chars Xx.');
    process.exit(1);
}


var fs = require('fs'),
    PNG = require('png-js'),
    prefix = '\x1b[',
    charList = (MAGIC_CHARS).split(""),
    img = PNG.load(IN_FILE);

charList.push(' ');


function getFileArg(nth) {

    var found = 0;

    for (var i = 0; l = args.length, i < l; i++) {
        //check if it's a .png
        if (args[i].indexOf('.png') != -1) {
            if (found == nth) return args[i];
            found++;
        }
    }

    return null;

}

function getArg(argId) {

    var idx = args.indexOf(argId);

    if (idx != -1) {
        console.log('FOUND!');
        if (args[idx + 1]) {
            return args[idx + 1];
        }
    }
    return null;
}

function rgb(r, g, b) {
    return 16 + (Math.round(r / 255 * 5) * 36) + (Math.round(g / 255 * 5) * 6) + Math.round(b / 255 * 5)
}

img.decode(function(p) {
    var i = 0,
        x = 0,
        l = charList.length - 1,
        r, g, b, brightness, charIdx, color, bgcolor, newColor,
        strChars = '';

    for (var v in p) {
        switch (i) {
            case 0:
                r = p[v];
                i++;
                break;
            case 1:
                g = p[v];
                i++;
                break;
            case 2:
                b = p[v];
                i++;
                break;
            default:
                brightness = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
                charIdx = l - Math.round(brightness * l);

                //color
                if (USE_COLOR) {
                    if (r == 0 && g == 0 && b == 0) {
                        newColor = prefix + '0:m';
                    } else {
                        newColor = prefix + '38;5;' + rgb(r, g, b) + 'm';
                    }

                    if (newColor != color) {
                        color = newColor;
                        bgcolor = prefix + '48;5;' + rgb(r / 6, g / 4, b / 2) + 'm';
                        strChars += charList[charIdx] ? bgcolor + color : '';

                    }
                }

                strChars += charList[charIdx] ? charList[charIdx] : ' ';
                i = 0;

                //line feed?
                x++;
                if (x >= img.width) {
                    x = 0;
                    strChars += USE_COLOR ? (prefix + '0;m\n') : '\n';
                }

                break;
        }
    }

    if (OUT_FILE) {
        fs.writeFile(OUT_FILE, strChars, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The text file was saved!");
            }
        });
    } else {
        console.log(strChars);
    }

});
