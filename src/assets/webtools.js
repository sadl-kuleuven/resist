(function (win, doc) {
    if (win.$wt) {
        $wt.duplicate = !0;
        console.log("WTINFO: Duplicate 'load.js' found into your page!");
        return
    }
    win.isIE = (function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : !1
    })();
    win.$wt = function (selector) {
        return document.querySelectorAll(selector)
    };
    $wt.extend = function (obj) {
        for (var i in obj) {
            this[i] = obj[i]
        }
    };
    $wt.extend({
        root: "https://europa.eu/webtools",
        isMobile: ('ontouchstart' in window),
        isSafari: function () {
            return navigator.userAgent.toLowerCase().indexOf('safari') > -1
        },
        isIOS: function () {
            return /iPad|iPhone|iPod|MacIntel/.test(navigator.platform) && $wt.isMobile
        },
        inProgress: !1,
        components: {},
        css: {},
        alias: {
            "twitter": "smk",
            "chart": "charts",
            "share": "sbkm",
            "maps": "map",
            "piwik": "analytics",
            "alert": "announcement"
        },
        exists: function (name) {
            return Object.keys($wt.components).join('|').indexOf(name + '_') > -1
        },
        force: function (params) {
            return (params.render || ["laco", "cck", "globan", "announcement", "etrans"].indexOf(params.service) !== -1) || (params.service === "sbkm" && params.selection)
        },
        mergeParams: function (defaultJSON, customJSON) {
            (function recursive(a, b) {
                for (var k in b) {
                    if (b.hasOwnProperty(k)) {
                        if (a[k] === null) {
                            a[k] = undefined
                        }
                        if (typeof b[k] === "function" || typeof b[k] === "string" || typeof b[k] === "number" || typeof b[k] === "boolean" || b[k] === null || (typeof b[k] === "object" && (typeof a[k] === "string" || typeof a[k] === "number" || typeof a[k] === "boolean"))) {
                            a[k] = b[k]
                        } else if (typeof b[k] === "object") {
                            if (!a[k]) {
                                if (b[k].length !== undefined) {
                                    a[k] = []
                                } else {
                                    a[k] = {}
                                }
                            }
                            recursive(a[k], b[k])
                        }
                    }
                }
            }(defaultJSON, customJSON));
            return defaultJSON
        },
        next: function (elm) {
            try {
                var ready = (elm.snippet || elm).params.events.onready;
                if (typeof ready === "string") {
                    ready = ready.split(".").reduce(function (prev, curr) {
                        return prev && prev[curr]
                    }, window)
                }(window[ready] || ready)(elm)
            } catch (e) {}
            $wt.inProgress = !1;
            $wt.collect()
        },
        regenerate: function () {
            [].forEach.call(doc.querySelectorAll("script[type='application/json']"), function (elm) {
                if (elm.reset) {
                    elm.reset()
                }
            });
            for (var url in $wt.isLoad) {
                if (!(url.indexOf("/webtools.") > -1) && !(url.indexOf("/libs/") > -1)) {
                    delete $wt.isLoad[url]
                }
            }
            $wt.components = [];
            $wt.trigger(window, "wtRegenerate");
            $wt.defer($wt.collect, 100)
        },
        collect: function () {
            var analytics = [],
                utility = [],
                render = [],
                service = [];
            var excludeFromSearch = ["sbkm", "cck", "globan", "share", "search", "laco"];
            [].forEach.call(doc.querySelectorAll("script[type='application/json']"), function (uec) {
                var isProcess = uec.getAttribute("data-process");
                var isRunning = uec.getAttribute("data-run");
                if (!isProcess) {
                    if (!uec.params) {
                        try {
                            uec.params = JSON.parse($wt.filterXss(uec.innerHTML))
                        } catch (e) {
                            uec.setAttribute("data-process", !0);
                            return
                        }
                        if (!uec.params.service && !uec.params.utility) {
                            return
                        }
                        $wt.uniqueID(uec);
                        uec.params.render = $wt.force(uec.params)
                    }
                    if (!uec.container) {
                        var t = document.getElementById(uec.params.renderTo || !1);
                        if (t) {
                            uec.container = t;
                            uec.renderTo = t;
                            delete uec.params.renderTo
                        } else {
                            uec.container = document.createElement("div");
                            $wt.before(uec.container, uec)
                        }
                        uec.container.innerHTML = '';
                        uec.container.className = "wtWidgets wtWaiting"
                    }
                    if (uec.params.service === "search" && !uec.params.form) {
                        uec.container.style.height = "52px"
                    }
                    var dropFromSearchEngine = excludeFromSearch.filter(function (name) {
                        return name.indexOf(uec.params.service || uec.params.utility) > -1
                    });
                    if (dropFromSearchEngine.length) {
                        uec.container.setAttribute("data-nosnippet", "true")
                    }
                    if (!isRunning) {
                        if (uec.params && /analytics|piwik/i.test(uec.params.utility)) {
                            analytics.push(uec)
                        } else if (uec.params && uec.params.utility) {
                            utility.push(uec)
                        } else if (uec.params && uec.params.render) {
                            render.push(uec)
                        } else if ($wt.visible(uec.container)) {
                            service.push(uec)
                        }
                    }
                }
            });
            var dom = analytics[0] || utility[0] || render[0] || service[0];
            if (dom) {
                $wt.process(dom)
            }
        },
        process: function (elm, params) {
            if (!elm || $wt.inProgress) {
                return
            }
            elm.setAttribute("data-process", !0);
            params = elm.params || params || {};
            var self = this;
            var comp = params.service || params.utility || !1;
            comp = $wt.alias[comp] || comp;
            if (!comp) {
                console.log("WTINFO: Unknow component: ", params);
                elm.setAttribute("data-run", !0);
                $wt.next(elm);
                return
            }
            $wt.inProgress = !0;
            if (!elm.container) {
                elm.container = document.createElement("div");
                $wt.before(elm.container, elm)
            }
            elm.reset = function () {
                if (elm.container && elm.params && !elm.params.utility) {
                    var API = $wt[elm.params.service];
                    if (API && API.onRemove) {
                        [].forEach.call(API.onRemove(), function (e) {
                            $wt.remove(e)
                        })
                    }
                    if (elm.container.snippet) {
                        delete elm.container.snippet.params
                    }
                    elm.remove();
                    elm.isProcess = !1;
                    elm.removeAttribute("data-run");
                    elm.removeAttribute("data-process")
                }
            };
            elm.remove = function () {
                if (elm.renderTo) {
                    elm.renderTo.innerHTML = ''
                } else {
                    $wt.remove(elm.container)
                }
                elm.container = !1
            };
            elm.regenerate = function () {
                elm.reset();
                $wt.process(elm, params)
            };
            if (elm.container) {
                elm.container.params = params;
                elm.container.className = comp + " wt wt-" + comp + " " + (params["class"] || "")
            }
            elm.container.snippet = elm;
            if (!params.utility && !self.css["__" + comp]) {
                var GETCSS = $wt.root + "/webtools." + comp + ".css";
                var extra = [];
                (Object.keys(self.css).length === 0) ? extra.push("utilities=true"): "";
                ((params.version) ? extra.push("version=" + params.version) : "");
                if (extra.length) {
                    GETCSS += "?" + extra.join("&")
                }
                self.css["__" + comp] = !0;
                $wt.include(GETCSS)
            }
            if ($wt.runComponent(comp, elm, params)) {
                return
            }
            var GETJS = $wt.root + "/webtools." + comp + ".js";
            if (params.version) {
                GETJS += "?version=" + params.version
            }
            $wt.include(GETJS, function (msg) {
                if (msg === "error") {
                    console.log("WTERROR: '" + comp + "' doesn't exist!");
                    $wt.process.start = !1;
                    $wt.remove(elm.container);
                    $wt.remove(elm);
                    self.next()
                } else if ($wt[comp] && $wt[comp].run) {
                    $wt.runComponent(comp, elm, params)
                }
            }, "js")
        },
        runComponent: function (comp, elm, params) {
            if ($wt[comp] && $wt[comp].run && !elm.getAttribute("data-run")) {
                elm.setAttribute("data-run", !0);
                $wt[comp].run(elm.container, params);
                return !0
            }
            return !1
        },
        render: function (elm, params) {
            var createSnippet = function (json) {
                var s = document.createElement("script");
                s.type = "application/json";
                s.params = json;
                s.innerHTML = JSON.stringify(json);
                return s
            };
            var container = !1;
            if ($wt.components[elm]) {
                container = $wt.components[elm]
            } else if (typeof elm === "string") {
                container = document.querySelectorAll("#" + elm + ", ." + elm);
                container = container[0] || !1
            } else if (typeof elm === "object") {
                container = elm
            }
            if (!container) {
                console.log("WTINFO: Your container doesn't exist.");
                return
            }
            var uec = $wt.mergeParams((container.params || {}), (params || {}));
            uec.render = !0;
            if (uec.service && uec.utility) {
                delete uec.utility
            }
            if (!container.container) {
                var S = createSnippet(uec);
                container.innerHTML = "";
                container.appendChild(S);
                $wt.uniqueID(S)
            } else if (container.container && params) {
                container.reset();
                container.params = uec;
                container.innerHTML = JSON.stringify(uec);
                container.isProcess = !1;
                $wt.uniqueID(container)
            } else if (container.isProcess && !params) {
                container.container.innerHTML = "";
                $wt[container.params.service].run(container)
            }
            $wt.collect()
        },
        queue: {
            working: !1,
            list: [],
            currentContainer: !1,
            push: function (container, callback) {
                container.runQueue = callback;
                this.list.push(container);
                if (this.working === !1) {
                    this.finish()
                }
            },
            process: function (callback) {
                if (this.working) {
                    return
                }
                this.working = !0;
                this.container = this.list.shift();
                if (this.container) {
                    this.currentContainer = this.container;
                    this.container.runQueue(this.container)
                } else {
                    this.empty(this.currentContainer, callback)
                }
            },
            empty: function (container, callback) {
                this.working = !1;
                $wt.next(container);
                if (callback) {
                    callback()
                }
            },
            finish: function (callback) {
                $wt.defer(function () {
                    $wt.queue.working = !1;
                    $wt.queue.process(callback)
                }, 50)
            }
        }
    });
    $wt.extend({
        _queue: $wt.next
    })
})(window, document);
$wt.extend({
    url: {
        params: {
            add: function (key, value, url) {
                key = encodeURIComponent(key);
                value = encodeURIComponent(value);
                var params = this.all(url);
                if (params[key] && Array.isArray(params[key])) {
                    params[key].push(value)
                } else {
                    delete params[key];
                    params[key] = value
                }
                var components = $wt.url.info(url);
                return $wt.url.build({
                    protocol: components.protocol,
                    host: components.host,
                    pathname: components.pathname,
                    hash: components.hash,
                    search: params
                })
            },
            all: function (url) {
                var params = {};
                var info = $wt.url.info(url);
                (info.search).replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
                    try {
                        value = decodeURIComponent(value)
                    } catch (e) {
                        console.log(e)
                    }
                    if (key.indexOf("[") !== -1) {
                        var k = key.replace("[]", "");
                        if (!params[k]) {
                            params[k] = []
                        }
                        params[k].push(value)
                    } else {
                        params[key] = value
                    }
                });
                return params
            },
            get: function (key, url) {
                return this.all(url)[key]
            },
            exists: function (key, url) {
                return !(this.get(key, url) === undefined)
            },
            remove: function (key, url) {
                var params = this.all(url);
                delete params[key];
                var components = $wt.url.info(url);
                return $wt.url.build({
                    protocol: components.protocol,
                    host: components.host,
                    pathname: components.pathname,
                    hash: components.hash,
                    search: params
                })
            }
        },
        build: function (config) {
            var url = config.protocol + '//' + config.host + config.pathname;
            if (typeof config.search === 'object') {
                var search = Object.keys(config.search).map(function (item) {
                    var val = config.search[item];
                    if (Array.isArray(val)) {
                        return val.map(function (arr) {
                            return item + "[]=" + arr
                        }).join("&")
                    }
                    return item + "=" + config.search[item]
                });
                if (search.length) {
                    url += '?' + search.join("&")
                }
            } else if (config.search) {
                url += config.search
            }
            if (config.hash) {
                url += config.hash
            }
            return url
        },
        info: function (url) {
            var a = {};
            if (url) {
                a = document.createElement("a");
                a.className = "wt-link";
                a.href = url
            }
            return {
                protocol: a.protocol || window.location.protocol,
                host: a.host || window.location.host,
                port: a.port || window.location.port,
                pathname: a.pathname || window.location.pathname,
                hostname: a.hostname || window.location.hostname,
                hash: a.hash || window.location.hash,
                search: a.search || window.location.search
            }
        }
    }
});
$wt.extend({
    id: function () {
        return Math.random().toString(36).substr(2, 16)
    },
    uniqueID: function (E) {
        if (E.params) {
            $wt.components[(E.params.name || ((E.params.service || E.params.utility) + "_" + $wt.id()))] = E
        }
    },
    getUrlParams: function (s) {
        return $wt.url.params.all(s)
    },
    ext: function (s) {
        s = ((s || "").toLowerCase()).split("#")[0].split("?")[0];
        return ((/[.]/.exec(s)) ? (/[^.]+$/.exec(s)) : undefined) + ""
    },
    arrayToUrl: function (a) {
        var n = "";
        for (var key in a) {
            n += "&" + key + "=" + a[key]
        }
        return n
    },
    absolute: function (s, o) {
        var a = document.createElement("a");
        a.href = s;
        return (o) ? a : a.href
    },
    template: function (str, placeholders, options) {
        if (typeof str !== 'string') return '';
        var preserve = (options || {}).preserve;
        return str.replace(/{([\w_\-\:]+)}/g, function (key, name) {
            var useWildcard = key.replace(/{|}/g, '').split(':');
            var action = useWildcard[0];
            var placeholder = placeholders[useWildcard[1]] || placeholders[useWildcard[0]];
            if (preserve && !placeholder) {
                return "{" + name + "}"
            } else if (!placeholder) {
                return ""
            } else if (action === 'lowercase') {
                return placeholder.toLowerCase()
            } else if (action === 'uppercase') {
                return placeholder.toUpperCase()
            } else {
                return placeholder
            }
        })
    },
    alphaOrder: function (dataSrc, options) {
        if (!Array.isArray(dataSrc)) {
            console.log("WTERROR: alphaOrder need a real ARRAY in first argument!");
            return
        }
        var orderConf = {
                "default": "aAªáÁàÀăĂâÂåÅǻǺäÄǟǞãÃǡǠąĄāĀæÆǽǼǣǢbBḃḂcCćĆĉĈčČċĊçÇ℅dDďĎḋḊđĐðÐeEéÉèÈĕĔêÊěĚëËęĘēĒėĖəƏfFḟḞƒﬁﬂgGğĞĝĜǧǦġĠģĢǥǤhHĥĤȟȞħĦiIíÍìÌĭĬîÎïÏĩĨİįĮīĪıĳĲjJĵĴkKǩǨķĶĸlLĺĹľĽļĻłŁŀĿmMṁṀnⁿNńŃňŇñÑņŅŋŊŉ№oOºóÓòÒŏŎôÔöÖőŐõÕǫǪǭǬōŌøØǿǾœŒpPṗṖqQrRŕŔřŘŗŖɼsSśŚŝŜšŠṡṠşŞșȘſẛßtTťŤṫṪţŢțȚŧŦ™uUúÚùÙŭŬûÛůŮüÜűŰũŨųŲūŪvVwWẃẂẁẀŵŴẅẄxXyYýÝỳỲŷŶÿŸzZźŹžŽżŻʒƷǯǮ",
                "greek": "αΑἀἈἄἌἂἊἆἎἁἉἅἍἃἋἇἏάΆὰᾺᾶάΆᾳᾼᾀᾈᾄᾌᾂᾊᾆᾎᾁᾉᾅᾍᾃᾋᾇᾏᾴᾲᾷᾰᾸᾱᾹβϐΒγΓδΔεΕἐἘἔἜἒἚἑἙἕἝἓἛέΈὲῈέΈϝϜϛϚζΖηΗἠἨἤἬἢἪἡἩἥἭἣἫἧἯήΉὴῊῆἦἮήΉῃῌᾐᾘᾔᾜᾒᾚᾖᾞᾑᾙᾕᾝᾓᾛᾗᾟῄῂῇθϑΘιιΙἰἸἴἼἲἺἶἾἱἹἵἽἳἻἷἿίΊὶῚῖίΊῐῘϊΪΐῒῗΐῑῙκϰΚϗλΛμµΜνΝξΞοΟὀὈὄὌὂὊὁὉὅὍὃὋόΌὸῸόΌπϖΠϟϞρϱΡῤῥῬσςΣτΤυΥὐὔὒὖὑὙὕὝὓὛὗὟύΎὺῪῦύΎῠῨϋΫΰῢῧΰῡῩφϕΦχΧψΨωΩΩὠὨὤὬὢὪὦὮὡὩὥὭὣὫὧὯώΏὼῺῶώΏῳῼᾠᾨᾤᾬᾢᾪᾦᾮᾡᾩᾥᾭᾣᾫᾧᾯῴῲῷϡϠ",
                "cyrillic": "аАӑӐӓӒәӘӛӚӕӔбБвВгГґҐғҒҕҔдДђЂѓЃҙҘеЕѐЀёЁӗӖєЄжЖӂӁӝӜҗҖзЗӟӞѕЅӡӠиИѝЍӣӢӥӤіІїЇйЙјЈкКқҚӄӃҡҠҟҞҝҜлЛљЉмМнНңҢӈӇҥҤњЊоОӧӦөӨӫӪпПҧҦрРсСҫҪтТҭҬћЋќЌуУӯӮўЎӱӰӳӲүҮұҰфФхХҳҲһҺцЦҵҴчЧӵӴҷҶӌӋҹҸҽҼҿҾџЏшШщЩъЪыЫӹӸьЬэЭюЮяЯҩҨӀ"
            },
            options = options || {
                lang: document.lang || "default"
            },
            langGroup = {
                "el": "greek",
                "bg": "cyrillic",
                "uk": "cyrillic",
                "mk": "cyrillic",
                "sr": "cyrillic"
            },
            orderLang = {
                "default": ["default", "greek", "cyrillic"],
                "greek": ["greek", "default", "cyrillic"],
                "cyrillic": ["cyrillic", "default", "greek"]
            };
        dataSrc.sort();
        var lang = langGroup[options.lang] || "default";
        var p = orderLang[lang];
        var o = '';
        var word = '';
        var order = [];
        var tmp = [];
        var index = '';
        for (var val in p) {
            o = orderConf[p[val]].split("");
            for (var k in o) {
                for (var kk in dataSrc) {
                    word = dataSrc[kk];
                    if (word.charCodeAt(0) === o[k].charCodeAt(0)) {
                        order.push(dataSrc[kk]);
                        tmp.push(dataSrc[kk])
                    }
                }
            }
            for (var k in tmp) {
                index = dataSrc.indexOf(tmp[k]);
                dataSrc.splice(index, 1)
            }
            tmp = []
        }
        return order.concat(dataSrc)
    },
    filterXss: function (content) {
        return content.replace(/(\b)(on\S+)(\s*)=|javascript:|(<\s*)(\/*)script/ig, '')
    },
    filterHtml: function (html, allowed_tags) {
        allowed_tags = (allowed_tags || "").trim();
        if (allowed_tags) {
            allowed_tags = allowed_tags.split(/\s+/).map(function (tag) {
                return "/?" + tag
            });
            allowed_tags = "(?!" + allowed_tags.join("|") + ")"
        }
        return html.replace(new RegExp("(<" + allowed_tags + ".*?>)", "gi"), "")
    },
    cleanHTML: function (html, params) {
        if (!html) {
            return ''
        }
        var config = $wt.mergeParams({
            xss: !0,
            valid_elements: !1
        }, params || {});
        if (config.valid_elements) {
            html = this.filterHtml(html, config.valid_elements)
        }
        return html
    },
    parse: {
        csv: function (data, cfg) {
            if (data.split('.').pop() === "csv") {
                console.log('WTERROR: In order to parse the csv you will need to provide the content of the file, not the url.');
                return !1
            }
            var lineDelimiter = /\r\n|\n/;
            var itemDelimiter;
            cfg = $wt.mergeParams({
                decimal: {
                    point: 'auto'
                }
            }, cfg || {});
            switch (cfg.decimal.point) {
                case '.':
                    itemDelimiter = /\,|\;/;
                    break;
                case ',':
                    itemDelimiter = /\;/;
                    break;
                default:
                    var hasSemicolon = data.indexOf(';') !== -1;
                    itemDelimiter = hasSemicolon ? /\;/ : /\,|\;/;
                    break
            }
            var tab = data.split(lineDelimiter);
            var values = [];
            for (var i = 0; i < tab.length; i++) {
                if (!tab[i]) {
                    continue
                }
                var subtab = tab[i].split(itemDelimiter);
                var row = [];
                for (var j = 0; j < subtab.length; j++) {
                    var col = subtab[j];
                    if (['auto', ','].indexOf(cfg.decimal.point) !== -1 || isNaN(parseFloat(subtab[j]))) {
                        col = col.replace(/,/g, '.')
                    }
                    col = col.replace(/"/g, '');
                    row.push(col)
                }
                values.push(row)
            }
            return values
        }
    },
    formatNumber: function (value, format) {
        var func = window[format] || format;
        if (typeof func === 'function') {
            return func(value)
        }
        var defaultFormat = Number(value).toLocaleString("en-US", {
            currency: "EUR",
            maximumFractionDigits: format.decimals,
            minimumFractionDigits: format.decimals
        });
        var separator = format.separator;
        if (separator && (separator.thousands !== ',' || separator.decimals !== '.')) {
            defaultFormat = defaultFormat.replace(/(,|\.)/g, '__$1__').replace(/__,__/g, separator.thousands).replace(/__\.__/g, separator.decimals)
        }
        var unit = format.unit || '';
        return defaultFormat + unit
    },
    escapeHtml: function (unsafe) {
        return unsafe.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;")
    },
    unescapeHtml: function (unsafe) {
        return unsafe.replace(/\&amp;/g, "&").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&quot;/g, "\"").replace(/\&\#39;/g, "'")
    }
});
$wt.extend({
    visible: function (e) {
        if (!e) {
            return !1
        }
        var c = e.getBoundingClientRect();
        return (c.top >= -200 && c.top <= (window.innerHeight || document.documentElement.clientHeight) + 200)
    },
    insertBefore: function (from, to) {
        from.insertBefore(to, from.firstChild)
    },
    before: function (n, t) {
        (t.parentNode) ? t.parentNode.insertBefore(n, t): ""
    },
    after: function (n, t) {
        var p = t.parentNode;
        (p.lastchild === t) ? p.appendChild(n): p.insertBefore(n, t.nextSibling)
    },
    remove: function (e) {
        (e && e.parentNode) ? e.parentNode.removeChild(e): ""
    },
    zindex: function (max) {
        var index = 0,
            elms = document.getElementsByTagName("*");
        for (var i = 0, l = elms.length; i < l; i++) {
            var zindex = document.defaultView.getComputedStyle(elms[i], null).getPropertyValue("z-index");
            if (zindex > index && zindex !== "auto") {
                index = zindex
            }
        }
        index = Number(index);
        return max ? index : index + 1
    }
});
$wt.extend({
    defer: function (fnc, delay) {
        if (!this.timer) {
            this.timer = []
        }
        clearTimeout(this.timer[fnc]);
        this.timer[fnc] = setTimeout(fnc, delay || 25)
    },
    domqueue: $wt.domqueue || [],
    domchange: function (fnc) {
        var queue = function () {
            var runner = $wt.domqueue[0];
            if (runner) {
                runner();
                $wt.domqueue.shift()
            }
        };
        var run = function () {
            $wt.domqueue.push(fnc);
            queue()
        };
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if (MutationObserver) {
            var register = new MutationObserver(run);
            register.observe(document.body, {
                childList: !0,
                subtree: !0
            })
        } else if (window.addEventListener) {
            document.addEventListener('DOMNodeInserted', run, !1);
            document.addEventListener('DOMNodeRemoved', run, !1)
        }
    },
    ready: function (f) {
        /^(in|com)/.test(document.readyState) ? f() : setTimeout($wt.ready, 0, f)
    },
    on: function (o, e, f) {
        (e === "load" && document.readyState === "complete") ? f(): (o.addEventListener) ? o.addEventListener(e, f, !1) : ""
    },
    trigger: function (dom, name, args) {
        var e, v = document.createEvent;
        if (v) {
            e = document.createEvent("HTMLEvents");
            e.initEvent(name, !0, !0)
        } else {
            e = document.createEventObject();
            e.eventType = name
        }
        e.eventName = name;
        e.parameters = args || !1;
        e.sourceTarget = dom;
        if (v) {
            dom.dispatchEvent(e)
        } else {
            dom.fireEvent("on" + e.eventType, e)
        }
    }
});
$wt.extend({
    addEvent: $wt.on
});
$wt.extend({
    dictionary: [],
    isRtl: function (direction, lang) {
        direction = direction || document.dir || "ltr";
        lang = lang || document.lang;
        return (direction === "rtl" || /(ar|arc|dv|fa|ha|he|khw|ks|ku|ps|ur|yi)/i.test(lang))
    },
    label: function (set, label, lang, placeholder, range) {
        var dico = $wt.dictionary[set];
        var translate = !1;
        lang = lang || document.lang;
        placeholder = placeholder || [];
        range = range || 0;
        if (dico) {
            var lng = dico[lang];
            if (lng) {
                var strg = lng[label];
                if (strg) {
                    translate = (typeof strg === "string") ? strg : strg[range];
                    if (typeof strg === "object") {
                        return strg
                    } else if (translate === "string") {
                        translate = translate.replace(/{(\d+)}/g, function (match, key) {
                            return (typeof placeholder[key - 1] !== "undefined") ? placeholder[key - 1] : ""
                        })
                    }
                }
            }
            if (translate === "" || !translate) {
                if (dico.en) {
                    if (dico.en[label]) {
                        translate = dico.en[label]
                    }
                }
            }
        }
        return translate || "UNKNOWN LABEL"
    },
    addTranslation: function (json) {
        var dico = $wt.dictionary;
        for (var i in json) {
            if (typeof dico[i] !== "object") {
                dico[i] = {}
            }
            dico[i] = $wt.mergeParams(dico[i], json[i])
        }
        $wt.dictionary = dico
    },
    loadTranslations: function (translations, callback) {
        if (typeof callback !== 'function') {
            console.log("WTERROR: callback parameter is mandatory");
            return
        }
        if (typeof translations === "object") {
            $wt.addTranslation(translations);
            callback(!0)
        } else if (typeof translations === "string") {
            if (!$wt.isLoad[translations]) {
                $wt.isLoad[translations] = translations;
                $wt.getFile({
                    url: translations,
                    type: 'json',
                    success: function (json) {
                        try {
                            var labels = (typeof json === "string") ? JSON.parse(json) : json;
                            $wt.addTranslation(labels)
                        } catch (e) {
                            console.log("WTERROR: Couldn't load custom dictionary'", translations, "'");
                            var error = !0
                        }
                        callback(!error)
                    },
                    error: function (e) {
                        console.log("WTERROR: Couldn't load custom dictionary'", translations, "'");
                        callback(!1)
                    }
                })
            } else {
                callback(!0)
            }
        } else {
            callback(!0)
        }
    }
});
$wt.extend({
    mergeTranslation: $wt.addTranslation
});
$wt.extend({
    isLoad: [],
    handleCrossorigin: function (url, tag) {
        var source = $wt.absolute(url, !0);
        url = source.href;
        if (source.hostname !== location.hostname && source.hostname.indexOf("europa.eu") > -1 && url.indexOf("webtools/webtools.") > -1) {
            if (!!(window.MSInputMethodContext && document.documentMode)) {
                url += (url.indexOf("?") !== -1 ? "&" : "?") + "ref=" + btoa(window.location.origin)
            } else if (tag) {
                tag.setAttribute("crossorigin", "anonymous")
            }
        }
        return url
    },
    include: function (srcFile, callback, ext, forceReload) {
        var tag;
        var target;
        var isLoad = !!($wt.isLoad[srcFile]);
        if (isLoad === !1 || forceReload) {
            ext = (ext) ? ext : $wt.ext(srcFile);
            if (ext === "css") {
                tag = document.createElement("link");
                tag.setAttribute("type", "text/css");
                tag.setAttribute("rel", "stylesheet");
                tag.setAttribute("media", "all");
                target = document.getElementsByTagName("head")[0]
            } else {
                tag = document.createElement("script");
                tag.setAttribute("type", "text/javascript");
                target = document.getElementsByTagName("body")[0]
            }
            $wt.isLoad[srcFile] = tag;
            if (typeof callback === "function") {
                if (isIE) {
                    tag.onreadystatechange = function () {
                        if (this.readyState === "loaded" || this.readyState === "complete") {
                            callback(tag)
                        }
                    }
                } else {
                    tag.onload = function () {
                        callback(tag)
                    }
                }
                tag.onerror = function () {
                    callback("error")
                }
            }
            srcFile = $wt.handleCrossorigin(srcFile, tag);
            tag.setAttribute((ext === "css") ? "href" : "src", srcFile);
            target.appendChild(tag)
        } else if (typeof callback === "function") {
            callback()
        }
        return tag
    },
    load: function (files, callback) {
        var toLoad = (typeof files === "string") ? [files] : files;
        $wt.include(toLoad[0], function () {
            toLoad.shift();
            if (toLoad.length === 0) {
                if (typeof callback === "function") {
                    callback()
                }
                return
            }
            $wt.load(toLoad, callback)
        }, $wt.ext(toLoad[0]), !1)
    },
    jsonp: function (url, callback) {
        if (!$wt.json_retval) {
            $wt.json_retval = []
        }
        url = $wt.absolute(url);
        if (url.indexOf("?") !== -1) {
            url = encodeURIComponent(url)
        }
        $wt.jsonpCounter = $wt.jsonpCounter || 68448510;
        var id = $wt.jsonpCounter++;
        var requestUrl = $wt.root + "/jsonp.php?url=" + url + "&wtid=" + id;
        var scriptTag = document.createElement("script");
        scriptTag.id = id;
        if (url.indexOf("countries.php") !== -1) {
            requestUrl += "&kemopi=enabled"
        }
        if ($wt.urlParams.wtenv) {
            requestUrl += "&wtenv=" + $wt.urlParams.wtenv
        }
        if ($wt.urlParams.wtdebug) {
            requestUrl += "&wtdebug=" + $wt.urlParams.wtdebug
        }
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", requestUrl);
        scriptTag.onload = function () {
            var json = $wt.json_retval[this.id];
            if (json && json.wtstatus && json.wtstatus.success === 0) {
                callback(json, json.wtstatus.status);
                return
            }
            callback(json)
        };
        scriptTag.onerror = function () {
            callback({}, "error")
        };
        document.querySelector("body").appendChild(scriptTag);
        return scriptTag
    },
    jsonstat: function (params) {
        var opt = $wt.mergeParams({
            from: !1,
            ready: !1,
            to: !1,
            categories: !1,
            sheets: !1,
            series: !1
        }, params);
        var from = opt.from;
        var to = opt.to;
        var fnc = opt.ready;
        var cat = opt.categories;
        var series = opt.series;
        var sheets = opt.sheets;
        if (!from) {
            console.log("WTERROR: jsonstat - 'from' parameter is missing.");
            return
        } else if (typeof fnc !== "function") {
            console.log("WTERROR: jsonstat - 'ready' parameter is missing.");
            return
        }
        if (typeof from === "string") {
            from = from.replace(/&?precision=[0-9]+/gi, '')
        }
        var sanitizeLabels = function (jsonstat) {
            try {
                jsonstat.dimension.geo.category.label.DE = jsonstat.dimension.geo.category.label.DE.replace(/Germany +\(until.+/gi, "Germany").replace(/Allemagne +\(jusqu.+/gi, "Allemagne").replace(/Deutschland +\(bis.+/gi, "Deutschland")
            } catch (err) {}
            return jsonstat
        };
        var convert = function (json) {
            json = sanitizeLabels(json);
            var jsonStat = JSONstat(json);
            if (to === "html") {
                jsonStat = JSONstatUtils.datalist(jsonStat)
            } else if (to === "csv") {
                jsonStat = JSONstatUtils.toCSV(jsonStat)
            } else if (to === "lasko") {
                jsonStat = $wt.toLasko(jsonStat, cat, series, sheets)
            }
            fnc(jsonStat, opt)
        };
        var process = function () {
            if (!window.JSONstat) {
                console.log("WTERROR: jsonstat - 'libs' was not loaded correctly.");
                return
            }(typeof from === "object") ? convert(from): $wt.jsonp(from, function (json, error) {
                (!error) ? convert(json): console.log("WTERROR: jsonstat - request failed on url: \n", from)
            })
        };
        $wt.include($wt.root + "/libs/json-stat/jsonstat.php", process, "js")
    },
    ajax: function (config) {
        var url = config.url;
        var error = config.error;
        var success = config.success;
        var data = config.data;
        var dataType = config.dataType;
        var binary = config.binary;
        var credential = config.withCredentials || !1;
        var method = (data) ? 'POST' : 'GET';
        if (url !== "" && url !== undefined && url !== null) {
            if (!dataType) {
                dataType = "application/x-www-form-urlencoded"
            }
            var request = (function () {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest()
                } else if (window.ActiveXObject) {
                    return new ActiveXObject("Microsoft.XMLHTTP")
                }
                return !1
            })();
            if (!request) {
                return
            }
            url = url.replace(/&amp;/ig, "&");
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status !== 200 && request.status !== 304) {
                        if (typeof error === "function") {
                            error(config, request)
                        }
                    } else {
                        if (typeof success === "function") {
                            (binary) ? success(request): success(request.responseText, request.responseXML, config)
                        } else {
                            return {
                                txt: request.responseText,
                                xml: request.responseXML
                            }
                        }
                    }
                }
            };
            request.open(method, url, !0);
            if (binary) {
                request.responseType = "arraybuffer"
            }
            if (credential) {
                request.withCredentials = !0
            }
            if (method === 'POST') {
                request.setRequestHeader("Content-Type", dataType);
                url = '';
                for (var prop in data) {
                    url += encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]) + '&'
                }
                data = url.substring(0, url.length - 1);
                request.send(data)
            } else {
                request.send(null)
            }
        }
    },
    post: function (url, params) {
        if (!params.target || params.target === "iframe") {
            var ifrm = document.createElement("iframe");
            ifrm.name = "phiflochri";
            ifrm.style.display = "none";
            $wt.after(ifrm, document.body)
        }
        var form = document.createElement("form");
        form.method = "post";
        form.style.display = "none";
        form.action = url;
        form.target = params.target || "phiflochri";

        function populateInput(n, v) {
            if (Array.isArray(v)) {
                for (var i = 0, l = v.length; i < l; i++) {
                    populateInput(n + "[" + i + "]", v[i])
                }
            } else if (v) {
                var inp = document.createElement("INPUT");
                inp.type = "hidden";
                inp.name = n;
                inp.value = decodeURIComponent(v);
                form.appendChild(inp)
            }
        }
        for (var name in params) {
            populateInput(name, params[name])
        }
        $wt.after(form, document.body);
        form.submit()
    },
    getFile: function (params) {
        params = $wt.mergeParams({
            url: !1,
            type: !1,
            options: {
                to: "jsonstat",
                categories: !1,
                series: !1,
                sheets: !1
            },
            success: function () {},
            error: function () {}
        }, params);
        if (!params.url) {
            params.error("No url provided for getFile.");
            return
        }
        var url = $wt.absolute(params.url, !0);
        var referer = btoa(location.protocol + '//' + location.hostname);
        params.url = url.href;
        var reqSameDomain = function (callback) {
            if (url.hostname === window.location.hostname) {
                $wt.ajax({
                    url: params.url,
                    success: callback,
                    error: ajaxError
                });
                return !0
            }
            return !1
        };
        var process;
        var ajaxError = function (response, xhr) {
            try {
                var asWTJSONFormat = JSON.parse(xhr.response);
                if (asWTJSONFormat.wtstatus && asWTJSONFormat.wtstatus.success === !1) {
                    params.error("WTINFO: " + asWTJSONFormat.wtstatus.status)
                }
            } catch (e) {
                params.error("Ajax request failed on url: \n" + params.url)
            }
        };
        if (/(xlsx?|ods)/i.test(params.type)) {
            var url = encodeURIComponent(params.url);
            if (params.options.to === 'json') {
                if (params.options.row) {
                    url += "&row=" + params.options.row
                }
                if (params.options.geocode) {
                    url += "&geocode=" + params.options.geocode
                }
                $wt.ajax({
                    url: $wt.root + "/rest/spreadsheets/geocode?url=" + url + "&ref=" + referer,
                    success: function (json) {
                        try {
                            json = (typeof json === 'string') ? JSON.parse(json) : json;
                            if (!json.wtstatus.success) {
                                return ajaxError()
                            }
                            params.success(json.data, json.info || null)
                        } catch (e) {
                            params.error("The service seems down.")
                        }
                    },
                    error: ajaxError
                })
            } else {
                $wt.ajax({
                    url: $wt.root + "/rest/spreadsheets/?url=" + url + "&ref=" + referer,
                    success: function (json) {
                        try {
                            json = JSON.parse(json);
                            if (!json.wtstatus.success) {
                                return ajaxError()
                            }
                            delete json.wtstatus;
                            params.success(json)
                        } catch (e) {
                            params.error("The service seems down.")
                        }
                    },
                    error: ajaxError
                })
            }
        } else if (params.type === "csv") {
            if (reqSameDomain(params.success)) {
                return
            }
            $wt.ajax({
                url: $wt.root + "/rest/requests/requestFiles.php?type=csv&urlToRequest=" + encodeURIComponent(params.url) + "&ref=" + referer,
                success: function (json) {
                    try {
                        json = JSON.parse(json);
                        if (!json.wtstatus.success) {
                            params.error("The request failed on url: \n" + params.url);
                            return
                        }
                        params.success(json.data)
                    } catch (e) {
                        params.error("The service seems down.")
                    }
                },
                error: ajaxError
            })
        } else if (params.type === "xml") {
            process = function (xml) {
                params.success(xml)
            };
            if (reqSameDomain(process)) {
                return
            }
            $wt.ajax({
                url: $wt.root + "/rest/requests/requestFiles.php?type=xml&urlToRequest=" + encodeURIComponent(params.url) + "&ref=" + referer,
                success: function (json) {
                    try {
                        json = JSON.parse(json);
                        if (!json.wtstatus.success) {
                            params.error("The request failed on url: \n" + params.url);
                            return
                        }
                        process(json.data)
                    } catch (e) {
                        params.error("The service seems down.")
                    }
                },
                error: ajaxError
            })
        } else if (params.type === "json" || params.type === "lasko") {
            process = function (json) {
                try {
                    json = (typeof json === "string") ? JSON.parse(json) : json;
                    params.success(json)
                } catch (e) {
                    params.error("The content of the file is not a valid JSON")
                }
            };
            if (reqSameDomain(process)) {
                return
            }
            $wt.ajax({
                url: $wt.root + "/rest/requests/requestFiles.php?type=json&urlToRequest=" + encodeURIComponent(params.url) + "&ref=" + referer,
                success: function (json) {
                    try {
                        json = JSON.parse(json);
                        if (!json.wtstatus.success) {
                            params.error("The request failed on url: \n" + params.url);
                            return
                        }
                        process(json.data)
                    } catch (e) {
                        params.error("The service seems down.")
                    }
                },
                error: ajaxError
            })
        } else if (params.type === "jsonstat") {
            process = function (jsondata) {
                var from = jsondata ? JSON.parse(jsondata) : params.url;
                $wt.jsonstat($wt.mergeParams($wt.mergeParams(params, params.options), {
                    from: from,
                    ready: function (result) {
                        params.success(result)
                    }
                }))
            };
            if (reqSameDomain(process)) {
                return
            }
            process()
        } else {
            params.error("Unknown type for getting the file: \n" + params.url)
        }
    }
});
$wt.extend({
    isDNTOn: function () {
        var doNotTrackOption = (window.doNotTrack || window.navigator.doNotTrack || window.navigator.msDoNotTrack || '');
        return (doNotTrackOption.charAt(0) === '1' || doNotTrackOption === 'yes')
    },
    cookie: {
        set: function (params) {
            params = $wt.mergeParams({
                name: "",
                value: !1,
                days: !1,
                path: "/",
                domain: this.getDomain(!0),
                date: new Date(),
                expires: ""
            }, params);
            if (params.days) {
                params.date.setTime(params.date.getTime() + (params.days * 24 * 60 * 60 * 1000));
                params.expires = "; expires=" + params.date.toGMTString()
            }
            document.cookie = params.name + "=" + params.value + params.expires + "; path=" + params.path + "; domain=" + params.domain
        },
        exists: function (name) {
            return this.get(name) !== !1
        },
        get: function (name) {
            var nameEQ = name + "=",
                ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var cook = ca[i];
                while (cook.charAt(0) === ' ') {
                    cook = cook.substring(1, cook.length)
                }
                if (cook.indexOf(nameEQ) === 0) {
                    return cook.substring(nameEQ.length, cook.length)
                }
            }
            return !1
        },
        remove: function (name) {
            this.set({
                name: name,
                days: -1
            })
        },
        getDomain: function (includeDot) {
            var processedDomain = includeDot ? '.' : '';
            var host = this.getHost();
            var domain = host.split('.');
            if (/^([0-9\.]{7,}|\[[0-9a-f:]{10,}\]|[^\.]+)$/i.test(host)) {
                return host
            }
            if (domain.length > 2) {
                processedDomain += domain.slice(-3).join('.')
            } else {
                processedDomain = ''
            }
            return processedDomain
        },
        getHost: function () {
            return location.hostname
        },
        consent: {
            closedBanner: function () {
                var original = $wt.cookie.consent.get(2);
                if (original.cm) {
                    original.closed = !0
                }
                $wt.cookie.consent.set(original)
            },
            accept: {
                all: function () {
                    $wt.cookie.consent.set({
                        cm: !0,
                        all1st: !0,
                        closed: !1
                    });
                    $wt.include($wt.root + "/services/cck/?cookie-consent=all");
                    $wt.trigger(window, 'cck_all_accepted')
                },
                onlyTechnical: function () {
                    $wt.cookie.consent.set({
                        cm: !0,
                        all1st: !1,
                        closed: !1
                    });
                    $wt.include($wt.root + "/services/cck/?cookie-consent=technical");
                    $wt.trigger(window, 'cck_technical_accepted')
                }
            },
            is: {
                allAccepted: function () {
                    return window.euCookieConsent ? (this.choiceMade() && !$wt.cookie.exists('eu_optout')) : (this.choiceMade() && $wt.cookie.consent.get(2).all1st === !0)
                },
                technicalAccepted: function () {
                    return window.euCookieConsent ? !$wt.cookie.exists('eu_optout') : $wt.cookie.consent.get(2).cm === !0
                },
                choiceMade: function () {
                    return window.euCookieConsent ? $wt.cookie.exists('eu_cookie_consent') : $wt.cookie.consent.get(2).cm === !0
                },
                bannerClosed: function () {
                    return $wt.cookie.consent.get(2).closed === !0
                }
            },
            set: function (json) {
                if (json.hasOwnProperty('cm')) {
                    $wt.cookie.set({
                        name: 'cck1',
                        value: JSON.stringify(json)
                    })
                } else {
                    var host = (window.location.host.indexOf("europa.eu") >= 0) ? ".europa.eu" : !1;
                    document.cookie = "eu_cookie_consent=" + escape(json) + "; path=/" + ((!host) ? "" : "; domain=" + host)
                }
            },
            get: function (version) {
                if (version === 2) {
                    if ($wt.cookie.exists('cck1')) {
                        var originalValue = JSON.parse($wt.cookie.get('cck1'));
                        this.set(originalValue)
                    }
                    return JSON.parse($wt.cookie.get('cck1')) || {
                        cm: !1,
                        all1st: !1,
                        closed: !1
                    }
                }
                var cck = unescape($wt.cookie.get("eu_cookie_consent"));
                return (cck !== "false") ? JSON.parse(cck) : {
                    a: {},
                    r: {}
                }
            },
            status: function () {
                var cck = this.get();
                var get = function (a) {
                    for (var x in a) {
                        if (a[x].indexOf("europa-analytics") >= 0) {
                            return !0
                        }
                    }
                    return !1
                };
                if (get(cck.a)) {
                    return "accepted"
                }
                if (get(cck.r)) {
                    return "refused"
                }
                return !1
            },
            update: function (stat) {
                var cck = this.get();
                for (var x in cck) {
                    for (var y in cck[x]) {
                        if (Array.isArray(cck[x][y])) {
                            var tmp = cck[x][y].filter(function (elm) {
                                return elm !== "europa-analytics"
                            });
                            cck[x][y] = tmp
                        }
                    }
                }
                stat = (stat) ? "a" : "r";
                cck[stat].europa = cck[stat].europa || [];
                cck[stat].europa.push("europa-analytics");
                this.set(JSON.stringify(cck))
            }
        }
    }
});
$wt.frame = {
    init: function () {
        if (top.window !== window) {
            if (window.name.indexOf("WT_FRAME_") !== -1) {
                var styling = {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    display: "inline-block",
                    margin: 0,
                    overflow: "hidden"
                };
                for (var x in styling) {
                    if (document.body) {
                        document.body.style[x] = styling[x]
                    }
                }
                $wt.on(window, "load", function () {
                    $wt.frame.resize();
                    $wt.on(window, "resize", $wt.frame.resize);
                    $wt.on(window, "orientationchange", $wt.frame.resize);
                    if ("MutationObserver" in window) {
                        var obsrv = new MutationObserver($wt.frame.resize);
                        obsrv.observe(document.body, {
                            childList: !0,
                            subtree: !0
                        })
                    }
                });
                $wt.on(document.getElementById('nexteuropasearch__search-results') || window, 'click', function (evt) {
                    var evt = evt || window.event;
                    var targ = evt.target || evt.srcElement;
                    while (targ && !targ.href) {
                        targ = targ.parentNode
                    }
                    if (targ && targ.href && !targ.getAttribute("aria-controls") && !targ.isTracked && (!targ.href.match(/^(javascript|mailto|#|sms)/i) || ($wt.urlParams.render === "iframe" && targ.href.indexOf('europa.eu/search') < 0))) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        window.parent.postMessage({
                            service: 'frame-analytics',
                            link: targ.href
                        }, '*');
                        setTimeout(function () {
                            targ.isTracked = !0;
                            targ.click()
                        }, 350)
                    }
                });
                var isSearchPage = document.getElementById('internal-search');
                if (isSearchPage) {
                    var countElement = document.querySelector("meta[property='nexteuropasearch:count']");
                    var count = countElement && +countElement.getAttribute("content") || 0;
                    parent.postMessage({
                        service: "frame-search-track",
                        keyword: isSearchPage.value,
                        count: count,
                        location: location.href
                    }, "*")
                }
            }
        } else {
            $wt.on(window, "message", $wt.frame.parent)
        }
    },
    resize: function () {
        if (top.window === window && !parent.postMessage) {
            return
        }
        parent.postMessage({
            service: "frame",
            name: window.name,
            height: document.body.offsetHeight
        }, "*")
    },
    parent: function (e) {
        var data = e.data || {};
        if (data.service === 'frame-search-track') {
            if ($wt.analytics.parameters) {
                $wt.analytics.parameters.search = {
                    keyword: data.keyword,
                    category: "Europa Search",
                    count: data.count
                };
                $wt.trackPageView($wt.analytics.parameters);
                window.name = data.location
            }
        } else if (data.service === 'frame-analytics') {
            $wt.trackLinks(data.link)
        } else if (data.service === "frame") {
            var frame = document.querySelectorAll("iframe[name='" + data.name + "']");
            if (!frame || !frame.length) {
                return
            }
            var height = data.height;
            var frm = frame[0];
            var width = frm.offsetWidth;
            var prev = frm.previousWidth;
            if (width === prev && frm.offsetHeight === height) {
                frm.previousHeight = height;
                frm.previousWidth = width
            } else {
                if (width > prev && frm.previousHeight) {
                    height = (frm.previousHeight) - Math.round((width - prev) * (height / width))
                }
                frm.previousHeight = height;
                frm.previousWidth = frm.offsetWidth;
                frm.height = height;
                frm.setAttribute("style", (frm.getAttribute("style") || "").split(";height:")[0] + ";height:" + height + "px !important")
            }
        }
    }
};
$wt.on(window, "wtReady", $wt.frame.init);
$wt.extend({
    pop: function (c) {
        var doc = document;
        c = c || {};
        var currentFocusableElement = document.activeElement || !1;
        document.body.setAttribute("aria-hidden", !0);
        $wt.pop.close = function () {
            $wt.pop.wtOverlayer.style.display = "none";
            $wt.remove($wt.pop.wtPopup);
            document.body.removeAttribute("aria-hidden");
            if (currentFocusableElement) {
                currentFocusableElement.focus()
            }
            if (typeof $wt.pop.wtPopup.onClose === "function") {
                $wt.pop.wtPopup.onClose()
            }
        };
        if (!$wt.pop.wtOverlayer) {
            $wt.pop.wtOverlayer = document.createElement("div");
            $wt.pop.wtOverlayer.className = "wtOverlayer";
            $wt.after($wt.pop.wtOverlayer, document.body);
            $wt.on(document, "keydown", function (evt) {
                evt = evt || window.event;
                if (evt.keyCode === 27) {
                    $wt.pop.close()
                }
            });
            $wt.on($wt.pop.wtOverlayer, "click", $wt.pop.close)
        }
        $wt.pop.wtOverlayer.style.display = "block";
        $wt.pop.wtPopup = document.createElement("div");
        $wt.pop.wtPopup.className = "wtPopup " + ((c.fullscreen) ? "wtPopupFullscreen " : "") + c["class"];
        $wt.after($wt.pop.wtPopup, $wt.pop.wtOverlayer);
        $wt.pop.wtPopup.setAttribute("tabindex", "0");
        $wt.pop.wtPopup.setAttribute("role", "dialog");
        $wt.pop.wtPopup.setAttribute("aria-describedby", "modalDescription");
        $wt.pop.wtPopup.dialogDesc = document.createElement("div");
        $wt.pop.wtPopup.dialogDesc.id = "modalDescription";
        $wt.pop.wtPopup.dialogDesc.className = "wtOffscreen";
        $wt.pop.wtPopup.appendChild($wt.pop.wtPopup.dialogDesc);
        $wt.pop.wtPopup.dialogDesc.innerHTML = "Escape will cancel and close the window";
        var hh = c.head || c.title;
        var hh = (hh) ? "<h1 class='wt-head'><span>" + hh + "</span></h1>" : "<h1 class='wt-head' aria-hidden='true'>&nbsp;</h1>";
        $wt.pop.wtPopup.head = document.createElement("div");
        $wt.pop.wtPopup.head.className = "wtPopupHead";
        $wt.pop.wtPopup.head.innerHTML = hh;
        $wt.pop.wtPopup.appendChild($wt.pop.wtPopup.head);
        $wt.pop.wtPopup.content = document.createElement("div");
        $wt.pop.wtPopup.content.className = "wtPopupContent";
        $wt.pop.wtPopup.content.innerHTML = (c.content) ? c.content : "";
        $wt.pop.wtPopup.appendChild($wt.pop.wtPopup.content);
        $wt.pop.wtPopup.footer = document.createElement("div");
        $wt.pop.wtPopup.footer.className = "wtPopupFooter";
        $wt.pop.wtPopup.footer.innerHTML = (c.footer) ? c.footer : "";
        $wt.pop.wtPopup.appendChild($wt.pop.wtPopup.footer);
        var x = "Close";
        var k = document.createElement("a");
        k.className = "wt-link wtPopupCloseBtn";
        k.title = x;
        k.href = "javascript:$wt.pop.close()";
        k.innerHTML = x + '<b><span>&times;</span></b>';
        $wt.pop.wtPopup.appendChild(k);
        $wt.pop.focusableElements = $wt.pop.wtPopup.querySelectorAll("a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]");
        $wt.pop.wtPopup.focus();

        function trapTabKey(obj, evt) {
            if (evt.which === 9) {
                $wt.pop.focusableElements = $wt.pop.wtPopup.querySelectorAll("a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]");
                var focusedItem = document.activeElement;
                var numberOfFocusableItems = $wt.pop.focusableElements.length;
                var focusedItemIndex = 0;
                for (var i = 0, l = numberOfFocusableItems; i < l; i++) {
                    if ($wt.pop.focusableElements[i] === focusedItem) {
                        focusedItemIndex = i
                    }
                }
                if (evt.shiftKey) {
                    if (focusedItemIndex === 0) {
                        $wt.pop.focusableElements[$wt.pop.focusableElements.length - 1].focus();
                        evt.preventDefault()
                    }
                } else {
                    if (focusedItemIndex === numberOfFocusableItems - 1) {
                        $wt.pop.focusableElements[0].focus();
                        evt.preventDefault()
                    }
                }
            }
        }
        $wt.pop.wtPopup.onkeydown = function (e) {
            var e = e || window.event;
            trapTabKey(this, e)
        };
        if (typeof c.callback === "function") {
            c.callback($wt.pop.wtPopup)
        }
        return $wt.pop.wtPopup
    }
});
$wt.extend({
    shadeColor: function (color, percent) {
        var bit = parseInt(color.slice(1), 16);
        bin = percent < (0) ? 0 : 255, pourcent = percent < (0) ? percent * -1 : percent, red = bit >> 16, green = bit >> 8 & 0x00FF, blue = bit & 0x0000FF;
        return '#' + (0x1000000 + (Math.round((bin - red) * pourcent) + red) * 0x10000 + (Math.round((bin - green) * pourcent) + green) * 0x100 + (Math.round((bin - blue) * pourcent) + blue)).toString(16).slice(1)
    },
    color: function (color, percent) {
        if (!!window.CanvasRenderingContext2D === !1) {
            return color
        }
        if (!$wt.wtColor) {
            $wt.wtColor = document.createElement('canvas').getContext('2d')
        }
        var canvas = $wt.wtColor;
        canvas.fillStyle = color;
        canvas.fillRect(0, 0, 1, 1);
        var get = function (val) {
            if (val > 255) {
                val = 255
            } else if (val < 0) {
                val = 0
            }
            return val
        };
        var col = canvas.getImageData(0, 0, 1, 1),
            perc = Math.floor(percent / 100 * 255),
            red = get(col.data[0] + perc),
            green = get(col.data[1] + perc),
            blue = get(col.data[2] + perc);
        return '#' + ((red << 16) | (green << 8) | blue).toString(16)
    }
});
$wt.extend({
    languages: {
        "official": {
            "bg": "български",
            "lv": "latviešu",
            "cs": "čeština",
            "lt": "lietuvių",
            "da": "dansk",
            "hu": "magyar",
            "de": "Deutsch",
            "mt": "Malti",
            "et": "eesti",
            "nl": "Nederlands",
            "el": "ελληνικά",
            "pl": "polski",
            "en": "English",
            "pt": "português",
            "es": "español",
            "ro": "română",
            "fr": "français",
            "sk": "slovenčina",
            "ga": "Gaeilge",
            "sl": "slovenščina",
            "hr": "hrvatski",
            "fi": "suomi",
            "it": "italiano",
            "sv": "svenska"
        },
        "non-official": {
            "ca": "català",
            "sq": "shqiptar",
            "ar": "عربى",
            "hy": "հայերեն",
            "be": "беларускі",
            "he": "עִברִית",
            "hi": "हिंदी",
            "is": "íslenska",
            "ja": "日本の",
            "no": "norsk",
            "mk": "Македонски",
            "ru": "русский",
            "tr": "Türk",
            "ur": "اردو",
            "vi": "Tiếng Việt",
            "zh": "中文"
        },
        "regexpURL": /(https?:)?\/\/[^\/]+\/?(.*)(_|-|::|=|\/)([a-z]{2})(\.|&|#|$|\?|\/)(.*)/ig,
        fromURL: function (url) {
            var lang = (url + "").replace(this.regexpURL, "$4");
            return (lang.length === 2 ? lang.toLowerCase() : null)
        },
        isOfficial: function (lang) {
            return !!this["official"][lang]
        },
        isNonOfficial: function (lang) {
            return !!this["non-official"][lang]
        }
    },
    lang: function (def) {
        if (!def && document.lang) {
            return document.lang
        }
        var lang = def || "en";
        var html = document.querySelector("html");
        var meta = document.querySelectorAll("meta[http-equiv='Content-Language']");
        var url = this.languages.fromURL(window.location);
        if (html && html.lang) {
            lang = (html.lang).split("_")[0].split("-")[0]
        } else if (meta[0]) {
            lang = meta[0].content
        } else if (url && !$wt.urlParams.etrans) {
            lang = url
        }
        if (def) {
            return (lang === !0) ? '' : lang
        }
        document.masterLang = lang;
        document.lang = $wt.urlParams.etrans || lang;
        return document.lang
    }
});
$wt.extend({
    ecas: function (config) {
        var params = $wt.mergeParams({
            redirect: location.href,
            success: function () {},
            error: !1
        }, config);
        var cookie = $wt.cookie.get('wtecas');
        var ticket = $wt.urlParams.ticket;
        var url = 'https://webgate.ec.europa.eu/cas/login?userDetails=true&groups="*"&service=' + encodeURIComponent(params.redirect);
        var getUserInfoURL = $wt.template(['https://webgate.ec.europa.eu/cas/serviceValidate?userDetails=true&groups="*"', '&ticket={ticket}&getinfo=true&service={redirect}', ].join(''), {
            ticket: ticket,
            redirect: encodeURIComponent($wt.url.params.remove('ticket', params.redirect))
        });
        if (cookie) {
            params.success(JSON.parse(atob(cookie)))
        } else if (ticket) {
            $wt.getFile({
                type: "xml",
                url: getUserInfoURL,
                success: function (response) {
                    var xml = response.replace(/cas:/g, '');
                    var temp = document.createElement("div");
                    temp.innerHTML = xml;
                    var tags = ["assuranceLevel", "email", "user", "firstname", "lastname", "telephoneNumber"];
                    var final = {};
                    [].forEach.call(temp.querySelectorAll(tags.join(',')), function (node) {
                        var nodeValue = node.innerText;
                        var nodeName = node.tagName.toLowerCase();
                        final[nodeName] = (!isNaN(nodeValue)) ? Number(nodeValue) : nodeValue
                    });
                    if (final['assuranceLevel'] < 30) {
                        alert('Only inter-institutional account are allowed');
                        return
                    }
                    $wt.cookie.set({
                        name: "wtecas",
                        value: btoa(JSON.stringify(final))
                    });
                    params.success(final)
                },
                error: function () {
                    if (typeof params.error === 'function') {
                        params.error()
                    } else {
                        console.log('ECAS service is not accessible for the moment. Please try later.')
                    }
                }
            })
        } else {
            location.href = url
        }
    }
});
$wt.extend({
    getSupercookieName: function (cookName) {
        return location.host === 'europa.eu' ? 'main_' + cookName : cookName
    },
    trackLinks: function (str, callback) {
        if (!window._paq || !window.Piwik || !$wt.analytics.isTrackable() || !$wt.analytics.isActive) {
            return !1
        }
        if (typeof str === "string") {
            var isExternal = $wt.isExternal(str);
            var isDocument = $wt.isDocument(str);
            var isLink = (!str.match(/^(javascript|mailto|#|sms)/i));
            var isNotSame = (str !== window.location.href);
            if ((isExternal || isDocument) && isLink && isNotSame) {
                _paq.push(['trackLink', str, isDocument ? 'download' : 'link', null, callback])
            }
        } else if (Piwik.getAsyncTracker && !$wt.analytics.parameters.mobile) {
            var t = Piwik.getAsyncTracker();
            [].forEach.call(document.body.querySelectorAll('a[href]'), function (a) {
                if (!a.analyticsWasHere && !a.piwikTrackers && a.href && !a.href.match(/^(javascript|mailto|#|sms)/i) && !a.getAttribute("aria-controls") && !/ea_ignore|piwik_ignore/.test(a.className)) {
                    t.addListener(a);
                    a.analyticsWasHere = !0
                }
            })
        }
    },
    isDocument: function (s) {
        if (typeof s !== "string") {
            if (s.className && (s.className + "").indexOf("piwik_download") !== -1) {
                return !0
            }
            s = s.href || ""
        }
        var d = ['7z', 'aac', 'apk', 'arc', 'arj', 'asf', 'asx', 'avi', 'azw3', 'bin', 'csv', 'deb', 'dmg', 'doc', 'docx', 'epub', 'exe', 'flv', 'gif', 'gz', 'gzip', 'hqx', 'ibooks', 'jar', 'jpg', 'jpeg', 'js', 'mobi', 'mp2', 'mp3', 'mp4', 'mpg', 'mpeg', 'mov', 'movie', 'msi', 'msp', 'odb', 'odf', 'odg', 'ods', 'odt', 'ogg', 'ogv', 'pdf', 'phps', 'png', 'ppt', 'pptx', 'qt', 'qtm', 'ra', 'ram', 'rar', 'rpm', 'sea', 'sit', 'tar', 'tbz', 'tbz2', 'bz', 'bz2', 'tgz', 'torrent', 'txt', 'wav', 'wma', 'wmv', 'wpd', 'xls', 'xlsx', 'xml', 'z', 'zip'];
        var p = new RegExp('\\.(' + d.join('|') + ')([?&#]|$)', 'i');
        return p.test(s)
    },
    isExternal: function (str) {
        var params = $wt.analytics.sitePaths;
        str = $wt.absolute(str);
        str = str.replace(/#.*$/, '').replace(/\?.*$/, '');
        var isExternal = !0;
        for (var x in params) {
            if (String(str).indexOf(params[x]) !== -1) {
                isExternal = !1
            }
        }
        return isExternal
    },
    trackPageView: function (params, can) {
        params = $wt.mergeParams($wt.analytics.parameters, params);
        var cfg = $wt.analytics.config();
        var inst = params.instance || 'ec.europa.eu';
        var tmpp = params.sitePath;
        var path = (typeof tmpp === "string") ? [tmpp] : tmpp;
        var status = cfg[inst].status;
        var url = cfg[inst].url;
        if (!params.siteID) {
            console.log("WTERROR: Piwik, missing 'siteID' parameter")
        } else if (!path) {
            console.log("WTERROR: Piwik, missing 'sitePath' parameter")
        } else if (!status) {
            console.log('WTERROR: [PIWIK] The Piwik instance, [' + inst + '] is down, please try again later')
        } else {
            var currentUrl = (location.href).split("#")[0];
            if ((params.mode === "auto" || params.mode === "manual") && (params.currentTitle !== document.title || params.currentUrl !== currentUrl)) {
                if (document.referrer) {
                    _paq.push(['setReferrerUrl', params.currentUrl])
                }
                _paq.push(['setCustomUrl', currentUrl]);
                _paq.push(['setGenerationTimeMs', 0]);
                params.currentUrl = currentUrl
            }
            _paq.push(['setSiteId', params.siteID]);
            _paq.push(["setDomains", $wt.analytics.sitePaths]);
            if ($wt.analytics.parameters.cookiePath) {
                _paq.push(['setCookiePath', $wt.analytics.parameters.cookiePath]);
                can = !0
            }
            if (params.lang) {
                _paq.push(["setCustomDimension", 1, params.lang])
            } else if ($wt.lang(!0) !== !1) {
                _paq.push(["setCustomDimension", 1, $wt.lang(!0)])
            } else {
                _paq.push(["setCustomDimension", 1, "unknown"])
            }
            if (params.siteSection) {
                _paq.push(["setCustomDimension", 2, params.siteSection])
            }(function (strSize, maxSize, arr, meta) {
                if (meta) {
                    (((meta.getAttribute('content') || "").split(",")).sort()).forEach(function (e) {
                        var k = e.replace(/^\s+|\s+$/gm, '');
                        strSize += k.length + 1;
                        if (strSize < maxSize) {
                            arr.push(k)
                        }
                    });
                    _paq.push(['setCustomDimension', 3, '.' + (arr.join('.')).toUpperCase() + '.'])
                }
            })(0, 253, [], document.querySelector("meta[name='ec_departments']"));
            if (params.is404) {
                _paq.push(['setDocumentTitle', '404/URL=' + encodeURIComponent(document.location.pathname + document.location.search) + '/From=' + encodeURIComponent(document.referrer)])
            } else if (params.is403) {
                _paq.push(['setDocumentTitle', '403/URL=' + encodeURIComponent(document.location.pathname + document.location.search) + '/From=' + encodeURIComponent(document.referrer)])
            } else if (params.is500) {
                _paq.push(['setDocumentTitle', '500/URL=' + encodeURIComponent(document.location.pathname + document.location.search) + '/From=' + encodeURIComponent(document.referrer)])
            } else {
                _paq.push(['setDocumentTitle', encodeURIComponent(document.title)])
            }
            _paq.push(['setTrackerUrl', url + 'piwik.php']);
            if (params.search) {
                _paq.push(['trackSiteSearch', params.search.keyword || "", params.search.category || !1, params.search.count || 0])
            }
            if (params.before) {
                if (typeof window[params.before] === "function") {
                    _paq = window[params.before](_paq)
                }
            }
            if (!params.search && params.mode !== "notnow") {
                _paq.push(['trackPageView'])
            }
            if (params.mode === "notnow") {
                params.mode = "manual"
            }
            if (!params.mobile) {
                _paq.push(['enableLinkTracking'])
            }
            _paq.push(['setDoNotTrack', !0])
        }
        if (params.after) {
            if (typeof window[params.after] === "function") {
                window[params.after]()
            }
        }
        $wt.analytics.parameters = params;
        return {
            "process": can,
            "instance": status,
            "url": url,
            "params": params
        }
    },
    analytics: {
        init: function () {
            if (Element.prototype._addEventListener) {
                return
            }
            Element.prototype._addEventListener = Element.prototype.addEventListener;
            Element.prototype.addEventListener = function (type, listener, useCapture) {
                if (/ea_ignore|piwik_ignore/.test(this.className) && (listener).toString().indexOf("function(cZ){cZ=cZ||R.event;") > -1) {
                    return
                }
                this._addEventListener(type, listener, !!useCapture);
                if (!this.eventsList) {
                    this.eventsList = {}
                }
                if (!this.eventsList[type]) {
                    this.eventsList[type] = []
                }
                this.eventsList[type].push({
                    type: type,
                    listener: listener,
                    useCapture: !!useCapture
                })
            };
            Element.prototype.getEventListeners = function (type) {
                if (!this.eventsList) {
                    this.eventsList = {}
                }
                return (!type) ? this.eventsList : this.eventsList[type]
            };
            _paq._push = _paq.push;
            $wt.on(window, "cck_refused", function () {
                setTimeout($wt.analytics.disable, 250)
            })
        },
        disable: function () {
            $wt.analytics.deletePiwikCookies();
            this.isActive = !1;
            [].forEach.call(document.querySelectorAll("a"), function (elm) {
                for (var x in elm) {
                    if (x === "piwikTrackers" || x === "analyticsWasHere") {
                        var events = elm.getEventListeners();
                        for (var y in events) {
                            [].forEach.call(events[y], function (evt) {
                                if ((evt.listener).toString().indexOf("function(cZ){cZ=cZ||R.event;") > -1) {
                                    elm.removeEventListener(y, evt.listener);
                                    delete elm.analyticsWasHere;
                                    delete elm.piwikTrackers
                                }
                            })
                        }
                    }
                }
            });
            if (window._paq) {
                _paq._push = _paq.push;
                _paq.push = function () {
                    console.log("WTINFO - This method is disabled (GDPO).")
                }
            }
        },
        enable: function () {
            if (window.Piwik) {
                this.isActive = !0;
                $wt.trackLinks();
                if (_paq._push) {
                    _paq.push = _paq._push
                }
            } else if ($wt.exists('analytics')) {
                $wt.analytics.run($wt.analytics.container, $wt.analytics.parameters)
            }
        },
        isActive: !1,
        config: function () {
            return {
                "root": {
                    "ec.europa.eu": ["ec.europa.eu\/index*", "ec.europa.eu\/about_*", "ec.europa.eu\/represent_*", "ec.europa.eu\/info", "ec.europa.eu\/priorities", "ec.europa.eu\/commission", "ec.europa.eu\/about", "ec.europa.eu\/atwork", "ec.europa.eu\/policies", "ec.europa.eu\/contracts_grants", "ec.europa.eu\/news", "ec.europa.eu\/legislation", "ec.europa.eu\/geninfo\/europa_analytics_*", "ec.europa.eu\/geninfo\/legal_notices_*", "ec.europa.eu\/green-papers", "ec.europa.eu\/white-papers", "ec.europa.eu\/cookies", "ec.europa.eu\/contact", "ec.europa.eu\/services", "ec.europa.eu\/your-rights", "ec.europa.eu\/visits", "ec.europa.eu\/sitemap"],
                    "europa.eu": ["europa.eu\/index*", "europa.eu\/european-union"],
                    "allowedIframeHosts": ["europa.eu", "ec.europa.eu"]
                },
                "ec.europa.eu": {
                    "url": "https:\/\/webanalytics.ec.europa.eu\/",
                    "status": true
                },
                "europa.eu": {
                    "url": "https:\/\/webanalytics.europa.eu\/",
                    "status": true
                },
                "testing": {
                    "url": "https:\/\/webanalytics.acc.fpfis.cat.ec.europa.eu\/",
                    "status": true
                },
                "awstesting": {
                    "url": "https:\/\/webanalytics.acc.fpfis.cat.ec.europa.eu\/",
                    "status": true
                },
                "optin": ["ema.europa.eu"]
            }
        },
        parameters: !1,
        mobile: function (event) {
            var params = $wt.analytics.parameters;
            if (!params.mobile || !$wt.analytics.isActive) {
                return !0
            }
            var el = event.srcElement || event.target;
            while (el && !el.href) {
                el = el.parentNode
            }
            if (el && el.href && !el.href.match(/^(javascript|mailto|#|sms)/i) && !el.piwikTrackers && el.href !== "" && el.href !== (location.href).split("#")[0] && ($wt.isExternal(el.href) || $wt.isDocument(el)) && !el.realClick && !/ea_ignore|piwik_ignore/.test(el.className)) {
                event.preventDefault();
                event.stopPropagation();
                if (el.isTrigger) {
                    return
                }
                el.isTrigger = !0;
                var callback = (params.mobile || {}).callback;
                var validate = (typeof window[callback] === "function") ? window[callback](el) : !0;
                var process = function () {
                    clearTimeout($wt.analytics.timer);
                    if (validate) {
                        el.realClick = !0;
                        el.click()
                    }
                };
                $wt.trackLinks(el.href, process);
                $wt.analytics.timer = setTimeout(process, ((params.mobile || {}).delay || 1000))
            }
        },
        track: function () {
            clearTimeout(window.analyticsTimer);
            window.analyticsTimer = setTimeout(function () {
                $wt.trackLinks()
            }, 100)
        },
        getCookiePath: function () {
            var params = $wt.analytics.parameters;
            var tmpp = params.sitePath;
            var path = (typeof tmpp === "string") ? [tmpp] : tmpp;
            if (!params) {
                return "/"
            }
            path.sort(function (a, b) {
                return a.length > b.length
            });
            var setCookiePath = (function (ref) {
                for (var i = 0, l = path.length; i < l; i++) {
                    if (ref.indexOf(path[i]) !== -1 && ref.indexOf(path[i]) < 9) {
                        return "/" + ((path[i].replace(/.*?:?\/\//g, "").replace(/^\/+|\/+$/g, ''))).split("/").slice(1).join("/")
                    }
                }
                return !1
            })(location.href);
            return $wt.analytics.parameters.cookiePath = setCookiePath
        },
        deletePiwikCookies: function () {
            var cookieNames = document.cookie.split(";");
            for (var i = 0; i < cookieNames.length; i++) {
                var cookName = (cookieNames[i].split("=")[0]).trim();
                if (/_pk_(ses|id|ref)[\.a-z0-9]*/.test(cookName)) {
                    $wt.cookie.remove(cookName);
                    $wt.cookie.set({
                        name: cookName,
                        value: '',
                        days: -1,
                        path: $wt.analytics.getCookiePath()
                    });
                    document.cookie = cookName + '=; Path=' + $wt.analytics.getCookiePath() + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                }
            }
        },
        isOptInModeEnable: function () {
            var cfg = $wt.analytics.config();
            var pathsOptin = cfg.optin || [];
            var domain = location.host.split('.').length > 3 ? location.host.split('.').slice(-3).join('.') : location.host;
            return pathsOptin.indexOf(domain) !== -1
        },
        isOptedIn: function () {
            return $wt.cookie.get($wt.getSupercookieName('eu_optin')) === "true"
        },
        isOptedOut: function () {
            return $wt.cookie.get($wt.getSupercookieName('eu_optout')) === "true"
        },
        optOut: function () {
            $wt.analytics.isOptInModeEnable() ? $wt.cookie.remove($wt.getSupercookieName('eu_optin')) : $wt.cookie.set({
                name: $wt.getSupercookieName('eu_optout'),
                value: !0,
                days: 365
            });
            $wt.analytics.deletePiwikCookies();
            $wt.cookie.consent.update(!1)
        },
        optIn: function () {
            $wt.analytics.isOptInModeEnable() ? $wt.cookie.set({
                name: $wt.getSupercookieName('eu_optin'),
                value: !0,
                days: 365
            }) : $wt.cookie.remove($wt.getSupercookieName('eu_optout'));
            $wt.cookie.consent.update(!0)
        },
        isTrackable: function () {
            if ($wt.analytics.isOptedOut() || $wt.cookie.consent.status() === "refused" || $wt.isDNTOn()) {
                $wt.analytics.deletePiwikCookies();
                return !1
            }
            if ($wt.analytics.isOptInModeEnable()) {
                return $wt.analytics.isOptedIn()
            }
            return !0
        },
        pushstate: function () {
            var p = $wt.analytics.parameters;
            if (p.mode !== "auto" || !this.isActive) {
                return
            }
            clearTimeout(window.analyticsTimer);
            window.analyticsTimer = setTimeout(function () {
                $wt.trackPageView(p)
            }, 10)
        },
        popstate: function (e) {
            var p = $wt.analytics.parameters;
            if (p.mode !== "auto" || !this.isActive) {
                return
            }
            clearTimeout(window.analyticsTimer);
            window.analyticsTimer = setTimeout(function () {
                if ((location.href).split("#")[0] !== p.currentUrl) {
                    $wt.analytics.parameters.currentUrl = (location.href).split("#")[0];
                    $wt.trackPageView($wt.analytics.parameters)
                }
            }, 50)
        },
        shouldNotTrack: function (params) {
            if ($wt.isDNTOn()) {
                if (/_pk_(ses|id|ref)[\.a-z0-9]*/.test(document.cookie)) {
                    $wt.analytics.deletePiwikCookies()
                }
                return !0
            } else if ($wt.cookie.exists('cck1') && !window.euCookieConsent) {
                var cck1 = JSON.parse($wt.cookie.get("cck1"));
                if ($wt.cookie.consent.is.choiceMade()) {
                    return !(cck1.cm && cck1.all1st)
                }
                return !!params.explicit
            } else if ($wt.exists('cck')) {
                return params.explicit
            } else if ($wt.cookie.exists('eu_cookie_consent')) {
                var euCook = JSON.parse(decodeURIComponent($wt.cookie.get('eu_cookie_consent')));
                return JSON.stringify(euCook.r).indexOf('europa-analytics') > -1
            }
            return !!params.explicit
        },
        cckEventsListener: function () {
            $wt.on(window, "cck_all_accepted", function () {
                setTimeout($wt.analytics.enable, 250)
            });
            $wt.on(window, "cck_technical_accepted", function () {
                setTimeout($wt.analytics.disable, 250)
            });
            $wt.on(window, "cck_accepted", function () {
                $wt.cookie.consent.accept.all();
                setTimeout($wt.analytics.enable, 250)
            });
            $wt.on(window, "cck_refused", function () {
                $wt.cookie.consent.accept.onlyTechnical();
                setTimeout($wt.analytics.disable, 250)
            })
        },
        run: function (obj, params) {
            if (!$wt.analytics.container) {
                this.cckEventsListener()
            }
            $wt.analytics.container = obj;
            params.currentUrl = (document.referrer).split("#")[0];
            params.currentTitle = document.title;
            if (params.mobile || 'ontouchstart' in window) {
                params.mobile = params.mobile || !0
            }
            params.mode = params.mode || "default";
            params.mode = (params.mode === "manual") ? "notnow" : params.mode;
            params.explicit = !!params.explicit;
            $wt.analytics.parameters = params;
            if (this.shouldNotTrack(params)) {
                $wt.next(obj);
                return
            }
            $wt.analytics.getCookiePath();
            window._paq = window._paq || [];
            var cfg = $wt.analytics.config();
            var temp = [];
            for (var x = 0, l = params.sitePath.length; x < l; x++) {
                var path = params.sitePath[x];
                var alias = cfg.root[path];
                if (alias) {
                    for (var z in alias) {
                        temp.push(alias[z])
                    }
                } else {
                    temp.push(path)
                }
            }
            $wt.analytics.sitePaths = temp;
            this.parameters = params;
            var tracker = $wt.trackPageView(params);
            if (tracker.process && tracker.instance) {
                this.isActive = !0;
                this.init();
                $wt.include(tracker.url + 'piwik.js', function () {
                    if (params.mobile) {
                        $wt.on(document, "click", $wt.analytics.mobile)
                    } else {
                        $wt.domchange($wt.analytics.track)
                    }
                    if (params.mode === "auto") {
                        $wt.on(window, 'popstate', $wt.analytics.popstate);
                        if (!(isIE && isIE < 9)) {
                            try {
                                var oriHistory = history.pushState;
                                history.pushState = function () {
                                    $wt.analytics.pushstate();
                                    oriHistory.apply(this, arguments)
                                }
                            } catch (e) {}
                        }
                    }
                }, "js", !1, params.async)
            }
            $wt.next(obj)
        }
    }
});
(function (win, doc, previous) {
    var prev = function (elm, slc) {
        var temp = {};
        for (; elm && elm !== document; elm = elm.parentNode) {
            var childs = elm.querySelectorAll(slc);
            if (childs.length >= 2) {
                temp.children = childs;
                temp.parent = elm;
                break
            }
        }
        return temp
    };
    var trap = function (elm) {
        var fields = elm.querySelectorAll("a[href], input, select, textarea, button");
        if (elm.getAttribute("tabindex")) {
            fields = Array.prototype.slice.call(fields);
            fields.unshift(elm)
        }
        var first = fields[0];
        var last = fields[fields.length - 1];
        first.focus();
        elm.onkeydown = function (e) {
            if ((e.key === 'Tab' || e.keyCode === 9)) {
                if (e.shiftKey) {
                    if (doc.activeElement === first) {
                        last.focus();
                        e.preventDefault()
                    }
                } else {
                    if (doc.activeElement === last) {
                        first.focus();
                        e.preventDefault()
                    }
                }
            }
        };
        return elm
    };
    var reset = function (e) {
        var current = e.target || !1;
        if (previous && current && previous !== current) {
            [].forEach.call(previous.from, function (brother) {
                if (brother.get("aria-expanded") === "true") {
                    brother.set("aria-expanded", !1)
                }
            });
            [].forEach.call(previous.to, function (targ) {
                if (!targ.has("hidden")) {
                    targ.set("hidden", "")
                }
            });
            $wt.trigger(window, "aria-dropdown-previous-close", previous);
            previous = !1
        }
    };
    var menu = function (elm) {
        if (!this.has("hidden")) {
            previous = elm
        }
    };
    var dialog = function (elm, escKey) {
        if (!escKey && !this.has("hidden")) {
            win.lastFocus = elm;
            win.lastDialog = this;
            doc.body.setAttribute("aria-hidden", !0);
            trap(this, !0)
        } else {
            doc.body.removeAttribute("aria-hidden");
            if (win.lastFocus) {
                win.lastFocus.focus();
                win.lastFocus = !1
            }
            if (win.lastDialog) {
                win.lastDialog.set("hidden", "");
                win.lastDialog = !1
            }
        }
    };
    var tab = function (elm, init, focus) {
        var tabs = prev(elm, '[role="tab"]');
        [].forEach.call(tabs.children, function (btn, index) {
            if (init) {
                btn.setAttribute("tabindex", (btn.getAttribute("aria-selected") === "true") ? 0 : -1);
                btn.index = index;
                btn.onkeydown = function (e) {
                    var e = e || win.event,
                        current = !1;
                    if (e.keyCode === 39) {
                        current = tabs.children[btn.index + 1] || tabs.children[0]
                    } else if (e.keyCode === 37) {
                        current = tabs.children[btn.index - 1] || tabs.children[tabs.children.length - 1]
                    } else if (e.keyCode === 36) {
                        current = tabs.children[0]
                    } else if (e.keyCode === 35) {
                        current = tabs.children[tabs.children.length - 1]
                    }
                    if (/35|36|37|39/.test(e.keyCode) && current) {
                        if (current !== this) {
                            current.click();
                            current.focus()
                        }
                        e.preventDefault()
                    }
                }
            } else {
                btn.set("aria-selected", "false");
                btn.set("tabindex", -1);
                var cntrl = btn.get("aria-controls");
                [].forEach.call(doc.querySelectorAll("." + cntrl + ", #" + cntrl), function (item) {
                    item.setAttribute("hidden", "")
                })
            }
        });
        if (!init) {
            elm.set("aria-selected", "true");
            elm.set("tabindex", 0);
            if (focus) {
                elm.focus()
            }
        }
    };
    var heading = function (elm) {
        var heads = prev(elm, '[role="heading"] [aria-controls]');
        [].forEach.call(heads.children, function (head, index) {
            if (!head.index) {
                head.index = index;
                head.onkeydown = function (e) {
                    var e = e || win.event,
                        current = !1;
                    if (e.keyCode === 40) {
                        current = heads.children[head.index + 1] || heads.children[0]
                    } else if (e.keyCode === 38) {
                        current = heads.children[head.index - 1] || heads.children[heads.children.length - 1]
                    } else if (e.keyCode === 36) {
                        current = heads.children[0]
                    } else if (e.keyCode === 35) {
                        current = heads.children[heads.children.length - 1]
                    }
                    if (/35|36|38|40/.test(e.keyCode) && current) {
                        if (current !== this) {
                            current.focus()
                        }
                        e.preventDefault()
                    }
                }
            }
        })
    };
    var bind = function (elm) {
        elm.has = elm.hasAttribute;
        elm.get = elm.getAttribute;
        elm.set = elm.setAttribute;
        elm.del = elm.removeAttribute;
        elm.menu = menu;
        elm.dialog = dialog;
        elm.tab = tab;
        elm.heading = heading;
        return elm
    };
    var aria = function (container) {
        [].forEach.call(container.querySelectorAll('[aria-controls]'), function (elm) {
            var ECL = (elm.className.indexOf("ecl-") > -1 && window.ECL);
            if (!ECL && !elm.get) {
                bind(elm);
                var role = elm.get("role") || bind(elm.parentNode).get("role");
                if (role && elm[role]) {
                    elm[role](elm, !0)
                }
                var controls = function (e) {
                    e.preventDefault();
                    if (elm.isAnimate) {
                        return
                    }
                    var cntrl = this.get("aria-controls");
                    var isSelected = this.get("aria-selected");
                    var role = this.get("role");
                    if (cntrl === '') {
                        console.log("WTINFO: Empty controlers ", this);
                        return
                    }
                    $wt.trigger(elm, cntrl);
                    $wt.trigger(window, "aria-controls", this);
                    if (isSelected && role === "checkbox") {
                        this.set("aria-selected", (isSelected === "false"))
                    } else if (isSelected && isSelected === "true") {
                        return
                    }
                    reset(e);
                    var brothers = doc.querySelectorAll('[aria-controls="' + cntrl + '"]');
                    elm.FROM = brothers;
                    [].forEach.call(brothers, function (brother) {
                        if (!brother.get) {
                            return
                        }
                        var expanded = brother.get("aria-expanded");
                        var role = brother.get("role");
                        if (expanded) {
                            brother.set("aria-expanded", (expanded === "false"))
                        }
                        if (role && brother[role]) {
                            brother[role](elm)
                        }
                    });
                    var children = doc.querySelectorAll("." + cntrl + ", #" + cntrl);
                    elm.TO = children;
                    [].forEach.call(children, function (child) {
                        bind(child);
                        var hide = child.has("hidden");
                        var role = child.get("role");
                        if (child.tagName === "LINK" && cntrl === child.id) {
                            (child.has("disabled")) ? child.del("disabled"): child.set("disabled", "")
                        } else {
                            var animated = (function () {
                                if ((child.className || "").indexOf("animated [") !== -1) {
                                    elm.animated = child.className.replace(/(.*)animated\ \[(.*)\](.*)/ig, "$2").split(",");
                                    [].forEach.call(elm.animated, function (e) {
                                        child.className = child.className.replace(" " + e, "")
                                    });
                                    return elm.animated
                                }
                                return !1
                            })();
                            if (animated) {
                                if (!child.animationsEvents) {
                                    child.addEventListener("animationstart", function () {
                                        elm.isAnimate = !0
                                    });
                                    child.addEventListener("animationend", function () {
                                        if (child.className.indexOf(" " + animated[1]) !== -1) {
                                            setTimeout(function () {
                                                child.set("hidden", "");
                                                elm.del("hidden");
                                                if (child.get("role") === "dialog") {
                                                    dialog(!1, !0)
                                                }
                                            }, 10)
                                        }
                                        elm.isAnimate = !1
                                    });
                                    child.animationsEvents = !0
                                }
                                elm.direction = (hide) ? 0 : 1;
                                child.className += " " + animated[elm.direction];
                                if (elm.direction === 0) {
                                    child.del("hidden")
                                }
                            } else if (hide) {
                                child.del("hidden")
                            } else if (!animated) {
                                child.set("hidden", "")
                            }
                            if (role && child[role]) {
                                elm.from = brothers;
                                elm.to = children;
                                child[role](elm)
                            }
                            if (child.has("aria-controls")) {
                                child.focus()
                            }
                        }
                    });
                    if (typeof window[cntrl] === "function") {
                        window[cntrl](elm)
                    }
                };
                $wt.on(elm, "click", controls)
            }
        })
    };
    aria.run = function (obj) {
        var wrapper = (obj.params.include) ? document.querySelector(obj.params.include) : document;
        wrapper.params = obj.params;
        if (wrapper.params.custom) {
            $wt.load(wrapper.params.custom, function () {
                aria.init(wrapper)
            })
        } else {
            aria.init(wrapper)
        }
    };
    aria.on = function (controler, callback) {
        window[controler] = callback
    };
    $wt.on(win, "wtReady", function () {
        $wt.on(doc.body, "click", reset);
        $wt.on(doc.body, "keydown", function (e) {
            if (e.keyCode === 27) {
                dialog(!1, !0)
            }
        })
    });
    aria.init = function (container) {
        aria(container);
        $wt.domchange(function () {
            aria(container)
        })
    };
    aria.trap = trap;
    $wt.aria = aria
})(window, document, !1);
$wt.forms = function (target, options) {
    return new $wt.forms._run(target, options)
};
$wt.forms.extend = function (obj) {
    for (var i in obj) {
        this[i] = obj[i]
    }
};
$wt.forms.extend({
    _counter: 0,
    _run: function (target, options) {
        if (typeof target === 'string') {
            target = document.querySelector(target)
        }
        if (!(target instanceof Element)) {
            console.log("WTINFO: form - 'target' parameter should be a dom object!");
            return
        }
        options = target.params = $wt.mergeParams({
            callback: !1,
            class: "wt-form",
            groups: !1
        }, options || {});
        if (!Array.isArray(options.groups)) {
            console.log("WTINFO: form - 'groups' parameter should be an array!");
            return
        }
        var needCSS = options.class.indexOf('wt-form') > -1;
        this.ready = function (fnc) {
            options.callback = fnc
        };
        var process = function () {
            $wt.forms._builder(target, options);
            target.className = options.class;
            if (needCSS) {
                $wt.forms._resize(target);
                $wt.trigger(window, "resize")
            }
            $wt.trigger(window, "form.created");
            setTimeout(function () {
                if (typeof options.callback === 'function') {
                    options.callback()
                }
            }, 0)
        };
        (needCSS) ? $wt.include($wt.root + "/webtools.forms.css", process): process();
        return this
    },
    _resize: function (container) {
        window.addEventListener("resize", function () {
            var action = (container.offsetWidth < 620) ? 'add' : 'remove';
            container.classList[action]('wt-form-responsive')
        }, {
            passive: !0
        })
    },
    _range: function (elm, params) {
        var sliderRanger = document.createElement("div");
        sliderRanger.className = "wt-field-range wt-unselected";
        (elm.parentNode) ? elm.parentNode.insertBefore(sliderRanger, elm): "";
        sliderRanger.appendChild(elm);
        if (Array.isArray(params.data)) {
            elm.setAttribute("min", 0);
            elm.setAttribute("max", params.data.length - 1);
            elm.data = params.data
        }
        var tracker = document.createElement("div");
        tracker.className = "wt-field-range-track wt-unselected";
        sliderRanger.appendChild(tracker);
        elm.tracker = tracker;
        var thumb = document.createElement("div");
        thumb.className = "wt-field-range-thumb wt-unselected";
        thumb.style.left = 0;
        thumb.setAttribute("aria-hidden", !0);
        tracker.appendChild(thumb);
        var max = Math.floor(elm.getAttribute("max"));
        var check = function () {
            var originalValue = elm.value,
                left, right;
            elm.value = 0;
            update();
            left = Math.max(35, ((thumb.offsetWidth + 2) / 2));
            elm.value = max;
            update();
            right = Math.max(35, ((thumb.offsetWidth + 2) / 2));
            tracker.setAttribute("style", "margin-left:" + left + "px; margin-right:" + right + "px;");
            elm.value = originalValue;
            update()
        };
        var update = function () {
            var left = ((tracker.offsetWidth - thumb.offsetWidth) / max) * elm.value;
            var realWidth = (tracker.offsetWidth - thumb.offsetWidth);
            var realLeft = (left / (realWidth / 100));
            realLeft = (realLeft <= 0 || elm.value === elm.min) ? 0 : realLeft;
            realLeft = (realLeft > 100) ? 100 : realLeft;
            thumb.style.left = realLeft + '%';
            var text = (elm.data) ? elm.data[elm.value] : elm.value;
            if (text) {
                thumb.innerHTML = '<span>' + text + '</span>';
                thumb.style.marginLeft = (0 - thumb.offsetWidth / 2) + 'px'
            }
            if (!elm.check) {
                elm.check = !0;
                check()
            }
        };
        elm.addEventListener("change", update);
        elm.addEventListener("input", update);
        elm.addEventListener("keyup", update);
        setTimeout(update, 10)
    },
    _builder: function (container, config) {
        $wt.forms._counter++;
        var markerIcon = "background-image:url(\"data:image/svg+xml,%3Csvg fill='{color}' xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z'/%3E%3C/svg%3E\");";
        [].forEach.call(config.groups, function (node, index) {
            var size = (node.fields || []).length;
            var groupID = "wt-form-group-" + $wt.forms._counter + "_" + index;
            var main = document.createElement('div');
            var title = document.createElement('div');
            var description = document.createElement('div');
            var content = document.createElement('div');
            var grp = node.group || {};
            var asGroup = (grp.title || grp.description || grp.class);
            var fullGroup = (grp.title && grp.description);
            var targetFieldContent = (asGroup) ? main : content;
            if (asGroup) {
                main.setAttribute("role", "group");
                if (asGroup) {
                    main.setAttribute("aria-labelledby", groupID)
                }
                main.className = 'wt-form-group';
                if (grp.class) {
                    main.className += ' ' + grp.class
                }
                if (grp.title) {
                    title.innerHTML = grp.title;
                    title.id = groupID;
                    title.className = 'wt-form-title';
                    main.appendChild(title)
                }
                if (grp.description) {
                    description.innerHTML = grp.description;
                    description.className = 'wt-form-description';
                    if (!grp.title) {
                        description.id = groupID
                    }
                    main.appendChild(description)
                }
                if (!fullGroup) {
                    main.classList.add('wt-form-adapt')
                }
                main.appendChild(content)
            } else {
                container.appendChild(content)
            }
            content.className = 'wt-form-fields';
            if (Array.isArray(node.fields)) {
                [].forEach.call(node.fields, function (item) {
                    var options = item.options || {};
                    var id = $wt.id();
                    var label = !1;
                    if (['input', 'textarea', 'select', 'div', 'p', 'ul', 'button', 'pre'].indexOf(item.tag) > -1) {
                        var attributes = item.attributes || {};
                        var tag = document.createElement(item.tag);
                        attributes.id = attributes.id || '_' + id;
                        for (var attr in attributes) {
                            if (attr === 'value') {
                                tag.value = attributes[attr]
                            } else if (attr === 'checked') {
                                if (attributes[attr] === !0) {
                                    tag.setAttribute('checked', 'checked')
                                }
                            } else {
                                tag.setAttribute(attr, (attributes[attr]).toString())
                            }
                        }
                        if (options.label) {
                            label = document.createElement("label");
                            label.className = "wt-label";
                            label.setAttribute("for", attributes.id);
                            label.innerHTML = '<span>' + options.label + '</span>';
                            content.appendChild(label)
                        }
                        if (options.legend && label) {
                            var legend = document.createElement('i');
                            legend.className = "wt-label-legend";
                            if (typeof options.legend === 'string') {
                                legend.setAttribute("style", $wt.template('background-color: {color}', {
                                    color: options.legend
                                }))
                            } else if (typeof options.legend === 'object') {
                                legend.setAttribute("style", $wt.template(markerIcon, {
                                    color: options.legend.color.replace("#", "%23")
                                }));
                                legend.className += "-icon-" + options.legend.icon
                            }
                            legend.setAttribute("aria-hidden", !0);
                            $wt.insertBefore(label, legend)
                        }
                        var div = document.createElement("div");
                        if (size > 1) {
                            content.appendChild(div);
                            if (label) {
                                div.appendChild(label)
                            }
                            div.appendChild(tag);
                            div.classList.add('wt-form-field');
                            if (options.class) {
                                div.className += ' ' + options.class
                            }
                        } else {
                            content.appendChild(tag);
                            if (options.class) {
                                content.className += ' ' + options.class
                            }
                        }
                        if (tag.type === 'radio' || tag.type === 'checkbox') {
                            $wt.after(label, tag);
                            tag.classList.add("wt-offscreen")
                        } else if (item.tag === 'select') {
                            tag.innerHTML = (function () {
                                var options = '';
                                [].forEach.call(item.data, function (itm) {
                                    options += $wt.template('<option value="{value}" {selected}>{text}</option>', {
                                        text: itm.text,
                                        value: itm.value,
                                        selected: itm.selected ? 'selected="selected"' : ''
                                    })
                                });
                                return options
                            })();
                            tag.data = item.data
                        } else if (tag.type === 'range' && config.class.indexOf("wt-form") > -1) {
                            $wt.forms._range(tag, {
                                data: item.data
                            })
                        } else if (['div', 'p', 'ul', 'button', 'pre'].indexOf(item.tag) > -1 && item.data) {
                            tag.innerHTML = item.data;
                            $wt.before(tag, div);
                            $wt.remove(div)
                        }
                        $wt.aria.init(targetFieldContent);
                        for (var evt in item.events) {
                            tag.addEventListener(evt, item.events[evt])
                        }
                        if (item.events && item.events.init) {
                            $wt.trigger(tag, "init")
                        }
                    }
                });
                container.appendChild(targetFieldContent)
            }
        })
    }
});
$wt.on(window, "wtReady", function () {
    if ($wt.urlParams.wtpanel === "open" && !$wt.panelDebug) {
        $wt.defer(function () {
            $wt.panelDebug = document.createElement("div");
            $wt.after($wt.panelDebug, document.body);
            $wt.render($wt.panelDebug, {
                "service": "panel"
            })
        }, 500)
    }
});
$wt.ready(function () {
    if ($wt.duplicate) {
        return
    }
    $wt.urlParams = $wt.getUrlParams();
    $wt.root = (function () {
        var R = document.querySelectorAll('script[src*="/load.js"]');
        var O = ((R[0]) ? R[0].src : "").split("/");
        return (O.slice(0, O.length - 1)).join("/")
    })();
    $wt.lang();
    setTimeout($wt.collect, 10);
    var checkScroll = function () {
        if (window.$wt) {
            clearTimeout($wt.timer);
            $wt.timer = setTimeout($wt.collect, 100)
        }
    };
    $wt.on(window, "scroll", checkScroll);
    [].forEach.call(document.querySelectorAll('div'), function (elm) {
        $wt.on(elm, "scroll", checkScroll)
    });
    $wt.defer(function () {
        $wt.trigger(window, "wtReady")
    }, 25)
})