/*
 *  OpenWFEru densha - open source ruby workflow and bpm engine
 *  (c) 2007-2008 OpenWFE.org
 *
 *  OpenWFEru densha is freely distributable under the terms 
 *  of a BSD-style license.
 *  For details, see the OpenWFEru web site: http://openwferu.rubyforge.org
 *
 *  Made in Japan
 *
 *  John Mettraux
 *  Juan-Pedro Paredes
 */

//
// some functions

var Fluo = function () {

    function tdiv (text) {

        var attributes = {};
        if (tdiv.arguments.length > 1) attributes = tdiv.arguments[1];

        //if (text[0] == "u") {
        if ((typeof text == 'string') && text.match(/(u[a-fA-F0-9]{4})+/)) {

            var ss = text.split("u");
            text = "";
            for (var i = 0; i < ss.length; i++) {
                text += String.fromCharCode(parseInt(ss[i], 16));
            }
        }

        var e = new Element("div", attributes);
        e.appendChild(document.createTextNode(text));
        return e;
    }

    function divClear () {

        var e = new Element('div', { style: "clear: both;" });
        if (divClear.arguments.length > 0) divClear.arguments[0].appendChild(e);
        return e;
    }

    function newDiv () {

        var attributes = {};

        if (newDiv.arguments.length == 2) {
            attributes["id"] = newDiv.arguments[0];
            attributes["class"] = newDiv.arguments[1];
        }
        else {
            attributes["class"] = newDiv.arguments[0];
        }

        return new Element("div", attributes);
    }


    //
    // The expression classes

    var Expression = Class.create({

        initialize : function (container, exp_id, array, desired_width) {

            this.container = container;

            this.exp_id = exp_id;

            this.exp_name = array[0];
            this.exp_attributes = $H(array[1]);
            this.exp_children = array[2];

            this.desired_width = desired_width;

            this.div = newDiv(this.exp_id, this.cssPrefix());

            this.div.fluo_exp = this;

            //this.content_div = this.div;
            this.setContentDiv(this.div);
                // by default, the content_div is the div.
                // expressions like ParticipantExpression twist that

            this.container.appendChild(this.div);

            this.render();
        },

        setContentDiv : function (div) {

            this.content_div = div;
            this.content_div.fluo_exp = this;
        },

        render : function () {

            this.renderHead();
            this.renderChildren();
            this.renderFoot();
        },

        renderHead : function () {

            var eDiv = newDiv(this.cssPrefix()+"_head");

            eDiv.appendChild(tdiv(this.exp_name));

            this.exp_attributes.each(function (att) {

                eDiv.appendChild(tdiv("" + att.key + " : " + att.value));
            });

            this.content_div.appendChild(eDiv);
        },

        renderFoot : function () {
            // no relevant implementation at this level
        },

        renderChildren : function () {

            for (var i=0; i<this.exp_children.length; i++) {

                child = this.exp_children[i];

                if (( ! this.getFluoContainer().showMinorExpressions) &&
                    MINOR_EXPRESSIONS.include(child[0])) {

                    continue;
                }

                this.renderChild(i, child);
            }
        },

        renderChild : function (index, child) {

            var container = this.content_div;

            if (arguments.length > 2) container = arguments[2];

            return renderExpression
                (container, this.exp_id+"."+index, child, this.desired_width);
        },

        cssName : function () {

            //return "no-css-name";
            return "base";
        },

        cssPrefix : function () {

            return "fluo_exp_" + this.cssName();
        },

        fetchAttribute : function (attname) {

            var v = this.exp_attributes.get(attname);
            if (v != null) return v;

            v = this.exp_attributes.get("field-"+attname);
            if (v != null) return "field : "+v;

            v = this.exp_attributes.get("variable-"+attname);
            if (v != null) return "variable : "+v;

            return null;
        },

        fetchText : function () {

            //if ( ! this.exp_children[0]) return null;
            //return this.exp_children[0][0];
            return this.exp_children[0];
        },

        getFluoContainer : function () {

            var id = this.content_div.id;
            //var id = this.div.id;
            var i = id.indexOf(ROOT_EXP_ID);
            id = id.substring(0, i);
            return $(id);
        },

        attMaxSize : function () {

            var max = this.exp_name.length;
            this.exp_attributes.each(function (e) {
                var l = e.key.length + e.value.length;
                if (l > max) max = l;
            });

            return max;
        },

        renderBox : function (width, height, variant) {

            var ie = FluoCanvas.asCenteredBox
                (this.div,
                 this.desired_width || this.div.scrollWidth, 
                 width, 
                 height,
                 variant);

            this.setContentDiv(ie);
                // pointing the content_div to our new content box
        }
    });

    var SequenceExpression = Class.create(Expression, {

        cssName : function () {
            return "sequence";
        },

        renderHead : function ($super) {

            if (this.exp_name != "sequence") $super();
                // else don't write "sequence"
        },

        renderChild : function ($super, index, child) {

            var ce = $super(index, child);

            ssw = this.content_div.scrollWidth;
            //csw = ce.div.firstChild.scrollWidth;
            //ce.div.style["width"] = ""+ssw+"px";
            //ce.div.style["margin"] = "0 "+Math.floor((ssw - csw) / 2)+"px";
                //
                // centered the children...

            if (child == this.exp_children.last()) return;

            if (this.exp_name == 'cursor' || this.exp_name == 'loop')
                var dArrow = FluoCanvas.newDownUpArrow(ssw || this.desired_width);
            else
                var dArrow = FluoCanvas.newDownArrow(ssw || this.desired_width);

            this.content_div.appendChild(dArrow);
        }
    });

    var ConcurrenceExpression = Class.create(Expression, {

        cssName : function () {
            return "concurrence";
        },

        horizontalBar : function () {
            var eBar = new Element('div', { "class": "fluo_pixel" });
            eBar.setStyle({ "width": "70%", "height": "2px" });
            return eBar;
        },

        renderHead : function ($super) {

            if (this.exp_name != "concurrence") $super();
                // else don't write "concurrence"
        },

        renderChildren : function () {

            //this.content_div.appendChild(this.horizontalBar());
            this.content_div.appendChild
                (FluoCanvas.newConcurrenceOpening
                     (this.content_div.scrollWidth, this.exp_children.length));

            var eChildren = new Element(
                'div', { "class": "fluo_exp_concurrence_children" });

            var width = this.div.scrollWidth / this.exp_children.length;
            width = Math.floor(width) - 3;

            for (var i=0; i<this.exp_children.length; i++) {

                var child = this.exp_children[i];

                var eChild = newDiv("fluo_exp_concurrence_child");
                eChild.setStyle({ "width": ""+width+"px" });

                eChildren.appendChild(eChild);

                renderExpression(eChild, this.exp_id+"."+i, child, width);

                //if (i == this.exp_children.length - 1)
                //    eChild.setStyle({ float: "right" });
            }
            this.content_div.appendChild(eChildren);

            this.content_div.appendChild(divClear());

            //this.content_div.appendChild(this.horizontalBar());
            this.content_div.appendChild
                (FluoCanvas.newConcurrenceClosing
                     (this.content_div.scrollWidth, this.exp_children.length));
        }
    });

    var ProcessDefinitionExpression = Class.create(Expression, {

        initialize : function ($super, container, exp_id, array, desired_width) {

            $super(container, exp_id, array, desired_width);

            this.process_definition = array;
        },

        cssName : function () {
            return "process_definition";
        },

        /*
        render : function () {
            var width = this.div.scrollWidth;
            var height = this.div.scrollHeight;
            this.setContentDiv(newBox(this.div, width, height));

            this.renderHead();
            this.renderChildren();
            this.renderFoot();
        },
        */

        renderHead : function () {

            var eHead = newDiv('fluo_exp_pdef_head');
            this.content_div.appendChild(eHead);

            var pdef = this.exp_attributes.get('name');
            if ( ! pdef) pdef = this.exp_children[0];

            var rev = this.exp_attributes.get('revision');
            if (rev) pdef = pdef + " (rev " + rev + ")";

            var ePdef = newDiv(); // <-- TODO fix that "undefined"
            ePdef.appendChild(tdiv(pdef));
            eHead.appendChild(ePdef);

            this.exp_children.each(function (child) {
                if (child[0] == 'description') {
                    var eDesc = newDiv();
                    var eItal = new Element("i");
                    eItal.appendChild(tdiv(child[2][0]));
                    eDesc.appendChild(eItal);
                    eHead.appendChild(eDesc);
                }
            });
        },

        renderChildren : function ($super) {

            var a = new Array();

            for (var i = 0; i < this.exp_children.length; i++) {

                var child = this.exp_children[i];

                if (typeof child == 'string') continue;
                if (child[0] == 'description') continue;

                a.push(child);
            }

            this.exp_children = a;

            $super();
        }
    });

    var NoChildrenExpression = Class.create(Expression, {

        renderChildren : function () {

            // none to render
        }
    });

    var UnknownExpression = Class.create(NoChildrenExpression, {

        cssName : function () {
            return "unknown";
        },

        render : function () {

            var width = this.attMaxSize() * 7 + 35;
            if (width > this.desired_width) width = this.desired_width - 1;

            var height = this.exp_attributes.size() * 21 + 25;

            this.renderBox(width, height, null);

            this.renderHead();
        }
    });

    var OneLineExpression = Class.create(NoChildrenExpression, {

        cssName : function () {
            return "oneline";
        },

        render : function () {

            this.renderHead();
        },

        renderHead : function () {

            var eDiv = newDiv(this.cssPrefix()+"_head");

            var text = this.exp_name;

            this.exp_attributes.each(function (att) {

                text += ("  " + att.key + ": '" + att.value + "'");
            });

            eDiv.appendChild(document.createTextNode(text));

            this.content_div.appendChild(eDiv);
        }
    });

    var ParticipantExpression = Class.create(NoChildrenExpression, {

        cssName : function () {
            return "participant";
        },

        render : function () {

            var width = this.attMaxSize() * 5 + 35;
            if (width > this.desired_width) width = this.desired_width - 1;

            att_count = this.exp_attributes.size() - 1;
            if (att_count < 0) att_count = 0;
            if (this.determineActivity()) att_count += 1;

            var height = 25 + 17 * att_count;

            this.renderBox(width, height, null);

            this.renderHead();
        },

        renderHead : function () {

            var eDiv = newDiv(this.cssPrefix()+"_head");

            var ref = this.fetchAttribute('ref');
            if ( ! ref) ref = this.fetchText();
            if ( ! ref) ref = this.exp_name;
            var activity = this.determineActivity();

            //eDiv.appendChild(
            //    tdiv(ref, { class: "fluo_exp_head_div" }));
            eDiv.appendChild(tdiv(ref));

            if (activity) eDiv.appendChild(tdiv(activity));

            this.content_div.appendChild(eDiv);
        },

        determineActivity : function () {

            return this.exp_attributes.get('activity') || 
                this.exp_attributes.get('tag');
        }
    });

    var SubprocessExpression = Class.create(ParticipantExpression, {

        cssName : function () {
            return "subprocess";
        },

        render : function () {

            var width = 130;
            var height = 40;
            this.renderBox(width, height, "subprocess");
            this.renderHead();
        }
    });

    var CaseExpression = Class.create(Expression, {

        cssName : function () {
            return "case";
        },

        renderHead : function () {

            var eDiamond = new Element(
                "img",
                { "src": "/images/fluo/diamond.png" });
            this.content_div.appendChild(eDiamond);
            this.content_div.appendChild(document.createTextNode(this.exp_name));

            this.content_div.appendChild(divClear());
        },

        renderChildren : function () {

            var consequence = false;

            for (var i=0; i<this.exp_children.length; i++) {

                var child = this.exp_children[i];

                if (i == this.exp_children.length - 1 && ( ! consequence))
                    consequence = true;

                if (consequence) {
                    this.renderConsequence(i, child);
                    this.content_div.appendChild(divClear());
                }
                else {
                    this.renderCondition(i, child);
                }

                consequence = ( ! consequence);
            }
        },

        renderFoot : function () {

            var eDiamond = new Element(
                "img", 
                { "src": "/images/fluo/diamond.png" });
            this.content_div.appendChild(eDiamond);
        },

        renderCondition : function (index, item) {

            var e = newDiv(this.cssPrefix()+"_condition");

            this.renderChild(index, item, e);

            this.content_div.appendChild(e);
        },

        renderConsequence : function (index, child) {

            var e = newDiv(this.cssPrefix()+"_consequence");

            this.renderChild(index, child, e);

            this.content_div.appendChild(e);

            var earrow = newDiv(this.cssPrefix()+"_arrow");
            earrow.appendChild(new Element(
                "img",
                { "src": "/images/fluo/aright.png" }));

            this.content_div.appendChild(earrow);
        }
    });

    var IfExpression = Class.create(Expression, {

        cssName : function () {
            return "if";
        },

        render : function () {

            //this.renderHead();
            this.renderChildren();
            //this.renderFoot();
        },

        renderChildren : function () {

            var w = this.content_div.scrollWidth || this.desired_width;
            var w2 = Math.round(w / 2);

            var offset = 1;
            var aTest = this.exp_attributes.get('test');
            var cCondition = this.exp_children[0];

            if (aTest) {
                offset = 0;
                cCondition = aTest;
            }

            var cThen = this.exp_children[0 + offset];
            var cElse = this.exp_children[1 + offset];

            this.content_div.appendChild(FluoCanvas.newIfOpening(w));

            this.renderCondition(cCondition, (cElse != null));

            var eBody = new Element("div");
            //eBody.setStyle("width: 100%");

            var tw = w2 + 1;
            var ew = w2 - 2;

            var eThen = newDiv(this.cssPrefix() + "_then");
            var eElse = newDiv(this.cssPrefix() + "_else");
            eThen.setStyle("width: "+tw+"px");
            eElse.setStyle("width: "+ew+"px");

            eBody.appendChild(eThen);
            eBody.appendChild(eElse);

            if (cThen) {
                this.desired_width = tw;
                eThen.appendChild(tdiv("then", { style: "text-align: center;" }));
                this.renderChild(0 + offset, cThen, eThen);
            }
            if (cElse) {
                this.desired_width = ew;
                eElse.appendChild(tdiv("else", { style: "text-align: center;" }));
                this.renderChild(0 + offset, cElse, eElse);
            }
            this.content_div.appendChild(divClear());

            this.content_div.appendChild(eBody);

            if (cElse == null) {

                //var eew = w/4 - 1;
                var eew = Math.round(ew / 2) - 1;
                var h = eThen.scrollHeight || 15;

                var c = new Element("canvas", { width: ew, height: h });
                FluoCanvas.drawPath(c, [ eew, 0, eew, h ]);
                eElse.appendChild(c);
            }

            this.content_div.appendChild(FluoCanvas.newConcurrenceClosing(w, 2));
        },

        renderCondition : function (item, hasElse) {

            var e = newDiv(this.cssPrefix()+"_condition");

            var height = 60;
            if (typeof item == 'string') height = 20;

            FluoCanvas.asCanDiv
                (e, this.desired_width || this.content_div.scrollWidth, height);

            FluoCanvas.drawIfLines(e.canvas, hasElse);

            if (typeof item == 'string')
                e.div.appendChild(tdiv(item, { style: "text-align: center" }));
            else
                this.renderChild(0, item, e.div);

            this.content_div.appendChild(e);
        }
    });


    //
    // the TOP

    var ROOT_EXP_ID = "_exp_0";

    var EXPRESSIONS = {

        "case" : CaseExpression,
        "concurrence" : ConcurrenceExpression,
        "cursor" : SequenceExpression,
        "define" : ProcessDefinitionExpression,
        "defined" : OneLineExpression,
        "equals" : Expression,
        "if" : IfExpression,
        "loop" : SequenceExpression,
        "process-definition" : ProcessDefinitionExpression,
        "sequence" : SequenceExpression,
        "participant" : ParticipantExpression,
        "reval" : OneLineExpression,
        "set" : OneLineExpression,
        "set-fields" : Expression,
        "sleep" : OneLineExpression,
        "subprocess" : SubprocessExpression,
        "unset" : OneLineExpression,
        "workflow-definition" : ProcessDefinitionExpression,
    }

    var MINOR_EXPRESSIONS = $A([
        "set", "unset", "set-fields"
    ])


    function toggleMinorExpressions (parent) {

        parent = $(parent);

        parent.showMinorExpressions = ! parent.showMinorExpressions;

        renderExpression(parent, null, parent.process_definition);

        return false;
    }

    /*
    function renderToggleButton (parent) {

        var ebutton = new Element(
            "a", 
            { 
                "class": "fluo_toggle_button",
                "href": "#",
                "onclick": "return toggleMinorExpressions('"+parent.id+"');",
                "title": "hide/show minor expressions"
            });

        var text = "less info";
        if ( ! parent.showMinorExpressions) text = "more info";

        ebutton.appendChild(document.createTextNode(text));

        parent.appendChild(ebutton);
    }
    */

    function collectProcessNames (pdef) {

        var result = [];
        if (pdef == null) return result;

        var exp_name = pdef[0];
        var attributes = pdef[1];
        var children = pdef[2];

        if (exp_name == 'process-definition') {

            result.push(attributes['name']);
        }

        if (children) {

            for (var i = 0; i < children.length; i++)
                result = result.concat(collectProcessNames(children[i]));
        }

        return result;
    }

    function isSubprocess (parent, name) {

        if (parent == null || ( ! parent.fluo_exp)) return false;
        var pnames = parent.fluo_exp.getFluoContainer().process_names;
        return (pnames.indexOf(name) > -1);
    }

    /*
     * The function that does all the rendering.
     */
    function renderExpression (parent, exp_id, a) {

        var desiredWidth = arguments[3];

        parent = $(parent);

        var top = (exp_id == null);

        if (top) {

            exp_id = parent.id + ROOT_EXP_ID;

            parent.childElements().each(function (elt) {
                elt.remove();
            });

            parent.process_definition = a;
            parent.process_names = collectProcessNames(a);
        }

        var exp_name = a[0];
        var clazz = EXPRESSIONS[exp_name];

        if (clazz == null) {
            if (isSubprocess(parent, exp_name))
                clazz = SubprocessExpression;
            else
                clazz = UnknownExpression;
        }

        var result = new clazz(parent, exp_id, a, desiredWidth);

        if (top) {

            //renderToggleButton(parent);

            if (parent.taggedExpressions) {
                tagExpressionsWithWorkitems(parent, parent.taggedExpressions);
            }
        }

        return result;
    }

    /*
     * Pass a list of expression ids and their expression representation will
     * get a nice border.
     */
    function tagExpressionsWithWorkitems (root, expression_ids) {

        root = $(root);
        var root_id = root.getAttribute("id");

        expression_ids = $A(expression_ids);

        expression_ids.each(function (exp_id) {

            //$(root_id+"_exp_"+exp_id).addClassName("fluo_exp_has_workitem");

            // TODO : wrap exp_id that go 'overboard'

            markExpression($(root_id+"_exp_"+exp_id));
        });

        root.taggedExpressions = expression_ids;
    }

    function markExpression (e) {

        if ( ! e) return;

        var marker = $("marker_"+e.id);

        if ( ! marker) {
            marker = new Element
                ("div", { "id": "marker_"+e.id, "class": "fluo_marker" });
            marker.appendChild(document.createTextNode("workitem"));
            document.body.appendChild(marker);
        }

        var l = e.offsetLeft + e.offsetWidth / 1.82;
        var t = e.offsetTop + e.offsetHeight / 2.09;

        marker.setStyle({ "left": ""+Math.floor(l)+"px" });
        marker.setStyle({ "top": ""+Math.floor(t)+"px" });
        //marker.offsetTop = e.offsetTop;
    }

    return {

        //
        // PUBLIC methods

        renderExpression: renderExpression,
        toggleMinorExpressions: toggleMinorExpressions,
        tagExpressionsWithWorkitems: tagExpressionsWithWorkitems
    };
}();

