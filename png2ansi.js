#!/usr/bin/env node

var args = process.argv.slice(2),
    fs = require('fs'),
    PNG = require('png-js'),
    charList = ("@80OCoc;:. ").split(""),
    prefix = '\x1b[';

if (args.length < 1) {
    console.log('args: inputfile.png outputfile.txt');
    process.exit(1);
}

var img = PNG.load(args[0]);

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

                newColor = prefix + '38;5;' + rgb(r, g, b) + 'm';
                if (newColor != color) {
                    color = newColor;
                    bgcolor = prefix + '48;5;' + rgb(r / 6, g / 4, b / 2) + 'm';
                }

                strChars += charList[charIdx] ? bgcolor + color + charList[charIdx] : ' ';
                i = 0;

                //line feed?
                x++;
                if (x >= img.width) {
                    x = 0;
                    strChars += prefix + '0;m\n';
                }

                break;
        }
    }

    if (args[1]) {
        fs.writeFile(args[1], strChars, function(err) {
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
