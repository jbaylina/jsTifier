// See ../test/test.html for usage example.

/// START OF THE mltext.js LIBRARY
// Library: mllib.js
// Description: Extends the CanvasRenderingContext2D with the following functions:
//
// function mlFillText(text,x,y,w,h,vAlign,hAlign,lineHeight);
// function mlStrokeText(text,x,y,w,h,vAlign,hAlign,lineHeight);
// function mlFillStrokeText(text,x,y,w,h,vAlign,hAlign,lineHeight);
//
// Where vAlign can be: "top", "center" or "button"
// And hAlign can be: "left", "center", "right" or "justify"
// Author: Jordi Baylina. (baylina at uniclau.com)
// License: MIT
// Date: 2013-02-21

function mlFunction(text, x, y, w, h, hAlign, vAlign, lineHeight, fn) {

    // First, generate an array of words.
    // A special word, '\n', indicates a separation of paragraphs.
    text = text.replace(/\r/g, '');
    var words = [];
    var inLines = text.split('\n');
    var i;
    for (i=0; i < inLines.length; i++)
    {
        if (i) words.push('\n');
        words = words.concat( inLines[i].split(' ') );
    }
    // words now contains the array.

    // Next, generate an array of lines where each line has a property
    // called Words with all the words that fits in the line. Each word contains 2 fields:
    // .word for the actual word and .l for the length of the word.
    // If the line is the last line of a paragraph, the property EndOfParagraph will be true
    var sp = this.measureText(' ').width;
    var lines = [];
    var actualLine = 0;
    var actualSize = 0;
    var wo;
    lines[actualLine] = {};
    lines[actualLine].Words = [];
    i = 0;
    while (i < words.length) {
        var word = words[i];
        if (word == "\n") {
            lines[actualLine].EndParagraph = true;
            actualLine++;
            actualSize = 0;
            lines[actualLine] = {};
            lines[actualLine].Words = [];
            i++;
        } else {
            wo = {};
            wo.l = this.measureText(word).width;
            if (actualSize === 0) {

                // If the word does not fit in one line, split the word
                while (wo.l > w) {
                    word = word.slice(0, word.length - 1);
                    wo.l = this.measureText(word).width;
                }

                wo.word = word;
                lines[actualLine].Words.push(wo);
                actualSize = wo.l;
                if (word != words[i]) {
                    // if a single letter does not fit in one line, just return without painting anything.
                    if (word === "") return;
                    words[i] = words[i].slice(word.length, words[i].length);
                } else {
                    i++;
                }
            } else {
                if (actualSize + sp + wo.l > w) {
                    lines[actualLine].EndParagraph = false;
                    actualLine++;
                    actualSize = 0;
                    lines[actualLine] = {};
                    lines[actualLine].Words = [];
                } else {
                    wo.word = word;
                    lines[actualLine].Words.push(wo);
                    actualSize += sp + wo.l;
                    i++;
                }
            }
        }
    }

    // Remove the last line if we have not added anything here.
    if (actualSize === 0) lines.pop();

    // The last line will always be the last line of a paragraph, even if it doesn't end with '\n'
    lines[actualLine].EndParagraph = true;

    // Remove any line that does not fit in the height.
    var totalH = lineHeight * lines.length;
    while (totalH > h) {
        lines.pop();
        totalH = lineHeight * lines.length;
    }

    // Calculate where to start drawing the text.
    var yy;
    if (vAlign == "bottom") {
        yy = y + h - totalH + lineHeight;
    } else if (vAlign == "center") {
        yy = y + h / 2 - totalH / 2 + lineHeight;
    } else {
        yy = y + lineHeight;
    }

    var oldTextAlign = this.textAlign;
    this.textAlign = "left"; // we will draw word by word.

    var maxWidth = 0;
    for (var li in lines) {
        if (!lines.hasOwnProperty(li)) continue;
        var totallen = 0;
        var xx, usp;

        for (wo in lines[li].Words) {
            if (!lines[li].Words.hasOwnProperty(wo)) continue;
            totallen += lines[li].Words[wo].l;
        }
        // Calculate the x position and the distance between words in pixels
        if (hAlign == "center") {
            usp = sp;
            xx = x + w / 2 - (totallen + sp * (lines[li].Words.length - 1)) / 2;
        } else if ((hAlign == "justify") && (!lines[li].EndParagraph)) {
            xx = x;
            usp = (w - totallen) / (lines[li].Words.length - 1);
        } else if (hAlign == "right") {
            xx = x + w - (totallen + sp * (lines[li].Words.length - 1));
            usp = sp;
        } else { // left
            xx = x;
            usp = sp;
        }
        for (wo in lines[li].Words) {
            if (!lines[li].Words.hasOwnProperty(wo)) continue;
            if (fn == "strokeText" || fn=="fillStrokeText") {
                this.strokeText(lines[li].Words[wo].word, xx, yy);
            }
            if (fn == "fillText" || fn=="fillStrokeText") {
                this.fillText(lines[li].Words[wo].word, xx, yy);
            }
            xx += lines[li].Words[wo].l + usp;
        }
        maxWidth = Math.max(maxWidth, xx);
        yy += lineHeight;
    }
    this.textAlign = oldTextAlign;

    return {
        width: maxWidth,
        height: totalH,
    };
}

(function mlInit() {
    CanvasRenderingContext2D.prototype.mlFunction = mlFunction;

    CanvasRenderingContext2D.prototype.mlFillText = function (text, x, y, w, h, vAlign, hAlign, lineHeight) {
        return this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineHeight, "fillText");
    };

    CanvasRenderingContext2D.prototype.mlStrokeText = function (text, x, y, w, h, vAlign, hAlign, lineHeight) {
        return this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineHeight, "strokeText");
    };

    CanvasRenderingContext2D.prototype.mlFillStrokeText = function (text, x, y, w, h, vAlign, hAlign, lineHeight) {
        return this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineHeight, "fillStrokeText");
    };

})();
